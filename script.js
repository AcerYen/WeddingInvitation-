'use strict';
// The public page is entirely static. Audio only starts after an explicit click.
document.querySelectorAll('[data-start]').forEach(function (link) {
  link.addEventListener('click', function (event) {
    event.preventDefault();
    var player = document.querySelector('[data-anchor="music"]');
    if (player) player.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    var audio = document.getElementById('audio');
    if (audio) audio.play().catch(function () { /* Native controls remain available if playback is blocked. */ });
  });
});

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
