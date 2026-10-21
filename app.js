/* מדריך Claude נקי — שני מסלולים, מסך אחד בכל פעם.
   בלי JavaScript הדף מציג את כל המסכים ברצף, וזה בסדר גמור. */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var all = Array.prototype.slice.call(document.querySelectorAll('.step'));
  if (!all.length) { return; }

  var startScreen = all.filter(function (s) { return s.dataset.track === 'start'; })[0];
  var tracks = {
    harry: all.filter(function (s) { return s.dataset.track === 'harry'; }),
    manual: all.filter(function (s) { return s.dataset.track === 'manual'; })
  };

  var nav = document.getElementById('nav');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var switchBtn = document.getElementById('switchBtn');
  var bar = document.getElementById('progressBar');
  var label = document.getElementById('progressLabel');
  var track = bar.parentElement;
  var live = document.getElementById('liveRegion');

  var currentTrack = null;   // null = מסך הבחירה
  var current = 0;

  function render(announce) {
    var list = currentTrack ? tracks[currentTrack] : [];
    var active = currentTrack ? list[current] : startScreen;

    all.forEach(function (s) { s.hidden = (s !== active); });

    nav.hidden = !currentTrack;
    switchBtn.hidden = !currentTrack;

    if (currentTrack) {
      var last = list.length - 1;
      bar.style.width = ((current / last) * 100) + '%';
      track.setAttribute('aria-valuemax', String(last));
      track.setAttribute('aria-valuenow', String(current));
      prevBtn.disabled = (current === 0);
      nextBtn.disabled = (current === last);
    } else {
      bar.style.width = '0%';
      track.setAttribute('aria-valuemax', '1');
      track.setAttribute('aria-valuenow', '0');
    }

    var text = active.getAttribute('data-label') || '';
    label.textContent = text;

    var hash = currentTrack ? ('#' + currentTrack + '-' + current) : '#start';
    if (history.replaceState) { history.replaceState(null, '', hash); }
    else { location.hash = hash.slice(1); }

    if (announce) {
      live.textContent = text;
      var h = active.querySelector('h1');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
      window.scrollTo(0, 0);
    }
  }

  function go(name, index, announce) {
    currentTrack = tracks[name] ? name : null;
    var max = currentTrack ? tracks[currentTrack].length - 1 : 0;
    current = Math.max(0, Math.min(max, index || 0));
    render(announce);
  }

  /* בחירת מסלול */
  startScreen.addEventListener('click', function (e) {
    var card = e.target.closest ? e.target.closest('[data-go]') : null;
    if (card) { go(card.getAttribute('data-go'), 0, true); }
  });

  switchBtn.addEventListener('click', function () { go(null, 0, true); });
  prevBtn.addEventListener('click', function () { go(currentTrack, current - 1, true); });
  nextBtn.addEventListener('click', function () { go(currentTrack, current + 1, true); });

  /* העתקת משפט */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.copy') : null;
    if (!btn) { return; }

    var fig = btn.parentElement;
    var pre = fig.querySelector('pre');
    var quote = fig.querySelector('blockquote');
    if (!pre && !quote) { return; }

    /* בלוק רב-שורות נשמר כמו שהוא; משפט רגיל מתכווץ לשורה אחת */
    var text = pre
      ? pre.textContent.replace(/^\n+/, '').replace(/\s+$/, '')
      : quote.textContent.replace(/\s+/g, ' ').trim();

    var done = function () {
      btn.classList.add('done');
      var was = btn.dataset.label || btn.textContent;
      btn.dataset.label = was;
      btn.textContent = 'הועתק';
      live.textContent = 'הטקסט הועתק';
      setTimeout(function () {
        btn.classList.remove('done');
        btn.textContent = was;
      }, 1800);
    };

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

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  });

  /* חזרה למקום שבכתובת — בטעינה ובכפתור "אחורה" של הדפדפן */
  function parseHash() {
    var m = (location.hash || '').match(/^#(harry|manual)-(\d+)$/);
    return m ? { name: m[1], index: parseInt(m[2], 10) } : { name: null, index: 0 };
  }

  window.addEventListener('hashchange', function () {
    var h = parseHash();
    if (h.name !== currentTrack || h.index !== current) { go(h.name, h.index, true); }
  });

  var start = parseHash();
  go(start.name, start.index, false);
})();
