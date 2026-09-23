/* =========================================================
   PULLS 데모 — 표본 데이터 (실서비스에서는 서버 API 로 대체)
   ========================================================= */
window.PULLS_DATA = (function () {
	'use strict';

	/* 등급 : Lv.6 이 1등 */
	var GRADES = {
		6: { rank: '1등', label: 'Lv.6', name: 'RAINBOW', color: '#ff6d9a', rainbow: true },
		5: { rank: '2등', label: 'Lv.5', name: 'GOLD', color: '#ffc93d' },
		4: { rank: '3등', label: 'Lv.4', name: 'RED', color: '#ff4d3d' },
		3: { rank: '4등', label: 'Lv.3', name: 'GREEN', color: '#2ec27e' },
		2: { rank: '5등', label: 'Lv.2', name: 'BLUE', color: '#3f8cff' },
		1: { rank: '6등', label: 'Lv.1', name: 'WHITE', color: '#c9c9d2' }
	};

	/* 카드 카탈로그 (자리표시 이름) */
	var CARDS = {};
	/* pt = 확정 전환 포인트 (시세의 절반, 10pt 단위). 감정은 이 값의 ½ ~ 2배 사이에서 결정 */
	function card(id, grade, name, set, price) { CARDS[id] = { id: id, grade: grade, name: name, set: set, price: price, pt: Math.max(50, Math.round(price * 0.5 / 10) * 10) }; return id; }
	card('c601', 6, '리자몽 ex SAR', 'SV2a 151', 320000);
	card('c602', 6, '뮤 ex SAR', 'SV2a 151', 180000);
	card('c603', 6, '피카츄 ex SAR', 'SV2a 151', 120000);
	card('c604', 6, '루피 리더 파라렐', 'OP-12', 150000);
	card('c605', 6, '나미 SP 파라렐', 'OP-12', 260000);
	card('c606', 6, '이브이 ex SAR', 'SV8a', 95000);
	card('c501', 5, '리자몽 ex SR', 'SV2a 151', 42000);
	card('c502', 5, '뮤츠 ex SR', 'SV2a 151', 28000);
	card('c503', 5, '에리카의 초대 SAR', 'SV2a 151', 60000);
	card('c504', 5, '샹크스 SR 파라렐', 'OP-12', 38000);
	card('c505', 5, '조로 SR', 'OP-12', 16000);
	card('c506', 5, '갸라도스 ex SR', 'SV8a', 14000);
	card('c401', 4, '뮤 ex RR', 'SV2a 151', 6000);
	card('c402', 4, '피카츄 ex RR', 'SV2a 151', 4500);
	card('c403', 4, '푸린 AR', 'SV2a 151', 5200);
	card('c404', 4, '루피 SR', 'OP-12', 5800);
	card('c405', 4, '에이스 R 파라렐', 'OP-12', 7000);
	card('c406', 4, '뮤츠 ex RR', 'SV8a', 3800);
	card('c301', 3, '이상해꽃 ex RR', 'SV2a 151', 1800);
	card('c302', 3, '파이리 AR', 'SV2a 151', 2400);
	card('c303', 3, '꼬부기 AR', 'SV2a 151', 2200);
	card('c304', 3, '상디 R', 'OP-12', 1200);
	card('c305', 3, '로빈 R', 'OP-12', 1500);
	card('c306', 3, '망나뇽 ex RR', 'SV8a', 1900);
	card('c201', 2, '이브이 R', 'SV2a 151', 500);
	card('c202', 2, '잠만보 R', 'SV2a 151', 600);
	card('c203', 2, '캐터피 홀로', 'SV2a 151', 300);
	card('c204', 2, '우솝 UC 홀로', 'OP-12', 400);
	card('c205', 2, '쵸파 UC 홀로', 'OP-12', 450);
	card('c206', 2, '메타몽 R', 'SV8a', 550);
	card('c101', 1, '구구 C', 'SV2a 151', 100);
	card('c102', 1, '꼬렛 C', 'SV2a 151', 100);
	card('c103', 1, '코일 C', 'SV2a 151', 100);
	card('c104', 1, '해군 병사 C', 'OP-12', 100);
	card('c105', 1, '몽키 C', 'OP-12', 100);
	card('c106', 1, '수리검 트레이너즈', 'SV8a', 100);


	/* 오리파 : prizes = { 등급: { count, cards[] } } */
	var ORIPAS = [
		{ id: 'op151', title: '151 SAR 챌린지', sub: '포켓몬 151 · SAR 확정 구간 포함', price: 1000, total: 500, tag: 'HOT', cover: 'assets/pkm151_pack.jpg',
			prizes: { 6: { count: 3, cards: ['c601', 'c602', 'c603'] }, 5: { count: 12, cards: ['c501', 'c502', 'c503'] }, 4: { count: 40, cards: ['c401', 'c402', 'c403'] }, 3: { count: 95, cards: ['c301', 'c302', 'c303'] }, 2: { count: 150, cards: ['c201', 'c202', 'c203'] }, 1: { count: 200, cards: ['c101', 'c102', 'c103'] } },
			last: { card: 'c606', note: '마지막 1구를 뽑은 분께 라스트원 상' } },
		{ id: 'opgold', title: '테라스탈 골드 오리파', sub: 'SR 이상만 2등 구간에 집중 배치', price: 2000, total: 300, tag: 'NEW', cover: 'assets/asc_pack.jpg',
			prizes: { 6: { count: 2, cards: ['c606', 'c603'] }, 5: { count: 15, cards: ['c506', 'c501', 'c502'] }, 4: { count: 30, cards: ['c406', 'c402'] }, 3: { count: 63, cards: ['c306', 'c301'] }, 2: { count: 90, cards: ['c206', 'c201'] }, 1: { count: 100, cards: ['c106', 'c101'] } } },
		{ id: 'opop12', title: 'OP-12 리더 파라렐 오리파', sub: '원피스 카드게임 · 파라렐 3종', price: 1500, total: 400, cover: 'assets/op12_pack.jpg',
			prizes: { 6: { count: 3, cards: ['c604', 'c605'] }, 5: { count: 10, cards: ['c504', 'c505'] }, 4: { count: 32, cards: ['c404', 'c405'] }, 3: { count: 75, cards: ['c304', 'c305'] }, 2: { count: 120, cards: ['c204', 'c205'] }, 1: { count: 160, cards: ['c104', 'c105'] } } },
		{ id: 'st-hd-a', title: '프리미엄 100구 오리파', sub: '적은 구수 · 높은 상위 등급 비율', price: 3000, total: 100, cover: 'assets/pkm151_box.jpg',
			prizes: { 6: { count: 1, cards: ['c601'] }, 5: { count: 4, cards: ['c503', 'c501'] }, 4: { count: 10, cards: ['c401', 'c403'] }, 3: { count: 20, cards: ['c302', 'c303'] }, 2: { count: 30, cards: ['c201', 'c202'] }, 1: { count: 35, cards: ['c101', 'c102'] } } },
		{ id: 'st-gn-b', title: 'OP-12 라이트 오리파', sub: '원피스 · 1,000pt 부담 없는 구성', price: 1000, total: 200, cover: 'assets/op12_pack.jpg',
			prizes: { 6: { count: 1, cards: ['c605'] }, 5: { count: 6, cards: ['c504'] }, 4: { count: 18, cards: ['c404', 'c405'] }, 3: { count: 40, cards: ['c304', 'c305'] }, 2: { count: 60, cards: ['c204', 'c205'] }, 1: { count: 75, cards: ['c104', 'c105'] } } },
		{ id: 'opdaily', title: '500 데일리 오리파', sub: '가볍게 즐기는 저가 구성 · 상위 등급 없음', price: 500, total: 1000, cover: 'assets/pkm151_pack.jpg',
			prizes: { 4: { count: 20, cards: ['c402', 'c406'] }, 3: { count: 120, cards: ['c301', 'c306'] }, 2: { count: 360, cards: ['c203', 'c206'] }, 1: { count: 500, cards: ['c103', 'c106'] } } }
	];

	/* 박스 · 팩 · 싱글 (정가 판매) */
	var PRODUCTS = [
		{ id: 'p1', type: 'box', name: '[일본판] 포켓몬 151 BOX', price: 128000, img: 'assets/pkm151_box.jpg', stock: 6, desc: '20팩 · 미개봉 정품 · 슈링크 포함' },
		{ id: 'p2', type: 'pack', name: '[일본판] 포켓몬 151 1PACK', price: 6000, img: 'assets/pkm151_pack.jpg', stock: 120, desc: '7장 · 미개봉 정품' },
		{ id: 'p3', type: 'pack', name: '[일본판] 원피스 OP-12 1PACK', price: 5000, img: 'assets/op12_pack.jpg', stock: 80, desc: '6장 · 미개봉 정품' },
		{ id: 'p4', type: 'box', name: '[일본판] 원피스 OP-12 BOX', price: 98000, img: 'assets/op12_pack.jpg', stock: 3, desc: '24팩 · 미개봉 정품' },
		{ id: 'p5', type: 'pack', name: '[북미판] 포켓몬 어센디드 히어로즈 1PACK', price: 8500, img: 'assets/asc_pack.jpg', stock: 40, desc: '10장 · 영문판' },
		{ id: 'p6', type: 'box', name: '[북미판] 어센디드 히어로즈 부스터 번들', price: 52000, img: 'assets/asc_pack.jpg', stock: 0, desc: '6팩 · 영문판' },
		{ id: 'p7', type: 'single', name: '리자몽 ex SR 185/165 (PSA 10)', price: 89000, card: 'c501', stock: 1, desc: 'PSA 10 · 케이스 포함' },
		{ id: 'p8', type: 'single', name: '에리카의 초대 SAR 196/165', price: 61000, card: 'c503', stock: 2, desc: 'NM · 슬리브 보관' }
	];

	/* 자랑 게시판 표본 */
	var POSTS = [
		{ id: 'b1', author: '카드깡장인', card: 'c601', title: '151 오리파 3번째에 리자몽 SAR 떴습니다', body: '점심시간에 가볍게 3연차 돌렸는데 1등이 바로 나왔어요. 손 떨려서 사진이 흔들렸습니다.', likes: 214, at: '2026-09-20T12:10:00', comments: [{ author: '뽑기초보', text: '축하드려요 진짜 부럽네요', at: '2026-09-20T12:30:00' }, { author: 'TCG형', text: '이건 감정 말고 그냥 보관이죠', at: '2026-09-20T13:02:00' }] },
		{ id: 'b2', author: '홍대점단골', card: 'c605', title: 'OP-12 오리파에서 나미 SP 파라렐', body: '5연차 마지막 장에서 떴습니다. 매장 수령으로 신청해서 다음 날 바로 받아왔어요.', likes: 158, at: '2026-09-19T19:40:00', comments: [{ author: '원피스러', text: '나미 SP는 진짜 시세 미쳤죠', at: '2026-09-19T20:00:00' }] },
		{ id: 'b3', author: '골드러시', card: 'c503', title: '에리카 SAR 감정 넣었더니 최대치 떴어요', body: '감정 게이지가 끝까지 올라가는 거 처음 봤습니다. 25,000pt 환급 받고 바로 골드 오리파 재도전.', likes: 97, at: '2026-09-19T09:12:00', comments: [] },
		{ id: 'b4', author: '조로덕후', card: 'c504', title: '샹크스 SR 파라렐 인증', body: 'OP-12 오리파 10연차 결과입니다. 2등 하나, 3등 둘.', likes: 61, at: '2026-09-18T22:05:00', comments: [{ author: '카드깡장인', text: '10연차 가성비 좋네요', at: '2026-09-18T22:40:00' }] },
		{ id: 'b5', author: '주말뽑기', card: 'c403', title: '푸린 AR 이거 은근 예쁘네요', body: '3등이지만 일러스트가 마음에 들어서 보관하기로 했습니다.', likes: 33, at: '2026-09-18T15:30:00', comments: [] },
		{ id: 'b6', author: '입문자', card: 'c302', title: '첫 오리파 첫 뽑기 파이리 AR', body: '처음이라 뭐가 좋은지 모르겠는데 색이 예뻐서 올려봅니다.', likes: 18, at: '2026-09-17T11:00:00', comments: [{ author: '카드깡장인', text: 'AR이면 잘 뽑으신 거예요', at: '2026-09-17T11:20:00' }] }
	];

	/* 직거래 장터 표본 */
	var MARKET = [
		{ id: 'm1', type: 'sell', author: '카드깡장인', card: 'c502', title: '뮤츠 ex SR 판매합니다', price: 27000, area: '서울 마포', body: 'NM 상태, 뽑자마자 슬리브. 홍대 직거래 선호.', status: 'open', at: '2026-09-20T14:00:00' },
		{ id: 'm2', type: 'buy', author: '원피스러', card: 'c604', title: '루피 리더 파라렐 구합니다', price: 140000, area: '경기 성남', body: '상태 좋은 것만 구합니다. 가격 협의 가능.', status: 'open', at: '2026-09-20T10:30:00' },
		{ id: 'm3', type: 'sell', author: '골드러시', card: 'c405', title: '에이스 R 파라렐 2장 일괄', price: 12000, area: '서울 강남', body: '2장 일괄 12,000. 강남점 근처 직거래.', status: 'open', at: '2026-09-19T21:10:00' },
		{ id: 'm4', type: 'sell', author: '주말뽑기', card: 'c301', title: '이상해꽃 ex RR', price: 1500, area: '부산 해운대', body: '동봉 우편 가능.', status: 'done', at: '2026-09-18T17:45:00' },
		{ id: 'm5', type: 'buy', author: '입문자', card: 'c201', title: '이브이 R 구합니다 (아무 상태)', price: 400, area: '대구 수성', body: '입문용으로 구합니다.', status: 'open', at: '2026-09-18T09:00:00' },
		{ id: 'm6', type: 'sell', author: '홍대점단골', card: 'c506', title: '갸라도스 ex SR 판매', price: 13000, area: '서울 마포', body: '홍대점 앞에서 직거래만.', status: 'open', at: '2026-09-17T13:20:00' }
	];

	/* 공지 · 이벤트 · FAQ */
	var NOTICES = [
		{ id: 'n1', type: 'notice', title: '온라인 오리파 등급별 환급(감정) 안내', at: '2026-09-15', body: '뽑은 카드는 배송 대신 감정 요청으로 포인트 환급이 가능합니다. 환급 포인트는 등급별 범위 안에서 결정되며, 감정이 확정되면 카드는 소각 처리되고 취소할 수 없습니다.' },
		{ id: 'n2', type: 'notice', title: '뽑은 카드 매장 수령 안내', at: '2026-09-10', body: '온라인에서 뽑은 카드는 배송 대신 매장 수령을 선택할 수 있습니다. 보관함에서 매장 수령을 신청하면 회원 이름과 신청 번호로 매장에서 바로 받을 수 있습니다.' },
		{ id: 'n3', type: 'notice', title: '추석 연휴 배송 일정', at: '2026-09-08', body: '9월 24일부터 27일까지 접수된 배송 신청은 9월 28일부터 순차 발송됩니다.' },
		{ id: 'n4', type: 'notice', title: '위탁 판매 수수료 안내', at: '2026-09-01', body: '위탁 판매 수수료는 판매가의 10%이며 정산은 판매 확정 후 3영업일 이내 포인트 또는 계좌로 지급됩니다.' },
		{ id: 'e1', type: 'event', title: '오픈 기념 첫 충전 10% 보너스', at: '2026-09-15', body: '첫 포인트 충전 시 충전 금액의 10%를 보너스 포인트로 드립니다.' },
		{ id: 'e2', type: 'event', title: '자랑 게시판 주간 베스트 3 선정', at: '2026-09-12', body: '매주 월요일 좋아요 상위 3개 게시글에 5,000pt를 드립니다.' },
		{ id: 'f1', type: 'faq', title: '포인트는 어떻게 충전하나요?', body: '마이페이지 또는 상단 포인트 버튼에서 충전합니다. 네이버페이, 카카오페이, 토스페이, 신용카드, 계좌입금을 지원합니다.' },
		{ id: 'f2', type: 'faq', title: '뽑은 카드는 언제 받을 수 있나요?', body: '보관함에서 배송 신청을 하면 영업일 기준 2~3일 내 발송됩니다. 여러 장을 모아 한 번에 신청하면 배송비가 한 번만 부과됩니다.' },
		{ id: 'f3', type: 'faq', title: '감정(환급) 포인트는 어떻게 정해지나요?', body: '등급별 최소~최대 범위 안에서 감정 결과에 따라 결정됩니다. 결과는 즉시 확인할 수 있으며 확정 후에는 취소되지 않습니다.' },
		{ id: 'f4', type: 'faq', title: '오리파 확률은 어디서 볼 수 있나요?', body: '오리파 상세 페이지에서 등급별 총 수량과 남은 수량, 확률을 실시간으로 표시합니다.' },
		{ id: 'f5', type: 'faq', title: '직거래 장터에서 사기를 당하면 어떻게 하나요?', body: '장터는 회원 간 직거래를 연결하는 공간이며 PULLS는 거래 당사자가 아닙니다. 대면 거래와 안전결제 이용을 권장하며, 신고 접수 시 해당 회원의 이용을 제한합니다.' }
	];

	var TERMS = '제1조 (목적) 이 약관은 PULLS(이하 "회사")가 제공하는 온라인 트레이딩카드 판매 및 오리파 서비스의 이용 조건을 정합니다.\n\n제2조 (포인트) 포인트는 충전 후 서비스 내에서만 사용할 수 있으며, 미사용 포인트는 관련 법령에 따라 환불할 수 있습니다.\n\n제3조 (오리파) 오리파는 등급별 수량과 확률을 사전에 고지하며, 뽑기 결과는 취소·교환할 수 없습니다.\n\n제4조 (감정 환급) 감정 요청으로 확정된 포인트는 즉시 지급되며 카드는 회사에 귀속됩니다.\n\n제5조 (커뮤니티) 자랑 게시판과 장터는 회원 간 소통 공간이며 회사는 회원 간 거래에 개입하지 않습니다.';
	var PRIVACY = '1. 수집 항목: 이름, 연락처, 배송지, 결제 기록, 서비스 이용 기록\n2. 수집 목적: 주문 처리와 배송, 포인트 관리, 고객 문의 대응, 부정 이용 방지\n3. 보유 기간: 회원 탈퇴 시까지 (전자상거래법에 따른 거래 기록은 5년)\n4. 제3자 제공: 배송사(택배), 결제대행사(PG)에 한해 목적 범위 내 제공\n5. 이용자의 권리: 열람·정정·삭제·처리정지 요구 가능\n\n※ 데모 사이트는 어떤 개인정보도 서버로 전송하지 않으며 모든 데이터는 이 브라우저 안에만 저장됩니다.';

	return { GRADES: GRADES, CARDS: CARDS, ORIPAS: ORIPAS, PRODUCTS: PRODUCTS, POSTS: POSTS, MARKET: MARKET, NOTICES: NOTICES, TERMS: TERMS, PRIVACY: PRIVACY };
})();
