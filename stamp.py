#!/usr/bin/env python3
"""index/open/frame.html 이 참조하는 css/js 에 내용 md5 기반 ?v= 를 붙인다 (캐시 무효화). push 전에 실행."""
import hashlib, os, re
ROOT = os.path.dirname(os.path.abspath(__file__))
REF = re.compile(r'((?:href|src)=")((?:css|js)/[^"?]+)(?:\?v=[^"]*)?(")')
for page in ["index.html", "open.html", "frame.html"]:
    path = os.path.join(ROOT, page)
    src = open(path, encoding="utf-8").read()
    def sub(m):
        f = os.path.join(ROOT, m.group(2))
        if not os.path.exists(f): return m.group(0)
        h = hashlib.md5(open(f, "rb").read()).hexdigest()[:8]
        return f'{m.group(1)}{m.group(2)}?v={h}{m.group(3)}'
    out = REF.sub(sub, src)
    if out != src:
        open(path, "w", encoding="utf-8").write(out); print("stamped", page)
