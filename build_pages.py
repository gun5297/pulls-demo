#!/usr/bin/env python3
"""공통 머리글/스크립트를 붙여 사이트 페이지 HTML 을 생성한다 (css/js 참조에는 내용 md5 ?v= 를 붙임). 페이지 본문만 아래 PAGES 에서 관리."""
import os
from stamp import ROOT, stamp
HEAD = '''<!doctype html>
<html lang="ko">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<meta name="robots" content="noindex, nofollow">
	<title>{title}</title>
	<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Ccircle cx=%2716%27 cy=%2716%27 r=%2711%27 fill=%27none%27 stroke=%27%23111%27 stroke-width=%276%27/%3E%3C/svg%3E">
	<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&display=swap">
	<link rel="stylesheet" href="css/tokens.css">
	<link rel="stylesheet" href="css/site.css">
</head>
<body class="site" data-page="{page}">
<main class="container page">
{body}
</main>
<script src="js/data.js"></script>
<script src="js/app.js"></script>
<script src="js/pages.js"></script>
</body>
</html>
'''
PAGES = {
'index.html': ('home', 'PULLS · 트레이딩카드 온라인 오리파', '''
	<section class="hm-hero">
		<div class="hm-hero__t">
			<p class="eyebrow">Online Oripa · Box & Pack · Community</p>
			<h1><span class="hm-hero__l1">화면에서 직접 열어 보는</span><span class="hm-hero__l2">온라인 오리파</span></h1>
			<p class="hm-hero__d">공개된 카드 목록에서 확률로 뽑고, 배송·감정 환급·위탁까지 한 곳에서.</p>
		</div>
		<div class="hm-hero__cta"><a class="btn btn--primary" href="oripa.html">오리파 뽑으러 가기</a><a class="btn btn--ghost" href="charge.html">포인트 충전</a></div>
		<div class="hm-stats" id="hmStats"></div>
	</section>
	<nav class="hm-menu" aria-label="바로가기">
		<a href="shop.html"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-4 9 4v9l-9 4-9-4V8z"/><path d="M3 8l9 4 9-4M12 12v9"/></svg></i>박스·팩</a>
		<a href="my.html#collection"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="11" height="15" rx="2"/><path d="M9 21h9a2 2 0 0 0 2-2V8"/></svg></i>카드 보관함</a>
		<a href="oripa.html"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.5"/><path d="M3.5 12h6M14.5 12h6"/></svg></i>오리파</a>
		<a href="consign.html"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l4 4 3-3M20 12l-4-4-3 3"/><path d="M4 12V7a2 2 0 0 1 2-2h5M20 12v5a2 2 0 0 1-2 2h-5"/></svg></i>위탁판매</a>
		<a href="board.html"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.4 5.6L20 9.4l-4.3 3.9 1.3 5.9L12 16.3 7 19.2l1.3-5.9L4 9.4l5.6-.8z"/></svg></i>카드 자랑</a>
		<a href="market.html"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h14l-2 8H9L7 7zM7 7L6 3H3"/><circle cx="10" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/></svg></i>직거래 장터</a>
		<a href="notice.html"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h3l7 4V6l-7 4H4z"/><path d="M17 9a4 4 0 0 1 0 6"/></svg></i>공지사항</a>
		<a href="charge.html"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 14h4"/></svg></i>포인트 충전</a>
	</nav>
	<section class="sec"><div class="sec-head"><h2>지금 인기 오리파</h2><a href="oripa.html">전체 보기 →</a></div><div class="op-grid" id="hmOripa"></div></section>
	<section class="sec"><div class="sec-head"><h2>박스 · 팩 · 싱글</h2><a href="shop.html">전체 보기 →</a></div><div class="pd-grid" id="hmShop"></div></section>
	<section class="sec"><div class="sec-head"><h2>이번 주 핫한 자랑</h2><a href="board.html">게시판 →</a></div><div class="bd-hot" id="hmHot"></div></section>
	<section class="sec"><div class="sec-head"><h2>직거래 장터</h2><a href="market.html">장터 →</a></div><div class="mk-grid" id="hmMarket"></div></section>
	<section class="sec"><div class="sec-head"><h2>공지 · 이벤트</h2><a href="notice.html">전체 →</a></div><ul class="nt-list hm-notice" id="hmNotice"></ul></section>
'''),
'oripa.html': ('oripa', '온라인 오리파 · PULLS', '''
	<div class="page-head"><div><p class="eyebrow">Oripa</p><h1>오리파</h1></div></div>
	<div class="op-grid" id="opGrid"></div>
'''),
'oripa-detail.html': ('oripa-detail', '오리파 · PULLS', '''
	<div class="od">
		<div class="od-cover" id="odCover"></div>
		<aside class="od-buy" id="odBuy"></aside>
		<div class="od-main">
			<section class="od-sec"><h2>등급별 카드와 남은 수량</h2><div id="odPrizes"></div></section>
			<section class="od-sec"><h2>현재 확률</h2><div class="od-prob" id="odProb"></div></section>
		</div>
	</div>
	<div class="od-bar" id="odBar"></div>
'''),
'results.html': ('results', '뽑기 결과 · PULLS', '''
	<div class="rs" id="rs">
		<div class="rs-head" id="rsHead"></div>
		<div class="rs-top" id="rsTop"></div>
		<div class="rs-groups" id="rsGroups"></div>
		<div class="rs-foot" id="rsFoot"></div>
	</div>
'''),
'shop.html': ('shop', '박스·팩 · PULLS', '''
	<div class="page-head"><div><p class="eyebrow">Box & Pack</p><h1>박스 · 팩 · 싱글</h1></div></div>
	<div class="chips" id="pdFilter" style="margin-bottom:18px"><button type="button" class="chip is-on" data-f="all">전체</button><button type="button" class="chip" data-f="box">박스</button><button type="button" class="chip" data-f="pack">팩</button><button type="button" class="chip" data-f="single">싱글</button></div>
	<div class="pd-grid" id="pdGrid"></div>
'''),
'product.html': ('product', '상품 · PULLS', '''
	<div class="pv"><div class="pv-img" id="pvImg"></div><div class="pv-info" id="pvInfo"></div></div>
'''),
'cart.html': ('cart', '장바구니 · PULLS', '''
	<div class="page-head"><div><p class="eyebrow">Cart</p><h1>장바구니 · 주문서</h1></div></div>
	<div class="ct" id="ct"></div>
'''),
'charge.html': ('charge', '포인트 충전 · PULLS', '''
	<div class="page-head"><div><p class="eyebrow">Points</p><h1>포인트 충전</h1><p>1pt = 1원 · 충전 금액에 따라 등급 확정권을 드립니다</p></div></div>
	<div class="ch">
		<div class="card-box"><div class="row" style="justify-content:space-between"><span class="muted">현재 포인트</span><b id="chNow" style="font-size:20px"></b></div><div class="row ch-tickets" id="chTickets"></div></div>
		<h3 style="margin:24px 0 10px;font-size:15px">충전 금액</h3>
		<div class="ch-amounts" id="chAmounts"></div>
		<label class="field" style="margin-top:10px"><span>직접 입력</span><input type="text" id="chCustom" inputmode="numeric" placeholder="1,000원 이상"></label>
		<h3 style="margin:20px 0 10px;font-size:15px">결제수단</h3>
		<div id="chPays"></div>
		<div class="ch-sum" id="chSum"></div>
		<button type="button" class="btn btn--primary btn--wide btn--lg" id="chGo" style="margin-top:14px">충전하기</button>
	</div>
'''),
'my.html': ('my', '마이페이지 · PULLS', '''
	<div class="page-head"><div><p class="eyebrow">My Page</p><h1>마이페이지</h1></div><button type="button" class="btn btn--ghost btn--sm" id="myReset">초기화</button></div>
	<div class="my-top" id="myTop"></div>
	<div class="tabs" id="myTabs"><button type="button" data-t="collection">카드 보관함</button><button type="button" data-t="points">포인트 내역</button><button type="button" data-t="orders">주문</button><button type="button" data-t="consigns">위탁</button><button type="button" data-t="posts">내 글</button></div>
	<div id="myBody"></div>
'''),
'consign.html': ('consign', '위탁판매 · PULLS', '''
	<div class="page-head"><div><p class="eyebrow">Consignment</p><h1>위탁판매</h1><p>수수료 10% · 판매 확정 후 3영업일 내 정산</p></div></div>
	<div class="cs-steps"><div><b>1. 신청</b>카드와 희망가 입력</div><div><b>2. 검수</b>실물 확인 후 등록</div><div><b>3. 판매</b>샵 싱글 코너에 진열</div><div><b>4. 정산</b>포인트 또는 계좌</div></div>
	<div class="cs">
		<form class="card-box" id="csForm">
			<div class="cs-pick" id="csPick"></div>
			<label class="field" style="margin-top:14px"><span>카드 이름</span><input type="text" id="csName" placeholder="예: 리자몽 ex SR"></label>
			<label class="field"><span>희망 판매가 (원)</span><input type="text" id="csPrice" inputmode="numeric"></label>
			<label class="field"><span>메모</span><input type="text" id="csMemo" placeholder="상태, 슬리브 여부 등"></label>
			<button type="submit" class="btn btn--primary btn--wide">위탁 신청</button>
		</form>
		<div><h3 style="font-size:15px;margin-bottom:10px">내 위탁 내역</h3><div id="csList"></div></div>
	</div>
'''),
'board.html': ('board', '카드 자랑 · PULLS', '''
	<div class="page-head"><div><p class="eyebrow">Community</p><h1>카드 자랑</h1><p>매주 좋아요 상위 3개에 5,000pt</p></div><button type="button" class="btn btn--primary btn--sm" id="bdWrite">글쓰기</button></div>
	<div class="bd-hot" id="bdHot"></div>
	<div class="tabs" id="bdSort"><button type="button" class="is-on" data-s="hot">인기</button><button type="button" data-s="new">최신</button></div>
	<ul class="bd-list" id="bdList"></ul>
'''),
'market.html': ('market', '직거래 장터 · PULLS', '''
	<div class="page-head"><div><p class="eyebrow">Market</p><h1>직거래 장터</h1></div>
<button type="button" class="btn btn--primary btn--sm" id="mkWrite">글쓰기</button></div>
	<div class="chips" id="mkFilter" style="margin-bottom:18px"><button type="button" class="chip is-on" data-f="all">전체</button><button type="button" class="chip" data-f="sell">팝니다</button><button type="button" class="chip" data-f="buy">구합니다</button></div>
	<div class="mk-grid" id="mkGrid"></div>
'''),
'post.html': ('post', '카드 자랑 · PULLS', '''
	<article class="post" id="post"></article>
'''),
'item.html': ('item', '직거래 장터 · PULLS', '''
	<article class="post" id="item"></article>
'''),
'notice.html': ('notice', '공지사항 · PULLS', '''
	<div class="page-head"><div><p class="eyebrow">Notice</p><h1>공지사항</h1></div></div>
	<div class="nt">
		<div class="tabs" id="ntTabs"><button type="button" data-t="notice">공지</button><button type="button" data-t="event">이벤트</button><button type="button" data-t="faq">자주 묻는 질문</button><button type="button" data-t="terms">이용약관</button><button type="button" data-t="privacy">개인정보처리방침</button></div>
		<div id="ntBody"></div>
	</div>
'''),
}
def build():
    for name, (page, title, body) in PAGES.items():
        path = os.path.join(ROOT, name)
        open(path, 'w', encoding='utf-8').write(HEAD.format(page=page, title=title, body=body.strip('\n')))
        stamp(path)
    for name in ('open.html', 'frame.html'):
        stamp(os.path.join(ROOT, name))

if __name__ == '__main__':
    build()
