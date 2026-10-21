/* מדריך Claude נקי — מסלול צעד-צעד.
   בלי JavaScript הדף מציג את כל השלבים ברצף, וזה בסדר גמור. */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var nav = document.getElementById('nav');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var bar = document.getElementById('progressBar');
  var label = document.getElementById('progressLabel');
  var track = bar.parentElement;
  var live = document.getElementById('liveRegion');

  if (!steps.length) { return; }

  nav.hidden = false;
  track.setAttribute('aria-valuemax', String(steps.length - 1));

  var current = 0;

  function show(i, announce) {
    current = Math.max(0, Math.min(steps.length - 1, i));

    steps.forEach(function (s, n) { s.hidden = (n !== current); });

    var pct = (current / (steps.length - 1)) * 100;
    bar.style.width = pct + '%';
    track.setAttribute('aria-valuenow', String(current));

    var text = steps[current].getAttribute('data-label') || '';
    label.textContent = text;

    prevBtn.disabled = (current === 0);
    nextBtn.disabled = (current === steps.length - 1);

    if (history.replaceState) {
      history.replaceState(null, '', '#s' + current);
    } else {
      location.hash = 's' + current;
    }

    if (announce) {
      live.textContent = text;
      var h = steps[current].querySelector('h1');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
      window.scrollTo(0, 0);
    }
  }

  prevBtn.addEventListener('click', function () { show(current - 1, true); });
  nextBtn.addEventListener('click', function () { show(current + 1, true); });

  /* העתקת משפט */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.copy') : null;
    if (!btn) { return; }

    var quote = btn.parentElement.querySelector('blockquote');
    if (!quote) { return; }

    var text = quote.textContent.replace(/\s+/g, ' ').trim();

    var done = function () {
      btn.classList.add('done');
      var was = btn.textContent;
      btn.textContent = 'הועתק';
      live.textContent = 'המשפט הועתק';
      setTimeout(function () {
        btn.classList.remove('done');
        btn.textContent = was;
      }, 1800);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }

    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); }
      catch (err) { live.textContent = 'ההעתקה לא עבדה — אפשר לסמן ולהעתיק ידנית'; }
      document.body.removeChild(ta);
    }
  });

  /* חזרה לשלב שהיה בכתובת — גם בטעינה וגם בכפתור "אחורה" של הדפדפן */
  function fromHash() {
    var n = parseInt((location.hash || '').replace('#s', ''), 10);
    return isNaN(n) ? 0 : n;
  }

  window.addEventListener('hashchange', function () {
    if (fromHash() !== current) { show(fromHash(), true); }
  });

  show(fromHash(), false);
})();
