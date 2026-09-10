"""Read-only LAN display on a fixed short path; controller writes are loopback-only."""
import json
import socket
import threading
from pathlib import Path
from urllib.parse import urlsplit, unquote

# Fixed short link: `http://<lan-ip>:<port>/d/`. Nothing but the board itself is
# served there, the viewer never gets a controller API, and the controller side
# stays loopback-only (server.py rejects non-loopback writes).
DISPLAY_PATH = '/d/'
DISPLAY_ROOTS = ('d', 'display')

class ShowdownHost:
    def __init__(self, root, port):
        self.root, self.port = Path(root).resolve(), port
        self.active, self.snapshot = False, None
        self.lock = threading.Lock()

    def control(self, action, payload):
        with self.lock:
            if action in ('start', 'status'):
                if action == 'start':
                    self.active, self.snapshot = True, None
                elif not self.active:
                    return {'active': False, 'urls': []}
                ips = set()
                for item in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
                    ip = item[4][0]
                    if not ip.startswith('127.'):
                        ips.add(ip)
                return {'active': True, 'urls': [f'http://{ip}:{self.port}{DISPLAY_PATH}' for ip in sorted(ips)]}
            if action == 'stop':
                self.active, self.snapshot = False, None
                return {'ok': True}
            if action == 'publish':
                if not self.active:
                    raise ValueError('Sharing is not active')
                s = payload.get('snapshot')
                if not isinstance(s, dict) or s.get('schemaVersion') != 1 or not isinstance(s.get('revision'), int) or not isinstance(s.get('battleId'), str):
                    raise ValueError('Invalid snapshot')
                # Images must be local assets: disallow URLs/HTML injected as paths.
                def check(value):
                    if isinstance(value, dict):
                        for k, v in value.items():
                            if k == 'file' and isinstance(v, str) and v.startswith('assets/') and ('..' in v or '\\' in v):
                                raise ValueError('Invalid asset path')
                            check(v)
                    elif isinstance(value, list):
                        for v in value: check(v)
                check(s)
                self.snapshot = s
                return {'ok': True}
            raise ValueError('Unknown action')

    def get(self, request_path):
        parts = unquote(urlsplit(request_path).path).split('/')
        # `/d/` is the link handed out now. `/display/<anything>/` stays valid so
        # a window opened before the shortening keeps refreshing; the old token
        # segment is simply ignored.
        if len(parts) < 2 or parts[1] not in DISPLAY_ROOTS:
            return None
        segments = parts[2:]
        if parts[1] == 'display' and segments:
            segments = segments[1:]
        with self.lock:
            if not self.active:
                return None
            rest = '/'.join(segments)
            if rest == 'state':
                return ('application/json', json.dumps(self.snapshot, ensure_ascii=False).encode('utf-8'))
            if not rest:
                rest = 'assets/showdown-viewer.html'
            if not rest.startswith('assets/') or '\\' in rest or '..' in rest.split('/'):
                return None
            file = (self.root / rest).resolve()
            if not file.is_relative_to(self.root / 'assets') or not file.is_file():
                return None
            import mimetypes
            return (mimetypes.guess_type(file.name)[0] or 'application/octet-stream', file.read_bytes())
