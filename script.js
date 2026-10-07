// 捲動淡入
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(function (el) { io.observe(el); });
})();

// 封面輪播
(function () {
  var slides = document.querySelectorAll('.hero-slides .slide');
  if (slides.length < 2) return;
  var i = 0;
  setInterval(function () {
    slides[i].classList.remove('is-active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('is-active');
  }, 4500);
})();

// OUR DAY 倒數計時
(function () {
  var box = document.getElementById('countdown');
  if (!box) return;
  var target = new Date(box.getAttribute('data-target')).getTime();
  var el = {};
  box.querySelectorAll('[data-unit]').forEach(function (n) { el[n.getAttribute('data-unit')] = n; });
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
    el.d.textContent = Math.floor(diff / 86400);
    el.h.textContent = pad(Math.floor(diff % 86400 / 3600));
    el.m.textContent = pad(Math.floor(diff % 3600 / 60));
    el.s.textContent = pad(diff % 60);
    return diff;
  }
  if (tick() > 0) {
    var timer = setInterval(function () { if (tick() === 0) clearInterval(timer); }, 1000);
  }
})();

// 音樂播放器
(function () {
  var audio = document.getElementById('audio');
  var btn = document.getElementById('playBtn');
  var seek = document.getElementById('seek');
  var cur = document.getElementById('cur');
  var dur = document.getElementById('dur');
  if (!audio || !btn) return;

  function fmt(s) {
    if (!isFinite(s)) return '0:00';
    var m = Math.floor(s / 60);
    var r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  btn.addEventListener('click', function () {
    if (audio.paused) {
      audio.play().catch(function () {});
    } else {
      audio.pause();
    }
  });
  audio.addEventListener('play', function () { btn.classList.add('is-playing'); });
  audio.addEventListener('pause', function () { btn.classList.remove('is-playing'); });
  audio.addEventListener('ended', function () { btn.classList.remove('is-playing'); });
  audio.addEventListener('loadedmetadata', function () { dur.textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', function () {
    cur.textContent = fmt(audio.currentTime);
    if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 100;
  });
  seek.addEventListener('input', function () {
    if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
  });
})();
