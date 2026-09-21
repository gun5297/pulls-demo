/* PULLS 개봉 데모 : 팩 선택 → 등급 무작위(데모용 가중치) → 개봉 화면
   PC 에서는 frame.html 의 폰 프레임 안에서, 폰에서는 바로 open.html 을 연다 */
(function () {
	'use strict';
	var PACKS = {
		pkm151: { name: '[일본판] 포켓몬 151 1PACK', price: 6000 },
		op12: { name: '[일본판] 원피스 OP-12 1PACK', price: 5000 },
		asc: { name: '[북미판] 포켓몬 어센디드 히어로즈 1PACK', price: 8500 }
	};
	/* 데모용 등급 분포 (시연에서 상위 등급이 자주 나오도록) */
	var WEIGHTS = { 1: 20, 2: 25, 3: 20, 4: 15, 5: 12, 6: 8 };
	var GRADES = [
		{ g: 1, name: 'WHITE', c: '#e9e9ee' }, { g: 2, name: 'BLUE', c: '#3f8cff' }, { g: 3, name: 'GREEN', c: '#2ec27e' },
		{ g: 4, name: 'RED', c: '#ff4d3d' }, { g: 5, name: 'GOLD', c: '#ffc93d' }, { g: 6, name: 'RAINBOW', c: '#ff8bb8' }
	];
	function randomGrade() {
		var total = 0, k; for (k in WEIGHTS) total += WEIGHTS[k];
		var r = Math.random() * total;
		for (k in WEIGHTS) { r -= WEIGHTS[k]; if (r <= 0) return Number(k); }
		return 1;
	}
	/* 연출 스타일 : 시네마틱(3D + 실사 캡슐) / 애니메이션(AI 애니 캡슐, 지금은 Lv.6 만) */
	var STYLE_NOTE = { cinematic: '차분하고 고급스러운 3D 연출. 모든 등급 지원', anime: '트레이너가 캡슐을 던져 정령을 잡는 애니메이션 연출. 지금은 Lv.6 무지개에만 적용, 나머지 등급은 시네마틱으로 재생' };
	var style = 'cinematic';
	try { style = localStorage.getItem('pulls_demo_style') || style; } catch (e) {}
	function setStyle(v) {
		style = v; try { localStorage.setItem('pulls_demo_style', v); } catch (e) {}
		document.querySelectorAll('#styleSeg .btn').forEach(function (b) { b.classList.toggle('is-on', b.dataset.style === v); });
		document.getElementById('styleNote').textContent = STYLE_NOTE[v] || '';
	}
	document.getElementById('styleSeg').addEventListener('click', function (e) { var b = e.target.closest('.btn'); if (b) setStyle(b.dataset.style); });
	setStyle(style);
	function openUrl(packId, grade) {
		var p = PACKS[packId] || PACKS.pkm151;
		var q = new URLSearchParams({ g: grade, s: style, name: p.name, price: p.price, img: 'assets/cards/g' + grade + '.png' });
		var url = 'open.html?' + q.toString();
		return innerWidth >= 900 ? 'frame.html#' + encodeURIComponent(url) : url;
	}
	document.querySelectorAll('.dm-pack').forEach(function (card) {
		card.querySelector('.dm-open').addEventListener('click', function () { location.href = openUrl(card.dataset.pack, randomGrade()); });
	});
	var list = document.getElementById('gradeList');
	GRADES.forEach(function (gr) {
		var b = document.createElement('button');
		b.type = 'button'; b.className = 'dm-grade dm-grade--' + gr.g; b.style.setProperty('--c', gr.c);
		b.innerHTML = '<i></i>Lv.' + gr.g + ' ' + gr.name;
		b.addEventListener('click', function () { location.href = openUrl('pkm151', gr.g); });
		list.appendChild(b);
	});
})();
