/* La Catedral del Pensamiento · versión móvil, un único camino
   Portada → Etapa I → estancias 1-3 → Etapa II → 4-7 → Etapa III → 8-10 → El centro */
(function () {
  'use strict';
  var D = window.CP; if (!D) return;
  var L = D.estancias, N = L.length, E = D.etapas;
  var NOMBRE = D.titulo;
  document.documentElement.classList.add('js');

  /* ---------- progreso (solo en este dispositivo) ---------- */
  var KEY = 'cp-encendidas';
  function leer() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function guardar(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} window.dispatchEvent(new Event('cp:progreso')); }
  function encendida(n) { return leer().indexOf(n) !== -1; }
  function encender(n) { var a = leer(); if (a.indexOf(n) === -1) { a.push(n); a.sort(function (x, y) { return x - y; }); guardar(a); } }
  function apagar(n) { guardar(leer().filter(function (x) { return x !== n; })); }
  try { if (localStorage.getItem('cp-letra') === 'grande') document.documentElement.classList.add('letra-grande'); } catch (e) {}

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nn(n) { return (n < 10 ? '0' : '') + n; }
  function foto(n) { return 'assets_img/foto-estancia-' + nn(n) + '.webp'; }
  function etapaDe(n) { for (var i = 0; i < E.length; i++) if (n >= E[i].desde && n <= E[i].hasta) return i; return 0; }
  var NUM = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];

  /* ---------- emblemas dibujados (se ven si no hay foto) ---------- */
  var ICO = {
    1: '<path d="M14 54V26a18 18 0 0 1 36 0v28"/><path d="M26 27a6 6 0 1 1 9 5c-2 1.4-3 2.6-3 5v2"/><circle cx="32" cy="45" r="1.4" class="r"/>',
    2: '<path d="M16 54h32M20 54V40h24v14M14 40h36"/><path d="M32 33c-4-3-5-7-2-12 1 3 3 4 4 6 1-2 1-4 0-6 4 3 5 9-2 12z"/>',
    3: '<path d="M20 10h24M20 54h24M22 10c0 12 10 15 10 22S22 42 22 54M42 10c0 12-10 15-10 22s10 10 10 22"/><path d="M27 48h10"/>',
    4: '<circle cx="32" cy="32" r="9"/><path d="M32 12v6M32 46v6M12 32h6M46 32h6M18 18l4 4M42 42l4 4M46 18l-4 4M22 42l-4 4"/>',
    5: '<path d="M18 54V26a14 14 0 0 1 28 0v28"/><path d="M32 54V18"/><path d="M12 54h40"/><circle cx="28" cy="38" r="1.4" class="r"/><circle cx="36" cy="38" r="1.4" class="r"/>',
    6: '<circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="6"/><path d="M32 12v14M32 38v14M12 32h14M38 32h14M18 18l10 10M36 36l10 10M46 18L36 28M28 36L18 46"/>',
    7: '<path d="M12 54V34a20 20 0 0 1 40 0v20M12 54h40"/><path d="M28 54V42h8v12"/><path d="M32 36c-2-2-2-4 0-7 2 3 2 5 0 7z"/>',
    8: '<path d="M32 10v4M22 40c0-14 3-22 10-22s10 8 10 22l4 5H18z"/><path d="M28 50a4 4 0 0 0 8 0"/><path d="M12 30c-2 4-2 8 0 12M52 30c2 4 2 8 0 12"/>',
    9: '<path d="M10 54V36a7 7 0 0 1 14 0v18M25 54V36a7 7 0 0 1 14 0v18M40 54V36a7 7 0 0 1 14 0v18M8 54h48"/><path d="M18 20c8-8 20-8 28 0-8 8-20 8-28 0z"/><circle cx="32" cy="20" r="3"/>',
    10: '<path d="M32 54V30M32 40l-8-6M32 36l7-6M14 54h36"/><circle cx="32" cy="22" r="12"/><path d="M26 22a6 6 0 0 0 6 6"/>'
  };
  function icono(n, cls) { return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 64 64" aria-hidden="true">' + ICO[n] + '</svg>'; }

  /* ---------- el camino: una sola secuencia de pasos ---------- */
  var PASOS = [];
  E.forEach(function (e, i) {
    PASOS.push({ tipo: 'etapa', e: i, url: 'etapa.html?e=' + (i + 1), nombre: 'Etapa ' + e.id + ' · ' + e.nombre });
    for (var n = e.desde; n <= e.hasta; n++) PASOS.push({ tipo: 'estancia', n: n, e: i, url: 'estancia.html?n=' + n, nombre: 'Estancia ' + n + ' · ' + L[n - 1].titulo });
  });
  PASOS.push({ tipo: 'centro', url: 'centro.html', nombre: 'El centro' });
  function indicePaso(tipo, v) {
    for (var i = 0; i < PASOS.length; i++) {
      var p = PASOS[i];
      if (p.tipo === tipo && (tipo === 'centro' || (tipo === 'etapa' ? p.e === v : p.n === v))) return i;
    }
    return 0;
  }
  /* dónde seguir: la primera estancia sin encender (o su etapa, si aún no se ha empezado) */
  function pasoSiguiente() {
    var a = leer();
    for (var n = 1; n <= N; n++) {
      if (a.indexOf(n) === -1) {
        var e = etapaDe(n), ini = E[e].desde;
        var empezada = false; for (var k = ini; k <= E[e].hasta; k++) if (a.indexOf(k) !== -1) empezada = true;
        return (n === ini && !empezada) ? PASOS[indicePaso('etapa', e)] : PASOS[indicePaso('estancia', n)];
      }
    }
    return PASOS[PASOS.length - 1];
  }

  function pintarProgreso() {
    var a = leer(), sig = pasoSiguiente();
    document.querySelectorAll('[data-pill]').forEach(function (el) { el.textContent = a.length + '/' + N; el.classList.toggle('con-luz', a.length > 0); });
    document.querySelectorAll('[data-progreso]').forEach(function (el) {
      el.textContent = !a.length ? 'Diez estancias te esperan en penumbra.' :
        a.length === N ? 'Has iluminado las diez estancias.' :
        'Has iluminado ' + NUM[a.length] + (a.length === 1 ? ' estancia' : ' estancias') + ' de diez.';
    });
    document.querySelectorAll('[data-continuar]').forEach(function (el) {
      el.href = sig.url;
      el.textContent = !a.length ? 'Entrar en la catedral' : a.length === N ? 'Llegar al centro' : 'Continuar · ' + (sig.tipo === 'etapa' ? 'Etapa ' + E[sig.e].id : 'Estancia ' + sig.n);
    });
    document.querySelectorAll('[data-estancia]').forEach(function (el) {
      el.classList.toggle('encendida', a.indexOf(+el.getAttribute('data-estancia')) !== -1);
    });
    var r = document.getElementById('ruta');
    if (r) { r.querySelectorAll('.aqui').forEach(function (x) { x.classList.remove('aqui'); }); marcarAqui(); }
  }
  window.addEventListener('cp:progreso', pintarProgreso);
  window.addEventListener('pageshow', pintarProgreso);
  window.addEventListener('storage', function (e) { if (e.key === KEY) pintarProgreso(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) pintarProgreso(); });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-reiniciar]')) guardar([]);
  });

  /* ---------- barra fija inferior: anterior · progreso · siguiente ---------- */
  function barra(i) {
    var ant = PASOS[i - 1], sig = PASOS[i + 1], p = PASOS[i];
    var segs = L.map(function (x) {
      var cl = (p.tipo === 'estancia' && x.n === p.n ? 'aqui' : '') + (x.n === E[etapaDe(x.n)].hasta && x.n !== N ? ' corte' : '');
      return '<i data-estancia="' + x.n + '"' + (cl.trim() ? ' class="' + cl.trim() + '"' : '') + '></i>';
    }).join('');
    var etq = p.tipo === 'centro' ? 'El centro' : p.tipo === 'etapa' ? 'Etapa ' + E[p.e].id : 'Estancia ' + p.n + ' / ' + N;
    var nav = document.createElement('nav');
    nav.className = 'barra-camino'; nav.setAttribute('aria-label', 'Avanzar por el camino');
    nav.innerHTML =
      '<a class="bc-ant" href="' + (ant ? ant.url : 'index.html') + '" aria-label="' + esc(ant ? 'Anterior: ' + ant.nombre : 'Inicio') + '">&#8249;</a>' +
      '<a class="bc-centro" href="index.html#camino"><span class="bc-txt">' + esc(etq) + '</span><span class="bc-seg">' + segs + '</span></a>' +
      (sig ? '<a class="bc-sig" href="' + sig.url + '" aria-label="' + esc('Siguiente: ' + sig.nombre) + '">Siguiente <b>&#8250;</b></a>'
           : '<a class="bc-sig" href="index.html">Inicio</a>');
    document.body.appendChild(nav);
    var lectura = document.createElement('div'); lectura.className = 'lectura-barra'; lectura.setAttribute('aria-hidden', 'true'); lectura.innerHTML = '<i></i>';
    document.body.appendChild(lectura);
    function mover() {
      var max = document.documentElement.scrollHeight - innerHeight, q = max > 0 ? scrollY / max : 0;
      lectura.firstChild.style.transform = 'scaleX(' + Math.min(1, q).toFixed(4) + ')';
    }
    addEventListener('scroll', mover, { passive: true }); mover();
    document.body.classList.add('con-barra');
    return sig;
  }

  /* ---------- reproductor de audio (solo aparece si el MP3 existe) ---------- */
  function reproductor(donde, src, titulo, antes) {
    if (!donde || location.protocol === 'file:') return;
    var caja = document.createElement('div');
    caja.className = 'audio'; caja.hidden = true;
    caja.innerHTML = '<button type="button" class="audio-btn" aria-label="Escuchar"><span class="audio-ico" aria-hidden="true"></span><span class="audio-txt">Escuchar</span></button>' +
      '<span class="audio-barra" aria-hidden="true"><i></i></span><span class="audio-t">0:00</span>';
    if (antes) donde.insertBefore(caja, antes); else donde.appendChild(caja);
    var a = new Audio(); a.preload = 'none'; a.src = src;
    var btn = caja.querySelector('.audio-btn'), txt = caja.querySelector('.audio-txt'), bar = caja.querySelector('.audio-barra i'), t = caja.querySelector('.audio-t');
    function mmss(x) { x = Math.max(0, Math.round(x || 0)); return Math.floor(x / 60) + ':' + ('0' + x % 60).slice(-2); }
    fetch(src, { method: 'HEAD' }).then(function (r) { if (r.ok) caja.hidden = false; }).catch(function () {});
    btn.addEventListener('click', function () { a.paused ? a.play() : a.pause(); });
    a.addEventListener('play', function () {
      caja.classList.add('sonando'); txt.textContent = 'Pausa'; btn.setAttribute('aria-label', 'Pausar');
      if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: titulo, artist: NOMBRE });
    });
    a.addEventListener('pause', function () { caja.classList.remove('sonando'); txt.textContent = a.currentTime > 1 ? 'Seguir' : 'Escuchar'; btn.setAttribute('aria-label', 'Escuchar'); });
    a.addEventListener('timeupdate', function () {
      if (a.duration) bar.style.transform = 'scaleX(' + (a.currentTime / a.duration).toFixed(4) + ')';
      t.textContent = mmss(a.currentTime) + (a.duration ? ' / ' + mmss(a.duration) : '');
    });
    a.addEventListener('loadedmetadata', function () { t.textContent = '0:00 / ' + mmss(a.duration); });
    a.addEventListener('ended', function () { txt.textContent = 'Escuchar de nuevo'; });
    caja.querySelector('.audio-barra').addEventListener('click', function (e) {
      if (!a.duration) return; var r = this.getBoundingClientRect(); a.currentTime = (e.clientX - r.left) / r.width * a.duration;
    });
  }

  /* ---------- portada: rosetón (mapa interior) + el camino completo ---------- */
  function roseton() {
    var svg = document.getElementById('mapa-svg');
    if (!svg) return;
    var cx = 250, cy = 250, R = 185, rays = '', nodes = '';
    L.forEach(function (l, i) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / N, x = cx + R * Math.cos(ang), y = cy + R * Math.sin(ang);
      var x2 = cx + (R - 36) * Math.cos(ang), y2 = cy + (R - 36) * Math.sin(ang);
      rays += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
      nodes += '<a href="estancia.html?n=' + l.n + '" data-estancia="' + l.n + '" aria-label="' + esc('Estancia ' + l.n + ': ' + l.titulo) + '">' +
        '<g class="nodo" transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')"><circle r="33"/>' +
        '<text class="nnum" y="-5">' + nn(l.n) + '</text><text class="nlabel" y="12">' + esc(l.matiz) + '</text></g></a>';
    });
    svg.innerHTML =
      '<circle class="orbita" cx="250" cy="250" r="' + R + '"/>' +
      '<g class="rayos">' + rays + '</g>' +
      '<circle class="halo" cx="250" cy="250" r="78"/><circle class="nucleo" cx="250" cy="250" r="64"/>' +
      '<path class="templo" d="M215 266v-49l18-22 17 18 17-18 18 22v49M232 266v-31h36v31M250 213v-35M242 187h16"/>' +
      '<text class="centro-txt" x="250" y="290">PENSAR</text>' + nodes;
  }
  function marcarAqui() {
    var s = pasoSiguiente(), r = document.getElementById('ruta');
    var sel = s.tipo === 'centro' ? '.ruta-altar' : s.tipo === 'etapa' ? '[data-etapa="' + s.e + '"]' : '[data-paso-estancia="' + s.n + '"]';
    var el = r && r.querySelector(sel); if (el) el.classList.add('aqui');
  }
  function portada() {
    var r = document.getElementById('ruta');
    if (!r) return;
    roseton();
    var h = '';
    E.forEach(function (e, i) {
      h += '<li class="ruta-etapa" data-etapa="' + i + '"><a href="etapa.html?e=' + (i + 1) + '">' +
        '<span class="re-num">' + e.id + '</span><span class="re-txt"><span class="re-tit">Etapa ' + e.id + ' · ' + esc(e.nombre) + '</span>' +
        '<span class="re-sub">Estancias ' + e.desde + ' a ' + e.hasta + '</span></span></a></li>';
      for (var n = e.desde; n <= e.hasta; n++) {
        var l = L[n - 1];
        h += '<li class="ruta-lampara" data-paso-estancia="' + n + '"><a data-estancia="' + n + '" href="estancia.html?n=' + n + '">' +
          '<span class="rl-img">' + icono(n) + '<img src="' + foto(n) + '" onerror="this.remove()" alt="" width="96" height="96" loading="lazy"></span>' +
          '<span class="rl-txt"><span class="rl-num">' + n + ' · ' + esc(l.matiz) + '</span><span class="rl-tit">' + esc(l.titulo) + '</span></span>' +
          '<span class="rl-llama" aria-hidden="true"></span></a></li>';
      }
    });
    h += '<li class="ruta-altar"><a href="centro.html"><span class="re-num">&#9673;</span><span class="re-txt"><span class="re-tit">El centro</span><span class="re-sub">' + esc(D.centro.titulo) + '</span></span></a></li>';
    r.innerHTML = h;
  }

  /* ---------- página de etapa ---------- */
  function paginaEtapa() {
    var main = document.getElementById('etapa');
    if (!main) return;
    var k = parseInt(new URLSearchParams(location.search).get('e'), 10);
    if (!(k >= 1 && k <= E.length)) k = 1;
    var e = E[k - 1], i = indicePaso('etapa', k - 1);
    document.title = 'Etapa ' + e.id + ' · ' + e.nombre + ' · ' + NOMBRE;
    var lista = '', emb = '';
    for (var n = e.desde; n <= e.hasta; n++) {
      lista += '<li data-estancia="' + n + '"><span>' + n + '</span>' + esc(L[n - 1].titulo) + '</li>';
      emb += icono(n, 'ico etapa-ico');
    }
    main.innerHTML =
      '<section class="etapa-hero">' +
        '<figure class="etapa-foto" data-foto3d="0.03"><div class="etapa-dibujo" aria-hidden="true">' + emb + '</div>' +
        '<img src="assets_img/foto-etapa-' + k + '.webp" alt="" onerror="this.remove()"></figure>' +
        '<div class="etapa-txt"><p class="etapa-num" aria-hidden="true">' + e.id + '</p>' +
        '<h1>' + esc(e.nombre) + '</h1>' +
        '<p class="entradilla">' + esc(e.texto) + '</p></div>' +
      '</section>' +
      '<section class="etapa-lista" aria-labelledby="el-t"><h2 id="el-t">En esta etapa</h2><ol>' + lista + '</ol>' +
      '<a class="btn btn-oro btn-grande" href="estancia.html?n=' + e.desde + '">Entrar en la estancia ' + e.desde + '</a></section>';
    reproductor(main.querySelector('.etapa-txt'), 'assets_audio/etapa-' + k + '.mp3', 'Etapa ' + e.id + ' · ' + e.nombre);
    barra(i);
  }

  /* ---------- página de estancia ---------- */
  function paginaEstancia() {
    var main = document.getElementById('estancia');
    if (!main) return;
    var n = parseInt(new URLSearchParams(location.search).get('n'), 10);
    if (!(n >= 1 && n <= N)) n = 1;
    var l = L[n - 1], e = E[etapaDe(n)], i = indicePaso('estancia', n);
    document.title = l.titulo + ' · ' + NOMBRE;
    var url = location.href.split('#')[0];
    var wa = 'https://wa.me/?text=' + encodeURIComponent(NOMBRE + ' · Estancia ' + n + ': ' + l.titulo + '\n«' + l.llevar + '»\n' + url);
    var palabras = (l.lectura.join(' ') + ' ' + l.detente + ' ' + l.miradas.join(' ') + ' ' + l.paso).split(/\s+/).length;
    var min = Math.max(3, Math.round(palabras / 180));

    main.innerHTML =
      '<article class="lamp sin-foto" data-estancia="' + n + '">' +
      '<figure class="lamp-foto" data-foto3d="0.03"><img src="' + foto(n) + '" alt="Fotografía de la estancia ' + n + ': ' + esc(l.matiz) + '" onload="this.closest(\'.lamp\').classList.remove(\'sin-foto\')" onerror="this.parentNode.remove()"><span class="lamp-velo" aria-hidden="true"></span></figure>' +
      '<header class="lamp-cab">' +
        '<div class="lamp-img">' + icono(n, 'ico lamp-ico') + '<span class="lamp-luz" aria-hidden="true"></span></div>' +
        '<p class="lamp-datos">Etapa ' + e.id + ' · Estancia ' + n + ' de ' + N + ' · ' + esc(l.matiz) + '</p>' +
        '<h1>' + esc(l.titulo) + '</h1>' +
        '<p class="lamp-fuente">' + esc(l.sub) + ' · ' + min + ' min</p>' +
        '<div class="lamp-herr"><button type="button" class="btn btn-linea btn-peq" data-letra>Letra más grande</button>' +
        '<a class="btn btn-linea btn-peq" href="' + wa + '" target="_blank" rel="noopener">Enviar por WhatsApp</a></div>' +
      '</header>' +
      '<div class="lectura">' + l.lectura.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      '<section class="bloque palabra"><h2>Para tu vida</h2><blockquote><p>' + esc(l.pregunta) + '</p></blockquote></section>' +
      '<section class="bloque detente"><h2>Detente un momento</h2><p>' + esc(l.detente) + '</p></section>' +
      '<section class="bloque oracion miradas"><h2>Tres miradas</h2><ol>' + l.miradas.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ol></section>' +
      '<section class="bloque paso"><h2>Un paso para hoy</h2><p>' + esc(l.paso) + '</p></section>' +
      '<section class="llevar"><h2>Para llevar contigo</h2><p class="llevar-frase">' + esc(l.llevar) + '</p>' +
        '<button type="button" class="btn btn-oro btn-grande btn-encender" data-encender>Iluminar esta estancia</button>' +
        '<a class="btn btn-linea btn-grande llevar-sig" hidden></a>' +
        '<p class="llevar-nota" data-progreso aria-live="polite"></p></section>' +
      '</article>';

    reproductor(main.querySelector('.lamp-cab'), 'assets_audio/estancia-' + nn(n) + '.mp3', 'Estancia ' + n + ' · ' + l.titulo, main.querySelector('.lamp-herr'));
    var sig = barra(i);
    var btn = main.querySelector('[data-encender]'), bSig = main.querySelector('.llevar-sig');
    bSig.href = sig.url;
    bSig.textContent = sig.tipo === 'centro' ? 'Llegar al centro ›' : sig.tipo === 'etapa' ? 'Seguir: Etapa ' + E[sig.e].id + ' ›' : 'Seguir: estancia ' + sig.n + ' ›';
    function estado() {
      var on = encendida(n);
      btn.textContent = on ? 'Estancia iluminada' : 'Iluminar esta estancia';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      main.querySelector('.lamp').classList.toggle('encendida', on);
      bSig.hidden = !on;
      bSig.classList.toggle('btn-oro', on); bSig.classList.toggle('btn-linea', !on);
    }
    btn.addEventListener('click', function () { encendida(n) ? apagar(n) : encender(n); estado(); });
    estado();

    var bl = main.querySelector('[data-letra]');
    function etLetra() { bl.textContent = document.documentElement.classList.contains('letra-grande') ? 'Letra normal' : 'Letra más grande'; }
    bl.addEventListener('click', function () {
      var g = document.documentElement.classList.toggle('letra-grande');
      try { localStorage.setItem('cp-letra', g ? 'grande' : 'normal'); } catch (e) {}
      etLetra();
    });
    etLetra();
  }

  /* ---------- el centro ---------- */
  function centro() {
    var ol = document.getElementById('letania-lista');
    if (!ol) return;
    ol.innerHTML = L.map(function (l) {
      return '<li data-estancia="' + l.n + '"><span class="let-matiz">' + l.n + ' · ' + esc(l.matiz) + '</span><span class="let-frase">' + esc(l.llevar) + '</span></li>';
    }).join('');
    var ah = document.querySelector('.altar-hero');
    reproductor(ah, 'assets_audio/centro.mp3', 'El centro', ah && ah.querySelector('.cita-grande'));
    barra(PASOS.length - 1);
  }

  /* ---------- aparición al entrar en pantalla ---------- */
  function apariciones() {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var els = document.querySelectorAll('.camino-intro,.mapa-intro,.ruta li,.etapa-lista li,.lectura p,.bloque,.llevar > *,.letania li');
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { el.classList.add('aparece'); io.observe(el); });
  }

  var cab = document.querySelector('.cabecera');
  function cabScroll() { if (cab) cab.classList.toggle('compacta', window.scrollY > 30); }
  window.addEventListener('scroll', cabScroll, { passive: true });

  portada(); paginaEtapa(); paginaEstancia(); centro(); pintarProgreso(); apariciones(); cabScroll();
})();
