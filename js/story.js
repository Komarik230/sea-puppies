/* æ-æ-æ-tchi — the flow: switch on → count → map → meet your sea lion → eight needs in any order → release. */
(function () {
  'use strict';
  const SP = window.SP, device = SP.device;
  const $ = id => document.getElementById(id);
  const ORDER = SP.ORDER;
  const INTRO = ['intro.count', 'intro.map', 'intro.meet', 'intro.rules'];
  const FINALE = ['finale.release', 'finale.end'];
  const chapter = cat => [cat + '.game', cat + '.chart'];

  const ST = { mode: 'off', i: 0, cat: null, cursor: 0, done: {}, prog: {}, met: false, name: '' };
  SP.state = ST;

  const ui = k => SP.t('ui', k);
  const allDone = () => ORDER.every(c => ST.done[c]);

  function setName(v) {
    ST.name = (v || '').trim().slice(0, 12) || ui('name.default') || 'Zalo';
    SP.vars.name = ST.name;
    try { localStorage.setItem('aeaeae-name', ST.name); } catch (e) { /* private mode */ }
  }

  function stepKey() {
    if (ST.mode === 'intro') return INTRO[ST.i];
    if (ST.mode === 'chapter') return chapter(ST.cat)[ST.i];
    if (ST.mode === 'finale') return FINALE[ST.i];
    return ST.mode; // 'off' | 'menu'
  }

  // ------------------------------------------------------------------ panel
  function notesHTML(b) {
    let h = '';
    if (b.finding) h += '<div class="note note-finding"><h3>' + SP.inline(ui('label.finding')) + '</h3>' + SP.md(b.finding) + '</div>';
    if (b.method) h += '<div class="note note-method"><h3>' + SP.inline(ui('label.method')) + '</h3>' + SP.md(b.method) + '</div>';
    if (b.source && b.source.length) h += '<div class="note note-sources"><h3>' + SP.inline(ui('label.sources')) + '</h3><ul>' + b.source.map(s => '<li>' + SP.sourceHTML(s) + '</li>').join('') + '</ul></div>';
    return h;
  }
  function allSourcesHTML() {
    const seen = new Set(), items = [];
    Object.keys(SP.copy).forEach(k => (SP.copy[k].source || []).forEach(s => {
      const url = s.slice(s.lastIndexOf('|') + 1).trim();
      if (seen.has(url)) return; seen.add(url); items.push(s);
    }));
    return '<div class="note note-sources"><h3>' + SP.inline(ui('label.all.sources')) + '</h3><ul>' + items.map(s => '<li>' + SP.sourceHTML(s) + '</li>').join('') + '</ul></div>';
  }

  function renderMeters() {
    const box = $('pMeters');
    box.hidden = !ST.met;
    if (!ST.met) return;
    $('metersTitle').textContent = SP.fill(ui('meters.title'));
    const list = $('meterList');
    list.innerHTML = '';
    ORDER.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'meter' + (ST.done[c] ? ' is-done' : '') + (((ST.mode === 'menu' && ST.cursor === i) || (ST.mode === 'chapter' && ST.cat === c)) ? ' is-current' : '');
      const segs = Math.round((ST.done[c] ? 1 : (ST.prog[c] || 0)) * 4);
      let bar = '';
      for (let s = 0; s < 4; s++) bar += '<i' + (s < segs ? ' class="on"' : '') + '></i>';
      b.innerHTML = '<img alt="" src="' + SP.spriteURL('i_' + c, 2, ST.done[c] ? '#ff8f3d' : '#e8dec5') + '"><span class="m-name">' + SP.inline(ui('need.' + c)) + '</span><span class="m-bar" aria-hidden="true">' + bar + '</span>' + (ST.done[c] ? '<span class="sr">' + SP.inline(ui('label.done')) + '</span>' : '');
      b.setAttribute('aria-label', ui('need.' + c) + ': ' + segs + '/4' + (ST.done[c] ? ', ' + ui('label.done') : ''));
      b.addEventListener('click', () => { if (ST.mode === 'menu' || ST.mode === 'chapter') { ST.cursor = i; openChapter(c); } });
      list.appendChild(b);
    });
  }

  function renderPanel() {
    const key = stepKey();
    const b = SP.copy[key] || {};
    let text = b.text || '';
    if (ST.mode === 'menu') {
      const cat = ORDER[ST.cursor];
      text = ((SP.copy['menu.' + cat] || {}).text || '') + (ST.done[cat] ? ' ✓' : '') + '\n\n' + (b.text || '');
    }
    $('pTitle').textContent = SP.fill(b.title || '');
    $('pText').innerHTML = SP.md(text);
    // naming
    const meet = key === 'intro.meet';
    $('pName').hidden = !meet;
    if (meet) {
      $('nameLabel').textContent = ui('name.label');
      const inp = $('petName');
      if (document.activeElement !== inp) inp.value = ST.name;
      $('pAfter').innerHTML = SP.md(b.after || '');
    }
    // notes
    let notes = notesHTML(b);
    if (key === 'off' && b.credit) notes = '<p class="credit">' + SP.inline(b.credit) + '</p>';
    if (key === 'finale.end') notes = notesHTML({ source: b.source }) + allSourcesHTML() + (b.credit ? '<p class="credit">' + SP.inline(b.credit) + '</p>' : '');
    $('pNotes').innerHTML = notes;
    $('againBtn').hidden = key !== 'finale.end';
    $('againBtn').textContent = ui('btn.again');
    renderMeters();
    // keys
    let hint = 'keys.off';
    if (ST.mode === 'intro') hint = 'keys.intro';
    if (ST.mode === 'menu') hint = 'keys.menu';
    if (ST.mode === 'chapter') hint = ST.i === chapter(ST.cat).length - 1 ? 'keys.last' : 'keys.step';
    if (ST.mode === 'finale') hint = ST.i === FINALE.length - 1 ? 'keys.end' : 'keys.finale';
    $('keyHint').textContent = ui(hint);
    $('kL').setAttribute('aria-label', ui('btn.left')); $('kM').setAttribute('aria-label', ui('btn.middle')); $('kR').setAttribute('aria-label', ui('btn.right'));
    $('btnL').setAttribute('aria-label', ui('btn.left')); $('btnM').setAttribute('aria-label', ui('btn.middle')); $('btnR').setAttribute('aria-label', ui('btn.right'));
    $('btnPower').setAttribute('aria-label', ui('btn.power'));
    $('lcd').setAttribute('aria-label', SP.t(key, 'alt') || '');
    $('pMain').scrollTop = 0;
  }

  // ------------------------------------------------------------------ flow
  function show() {
    const key = stepKey();
    device.cursor = ST.mode === 'menu' ? ST.cursor : (ST.mode === 'chapter' ? ORDER.indexOf(ST.cat) : -1);
    device.sweep = key === 'intro.rules';
    if (ST.mode === 'chapter') {
      const n = chapter(ST.cat).length;
      ST.prog[ST.cat] = Math.max(ST.prog[ST.cat] || 0, (ST.i + 1) / n * 0.75);
    }
    if (key === 'intro.meet' || key === 'intro.rules') ST.met = true;
    SP.setScene(key);
    renderPanel();
    document.body.dataset.step = key;
  }
  function go(mode, i) { ST.mode = mode; ST.i = i || 0; show(); }
  function openChapter(cat) { ST.cat = cat; go('chapter', 0); }
  function nextUndone(from) {
    for (let k = 1; k <= ORDER.length; k++) { const c = ORDER[(from + k) % ORDER.length]; if (!ST.done[c]) return (from + k) % ORDER.length; }
    return from;
  }
  function complete() {
    const c = ST.cat;
    ST.done[c] = true; ST.prog[c] = 1; device.done[c] = true;
    SP.audio.play('jingle');
    if (allDone()) return go('finale', 0);
    ST.cursor = nextUndone(ORDER.indexOf(c));
    go('menu');
  }

  function powerOn() {
    SP.lcd.on = true;
    document.body.classList.remove('is-off');
    SP.audio.play('powerOn');
    if (ST.met) go('menu'); else go('intro', 0);
  }
  function powerOff() {
    SP.lcd.on = false;
    document.body.classList.add('is-off');
    SP.audio.play('powerOff');
    go('off');
  }

  function onPress(b) {
    if (b === 'POWER') return ST.mode === 'off' ? powerOn() : powerOff();
    if (ST.mode === 'off') return powerOn();
    if (ST.mode === 'intro') {
      if (INTRO[ST.i] === 'intro.meet') setName($('petName').value);
      if (b === 'L') { if (ST.i > 0) go('intro', ST.i - 1); return; }
      if (ST.i < INTRO.length - 1) go('intro', ST.i + 1); else go('menu');
      return;
    }
    if (ST.mode === 'menu') {
      if (b === 'L') { ST.cursor = (ST.cursor + ORDER.length - 1) % ORDER.length; show(); return; }
      if (b === 'R') { ST.cursor = (ST.cursor + 1) % ORDER.length; show(); return; }
      return openChapter(ORDER[ST.cursor]);
    }
    if (ST.mode === 'chapter') {
      const steps = chapter(ST.cat);
      if (b === 'L') { if (ST.i > 0) go('chapter', ST.i - 1); else go('menu'); return; }
      if (ST.i < steps.length - 1) go('chapter', ST.i + 1); else complete();
      return;
    }
    if (ST.mode === 'finale') {
      if (b === 'L') { if (ST.i > 0) go('finale', ST.i - 1); return; }
      if (ST.i < FINALE.length - 1) go('finale', ST.i + 1);
    }
  }

  function restart() {
    ST.done = {}; ST.prog = {}; ST.met = false; ST.cursor = 0;
    ORDER.forEach(c => { delete device.done[c]; });
    go('intro', 0);
  }

  // ------------------------------------------------------------------ boot
  function boot() {
    document.title = SP.t('meta', 'title') + ' — ' + SP.t('meta', 'description');
    $('mast').textContent = SP.t('meta', 'title');
    let saved = '';
    try { saved = localStorage.getItem('aeaeae-name') || ''; } catch (e) { /* ignore */ }
    setName(saved);
    $('petName').addEventListener('input', e => setName(e.target.value));
    $('petName').addEventListener('change', () => renderMeters());
    [['kL', 'L'], ['kM', 'M'], ['kR', 'R']].forEach(([id, b]) => $(id).addEventListener('click', () => SP.input.press(b)));
    $('againBtn').addEventListener('click', restart);
    const sb = $('soundBtn');
    const paintSound = () => { sb.textContent = ui(SP.audio.muted ? 'btn.sound.off' : 'btn.sound.on'); sb.setAttribute('aria-pressed', String(!SP.audio.muted)); };
    sb.addEventListener('click', () => { SP.audio.setMuted(!SP.audio.muted); paintSound(); });
    paintSound();
    SP.input.handler = onPress;

    // deep links for testing: ?step=food.chart · ?step=menu · ?done=all
    const q = SP.qs.get('step');
    if (SP.qs.get('done') === 'all') ORDER.forEach(c => { ST.done[c] = true; ST.prog[c] = 1; device.done[c] = true; });
    if (q) {
      SP.lcd.on = true; document.body.classList.remove('is-off');
      if (INTRO.includes(q)) { go('intro', INTRO.indexOf(q)); }
      else if (q === 'menu') { ST.met = true; go('menu'); }
      else if (FINALE.includes(q)) { ST.met = true; ORDER.forEach(c => { ST.done[c] = true; device.done[c] = true; }); go('finale', FINALE.indexOf(q)); }
      else {
        const [cat, part] = q.split('.');
        if (ORDER.includes(cat)) { ST.met = true; ST.cursor = ORDER.indexOf(cat); ST.cat = cat; go('chapter', Math.max(0, chapter(cat).indexOf(cat + '.' + part))); }
        else go('off');
      }
    } else go('off');
    SP.startLoop();
  }

  SP.loadCopy().then(boot).catch(err => {
    console.error(err);
    $('pTitle').textContent = 'æ-æ-æ-tchi';
    $('pText').innerHTML = '<p>The text file (copy.txt) did not load. Open the site through a web server, for example: <code>python3 -m http.server</code>, then visit http://localhost:8000.</p>';
    SP.startLoop();
  });
})();
