/* ═══════════════════════════════════════════════════════════
   کافه معدن — صفحهٔ ۴۰۴ · تعاملات (تم دارک)
   ۱) دکمهٔ بازگشت به صفحهٔ قبل (با fallback)
   ۲) ترسیم تدریجی خط مسیر + فعال‌سازی اسکنر
   ۳) ساعت و تاریخ زندهٔ شمسی
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.remove('no-js');
  doc.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── ۱) بازگشت به صفحهٔ قبل ─────────────────────────────── */
  var backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/'; // ورود مستقیم: بازگشت به خانه
      }
    });
  }

  /* ── ۲) ترسیم خط مسیر روی نقشه ──────────────────────────── */
  var sheet = document.querySelector('.sheet');
  var routePath = document.getElementById('route-path');

  function goLive() {
    if (sheet) sheet.classList.add('is-live');
  }

  if (routePath && sheet) {
    if (reduceMotion || typeof routePath.getTotalLength !== 'function' ||
        typeof routePath.animate !== 'function') {
      goLive();
    } else {
      var len = Math.ceil(routePath.getTotalLength());
      routePath.style.strokeDasharray = len;
      routePath.style.strokeDashoffset = len;
      var anim = routePath.animate(
        [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        { duration: 1700, easing: 'cubic-bezier(.55,.1,.3,1)', delay: 250, fill: 'forwards' }
      );
      anim.onfinish = goLive;
      setTimeout(goLive, 3000); // اطمینان در هر شرایط
    }
  }

  /* ── ۳) ساعت و تاریخ زنده (اعداد فارسی) ─────────────────── */
  var clockEl = document.getElementById('live-clock');
  var dateEl  = document.getElementById('sheet-date');
  var yearEl  = document.getElementById('foot-year');
  var timerId = null;

  var timeFmt = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  var dateFmt = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  var yearFmt = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' });

  function now() { return new Date(); }

  function tickClock() {
    if (clockEl) clockEl.textContent = timeFmt.format(now());
  }

  function startClock() {
    tickClock();
    if (!timerId) timerId = setInterval(tickClock, 1000);
  }
  function stopClock() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  if (clockEl) {
    startClock();
    // توقف ساعت وقتی تب غیرفعال است (بهینه‌سازی)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stopClock(); } else { startClock(); }
    });
  }

  if (dateEl) dateEl.textContent = dateFmt.format(now());
  if (yearEl) yearEl.textContent = yearFmt.format(now());
})();