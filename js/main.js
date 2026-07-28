/* BUILD 8 */
/* Chloé Chevallier — Chiropracteur
   Interactions : menu mobile, mise en avant du jour courant, révélations au défilement. */

(function () {
  'use strict';

  /* --- Menu mobile --- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('menu');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.querySelector('.sr').textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- Jour courant dans le tableau des horaires --- */
  var today = new Date().getDay(); // 0 = dimanche
  var row = document.querySelector('.hours tr[data-day="' + today + '"]');
  if (row) { row.classList.add('is-today'); }

  /* --- Révélations au défilement --- */
  var blocks = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    blocks.forEach(function (b) { b.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

  blocks.forEach(function (b) { io.observe(b); });
})();