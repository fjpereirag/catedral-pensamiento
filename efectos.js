/* La Catedral del Pensamiento · efectos
   - Foto 3D: si existe el mapa de profundidad (foto-xx-prof.webp, hecho en Colab), la foto se mueve en 3D con WebGL ligero.
   - Polvo de luz sobre las fotos, chispas al encender, títulos palabra a palabra, inclinación 3D al pasar el ratón.
   Todo se pausa fuera de pantalla y respeta «reducir movimiento». */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = matchMedia('(pointer: fine)').matches;
  var P = { x: 0, y: 0, tx: 0, ty: 0, activo: false };
  addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    P.tx = e.clientX / innerWidth - 0.5; P.ty = e.clientY / innerHeight - 0.5; P.activo = true;
  }, { passive: true });
  addEventListener('deviceorientation', function (e) {
    if (e.gamma == null) return;
    P.tx = Math.max(-0.5, Math.min(0.5, e.gamma / 50)); P.ty = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 70)); P.activo = true;
  }, { passive: true });

  /* bucle común a 30 fps; cada efecto se registra y solo corre si está a la vista */
  var tareas = [];
  function registrar(el, fn) {
    var t = { el: el, fn: fn, vis: false };
    tareas.push(t);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { t.vis = es[0].isIntersecting; }).observe(el);
    else t.vis = true;
    return t;
  }
  var last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden || now - last < 33) return;
    last = now;
    P.x += (P.tx - P.x) * 0.07; P.y += (P.ty - P.y) * 0.07;
    for (var i = 0; i < tareas.length; i++) if (tareas[i].vis) tareas[i].fn(now);
  }

  /* ---------- foto 3D por profundidad ---------- */
  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*0.5+0.5;v.y=1.0-v.y;gl_Position=vec4(p,0.,1.);}';
  var FS = 'precision mediump float;varying vec2 v;uniform sampler2D img;uniform sampler2D dep;uniform vec2 m;uniform vec2 esc;uniform vec2 off;' +
    'void main(){vec2 uv=(v-0.5)*esc+0.5+off;float d=texture2D(dep,uv).r;vec2 q=uv+m*(d-0.45);gl_FragColor=texture2D(img,q);}';
  function foto3D(img) {
    if (reduce) return;
    var src = img.currentSrc || img.src;
    if (!/\.webp$/.test(src)) return;
    var dep = new Image();
    dep.onload = function () { montar(img, dep); };
    dep.src = src.replace(/\.webp$/, '-prof.webp');
  }
  function montar(img, dep) {
    var cv = document.createElement('canvas');
    var gl = cv.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    function tex(u, el) {
      var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + u); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, el);
    }
    try { tex(0, img); tex(1, dep); } catch (e) { return; }
    gl.uniform1i(gl.getUniformLocation(pr, 'img'), 0); gl.uniform1i(gl.getUniformLocation(pr, 'dep'), 1);
    var um = gl.getUniformLocation(pr, 'm'), ue = gl.getUniformLocation(pr, 'esc'), uo = gl.getUniformLocation(pr, 'off');
    cv.className = 'foto3d'; cv.setAttribute('aria-hidden', 'true');
    img.parentNode.insertBefore(cv, img.nextSibling);
    img.classList.add('con-3d');
    var fuerza = +(img.closest('[data-foto3d]').getAttribute('data-foto3d') || 0.03);
    var cw = 0, ch = 0;
    function tam() {
      var r = cv.getBoundingClientRect(), k = Math.min(devicePixelRatio || 1, 1.25);
      cw = Math.max(1, Math.round(r.width * k)); ch = Math.max(1, Math.round(r.height * k));
      cv.width = cw; cv.height = ch; gl.viewport(0, 0, cw, ch);
      // «cover» con un 6 % de margen para que el desplazamiento no deje bordes
      var ai = img.naturalWidth / img.naturalHeight, ac = cw / ch, sx = 0.94, sy = 0.94;
      if (ac > ai) sy *= ai / ac; else sx *= ac / ai;
      gl.uniform2f(ue, sx, sy);
    }
    tam(); addEventListener('resize', tam);
    registrar(cv, function (t) {
      var ax = P.activo ? P.x : Math.sin(t / 3200) * 0.35, ay = P.activo ? P.y : Math.cos(t / 4100) * 0.2;
      var r = cv.getBoundingClientRect(), sc = (r.top + r.height / 2) / innerHeight - 0.5;
      gl.uniform2f(um, -ax * fuerza * 2, -(ay * fuerza + sc * fuerza * 0.8));
      gl.uniform2f(uo, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
  }
  function prepararFotos3D() {
    document.querySelectorAll('[data-foto3d] img').forEach(function (img) {
      if (img.complete && img.naturalWidth) foto3D(img);
      else img.addEventListener('load', function () { foto3D(img); }, { once: true });
    });
  }

  /* ---------- polvo de luz ---------- */
  function motas(caja, opts) {
    if (reduce) return;
    opts = opts || {};
    var cv = document.createElement('canvas'); cv.className = 'motas'; cv.setAttribute('aria-hidden', 'true');
    caja.appendChild(cv);
    var c = cv.getContext('2d'), w = 0, h = 0, arr = [], n = opts.n || 46, chispa = !!opts.chispas;
    function tam() { var r = caja.getBoundingClientRect(); w = cv.width = Math.round(r.width); h = cv.height = Math.round(r.height); }
    function nueva(m, ini) {
      m = m || {};
      m.x = Math.random() * w; m.y = ini ? Math.random() * h : h + 10;
      m.vy = (chispa ? 0.6 : 0.18) + Math.random() * (chispa ? 1.2 : 0.4);
      m.r = chispa ? 0.8 + Math.random() * 1.6 : 0.6 + Math.random() * 1.8;
      m.f = Math.random() * 6.28; m.v = 0.3 + Math.random() * 0.7;
      return m;
    }
    tam(); for (var i = 0; i < n; i++) arr.push(nueva(null, true));
    addEventListener('resize', tam);
    registrar(caja, function (t) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < arr.length; i++) {
        var m = arr[i];
        m.y -= m.vy; m.x += Math.sin(t / 1400 + m.f) * 0.35;
        if (m.y < -10) nueva(m);
        var a = (0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t / 600 + m.f))) * m.v * Math.min(1, m.y / (h * 0.35));
        c.fillStyle = chispa ? 'rgba(255,190,110,' + a.toFixed(3) + ')' : 'rgba(255,230,180,' + a.toFixed(3) + ')';
        c.beginPath(); c.arc(m.x, m.y, m.r, 0, 6.283); c.fill();
      }
    });
  }

  /* ---------- chispas al encender ---------- */
  function chispas(el) {
    if (reduce) return;
    var r = el.getBoundingClientRect(), cv = document.createElement('canvas'), c = cv.getContext('2d');
    cv.className = 'chispas'; cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
    var ox = r.left + r.width / 2, oy = r.top + r.height / 2, ps = [];
    for (var i = 0; i < 70; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 2 + Math.random() * 7;
      ps.push({ x: ox + (Math.random() - 0.5) * r.width * 0.6, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 1 + Math.random() * 2.4, vida: 1 });
    }
    var t0 = performance.now();
    (function paso(now) {
      c.clearRect(0, 0, cv.width, cv.height);
      var vivos = 0;
      ps.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.vx *= 0.985; p.vida -= 0.014;
        if (p.vida <= 0) return; vivos++;
        c.fillStyle = 'rgba(255,' + (190 + Math.round(50 * p.vida)) + ',120,' + p.vida.toFixed(3) + ')';
        c.beginPath(); c.arc(p.x, p.y, p.r * p.vida + 0.3, 0, 6.283); c.fill();
      });
      if (vivos && now - t0 < 2500) requestAnimationFrame(paso); else cv.remove();
    })(t0);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-encender]');
    if (!b) return;
    setTimeout(function () {
      if (b.getAttribute('aria-pressed') === 'true') {
        chispas(b);
        var lf = document.querySelector('.lamp-foto');
        if (lf && !reduce) { lf.classList.remove('destello'); void lf.offsetWidth; lf.classList.add('destello'); }
      }
    }, 0);
  });

  /* ---------- títulos palabra a palabra ---------- */
  function palabras(h) {
    if (reduce || !h || h.dataset.partido) return;
    h.dataset.partido = '1';
    var txt = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = txt.map(function (p, i) {
      return '<span class="pal" aria-hidden="true"><span style="--i:' + i + '">' + p + '</span></span>';
    }).join(' ');
    requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('pal-in'); }); });
  }

  /* ---------- inclinación 3D al pasar el ratón ---------- */
  function inclinar(el) {
    if (reduce || !fino) return;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(900px) rotateY(' + (x * 9).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg) scale(1.02)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  }

  /* ---------- paralaje de la foto de la lámpara ---------- */
  function paralaje() {
    var lf = document.querySelector('.lamp-foto');
    if (!lf || reduce) return;
    function mov() { var y = Math.min(scrollY, innerHeight) * 0.28; lf.style.setProperty('--py', y.toFixed(1) + 'px'); }
    addEventListener('scroll', mov, { passive: true }); mov();
  }

  /* ---------- rosetón: dibujar y girar al verlo ---------- */
  function roseton() {
    var svg = document.getElementById('mapa-svg');
    if (!svg) return;
    if (reduce || !('IntersectionObserver' in window)) { svg.classList.add('dibujado'); return; }
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { svg.classList.add('dibujado'); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(svg);
  }

  function iniciar() {
    palabras(document.querySelector('.hero h1'));
    palabras(document.querySelector('.lamp-cab h1'));
    palabras(document.querySelector('.altar-hero h1'));
    palabras(document.querySelector('.etapa-hero h1'));
    var eh = document.querySelector('.etapa-hero'); if (eh) motas(eh, { n: 40 });
    var lf = document.querySelector('.lamp-foto'); if (lf) motas(lf, { n: 50 });
    var ah = document.querySelector('.altar-hero'); if (ah) motas(ah, { n: 60, chispas: true });
    var vc = document.querySelector('.vuelo-escena'); if (vc) motas(vc, { n: 40 });
    document.querySelectorAll('.etapa-foto,.infografia figure').forEach(inclinar);
    paralaje(); roseton(); prepararFotos3D();
    requestAnimationFrame(loop);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
