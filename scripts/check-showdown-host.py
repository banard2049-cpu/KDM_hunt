import sys, json, re, threading, urllib.request, urllib.error
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from server import Handler, ThreadingHTTPServer, DIST
from showdown_host import ShowdownHost

httpd=ThreadingHTTPServer(('127.0.0.1',0),Handler)
httpd.showdown=ShowdownHost(DIST,httpd.server_port)
threading.Thread(target=httpd.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{httpd.server_port}'
def request(path,body=None,headers=None):
    req=urllib.request.Request(base+path,data=json.dumps(body).encode() if body is not None else None,headers=headers or {})
    try:
        with urllib.request.urlopen(req) as r:return r.status,r.read()
    except urllib.error.HTTPError as e:return e.code,e.read()
try:
    status,raw=request('/api/showdown/start',{})
    assert status==200
    started=json.loads(raw)
    # Fixed short link: `http://<lan-ip>:<port>/d/`, nothing to type after it.
    assert started['active'] is True
    for url in started['urls']:
        assert re.fullmatch(r'http://[\d.]+:\d+/d/',url), url
        assert len(url)<=40, url
    prefix='/d/'
    assert request('/d')[0]==200
    assert request('/d/')[0]==200
    assert request(prefix+'assets/showdown-view.js')[0]==200
    assert request(prefix+'state')[1]==b'null'
    assert request('/display/whatever/')[0]==200          # links handed out before the shortening still work
    assert request('/display/whatever/state')[1]==b'null'
    snapshot={'schemaVersion':1,'dataVersion':'test','battleId':'one','revision':1}
    assert request('/api/showdown/publish',{'snapshot':snapshot})[0]==200
    assert json.loads(request(prefix+'state')[1])==snapshot
    assert json.loads(request('/display/whatever/state')[1])==snapshot
    for path in ['assets/../../server.py','assets/%2e%2e/%2e%2e/server.py','data/loot.json','api/showdown/stop']:
        assert request(prefix+path)[0]==404
    assert request('/other/')[0] in (403,404)
    assert request('/api/showdown/stop',{}, {'Origin':'https://untrusted.example'})[0]==403
    assert request('/api/showdown/publish',{'snapshot':{}})[0]==400
    assert request('/api/showdown/stop',{})[0]==200
    assert request('/d/')[0]==404
    assert request('/d')[0]==404
    assert request(prefix+'state')[0]==404
    assert request('/display/whatever/')[0]==404
    assert request(prefix+'assets/showdown.css')[0]==404
    assert json.loads(request('/api/showdown/status',{})[1])['active'] is False
    assert request('/api/showdown/start',{})[0]==200
    assert request('/d/')[0]==200
    print('Showdown host: fixed /d/ link, legacy path, state sync, stopping, asset isolation and origin checks passed.')
finally:
    httpd.shutdown();httpd.server_close()
