/* La Catedral del Pensamiento · nave de la portada
   Modo foto: la foto de la nave + las 10 lámparas colgando en 3D + polvo de luz.
   Modo dibujo (si falta la foto): la nave entera dibujada en perspectiva.
   Canvas 2D a ~30 fps, pensado para PC sin tarjeta gráfica. */
(function () {
  'use strict';
  var cv = document.getElementById('nave');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fotoBox = document.getElementById('foto-nave');
  var foto = fotoBox && fotoBox.querySelector('img');
  var modo = 'dibujo';

  var D = 6, W = 4.4, HC = 7, HV = 11.5, N = 10, BAYS = 11;
  var ALTAR_Z = BAYS * D + 3;
  var w = 0, h = 0, dpr = 1, f = 1, cx = 0, cy = 0;
  var cam = { x: 0, y: 2.1, z: -9 }, tgt = { x: 0, y: 2.1, z: -9 };
  var raton = { x: 0, y: 0 };
  var lit = [], hits = [], motas = [];
  var visible = true, last = 0, pScroll = 0;

  function readLit() { try { lit = JSON.parse(localStorage.getItem('cp-encendidas') || '[]'); } catch (e) { lit = []; } }
  readLit();
  addEventListener('cp:progreso', function () { readLit(); });

  /* polvo de luz: partículas en el volumen de la nave */
  function nuevaMota(m, inicio) {
    m = m || {};
    m.x = (Math.random() - 0.5) * W * 1.9;
    m.y = inicio ? Math.random() * HV : -0.2;
    m.z = cam.z + 2 + Math.random() * 60;
    m.vy = 0.004 + Math.random() * 0.012;
    m.fase = Math.random() * 6.28;
    m.r = 0.018 + Math.random() * 0.03;
    return m;
  }
  for (var i = 0; i < 110; i++) motas.push(nuevaMota(null, true));

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, modo === 'foto' ? 1.25 : 1.5);
    w = innerWidth; h = innerHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    f = Math.max(h * 0.95, w * 0.62);
    if (modo === 'foto') { cx = w * 0.5; cy = h * 0.6; }
    else { cx = w > 900 ? w * 0.62 : w * 0.5; cy = h * 0.58; }
    onScroll();
  }

  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    pScroll = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    tgt.z = -9 + pScroll * (ALTAR_Z - 13);
    if (reduce) { cam.z = tgt.z; pintar(performance.now()); }
  }

  function P(x, y, z) {
    var dz = z - cam.z;
    if (dz < 0.25) return null;
    var s = f / dz;
    return { x: cx + (x - cam.x) * s, y: cy - (y - cam.y) * s, s: s, dz: dz };
  }
  function fog(dz) { return Math.max(0, Math.min(1, 1.15 - dz / 95)); }
  function gold(a) { return 'rgba(217,178,106,' + a.toFixed(3) + ')'; }

  function archPts(z) {
    var pts = [], k, n = 10;
    for (k = 0; k <= n; k++) {
      var ang = (k / n) * Math.PI / 2;
      pts.push([-W + (1 - Math.cos(ang)) * W, HC + Math.sin(ang) * (HV - HC), z]);
    }
    for (k = n - 1; k >= 0; k--) pts.push([-pts[k][0], pts[k][1], z]);
    return pts;
  }
  function line3(pts, color, width) {
    var started = false;
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) {
      var q = P(pts[i][0], pts[i][1], pts[i][2]);
      if (!q) { started = false; continue; }
      if (!started) { ctx.moveTo(q.x, q.y); started = true; } else ctx.lineTo(q.x, q.y);
    }
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }
  function quad(a, b, c, d, fill) {
    var A = P(a[0], a[1], a[2]), B = P(b[0], b[1], b[2]), C = P(c[0], c[1], c[2]), E = P(d[0], d[1], d[2]);
    if (!A || !B || !C || !E) return;
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.lineTo(E.x, E.y); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
  }

  /* ---------- nave dibujada (solo si no hay foto) ---------- */
  function drawBay(i) {
    var z = i * D, a = fog(z - cam.z);
    if (a <= 0 || z - cam.z < 0.3) return;
    if (i < BAYS) {
      var zm = z + D / 2;
      [-1, 1].forEach(function (sd) {
        var x = sd * (W + 0.05);
        var pts = [[x, 2.6, zm - 1.1], [x, 5.4, zm - 1.1], [x, 6.4, zm], [x, 5.4, zm + 1.1], [x, 2.6, zm + 1.1]];
        var ok = true, pr = pts.map(function (p) { var q = P(p[0], p[1], p[2]); if (!q) ok = false; return q; });
        if (!ok) return;
        ctx.beginPath(); ctx.moveTo(pr[0].x, pr[0].y);
        for (var k = 1; k < pr.length; k++) ctx.lineTo(pr[k].x, pr[k].y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(96,120,150,' + (0.45 * a).toFixed(3) + ')'; ctx.fill();
        ctx.strokeStyle = gold(0.35 * a); ctx.lineWidth = 1; ctx.stroke();
      });
    }
    [-1, 1].forEach(function (sd) {
      var x = sd * W;
      quad([x - 0.32, 0, z], [x + 0.32, 0, z], [x + 0.32, HC, z], [x - 0.32, HC, z], 'rgba(70,53,38,' + (0.95 * a).toFixed(3) + ')');
      line3([[x - 0.32, 0, z], [x - 0.32, HC, z]], gold(0.55 * a), 1.2);
    });
    var q = P(0, HV, z);
    line3(archPts(z), gold(0.9 * a), q ? Math.max(1, Math.min(5, q.s * 0.05)) : 1);
    if (i < BAYS) {
      line3([[-W, HC, z], [-W, HC, z + D]], gold(0.35 * a), 1);
      line3([[W, HC, z], [W, HC, z + D]], gold(0.35 * a), 1);
      line3([[0, HV, z], [0, HV, z + D]], gold(0.28 * a), 1);
      line3([[-W, HC, z], [0, HV - 0.6, z + D / 2], [W, HC, z + D]], gold(0.16 * a), 1);
      line3([[W, HC, z], [0, HV - 0.6, z + D / 2], [-W, HC, z + D]], gold(0.16 * a), 1);
    }
  }
  function drawSuelo() {
    var fl1 = P(-W, 0, cam.z + 0.5), fr1 = P(W, 0, cam.z + 0.5), fl2 = P(-W, 0, ALTAR_Z), fr2 = P(W, 0, ALTAR_Z);
    if (fl1 && fr1 && fl2 && fr2) {
      ctx.beginPath(); ctx.moveTo(fl1.x, fl1.y); ctx.lineTo(fr1.x, fr1.y); ctx.lineTo(fr2.x, fr2.y); ctx.lineTo(fl2.x, fl2.y); ctx.closePath();
      ctx.fillStyle = 'rgba(80,60,40,0.55)'; ctx.fill();
    }
    for (var k = 0; k < BAYS * 2; k++) {
      var z0 = k * D / 2;
      if (z0 - cam.z < 0.4) continue;
      line3([[-1.1, 0, z0], [1.1, 0, z0]], gold(0.12 * fog(z0 - cam.z)), 1);
    }
  }
  function drawAltar() {
    var z = ALTAR_Z, q = P(0, 6, z);
    if (!q) return;
    var s = q.s, total = lit.length / N;
    var g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, 9 * s);
    g.addColorStop(0, 'rgba(255,226,160,' + (0.6 + 0.35 * total) + ')');
    g.addColorStop(0.35, 'rgba(217,160,90,' + (0.28 + 0.2 * total) + ')');
    g.addColorStop(1, 'rgba(20,15,11,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, 9 * s, 0, Math.PI * 2); ctx.fill();
    /* el centro: un círculo de luz (PENSAR) */
    var c0 = P(0, 6, z - 0.5);
    if (c0) { ctx.beginPath(); ctx.arc(c0.x, c0.y, 2 * c0.s, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,240,205,0.95)'; ctx.lineWidth = Math.max(1.5, c0.s * 0.14); ctx.stroke();
      ctx.beginPath(); ctx.arc(c0.x, c0.y, 1.35 * c0.s, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(240,211,148,0.6)'; ctx.lineWidth = Math.max(1, c0.s * 0.05); ctx.stroke(); }
    quad([-2.2, 0, z - 2], [2.2, 0, z - 2], [2.2, 1.6, z - 2], [-2.2, 1.6, z - 2], 'rgba(58,42,27,0.95)');
  }

  /* ---------- lámparas (en los dos modos) ---------- */
  function drawLamp(n, t) {
    var z = (n - 0.5) * D, x = (n % 2 ? -1.6 : 1.6), y = modo === 'foto' ? 6.4 : 5.6;
    var q = P(x, y, z), top = P(x, HV + 6, z);
    if (!q) return;
    var a = fog(q.dz) * (modo === 'foto' ? 0.95 : 1), on = lit.indexOf(n) !== -1;
    if (a <= 0.02) return;
    var sw = reduce ? 0 : Math.sin(t / 900 + n) * 0.04 * q.s;   // leve balanceo
    if (top) {
      ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(q.x + sw, q.y);
      ctx.strokeStyle = gold(0.45 * a); ctx.lineWidth = Math.max(0.6, q.s * 0.012); ctx.stroke();
    }
    var X = q.x + sw, s = q.s;
    var flick = reduce ? 1 : 1 + 0.07 * Math.sin(t / 170 + n * 1.7) + 0.04 * Math.sin(t / 53 + n);
    var r = (on ? 1.9 : 1.0) * s * flick;
    var g = ctx.createRadialGradient(X, q.y, 0, X, q.y, Math.max(2, r));
    if (on) {
      g.addColorStop(0, 'rgba(255,238,195,' + (0.95 * a) + ')');
      g.addColorStop(0.16, 'rgba(240,200,120,' + (0.55 * a) + ')');
      g.addColorStop(1, 'rgba(217,150,70,0)');
    } else {
      g.addColorStop(0, 'rgba(240,180,110,' + (0.75 * a) + ')');
      g.addColorStop(1, 'rgba(192,118,74,0)');
    }
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, q.y, Math.max(2, r), 0, Math.PI * 2); ctx.fill();
    // lámpara de aceite: cuerpo de cristal + aro
    var cw = 0.3 * s, ch = 0.38 * s;
    ctx.beginPath();
    ctx.moveTo(X - cw, q.y - ch * 0.15);
    ctx.quadraticCurveTo(X - cw * 0.9, q.y + ch, X, q.y + ch);
    ctx.quadraticCurveTo(X + cw * 0.9, q.y + ch, X + cw, q.y - ch * 0.15);
    ctx.closePath();
    ctx.fillStyle = on ? 'rgba(240,211,148,' + (0.9 * a) + ')' : 'rgba(200,140,80,' + (0.9 * a) + ')'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(X - cw * 1.1, q.y - ch * 0.15); ctx.lineTo(X + cw * 1.1, q.y - ch * 0.15);
    ctx.strokeStyle = gold(0.9 * a); ctx.lineWidth = Math.max(1, s * 0.03); ctx.stroke();
    hits.push({ n: n, x: X, y: q.y, r: Math.max(18, 0.9 * s) });
  }

  function drawMotas(t) {
    for (var i = 0; i < motas.length; i++) {
      var m = motas[i];
      if (!reduce) { m.y += m.vy; m.x += Math.sin(t / 2000 + m.fase) * 0.002; }
      if (m.y > HV || m.z - cam.z < 0.6 || m.z - cam.z > 70) nuevaMota(m, m.z - cam.z < 0.6 || m.z - cam.z > 70);
      var q = P(m.x, m.y, m.z);
      if (!q) continue;
      var tw = 0.55 + 0.45 * Math.sin(t / 700 + m.fase);
      var a = fog(q.dz) * tw;
      ctx.fillStyle = 'rgba(255,226,170,' + a.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(0.6, m.r * q.s), 0, 6.283); ctx.fill();
    }
  }

  function pintar(t) {
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    hits = [];
    if (modo === 'dibujo') {
      drawSuelo(); drawAltar();
      for (var i = BAYS; i >= 0; i--) { drawBay(i); if (i >= 1 && i <= N) drawLamp(i, t); }
    } else {
      /* en modo foto no se dibujan lámparas: la foto ya tiene las suyas; solo polvo de luz */
    }
    drawMotas(t);
    hits.reverse();
  }

  function moverFoto() {
    if (!fotoBox || modo !== 'foto') return;
    var s = 1.06 + pScroll * 0.38;
    var dx = -raton.x * 14, dy = -raton.y * 9;
    fotoBox.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
  }

  function loop(t) {
    requestAnimationFrame(loop);
    if (!visible || t - last < 33) return;
    last = t;
    tgt.x = raton.x * 1.1; tgt.y = 2.1 - raton.y * 0.5;
    cam.x += (tgt.x - cam.x) * 0.06; cam.y += (tgt.y - cam.y) * 0.06; cam.z += (tgt.z - cam.z) * 0.08;
    moverFoto();
    pintar(t);
  }

  /* ratón y giroscopio: la vista se inclina un poco */
  addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    raton.x = e.clientX / innerWidth - 0.5; raton.y = e.clientY / innerHeight - 0.5;
  }, { passive: true });
  addEventListener('deviceorientation', function (e) {
    if (e.gamma == null) return;
    raton.x = Math.max(-0.5, Math.min(0.5, e.gamma / 60));
    raton.y = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 80));
  }, { passive: true });

  /* etiqueta y clic sobre las lámparas */
  var tip = document.createElement('div');
  tip.className = 'nave-tip'; tip.hidden = true; document.body.appendChild(tip);
  function lampAt(x, y) {
    for (var i = hits.length - 1; i >= 0; i--) {
      var hh = hits[i], dx = x - hh.x, dy = y - hh.y;
      if (dx * dx + dy * dy < hh.r * hh.r) return hh.n;
    }
    return 0;
  }
  function tapado(el) {
    return el.closest && el.closest('a,button,input,summary,.hero-txt,.intro-txt,.pregunta,.cabecera,.etapa,.mapa,.infografia,.vuelo,.pie');
  }
  /* versión móvil: las lámparas de la portada son solo decorativas (un único camino) */

  function arrancar(m) {
    modo = m;
    if (modo === 'foto') document.body.classList.add('con-foto');
    else if (fotoBox) fotoBox.remove();
    addEventListener('resize', resize);
    addEventListener('scroll', function () { onScroll(); if (reduce) moverFoto(); }, { passive: true });
    document.addEventListener('visibilitychange', function () { visible = !document.hidden; });
    resize(); cam.z = tgt.z; moverFoto();
    if (reduce) pintar(0); else requestAnimationFrame(loop);
  }

  if (foto) {
    var decidir = function () { arrancar(foto.naturalWidth ? 'foto' : 'dibujo'); };
    if (foto.complete) decidir(); else { foto.addEventListener('load', decidir); foto.addEventListener('error', decidir); }
  } else arrancar('dibujo');
})();
