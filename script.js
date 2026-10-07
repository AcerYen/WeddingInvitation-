'use strict';
// The public page is entirely static. Audio only starts after an explicit click.
document.querySelectorAll('[data-start]').forEach(function (link) {
  link.addEventListener('click', function (event) {
    event.preventDefault();
    // The source link targets the music section, not the player within it.
    var section = document.querySelector('[data-anchor="music"]');
    if (section) section.scrollIntoView({block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    var audio = document.getElementById('audio');
    if (audio) audio.play().catch(function () { /* The play button remains available if playback is blocked. */ });
  });
});

// Keep the original cover, typography and control colors without Wix dependencies.
(function () {
  var audio = document.getElementById('audio');
  var controls = document.querySelector('.invitation-controls');
  if (!audio || !controls) return;
  var play = controls.querySelector('[data-audio-play]');
  var seek = controls.querySelector('[data-audio-seek]');
  var mute = controls.querySelector('[data-audio-mute]');
  var volume = controls.querySelector('[data-audio-volume]');
  var time = controls.querySelector('[data-audio-time]');
  var status = controls.querySelector('[data-audio-status]');
  function formatTime(seconds) {
    seconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  }
  function syncPlayback() {
    var playing = !audio.paused && !audio.ended;
    play.setAttribute('aria-label', playing ? '暫停音樂' : '播放音樂');
    play.querySelector('.playIcon').toggleAttribute('hidden', playing);
    play.querySelector('.pauseIcon').toggleAttribute('hidden', !playing);
  }
  function syncProgress() {
    var duration = audio.duration;
    var ready = Number.isFinite(duration) && duration > 0;
    seek.disabled = !ready;
    seek.value = ready ? Math.min(100, audio.currentTime / duration * 100) : 0;
    seek.style.setProperty('--seek-progress', seek.value + '%');
    seek.setAttribute('aria-valuetext', formatTime(audio.currentTime) + ' / ' + formatTime(duration));
    time.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(duration);
  }
  function syncVolume() {
    var muted = audio.muted || audio.volume === 0;
    mute.setAttribute('aria-label', muted ? '取消靜音' : '靜音');
    mute.setAttribute('aria-pressed', String(muted));
    mute.querySelector('.invitation-mute-mark').hidden = !muted;
    volume.value = audio.volume;
  }
  play.addEventListener('click', function () {
    if (!audio.paused) { audio.pause(); return; }
    status.textContent = '';
    audio.play().catch(function () { status.textContent = '無法播放，請再按一次播放。'; });
  });
  seek.addEventListener('input', function () {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = Number(seek.value) / 100 * audio.duration;
      syncProgress();
    }
  });
  mute.addEventListener('click', function () {
    if (audio.volume === 0) { audio.volume = 1; audio.muted = false; }
    else audio.muted = !audio.muted;
    syncVolume();
  });
  volume.addEventListener('input', function () {
    audio.volume = Number(volume.value);
    audio.muted = audio.volume === 0;
    syncVolume();
  });
  ['play', 'pause', 'ended'].forEach(function (event) { audio.addEventListener(event, syncPlayback); });
  ['loadedmetadata', 'durationchange', 'timeupdate', 'ended'].forEach(function (event) { audio.addEventListener(event, syncProgress); });
  audio.addEventListener('volumechange', syncVolume);
  audio.addEventListener('error', function () { status.textContent = '音樂載入失敗，請重新整理頁面。'; });
  syncPlayback(); syncProgress(); syncVolume();
  controls.hidden = false;
  audio.controls = false;
  audio.hidden = true;
})();

// Reuse the source CSS entrance animations without the Wix interaction engine.
(function () {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.style.animationPlayState = 'running';
      el.addEventListener('animationend', function () { el.setAttribute('data-motion-enter', 'done'); el.style.animationPlayState = ''; }, {once:true});
      observer.unobserve(el);
    });
  }, {threshold:0.05});
  ["comp-mus6gta2", "comp-mus6i0w2", "comp-mus798x4", "comp-musktat0", "comp-musl07zl", "comp-musl1ixt", "comp-musl32vz", "comp-musl3826", "comp-musl63c1", "comp-musltcyg", "comp-muspmq2r", "comp-muspzbfr", "comp-musq0ayy", "comp-musrmtoh", "comp-mussjam7", "comp-must2nze", "comp-mutecurr", "comp-muteecbf", "comp-mutgg02x", "comp-mutisc1o", "comp-mutisy6v", "comp-mutitg5b", "comp-mutj4dou", "comp-mutj57kj", "comp-mutj5kms", "comp-mutj5tcd", "comp-mutj7ptl", "comp-mutj8qqg", "comp-mutji18s", "comp-mutjiniy", "comp-mutjj57d", "comp-mutjjlcv", "comp-mutke7tn", "comp-mutkfbwy", "comp-mutshhk0", "comp-mutsj86w", "comp-muvg0h98", "comp-muvg4ldo", "comp-muvgkhxo"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.removeAttribute('data-motion-enter');
    if (getComputedStyle(el).animationName.indexOf('motion-') < 0) { el.setAttribute('data-motion-enter', 'done'); return; }
    observer.observe(el);
  });
})();
