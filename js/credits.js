/* SEA PUPPIES — the 2004 homepage at the end, plus the secret level (ronan_beat.exe). */
(function () {
  const SP = window.SP;

  const SOURCES = [
    { h: { en: 'Food', ru: 'Еда' }, items: [
      ['SeaWorld — California sea lion: diet & eating habits', 'https://seaworld.org/animals/all-about/california-sea-lion/diet/'],
      ['Hocking et al. — Chew, shake, and tear: prey processing in Australian sea lions', 'https://researchers.mq.edu.au/en/publications/chew-shake-and-tear-prey-processing-in-australian-sea-lions-neoph/']] },
    { h: { en: 'Sleep', ru: 'Сон' }, items: [
      ['Wildlife Conservation Society — How do sea lions stay warm?', 'https://blog.wcs.org/photo/2022/01/18/how-do-sea-lions-stay-warm-in-new-york-city-new-york-aquarium/'],
      ['Lyamin et al. (2018), Current Biology — Fur seals suppress REM sleep for very long periods', 'https://escholarship.org/uc/item/27q1f7wg'],
      ['Cell Press via EurekAlert — Study of sleeping fur seals', 'https://www.eurekalert.org/news-releases/852320']] },
    { h: { en: 'Play', ru: 'Игра' }, items: [
      ['Llamazares-Martín & Palagi (2021) — Playing at the edge of the sea: otariids and odobenids', 'https://link.springer.com/chapter/10.1007/978-3-030-59184-7_20'],
      ['New College of Florida thesis (2026) — Social play of young California sea lions', 'https://digitalcommons.ncf.edu/theses_etds/7010']] },
    { h: { en: 'Talk', ru: 'Общение' }, items: [
      ['SeaWorld — California sea lion: communication', 'https://seaworld.org/animals/all-about/california-sea-lion/communication'],
      ['Pitcher, Harcourt & Charrier (2010), PLOS ONE — Rapid onset of maternal vocal recognition in the Australian sea lion', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2921350/'],
      ['Charrier & Harcourt (2006), Journal of Mammalogy — Individual vocal identity in mother and pup Australian sea lions', 'https://bioone.org/journals/Journal-of-Mammalogy/volume-87/issue-5/05-MAMM-A-344R3.1/INDIVIDUAL-VOCAL-IDENTITY-IN-MOTHER-AND-PUP-AUSTRALIAN-SEA-LIONS/10.1644/05-MAMM-A-344R3.1.full'],
      ['National Park Service — California sea lion (San Miguel Island, ~80,000)', 'https://www.nps.gov/places/california-sea-lion.htm'],
      ['National Park Service — Channel Islands: California sea lion', 'https://www.nps.gov/chis/learn/nature/sea-lion.htm'],
      ['NOAA Fisheries — California sea lion', 'https://www.fisheries.noaa.gov/species/california-sea-lion'],
      ['Aquarium of the Pacific — California sea lion', 'https://www.aquariumofpacific.org/onlinelearningcenter/species/california_sea_lion'],
      ['DOSITS — California sea lion sounds', 'https://dosits.org/galleries/audio-gallery/marine-mammals/pinnipeds/california-sea-lion']] },
    { h: { en: 'Grooming', ru: 'Уход' }, items: [
      ['Smithsonian’s National Zoo — California sea lion', 'https://nationalzoo.si.edu/node/6830'],
      ['SeaWorld — California sea lion: physical characteristics', 'https://seaworld.org/animals/all-about/california-sea-lion/characteristics/']] },
    { h: { en: 'Rescue', ru: 'Лечение' }, items: [
      ['Raum-Suryan, Jemison & Pitcher (2009), Marine Pollution Bulletin — Entanglement of Steller sea lions in marine debris', 'https://sitkawhalefest.org/wordpress/wp-content/uploads/2025/07/Raum-Suryan-et-al.-2009-ENTANGLEMENTS-SSL.pdf'],
      ['Alaska Department of Fish and Game — “Lose the loop” poster', 'https://newsrelease.adfg.alaska.gov/static/research/programs/marinemammals/pdfs/entanglement_poster_oct_2009.pdf'],
      ['Raum-Suryan & Suryan (2022), Oceans — Steller sea lion entanglement on the central Oregon coast', 'https://doi.org/10.3390/oceans3030022'],
      ['Oregon State University news — Most sea lion entanglements could be prevented (drowning, infection, starvation)', 'https://today.prod.acquia.cws.oregonstate.edu/node/55905'],
      ['NOAA Fisheries — Report an entangled marine mammal', 'https://www.fisheries.noaa.gov/national/marine-life-distress/report-entangled-marine-mammal']] },
    { h: { en: 'Heat & cold', ru: 'Терморегуляция' }, items: [
      ['NOAA Fisheries — Steller sea lion: distress, waving, or thermoregulation?', 'https://www.fisheries.noaa.gov/feature-story/steller-sea-lion-distress-waving-or-itthermoregulation'],
      ['The Marine Mammal Center — Your visual guide to sea lion and seal behavior', 'https://www.marinemammalcenter.org/news/your-visual-guide-to-sea-lion-and-seal-behavior'],
      ['Aquarium of the Pacific — Thermoregulation', 'https://aquariumofpacific.org/blogs/comments/thermoregulation']] },
    { h: { en: 'Accessories', ru: 'Украшения' }, items: [
      ['National Park Service — Elephant seal monitoring FAQ (tags and brands)', 'https://www.nps.gov/articles/elephant-seal-monitoring-faq.htm'],
      ['NOAA Fisheries — California sea lion research at San Miguel Island', 'https://www.fisheries.noaa.gov/alaska/marine-mammal-protection/california-sea-lion-research'],
      ['NOAA Fisheries — 6 ways we study seals and sea lions', 'https://www.fisheries.noaa.gov/feature-story/6-ways-we-study-seals-and-sea-lions'],
      ['The Marine Mammal Center — New hat tags (and orange flipper tags)', 'https://www.marinemammalcenter.org/news/new-hat-tags-improve-animal-care-while-leading-the-way-toward-a-greener-future']] },
    { h: { en: 'Puppy score', ru: 'Щенячий счёт' }, items: [
      ['Wikipedia — Caniformia', 'https://en.wikipedia.org/wiki/Caniformia'],
      ['Paterson et al. (2020), Frontiers in Ecology and Evolution — A total-evidence analysis of pinniped phylogeny', 'https://www.frontiersin.org/articles/10.3389/fevo.2019.00457/full']] },
    { h: { en: 'Secret level', ru: 'Секретный уровень' }, items: [
      ['UC Santa Cruz (2025) — Rhythmically trained sea lion performs as well as humans', 'https://news.ucsc.edu/2025/05/ronan-sea-lion-beats-humans/'],
      ['UC Santa Cruz (2013) — Sea lion defies theory and keeps the beat', 'https://news.ucsc.edu/2013/04/sea-lion-beat/'],
      ['Cook, Hood, Rouse & Reichmuth (2025), Scientific Reports', 'https://doi.org/10.1038/s41598-025-95279-1']] }
  ];

  function renderSources() {
    const box = document.getElementById('sourcesList');
    box.innerHTML = SOURCES.map(g => `<h4>${g.h[SP.lang] || g.h.en}</h4><ul>${g.items.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${t}</a></li>`).join('')}</ul>`).join('');
  }

  function drawOn(canvas, draws) {
    const g = canvas.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.fillStyle = SP.PAL.day['0']; g.fillRect(0, 0, canvas.width, canvas.height);
    draws.forEach(([name, x, y, flip]) => { const c = SP.sprite(name, 'day', flip); if (c) g.drawImage(c, x, y); });
  }

  function drawLogo() {
    const c = document.getElementById('logoCanvas');
    const g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    const text = 'SEA PUPPIES';
    let x = 4;
    const put = (gl, ox, oy, col) => { g.fillStyle = col; for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (gl[j][i] !== '.') g.fillRect(ox + i * 3, oy + j * 3, 3, 3); };
    for (const ch of text) {
      if (ch === ' ') { x += 6; continue; }
      const gl = SP.LETTERS[ch];
      put(gl, x + 2, 9, '#8e352f');
      put(gl, x, 7, '#e8dec5');
      x += 12;
    }
  }

  SP.showCredits = function (instant) {
    document.getElementById('stage').hidden = true;
    document.querySelector('.corner').style.position = 'absolute';
    document.body.classList.add('is-credits');
    const cr = document.getElementById('credits');
    cr.hidden = false;
    drawLogo();
    drawOn(document.getElementById('avLiza'), [['mom', 7, 12, true], ['acc_bow', 19, 10]]);
    drawOn(document.getElementById('avUlyana'), [['mom', 7, 12, false], ['acc_glasses', 13, 18]]);
    renderSources();
    SP.applyI18n(cr);
    window.scrollTo(0, 0);
    const first = cr.querySelector('.win-bar');
    if (first && !instant) { cr.querySelector('#again').focus({ preventScroll: true }); }
  };

  document.getElementById('again').addEventListener('click', () => { location.href = location.pathname; });

  // ================================================================ ronan_beat.exe
  const overlay = document.getElementById('bonus');
  const cv = document.getElementById('beatCanvas');
  const g = cv.getContext('2d');
  const txt = document.getElementById('beatText');
  const startBtn = document.getElementById('beatStart');
  const tapBtn = document.getElementById('beatTap');
  const BEAT = 0.5, COUNT_IN = 4, N = 16;
  let run = null, raf = 0;

  function audioNow() {
    const ctx = SP.audio.ctx;
    if (ctx.getOutputTimestamp) {
      const ts = ctx.getOutputTimestamp();
      if (ts && ts.contextTime) return ts.contextTime + (performance.now() - ts.performanceTime) / 1000;
    }
    return ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0);
  }
  function eventAudioTime(e) {
    const ctx = SP.audio.ctx;
    if (ctx.getOutputTimestamp && e && e.timeStamp) {
      const ts = ctx.getOutputTimestamp();
      if (ts && ts.contextTime) return ts.contextTime + (e.timeStamp - ts.performanceTime) / 1000;
    }
    return audioNow();
  }

  function draw() {
    raf = requestAnimationFrame(draw);
    const P = SP.PAL.day;
    g.fillStyle = P['0']; g.fillRect(0, 0, 128, 72);
    // sand
    g.fillStyle = P['2']; g.fillRect(0, 52, 128, 1);
    g.fillStyle = P['1']; for (let y = 54; y < 72; y += 2) for (let x = (y % 4) ? 2 : 0; x < 128; x += 4) g.fillRect(x, y, 1, 1);
    let bob = 0, beatIdx = -1;
    if (run && SP.audio.ctx) {
      const t = audioNow() - run.t0;
      if (t >= 0) {
        const ph = (t / BEAT) % 1;
        beatIdx = Math.floor(t / BEAT);
        bob = ph < 0.18 ? 2 : (ph < 0.3 ? 1 : 0);
      }
    }
    const c = SP.sprite('mom', 'day', true);
    g.drawImage(c, 40, 28 + bob);
    // notes float when on the beat
    if (bob === 2) { const n = SP.sprite('note', 'day'); g.drawImage(n, 74, 18); }
    // 16 beat lamps
    for (let i = 0; i < N; i++) {
      const x = 8 + i * 7, y = 62;
      g.fillStyle = P['3']; g.fillRect(x, y, 5, 5);
      let col = P['0'];
      if (run) {
        const hit = run.hits[i];
        if (hit != null) col = Math.abs(hit) < 0.06 ? P['3'] : P['2'];
        else if (beatIdx - COUNT_IN > i) col = P['1'];
        if (beatIdx - COUNT_IN === i) col = (hit != null) ? col : P['1'];
      }
      g.fillStyle = col; g.fillRect(x + 1, y + 1, 3, 3);
    }
  }

  function setText(key, vars) { txt.textContent = SP.t(key, vars); }

  function start() {
    const ctx = SP.audio.ensure();
    if (!ctx) { setText('bonus.none'); return; }
    const t0 = ctx.currentTime + 0.9;
    run = { t0, hits: {}, errs: [], done: false };
    for (let i = 0; i < COUNT_IN + N; i++) {
      const at = t0 + i * BEAT;
      const accent = i < COUNT_IN || (i - COUNT_IN) % 4 === 0;
      SP.audio.tone(accent ? 1760 : 1320, 0.03, { type: 'sine', vol: accent ? 0.35 : 0.25, delay: at - ctx.currentTime });
    }
    startBtn.disabled = true; tapBtn.disabled = false; tapBtn.focus();
    const myRun = run;
    const tick = () => {
      if (run !== myRun) return;
      const t = audioNow() - t0;
      const b = Math.floor(t / BEAT);
      if (b < COUNT_IN) setText('bonus.count', { n: Math.max(1, COUNT_IN - Math.max(0, b)) });
      else if (b < COUNT_IN + N) setText('bonus.go', { n: COUNT_IN + N - b });
      if (t > (COUNT_IN + N) * BEAT + 0.4) { finish(); return; }
      setTimeout(tick, 60);
    };
    tick();
  }

  function tap(e) {
    if (!run || run.done) return;
    const at = eventAudioTime(e) - run.t0;
    const k = Math.round(at / BEAT) - COUNT_IN;
    if (k < 0 || k >= N) return;
    const err = at - (k + COUNT_IN) * BEAT;
    if (Math.abs(err) > 0.25 || run.hits[k] != null) return;
    run.hits[k] = err;
    run.errs.push(Math.abs(err));
  }

  function finish() {
    if (!run) return;
    run.done = true;
    startBtn.disabled = false; tapBtn.disabled = true;
    if (!run.errs.length) { setText('bonus.none'); return; }
    const ms = Math.round(run.errs.reduce((a, b) => a + b, 0) / run.errs.length * 1000);
    txt.textContent = SP.t('bonus.result', { ms, hits: run.errs.length }) + ' ' + SP.t(ms <= 15 ? 'bonus.win' : 'bonus.lose');
    SP.audio.play(ms <= 15 ? 'jingle' : 'sad');
  }

  function open() {
    overlay.hidden = false;
    SP.applyI18n(overlay);
    setText('bonus.intro');
    startBtn.disabled = false; tapBtn.disabled = true;
    cancelAnimationFrame(raf); draw();
    startBtn.focus();
  }
  function close() {
    overlay.hidden = true; run = null; cancelAnimationFrame(raf);
    document.getElementById('bonusOpen').focus();
  }
  document.getElementById('bonusOpen').addEventListener('click', open);
  document.getElementById('bonusClose').addEventListener('click', close);
  startBtn.addEventListener('click', start);
  tapBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); tap(e); });
  cv.addEventListener('pointerdown', (e) => tap(e));
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); return; }
    if ((e.key === ' ' || e.key === 'Enter' || e.key === 'b' || e.key === 'B') && run && !run.done) { e.preventDefault(); tap(e); }
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  SP.onLangExtra = function () {
    if (!document.getElementById('credits').hidden) { renderSources(); }
    if (!overlay.hidden && (!run || run.done)) setText('bonus.intro');
  };
})();
