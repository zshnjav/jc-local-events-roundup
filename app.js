'use strict';

var TZ = 'America/New_York';

var state = {
  events: [],
  filters: { freebie: false, free: false, hideArts: true, dateNight: false, toddler: false },
  region: 'all',
  query: ''
};

var REGION_LABELS = {
  local_nj: 'Jersey City & nearby',
  destination_nj: 'NJ day trip',
  nyc: 'NYC'
};

var AUDIENCE_LABELS = {
  family: 'Family',
  date_night: 'Date night',
  both: 'Family + Date night'
};

var TODDLER_LABELS = {
  high: 'Toddler: great fit',
  moderate: 'Toddler: okay',
  low: 'Toddler: tricky'
};

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ---------- Date helpers (all in America/New_York) ---------- */

function todayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
}

function addDays(key, n) {
  var parts = key.split('-').map(Number);
  var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + n));
  return d.toISOString().slice(0, 10);
}

function parseDT(s) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    var p = s.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2], 12, 0, 0); // local noon: no TZ shift
  }
  return new Date(s);
}

function keyOf(d) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(d);
}

function fmtDay(d) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric'
  }).format(d);
}

function fmtDayShort(d) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, month: 'short', day: 'numeric'
  }).format(d);
}

function fmtTime(d) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour: 'numeric', minute: '2-digit'
  }).format(d);
}

function fmtWhen(ev) {
  var s = parseDT(ev.start_at);
  var startDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(ev.start_at);
  var out = fmtDay(s);
  if (!startDateOnly) out += ' · ' + fmtTime(s);
  if (ev.end_at) {
    var e = parseDT(ev.end_at);
    var endDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(ev.end_at);
    if (keyOf(s) === keyOf(e)) {
      if (!endDateOnly) out += ' – ' + fmtTime(e);
    } else {
      out += ' → ' + fmtDay(e);
      if (!endDateOnly) out += ' · ' + fmtTime(e);
    }
  }
  return out;
}

function fmtUpdated(ts) {
  if (!ts) return 'Last updated: unknown';
  var d = new Date(ts);
  var date = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric'
  }).format(d);
  var time = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
  }).format(d);
  return 'Last updated ' + date + ' · ' + time;
}

/* ---------- Filtering ---------- */

function passesFilters(ev) {
  var f = state.filters;
  if (f.freebie && !ev.is_freebie) return false;
  if (f.free && !ev.is_free) return false;
  if (f.hideArts && ev.is_arts) return false;
  if (f.dateNight && !(ev.is_date_night || ev.audience === 'date_night')) return false;
  if (f.toddler && ev.toddler_fit !== 'high') return false;
  if (state.region !== 'all' && ev.region !== state.region) return false;
  if (state.query) {
    var hay = [ev.title, ev.venue, ev.city, ev.summary]
      .filter(Boolean).join(' ').toLowerCase();
    if (hay.indexOf(state.query) === -1) return false;
  }
  return true;
}

/* ---------- Card rendering ---------- */

function cardHTML(ev) {
  var badges = [];
  if (ev.is_free) badges.push('<span class="badge free">Free</span>');
  if (ev.is_freebie) badges.push('<span class="badge freebie">Freebie</span>');
  if (ev.category) badges.push('<span class="tag">' + esc(ev.category) + '</span>');
  if (ev.audience && AUDIENCE_LABELS[ev.audience]) {
    badges.push('<span class="tag">' + esc(AUDIENCE_LABELS[ev.audience]) + '</span>');
  }
  if (ev.toddler_fit && TODDLER_LABELS[ev.toddler_fit]) {
    badges.push('<span class="tag">&#129490; ' + esc(TODDLER_LABELS[ev.toddler_fit]) + '</span>');
  }
  if (ev.region && REGION_LABELS[ev.region]) {
    badges.push('<span class="tag">' + esc(REGION_LABELS[ev.region]) + '</span>');
  }

  var freebieBox = '';
  if (ev.is_freebie) {
    var what = ev.freebie_what ? '<p><strong>What\'s free:</strong> ' + esc(ev.freebie_what) + '</p>' : '';
    var catchLine = ev.freebie_catch ? '<p><strong>The catch:</strong> ' + esc(ev.freebie_catch) + '</p>' : '';
    freebieBox = '<div class="freebie-box">' + what + catchLine + '</div>';
  }

  var caveat = ev.caveat ? '<p><strong>Heads up:</strong> ' + esc(ev.caveat) + '</p>' : '';
  var verification = ev.verification === 'verified'
    ? '<span class="verified">&#10003; Verified</span>'
    : '<span class="provisional">&#9681; Provisional &mdash; details may change</span>';
  var source = (ev.source_url && ev.source_name)
    ? '<p><strong>Source:</strong> <a class="source-link" href="' + esc(ev.source_url) + '" target="_blank" rel="noopener noreferrer">' + esc(ev.source_name) + '</a></p>'
    : '';

  return '<article class="card' + (ev.is_featured ? ' featured' : '') + '">' +
    '<div class="card-top"><h3>' + esc(ev.title) + '</h3>' +
    (ev.is_featured ? '<span class="star" title="Featured pick" aria-label="Featured pick">&#9733;</span>' : '') +
    '</div>' +
    '<div class="badges">' + badges.join('') + '</div>' +
    '<div class="when">' + esc(fmtWhen(ev)) + '</div>' +
    '<div class="where">' + esc(ev.venue || '') + (ev.city ? ' &middot; ' + esc(ev.city) : '') + '</div>' +
    (ev.cost_label ? '<div class="cost">' + esc(ev.cost_label) + '</div>' : '') +
    freebieBox +
    (ev.summary ? '<p class="summary">' + esc(ev.summary) + '</p>' : '') +
    '<details><summary>Why it\'s legit</summary>' +
      '<p>' + esc(ev.legitimacy_note || 'No background notes.') + '</p>' +
      caveat +
      '<p><strong>Status:</strong> ' + verification + '</p>' +
      source +
    '</details>' +
  '</article>';
}

