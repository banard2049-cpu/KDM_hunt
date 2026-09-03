from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json, sys, urllib.parse

ROOT = Path(sys.executable if getattr(sys, "frozen", False) else __file__).resolve().parent
DIST = ROOT if (ROOT / "data").exists() else ROOT / "dist"

class Handler(SimpleHTTPRequestHandler):
    # Always serve the current UI code while iterating; otherwise the browser
    # can keep an older cached copy of index.html after an update.
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()
    def translate_path(self, path):
        clean = urllib.parse.urlparse(path).path.lstrip("/")
        if not clean:
            return str(DIST / "index.html") if (DIST / "index.html").exists() else str(ROOT / "index.html")
        # The UI source lives beside the server; compiled assets/data live in dist.
        if clean == "index.html":
            return str(DIST / "index.html") if (DIST / "index.html").exists() else str(ROOT / "index.html")
        return str((DIST / clean).resolve())
    def do_GET(self):
        if self.path.startswith("/api/data"):
            payload = {}
            for name in ("monsters", "manifest", "huntdecks"):
                p = DIST / "data" / f"{name}.json"
                payload[name] = json.loads(p.read_text(encoding="utf-8")) if p.exists() else []
            raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(200); self.send_header("Content-Type", "application/json; charset=utf-8"); self.send_header("Content-Length", str(len(raw))); self.end_headers(); self.wfile.write(raw); return
        return super().do_GET()
    def do_POST(self):
        if self.path != "/api/save": self.send_error(404); return
        n = int(self.headers.get("Content-Length", "0")); body = self.rfile.read(n)
        obj = json.loads(body); sid = obj.get("id", "current"); safe = "".join(c for c in sid if c.isalnum() or c in "-_ ").strip() or "current"
        (DIST / "saves").mkdir(exist_ok=True); (DIST / "saves" / f"{safe}.json").write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
        self.send_response(200); self.end_headers(); self.wfile.write(b"ok")
if __name__ == "__main__":
    import webbrowser
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument("port", nargs="?", type=int, default=8799); ap.add_argument("--host", default="0.0.0.0"); ap.add_argument("--port", dest="port_opt", type=int)
    args = ap.parse_args(); port = args.port_opt or args.port
    print(f"KDM Hunt running at http://127.0.0.1:{port}")
    webbrowser.open(f"http://127.0.0.1:{port}/")
    ThreadingHTTPServer((args.host, port), Handler).serve_forever()
