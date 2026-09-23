/* =========================================================
   PULLS 데모 — 공통 : 상태 저장(localStorage), 헤더/푸터, 모달, 토스트, 카드 아트
   ========================================================= */
window.App = (function () {
	'use strict';
	var D = window.PULLS_DATA, G = D.GRADES;
	var KEY = 'pulls-site-v1', POINT_RATE = 0.03, CONSIGN_FEE = 0.1;

	/* ---------- 유틸 ---------- */
	function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
	function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
	function $(s, root) { return (root || document).querySelector(s); }
	function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }
	function uid(p) { return (p || 'x') + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3); }
	function now() { return new Date().toISOString(); }
	function ago(iso) {
		var d = (Date.now() - new Date(iso).getTime()) / 1000;
		if (d < 60) return '방금'; if (d < 3600) return Math.floor(d / 60) + '분 전'; if (d < 86400) return Math.floor(d / 3600) + '시간 전';
		if (d < 86400 * 7) return Math.floor(d / 86400) + '일 전';
		return iso.slice(0, 10).replace(/-/g, '.');
	}
	function param(k) { return new URLSearchParams(location.search).get(k); }
	function digits(v) { return Number(String(v).replace(/\D/g, '')); }
	function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
	function earn(price) { return Math.floor(price * POINT_RATE); }
	function settle(price) { return Math.floor(price * (1 - CONSIGN_FEE)); }

	/* ---------- 상태 ---------- */
	function fresh() {
		return {
			user: { name: '게스트', joined: now() },
			points: 30000,
			ledger: [{ type: 'charge', amount: 30000, memo: '체험용 기본 포인트', at: now() }],
			collection: [],     /* { id, card, oripa, at, status: held|appraised|converted|shipping|pickup|consigned, refund, ticket } */
			draws: [],          /* { id, oripa, items:[collectionId], at, ticket } */
			orders: [],         /* { id, items:[{product, qty}], total, pay, at } */
			cart: [],           /* { product, qty } */
			consigns: [{ id: 'cs-demo', card: 'c502', price: 26000, memo: '', status: 'selling', at: '2026-09-16T10:00:00' }],
			tickets: [],        /* 등급 확정권 { id, grade, at, memo } */
			posts: [], market: [], comments: {}, likes: {},
			stock: {}           /* oripaId → { grade: remaining } (뽑기가 일어난 오리파만) */
		};
	}
	var state = null, saving = true;
	function load() {
		if (state) return state;
		try { state = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { state = null; }
		if (!state || !state.user) state = fresh();
		if (!state.tickets) state.tickets = [];
		return state;
	}
	function save() { if (!saving) return; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
	/* 여러 건을 바꿀 때 저장은 마지막에 한 번 */
	function batch(fn) { saving = false; try { fn(); } finally { saving = true; save(); } }
	function reset() { state = fresh(); save(); }
	function item(id) { return byId(load().collection, id); }

	/* 오리파 재고 (남은 수량) : 처음 볼 때는 원본 수량, 뽑기가 일어나면 그때부터 저장 */
	function stockOf(oripa) {
		var s = load();
		if (!s.stock[oripa.id]) {
			var m = {}; Object.keys(oripa.prizes).forEach(function (g) { m[g] = oripa.prizes[g].count; });
			s.stock[oripa.id] = m;
		}
		return s.stock[oripa.id];
	}
	function remaining(oripa) { var st = stockOf(oripa), n = 0; Object.keys(st).forEach(function (g) { n += st[g]; }); return n; }

	/* 충전 금액별 확정권 등급 (0 = 없음) */
	var TICKET_TIERS = [[1000000, 6], [300000, 5], [100000, 4], [50000, 3], [30000, 2]];
	function ticketFor(amount) { for (var i = 0; i < TICKET_TIERS.length; i++) if (amount >= TICKET_TIERS[i][0]) return TICKET_TIERS[i][1]; return 0; }
	function grantTicket(grade, memo) { var s = load(), t = { id: uid('t'), grade: grade, at: now(), memo: memo || '' }; s.tickets.unshift(t); save(); return t; }
	/* 포인트 */
	function addPoints(amount, type, memo) { var s = load(); s.points += amount; s.ledger.unshift({ type: type, amount: amount, memo: memo, at: now() }); save(); }

	/* 뽑기 : 남은 구슬 중 균등 추첨 → 등급 → 그 등급의 카드 중 무작위.
	   ticketId 가 있으면 첫 장을 확정권 등급 이상(남은 수량이 있는 가장 가까운 등급)으로 보장 */
	function draw(oripa, n, ticketId) {
		var s = load(), st = stockOf(oripa), cost = oripa.price * n;
		if (remaining(oripa) < n) return { error: '남은 수량이 부족합니다' };
		if (s.points < cost) return { error: '포인트가 부족합니다' };
		var ticket = ticketId ? byId(s.tickets, ticketId) : null;
		var items = [];
		for (var i = 0; i < n; i++) {
			var grades = Object.keys(st), g = null;
			if (i === 0 && ticket) {
				var cands = grades.map(Number).filter(function (x) { return x >= ticket.grade && st[x] > 0; }).sort(function (a, b) { return a - b; });
				if (cands.length) g = String(cands[0]); else ticket = null;
			}
			if (g === null) {
				var total = 0; grades.forEach(function (k) { total += st[k]; });
				var r = Math.floor(Math.random() * total); g = grades[0];
				for (var k = 0; k < grades.length; k++) { r -= st[grades[k]]; if (r < 0) { g = grades[k]; break; } }
			}
			st[g]--;
			var cards = oripa.prizes[g].cards, cardId = cards[Math.floor(Math.random() * cards.length)];
			var it = { id: uid('h'), card: cardId, oripa: oripa.id, at: now(), status: 'held' };
			if (i === 0 && ticket) it.ticket = ticket.grade;
			s.collection.unshift(it); items.push(it.id);
		}
		if (ticket) s.tickets = s.tickets.filter(function (t) { return t.id !== ticket.id; });
		var d = { id: uid('d'), oripa: oripa.id, items: items, at: now(), ticket: ticket ? ticket.grade : 0 };
		s.draws.unshift(d);
		s.points -= cost; s.ledger.unshift({ type: 'draw', amount: -cost, memo: oripa.title + ' ' + n + '회' + (ticket ? ' · Lv.' + ticket.grade + ' 확정권 사용' : ''), at: now() });
		save();
		return d;
	}

	/* 감정 범위 = 확정 포인트(card.pt)의 ½ ~ 2배 */
	function refundRange(cardId) { var f = D.CARDS[cardId].pt; return [Math.round(f * 0.5 / 10) * 10, f * 2]; }
	/* 확정 전환 : 카드 소각, 확정 포인트 즉시 지급 */
	function convert(itemId) {
		var s = load(), it = item(itemId);
		if (!it || it.status !== 'held') return null;
		var v = D.CARDS[it.card].pt;
		it.status = 'converted'; it.refund = v; it.convertedAt = now();
		s.points += v; s.ledger.unshift({ type: 'convert', amount: v, memo: D.CARDS[it.card].name + ' 확정 전환', at: now() });
		save();
		return { value: v };
	}
	/* 감정(환급) : 대부분 0.6~1.2배, 상위(1.3~1.95배) 15%, 최대치(2배) 약 5% */
	function appraise(itemId) {
		var s = load(), it = item(itemId);
		if (!it || it.status !== 'held') return null;
		var f = D.CARDS[it.card].pt, range = refundRange(it.card), min = range[0], max = range[1], r = Math.random(), v, tier;
		if (r < 0.05) { v = max; tier = 'max'; }
		else if (r < 0.20) { v = f * (1.3 + Math.random() * 0.65); tier = 'high'; }
		else { v = f * (0.6 + Math.random() * 0.6); tier = 'normal'; }
		v = Math.max(min, Math.min(max, Math.round(v / 10) * 10));
		it.status = 'appraised'; it.refund = v; it.refundTier = tier; it.appraisedAt = now();
		s.points += v; s.ledger.unshift({ type: 'refund', amount: v, memo: D.CARDS[it.card].name + ' 감정 환급', at: now() });
		save();
		return { value: v, tier: tier, min: min, max: max };
	}

	/* ---------- 카드 아트 (SVG 자리표시, 카드마다 한 번만 생성) ---------- */
	var artCache = {};
	function cardArt(cardId) {
		if (artCache[cardId]) return artCache[cardId];
		var c = D.CARDS[cardId] || { grade: 1, name: '?', set: '' }, g = G[c.grade], seed = 0;
		for (var i = 0; i < cardId.length; i++) seed = (seed * 31 + cardId.charCodeAt(i)) % 997;
		var shape = seed % 3, hue = (seed * 37) % 360;
		var frame = g.rainbow ? 'url(#holo' + cardId + ')' : g.color;
		var emblem = shape === 0 ? '<circle cx="50" cy="60" r="18" fill="none" stroke="#fff" stroke-width="3"/><circle cx="50" cy="60" r="7" fill="#fff"/>'
			: shape === 1 ? '<polygon points="50,40 68,72 32,72" fill="none" stroke="#fff" stroke-width="3"/><circle cx="50" cy="60" r="5" fill="#fff"/>'
			: '<rect x="35" y="45" width="30" height="30" rx="6" transform="rotate(45 50 60)" fill="none" stroke="#fff" stroke-width="3"/><circle cx="50" cy="60" r="5" fill="#fff"/>';
		return (artCache[cardId] = '<svg class="cardart" viewBox="0 0 100 140" role="img" aria-label="' + esc(c.name) + '">' +
			'<defs><linearGradient id="holo' + cardId + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fb2ff"/><stop offset=".35" stop-color="#ff8bb8"/><stop offset=".7" stop-color="#ffd66e"/><stop offset="1" stop-color="#7bf0c8"/></linearGradient>' +
			'<radialGradient id="glow' + cardId + '" cx=".5" cy=".45" r=".5"><stop offset="0" stop-color="hsl(' + hue + ',70%,55%)" stop-opacity=".9"/><stop offset="1" stop-color="#111" stop-opacity="0"/></radialGradient></defs>' +
			'<rect x="2" y="2" width="96" height="136" rx="6" fill="' + frame + '"/>' +
			'<rect x="6" y="6" width="88" height="128" rx="4" fill="#111114"/>' +
			'<rect x="12" y="24" width="76" height="72" rx="4" fill="url(#glow' + cardId + ')" stroke="#2a2a30"/>' +
			emblem +
			'<text x="50" y="16" text-anchor="middle" font-size="6" fill="#9c9c98" font-family="Pretendard, sans-serif">' + esc(c.set) + '</text>' +
			'<text x="50" y="112" text-anchor="middle" font-size="' + (c.name.length > 9 ? 6.2 : 7.5) + '" font-weight="700" fill="#fff" font-family="Pretendard, sans-serif">' + esc(c.name) + '</text>' +
			'<text x="50" y="126" text-anchor="middle" font-size="6" font-weight="700" fill="' + (g.rainbow ? '#ff8bb8' : g.color) + '" font-family="Pretendard, sans-serif">' + g.label + ' ' + g.name + '</text>' +
			'</svg>');
	}
	/* 등급 칩 : withRank = "1등 · Lv.6", dark = 확정권 표시용 검은 칩 */
	function gradeChip(grade, withRank, dark) {
		var g = G[grade];
		return '<span class="gchip gchip--' + grade + (dark ? ' gchip--dark' : '') + '" style="--c:' + g.color + '"><i></i>' + (withRank ? g.rank + ' · ' : '') + g.label + (dark ? ' 확정권' : '') + '</span>';
	}

	/* ---------- 모달 / 토스트 ---------- */
	function toast(msg, kind) {
		var t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
		var n = document.createElement('div'); n.className = 'toast' + (kind ? ' toast--' + kind : ''); n.textContent = msg; t.appendChild(n);
		requestAnimationFrame(function () { n.classList.add('is-in'); });
		setTimeout(function () { n.classList.remove('is-in'); setTimeout(function () { n.remove(); }, 300); }, 2400);
	}
	function modal(html, opts) {
		closeModal();
		var wrap = document.createElement('div'); wrap.className = 'modal' + (opts && opts.cls ? ' ' + opts.cls : ''); wrap.id = 'modal';
		wrap.innerHTML = '<div class="modal__bg"></div><div class="modal__box" role="dialog" aria-modal="true"><button type="button" class="modal__x" aria-label="닫기">×</button><div class="modal__body">' + html + '</div></div>';
		document.body.appendChild(wrap); document.body.classList.add('has-modal');
		requestAnimationFrame(function () { wrap.classList.add('is-in'); });
		wrap.querySelector('.modal__bg').addEventListener('click', function () { if (!(opts && opts.lock)) closeModal(); });
		wrap.querySelector('.modal__x').addEventListener('click', closeModal);
		return wrap.querySelector('.modal__body');
	}
	function closeModal() { var m = $('#modal'); if (m) m.remove(); document.body.classList.remove('has-modal'); }
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
	/* 취소 / 확인 두 버튼이 붙는 확인창. onOk(body) 가 처리하고, body.ok / body.cancel 로 버튼에 접근 */
	function confirm(html, okLabel, onOk, opts) {
		var body = modal(html + '<div class="modal__actions"><button type="button" class="btn btn--ghost" data-cancel>취소</button><button type="button" class="btn ' + (opts && opts.okCls || 'btn--primary') + '" data-ok>' + okLabel + '</button></div>', opts);
		body.cancel = $('[data-cancel]', body); body.ok = $('[data-ok]', body);
		body.cancel.addEventListener('click', closeModal);
		body.ok.addEventListener('click', function () { onOk(body); });
		return body;
	}

	/* 결제수단 선택 UI (충전 · 주문서 공용) */
	var PAYS = [
		{ id: 'naver', name: '네이버페이', mark: 'N', bg: '#03c75a', fg: '#fff' },
		{ id: 'kakao', name: '카카오페이', mark: 'pay', bg: '#fee500', fg: '#191919' },
		{ id: 'toss', name: '토스페이', mark: 'T', bg: '#0064ff', fg: '#fff' },
		{ id: 'card', name: '신용·체크카드', mark: '▭', bg: '#111', fg: '#fff' },
		{ id: 'bank', name: '계좌입금', mark: '₩', bg: '#f2f2ef', fg: '#111' }
	];
	function payOptions(selected) {
		return '<div class="pays">' + PAYS.map(function (p) {
			return '<label class="opt pay' + (p.id === selected ? ' is-on' : '') + '"><input type="radio" name="pay" value="' + p.id + '"' + (p.id === selected ? ' checked' : '') + '><i style="background:' + p.bg + ';color:' + p.fg + '">' + p.mark + '</i><span>' + p.name + '</span></label>';
		}).join('') + '</div>';
	}
	function payName(id) { var p = byId(PAYS, id); return p ? p.name : id; }
	/* 라디오 라벨(.opt) 그룹 : 선택된 라벨에 is-on */
	function bindRadios(root) {
		$$('.opt input', root).forEach(function (r) { r.addEventListener('change', function () { $$('.opt', root).forEach(function (l) { l.classList.toggle('is-on', l.contains(r)); }); }); });
	}
	/* 세그먼트/칩 그룹 : 누른 버튼만 is-on, fn(dataset, button) 호출 */
	function seg(sel, fn, root) {
		var btns = $$(sel, root);
		btns.forEach(function (b) { b.addEventListener('click', function () { btns.forEach(function (x) { x.classList.toggle('is-on', x === b); }); fn(b.dataset, b); }); });
	}

	/* ---------- 공통 헤더 / 푸터 ---------- */
	var NAV = [
		{ href: 'shop.html', label: '박스·팩', key: 'shop', pages: ['product'] },
		{ href: 'oripa.html', label: '오리파', key: 'oripa', hot: true, pages: ['oripa-detail', 'results'] },
		{ href: 'consign.html', label: '위탁판매', key: 'consign' },
		{ href: 'board.html', label: '카드 자랑', key: 'board', pages: ['post'] },
		{ href: 'market.html', label: '직거래 장터', key: 'market', pages: ['item'] },
		{ href: 'notice.html', label: '공지', key: 'notice' }
	];
	var TABS = [['./', '홈', 'home', 'M3 11 12 3l9 8v10h-6v-6H9v6H3z'], ['oripa.html', '오리파', 'oripa', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6z'], ['shop.html', '샵', 'shop', 'M4 7h16l-1.5 13h-13L4 7zm4 0a4 4 0 0 1 8 0'], ['market.html', '장터', 'market', 'M3 9h18l-2 11H5L3 9zm6-3a3 3 0 0 1 6 0v3'], ['my.html', '마이', 'my', 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21c0-4 3.6-7 8-7s8 3 8 7']];
	function shell(page) {
		var active = page;
		NAV.forEach(function (n) { if (n.pages && n.pages.indexOf(page) >= 0) active = n.key; });
		if (page === 'charge' || page === 'cart') active = 'my';
		var s = load(), cartN = s.cart.reduce(function (a, c) { return a + c.qty; }, 0);
		var head = document.createElement('header'); head.className = 'st-head';
		head.innerHTML = '<div class="container st-head__in">' +
			'<button type="button" class="st-burger" id="stBurger" aria-label="메뉴"><i></i><i></i><i></i></button>' +
			'<a class="brand st-brand" href="./">PULLS</a>' +
			'<nav class="st-nav" id="stNav">' + NAV.map(function (n) { return '<a href="' + n.href + '"' + (n.key === active ? ' class="is-on"' : '') + '>' + n.label + (n.hot ? '<i class="live-dot"></i>' : '') + '</a>'; }).join('') + '</nav>' +
			'<div class="st-tools">' +
			'<a class="st-points" href="charge.html" title="포인트 충전"><span>P</span><b id="stPoints">' + fmt(s.points) + '</b></a>' +
			'<a class="st-icon" href="cart.html" aria-label="장바구니"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 8H6.3"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/></svg>' + (cartN ? '<b>' + cartN + '</b>' : '') + '</a>' +
			'<a class="st-icon st-user" href="my.html" aria-label="마이페이지"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>' + esc(s.user.name) + '</span></a>' +
			'</div></div>';
		document.body.insertBefore(head, document.body.firstChild);
		var tab = document.createElement('nav'); tab.className = 'st-tab';
		tab.innerHTML = TABS.map(function (t) {
			return '<a href="' + t[0] + '"' + (t[2] === active ? ' class="is-on"' : '') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="' + t[3] + '"/></svg>' + t[1] + '</a>';
		}).join('');
		document.body.appendChild(tab);
		var foot = document.createElement('footer'); foot.className = 'st-foot';
		foot.innerHTML = '<div class="container"><div class="st-foot__row"><span class="brand">PULLS</span><nav>' + NAV.map(function (n) { return '<a href="' + n.href + '">' + n.label + '</a>'; }).join('') + '<a href="notice.html#terms">이용약관</a><a href="notice.html#privacy">개인정보처리방침</a></nav></div>' +
			'<p class="st-foot__note">화면 데모 · 모든 데이터는 이 브라우저에만 저장됩니다 · <button type="button" class="linkbtn" id="stReset">초기화</button></p></div>';
		document.body.appendChild(foot);
		$('#stBurger').addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
		$('#stReset').addEventListener('click', resetDialog);
	}
	/* 데이터 초기화 (푸터 링크 · 마이페이지 버튼 공용) */
	function resetDialog() {
		var s = load();
		confirm('<h2>데모 데이터 초기화</h2><p class="sub">처음 상태(게스트 · 30,000pt)로 되돌립니다</p>' +
			'<ul class="ledger"><li><div>포인트</div><b>' + fmt(s.points) + ' pt</b></li><li><div>보관함 카드</div><b>' + s.collection.length + '장</b></li><li><div>주문 · 위탁</div><b>' + s.orders.length + ' · ' + s.consigns.length + '건</b></li><li><div>내 게시글 · 장터 글</div><b>' + s.posts.length + ' · ' + s.market.length + '개</b></li><li><div>오리파 남은 수량</div><b>전부 복구</b></li></ul>',
			'초기화', function () { reset(); location.href = './?reset=1'; }, { okCls: 'btn--accent' });
	}
	function refreshPoints() { var b = $('#stPoints'); if (b) b.textContent = fmt(load().points); }

	/* 개봉 화면 URL (PC 는 폰 프레임 안에서) */
	function openUrl(qs) { var url = 'open.html?' + qs; return innerWidth >= 900 ? 'frame.html#' + encodeURIComponent(url) : url; }

	return { D: D, G: G, fmt: fmt, esc: esc, $: $, $$: $$, uid: uid, now: now, ago: ago, param: param, digits: digits, byId: byId, earn: earn, settle: settle,
		load: load, save: save, batch: batch, item: item, stockOf: stockOf, remaining: remaining, addPoints: addPoints, draw: draw, ticketFor: ticketFor, grantTicket: grantTicket, appraise: appraise, convert: convert, refundRange: refundRange,
		cardArt: cardArt, gradeChip: gradeChip, toast: toast, modal: modal, closeModal: closeModal, confirm: confirm, payOptions: payOptions, bindRadios: bindRadios, payName: payName, seg: seg,
		shell: shell, refreshPoints: refreshPoints, openUrl: openUrl, resetDialog: resetDialog };
})();