/* ---------- Grouping & render ---------- */

function weekOf(dateKey, bounds) {
  if (dateKey <= bounds.w1End) return 0;      // ongoing / this week
  if (dateKey <= bounds.w2End) return 1;
  if (dateKey <= bounds.w3End) return 2;
  return 3;                                   // later
}

function render() {
  var groupsEl = document.getElementById('event-groups');
  var emptyEl = document.getElementById('empty-state');
  var countEl = document.getElementById('result-count');

  var today = todayKey();
  var bounds = {
    w1End: addDays(today, 6),
    w2End: addDays(today, 13),
    w3End: addDays(today, 20)
  };
  var w1Start = today;
  var w2Start = addDays(today, 7);
  var w3Start = addDays(today, 14);

  var buckets = [[], [], [], []];
  state.events.forEach(function (ev) {
    if (!ev.date_key || !passesFilters(ev)) return;
    buckets[weekOf(ev.date_key, bounds)].push(ev);
  });
  buckets.forEach(function (b) {
    b.sort(function (a, c) { return (a.editorial_rank || 99) - (c.editorial_rank || 99); });
  });

  var total = buckets[0].length + buckets[1].length + buckets[2].length + buckets[3].length;
  countEl.textContent = total === 1 ? '1 event' : total + ' events';

  var defs = [
    { title: 'Week 1', range: fmtDayShort(parseDT(w1Start)) + ' – ' + fmtDayShort(parseDT(bounds.w1End)) },
    { title: 'Week 2', range: fmtDayShort(parseDT(w2Start)) + ' – ' + fmtDayShort(parseDT(bounds.w2End)) },
    { title: 'Week 3', range: fmtDayShort(parseDT(w3Start)) + ' – ' + fmtDayShort(parseDT(bounds.w3End)) },
    { title: 'Later', range: '' }
  ];

  var html = '';
  buckets.forEach(function (b, i) {
    if (!b.length) return;
    html += '<section class="week-group"><div class="week-heading"><h2>' + defs[i].title + '</h2>' +
      (defs[i].range ? '<span class="week-range">' + esc(defs[i].range) + '</span>' : '') +
      '</div><div class="cards">' +
      b.map(cardHTML).join('') +
      '</div></section>';
  });

  groupsEl.innerHTML = html;
  emptyEl.hidden = total !== 0;
  groupsEl.hidden = total === 0;
}

/* ---------- Wiring ---------- */

function wireControls() {
  document.querySelectorAll('#toggle-filters .pill').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-filter');
      state.filters[key] = !state.filters[key];
      btn.classList.toggle('active', state.filters[key]);
      btn.setAttribute('aria-pressed', String(state.filters[key]));
      render();
    });
  });

  document.querySelectorAll('#region-filter .seg').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.region = btn.getAttribute('data-region');
      document.querySelectorAll('#region-filter .seg').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      render();
    });
  });

  var search = document.getElementById('search');
  var t = null;
  search.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      state.query = search.value.trim().toLowerCase();
      render();
    }, 120);
  });

  document.getElementById('clear-filters').addEventListener('click', function () {
    state.filters = { freebie: false, free: false, hideArts: false, dateNight: false, toddler: false };
    state.region = 'all';
    state.query = '';
    search.value = '';
    document.querySelectorAll('#toggle-filters .pill').forEach(function (b) {
      var on = state.filters[b.getAttribute('data-filter')];
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('#region-filter .seg').forEach(function (b) {
      var on = b.getAttribute('data-region') === 'all';
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    render();
  });
}

/* ---------- Boot ---------- */

function boot() {
  wireControls();
  fetch('data/events.json')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      state.events = Array.isArray(data.events) ? data.events : [];
      var ts = (data.refresh && data.refresh.as_of) || data.generated_at;
      document.getElementById('last-updated').textContent = fmtUpdated(ts);
      render();
    })
    .catch(function (err) {
      document.getElementById('last-updated').textContent = 'Could not load events';
      document.getElementById('event-groups').innerHTML =
        '<div class="empty-state"><h2>Couldn\'t load the event data</h2>' +
        '<p>Make sure you\'re serving this folder over HTTP (not file://) so data/events.json can load.</p></div>';
      // eslint-disable-next-line no-console
      console.error('Failed to load events.json:', err);
    });
}

document.addEventListener('DOMContentLoaded', boot);
