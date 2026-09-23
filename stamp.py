#!/usr/bin/env python3
"""HTML 이 참조하는 css/js 에 내용 md5 기반 ?v= 를 붙인다 (캐시 무효화). build_pages.py 가 호출."""
import hashlib, os, re
ROOT = os.path.dirname(os.path.abspath(__file__))
REF = re.compile(r'((?:href|src)=")((?:css|js)/[^"?]+)(?:\?v=[^"]*)?(")')

def stamp(path):
    src = open(path, encoding="utf-8").read()
    def sub(m):
        f = os.path.join(ROOT, m.group(2))
        if not os.path.exists(f): return m.group(0)
        return f'{m.group(1)}{m.group(2)}?v={hashlib.md5(open(f, "rb").read()).hexdigest()[:8]}{m.group(3)}'
    out = REF.sub(sub, src)
    if out != src: open(path, "w", encoding="utf-8").write(out)
    return out != src

if __name__ == '__main__':
    for page in sorted(f for f in os.listdir(ROOT) if f.endswith(".html")):
        if stamp(os.path.join(ROOT, page)): print("stamped", page)
