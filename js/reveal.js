/* =========================================================
   TCG STORE — 카드 개봉 화면 (/reveal/index.html)
   1) 시작 화면에서 팩을 탭 → 2) 등급별 빌드업 영상 → 3) 흰 화면에서 슬리브가 등급 빛을 내며 기다림 → 탭하면 찢고 카드가 올라옴
   결과(등급/상품)는 지금은 URL 로 받는다: ?g=2&name=...&price=...&img=...
   (실서비스에서는 뽑기 서버가 준 결과를 같은 형태로 넘기면 된다)
   ========================================================= */
(function () {
	'use strict';
	var TCG = window.TCG;
	var cfg = (window.TCG_CONFIG || {}).reveal || {};
	var VIDEO_BASE = cfg.videoBase || '/video/';
	var GRADES = {
		1: { name: 'WHITE', color: '#e9e9ee', soft: '#f4f4f7', label: 'Lv.1' },
		2: { name: 'BLUE', color: '#3f8cff', soft: '#9cc4ff', label: 'Lv.2' },
		3: { name: 'GREEN', color: '#2ec27e', soft: '#9df0c8', label: 'Lv.3' },
		4: { name: 'RED', color: '#ff4d3d', soft: '#ffb3aa', label: 'Lv.4' },
		5: { name: 'GOLD', color: '#ffc93d', soft: '#fff1b8', label: 'Lv.5' },
		6: { name: 'RAINBOW', color: '#ff6d9a', soft: '#ffd6e6', label: 'Lv.6', rainbow: true }
	};
	var q = new URLSearchParams(location.search);
	var result = {
		grade: Math.min(6, Math.max(1, Number(q.get('g')) || 2)),
		name: q.get('name') || '[일본판] 포켓몬 151 1PACK',
		price: Number(q.get('price')) || 0,
		img: q.get('img') || ''
	};
	var G = GRADES[result.grade];
	var $ = function (s) { return document.querySelector(s); };
	var start = $('#start'), videoStage = $('#videoStage'), video = $('#video'), videoBg = $('#videoBg'), stage = $('#stage'), card = $('#card'), inner = $('#cardInner');

	/* ---------- 등급 색 주입 ---------- */
	document.documentElement.style.setProperty('--g', G.color);
	document.documentElement.style.setProperty('--g-soft', G.soft);
	stage.classList.add('is-g' + result.grade);
	if (G.rainbow) stage.classList.add('is-rainbow');

	/* ---------- 영상 준비 ----------
	   카페24 디자인 FTP 는 확장자로 업로드를 거르므로(mp4/webm 거부) H.264 mp4 를 .mp4.jpg 이름으로 올려 둔다.
	   브라우저는 Content-Type 대신 파일 내용을 보고 재생한다. */
	function prepareVideo() {
		var src = '<source src="' + VIDEO_BASE + 'pulls-open-g' + result.grade + (cfg.videoSuffix || '.mp4.jpg') + '" type="video/mp4">';
		video.innerHTML = src; video.load();
		videoBg.innerHTML = src; videoBg.load();
	}
	/* 넓은 화면의 배경 영상은 본 영상과 같이 재생/정지 */
	function bgVisible() { return getComputedStyle(videoBg).display !== 'none'; }

	/* ---------- 흐름 ---------- */
	function playVideo() {
		start.classList.add('is-out');
		videoStage.hidden = false;
		var p = video.play();
		if (p && p.catch) p.catch(function () { showReveal(); });
		if (bgVisible()) { videoBg.currentTime = 0; var pb = videoBg.play(); if (pb && pb.catch) pb.catch(function () {}); }
		video.addEventListener('playing', function () { videoStage.classList.add('is-playing'); setTimeout(function () { start.hidden = true; }, 400); }, { once: true });
		video.addEventListener('ended', showReveal, { once: true });
		video.addEventListener('error', showReveal, { once: true });
	}
	function showReveal() {
		if (!stage.hidden) return;
		stage.hidden = false;
		videoStage.hidden = true; start.hidden = true;
		try { video.pause(); videoBg.pause(); } catch (e) {}
		/* 흰 화면 → 슬리브가 빛나며 대기 (사용자가 탭할 때까지) */
		requestAnimationFrame(function () { requestAnimationFrame(function () { stage.classList.add('is-open'); }); });
		setTimeout(function () { stage.classList.add('is-ready'); }, 900);
	}
	/* 탭 → 찢기 → 카드 등장 → 광택 → 정보 */
	function openCard() {
		if (!stage.classList.contains('is-ready') || stage.classList.contains('is-torn')) return;
		stage.classList.remove('is-ready');
		stage.classList.add('is-torn');
		setTimeout(function () { stage.classList.add('is-out'); }, 350);
		setTimeout(function () { stage.classList.add('is-shine'); }, 1000);
		setTimeout(bindTilt, 1600);
	}
	function reset() {
		stage.hidden = true;
		stage.className = 'rv-stage is-g' + result.grade + (G.rainbow ? ' is-rainbow' : '');
		card.classList.remove('is-flipped', 'is-tilting');
		start.hidden = false; start.classList.remove('is-out');
		videoStage.classList.remove('is-playing');
		video.currentTime = 0; videoBg.currentTime = 0;
	}

	/* ---------- 카드 틸트 / 뒤집기 ---------- */
	function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
	function tilt(rect, x, y, maxDeg) {
		var px = clamp((x - rect.left) / rect.width, 0, 1), py = clamp((y - rect.top) / rect.height, 0, 1);
		inner.style.setProperty('--ry', ((px - .5) * 2 * maxDeg).toFixed(2) + 'deg');
		inner.style.setProperty('--rx', ((.5 - py) * 2 * maxDeg).toFixed(2) + 'deg');
		card.style.setProperty('--mx', (px * 100).toFixed(1));
		card.style.setProperty('--my', (py * 100).toFixed(1));
	}
	function untilt() { inner.style.setProperty('--ry', '0deg'); inner.style.setProperty('--rx', '0deg'); }
	var tiltBound = false;
	function bindTilt() {
		if (tiltBound) return; tiltBound = true;
		var rect = null;
		if (TCG.canHover && !TCG.reduceMotion) {
			card.addEventListener('pointerenter', function () { rect = card.getBoundingClientRect(); card.classList.add('is-tilting'); });
			card.addEventListener('pointermove', function (e) { if (rect) tilt(rect, e.clientX, e.clientY, 14); });
			card.addEventListener('pointerleave', function () { rect = null; card.classList.remove('is-tilting'); untilt(); });
		} else {
			card.addEventListener('touchmove', function (e) { var t = e.touches[0]; if (t) { card.classList.add('is-tilting'); tilt(card.getBoundingClientRect(), t.clientX, t.clientY, 10); } }, { passive: true });
			card.addEventListener('touchend', function () { card.classList.remove('is-tilting'); untilt(); });
		}
		card.addEventListener('click', function () { card.classList.toggle('is-flipped'); });
	}

	/* ---------- 결과 표시 ---------- */
	function renderInfo() {
		$('#grade').innerHTML = '<i></i>' + G.label + ' · ' + G.name;
		$('#name').textContent = result.name;
		$('#meta').innerHTML = result.price ? '시세 <b>' + TCG.fmt(result.price) + '원</b>' : '';
		var img = $('#cardImg');
		if (result.img) { img.src = result.img; img.alt = result.name; }
		else img.remove();
	}

	TCG.ready(function () {
		document.title = 'PULLS 개봉';   /* 카페24가 <title>을 몰 이름으로 덮어씀 */
		renderInfo();
		prepareVideo();
		$('#startPack').addEventListener('click', playVideo);
		$('#btnSkip').addEventListener('click', showReveal);
		videoStage.addEventListener('click', function (e) { if (!e.target.closest('#btnSkip') && video.currentTime > 1) showReveal(); });
		$('#sleeve').addEventListener('click', openCard);
		$('#hint').addEventListener('click', openCard);
		document.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && stage.classList.contains('is-ready')) { e.preventDefault(); openCard(); } });
		$('#btnAgain').addEventListener('click', function () { reset(); setTimeout(playVideo, 50); });
		if (q.has('auto')) playVideo();
	});
})();
