/* ===== Drrop Mix — main.js (no dependencies) ===== */
(function () {
  'use strict';

  /* ---------- CONFIG: edit these in one place ---------- */
  var CONFIG = {
    WA_NUMBER: '916239117949',          // WhatsApp number, country code first, no + or spaces
    EMAIL: 'drropmix@gmail.com',
    REPLY_TIME: 'within one working day', // promised reply time (confirm!)
    FORM_ENDPOINT: ''                   // optional: paste a Formspree/Basin URL to also email leads
  };

  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var inr = function (n) { return '₹' + n.toLocaleString('en-IN'); };

  /* ---------- UTM capture (so leads show where they came from) ---------- */
  var utm = (function () {
    var out = {}, p = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'ref'].forEach(function (k) { if (p.get(k)) out[k] = p.get(k); });
    if (Object.keys(out).length) { try { sessionStorage.setItem('drrop_utm', JSON.stringify(out)); } catch (e) {} }
    try { return JSON.parse(sessionStorage.getItem('drrop_utm') || '{}'); } catch (e) { return out; }
  })();
  function srcLine() {
    var bits = [];
    if (utm.utm_source) bits.push(utm.utm_source);
    if (utm.utm_medium) bits.push(utm.utm_medium);
    if (utm.utm_campaign) bits.push(utm.utm_campaign);
    if (utm.ref) bits.push('ref:' + utm.ref);
    return bits.length ? '\n(Source: ' + bits.join(' / ') + ')' : '';
  }
  function track(name, data) {
    try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, data || {})); } catch (e) {}
    if (typeof window.plausible === 'function') window.plausible(name, { props: data || {} });
  }
  function waLink(text) { return 'https://wa.me/' + CONFIG.WA_NUMBER + '?text=' + encodeURIComponent(text); }
  window.DRROP = { CONFIG: CONFIG, waLink: waLink, track: track };

  /* generic WhatsApp links with data-wa="message" */
  $$('[data-wa]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa') + srcLine());
    a.target = '_blank'; a.rel = 'noopener';
    a.addEventListener('click', function () { track('whatsapp_click', { where: a.getAttribute('data-where') || 'link' }); });
  });

  /* ---------- Mobile nav ---------- */
  var burger = $('.burger'), nav = $('.nav');
  if (burger) {
    burger.addEventListener('click', function () {
      var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o);
    });
    $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); });
  }

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window && !RM) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- Age gate / mocktail mode ---------- */
  var root = document.documentElement;
  function setMode(m) { if (m === 'mocktail') root.setAttribute('data-mode', 'mocktail'); else root.removeAttribute('data-mode'); store.set('drrop_mode', m); syncSwitches(); }
  function syncSwitches() { $$('[data-mock-switch]').forEach(function (b) { b.setAttribute('aria-pressed', root.getAttribute('data-mode') === 'mocktail'); }); }
  if (store.get('drrop_mode') === 'mocktail') root.setAttribute('data-mode', 'mocktail');
  var gate = $('#gate');
  if (gate) {
    var seen = store.get('drrop_age');
    if (!seen) {
      gate.classList.add('show'); document.body.style.overflow = 'hidden';
      var yes = $('#gate-yes', gate); if (yes) yes.focus();
    }
    $('#gate-yes').addEventListener('click', function () { store.set('drrop_age', 'adult'); setMode('spirits'); closeGate(); });
    $('#gate-no').addEventListener('click', function () { store.set('drrop_age', 'minor'); setMode('mocktail'); closeGate(); });
  }
  function closeGate() { gate.classList.remove('show'); document.body.style.overflow = ''; }
  $$('[data-mock-switch]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (store.get('drrop_age') === 'minor' && root.getAttribute('data-mode') === 'mocktail') return; // stays alcohol-free
      setMode(root.getAttribute('data-mode') === 'mocktail' ? 'spirits' : 'mocktail');
    });
  });
  syncSwitches();

  /* ---------- Flavour data ---------- */
  var FL = {
    brunei: { name: 'Brunei Berry', color: '#F4578A', liquid: '#FBB6CF', tag: 'In the wild, by the bloom', line: 'Floral. Plush. Simply Drrop.',
      desc: 'Drrop the wildness with blueberry, vanilla and rose petals, crafted to fizz your way to bring the bloom.',
      ing: ['Blueberry', 'Vanilla essence', 'Rose petals'], profile: ['Fruity', 'Wild'], garnish: 'rose' },
    coconut: { name: 'Coconut Bahamas', color: '#4A90D9', liquid: '#DDEBF7', tag: 'In the sun, by the sea', line: 'Tropical. Chill. Simply Drrop.',
      desc: 'Drrop into paradise with coconut, sea salt, mint and caramel, crafted to fizz your way to the Bahamas.',
      ing: ['Coconut', 'Sea salt', 'Mint', 'Caramel'], profile: ['Sweet', 'Salty'], garnish: 'mint' },
    mango: { name: 'Mango Mexico', color: '#3DAA3A', liquid: '#CDEBB0', tag: 'In the heart, by the fiesta', line: 'Raw. Zesty. Simply Drrop.',
      desc: 'Drrop into the streets with raw mango, mint and basil, crafted to fizz your way to bring the fiesta.',
      ing: ['Raw mango', 'Basil', 'Mint'], profile: ['Sweet', 'Tangy'], garnish: 'basil' }
  };
  var KEYS = ['brunei', 'coconut', 'mango'];
  var GARNISH_SVG = {
    rose: '<svg viewBox="0 0 60 60"><circle cx="22" cy="30" r="12" fill="#E0316E" stroke="#0A0A0A" stroke-width="3"/><circle cx="38" cy="24" r="10" fill="#F4578A" stroke="#0A0A0A" stroke-width="3"/><path d="M16 30c4-6 10-6 12 0" fill="none" stroke="#0A0A0A" stroke-width="2.5"/></svg>',
    mint: '<svg viewBox="0 0 60 60"><path d="M10 40C8 20 24 8 40 10c2 18-8 32-30 30z" fill="#3DAA3A" stroke="#0A0A0A" stroke-width="3"/><path d="M12 38C22 28 30 22 38 14" fill="none" stroke="#0A0A0A" stroke-width="2.5"/></svg>',
    basil: '<svg viewBox="0 0 60 60"><path d="M30 52C8 44 8 14 30 6c22 8 22 38 0 46z" fill="#2E8B2E" stroke="#0A0A0A" stroke-width="3"/><path d="M30 50V14" stroke="#0A0A0A" stroke-width="2.5"/></svg>'
  };
  function glassSVG(liq, id) {
    id = id || 'g' + Math.random().toString(36).slice(2, 7);
    var body = 'M36 78C40 150 48 250 56 330Q110 346 164 330C172 250 180 150 184 78Z';
    var inner = 'M43 82C47 150 54 245 61 322Q110 336 159 322C166 245 173 150 177 82Z';
    return '<svg viewBox="0 0 220 380" aria-hidden="true">' +
      '<defs>' +
      '<clipPath id="c' + id + '"><path d="' + inner + '"/></clipPath>' +
      '<linearGradient id="w' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#cfe9f7" stop-opacity=".5"/></linearGradient>' +
      '<linearGradient id="t' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + liq + '"/><stop offset="1" stop-color="' + liq + '" stop-opacity=".78"/></linearGradient>' +
      '<linearGradient id="s' + id + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".18" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>' +
      '<linearGradient id="i' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#d7ecf8" stop-opacity=".55"/></linearGradient>' +
      '</defs>' +
      '<ellipse cx="110" cy="338" rx="84" ry="13" fill="#000" opacity=".16"/>' +
      '<path d="' + body + '" fill="#fff" fill-opacity=".14"/>' +
      '<g clip-path="url(#c' + id + ')">' +
        '<rect x="30" y="108" width="160" height="240" fill="url(#w' + id + ')"/>' +
        '<rect class="liq-tint" x="30" y="108" width="160" height="240" fill="url(#t' + id + ')"/>' +
        '<g class="ice">' +
          '<g transform="rotate(-14 82 150)"><rect x="58" y="126" width="46" height="46" rx="9" fill="url(#i' + id + ')" stroke="#fff" stroke-opacity=".9" stroke-width="2"/><path d="M64 134l16-3" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/></g>' +
          '<g transform="rotate(11 130 188)"><rect x="108" y="166" width="42" height="42" rx="9" fill="url(#i' + id + ')" stroke="#fff" stroke-opacity=".9" stroke-width="2"/><path d="M114 174l14-3" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/></g>' +
          '<g transform="rotate(-6 92 238)"><rect x="70" y="216" width="44" height="44" rx="9" fill="url(#i' + id + ')" stroke="#fff" stroke-opacity=".9" stroke-width="2"/></g>' +
        '</g>' +
        '<ellipse cx="110" cy="110" rx="68" ry="9" fill="#fff" opacity=".45"/>' +
        '<path d="M43 296h134v30H43z" fill="#fff" opacity=".25"/>' +
      '</g>' +
      '<path d="' + body + '" fill="url(#s' + id + ')"/>' +
      '<path d="M44 96c4 60 10 150 17 222" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".85"/>' +
      '<path d="M170 110c-3 56-7 130-12 196" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>' +
      '<path d="' + body + '" fill="none" stroke="#0A0A0A" stroke-width="4.5" stroke-linejoin="round" opacity=".88"/>' +
      '<path d="M56 330Q110 346 164 330" fill="none" stroke="#fff" stroke-width="5" opacity=".6"/>' +
      '<ellipse cx="110" cy="78" rx="74" ry="14" fill="#fff" fill-opacity=".12" stroke="#0A0A0A" stroke-width="4.5" opacity=".92"/>' +
      '<path d="M46 80Q110 98 174 80" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>' +
      '</svg>';
  }

  /* ---------- Hero / scene animation ---------- */
  function Scene(el, key) {
    this.el = el; this.key = key || 'brunei'; this.anims = [];
    el.innerHTML = glassSVG(FL[this.key].liquid, 'h' + Math.floor(Math.random() * 1e5)) +
      '<div class="straw"></div><div class="fizz"></div><div class="splash"></div><div class="garnish"></div>' +
      '<div class="bomb"><img alt="" src="img/bombs/' + this.key + '.webp"></div>';
    this.setFlavour(this.key, true);
  }
  Scene.prototype.setFlavour = function (k, silent) {
    this.key = k; var f = FL[k], el = this.el;
    var tint = $('.liq-tint', el); if (tint) tint.setAttribute('fill', f.liquid);
    var b = $('.bomb img', el); if (b) b.src = (el.dataset.base || '') + 'img/bombs/' + k + '.webp';
    $('.garnish', el).innerHTML = GARNISH_SVG[f.garnish];
    el.style.setProperty('--accent', f.color);
    if (!silent) this.play();
  };
  Scene.prototype.reset = function () {
    this.anims.forEach(function (a) { try { a.cancel(); } catch (e) {} }); this.anims = [];
    var el = this.el; el.classList.remove('done');
    $('.fizz', el).innerHTML = ''; $('.splash', el).innerHTML = '';
    var b = $('.bomb', el); b.style.opacity = 1; b.style.transform = '';
    $('.liq-tint', el).style.opacity = 0;
  };
  Scene.prototype.finish = function () {
    this.reset(); var el = this.el;
    $('.bomb', el).style.opacity = 0; $('.liq-tint', el).style.opacity = .85; el.classList.add('done');
  };
  Scene.prototype.play = function () {
    var self = this, el = this.el;
    if (RM) { this.finish(); return; }
    this.reset();
    var bomb = $('.bomb', el), tint = $('.liq-tint', el), fizz = $('.fizz', el), splash = $('.splash', el);
    var H = el.getBoundingClientRect().height || 400;
    var fall = bomb.animate([
      { transform: 'translate(-50%,-160%) rotate(-30deg)', offset: 0 },
      { transform: 'translate(-50%,' + (H * .36) + 'px) rotate(160deg)', offset: .62, easing: 'cubic-bezier(.5,0,1,.6)' },
      { transform: 'translate(-50%,' + (H * .44) + 'px) rotate(200deg) scale(.9)', offset: .75 },
      { transform: 'translate(-50%,' + (H * .55) + 'px) rotate(260deg) scale(.45)', opacity: .7, offset: .9 },
      { transform: 'translate(-50%,' + (H * .6) + 'px) rotate(300deg) scale(.1)', opacity: 0, offset: 1 }
    ], { duration: 1500, fill: 'forwards' });
    this.anims.push(fall);
    // splash at ~60%
    setTimeout(function () {
      for (var i = 0; i < 9; i++) {
        var d = document.createElement('i'); splash.appendChild(d);
        var ang = -Math.PI * (0.15 + 0.7 * i / 8), dist = 40 + Math.random() * 60;
        self.anims.push(d.animate([
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: 'translate(' + (Math.cos(ang) * dist) + 'px,' + (Math.sin(ang) * dist - 20) + 'px) scale(.6)', opacity: 1, offset: .5 },
          { transform: 'translate(' + (Math.cos(ang) * dist * 1.2) + 'px,' + (Math.sin(ang) * dist + 40) + 'px) scale(.2)', opacity: 0 }
        ], { duration: 700, fill: 'forwards' }));
      }
    }, 900);
    // tint fills in as bomb dissolves
    setTimeout(function () { self.anims.push(tint.animate([{ opacity: 0 }, { opacity: .85 }], { duration: 1400, fill: 'forwards', easing: 'ease-out' })); }, 1000);
    // bubbles
    setTimeout(function () {
      for (var i = 0; i < 34; i++) {
        var b = document.createElement('i'), s = 5 + Math.random() * 12; b.style.width = b.style.height = s + 'px'; b.style.left = (Math.random() * 92) + '%';
        fizz.appendChild(b);
        self.anims.push(b.animate([
          { transform: 'translateY(0)', opacity: 0 }, { opacity: .95, offset: .15 },
          { transform: 'translateY(' + (-(H * .5) - Math.random() * 40) + 'px) translateX(' + ((Math.random() - .5) * 24) + 'px)', opacity: 0 }
        ], { duration: 900 + Math.random() * 1300, delay: Math.random() * 1200, fill: 'forwards', easing: 'ease-out' }));
      }
    }, 1050);
    setTimeout(function () { el.classList.add('done'); }, 2500);
  };

  var heroEl = $('#hero-scene');
  var scenes = [];
  if (heroEl) {
    var hs = new Scene(heroEl, 'brunei'); scenes.push(hs);
    var heroStage = $('.hero__stage');
    var dots = $$('.dot', heroStage);
    var setHeroFlavour = function (k, play) {
      hs.setFlavour(k, !play);
      dots.forEach(function (d) { d.setAttribute('aria-pressed', d.dataset.k === k); });
      var blob = $('.hero__blob'); if (blob) blob.style.setProperty('--accent-soft', k === 'brunei' ? '#FFD3E3' : k === 'coconut' ? '#CFE4FA' : '#D9F2BE');
    };
    dots.forEach(function (d) { d.addEventListener('click', function () { setHeroFlavour(d.dataset.k, true); track('hero_flavour', { k: d.dataset.k }); }); });
    var rp = $('.replay'); if (rp) rp.addEventListener('click', function () { hs.play(); });
    heroEl.addEventListener('click', function () { hs.play(); });
    setHeroFlavour('brunei', false);
    if ('IntersectionObserver' in window) { var hio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { hio.disconnect(); setTimeout(function () { hs.play(); }, 400); } }, { threshold: .5 }); hio.observe(heroEl); } else { hs.play(); }
  }

  /* ---------- Flavour switcher + cube ---------- */
  function buildCube(host, key, base) {
    var f = ['front', 'right', 'back', 'left'];
    var faceName = { front: 'front', right: 'right', back: 'back', left: 'left' };
    var boxColor = { brunei: '#F7BED9', coconut: '#A8D8F5', mango: '#FBF0A0' }[key];
    host.innerHTML = '<div class="cube auto" style="--box:' + boxColor + '">' +
      f.map(function (n) { return '<div class="f ' + n + '"><img src="' + base + 'img/faces/' + key + '_' + faceName[n] + '.webp" alt="" loading="lazy" width="520" height="580"></div>'; }).join('') +
      '<div class="f top"><img src="' + base + 'img/brand/logo-black.png" alt=""></div><div class="f bottom"></div></div>';
    var cube = $('.cube', host), ry = -28, rx = -12, dragging = false, sx = 0, sy = 0, ox = 0, oy = 0, idle;
    function apply() { cube.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)'; }
    function start(e) {
      dragging = true; cube.classList.add('drag');
      if (cube.classList.contains('auto')) {
        var m = getComputedStyle(cube).transform;
        if (m && m !== 'none') { var v = m.match(/matrix3d\((.+)\)/); if (v) { var a = v[1].split(',').map(Number); ry = Math.atan2(-a[8], a[10]) * 180 / Math.PI; } }
        cube.classList.remove('auto'); cube.style.animation = 'none'; apply();
      }
      sx = e.clientX; sy = e.clientY; ox = ry; oy = rx; clearTimeout(idle);
      try { cube.setPointerCapture(e.pointerId); } catch (er) {}
    }
    function move(e) { if (!dragging) return; ry = ox + (e.clientX - sx) * .6; rx = Math.max(-40, Math.min(30, oy - (e.clientY - sy) * .3)); apply(); }
    function end() { dragging = false; cube.classList.remove('drag'); }
    cube.addEventListener('pointerdown', start); cube.addEventListener('pointermove', move);
    cube.addEventListener('pointerup', end); cube.addEventListener('pointercancel', end);
    cube.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { ry -= 30; apply(); } if (e.key === 'ArrowRight') { ry += 30; apply(); } });
    cube.tabIndex = 0; cube.setAttribute('role', 'img'); cube.setAttribute('aria-label', 'Rotating 3D view of the ' + FL[key].name + ' box. Use left and right arrow keys to turn it.');
    if (RM) { cube.classList.remove('auto'); apply(); }
  }

  var flRoot = $('#flavours');
  if (flRoot) {
    var base = flRoot.dataset.base || '';
    var tabs = $$('[role="tab"]', flRoot);
    var cur = null;
    var show = function (k, fromUser) {
      if (k === cur) return; cur = k; var f = FL[k];
      tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.k === k); t.tabIndex = t.dataset.k === k ? 0 : -1; });
      document.body.setAttribute('data-flavour', k);
      var fade = $$('.fadeable', flRoot); fade.forEach(function (x) { x.classList.add('out'); });
      setTimeout(function () {
        $('[data-f="name"]', flRoot).textContent = f.name;
        $('[data-f="tag"]', flRoot).textContent = f.tag + ' · ' + f.line;
        $('[data-f="desc"]', flRoot).textContent = f.desc;
        $('[data-f="chips"]', flRoot).innerHTML = f.ing.map(function (i) { return '<span class="chip">' + i + '</span>'; }).join('') + f.profile.map(function (i) { return '<span class="chip chip--accent">' + i + '</span>'; }).join('');
        $('[data-f="bomb"]', flRoot).src = base + 'img/bombs/' + k + '.webp';
        $('[data-f="pouch"]', flRoot).src = base + 'img/pouches/' + k + '.webp';
        buildCube($('[data-f="cube"]', flRoot), k, base);
        var wa = $('[data-f="wa"]', flRoot); wa.setAttribute('data-wa', 'Hi Drrop Mix! I\'d like to order ' + f.name + '.'); wa.href = waLink('Hi Drrop Mix! I\'d like to order ' + f.name + '.' + srcLine());
        fade.forEach(function (x) { x.classList.remove('out'); });
        var bi = $('[data-f="bomb"]', flRoot); if (!RM && bi.animate) bi.animate([{ transform: 'translateY(-40px) rotate(-90deg) scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 500, easing: 'cubic-bezier(.3,1.6,.5,1)' });
      }, fromUser && !RM ? 220 : 0);
      if (fromUser) track('flavour_view', { k: k });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(t.dataset.k, true); });
      t.addEventListener('keydown', function (e) {
        var n = null; if (e.key === 'ArrowRight') n = (i + 1) % tabs.length; if (e.key === 'ArrowLeft') n = (i + tabs.length - 1) % tabs.length;
        if (n !== null) { tabs[n].focus(); show(tabs[n].dataset.k, true); }
      });
    });
    show(flRoot.dataset.start || 'brunei', false);
  }

  /* Flavour cards on flavours page (static cubes) */
  $$('[data-cube]').forEach(function (h) { buildCube(h, h.dataset.cube, h.dataset.base || ''); });

  /* ---------- Scroll steps (Drop -> Fizz -> Sip) ---------- */
  var stepsEl = $('#steps');
  if (stepsEl) {
    var ss = new Scene($('#steps-scene'), 'brunei'); scenes.push(ss);
    var stepEls = $$('.step', stepsEl), curStep = -1;
    ss.finish(); ss.reset();
    var stepIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = stepEls.indexOf(e.target); if (i === curStep) return; curStep = i;
        stepEls.forEach(function (s, j) { s.classList.toggle('on', j === i); });
        if (i === 0) { ss.reset(); var b = $('.bomb', ss.el); b.style.transform = 'translate(-50%,-38%) rotate(-12deg)'; }
        if (i === 1) { ss.play(); }
        if (i === 2) { ss.finish(); }
      });
    }, { rootMargin: '-40% 0px -40% 0px' });
    stepEls.forEach(function (s) { stepIO.observe(s); });
    var swatch = $$('[data-steps-k]'); swatch.forEach(function (b) { b.addEventListener('click', function () { ss.setFlavour(b.dataset.stepsK, true); swatch.forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }); });
    stepEls[0].classList.add('on'); var b0 = $('.bomb', ss.el); b0.style.transform = 'translate(-50%,-38%) rotate(-12deg)';
  }

  /* ---------- Order builder (WhatsApp) ---------- */
  var SH = function (a) { return a.map(function (x) { return 'img/shop/' + x + '.webp'; }); };
  var PRODUCTS = [
    { id: 'bb', g: 'Single boxes · 3 drinks each', n: 'Brunei Berry', d: 'Box of 3 drink bombs', p: 159, m: 299, im: SH(['berry-front', 'berry-add1', 'bb1', 'bb2', 'bb3', 'bb4']) },
    { id: 'cb', g: 'Single boxes · 3 drinks each', n: 'Coconut Bahamas', d: 'Box of 3 drink bombs', p: 159, m: 299, im: SH(['coco-front', 'coco-add1', 'cb1', 'cb2', 'cb3', 'cb4']) },
    { id: 'mm', g: 'Single boxes · 3 drinks each', n: 'Mango Mexico', d: 'Box of 3 drink bombs', p: 159, m: 299, im: SH(['mango-front', 'mango-add1', 'mm1', 'mm2', 'mm3', 'mm4']) },
    { id: 'd1', g: 'Favourite combos', n: 'Brunei Berry + Coconut Bahamas', d: 'Duo · 2 boxes', p: 299, m: 598, im: SH(['cb2', 'bb2', 'bb4', 'cb3', 'bb1', 'cb1', 'berry-add1', 'coco-add1']) },
    { id: 'd2', g: 'Favourite combos', n: 'Brunei Berry + Mango Mexico', d: 'Duo · 2 boxes', p: 299, m: 598, im: SH(['bb2', 'mm2', 'berry-add1', 'mango-add1', 'bb4', 'cb3', 'cb1', 'bb1']) },
    { id: 'd3', g: 'Favourite combos', n: 'Mango Mexico + Coconut Bahamas', d: 'Duo · 2 boxes', p: 299, m: 598, im: SH(['mm2', 'cb2', 'mm4', 'cb3', 'mm1', 'cb1', 'mango-add1', 'coco-add1']) },
    { id: 'cp', g: 'Favourite combos', n: 'Drrop Mix Combo Pack — All 3 Flavours', d: '3 boxes · all flavours', p: 399, m: 897, im: SH(['mix1', 'cb11', 'cb3', 'berry-add1', 'coco-add1', 'mango-add1']) },
    { id: 'g1', g: 'Gifts', n: 'Blush Stemmed Cocktail Glass + Brunei Berry', d: 'Gift set', p: 399, m: 798, im: SH(['berry-front', 'berry-add3', 'berry-add1', 'bb1', 'bb2', 'glass-pink']) },
    { id: 'g2', g: 'Gifts', n: 'Emerald Stemmed Cocktail Glass + Mango Mexico', d: 'Gift set', p: 399, m: 798, im: SH(['glass-green-12', 'mango-front', 'mango-model', 'mm2', 'mango-add1', 'mm1', 'glass-green-11']) },
    { id: 'g3', g: 'Gifts', n: 'Royal Violet Stemmed Cocktail Glass + Coconut Bahamas', d: 'Gift set', p: 399, m: 798, im: SH(['coco-front', 'coco-add3', 'glass-purple-12', 'glass-purple-11', 'coco-add1', 'cb2', 'cb3']) },
    { id: 'gp', g: 'Gifts', n: 'Blush Stemmed Cocktail Glasses — Pack of 2', d: 'Glassware', p: 799, m: 999, im: SH(['berry-add3', 'glass-pink', 'berry-front']) },
    { id: 'hp', g: 'Gifts', n: 'Drrop Hamper — The Premium Gift Set', d: 'Cocktail bombs + glassware in a Drrop Mix gift box', p: 1199, m: 1499, im: SH(['hamper1', 'hamper2', 'hamper3', 'hamper4', 'mango-model', 'coco-model', 'berry-model', 'berry-front', 'coco-front', 'mango-front', 'mango-add1', 'coco-add1', 'berry-add1', 'bb1', 'mm1', 'cb1']) }
  ];
  var ob = $('#order-builder');
  if (ob) {
    var base2 = ob.dataset.base || '', qty = {}, list = $('#ob-list'), cartUl = $('#cart-list'), totEl = $('#cart-total'), waBtn = $('#cart-wa');
    var groups = []; PRODUCTS.forEach(function (p) { if (groups.indexOf(p.g) < 0) groups.push(p.g); });
    list.innerHTML = groups.map(function (g) {
      return '<div class="ob-group"><h3>' + g + '</h3>' + PRODUCTS.filter(function (p) { return p.g === g; }).map(function (p) {
        var th = '<button type="button" class="th" data-gal="' + p.id + '" aria-label="View photos of ' + p.n + '"><img src="' + base2 + p.im[0] + '" alt="' + p.n + '" loading="lazy" width="76" height="76"><span class="n">' + p.im.length + ' 📷</span></button>';
        var sv = Math.round((1 - p.p / p.m) * 100);
        return '<div class="item" data-id="' + p.id + '">' + th + '<div><h4>' + p.n + '</h4><div class="pr"><b>' + inr(p.p) + '</b><s>' + inr(p.m) + '</s><span class="sv">' + sv + '% off MRP</span></div><div class="pr" style="opacity:.7">' + p.d + '</div><button type="button" class="more" data-gal="' + p.id + '">See photos</button></div>' +
          '<div class="step-q"><button type="button" aria-label="Remove one ' + p.n + '" data-d="-1">−</button><output aria-live="polite">0</output><button type="button" aria-label="Add one ' + p.n + '" data-d="1">+</button></div></div>';
      }).join('') + '</div>';
    }).join('');
    var update = function () {
      var total = 0, lines = [], msg = [];
      PRODUCTS.forEach(function (p) { var q = qty[p.id] || 0; if (q) { total += q * p.p; lines.push('<li><span>' + q + ' × ' + p.n + '</span><b>' + inr(q * p.p) + '</b></li>'); msg.push('• ' + q + ' × ' + p.n + ' — ' + inr(q * p.p)); } });
      cartUl.innerHTML = lines.length ? lines.join('') : '<li class="empty">Pick something yummy →</li>';
      totEl.textContent = inr(total); totEl.parentNode.classList.remove('pop'); void totEl.parentNode.offsetWidth; totEl.parentNode.classList.add('pop');
      var name = ($('#ob-name').value || '').trim(), city = ($('#ob-city').value || '').trim();
      var text = 'Hi Drrop Mix! I\'d like to order:\n' + (msg.join('\n') || '(please help me choose)') + (total ? '\nTotal: ' + inr(total) + ' (excl. shipping)' : '') + (name ? '\nName: ' + name : '') + (city ? '\nCity / Pincode: ' + city : '') + srcLine();
      waBtn.href = waLink(text); waBtn.classList.toggle('disabled', !total);
    };
    list.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-d]'); if (!b) return;
      var it = b.closest('.item'), id = it.dataset.id, q = Math.max(0, Math.min(50, (qty[id] || 0) + (+b.dataset.d)));
      qty[id] = q; $('output', it).textContent = q; update();
    });

    /* gallery lightbox */
    var lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Product photos');
    lb.innerHTML = '<div class="lb__box"><div class="lb__top"><h3></h3><button type="button" class="lb__x" aria-label="Close">✕</button></div><div class="lb__stage"><button type="button" class="lb__nav p" aria-label="Previous photo">‹</button><img alt=""><button type="button" class="lb__nav n" aria-label="Next photo">›</button></div><div class="lb__thumbs"></div><div class="lb__foot"><span class="lb__price"></span><button type="button" class="btn btn--yellow btn--sm lb__add">+ Add to order</button></div></div>';
    document.body.appendChild(lb);
    var cur = null, idx = 0, lastFocus = null;
    function showImg() {
      var p = cur; $('.lb__stage img', lb).src = base2 + p.im[idx]; $('.lb__stage img', lb).alt = p.n + ' photo ' + (idx + 1);
      $$('.lb__thumbs button', lb).forEach(function (b, i) { b.setAttribute('aria-current', i === idx); });
    }
    function openGal(id) {
      cur = PRODUCTS.filter(function (x) { return x.id === id; })[0]; if (!cur) return; idx = 0; lastFocus = document.activeElement;
      $('.lb__top h3', lb).textContent = cur.n; $('.lb__price', lb).innerHTML = '<b>' + inr(cur.p) + '</b> <s style="opacity:.55">' + inr(cur.m) + '</s>';
      $('.lb__thumbs', lb).innerHTML = cur.im.map(function (u, i) { return '<button type="button" data-i="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + base2 + u + '" alt="" loading="lazy"></button>'; }).join('');
      showImg(); lb.classList.add('show'); document.body.style.overflow = 'hidden'; $('.lb__x', lb).focus(); track('gallery_open', { id: id });
    }
    function closeGal() { lb.classList.remove('show'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    function step(d) { idx = (idx + d + cur.im.length) % cur.im.length; showImg(); }
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('.lb__x')) return closeGal();
      if (e.target.closest('.lb__nav.p')) return step(-1);
      if (e.target.closest('.lb__nav.n')) return step(1);
      var t = e.target.closest('.lb__thumbs button'); if (t) { idx = +t.dataset.i; showImg(); }
      if (e.target.closest('.lb__add')) { qty[cur.id] = Math.min(50, (qty[cur.id] || 0) + 1); var it = $('.item[data-id="' + cur.id + '"]'); $('output', it).textContent = qty[cur.id]; update(); closeGal(); }
    });
    document.addEventListener('keydown', function (e) { if (!lb.classList.contains('show')) return; if (e.key === 'Escape') closeGal(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
    var tx = 0; lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); }, { passive: true });
    list.addEventListener('click', function (e) { var g = e.target.closest('[data-gal]'); if (g) openGal(g.dataset.gal); });
    ['ob-name', 'ob-city'].forEach(function (i) { $('#' + i).addEventListener('input', update); });
    waBtn.addEventListener('click', function (e) {
      var total = PRODUCTS.reduce(function (s, p) { return s + (qty[p.id] || 0) * p.p; }, 0);
      if (!total) { e.preventDefault(); $('#cart-note').textContent = 'Add at least one item first. Or tap "Just chat" below.'; return; }
      track('order_whatsapp', { total: total });
    });
    waBtn.target = '_blank'; waBtn.rel = 'noopener';
    var chat = $('#cart-chat'); if (chat) { chat.href = waLink('Hi Drrop Mix! I have a question about ordering.' + srcLine()); chat.target = '_blank'; chat.rel = 'noopener'; }
    update();
  }

  /* ---------- Recipes ---------- */
  var RECIPES = [
    { n: 'Berry Blush Gin Fizz', k: 'brunei', b: 'gin', sp: '60 ml gin', mx: '15 ml fresh lime juice · 120–150 ml chilled sparkling water', gar: 'Rose petals', m: ['Fill a glass with ice. Add the gin and lime juice.', 'Drop in the Brunei Berry bomb and let it fizz.', 'Top with chilled sparkling water, stir once, garnish.'] },
    { n: 'Royal Brunei Spritz', k: 'brunei', b: 'sparkling wine', sp: '120–150 ml chilled sparkling wine', mx: 'Brunei Berry bomb', gar: 'Rose petals', m: ['Chill your glass, add a few cubes of ice.', 'Drop in the Brunei Berry bomb.', 'Pour the chilled sparkling wine slowly over it, garnish.'] },
    { n: 'Brunei Velvet Martini', k: 'brunei', b: 'vodka', sp: '60 ml vodka', mx: '120–150 ml still water', gar: 'Rose petal', m: ['Add the vodka and still water to a chilled stemmed glass.', 'Drop in the Brunei Berry bomb.', 'Stir gently once and float a rose petal on top.'] },
    { n: 'The Salty Captain', k: 'coconut', b: 'rum', sp: '60 ml spiced or dark rum', mx: '120–150 ml chilled sparkling water', gar: 'Mint leaves', m: ['Add ice and the rum to a glass.', 'Drop in the Coconut Bahamas bomb.', 'Top with sparkling water and garnish with fresh mint.'] },
    { n: 'Bahamian Salted Mojito', k: 'coconut', b: 'rum', sp: '50 ml white rum', mx: '20 ml fresh lime juice · 120–150 ml chilled sparkling water', gar: 'Mint sprig', m: ['Add ice, white rum and lime juice to a glass.', 'Drop in the Coconut Bahamas bomb.', 'Top with sparkling water, give it a lift with a spoon, add mint.'] },
    { n: 'Tulum Kiss', k: 'coconut', b: 'tequila', sp: '50 ml tequila', mx: '15 ml fresh lime juice · 120–150 ml still water', gar: 'Lime wheel & mint', m: ['Add ice, tequila and lime juice to a glass.', 'Drop in the Coconut Bahamas bomb.', 'Top with still water, stir once, garnish.'] },
    { n: 'Mango Basil Daiquiri', k: 'mango', b: 'rum', sp: '60 ml white rum', mx: '15 ml fresh lime juice · 120–150 ml still water', gar: 'Basil leaf', m: ['Add ice, rum and lime juice to a glass.', 'Drop in the Mango Mexico bomb.', 'Top with still water, stir, and slap a basil leaf on top.'] },
    { n: 'Mango Mint Mule', k: 'mango', b: 'vodka', sp: '50 ml vodka', mx: '15 ml fresh lime juice · top with spicy ginger beer', gar: 'Mint', m: ['Fill a mug or glass with ice. Add vodka and lime juice.', 'Drop in the Mango Mexico bomb.', 'Top with spicy ginger beer and garnish with mint.'] },
    { n: 'Mexican Sunray', k: 'mango', b: 'tequila', sp: '50 ml tequila blanco', mx: '15 ml fresh lime juice · 120–150 ml chilled sparkling water', gar: 'Basil or a thin chilli slice', m: ['Add ice, tequila and lime juice to a glass.', 'Drop in the Mango Mexico bomb.', 'Top with sparkling water and garnish.'] }
  ];
  var RIMG = {"Berry Blush Gin Fizz": {"f": "ginfizz", "pos": "50% 62%"}, "Royal Brunei Spritz": {"f": "spritz", "pos": "50% 50%"}, "Brunei Velvet Martini": {"f": "velvet", "pos": "50% 70%"}, "The Salty Captain": {"f": "captain", "pos": "50% 62%"}, "Bahamian Salted Mojito": {"f": "mojito", "pos": "50% 60%"}, "Tulum Kiss": {"f": "tulum", "pos": "50% 60%"}, "Mango Basil Daiquiri": {"f": "daiquiri", "pos": "50% 62%"}, "Mango Mint Mule": {"f": "mule", "pos": "50% 62%"}, "Mexican Sunray": {"f": "sunray", "pos": "50% 58%"}};
  var recHost = $('#recipes');
  if (recHost) {
    var FN = { brunei: 'Brunei Berry', coconut: 'Coconut Bahamas', mango: 'Mango Mexico' }, TC = { brunei: 'bb', coconut: 'cb', mango: 'mm' };
    recHost.innerHTML = RECIPES.map(function (r, i) {
      return '<article class="rec rv" data-k="' + r.k + '" data-b="' + r.b + '"><div class="rec__img"><img src="img/drinks/' + RIMG[r.n].f + '.webp" alt="' + r.n + ' made with Drrop Mix ' + FN[r.k] + '" loading="lazy" style="object-position:' + RIMG[r.n].pos + '"></div><div class="rec__top"><h3>' + r.n + '</h3><div class="tags"><span class="tag tag--' + TC[r.k] + '">' + FN[r.k] + '</span><span class="tag spirit-only">' + r.b + '</span><span class="tag mock-only" style="background:#D9F2BE">alcohol-free</span></div></div>' +
        '<details><summary>How to make it</summary><div class="body">' +
        '<p class="spirit-line spirit-only">' + r.sp + '</p><p class="spirit-only">' + r.mx + '</p>' +
        '<p class="mock-only"><b>Alcohol-free:</b> skip the spirit. Pour 180 ml chilled sparkling or still water over ice, drop in the bomb' + (r.k === 'mango' && r.b === 'vodka' ? ', then top with ginger beer' : '') + ', and add a squeeze of lime if you like.</p>' +
        '<p><b>Garnish:</b> ' + r.gar + '</p><ol>' + r.m.map(function (s, ix) { return '<li class="' + (ix === 0 ? 'spirit-only' : '') + '">' + (ix === 0 ? s : s) + '</li>'; }).join('') + '</ol>' +
        '<div class="mk"><span class="mock-only">One bomb makes one drink.</span><span class="spirit-only">No spirit? Skip it: the box mix is 180 ml of chilled water or soda per bomb.</span></div></div></details></article>';
    }).join('');
    $$('.rec', recHost).forEach(function (r) { r.classList.add('in'); });
    var active = { k: 'all', b: 'all' };
    var apply = function () {
      $$('.rec', recHost).forEach(function (r) {
        var ok = (active.k === 'all' || r.dataset.k === active.k) && (active.b === 'all' || root.getAttribute('data-mode') === 'mocktail' || r.dataset.b === active.b);
        r.classList.toggle('hide', !ok);
      });
      var n = $$('.rec:not(.hide)', recHost).length; $('#rec-count').textContent = n + ' recipe' + (n === 1 ? '' : 's');
    };
    $$('[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.dataset.filter, v = b.dataset.value;
        $$('[data-filter="' + t + '"]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); active[t] = v; apply(); track('recipe_filter', { t: t, v: v });
      });
    });
    $$('[data-mock-switch]').forEach(function (b) { b.addEventListener('click', apply); });
    apply();
  }
  $$('.vid').forEach(function (v) {
    v.addEventListener('click', function () {
      var id = v.dataset.yt; v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="Drrop Mix video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'; v.classList.add('playing');
      track('video_play', { id: id });
    });
  });

  /* ---------- Business: segments, counters, quote builder ---------- */
  var SEG = {
    bars: { t: 'Bars & restaurants', pitch: 'Add a signature fizz to the menu without adding a prep station.', pts: ['One bomb = one drink. Drop into 180 ml of chilled water or soda, with or without a spirit.', 'Same taste every pour, whoever is behind the bar.', 'Dry and shelf-stable: 12-month shelf life, no refrigeration.', 'A bright pack that looks good on the back bar.'], ask: 'Tell us your drink menu style and we\'ll suggest 2–3 serves.' },
    cafes: { t: 'Cafés & QSR', pitch: 'A zero-fuss cold drink that your counter team can make in seconds.', pts: ['No blending, no syrups, no machine time.', 'Works with still or sparkling water, so a café fridge is already enough.', 'Three flavours to start a seasonal "fizz" menu.', 'Low calorie, under 5 g sugar per serve.'], ask: 'Tell us your daily footfall and we\'ll size a trial.' },
    hotels: { t: 'Hotels & airlines', pitch: 'Premium welcome drinks, minibar and in-flight service that feel designed.', pts: ['Compact and light: easy to store, count and restock.', 'A welcome-drink moment that guests photograph.', 'Alcohol-free base with an optional spirit, so one pack suits every guest.', 'Individually wrapped pouches inside a premium box.'], ask: 'Tell us your property count and service format (welcome drink, minibar, lounge).' },
    events: { t: 'Caterers & event planners', pitch: 'A show-stopping drink station that needs no bartender.', pts: ['Fast service: drop, fizz, serve.', 'Pre-count by guest, not by bottle. Very little wastage.', 'Easy to transport and store before the event.', 'Fits weddings, launches, brand activations and parties.'], ask: 'Tell us the guest count and date and we\'ll quote.' },
    gifting: { t: 'Corporate gifting', pitch: 'A gift people actually open, post and finish.', pts: ['Ready gift formats: hampers and glass + flavour sets.', 'Great for festive gifting, client thank-yous and onboarding kits.', 'Bulk quantities on request.', 'Tell us if you need your message or branding on the pack.'], ask: 'Tell us quantity, deadline and delivery cities.' },
    retail: { t: 'Retail & stores', pitch: 'A small, giftable, high-shelf-appeal add-on for the counter or the shelf.', pts: ['Compact box that sells on looks.', 'Three colour-coded flavours that block nicely on a shelf.', 'Long shelf life.', 'Works for gourmet stores, gift shops, convenience and travel retail.'], ask: 'Tell us your store type, city and number of outlets.' }
  };
  var segTabs = $$('[data-seg]');
  if (segTabs.length) {
    var segBox = $('#seg-box');
    var showSeg = function (k) {
      var s = SEG[k]; segTabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.seg === k); });
      segBox.innerHTML = '<div><h3>' + s.t + '</h3><p>' + s.pitch + '</p><ul>' + s.pts.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul></div>' +
        '<div class="box"><h4>What we need from you</h4><p>' + s.ask + '</p><p style="margin-top:14px"><a class="btn btn--yellow btn--sm" href="#quote" data-pick="' + k + '">Get a quote for this →</a></p></div>';
      var pick = $('[data-pick]', segBox); pick.addEventListener('click', function () { var r = $('input[name="btype"][value="' + k + '"]'); if (r) r.checked = true; });
      track('segment_view', { k: k });
    };
    segTabs.forEach(function (t) { t.addEventListener('click', function () { showSeg(t.dataset.seg); }); });
    showSeg('bars');
  }
  var counters = $$('[data-count]');
  if (counters.length) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; cio.unobserve(e.target);
        var el = e.target, end = parseFloat(el.dataset.count), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
        if (RM) { el.textContent = pre + end + suf; return; }
        var t0 = performance.now(); (function tick(t) { var p = Math.min(1, (t - t0) / 1200), v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = pre + v + suf; if (p < 1) requestAnimationFrame(tick); })(t0);
      });
    }, { threshold: .6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  var qf = $('#quote-form');
  if (qf) {
    qf.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(qf), err = $('#q-err');
      var name = (f.get('name') || '').trim(), biz = (f.get('biz') || '').trim(), city = (f.get('city') || '').trim(), phone = (f.get('phone') || '').trim();
      if (!name || !biz || !city || !f.get('btype')) { err.textContent = 'Please fill in your name, business, city and type.'; return; }
      if (!f.get('consent')) { err.textContent = 'Please tick the consent box so we can contact you.'; return; }
      err.textContent = '';
      var flav = f.getAll('flav').join(', ') || 'Not sure yet';
      var lines = ['Hi Drrop Mix! I\'d like a trade quote.', 'Name: ' + name, 'Business: ' + biz, 'Type: ' + (SEG[f.get('btype')] ? SEG[f.get('btype')].t : f.get('btype')), 'City: ' + city,
        'Monthly volume: ' + (f.get('vol') || 'Not sure'), 'Flavours: ' + flav, 'Wants a sample kit: ' + (f.get('sample') ? 'Yes' : 'No')];
      if (phone) lines.push('Phone: ' + phone); if (f.get('notes')) lines.push('Notes: ' + f.get('notes'));
      var text = lines.join('\n') + srcLine();
      track('b2b_lead', { type: f.get('btype'), city: city, vol: f.get('vol') || '' });
      if (CONFIG.FORM_ENDPOINT) { try { fetch(CONFIG.FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ message: text }) }); } catch (er) {} }
      $('#q-done').hidden = false; $('#q-wa').href = waLink(text); $('#q-mail').href = 'mailto:' + CONFIG.EMAIL + '?subject=' + encodeURIComponent('Trade enquiry: ' + biz + ' (' + city + ')') + '&body=' + encodeURIComponent(text);
      window.open(waLink(text), '_blank', 'noopener');
      $('#q-done').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* year */
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
})();
