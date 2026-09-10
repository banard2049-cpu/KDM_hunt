from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json, sys, urllib.parse
import ipaddress
from showdown_host import ShowdownHost

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
        resolved = (DIST / urllib.parse.unquote(clean)).resolve()
        if not resolved.is_relative_to(DIST.resolve()):
            return str(DIST / '__forbidden__')
        return str(resolved)
    def do_GET(self):
        # `/d/` is the short second-screen link; `/display/` still serves links
        # handed out before the shortening.
        route = self.path.split('?', 1)[0]
        if route in ('/d', '/d/') or self.path.startswith('/d/') or self.path.startswith('/display/'):
            result = self.server.showdown.get(self.path)
            if not result: self.send_error(404); return
            content_type, raw = result
            self.send_response(200); self.send_header('Content-Type',content_type); self.send_header('Content-Length',str(len(raw))); self.send_header('Referrer-Policy','no-referrer'); self.end_headers(); self.wfile.write(raw); return
        if not ipaddress.ip_address(self.client_address[0]).is_loopback:
            self.send_error(403); return
        if self.path.startswith("/api/data"):
            payload = {}
            for name in ("monsters", "manifest", "huntdecks"):
                p = DIST / "data" / f"{name}.json"
                payload[name] = json.loads(p.read_text(encoding="utf-8")) if p.exists() else []
            raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(200); self.send_header("Content-Type", "application/json; charset=utf-8"); self.send_header("Content-Length", str(len(raw))); self.end_headers(); self.wfile.write(raw); return
        return super().do_GET()
    def do_POST(self):
        if not ipaddress.ip_address(self.client_address[0]).is_loopback:
            self.send_error(403); return
        origin = self.headers.get('Origin')
        if origin and origin != 'http://' + self.headers.get('Host', ''):
            self.send_error(403); return
        host = self.headers.get('Host','').split(':')[0]
        if host not in ('127.0.0.1','localhost','[::1]'):
            self.send_error(403); return
        if self.path.startswith('/api/showdown/'):
            try:
                n=int(self.headers.get('Content-Length','0'))
                if n < 0 or n > 2_000_000: self.send_error(413); return
                payload=json.loads(self.rfile.read(n) or b'{}')
                result=self.server.showdown.control(self.path.rsplit('/',1)[-1],payload)
                raw=json.dumps(result).encode()
                self.send_response(200); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(raw))); self.end_headers(); self.wfile.write(raw)
            except (ValueError,TypeError): self.send_error(400)
            return
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
    httpd = ThreadingHTTPServer((args.host, port), Handler)
    httpd.showdown = ShowdownHost(DIST, port)
    httpd.serve_forever()
