/* ==========================================================================
   XV de Ximena (muestra de Invitara): sobre, música, cuenta regresiva,
   apariciones, mapas, galería, calendario y confeti de pétalos.
   ========================================================================== */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FECHA = new Date('2027-03-13T17:00:00-06:00');

  /* ---------- música ---------- */
  var audio = $('audio'), botonMusica = $('boton-musica');
  function tocar() {
    if (!audio) return;
    var p = audio.play();
    if (p && p.then) p.then(function () { botonMusica.classList.add('sonando'); botonMusica.setAttribute('aria-label', 'Pausar música'); }).catch(function () {});
  }
  function pausar() { audio.pause(); botonMusica.classList.remove('sonando'); botonMusica.setAttribute('aria-label', 'Reproducir música'); }
  botonMusica.addEventListener('click', function () { if (audio.paused) tocar(); else pausar(); });
  audio.addEventListener('error', function () { botonMusica.hidden = true; });

  /* ---------- sobre ---------- */
  var sobre = $('sobre');
  function ponerAbre(v) { sobre.style.setProperty('--abre', v); sobre.style.opacity = v > .75 ? String(1 - (v - .75) / .25) : '1'; }
  function cerrarSobre() { sobre.hidden = true; document.body.style.overflow = ''; botonMusica.hidden = false; revisarVisibles(); }
  function abrirSobre() {
    tocar();
    if (reducido) { cerrarSobre(); return; }
    var t0 = performance.now(), dur = 1500;
    (function paso(ahora) {
      var k = Math.min(1, (ahora - t0) / dur);
      ponerAbre(k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
      if (k < 1) requestAnimationFrame(paso); else cerrarSobre();
    })(t0);
  }
  document.body.style.overflow = 'hidden';
  $('abrir-sobre').addEventListener('click', abrirSobre);

  /* ---------- cuenta regresiva ---------- */
  var dd = $('c-dias'), hh = $('c-horas'), mm = $('c-min'), ss = $('c-seg');
  var dos = function (n) { return (n < 10 ? '0' : '') + n; };
  function contar() {
    var r = Math.max(0, Math.floor((FECHA - new Date()) / 1000));
    dd.textContent = Math.floor(r / 86400); hh.textContent = dos(Math.floor(r % 86400 / 3600));
    mm.textContent = dos(Math.floor(r % 3600 / 60)); ss.textContent = dos(r % 60);
  }
  contar(); setInterval(contar, 1000);

  /* ---------- aparición al deslizar ---------- */
  var revelables = [].slice.call(document.querySelectorAll('.revelar'));
  function revisarVisibles() {
    revelables.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * .9) el.classList.add('visto'); });
  }
  if ('IntersectionObserver' in window && !reducido) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    revelables.forEach(function (el) { io.observe(el); });
  } else {
    revelables.forEach(function (el) { el.classList.add('visto'); });
  }

  /* ---------- mapas ---------- */
  [].forEach.call(document.querySelectorAll('[data-mapa]'), function (b) {
    b.addEventListener('click', function () {
      var m = $(b.getAttribute('data-mapa'));
      var abierto = m.classList.toggle('abierto');
      b.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
  });

  /* ---------- galería con visor ---------- */
  var fotos = [].slice.call(document.querySelectorAll('.foto'));
  var visor = $('visor'), actual = 0;
  function mostrar(i) {
    actual = (i + fotos.length) % fotos.length;
    $('visor-svg').innerHTML = fotos[actual].querySelector('svg').outerHTML;
    $('visor-txt').textContent = fotos[actual].querySelector('figcaption').textContent;
  }
  function abrirVisor(i) { mostrar(i); visor.hidden = false; visor.querySelector('.visor__cerrar').focus(); }
  function cerrarVisor() { visor.hidden = true; fotos[actual].focus(); }
  fotos.forEach(function (f, i) {
    f.addEventListener('click', function () { abrirVisor(i); });
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirVisor(i); } });
  });
  visor.querySelector('.visor__cerrar').addEventListener('click', cerrarVisor);
  visor.querySelector('.visor__flecha--ant').addEventListener('click', function () { mostrar(actual - 1); });
  visor.querySelector('.visor__flecha--sig').addEventListener('click', function () { mostrar(actual + 1); });
  visor.addEventListener('click', function (e) { if (e.target === visor) cerrarVisor(); });
  document.addEventListener('keydown', function (e) {
    if (visor.hidden) return;
    if (e.key === 'Escape') cerrarVisor();
    if (e.key === 'ArrowLeft') mostrar(actual - 1);
    if (e.key === 'ArrowRight') mostrar(actual + 1);
  });

  /* ---------- mesa de regalos (muestra) ---------- */
  [].forEach.call(document.querySelectorAll('[data-regalo]'), function (b) {
    b.addEventListener('click', function () {
      b.parentNode.querySelector('.aviso-regalo').textContent = 'En tu invitación, este botón abre tu mesa de regalos.';
    });
  });

  /* ---------- calendario (.ics) ---------- */
  $('boton-calendario').addEventListener('click', function () {
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Invitara//Muestra XV Ximena//ES', 'BEGIN:VEVENT',
      'UID:xv-ximena-muestra@invitara', 'DTSTAMP:20261018T000000Z', 'DTSTART:20270313T230000Z', 'DTEND:20270314T080000Z',
      'SUMMARY:XV años de Ximena (muestra)', 'LOCATION:Querétaro\\, Querétaro',
      'DESCRIPTION:Muestra de Invitara con datos de ejemplo. https://alex10ja1.github.io/invitara-demo-xv-jardin/',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'XV-Ximena-muestra.ics';
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------- confeti de pétalos (lo usa confirmacion.js al confirmar) ---------- */
  var lienzo = $('confeti'), ctx = lienzo.getContext('2d');
  var colores = ['#A9BCA0', '#5F7A61', '#B8924A', '#D9C08C', '#FFFDF8'];
  function confeti() {
    if (reducido) return;
    var dpr = window.devicePixelRatio || 1;
    lienzo.width = innerWidth * dpr; lienzo.height = innerHeight * dpr;
    var ps = [];
    for (var i = 0; i < 90; i++) {
      ps.push({ x: innerWidth / 2 + (Math.random() - .5) * 60, y: innerHeight * .55, vx: (Math.random() - .5) * 9,
        vy: -6 - Math.random() * 8, r: 4 + Math.random() * 5, a: Math.random() * 6, va: (Math.random() - .5) * .3,
        c: colores[i % colores.length] });
    }
    var t0 = performance.now();
    (function paso(ahora) {
      var t = (ahora - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(function (p) {
        p.vy += .25; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.max(0, 1 - t / 2.6);
        ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });
      if (t < 2.6) requestAnimationFrame(paso); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }
  window.InvitacionAnimaciones = { lanzarConfetiExplosion: confeti };

  /* Para grabar el video de la muestra (Playwright): estados fijos sin esperar animaciones. */
  window.XV = {
    abre: ponerAbre,
    cerrarSobre: cerrarSobre,
    revelarTodo: function () { revelables.forEach(function (el) { el.classList.add('visto'); }); },
    confeti: confeti
  };
})();
