/* =========================================================
   PULLS 데모 — 페이지별 화면 (body[data-page] 로 분기)
   앞부분은 여러 페이지가 함께 쓰는 조각, 뒤부분은 pages.<이름> 렌더러
   ========================================================= */
(function () {
	'use strict';
	var A = window.App, D = A.D, G = A.G, C = D.CARDS, $ = A.$, $$ = A.$$, fmt = A.fmt, esc = A.esc;
	var page = document.body.dataset.page;
	A.shell(page);

	/* ---------- 데이터 조각 ---------- */
	var TYPE_LABEL = { box: 'BOX', pack: 'PACK', single: 'SINGLE' };
	var STATUS = { held: ['보관중', ''], appraised: ['감정', 'status--dark'], converted: ['전환', 'status--dark'], shipping: ['배송중', 'status--ok'], pickup: ['매장수령', 'status--ok'], consigned: ['위탁중', 'status--warn'] };
	var CS_STATUS = { review: ['검수 중', ''], selling: ['판매 중', 'status--ok'], sold: ['판매 완료', 'status--dark'], settled: ['정산 완료', 'status--dark'] };
	var LEDGER = { charge: '충전', bonus: '보너스', draw: '오리파', refund: '감정 환급', convert: '확정 전환', earn: '구매 적립', settle: '위탁 정산' };
	var TIER = { max: '최대치', high: '상위', normal: '일반' };
	function descKeys(obj) { return Object.keys(obj).map(Number).sort(function (a, b) { return b - a; }); }
	function gradesDesc(o) { return descKeys(o.prizes); }
	function topCards(o, n) { var out = []; gradesDesc(o).forEach(function (g) { o.prizes[g].cards.forEach(function (c) { if (out.length < n && out.indexOf(c) < 0) out.push(c); }); }); return out; }
	function byGradeDesc(a, b) { return C[b.card].grade - C[a.card].grade || C[b.card].pt - C[a.card].pt; }
	function byNew(a, b) { return a.at < b.at ? 1 : -1; }
	function byLikes(a, b) { return b.likes - a.likes; }
	function pct(n, d) { return d ? (n / d * 100).toFixed(n / d * 100 < 1 ? 2 : 1) + '%' : '0%'; }
	function refundSum(items) { var lo = 0, hi = 0; items.forEach(function (it) { var r = A.refundRange(it.card); lo += r[0]; hi += r[1]; }); return [lo, hi]; }
	function fixedSum(items) { return items.reduce(function (a, it) { return a + C[it.card].pt; }, 0); }
	function allPosts() {
		var s = A.load();
		return s.posts.map(function (p) { return withMeta(p, true); }).concat(D.POSTS.map(function (p) { return withMeta(p, false); }));
		function withMeta(p, mine) { return { id: p.id, author: p.author, card: p.card, title: p.title, body: p.body, at: p.at, mine: mine, likes: (p.likes || 0) + (s.likes[p.id] ? 1 : 0), liked: !!s.likes[p.id], comments: (p.comments || []).concat(s.comments[p.id] || []) }; }
	}
	function allMarket() { return A.load().market.concat(D.MARKET); }

	/* ---------- 마크업 조각 ---------- */
	function thumb(cardId, cls) { return '<div class="cardthumb ' + (cls || '') + '">' + A.cardArt(cardId) + '</div>'; }
	function productImg(p) { return p.img ? '<img src="' + p.img + '" alt="">' : thumb(p.card); }
	function emptyBox(msg, href, label) { return '<div class="empty">' + msg + (href ? '<br><a class="btn btn--primary btn--sm" href="' + href + '">' + label + '</a>' : '') + '</div>'; }
	function statusHtml(it) { return '<span class="status ' + STATUS[it.status][1] + '">' + STATUS[it.status][0] + (it.refund ? ' +' + fmt(it.refund) : '') + '</span>'; }
	function stockbar(o, rem) { var p = Math.round(rem / o.total * 100); return '<div class="stockbar"><div class="stockbar__row"><span>남은 수량 <b>' + fmt(rem) + '</b> / ' + fmt(o.total) + '</span><span>' + p + '%</span></div><i style="--p:' + p + '%"></i></div>'; }
	function drawBtns(o, rem, withPrice) { return [1, 5, 10].map(function (n) { return '<button type="button" data-n="' + n + '"' + (n === 10 ? ' class="is-main"' : '') + (rem < n ? ' disabled' : '') + '>' + n + '회' + (withPrice ? '<small>' + fmt(o.price * n) + 'pt</small>' : '') + '</button>'; }).join(''); }
	function tagHtml(o, extra) { return o.tag ? '<span class="op-card__tag' + (o.tag === 'HOT' ? ' op-card__tag--hot' : '') + (extra ? ' ' + extra : '') + '">' + esc(o.tag) + '</span>' : ''; }
	function ticketSummary(tickets) { var m = {}; tickets.forEach(function (t) { m[t.grade] = (m[t.grade] || 0) + 1; }); return descKeys(m).map(function (g) { return A.gradeChip(g, false, true) + (m[g] > 1 ? '<b class="gchip__n">×' + m[g] + '</b>' : ''); }).join(''); }
	function oripaCard(o) {
		var rem = A.remaining(o), tops = topCards(o, 3);
		return '<a class="op-card" href="oripa-detail.html?id=' + o.id + '">' +
			'<div class="op-card__cover"><img src="' + o.cover + '" alt="">' + tagHtml(o) +
			'<div class="op-card__top">' + tops.map(function (c) { return thumb(c); }).join('') + '<span>1등 ' + esc(C[tops[0]].name) + '</span></div></div>' +
			'<div class="op-card__body"><h2>' + esc(o.title) + '</h2><p class="op-card__sub">' + esc(o.sub) + '</p>' +
			'<div class="op-card__row"><span class="op-card__price">' + fmt(o.price) + '<small>pt / 회</small></span><span class="btn btn--primary btn--xs">뽑기</span></div>' + stockbar(o, rem) + '</div></a>';
	}
	function productCard(p) {
		return '<a class="pd" href="product.html?id=' + p.id + '"><div class="imgbox pd__img">' + productImg(p) + (p.stock ? '' : '<span class="imgbox__overlay">SOLD OUT</span>') + '</div>' +
			'<div class="pd__body"><span class="pd__type">' + TYPE_LABEL[p.type] + '</span><h2>' + esc(p.name) + '</h2><p class="pd__price">' + fmt(p.price) + '원</p></div></a>';
	}
	function hotCard(p) {
		return '<a href="post.html?id=' + p.id + '" style="--c:' + G[C[p.card].grade].color + '">' + thumb(p.card) + '<div class="bd-hot__t"><small>HOT · 좋아요 ' + fmt(p.likes) + '</small><h3>' + esc(p.title) + '</h3><p>' + esc(p.author) + ' · ' + esc(C[p.card].name) + '</p></div></a>';
	}
	function postRow(p) {
		return '<li data-id="' + p.id + '">' + thumb(p.card) + '<div><h3>' + esc(p.title) + '</h3><div class="meta">' + A.gradeChip(C[p.card].grade) + '<span class="meta-card">' + esc(C[p.card].name) + ' ·</span><span>' + esc(p.author) + '</span><span>·</span><span>' + A.ago(p.at) + '</span></div></div>' +
			'<div class="r"><span>좋아요 <b>' + fmt(p.likes) + '</b></span><span>댓글 ' + p.comments.length + '</span></div></li>';
	}
	function marketCard(m) {
		return '<div class="mk" data-id="' + m.id + '"><div class="imgbox mk__img">' + thumb(m.card) + '<span class="mk__type' + (m.type === 'buy' ? ' mk__type--buy' : '') + '">' + (m.type === 'buy' ? '구합니다' : '판매') + '</span>' + (m.status === 'done' ? '<span class="imgbox__overlay">거래완료</span>' : '') + '</div>' +
			'<div class="mk__body"><h3>' + esc(m.title) + '</h3><p class="mk__price">' + fmt(m.price) + '원</p><p class="mk__meta">' + esc(m.area) + ' · ' + esc(m.author) + ' · ' + A.ago(m.at) + '</p></div></div>';
	}
	/* 목록 행 클릭 → 상세 페이지 */
	function linkRows(root, sel, pageName) { root.addEventListener('click', function (e) { var el = e.target.closest(sel); if (el && root.contains(el)) location.href = pageName + '?id=' + el.dataset.id; }); }
	/* 카드 선택 박스 (위탁 · 글쓰기 공용) */
	function renderPickBox(el, picked, placeholder, withChip) {
		el.className = 'cs-pick' + (picked ? ' is-set' : '');
		el.innerHTML = picked ? thumb(picked.card) + '<span>' + esc(C[picked.card].name) + (withChip ? ' ' + A.gradeChip(C[picked.card].grade) : '') + '</span>' : '<span>' + placeholder + '</span>';
	}
	/* 보관함 카드 고르기 모달 */
	function pickCard(title, statuses, cb) {
		var items = A.load().collection.filter(function (x) { return statuses.indexOf(x.status) >= 0; });
		var body = A.modal('<h2>' + title + '</h2>' + (items.length ? '<div class="pick-grid">' + items.map(function (it) {
			return '<figure class="col-item" data-id="' + it.id + '">' + thumb(it.card) + '<figcaption>' + esc(C[it.card].name) + '</figcaption></figure>';
		}).join('') + '</div>' : emptyBox('보관함에 카드가 없습니다', 'oripa.html', '오리파 뽑으러 가기')));
		body.addEventListener('click', function (e) { var f = e.target.closest('.col-item'); if (f) { A.closeModal(); cb(A.byId(items, f.dataset.id)); } });
	}

	/* ---------- 감정 · 확정 전환 (보관함 · 결과 화면 공용) ---------- */
	function convertConfirm(items, done) {
		var sum = fixedSum(items);
		A.confirm('<h2>확정 포인트로 전환</h2><p class="sub">' + (items.length === 1 ? esc(C[items[0].card].name) : items.length + '장') + ' · 카드는 소각되고 <b>' + fmt(sum) + ' pt</b>가 바로 들어옵니다</p>',
			fmt(sum) + ' pt 전환', function () { A.batch(function () { items.forEach(function (it) { A.convert(it.id); }); }); A.toast('+' + fmt(sum) + ' pt 전환 완료', 'ok'); done(); });
	}
	/* 1장 감정 : 게이지 연출 */
	function appraiseOne(it, done) {
		var c = C[it.card], rg = A.refundRange(it.card);
		var body = A.confirm('<div class="ap">' + thumb(it.card) + '<h2>' + esc(c.name) + ' 감정</h2><p class="ap-range">확정 ' + fmt(c.pt) + ' pt · 감정 범위 <b>' + fmt(rg[0]) + ' ~ ' + fmt(rg[1]) + ' pt</b></p>' +
			'<div class="ap-gauge" id="apG"><i></i></div><div class="ap-val" id="apV">?<small>pt</small></div><p class="ap-tier" id="apT"></p>' +
			'<p class="small muted">확정 후 취소 불가 · 카드는 소각됩니다</p></div>', '감정 요청', function () {
				var r = A.appraise(it.id); if (!r) return;
				body.ok.disabled = true; body.cancel.classList.add('hide');
				var bar = $('#apG i'), val = $('#apV'), t0 = performance.now(), dur = 2200, target = (r.value - r.min) / (r.max - r.min);
				(function tick(nowTs) {
					var t = Math.min(1, (nowTs - t0) / dur), ease = 1 - Math.pow(1 - t, 3);
					var w = t < .7 ? Math.random() : target + (Math.random() - .5) * (1 - ease) * .3;
					bar.style.width = (Math.max(0, Math.min(1, w)) * 100).toFixed(1) + '%';
					val.innerHTML = fmt(Math.round(r.min + (r.max - r.min) * Math.max(0, Math.min(1, w)))) + '<small>pt</small>';
					if (t < 1) { requestAnimationFrame(tick); return; }
					bar.style.width = (target * 100) + '%'; val.innerHTML = fmt(r.value) + '<small>pt</small>';
					var tier = $('#apT'); tier.textContent = r.tier === 'max' ? '최대치 감정! 범위의 최고 포인트가 나왔습니다' : r.tier === 'high' ? '상위 감정 · 평균보다 높게 나왔습니다' : '일반 감정';
					if (r.tier === 'max') { tier.classList.add('is-max'); $('#apG').classList.add('is-max'); }
					A.refreshPoints();
					$('.modal__actions', body).innerHTML = '<button type="button" class="btn btn--primary" id="apDone">확인</button>';
					$('#apDone').addEventListener('click', done);
				})(t0);
			}, { lock: true });
	}
	/* 여러 장 감정 : 카드별 결과가 차례로 확정되고 합계가 올라감 */
	function appraiseMany(items, done) {
		var range = refundSum(items);
		var body = A.confirm('<h2>' + items.length + '장 한 번에 감정</h2><p class="sub">예상 환급 ' + fmt(range[0]) + ' ~ ' + fmt(range[1]) + ' pt · 확정 후 취소 불가</p>' +
			'<ul class="apm" id="apmList">' + items.map(function (it) { var c = C[it.card], rg = A.refundRange(it.card); return '<li data-id="' + it.id + '">' + thumb(it.card) + '<div><b>' + esc(c.name) + '</b><span>' + A.gradeChip(c.grade) + ' <em>확정 ' + fmt(c.pt) + ' · 감정 ' + fmt(rg[0]) + '~' + fmt(rg[1]) + '</em></span></div><strong class="apm__v">—</strong></li>'; }).join('') + '</ul>' +
			'<div class="apm__total"><span>합계</span><b id="apmTotal">0 pt</b></div>', '전부 감정', function () {
				body.ok.disabled = true; body.cancel.classList.add('hide');
				var results; A.batch(function () { results = items.map(function (it) { return { it: it, r: A.appraise(it.id) }; }).filter(function (x) { return x.r; }); });
				var total = 0, i = 0;
				(function step() {
					if (i >= results.length) {
						A.refreshPoints();
						$('.modal__actions', body).innerHTML = '<button type="button" class="btn btn--primary" id="apmDone">확인</button>';
						$('#apmDone').addEventListener('click', done);
						return;
					}
					var x = results[i++], li = $('#apmList li[data-id="' + x.it.id + '"]'), v = $('.apm__v', li), t0 = performance.now();
					li.classList.add('is-run'); li.scrollIntoView({ block: 'nearest' });
					(function tick(nowTs) {
						var t = Math.min(1, (nowTs - t0) / 650);
						v.textContent = fmt(Math.round(x.r.min + (x.r.max - x.r.min) * (t < .8 ? Math.random() : (x.r.value - x.r.min) / (x.r.max - x.r.min)))) + ' pt';
						if (t < 1) { requestAnimationFrame(tick); return; }
						v.textContent = fmt(x.r.value) + ' pt'; li.classList.remove('is-run'); li.classList.add('is-done', 'is-' + x.r.tier);
						if (x.r.tier !== 'normal') v.insertAdjacentHTML('beforeend', '<small>' + TIER[x.r.tier] + '</small>');
						total += x.r.value; $('#apmTotal').textContent = fmt(total) + ' pt';
						setTimeout(step, 120);
					})(t0);
				})();
			}, { lock: true, cls: 'modal--wide' });
	}
	/* 선택 액션 (보관함 · 결과 공용) : 확정 전환 / 감정 */
	function runAction(act, items, done) {
		if (!items.length) return;
		if (act === 'convert') convertConfirm(items, done);
		else if (act === 'appraise') { if (items.length === 1) appraiseOne(items[0], done); else appraiseMany(items, done); }
	}
	/* 선택 액션바 안내 문구 */
	function selSummary(picked, held) {
		var rg = refundSum(picked);
		return picked.length ? picked.length + '장 선택<small>확정 ' + fmt(fixedSum(picked)) + ' pt · 감정 시 ' + fmt(rg[0]) + ' ~ ' + fmt(rg[1]) + ' pt</small>'
			: '카드를 탭해서 선택<small>남은 ' + held.length + '장 · 확정 합계 ' + fmt(fixedSum(held)) + ' pt</small>';
	}

	/* ---------- 위탁 내역 (마이페이지 · 위탁 페이지 공용) ---------- */
	function renderConsigns(el, after) {
		var s = A.load();
		el.innerHTML = s.consigns.length ? s.consigns.map(function (c) {
			var name = c.card ? C[c.card].name : c.name;
			return '<div class="list-row" data-id="' + c.id + '"><div class="imgbox ct-item__img">' + (c.card ? thumb(c.card) : '') + '</div><div><h3>' + esc(name) + '</h3><p>희망가 ' + fmt(c.price) + '원 · 수수료 10% · ' + A.ago(c.at) + (c.memo ? ' · ' + esc(c.memo) : '') + '</p></div><div class="r"><span class="status ' + CS_STATUS[c.status][1] + '">' + CS_STATUS[c.status][0] + '</span>' + (c.status !== 'settled' ? '<br><button type="button" class="linkbtn small muted" data-next>다음 단계 (데모)</button>' : '') + '</div></div>';
		}).join('') : emptyBox('위탁 신청 내역이 없습니다');
		$$('[data-next]', el).forEach(function (b) { b.addEventListener('click', function () {
			var c = A.byId(s.consigns, b.closest('.list-row').dataset.id), order = ['review', 'selling', 'sold', 'settled'];
			c.status = order[order.indexOf(c.status) + 1];
			if (c.status === 'settled') { var v = A.settle(c.price); A.addPoints(v, 'settle', (c.card ? C[c.card].name : c.name) + ' 위탁 정산'); A.refreshPoints(); A.toast('정산 ' + fmt(v) + 'pt 지급', 'ok'); }
			A.save(); after();
		}); });
	}

	/* ---------- 글쓰기 모달 (게시판 · 장터) ---------- */
	function writePost(preItem) {
		var s = A.load(), picked = preItem || null;
		var body = A.confirm('<h2>카드 자랑하기</h2>' +
			'<div class="cs-pick" id="bwPick"></div><label class="field" style="margin-top:14px"><span>제목</span><input type="text" id="bwTitle" maxlength="60" placeholder="예: 3연차에 1등 떴습니다"></label><label class="field"><span>내용</span><textarea id="bwBody"></textarea></label>',
			'올리기', function () {
				var t = $('#bwTitle').value.trim(); if (!picked) { A.toast('카드를 골라 주세요', 'warn'); return; } if (!t) { A.toast('제목을 입력해 주세요', 'warn'); return; }
				var p = { id: A.uid('b'), author: s.user.name, card: picked.card, title: t, body: $('#bwBody').value.trim() + (picked.refund ? '\n\n감정 환급 ' + fmt(picked.refund) + 'pt' : ''), likes: 0, at: A.now(), comments: [] };
				s.posts.unshift(p); A.save(); location.href = 'post.html?id=' + p.id;
			});
		renderPickBox($('#bwPick', body), picked, '+ 보관함에서 카드 고르기', true);
		$('#bwPick', body).addEventListener('click', function () { var t = $('#bwTitle').value, b = $('#bwBody').value; pickCard('자랑할 카드', ['held', 'appraised', 'shipping', 'pickup', 'consigned'], function (it) { writePost(it); $('#bwTitle').value = t; $('#bwBody').value = b; }); });
	}
	function writeItem(preItem) {
		var s = A.load(), picked = preItem || null, type = 'sell';
		var body = A.confirm('<h2>장터 글 올리기</h2>' +
			'<div class="seg" id="mwType"><button type="button" class="is-on" data-t="sell">팝니다</button><button type="button" data-t="buy">구합니다</button></div>' +
			'<div class="cs-pick" id="mwPick" style="margin-top:14px"></div>' +
			'<label class="field" style="margin-top:14px"><span>카드</span><select id="mwCard">' + Object.keys(C).sort(function (a, b) { return C[b].grade - C[a].grade; }).map(function (id) { return '<option value="' + id + '">' + G[C[id].grade].label + ' · ' + esc(C[id].name) + '</option>'; }).join('') + '</select></label>' +
			'<label class="field"><span>제목</span><input type="text" id="mwTitle" maxlength="60"></label><div class="row"><label class="field grow"><span>가격 (원)</span><input type="text" id="mwPrice" inputmode="numeric"></label><label class="field grow"><span>거래 지역</span><input type="text" id="mwArea" placeholder="예: 서울 마포"></label></div><label class="field"><span>설명</span><textarea id="mwBody"></textarea></label>',
			'올리기', function () {
				var t = $('#mwTitle').value.trim(), pr = A.digits($('#mwPrice').value);
				if (!t || !pr) { A.toast('제목과 가격을 입력해 주세요', 'warn'); return; }
				var m = { id: A.uid('m'), type: type, author: s.user.name, card: $('#mwCard').value, title: t, price: pr, area: $('#mwArea').value.trim() || '지역 미정', body: $('#mwBody').value.trim(), status: 'open', at: A.now() };
				s.market.unshift(m); A.save(); location.href = 'item.html?id=' + m.id;
			});
		renderPickBox($('#mwPick', body), picked, '+ 내 보관함 카드로 올리기');
		if (picked) { $('#mwCard').value = picked.card; $('#mwPrice').value = C[picked.card].price; }
		A.seg('#mwType button', function (d) { type = d.t; }, body);
		$('#mwPick', body).addEventListener('click', function () { var v = { t: $('#mwTitle').value, a: $('#mwArea').value, b: $('#mwBody').value }; pickCard('올릴 카드', ['held', 'shipping', 'pickup'], function (it) { writeItem(it); $('#mwTitle').value = v.t; $('#mwArea').value = v.a; $('#mwBody').value = v.b; }); });
	}

	var pages = {};

	/* ---------- 홈 ---------- */
	pages.home = function () {
		if (A.param('reset')) { A.toast('데모 데이터를 초기화했습니다', 'ok'); history.replaceState(null, '', './'); }
		var posts = allPosts().sort(byLikes), market = allMarket();
		$('#hmStats').innerHTML = [[fmt(D.ORIPAS.reduce(function (a, o) { return a + A.remaining(o); }, 0)), '남은 오리파 구수'], [fmt(D.ORIPAS.length), '진행 중 오리파'], [fmt(posts.length), '자랑 게시글'], [fmt(market.filter(function (m) { return m.status === 'open'; }).length), '장터 거래 중']].map(function (x) { return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('');
		$('#hmOripa').innerHTML = D.ORIPAS.slice(0, 3).map(oripaCard).join('');
		$('#hmShop').innerHTML = D.PRODUCTS.slice(0, 4).map(productCard).join('');
		$('#hmHot').innerHTML = posts.slice(0, 3).map(hotCard).join('');
		$('#hmMarket').innerHTML = market.slice(0, 4).map(marketCard).join('');
		$('#hmNotice').innerHTML = D.NOTICES.filter(function (n) { return n.type !== 'faq'; }).slice(0, 4).map(function (n) { return '<li><a href="notice.html#' + n.id + '"><span class="status' + (n.type === 'event' ? ' status--warn' : '') + '">' + (n.type === 'event' ? '이벤트' : '공지') + '</span> ' + esc(n.title) + '</a><span class="muted small">' + n.at + '</span></li>'; }).join('');
		linkRows($('#hmMarket'), '.mk', 'item.html');
	};

	/* ---------- 오리파 ---------- */
	pages.oripa = function () { $('#opGrid').innerHTML = D.ORIPAS.map(oripaCard).join(''); };

	pages['oripa-detail'] = function () {
		var o = A.byId(D.ORIPAS, A.param('id')) || D.ORIPAS[0], st = A.stockOf(o), rem = A.remaining(o), s = A.load();
		document.title = o.title + ' · PULLS';
		$('#odCover').innerHTML = '<img src="' + o.cover + '" alt="">' + tagHtml(o, 'od-cover__tag') + '<div class="od-cover__in"><h1>' + esc(o.title) + '</h1><p>' + esc(o.sub) + '</p></div>';
		$('#odBuy').innerHTML = '<div class="od-buy__price">' + fmt(o.price) + '<small>pt / 1회</small></div>' + stockbar(o, rem) +
			'<div class="od-buy__points"><span>내 포인트</span><b>' + fmt(s.points) + ' pt</b></div>' +
			(s.tickets.length ? '<div class="od-buy__tickets"><span>보유 확정권</span><span>' + ticketSummary(s.tickets) + '</span></div>' : '') +
			'<div class="od-draws">' + drawBtns(o, rem, true) + '</div>' +
			'<div class="row" style="margin-top:10px"><a class="btn btn--ghost btn--sm grow" href="charge.html">포인트 충전</a></div>';
		$('#odPrizes').innerHTML = gradesDesc(o).map(function (g) {
			var pr = o.prizes[g];
			return '<div class="prize"><div class="prize__head"><div>' + A.gradeChip(g) + '<b class="prize__rank">' + G[g].rank + '</b></div><div class="prize__stat">남음 <b>' + st[g] + '</b> / ' + pr.count + '<br>확률 <b>' + pct(st[g], rem) + '</b></div></div>' +
				'<div><div class="prize__cards">' + pr.cards.map(function (c) { return '<figure>' + thumb(c) + '<figcaption>' + esc(C[c].name) + '<br><span class="muted">시세 ' + fmt(C[c].price) + '원</span><br><b>확정 ' + fmt(C[c].pt) + ' pt</b></figcaption></figure>'; }).join('') + '</div>' +
				'<p class="prize__refund"><i>감정 시</i>확정 포인트의 ½ ~ 2배</p></div></div>';
		}).join('') + (o.last ? '<div class="prize prize--last"><div class="prize__head"><div><span class="gchip gchip--6"><i></i>LAST ONE</span><b class="prize__rank">라스트원</b></div><div class="prize__stat">' + esc(o.last.note) + '</div></div><div class="prize__cards"><figure>' + thumb(o.last.card) + '<figcaption>' + esc(C[o.last.card].name) + '</figcaption></figure></div></div>' : '');
		$('#odProb').innerHTML = gradesDesc(o).map(function (g) { return '<div style="--c:' + G[g].color + '"><i></i><b>' + pct(st[g], rem) + '</b><span>' + G[g].rank + ' · ' + G[g].label + '</span></div>'; }).join('');
		$('#odBar').innerHTML = '<div class="od-bar__price"><b>' + fmt(o.price) + '</b>pt / 회<small>내 포인트 ' + fmt(s.points) + '</small></div><div class="od-bar__btns">' + drawBtns(o, rem, false) + '</div>';
		document.addEventListener('click', function (e) { var b = e.target.closest('.od-draws button, .od-bar__btns button'); if (b) confirmDraw(o, Number(b.dataset.n)); });
	};
	function confirmDraw(o, n) {
		var s = A.load(), cost = o.price * n, st = A.stockOf(o);
		if (s.points < cost) {
			A.modal('<h2>포인트가 부족합니다</h2><p class="sub">' + n + '회 뽑기에 ' + fmt(cost) + 'pt가 필요합니다. 현재 ' + fmt(s.points) + 'pt</p><div class="modal__actions"><a class="btn btn--primary" href="charge.html">충전하러 가기</a></div>');
			return;
		}
		/* 이 오리파에서 쓸 수 있는 확정권 : 그 등급 이상에 남은 수량이 있을 때 */
		var usable = s.tickets.filter(function (t) { return Object.keys(st).some(function (g) { return Number(g) >= t.grade && st[g] > 0; }); }).sort(function (a, b) { return b.grade - a.grade; });
		var body = A.confirm('<h2>' + esc(o.title) + ' ' + n + '회 뽑기</h2><p class="sub">' + fmt(cost) + 'pt 차감 · 결과는 취소할 수 없습니다</p>' +
			(usable.length ? '<div class="dt"><span class="dt__label">확정권 사용</span><div class="dt__list"><label class="opt dt__opt is-on"><input type="radio" name="tk" value="" checked><span>사용 안 함</span></label>' + usable.map(function (t) { return '<label class="opt dt__opt"><input type="radio" name="tk" value="' + t.id + '">' + A.gradeChip(t.grade, false, true) + '<span>한 장을 Lv.' + t.grade + ' 이상으로 보장</span></label>'; }).join('') + '</div></div>' : '') +
			'<ul class="ledger"><li><div>차감</div><b class="minus">-' + fmt(cost) + ' pt</b></li><li><div>남는 포인트</div><b>' + fmt(s.points - cost) + ' pt</b></li></ul>', '뽑기', function () {
				var d = A.draw(o, n, ($('input[name=tk]:checked', body) || {}).value || '');
				if (d.error) { A.toast(d.error, 'warn'); return; }
				var top = d.items.map(A.item).sort(byGradeDesc)[0], c = C[top.card];
				location.href = A.openUrl(new URLSearchParams({ g: c.grade, name: c.name, price: c.price, img: 'assets/cards/g' + c.grade + '.png', next: 'results.html?d=' + d.id, n: n }).toString());
			});
		A.bindRadios(body);
	}

	/* ---------- 결과 : 등급별 그룹, 카드 선택 → 확정 전환 / 감정 ---------- */
	pages.results = function () {
		var s = A.load(), d = A.byId(s.draws, A.param('d'));
		if (!d) { $('#rs').innerHTML = emptyBox('결과를 찾을 수 없습니다', 'oripa.html', '오리파로'); return; }
		var o = A.byId(D.ORIPAS, d.oripa), sel = [], anim = true;
		var list = d.items.map(A.item).sort(byGradeDesc), best = list[0], top = C[best.card].grade;
		function held() { return list.filter(function (x) { return x.status === 'held'; }); }
		function picked() { return list.filter(function (x) { return sel.indexOf(x.id) >= 0 && x.status === 'held'; }); }
		function cardHtml(it, i) {
			var c = C[it.card], done = it.status !== 'held';
			return '<figure class="rs-card' + (done ? ' is-done' : '') + (sel.indexOf(it.id) >= 0 ? ' is-sel' : '') + '" data-id="' + it.id + '" style="' + (anim ? '--d:' + (.25 + i * .06) + 's;' : '') + '--c:' + G[c.grade].color + '">' + (done ? '' : '<span class="chk"></span>') + thumb(it.card) +
				'<figcaption><b>' + esc(c.name) + '</b><span>시세 ' + fmt(c.price) + '원</span><span class="rs-card__pt">확정 <b>' + fmt(c.pt) + ' pt</b></span>' + (it.ticket ? '<span class="status status--warn">확정권</span>' : '') + (done ? statusHtml(it) : '') + '</figcaption></figure>';
		}
		function render() {
			var rsTop = $('#rsTop');
			$('#rsHead').innerHTML = '<h1>' + esc(o.title) + ' · ' + list.length + '회</h1>';
			rsTop.className = 'rs-top' + (anim ? ' is-anim' : '') + (G[top].rainbow ? ' is-rainbow' : '') + (best.status !== 'held' ? ' is-done' : '') + (sel.indexOf(best.id) >= 0 ? ' is-sel' : '');
			rsTop.style.setProperty('--c', G[top].color); rsTop.dataset.id = best.id;
			rsTop.innerHTML = (best.status === 'held' ? '<span class="chk"></span>' : '') + thumb(best.card) + '<div class="rs-top__t"><small>BEST PULL</small><b>' + esc(C[best.card].name) + '</b>' + A.gradeChip(top, true) + '<p class="rs-top__pt">' + (best.ticket ? '<span class="status status--warn">Lv.' + best.ticket + ' 확정권</span> ' : '') + '시세 ' + fmt(C[best.card].price) + '원 · 확정 ' + fmt(C[best.card].pt) + ' pt · 감정 ' + fmt(A.refundRange(best.card)[0]) + '~' + fmt(A.refundRange(best.card)[1]) + ' pt</p>' + (best.status !== 'held' ? statusHtml(best) : '<span class="rs-top__hint">탭해서 선택</span>') + '</div>';
			var groups = {}, i = 0;
			list.slice(1).forEach(function (it) { var g = C[it.card].grade; (groups[g] = groups[g] || []).push(it); });
			$('#rsGroups').innerHTML = descKeys(groups).map(function (g) {
				return '<section class="rs-group"><div class="rs-group__head" style="--c:' + G[g].color + '">' + A.gradeChip(g, true) + '<span>' + groups[g].length + '장 · 확정 ' + fmt(fixedSum(groups[g])) + ' pt</span></div><div class="rs-cards">' + groups[g].map(function (it) { return cardHtml(it, i++); }).join('') + '</div></section>';
			}).join('');
			renderBar();
			anim = false;
		}
		function renderBar() {
			var h = held(), p = picked(), allSel = h.length && h.every(function (x) { return sel.indexOf(x.id) >= 0; });
			$('#rsFoot').innerHTML = '<div class="col-bar rs-bar fixbar' + (h.length ? '' : ' hide') + '" id="rsBar"><b>' + selSummary(p, h) + '</b>' +
				'<button type="button" class="btn btn--primary" data-act="convert"' + (p.length ? '' : ' disabled') + '>확정 전환</button><button type="button" class="btn" data-act="appraise"' + (p.length ? '' : ' disabled') + '>감정</button><button type="button" class="btn" data-act="all">' + (allSel ? '선택 해제' : '전체 선택') + '</button></div>' +
				'<div class="rs-actions"><a class="btn btn--ghost" href="my.html#collection">보관함</a><a class="btn btn--primary" href="oripa-detail.html?id=' + o.id + '">한 번 더 뽑기</a></div>';
		}
		function setSel(ids) { sel = ids; $$('.rs-card, .rs-top').forEach(function (el) { el.classList.toggle('is-sel', sel.indexOf(el.dataset.id) >= 0); }); renderBar(); }
		function done() { A.closeModal(); sel = []; A.refreshPoints(); render(); }
		$('#rs').addEventListener('click', function (e) {
			var card = e.target.closest('.rs-card, .rs-top'), btn = e.target.closest('#rsBar button');
			if (card && !card.classList.contains('is-done')) { var id = card.dataset.id, k = sel.indexOf(id); if (k >= 0) sel.splice(k, 1); else sel.push(id); setSel(sel); }
			else if (btn) {
				if (btn.dataset.act === 'all') setSel(held().every(function (x) { return sel.indexOf(x.id) >= 0; }) ? [] : held().map(function (x) { return x.id; }));
				else runAction(btn.dataset.act, picked(), done);
			}
		});
		render();
	};

	/* ---------- 샵 ---------- */
	pages.shop = function () {
		var f = 'all';
		function render() { $('#pdGrid').innerHTML = D.PRODUCTS.filter(function (p) { return f === 'all' || p.type === f; }).map(productCard).join(''); }
		A.seg('#pdFilter .chip', function (d) { f = d.f; render(); });
		render();
	};
	pages.product = function () {
		var p = A.byId(D.PRODUCTS, A.param('id')) || D.PRODUCTS[0], q = 1;
		document.title = p.name + ' · PULLS';
		$('#pvImg').innerHTML = productImg(p);
		$('#pvInfo').innerHTML = '<span class="pd__type">' + TYPE_LABEL[p.type] + '</span><h1>' + esc(p.name) + '</h1><p class="pv-price">' + fmt(p.price) + '원</p>' +
			'<div class="pv-meta"><dl><dt>구성</dt><dd>' + esc(p.desc) + '</dd><dt>재고</dt><dd>' + (p.stock ? p.stock + '개' : '품절') + '</dd><dt>적립</dt><dd>' + fmt(A.earn(p.price)) + ' pt (3%)</dd><dt>배송</dt><dd>3,000원 · 50,000원 이상 무료</dd></dl></div>' +
			'<div class="row" style="margin-top:18px"><span class="small muted">수량</span><div class="qty"><button type="button" id="qm">−</button><b id="qv">1</b><button type="button" id="qp">+</button></div></div>' +
			'<div class="pv-actions fixbar"><button type="button" class="btn btn--ghost" id="pvCart"' + (p.stock ? '' : ' disabled') + '>장바구니</button><button type="button" class="btn btn--primary" id="pvBuy"' + (p.stock ? '' : ' disabled') + '>바로 구매</button></div>';
		$('#qm').addEventListener('click', function () { q = Math.max(1, q - 1); $('#qv').textContent = q; });
		$('#qp').addEventListener('click', function () { q = Math.min(p.stock || 1, q + 1); $('#qv').textContent = q; });
		function add() { var s = A.load(), it = s.cart.filter(function (x) { return x.product === p.id; })[0]; if (it) it.qty += q; else s.cart.push({ product: p.id, qty: q }); A.save(); }
		$('#pvCart').addEventListener('click', function () { add(); A.toast('장바구니에 담았습니다', 'ok'); setTimeout(function () { location.reload(); }, 600); });
		$('#pvBuy').addEventListener('click', function () { add(); location.href = 'cart.html'; });
	};
	pages.cart = function () {
		var s = A.load(), root = $('#ct');
		function render() {
			var items = s.cart.map(function (c) { return { p: A.byId(D.PRODUCTS, c.product), qty: c.qty, c: c }; }).filter(function (x) { return x.p; });
			if (!items.length) { root.innerHTML = emptyBox('장바구니가 비어 있습니다', 'shop.html', '박스·팩 보러 가기'); return; }
			var sub = items.reduce(function (a, x) { return a + x.p.price * x.qty; }, 0), ship = sub >= 50000 ? 0 : 3000;
			root.innerHTML = '<div><div class="card-box ct-list">' + items.map(function (x) {
				return '<div class="ct-item" data-id="' + x.p.id + '"><div class="imgbox ct-item__img">' + productImg(x.p) + '</div><div><h3>' + esc(x.p.name) + '</h3><p>' + esc(x.p.desc) + '</p><div class="qty" style="margin-top:8px"><button type="button" data-d="-1">−</button><b>' + x.qty + '</b><button type="button" data-d="1">+</button></div></div><div class="ct-item__r">' + fmt(x.p.price * x.qty) + '원<button type="button" class="linkbtn" data-rm>삭제</button></div></div>';
			}).join('') + '</div></div>' +
				'<div class="ct-sum card-box"><dl><dt>상품 금액</dt><dd>' + fmt(sub) + '원</dd><dt>배송비</dt><dd>' + (ship ? fmt(ship) + '원' : '무료') + '</dd></dl><div class="ct-total"><span>결제 금액</span><b>' + fmt(sub + ship) + '원</b></div>' +
				'<h3>배송지</h3><label class="field"><input type="text" id="ctAddr" placeholder="주소 (데모 · 저장되지 않음)" value="서울 마포구 홍대로 12"></label>' +
				'<h3>결제수단</h3>' + A.payOptions('naver') +
				'<button type="button" class="btn btn--primary btn--wide btn--lg" id="ctOrder" style="margin-top:18px">' + fmt(sub + ship) + '원 결제하기</button></div>';
			A.bindRadios(root);
			$('#ctOrder').addEventListener('click', function () {
				var pay = ($('input[name=pay]:checked') || {}).value || 'naver', pts = A.earn(sub);
				var order = { id: A.uid('o'), items: s.cart.slice(), total: sub + ship, pay: pay, at: A.now(), status: 'paid' };
				A.batch(function () { s.orders.unshift(order); s.cart = []; A.addPoints(pts, 'earn', '구매 적립 (3%)'); });
				A.modal('<h2>주문이 완료되었습니다</h2><p class="sub">' + A.payName(pay) + ' · ' + fmt(order.total) + '원 · 적립 ' + fmt(pts) + 'pt</p><div class="modal__actions"><a class="btn btn--ghost" href="shop.html">계속 쇼핑</a><a class="btn btn--primary" href="my.html#orders">주문 내역</a></div>', { lock: true });
			});
		}
		root.addEventListener('click', function (e) {
			var row = e.target.closest('.ct-item'); if (!row) return;
			var c = s.cart.filter(function (x) { return x.product === row.dataset.id; })[0], qb = e.target.closest('.qty button');
			if (qb) { c.qty = Math.max(1, c.qty + Number(qb.dataset.d)); A.save(); render(); }
			else if (e.target.closest('[data-rm]')) { s.cart = s.cart.filter(function (x) { return x !== c; }); A.save(); render(); }
		});
		render();
	};

	/* ---------- 충전 ---------- */
	pages.charge = function () {
		var s = A.load(), AMTS = [10000, 30000, 50000, 100000, 300000, 1000000], amt = 30000;
		$('#chNow').textContent = fmt(s.points) + ' pt';
		$('#chTickets').innerHTML = s.tickets.length ? '<span class="small muted">보유 확정권</span>' + ticketSummary(s.tickets) : '<span class="small muted">보유 확정권 없음</span>';
		$('#chAmounts').innerHTML = AMTS.map(function (a) { var g = A.ticketFor(a); return '<button type="button" class="opt' + (a === amt ? ' is-on' : '') + '" data-a="' + a + '">' + fmt(a) + '원' + (g ? '<small>' + A.gradeChip(g, false, true) + '</small>' : '<small class="muted">확정권 없음</small>') + '</button>'; }).join('');
		$('#chPays').innerHTML = A.payOptions('kakao'); A.bindRadios($('#chPays'));
		function sum() { var g = A.ticketFor(amt); $('#chSum').innerHTML = '<span>충전 후 포인트<br><small class="muted">' + fmt(amt) + ' pt' + (g ? ' + </small>' + A.gradeChip(g, false, true) : '</small>') + '</span><b>' + fmt(s.points + amt) + ' pt</b>'; }
		A.seg('#chAmounts button', function (d) { amt = Number(d.a); $('#chCustom').value = ''; sum(); });
		$('#chCustom').addEventListener('input', function () { var v = A.digits(this.value); if (v >= 1000) { amt = v; $$('#chAmounts button').forEach(function (x) { x.classList.remove('is-on'); }); sum(); } });
		$('#chGo').addEventListener('click', function () {
			var pay = ($('input[name=pay]:checked') || {}).value || 'kakao', g = A.ticketFor(amt);
			A.batch(function () { A.addPoints(amt, 'charge', A.payName(pay) + ' 충전'); if (g) A.grantTicket(g, fmt(amt) + '원 충전'); });
			A.refreshPoints();
			A.modal('<h2>충전 완료</h2><p class="sub">' + A.payName(pay) + ' · ' + fmt(amt) + '원</p>' + (g ? '<div class="ch-ticket">' + A.gradeChip(g, false, true) + '<span>확정권 1장이 보관함에 들어갔습니다. 오리파 뽑기 확인창에서 사용하면 한 장이 Lv.' + g + ' 이상으로 보장됩니다.</span></div>' : '') + '<div class="ch-sum"><span>현재 포인트</span><b>' + fmt(s.points) + ' pt</b></div><div class="modal__actions"><a class="btn btn--ghost" href="my.html">마이페이지</a><a class="btn btn--primary" href="oripa.html">오리파 뽑으러 가기</a></div>', { lock: true });
		});
		sum();
	};

	/* ---------- 마이페이지 ---------- */
	pages.my = function () {
		var s = A.load(), sel = [], f = { status: 'held', grade: 0, sort: 'grade' }, body = $('#myBody');
		function tab() { var t = location.hash.slice(1); return ['collection', 'points', 'orders', 'consigns', 'posts'].indexOf(t) >= 0 ? t : 'collection'; }
		function renderTop() { $('#myTop').innerHTML = '<a class="is-dark" href="charge.html"><span>포인트</span><b>' + fmt(s.points) + ' pt</b></a><div><span>보관 중 카드</span><b>' + s.collection.filter(function (x) { return x.status === 'held'; }).length + '장</b></div><div><span>확정권</span><b>' + s.tickets.length + '장</b></div><div><span>위탁 진행</span><b>' + s.consigns.filter(function (c) { return c.status !== 'settled'; }).length + '건</b></div>'; }
		$('#myReset').addEventListener('click', A.resetDialog);
		$$('#myTabs button').forEach(function (b) { b.addEventListener('click', function () { location.hash = b.dataset.t; }); });
		window.addEventListener('hashchange', render);
		function visible() {
			var pool = s.collection.filter(function (x) { return f.status === 'all' || (f.status === 'held' ? x.status === 'held' : x.status !== 'held'); });
			return { pool: pool, items: pool.filter(function (x) { return !f.grade || C[x.card].grade === f.grade; }).sort(f.sort === 'grade' ? byGradeDesc : byNew) };
		}
		function selectable() { return visible().items.filter(function (x) { return x.status === 'held'; }); }
		function picked() { return sel.map(A.item).filter(function (x) { return x && x.status === 'held'; }); }
		function render() {
			var t = tab();
			$$('#myTabs button').forEach(function (b) { b.classList.toggle('is-on', b.dataset.t === t); });
			if (t === 'collection') renderCollection();
			else if (t === 'points') body.innerHTML = '<div class="row" style="margin-bottom:14px"><b style="font-size:22px">' + fmt(s.points) + ' pt</b><a class="btn btn--primary btn--sm" href="charge.html">충전</a></div>' +
				'<div class="card-box" style="margin-bottom:18px"><div class="row" style="justify-content:space-between"><b>보유 확정권</b><span class="small muted">오리파 뽑기 확인창에서 사용</span></div>' + (s.tickets.length ? '<ul class="tk-list">' + s.tickets.map(function (tk) { return '<li>' + A.gradeChip(tk.grade, false, true) + '<span>' + esc(tk.memo) + ' · ' + A.ago(tk.at) + '</span></li>'; }).join('') + '</ul>' : '<p class="small muted" style="margin-top:8px">없음 · 30,000원 이상 충전 시 지급</p>') + '</div>' +
				'<ul class="ledger">' + s.ledger.map(function (l) { return '<li><div>' + esc(l.memo) + '<br><span>' + A.ago(l.at) + ' · ' + LEDGER[l.type] + '</span></div><b class="' + (l.amount >= 0 ? 'plus' : 'minus') + '">' + (l.amount >= 0 ? '+' : '') + fmt(l.amount) + '</b></li>'; }).join('') + '</ul>';
			else if (t === 'orders') body.innerHTML = s.orders.length ? s.orders.map(function (o) { var p = A.byId(D.PRODUCTS, o.items[0].product); return '<div class="list-row"><div class="imgbox ct-item__img">' + productImg(p) + '</div><div><h3>' + esc(p.name) + (o.items.length > 1 ? ' 외 ' + (o.items.length - 1) + '건' : '') + '</h3><p>' + A.ago(o.at) + ' · ' + A.payName(o.pay) + '</p></div><div class="r">' + fmt(o.total) + '원<br><span class="status status--ok">결제완료</span></div></div>'; }).join('') : emptyBox('주문 내역이 없습니다');
			else if (t === 'consigns') renderConsigns(body, render);
			else if (t === 'posts') { var mine = allPosts().filter(function (p) { return p.mine; }); body.innerHTML = mine.length ? '<ul class="bd-list">' + mine.map(postRow).join('') + '</ul>' : emptyBox('작성한 글이 없습니다', 'board.html', '자랑하러 가기'); }
		}
		function renderCollection() {
			var v = visible(), counts = {};
			v.pool.forEach(function (x) { var g = C[x.card].grade; counts[g] = (counts[g] || 0) + 1; });
			body.innerHTML = '<div class="col-tools">' +
				'<div class="seg" id="colStatus">' + [['held', '보관중'], ['done', '처리완료'], ['all', '전체']].map(function (x) { return '<button type="button"' + (x[0] === f.status ? ' class="is-on"' : '') + ' data-s="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
				'<div class="seg" id="colSort"><button type="button"' + (f.sort === 'grade' ? ' class="is-on"' : '') + ' data-o="grade">등급순</button><button type="button"' + (f.sort === 'new' ? ' class="is-on"' : '') + ' data-o="new">최신순</button></div>' +
				'<button type="button" class="chip" id="colAll"></button></div>' +
				'<div class="chips col-grades"><button type="button" class="chip' + (!f.grade ? ' is-on' : '') + '" data-g="0">전체 ' + v.pool.length + '</button>' + [6, 5, 4, 3, 2, 1].filter(function (g) { return counts[g]; }).map(function (g) { return '<button type="button" class="chip' + (f.grade === g ? ' is-on' : '') + (G[g].rainbow ? ' is-rainbow' : '') + '" data-g="' + g + '" style="--c:' + G[g].color + '"><i></i>' + G[g].label + ' ' + counts[g] + '</button>'; }).join('') + '</div>' +
				(v.items.length ? '<div class="col-grid">' + v.items.map(function (it) {
					var c = C[it.card];
					return '<figure class="col-item' + (it.status !== 'held' ? ' is-done' : '') + (sel.indexOf(it.id) >= 0 ? ' is-sel' : '') + '" data-id="' + it.id + '">' + (it.status !== 'held' ? '<span class="st">' + STATUS[it.status][0] + (it.refund ? ' ' + fmt(it.refund) + 'pt' : '') + '</span>' : '<span class="chk"></span>') + thumb(it.card) + '<figcaption>' + esc(c.name) + '<br>' + A.gradeChip(c.grade) + '</figcaption></figure>';
				}).join('') + '</div>' : emptyBox(f.status === 'held' ? '보관 중인 카드가 없습니다' : '해당하는 카드가 없습니다', 'oripa.html', '오리파 뽑으러 가기')) +
				'<div class="col-bar" id="colBar"></div>';
			renderBar();
		}
		function renderBar() {
			var sl = selectable(), p = picked(), allSel = sl.length && sl.every(function (x) { return sel.indexOf(x.id) >= 0; }), all = $('#colAll');
			all.classList.toggle('hide', !sl.length); all.textContent = allSel ? '선택 해제' : '전체 선택 (' + sl.length + ')';
			var bar = $('#colBar'); bar.classList.toggle('hide', !p.length);
			bar.innerHTML = '<b>' + selSummary(p, sl) + '</b>' + [['convert', '확정 전환', 'btn--primary'], ['appraise', '감정 요청', ''], ['ship', '배송 신청', ''], ['pickup', '매장 수령', ''], ['consign', '위탁', ''], ['brag', '자랑', ''], ['clear', '해제', '']].map(function (b) { return '<button type="button" class="btn ' + b[2] + '" data-act="' + b[0] + '">' + b[1] + '</button>'; }).join('');
		}
		function setSel(ids) { sel = ids; $$('.col-item', body).forEach(function (el) { el.classList.toggle('is-sel', sel.indexOf(el.dataset.id) >= 0); }); renderBar(); }
		function done() { A.closeModal(); sel = []; A.refreshPoints(); renderTop(); render(); }
		function action(act) {
			var items = picked();
			if (act === 'clear') return setSel([]);
			if ((act === 'consign' || act === 'brag') && items.length !== 1) { A.toast('한 장만 선택해 주세요', 'warn'); return; }
			if (act === 'consign') { location.href = 'consign.html?item=' + items[0].id; return; }
			if (act === 'brag') { location.href = 'board.html?write=' + items[0].id; return; }
			if (act === 'ship' || act === 'pickup') {
				A.confirm('<h2>' + (act === 'ship' ? '배송 신청' : '매장 수령 신청') + '</h2><p class="sub">' + items.length + '장 · ' + (act === 'ship' ? '영업일 2~3일 내 발송 · 배송비 3,000원 (5장 이상 무료)' : '매장에서 회원 이름과 신청 번호로 수령') + '</p>' +
					(act === 'ship' ? '<label class="field"><span>배송지</span><input type="text" value="서울 마포구 홍대로 12"></label>' : '<label class="field"><span>수령 매장</span><select><option>홍대점</option><option>강남점</option></select></label>'),
					'신청', function () { items.forEach(function (it) { it.status = act === 'ship' ? 'shipping' : 'pickup'; }); A.save(); A.toast('신청되었습니다', 'ok'); done(); });
				return;
			}
			runAction(act, items, done);
		}
		body.addEventListener('click', function (e) {
			var t = e.target, b;
			if ((b = t.closest('#colStatus button'))) { f.status = b.dataset.s; f.grade = 0; sel = []; renderCollection(); }
			else if ((b = t.closest('#colSort button'))) { f.sort = b.dataset.o; renderCollection(); }
			else if ((b = t.closest('.col-grades .chip'))) { f.grade = Number(b.dataset.g); renderCollection(); }
			else if (t.closest('#colAll')) { var sl = selectable(); setSel(sl.every(function (x) { return sel.indexOf(x.id) >= 0; }) ? [] : sl.map(function (x) { return x.id; })); }
			else if ((b = t.closest('.col-item:not(.is-done)'))) { var k = sel.indexOf(b.dataset.id); if (k >= 0) sel.splice(k, 1); else sel.push(b.dataset.id); setSel(sel); }
			else if ((b = t.closest('#colBar button'))) action(b.dataset.act);
		});
		renderTop(); render();
	};

	/* ---------- 위탁 ---------- */
	pages.consign = function () {
		var s = A.load(), picked = null, pre = A.item(A.param('item'));
		if (pre && pre.status === 'held') picked = pre;
		function renderPick() { renderPickBox($('#csPick'), picked, '+ 보관함에서 카드 고르기 (또는 아래에 직접 입력)', true); if (picked) { $('#csName').value = C[picked.card].name; $('#csPrice').value = C[picked.card].price; } }
		function renderList() { renderConsigns($('#csList'), renderList); }
		$('#csPick').addEventListener('click', function () { pickCard('위탁할 카드', ['held'], function (it) { picked = it; renderPick(); }); });
		$('#csForm').addEventListener('submit', function (e) {
			e.preventDefault();
			var name = $('#csName').value.trim(), price = A.digits($('#csPrice').value);
			if (!name || !price) { A.toast('카드 이름과 희망가를 입력해 주세요', 'warn'); return; }
			s.consigns.unshift({ id: A.uid('cs'), card: picked ? picked.card : null, name: name, price: price, memo: $('#csMemo').value.trim(), status: 'review', at: A.now() });
			if (picked) picked.status = 'consigned';
			A.save(); picked = null; $('#csForm').reset(); renderPick(); renderList(); A.toast('위탁 신청이 접수되었습니다', 'ok');
		});
		renderPick(); renderList();
	};

	/* ---------- 자랑 게시판 ---------- */
	pages.board = function () {
		var sort = 'hot';
		function render() {
			var posts = allPosts();
			$('#bdHot').innerHTML = posts.slice().sort(byLikes).slice(0, 3).map(hotCard).join('');
			$('#bdList').innerHTML = posts.sort(sort === 'hot' ? byLikes : byNew).map(postRow).join('');
		}
		linkRows($('#bdList'), 'li', 'post.html');
		A.seg('#bdSort button', function (d) { sort = d.s; render(); });
		$('#bdWrite').addEventListener('click', function () { writePost(null); });
		render();
		var pre = A.param('write'); if (pre) writePost(A.item(pre));
	};
	pages.post = function () {
		var id = A.param('id'), el = $('#post');
		function render() {
			var p = A.byId(allPosts(), id);
			if (!p) { el.innerHTML = emptyBox('글을 찾을 수 없습니다', 'board.html', '목록으로'); return; }
			var c = C[p.card];
			document.title = p.title + ' · PULLS';
			el.innerHTML = '<a class="post__back" href="board.html">← 카드 자랑</a>' +
				'<div class="post__hero" style="--c:' + G[c.grade].color + '">' + thumb(p.card, 'post__card') + '</div>' +
				'<div class="post__head">' + A.gradeChip(c.grade, true) + '<span class="small muted">' + esc(c.name) + '</span><h1>' + esc(p.title) + '</h1><p class="post__meta">' + esc(p.author) + ' · ' + A.ago(p.at) + '</p></div>' +
				'<div class="post__body">' + esc(p.body) + '</div>' +
				'<div class="post__actions"><button type="button" class="like' + (p.liked ? ' is-on' : '') + '" id="pLike">♥ ' + fmt(p.likes) + '</button>' + (p.mine ? '<button type="button" class="btn btn--ghost btn--sm" id="pDel">삭제</button>' : '') + '</div>' +
				'<div class="cm"><h4>댓글 ' + p.comments.length + '</h4><ul>' + p.comments.map(function (cm) { return '<li><b>' + esc(cm.author) + '</b>' + esc(cm.text) + '<span>' + A.ago(cm.at) + '</span></li>'; }).join('') + '</ul>' +
				'<form id="cmForm"><input type="text" placeholder="댓글 남기기" maxlength="200"><button type="submit" class="btn btn--primary btn--sm">등록</button></form></div>';
		}
		el.addEventListener('click', function (e) {
			var s = A.load();
			if (e.target.closest('#pLike')) { if (s.likes[id]) delete s.likes[id]; else s.likes[id] = true; A.save(); render(); }
			else if (e.target.closest('#pDel')) { s.posts = s.posts.filter(function (x) { return x.id !== id; }); A.save(); location.href = 'board.html'; }
		});
		el.addEventListener('submit', function (e) { e.preventDefault(); var v = $('input', e.target).value.trim(); if (!v) return; var s = A.load(); (s.comments[id] = s.comments[id] || []).push({ author: s.user.name, text: v, at: A.now() }); A.save(); render(); });
		render();
	};

	/* ---------- 직거래 장터 ---------- */
	pages.market = function () {
		var f = 'all';
		function render() {
			var list = allMarket().filter(function (m) { return f === 'all' || m.type === f; });
			$('#mkGrid').innerHTML = list.length ? list.map(marketCard).join('') : emptyBox('글이 없습니다');
		}
		linkRows($('#mkGrid'), '.mk', 'item.html');
		A.seg('#mkFilter .chip', function (d) { f = d.f; render(); });
		$('#mkWrite').addEventListener('click', function () { writeItem(null); });
		render();
	};
	pages.item = function () {
		var id = A.param('id'), el = $('#item'), s = A.load();
		function render() {
			var m = A.byId(allMarket(), id);
			if (!m) { el.innerHTML = emptyBox('글을 찾을 수 없습니다', 'market.html', '목록으로'); return; }
			var c = C[m.card], mine = s.market.indexOf(m) >= 0;
			document.title = m.title + ' · PULLS';
			el.innerHTML = '<a class="post__back" href="market.html">← 직거래 장터</a>' +
				'<div class="post__hero' + (m.status === 'done' ? ' is-done' : '') + '" style="--c:' + G[c.grade].color + '">' + thumb(m.card, 'post__card') + '</div>' +
				'<div class="post__head"><span class="mk__type mk__type--inline' + (m.type === 'buy' ? ' mk__type--buy' : '') + '">' + (m.type === 'buy' ? '구합니다' : '판매') + '</span> ' + (m.status === 'done' ? '<span class="status">거래완료</span>' : '') + '<h1>' + esc(m.title) + '</h1><p class="post__price">' + fmt(m.price) + '원</p><p class="post__meta">' + esc(c.name) + ' · ' + esc(m.area) + ' · ' + esc(m.author) + ' · ' + A.ago(m.at) + '</p></div>' +
				'<div class="post__body">' + esc(m.body) + '</div>' +
				'<p class="small muted" style="margin-top:14px">PULLS 는 회원 간 직거래에 관여하지 않습니다. 대면 거래와 정품 확인을 권장합니다.</p>' +
				'<div class="post__actions">' + (mine ? '<button type="button" class="btn btn--ghost" id="iDone">' + (m.status === 'done' ? '거래중으로 변경' : '거래완료로 변경') + '</button><button type="button" class="btn btn--ghost" id="iDel">삭제</button>' : '<button type="button" class="btn btn--ghost" id="iReport">신고</button><button type="button" class="btn btn--primary" id="iContact">채팅으로 연락하기</button>') + '</div>';
			return m;
		}
		el.addEventListener('click', function (e) {
			var m = A.byId(allMarket(), id); if (!m) return;
			if (e.target.closest('#iDone')) { m.status = m.status === 'done' ? 'open' : 'done'; A.save(); render(); }
			else if (e.target.closest('#iDel')) { s.market = s.market.filter(function (x) { return x.id !== id; }); A.save(); location.href = 'market.html'; }
			else if (e.target.closest('#iContact')) A.toast('실제 서비스에서는 쪽지·오픈채팅으로 연결됩니다');
			else if (e.target.closest('#iReport')) A.toast('신고가 접수되었습니다', 'ok');
		});
		render();
	};

	/* ---------- 공지 ---------- */
	pages.notice = function () {
		var hash = location.hash.slice(1), t = hash === 'terms' || hash === 'privacy' ? hash : 'notice', hit = A.byId(D.NOTICES, hash);
		if (hit) t = hit.type;
		function render() {
			$$('#ntTabs button').forEach(function (b) { b.classList.toggle('is-on', b.dataset.t === t); });
			var el = $('#ntBody');
			if (t === 'terms') el.innerHTML = '<div class="nt-doc">' + esc(D.TERMS) + '</div>';
			else if (t === 'privacy') el.innerHTML = '<div class="nt-doc">' + esc(D.PRIVACY) + '</div>';
			else el.innerHTML = '<ul class="nt-list">' + D.NOTICES.filter(function (n) { return n.type === t; }).map(function (n) { return '<li id="' + n.id + '"' + (n.id === hash ? ' class="is-open"' : '') + '><button type="button">' + esc(n.title) + '<span>' + (n.at || 'FAQ') + '</span></button><div class="body">' + esc(n.body) + '</div></li>'; }).join('') + '</ul>';
		}
		$('#ntBody').addEventListener('click', function (e) { var b = e.target.closest('.nt-list button'); if (b) b.parentNode.classList.toggle('is-open'); });
		A.seg('#ntTabs button', function (d) { t = d.t; hash = ''; render(); });
		render();
	};

	if (pages[page]) pages[page]();
})();
