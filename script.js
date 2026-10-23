(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'nd-theme';

  // Year in the colophon
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Theme: Auto / Light / Dark ---------- */
  function readMode() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'light' || v === 'dark' ? v : 'auto';
    } catch (e) {
      return 'auto';
    }
  }

  function applyMode(mode) {
    if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode);
    else root.removeAttribute('data-theme');

    try {
      if (mode === 'auto') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch (e) {}

    var btns = document.querySelectorAll('.mode__btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', String(btns[i].getAttribute('data-mode') === mode));
    }
  }

  var modeGroup = document.querySelector('.mode');
  if (modeGroup) {
    applyMode(readMode());
    modeGroup.addEventListener('click', function (e) {
      var btn = e.target.closest('.mode__btn');
      if (btn) applyMode(btn.getAttribute('data-mode'));
    });
  }

  /* ---------- Contents panel on small screens ---------- */
  var spine = document.getElementById('spine');
  var toggle = spine && spine.querySelector('.spine__toggle');
  var wide = window.matchMedia('(min-width: 1024px)');

  function setOpen(open) {
    if (!spine || !toggle) return;
    spine.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    spine.addEventListener('click', function (e) {
      if (e.target.closest('.toc a, .spine__links a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && spine.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (spine.classList.contains('is-open') && !spine.contains(e.target)) setOpen(false);
    });

    var onWide = function () { if (wide.matches) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else if (wide.addListener) wide.addListener(onWide);
  }

  /* ---------- Contents: mark the chapter in view ---------- */
  var links = document.querySelectorAll('.toc__list a');
  var chapters = [];
  for (var i = 0; i < links.length; i++) {
    var target = document.querySelector(links[i].getAttribute('href'));
    if (target) chapters.push({ el: target, link: links[i] });
  }

  function markCurrent() {
    var line = window.innerHeight * 0.35;
    var current = null;
    for (var j = 0; j < chapters.length; j++) {
      if (chapters[j].el.getBoundingClientRect().top <= line) current = chapters[j];
    }
    // At the very bottom, the last chapter is the one being read
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 4) {
      current = chapters[chapters.length - 1];
    }
    for (var k = 0; k < chapters.length; k++) {
      if (chapters[k] === current) chapters[k].link.setAttribute('aria-current', 'location');
      else chapters[k].link.removeAttribute('aria-current');
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { markCurrent(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', markCurrent);
  markCurrent();

  /* ---------- Gentle reveal ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    var items = document.querySelectorAll('.chapter__head, .prose, .layers, .product, .role, .kit__set, .build, .cert, .degree, .invite, .reach');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    items.forEach(function (el) {
      // Anything already on screen stays put; only content below the fold rises in
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('rise');
      io.observe(el);
    });
  }
})();
