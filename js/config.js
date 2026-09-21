/* =========================================================
   TCG STORE — 운영 설정 (관리자 설정 후 값만 바꾸면 됩니다)
   ========================================================= */
window.TCG_CONFIG = {
	/* BJ 라이브개봉 카테고리 번호. 관리자 > 상품 > 상품분류 관리에서 확인. 0이면 아래 키워드로 이름 판별 */
	liveCateNo: 42,
	liveKeyword: '라이브',

	/* 라이브 링크 (임시 값 — 실제 유튜브 채널/라이브 주소로 교체) */
	liveUrl: 'https://www.youtube.com/',
	liveChannelName: 'YouTube 채널',

	/* 라이브개봉 안내 문구 */
	liveTitle: '방송에서 대신 열어 드립니다',
	liveDesc: '결제가 확인되면 방송 순서에 맞춰 팩을 개봉하고, 나온 카드는 그대로 안전하게 배송해 드립니다.',
	liveSteps: ['팩 선택과 결제', '방송에서 개봉', '카드 배송'],
	liveNotice: '이 상품은 BJ가 방송에서 대신 개봉한 뒤 카드를 배송하는 상품입니다. 개봉된 카드는 교환·환불이 어렵습니다.',
	liveNoticeAddon: '라이브 개봉 서비스(팩당 2,000원)가 함께 담겼습니다. 팩 수량과 서비스 수량을 같게 맞춰 결제하면 방송에서 개봉한 뒤 카드를 배송합니다. 미개봉 배송을 원하면 서비스를 빼 주세요.',

	/* 포인트 : 관리자 > 적립금 설정의 구매 적립률과 같은 값으로 유지 (0.03 = 3%) */
	pointRate: 0.03,

	/* 매장 POS (/pos/index.html) */
	pos: {
		pin: '0000',                 /* 매장 화면 잠금 번호. 손님이 만지지 못하게 하는 용도이며 보안 장치는 아님 (이 파일은 공개됨) */
		storeName: 'PULLS 매장',
		payMethods: ['카드', '현금', '계좌이체', '포인트+카드', '기타'],
		cacheMinutes: 5              /* 상품 목록 캐시 (재고는 새로고침 버튼으로 즉시 갱신) */
	},

	/* 카드 개봉 화면 (/reveal/index.html) : 등급별 빌드업 영상 위치 + 파일 접미사
	   (디자인 FTP 가 mp4 확장자를 거부해 pulls-open-g1..6.mp4.jpg 로 올려 둠. 다른 호스팅으로 옮기면 여기만 바꾸면 된다) */
	reveal: { videoBase: '/video/', videoSuffix: '.mp4.jpg' },

	/* 메인 카테고리 타일 설명 (카테고리 이름에 키워드가 포함되면 적용) */
	tileDesc: [
		{ keyword: '라이브', desc: '방송에서 대신 개봉하고 카드를 배송' },
		{ keyword: '특별', desc: '한정 수량과 이벤트 상품' },
		{ keyword: '일반', desc: '미개봉 정품을 그대로 배송' }
	]
};

/* =========================================================
   공통 헬퍼 (nav / live / badges / hero / cartfx 에서 공유)
   ========================================================= */
window.TCG = (function () {
	'use strict';
	var mm = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
	return {
		/* DOM 준비 후 실행 */
		ready: function (fn) {
			if (document.readyState !== 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		},
		/* URL(또는 href)에서 카테고리 번호 (?cate_no=42, /category/name/42) */
		cateNo: function (url) {
			var m = /cate_no=(\d+)/.exec(url || '') || /\/category\/[^\/]+\/(\d+)/.exec(url || '');
			return m ? Number(m[1]) : 0;
		},
		/* 현재 페이지의 카테고리 번호 */
		currentCateNo: function () { return this.cateNo(location.pathname + location.search); },
		/* 현재 상세 페이지의 상품 번호 */
		currentProductNo: function () {
			var m = /product_no=(\d+)/.exec(location.search) || /\/product\/[^\/]+\/(\d+)\//.exec(location.pathname);
			return m ? Number(m[1]) : 0;
		},
		/* "12,000원" → 12000 */
		parsePrice: function (text) {
			var m = /([\d,]+)\s*원/.exec(text || '');
			return m ? Number(m[1].replace(/,/g, '')) : 0;
		},
		/* 12000 → "12,000" */
		fmt: function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); },
		/* 적립 예정 포인트 */
		points: function (price) {
			var rate = window.TCG_CONFIG && window.TCG_CONFIG.pointRate;
			return typeof rate === 'number' && price > 0 ? Math.floor(price * rate) : 0;
		},
		reduceMotion: mm('(prefers-reduced-motion: reduce)'),
		canHover: mm('(hover: hover)'),
		/* 요소 생성 / HTML 이스케이프 */
		el: function (tag, cls, html) {
			var n = document.createElement(tag);
			if (cls) n.className = cls;
			if (html != null) n.innerHTML = html;
			return n;
		},
		esc: function (s) {
			return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
		},
		/* 카페24 하위 카테고리 목록 (세션당 1회) → Promise<[{cate_no, parent_cate_no, name, param}]> (루트 = 1) */
		categories: function () {
			var KEY = 'tcg_subcate_v2';
			try { var c = sessionStorage.getItem(KEY); if (c) return Promise.resolve(JSON.parse(c)); } catch (e) {}
			if (!window.fetch) return Promise.reject(new Error('fetch unsupported'));
			return fetch('/exec/front/Product/SubCategory', { credentials: 'same-origin' })
				.then(function (r) { return r.json(); })
				.then(function (list) {
					list = (list || []).map(function (c) { return { cate_no: Number(c.cate_no), parent_cate_no: Number(c.parent_cate_no), name: c.name, param: c.param }; });
					try { sessionStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
					return list;
				});
		},
		/* 상품 카드(li#anchorBoxId_N, product/list_product.html) → {no, name, price, img, soldout} */
		cardInfo: function (li) {
			var desc = li.querySelector('.description');
			var nameA = li.querySelector('.name a');
			var name = '';
			if (nameA) { var clone = nameA.cloneNode(true); var t = clone.querySelector('.title'); if (t) t.remove(); name = clone.textContent.trim().replace(/\s+/g, ' '); }
			var price = desc ? Number(desc.getAttribute('ec-data-price') || 0) : 0;
			if (!price) {
				/* 검색 결과 등 ec-data-price가 없는 목록: 표시된 가격 텍스트에서 읽음 (취소선 소비자가 제외) */
				var pl = li.querySelector('.spec .is-price') || Array.prototype.filter.call(li.querySelectorAll('.spec li'), function (x) {
					return /원/.test(x.textContent) && !x.querySelector('[style*="line-through"]');
				})[0];
				price = pl ? this.parsePrice(pl.textContent) : 0;
			}
			var img = li.querySelector('.thumbnail img');
			return {
				no: Number((li.id || '').split('_')[1]) || 0,
				name: name,
				price: price,
				img: img ? (img.getAttribute('src') || '') : '',
				soldout: !!li.querySelector('.card__badges img[alt*="품절"], .card__badges img[src*="soldout"], .card__badges img[src*="sold_out"]')
			};
		}
	};
})();
