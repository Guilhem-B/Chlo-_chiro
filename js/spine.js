/* Chloé Chevallier — Chiropracteur
   Colonne vertébrale vue de profil.
   La colonne s'affiche en posture affaissée. Dès que la page défile, elle se
   redresse vers la courbure physiologique ; de retour tout en haut, elle
   revient à la posture affaissée. Le mouvement est réversible en cours de
   route et garde une vitesse constante. */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     Réglages
     --------------------------------------------------------------- */

  var DELAY    = 0;     // ms d'attente après le déclenchement
  var DURATION = 800;   // ms pour une course complète, dans un sens ou dans l'autre
  var TOP_EPS  = 4;     // px sous lesquels on considère être « tout en haut »

  /* Sur petit écran la colonne est au-dessus du texte : un seul geste la fait
     sortir du champ, et une animation déclenchée au défilement n'est jamais vue.
     Elle se joue donc toute seule. Mettre '' pour désactiver. */
  var AUTOPLAY       = '(max-width: 960px)';
  var AUTOPLAY_DELAY = 500;

  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.getElementById('spine');
  var stage = document.querySelector('.stage');
  if (!svg || !stage) { return; }

  /* plus d'épinglage : la scène redevient un héros de hauteur normale */
  document.body.classList.add('no-pin');

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

  render(0);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
  var pending = null;
  var visible = true; // la colonne est-elle à l'écran

  function stop() {
    if (raf) { window.cancelAnimationFrame(raf); raf = null; }
    if (pending) { window.clearTimeout(pending); pending = null; }
  }

  function animateTo(to) {
    var from = cur;
    var dist = Math.abs(to - from);
    target = to;
    stop();

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

  /* hors du champ : on se cale sans animer, rien à montrer */
  function jumpTo(to) {
    stop();
    target = to;
    cur = to;
    render(cur);
  }

  function request(to) {
    if (to === target) { return; }
    if (!visible) { jumpTo(to); return; }
    if (pending) { window.clearTimeout(pending); pending = null; }
    if (DELAY > 0) {
      pending = window.setTimeout(function () { pending = null; animateTo(to); }, DELAY);
    } else {
      animateTo(to);
    }
  }

  function onScroll() {
    request(scrollTop() > TOP_EPS ? 1 : 0);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* On ne joue l'animation que si la colonne est réellement à l'écran :
     inutile de la dérouler dans le vide quand le geste a déjà tout dépassé. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) { onScroll(); }
    }, { threshold: 0.25 }).observe(svg);
  }

  onScroll();   // page rouverte à une position déjà défilée

  /* Lecture automatique là où le défilement emporte trop vite la colonne */
  if (AUTOPLAY && window.matchMedia(AUTOPLAY).matches) {
    window.setTimeout(function () {
      if (target === 0 && visible) { animateTo(1); }
    }, AUTOPLAY_DELAY);
  }
})();