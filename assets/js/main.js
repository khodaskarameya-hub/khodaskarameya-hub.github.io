/* Progressive enhancements only: every piece of content is in the HTML and visible without this file. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;

  /* Layout grid toggle: button + "G" shortcut */
  var gridBtn = d.querySelector('.grid-toggle');
  function setGrid(on) {
    root.classList.toggle('show-grid', on);
    if (gridBtn) gridBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  if (gridBtn) gridBtn.addEventListener('click', function () { setGrid(!root.classList.contains('show-grid')); });
  d.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (d.querySelector('dialog[open]')) return;
    if (e.key === 'g' || e.key === 'G') setGrid(!root.classList.contains('show-grid'));
  });

  /* Mobile menu: close after choosing a link, or on Escape */
  var menu = d.querySelector('.menu');
  if (menu) {
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) menu.removeAttribute('open'); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.hasAttribute('open')) { menu.removeAttribute('open'); menu.querySelector('summary').focus(); }
    });
    d.addEventListener('click', function (e) { if (menu.hasAttribute('open') && !menu.contains(e.target)) menu.removeAttribute('open'); });
  }

  /* Copy email */
  Array.prototype.forEach.call(d.querySelectorAll('.copy'), function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var label = btn.querySelector('span');
      var done = function () { label.textContent = 'Copied'; setTimeout(function () { label.textContent = 'Copy address'; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { label.textContent = 'Select and copy'; });
      else label.textContent = 'Select and copy';
    });
  });

  /* Case study contents: highlight the section being read */
  var tocLinks = Array.prototype.slice.call(d.querySelectorAll('.x-toc a'));
  if (tocLinks.length) {
    var secs = tocLinks.map(function (a) { return d.getElementById(a.getAttribute('href').slice(1)); });
    var ticking = false;
    var mark = function () {
      ticking = false;
      var line = window.innerHeight * 0.33, idx = 0;
      secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) idx = i; });
      tocLinks.forEach(function (a, i) { a.classList.toggle('on', i === idx); });
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(mark); } }, { passive: true });
    mark();
  }

  /* Case study galleries: open images in a lightbox (links still open the file without JS) */
  var links = Array.prototype.slice.call(d.querySelectorAll('.gallery a, .strip a'));
  if (!links.length || typeof HTMLDialogElement !== 'function') return;

  var box = d.createElement('dialog');
  box.className = 'lightbox';
  box.setAttribute('aria-label', 'Image viewer');
  box.innerHTML =
    '<div class="lb-bar"><span class="label lb-count"></span><div class="lb-btns">' +
    '<button class="btn lb-prev" type="button" aria-label="Previous image">&larr; Prev</button>' +
    '<button class="btn lb-next" type="button" aria-label="Next image">Next &rarr;</button>' +
    '<button class="btn btn-ink lb-close" type="button" aria-label="Close image viewer">Close</button>' +
    '</div></div><img alt="">';
  d.body.appendChild(box);
  var img = box.querySelector('img');
  var count = box.querySelector('.lb-count');
  var index = 0;

  function show(i) {
    index = (i + links.length) % links.length;
    var a = links[index];
    var thumb = a.querySelector('img');
    img.src = a.getAttribute('href');
    img.alt = thumb ? thumb.alt : '';
    count.textContent = (index + 1) + ' / ' + links.length;
  }
  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      show(i);
      box.showModal();
    });
  });
  box.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });
  box.querySelector('.lb-close').addEventListener('click', function () { box.close(); });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
})();
/* Case studies: gentle reveal as sections scroll into view (skipped for reduced motion). */
(function () {
  'use strict';
  if (!document.body.classList.contains('cs-page') || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els = document.querySelectorAll('.x-main .blk > *, .x-main > .spot, .x-main > .statement, .next-x > *');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  Array.prototype.forEach.call(els, function (el) { el.classList.add('reveal-on'); io.observe(el); });
})();
