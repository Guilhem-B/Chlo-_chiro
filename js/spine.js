/* BUILD 8 */
/* Chloé Chevallier — Chiropracteur
   Colonne vertébrale vue de profil.
   À l'arrivée sur la page, la colonne part de la posture affaissée et se
   redresse vers la courbure physiologique. Ensuite le défilement commande :
   tout en haut de page elle s'affaisse, dès qu'on redescend elle se redresse.
   Le mouvement est réversible en cours de route et garde une vitesse
   constante. */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     Réglages
     --------------------------------------------------------------- */

  var DURATION       = 1500;  // ms pour une course complète, dans un sens ou dans l'autre
  var AUTOPLAY_DELAY = 300;   // ms avant le redressement automatique à l'arrivée
  var TOP_EPS        = 4;     // px sous lesquels on considère être « tout en haut »

  /* Passer à false pour animer même quand le visiteur a demandé de réduire les
     animations dans les réglages de son système. Déconseillé : c'est un
     réglage d'accessibilité, certaines personnes en ont besoin. */
  var RESPECT_REDUCED_MOTION = true;

  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.getElementById('spine');
  if (!svg) { return; }

  /* ---------------------------------------------------------------
     Géométrie
     --------------------------------------------------------------- */

  var AXIS = 250;   // ligne de gravité
  var TOP  = 140;   // haut de C1

  var H = [], i;
  for (i = 0; i < 7;  i++) { H.push(18); }   // cervicales
  for (i = 0; i < 12; i++) { H.push(23); }   // dorsales
  for (i = 0; i < 5;  i++) { H.push(28); }   // lombaires
  var N = H.length;

  var Y = [], pos = TOP;
  for (i = 0; i < N; i++) { Y.push(pos + H[i] / 2); pos += H[i] + 2.5; }

  /* arc sinusoïdal entre deux indices */
  function arc(idx, a, b, amp) {
    if (idx < a || idx > b) { return 0; }
    return amp * Math.sin(Math.PI * (idx - a) / (b - a));
  }

  /* Posture affaissée : tête en avant, hypercyphose dorsale,
     lordose lombaire effacée, bassin en rétroversion. */
  function slouch(idx) {
    var x = 0;
    if (idx <= 6) { x += -54 * Math.pow(1 - idx / 7, 1.35); }
    x += arc(idx, 0, 6, -3);
    x += arc(idx, 6, 18, 52);
    x += arc(idx, 18, 23, -5);
    if (idx >= 19) { x += 13; }
    return x;
  }

  /* Courbure physiologique : lordose cervicale, cyphose dorsale,
     lordose lombaire. */
  function normal(idx) {
    return arc(idx, 0, 7, -18) + arc(idx, 7, 18, 24) + arc(idx, 18, 23, -27);
  }

  function el(tag, attrs) {
    var n = document.createElementNS(NS, tag), k;
    for (k in attrs) { if (attrs.hasOwnProperty(k)) { n.setAttribute(k, attrs[k]); } }
    return n;
  }

  /* ---------------------------------------------------------------
     Construction du dessin
     --------------------------------------------------------------- */

  svg.appendChild(el('line', {
    'class': 'plumb', x1: AXIS, y1: 46, x2: AXIS, y2: 812
  }));

  var vertebrae = [];
  for (i = 0; i < N; i++) {
    var g = el('g', { 'class': 'vt' });
    var h = H[i];

    /* corps vertébral, en avant */
    g.appendChild(el('rect', {
      x: -38, y: -h * 0.42, width: 30, height: h * 0.84, rx: 4
    }));

    /* apophyse épineuse, en arrière — longue et plongeante en dorsal */
    var len  = i < 7 ? 15 : (i < 19 ? 33 : 23);
    var drop = i < 7 ? 3  : (i < 19 ? 13 : 4);
    g.appendChild(el('path', { d: 'M-6 0 L' + len + ' ' + drop }));

    /* canal médullaire */
    g.appendChild(el('circle', { 'class': 'dot', cx: -2, cy: 0, r: 2.1 }));

    svg.appendChild(g);
    vertebrae.push(g);
  }

  var sacrum = el('g', { 'class': 'sacrum' });
  sacrum.appendChild(el('path', { d: 'M-32 -14 L4 -18 L14 32 L-12 44 Z' }));
  svg.appendChild(sacrum);

  var skull = el('g', { 'class': 'skull' });
  skull.appendChild(el('ellipse', { cx: -14, cy: -50, rx: 33, ry: 29 }));
  skull.appendChild(el('path', { d: 'M-45 -37 L-42 -21 L-19 -19' }));      // mâchoire
  skull.appendChild(el('circle', { 'class': 'dot', cx: 2, cy: -45, r: 3 })); // oreille
  svg.appendChild(skull);

  /* ---------------------------------------------------------------
     Rendu à l'avancement t (0 = affaissée, 1 = physiologique)
     --------------------------------------------------------------- */

  var capA  = document.querySelector('.cap--a');
  var capB  = document.querySelector('.cap--b');
  var meter = document.querySelector('.stage__meter span');

  function render(t) {
    var xs = [], k;
    for (k = 0; k < N; k++) {
      var s = slouch(k);
      xs.push(AXIS + s + (normal(k) - s) * t);
    }

    for (k = 0; k < N; k++) {
      var a = Math.max(0, k - 1), b = Math.min(N - 1, k + 1);
      var rot = -Math.atan2(xs[b] - xs[a], Y[b] - Y[a]) * 180 / Math.PI;
      vertebrae[k].setAttribute(
        'transform',
        'translate(' + xs[k].toFixed(2) + ',' + Y[k] + ') rotate(' + rot.toFixed(2) + ')'
      );
    }

    /* le crâne se redresse : en posture affaissée la tête part en extension */
    skull.setAttribute(
      'transform',
      'translate(' + xs[0].toFixed(2) + ',' + Y[0] + ') rotate(' + (-17 + 17 * t).toFixed(2) + ')'
    );

    /* le sacrum bascule en nutation quand la lordose lombaire revient */
    sacrum.setAttribute(
      'transform',
      'translate(' + (xs[N - 1] + 4).toFixed(2) + ',' + (Y[N - 1] + 42) +
      ') rotate(' + (-5 + 18 * t).toFixed(2) + ')'
    );

    if (capA)  { capA.style.opacity = String(Math.max(0, 1 - t * 2.1)); }
    if (capB)  { capB.style.opacity = String(Math.max(0, (t - 0.55) * 2.4)); }
    if (meter) { meter.style.width  = (t * 100).toFixed(1) + '%'; }
  }

  /* ---------------------------------------------------------------
     Déclenchement
     --------------------------------------------------------------- */

  render(0);   // on part toujours de la posture affaissée

  /* Ajouter ?motion=force à l'URL passe outre le réglage système, le temps
     de vérifier si c'est bien lui qui supprime l'animation. */
  var forced = /[?&]motion=force/.test(window.location.search);

  if (!forced && RESPECT_REDUCED_MOTION &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    render(1);
    return;
  }

  function ease(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  /* iOS ancien ne connaît pas window.scrollY */
  function scrollTop() {
    return window.pageYOffset !== undefined
      ? window.pageYOffset
      : (document.documentElement || document.body).scrollTop;
  }

  var cur = 0;        // avancement affiché
  var target = 0;     // avancement visé
  var raf = null;

  function animateTo(to) {
    var from = cur;
    var dist = Math.abs(to - from);
    target = to;

    if (raf) { window.cancelAnimationFrame(raf); raf = null; }
    if (dist < 0.002) { cur = to; render(cur); return; }

    /* durée proportionnelle au chemin restant : la vitesse reste la même
       qu'on parte du début ou qu'on inverse à mi-course */
    var dur = DURATION * dist;
    var t0 = null;

    function frame(now) {
      if (t0 === null) { t0 = now; }
      var p = Math.min(1, (now - t0) / dur);
      cur = from + (to - from) * ease(p);
      render(cur);
      raf = p < 1 ? window.requestAnimationFrame(frame) : null;
    }

    raf = window.requestAnimationFrame(frame);
  }

  /* hors du champ : on se cale sans animer, il n'y a rien à montrer */
  function jumpTo(to) {
    if (raf) { window.cancelAnimationFrame(raf); raf = null; }
    target = to;
    cur = to;
    render(cur);
  }

  /* Mesure directe plutôt qu'un IntersectionObserver : getBoundingClientRect
     se comporte de façon identique partout, y compris sur les éléments SVG.
     Appelée uniquement quand l'état bascule, donc sans coût au défilement. */
  function onScreen() {
    var r = svg.getBoundingClientRect();
    /* mesure douteuse : on préfère animer plutôt que sauter, l'erreur est
       moins grave dans ce sens */
    if (!r || r.height === 0) { return true; }
    var h = window.innerHeight || document.documentElement.clientHeight;
    return r.bottom > 0 && r.top < h;
  }

  /* Tant que l'animation d'arrivée n'a pas été lancée, le défilement est
     ignoré. Safari iOS émet un événement de défilement pendant le chargement
     — rétractation de la barre d'adresse, restauration de position — et cet
     événement suffisait à faire sauter la colonne en position finale avant
     que l'animation n'ait eu lieu. */
  var armed = false;

  function onScroll() {
    if (!armed) { return; }
    var to = scrollTop() > TOP_EPS ? 1 : 0;
    if (to === target) { return; }
    if (onScreen()) { animateTo(to); } else { jumpTo(to); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* Arrivée sur la page : le redressement se joue toujours, sans condition. */
  window.setTimeout(function () {
    animateTo(1);
    armed = true;
  }, AUTOPLAY_DELAY);
})();