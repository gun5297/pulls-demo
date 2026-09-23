#!/usr/bin/env python3
"""개발 서버 : python3 dev.py [포트]
- 이 폴더를 그대로 서빙 (캐시 없음)
- build_pages.py 나 css/js 가 바뀌면 페이지 HTML 을 다시 생성 (?v= 스탬프 갱신)
- css/js/html 이 바뀌면 열려 있는 브라우저 탭을 자동 새로고침 (SSE)
"""
import http.server, os, socket, sys, threading, time
import build_pages
ROOT = build_pages.ROOT
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
WATCH_EXT = ('.html', '.css', '.js', '.py', '.png', '.jpg', '.mp4')
version = [0]
changed_cond = threading.Condition()
INJECT = b'<script>(function(){var s=new EventSource("/__dev");s.onmessage=function(e){if(e.data==="reload")location.reload()};})();</script>'

def snapshot():
    out = {}
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in ('.git', 'node_modules')]
        for f in files:
            if f.endswith(WATCH_EXT):
                p = os.path.join(d, f)
                try: out[p] = os.stat(p).st_mtime
                except OSError: pass
    return out

def watcher():
    prev = snapshot()
    while True:
        time.sleep(0.5)
        cur = snapshot()
        changed = [p for p in cur if cur.get(p) != prev.get(p)] + [p for p in prev if p not in cur]
        if changed:
            if any(p.endswith(('build_pages.py', 'stamp.py', '.css', '.js')) for p in changed):
                build_pages.build(); cur = snapshot()
            with changed_cond:
                version[0] += 1; changed_cond.notify_all()
            print(time.strftime('%H:%M:%S'), 'reload ←', ', '.join(os.path.relpath(p, ROOT) for p in changed[:4]), flush=True)
        prev = cur

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def do_GET(self):
        if self.path == '/__dev':
            self.send_response(200); self.send_header('Content-Type', 'text/event-stream'); self.send_header('Cache-Control', 'no-store'); self.end_headers()
            seen = version[0]
            try:
                while True:
                    with changed_cond: changed_cond.wait(timeout=15)
                    if version[0] != seen: self.wfile.write(b'data: reload\n\n'); self.wfile.flush(); return
                    self.wfile.write(b': ping\n\n'); self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError): return
        path = self.translate_path(self.path)
        if os.path.isdir(path): path = os.path.join(path, 'index.html')
        if path.endswith('.html') and os.path.exists(path):
            body = open(path, 'rb').read().replace(b'</body>', INJECT + b'</body>')
            self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        super().do_GET()

def lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); ip = s.getsockname()[0]; s.close(); return ip
    except OSError: return None

if __name__ == '__main__':
    threading.Thread(target=watcher, daemon=True).start()
    srv = http.server.ThreadingHTTPServer(('0.0.0.0', PORT), H)
    print(f'PULLS dev server\n  PC   → http://localhost:{PORT}/\n  폰   → http://{lan_ip() or "<이 맥의 IP>"}:{PORT}/  (같은 와이파이)\n  파일 저장 시 자동 새로고침 · 종료 Ctrl+C', flush=True)
    try: srv.serve_forever()
    except KeyboardInterrupt: pass
