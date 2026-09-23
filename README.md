# PULLS 자체 쇼핑몰 화면 데모

트레이딩카드 온라인 오리파 쇼핑몰의 화면 흐름을 재현한 정적 데모입니다. 서버 없이 동작하며 포인트·보관함·게시글 등 모든 상태는 브라우저 localStorage 에만 저장됩니다 (푸터의 "데모 초기화"로 리셋).

| 화면 | 파일 |
|---|---|
| 홈 | `index.html` |
| 박스·팩 판매 / 상세 / 장바구니·주문서 | `shop.html`, `product.html`, `cart.html` |
| 온라인 오리파 목록 / 상세(등급별 카드·확률·뽑기) / 결과 | `oripa.html`, `oripa-detail.html`, `results.html` |
| 개봉 연출 (등급별 영상 → 탭해서 열기) | `open.html` (PC 는 `frame.html` 폰 프레임) |
| 포인트 충전 (결제수단 UI) | `charge.html` |
| 마이페이지 (보관함·감정 환급·배송·포인트·주문·위탁·내 글) | `my.html` |
| 위탁판매 신청 | `consign.html` |
| 카드 자랑 게시판 | `board.html` |
| 직거래 장터 | `market.html` |
| 공지·이벤트·FAQ·약관 | `notice.html` |

- `js/data.js` 표본 데이터 (카드·오리파·상품·게시글), `js/app.js` 상태·공통 셸, `js/pages.js` 페이지 로직
- `build_pages.py` 페이지 HTML 생성 + css/js 캐시 버전 스탬프(`stamp.py`) 까지 한 번에 (`python3 build_pages.py`, push 전 실행)
- 포인트 규칙은 `js/app.js`: 카드별 확정 포인트(`pt`, data.js) 즉시 전환, 감정은 확정의 ½~2배, 충전 금액별 확정권(`TICKET_TIERS`)

## 개발 서버
`python3 dev.py` → http://localhost:8000/ (파일 저장 시 자동 새로고침, css/js/build_pages.py 수정 시 페이지 자동 재생성, 같은 와이파이의 폰에서는 출력된 IP 로 접속)
