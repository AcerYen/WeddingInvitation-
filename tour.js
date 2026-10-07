'use strict';
(function () {
  var dock = document.querySelector('[data-invitation-dock]');
  if (!dock) return;
  var toggle = dock.querySelector('[data-tour-toggle]');
  var music = dock.querySelector('[data-music-toggle]');
  var audio = document.getElementById('audio');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var running = false, finished = false, cancelled = false, started = false;
  var frame = 0, lastTime = null, position = window.scrollY, zones = [];
  var height = 0, initialTimer = 0, retryMusic = false, pendingMusic = false;
  var root = document.documentElement;

  function measure() {
    height = root.scrollHeight;
    zones = Array.from(document.querySelectorAll('main > section')).map(function (section) {
      var rect = section.getBoundingClientRect();
      var text = Array.from(section.querySelectorAll('p,h1,h2,h3')).map(function (el) { return el.textContent; }).join(' ');
      var chinese = (text.match(/[\u3400-\u9fff]/g) || []).length;
      var words = (text.match(/[A-Za-z]+/g) || []).length;
      // Reading pace is a tunable design default, not a measurement of each guest.
      var seconds = Math.max(rect.height / Math.max(1, window.innerHeight) * 18, chinese / 4 + words / 3 + 6);
      return {top:rect.top + window.scrollY, bottom:rect.bottom + window.scrollY, speed:Math.max(12, Math.min(55, rect.height / seconds))};
    }).filter(function (zone) { return zone.bottom > zone.top; });
  }
  function render() {
    toggle.textContent = finished ? '導覽完成' : running ? '暫停導覽' : '繼續導覽';
    toggle.setAttribute('aria-label', running ? '暫停自動捲動' : '繼續自動捲動');
    toggle.disabled = finished;
  }
  function stop() {
    running = false;
    lastTime = null;
    cancelAnimationFrame(frame);
    root.classList.remove('invitation-touring');
    render();
  }
  function pauseByUser() {
    cancelled = true;
    clearTimeout(initialTimer);
    stop();
  }
  function tick(time) {
    if (!running) return;
    if (document.hidden) { lastTime = null; frame = requestAnimationFrame(tick); return; }
    if (height !== root.scrollHeight) measure();
    var bottom = Math.max(0, root.scrollHeight - window.innerHeight);
    if (position >= bottom - 1) {
      window.scrollTo({top:bottom, behavior:'instant'});
      finished = true; stop(); return;
    }
    var dt = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;
    var readingLine = position + window.innerHeight * 0.35;
    var zone = zones.find(function (item) { return readingLine >= item.top && readingLine < item.bottom; });
    var speed = zone ? zone.speed : Math.max(12, Math.min(55, window.innerHeight / 18));
    position = Math.min(bottom, position + speed * dt);
    window.scrollTo({top:position, behavior:'instant'});
    frame = requestAnimationFrame(tick);
  }
  function start() {
    if (running) return;
    measure();
    position = window.scrollY;
    finished = false; running = true; lastTime = null;
    root.classList.add('invitation-touring');
    render(); frame = requestAnimationFrame(tick);
  }
  toggle.addEventListener('click', function () {
    cancelled = true; clearTimeout(initialTimer);
    if (running) stop(); else start();
  });
  window.addEventListener('wheel', pauseByUser, {passive:true});
  window.addEventListener('touchmove', pauseByUser, {passive:true});
  document.addEventListener('pointerdown', function (event) {
    var editing = event.target.closest('input,textarea,select,iframe,a,[contenteditable="true"]');
    var scrollbar = event.clientX >= root.clientWidth;
    if (!dock.contains(event.target) && (editing || scrollbar)) pauseByUser();
  }, {passive:true});
  document.addEventListener('keydown', function (event) {
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].indexOf(event.key) >= 0) pauseByUser();
  });
  document.addEventListener('focusin', function (event) {
    if (event.target.matches('input,textarea,select,iframe,[contenteditable="true"]')) pauseByUser();
  });
  // Focus entering an embedded RSVP form is reported as the iframe becoming active.
  window.addEventListener('blur', function () {
    if (document.activeElement && document.activeElement.tagName === 'IFRAME') pauseByUser();
  });
  document.addEventListener('visibilitychange', function () { lastTime = null; });
  window.addEventListener('resize', function () { measure(); position = window.scrollY; lastTime = null; });
  function motionPreferenceChanged() { if (reducedMotion.matches) pauseByUser(); }
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', motionPreferenceChanged);

  function renderMusic() {
    if (!audio) { music.hidden = true; return; }
    var playing = !audio.paused && !audio.ended;
    music.textContent = playing ? '暫停音樂' : retryMusic ? '點此播放音樂' : '播放音樂';
    music.setAttribute('aria-label', playing ? '暫停音樂' : '播放音樂');
  }
  function playMusic() {
    if (!audio || pendingMusic) return;
    pendingMusic = true;
    // Invoke synchronously so a click can satisfy the browser's user activation policy.
    audio.play().then(function () { pendingMusic = false; retryMusic = false; renderMusic(); }).catch(function (error) {
      pendingMusic = false;
      retryMusic = error.name === 'NotAllowedError';
      if (!retryMusic && error.name !== 'AbortError') music.textContent = '音樂載入失敗';
      else renderMusic();
    });
  }
  music.addEventListener('click', function () {
    retryMusic = false;
    if (audio && !audio.paused) audio.pause(); else playMusic();
  });
  document.addEventListener('click', function (event) {
    if (retryMusic && !event.target.closest('button,input,textarea,select,a')) playMusic();
  });
  if (audio) {
    ['play','pause','ended'].forEach(function (event) { audio.addEventListener(event, function () {
      retryMusic = false; renderMusic();
    }); });
    playMusic();
  }
  dock.hidden = false; render(); renderMusic();
  function ready() {
    if (started) return;
    started = true;
    initialTimer = setTimeout(function () {
      if (!cancelled && !reducedMotion.matches && !window.location.hash && window.scrollY < 10) start();
    }, 2500);
  }
  if (document.readyState === 'complete') ready();
  else { window.addEventListener('load', ready, {once:true}); setTimeout(ready, 4500); }
})();
