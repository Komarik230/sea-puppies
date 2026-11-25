/* æ-æ-æ-tchi — data screens: the opening count and map, the eight charts, and shared scenery. */
(function () {
  'use strict';
  const SP = window.SP, lcd = SP.lcd, D = SP.DATA;
  const ramp = SP.ramp, eo = SP.easeOut;
  const lbl = k => SP.t('lcd', k);

  // ------------------------------------------------------------------ shared scenery
  // beach: sea on top, shoreline, sand below
  SP.beach = function (t, shore) {
    shore = shore || 46;
    for (let r = 0; r < 4; r++) {
      const y = 8 + r * 9, off = Math.floor(t / (420 + r * 90)) % 16;
      for (let x = -16 + off + (r % 2) * 7; x < 128; x += 16) lcd.rect(x, y, 5, 1, '1');
    }
    for (let x = 0; x < 128; x++) lcd.px(x, shore + Math.round(Math.sin((x + t / 160) / 5)), '2');
    for (let y = shore + 3; y < 96; y += 2) for (let x = (y % 4 === 0 ? 0 : 2); x < 128; x += 5) lcd.px(x, y, '1');
  };
  // the pet, sitting, with idle bobbing and blinks
  SP.pet = function (t, x, y, o) {
    o = o || {};
    let name = Math.floor(t / 650) % 2 ? 'pup_idle1' : 'pup_idle0';
    if ((t % 3100) > 2950) name = 'pup_blink';
    if (o.happy && (t % 2600) < 700) name = 'pup_happy';
    if (o.frame) name = o.frame;
    lcd.spr(name, x, y, { flip: o.flip });
    if (o.tag) lcd.rect(x + (o.flip ? 9 : 26), y + 24, 2, 3, 'o');
  };

  // pre-rendered map layers (land; records by level)
  let mapCache = null;
  function mapLayers() {
    if (mapCache) return mapCache;
    const M = D.map, P = SP.PAL.day;
    const mk = () => { const c = document.createElement('canvas'); c.width = 128; c.height = 96; return c; };
    const land = mk(), rec = mk();
    const gl = land.getContext('2d'), gr = rec.getContext('2d');
    gl.fillStyle = P['1'];
    M.land.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === '1') gl.fillRect(M.x + x, M.y + y, 1, 1); });
    M.rec.forEach(([x, y, l]) => { gr.fillStyle = l === 1 ? P['2'] : P['3']; gr.fillRect(M.x + x, M.y + y, 1, 1); });
    return (mapCache = { land, rec });
  }
  SP.mapY = lat => Math.round(D.map.y + (D.map.lat0 - lat) * D.map.ky);
  SP.mapX = lon => Math.round(D.map.x + (lon - D.map.lon0) * D.map.kx);
  SP.drawMap = function (reveal) {
    const m = mapLayers();
    lcd.ctx.drawImage(m.land, 0, 0);
    const h = reveal == null ? 96 : Math.round(96 * reveal);
    if (h > 0) lcd.ctx.drawImage(m.rec, 0, 0, 128, h, 0, 0, 128, h);
  };

  // ------------------------------------------------------------------ opening: the count
  SP.SCENES['intro.count'] = () => {
    const G = D.gbif, labels = SP.list('lcd', 'count.decades'), axis = SP.list('lcd', 'count.axis');
    const f = (t) => {
      if (t < 1500) {
        const w = Math.round(128 * eo(ramp(t, 100, 700)));
        lcd.textC('æ-æ-æ-tchi', 64, 40, '3', 2, true);
        lcd.rect(w, 30, 128 - w, 30, '0');
        if (t > 900) for (let i = 0; i < 3; i++) if (Math.floor(t / 160) % 3 === i) lcd.rect(56 + i * 6, 58, 3, 3, '2');
        return;
      }
      const tt = t - 1500;
      const n = Math.round(G.total * eo(ramp(tt, 0, 1300)));
      lcd.textC(n.toLocaleString('en-US'), 64, 3, '3', 3);
      lcd.textC(lbl('count.records'), 64, 21, '2');
      const base = 84, H = 46, max = 30000;
      [10000, 20000].forEach((v, i) => {
        const y = base - Math.round(v / max * H);
        lcd.line(15, y, 124, y, '1', 2);
        lcd.textR(axis[i] || '', 13, y - 2, '2');
      });
      lcd.textR('0', 13, base - 2, '2');
      G.decades.forEach(([k, v], i) => {
        const x = 18 + i * 15;
        const h = Math.max(1, Math.round(v / max * H * eo(ramp(tt, 700 + i * 80, 700))));
        lcd.rect(x, base - h, 10, h, i === 6 ? '3' : '2');
        lcd.textC(labels[i] || k, x + 5, base + 4, '3');
        if (ramp(tt, 1500, 1) >= 1) {
          if (i === 5) lcd.textC(lbl('count.top.10s'), x + 5, base - h - 7, '3');
          if (i === 6) lcd.textC(lbl('count.top.20s'), x + 5, base - h - 7, '3');
        }
      });
      lcd.rect(15, base, 110, 1, '3');
    };
    f.still = 6000;
    return f;
  };

  // ------------------------------------------------------------------ opening: the map
  function mapLegend(t) {
    lcd.text(lbl('map.legend1'), 68, 4, '3');
    lcd.text(lbl('map.legend2'), 68, 10, '3');
    lcd.rect(68, 19, 5, 5, '2'); lcd.text(lbl('map.low'), 76, 19, '3');
    lcd.rect(68, 28, 5, 5, '3'); lcd.text(lbl('map.high'), 76, 28, '3');
    lcd.rect(69, 40, 2, 11, 'o'); lcd.text(lbl('map.breed1'), 75, 40, '3'); lcd.text(lbl('map.breed2'), 75, 46, '3');
    lcd.text(lbl('map.scale'), 68, 88, '2');
  }
  function breedLine() {
    const y0 = SP.mapY(34.1), y1 = SP.mapY(23.5);
    lcd.rect(62, y0, 2, y1 - y0 + 1, 'o');
    lcd.rect(60, y0, 2, 1, 'o'); lcd.rect(60, y1, 2, 1, 'o');
  }
  SP.SCENES['intro.map'] = () => {
    const f = (t) => {
      SP.drawMap(eo(ramp(t, 200, 1600)));
      lcd.text(lbl('map.can'), 26, 9, '2');
      lcd.text(lbl('map.usa'), 38, 40, '2');
      lcd.text(lbl('map.mex'), 49, 68, '2');
      if (t > 1700) breedLine();
      mapLegend(t);
    };
    f.still = 4000;
    return f;
  };

  // ------------------------------------------------------------------ opening: meet one
  SP.SCENES['intro.meet'] = () => {
    const tx = SP.mapX(-117.5), ty = SP.mapY(33.0);  // the busiest pixel: the San Diego coast
    let barked = false;
    const f = (t) => {
      if (t < 1700) {
        SP.drawMap(1);
        const b = Math.floor(t / 150) % 2;
        if (t < 800) { lcd.frame(tx - 3, ty - 3, 7, 7, b ? 'o' : '3'); lcd.px(tx, ty, 'o'); return; }
        const k = eo(ramp(t, 800, 800));
        const x0 = SP.lerp(tx - 3, 0, k), y0 = SP.lerp(ty - 3, 0, k), x1 = SP.lerp(tx + 3, 127, k), y1 = SP.lerp(ty + 3, 95, k);
        lcd.rect(x0, y0, x1 - x0, y1 - y0, '0');
        lcd.frame(x0, y0, x1 - x0 + 1, y1 - y0 + 1, 'o');
        return;
      }
      const tt = t - 1700;
      SP.beach(tt);
      SP.pet(tt, 46, 52);
      const fade = 1 - ramp(tt, 0, 700);                // materialize through a thinning dither
      if (fade > 0) for (let y = 50; y < 84; y++) for (let x = 44; x < 84; x++) if (SP.rnd(x * 97 + y) < fade) lcd.px(x, y, '0');
      if (tt > 900 && !barked) { barked = true; if (SP.audio) SP.audio.play('bark', 3); }
      if (tt > 900 && tt < 2600) {               // three barks drawn as sound arcs, no words on screen
        const n = 1 + Math.floor((tt - 900) / 280) % 3;
        for (let k = 0; k < n; k++) for (let j = -2 - k; j <= 2 + k; j++) lcd.px(86 + k * 4 + Math.round(Math.sqrt(Math.max(0, (3 + k) * (3 + k) - j * j)) / 2), 60 + j, '3');
      }
    };
    f.still = 5000;
    return f;
  };

  // ------------------------------------------------------------------ menu & rules: the pet waits
  SP.SCENES['intro.rules'] = () => (t) => { SP.beach(t); SP.pet(t, 46, 52); };
  SP.SCENES['menu'] = () => (t) => {
    SP.beach(t);
    const done = SP.device.done, name = SP.ORDER[SP.device.cursor] || 'food';
    SP.pet(t, 30, 52, { happy: Object.keys(done).length > 0 });
    const bob = Math.round(Math.sin(t / 400));
    lcd.spr('thought', 70, 14 + bob);
    lcd.spr('i_' + name, 75, 17 + bob);
    if (done[name]) lcd.spr('check', 86, 18 + bob);
  };

  // ------------------------------------------------------------------ food: 142 prey species, 7 common
  SP.SCENES['food.chart'] = () => {
    const names = SP.list('lcd', 'food.names');
    const f = (t) => {
      lcd.text(lbl('food.total'), 16, 3, '3');
      for (let i = 0; i < D.prey.species; i++) {
        const c = i % 24, r = Math.floor(i / 24);
        if (ramp(t, i * 7, 1) < 1) continue;
        const common = i < 7;
        const blink = common && t > 1300 && t < 2100 && Math.floor(t / 130) % 2;
        lcd.rect(16 + c * 4, 11 + r * 4, 3, 3, common ? (blink ? '0' : '3') : '1');
      }
      lcd.rect(16, 40, 3, 3, '3'); lcd.text(lbl('food.common'), 22, 39, '3');
      lcd.rect(66, 40, 3, 3, '1'); lcd.text(lbl('food.other'), 72, 39, '3');
      lcd.rect(8, 48, 112, 1, '1');
      names.forEach((n, i) => {
        const col = i < 4 ? 0 : 1, row = i < 4 ? i : i - 4;
        if (ramp(t, 1100 + i * 90, 1) < 1) return;
        lcd.rect(10 + col * 60, 55 + row * 9, 3, 3, '3');
        lcd.text(n, 16 + col * 60, 54 + row * 9, '3');
      });
    };
    f.still = 4000;
    return f;
  };

  // ------------------------------------------------------------------ sleep: the missing chart
  Object.assign(SP.EXTRA, {
    seal_s: ['...333......', '..33.33.....', '..333333....', '...3333.....', '...33333....', '..3333333...', '.333333333..', '33333333333.', '3333..33.333', '............']
  });
  SP.SCENES['sleep.chart'] = () => {
    const f = (t) => {
      for (let i = 0; i < 4; i++) {
        const x = 6 + (i % 2) * 28, y = 8 + Math.floor(i / 2) * 22;
        if (ramp(t, i * 200, 1) < 1) continue;
        lcd.spr('seal_s', x, y);
        lcd.spr('check', x + 14, y - 2);
      }
      lcd.text(lbl('sleep.studied1'), 4, 56, '3');
      lcd.text(lbl('sleep.studied2'), 4, 63, '3');
      lcd.rect(63, 6, 1, 70, '1');
      if (t > 1000) {
        SP.pet(t, 74, 36, { frame: (t % 3000) > 2700 ? 'pup_blink' : 'pup_idle0' });
        if (Math.floor(t / 500) % 2 || t > 3000) lcd.text('?', 102, 14, '3', 3);
        lcd.text(lbl('sleep.csl1'), 68, 70, '3');
        lcd.text(lbl('sleep.csl2'), 68, 77, '3');
        lcd.rect(67, 85, lcd.textW(lbl('sleep.nodata')) + 3, 8, '3');
        lcd.text(lbl('sleep.nodata'), 69, 86, '0');
      }
    };
    f.still = 4000;
    return f;
  };

  // ------------------------------------------------------------------ play: Ronan vs an eye blink
  SP.SCENES['play.chart'] = () => {
    const f = (t) => {
      const x0 = 42, px = 80 / 150, base = 66;
      [0, 50, 100, 150].forEach(v => {
        const x = x0 + Math.round(v * px);
        lcd.line(x, 18, x, base, '1', 2);
        lcd.rect(x, base, 1, 2, '3');
        lcd.textC(String(v), x, base + 4, '3');
      });
      lcd.rect(x0, base, 81, 1, '3');
      lcd.textR(lbl('play.unit'), 124, base + 11, '2');
      const k = eo(ramp(t, 200, 900));
      const w1 = Math.max(1, Math.round(D.ronan.ms * px * k)), w2 = Math.round(D.ronan.blink * px * eo(ramp(t, 500, 1100)));
      lcd.text(lbl('play.ronan'), 4, 27, '3');
      lcd.rect(x0, 25, w1, 9, '3');
      if (k >= 1) lcd.text(String(D.ronan.ms), x0 + w1 + 3, 27, '3');
      lcd.text(lbl('play.blink'), 4, 47, '3');
      lcd.rect(x0, 45, w2, 9, '2');
      if (w2 > 20) lcd.textR(String(D.ronan.blink), x0 + w2 - 2, 47, '0');
    };
    f.still = 3000;
    return f;
  };

  // ------------------------------------------------------------------ talk: the crowd, 1 dot = 25 pups
  SP.SCENES['talk.chart'] = () => {
    const per = D.pups.perDot, nLow = Math.round(D.pups.low / per), nHigh = Math.round(D.pups.high / per);
    const block = (n, y0, t, delay) => {
      const shown = Math.round(n * eo(ramp(t, delay, 1400)));
      for (let i = 0; i < shown; i++) lcd.px(4 + (i % 60) * 2, y0 + Math.floor(i / 60) * 2, '3');
    };
    const f = (t) => {
      lcd.text(lbl('talk.low'), 4, 2, '3'); lcd.text(lbl('talk.lowlabel'), 34, 2, '2');
      block(nLow, 10, t, 100);
      lcd.text(lbl('talk.high'), 4, 28, '3'); lcd.text(lbl('talk.highlabel'), 34, 28, '2');
      block(nHigh, 36, t, 700);
      lcd.text(lbl('talk.unit'), 4, 86, '2');
      lcd.px(lcd.textW(lbl('talk.unit')) + 8, 88, '3');
    };
    f.still = 4000;
    return f;
  };

  // ------------------------------------------------------------------ care: days at sea vs ashore
  SP.SCENES['care.chart'] = () => {
    const f = (t) => {
      const x0 = 40, pd = 16, base = 66;
      for (let d = 0; d <= 5; d++) {
        const x = x0 + d * pd;
        lcd.line(x, 12, x, base, '1', 2);
        lcd.rect(x, base, 1, 2, '3');
        lcd.textC(String(d), x, base + 4, '3');
      }
      lcd.rect(x0, base, 81, 1, '3');
      lcd.textR(lbl('care.unit'), 124, base + 11, '2');
      const bar = (lo, hi, y, delay) => {
        const k = eo(ramp(t, delay, 800)), mid = (lo + hi) / 2;
        const a = x0 + (mid - (mid - lo) * k) * pd, b = x0 + (mid + (hi - mid) * k) * pd;
        lcd.rect(Math.round(a), y, Math.max(2, Math.round(b - a)), 9, '3');
        if (k >= 1) lcd.textC(lo + '-' + hi, (a + b) / 2, y - 7, '3');
      };
      lcd.text(lbl('care.sea1'), 4, 23, '3'); lcd.text(lbl('care.sea2'), 4, 29, '2');
      bar(D.care.sea[0], D.care.sea[1], 23, 200);
      lcd.text(lbl('care.shore1'), 4, 47, '3'); lcd.text(lbl('care.shore2'), 4, 53, '2');
      bar(D.care.shore[0], D.care.shore[1], 47, 600);
    };
    f.still = 3000;
    return f;
  };

  // ------------------------------------------------------------------ heal: causes of live strandings
  SP.SCENES['heal.chart'] = () => {
    const names = SP.list('lcd', 'heal.names');
    const f = (t) => {
      const x0 = 56, pp = 1.5, base = 78;
      [0, 10, 20, 30, 40].forEach(v => {
        const x = x0 + Math.round(v * pp);
        lcd.line(x, 4, x, base, '1', 2);
        lcd.rect(x, base, 1, 2, '3');
        lcd.textC(v + (v === 40 ? '%' : ''), x + (v === 40 ? 2 : 0), base + 4, '3');
      });
      lcd.rect(x0, base, 61, 1, '3');
      D.strand.causes.forEach(([k, v], i) => {
        const y = 5 + i * 12;
        lcd.text(names[i] || k, 3, y + 1, '3');
        const w = Math.round(v * pp * eo(ramp(t, 150 + i * 120, 700)));
        if (i === 5) { lcd.frame(x0, y, Math.max(1, w), 7, '2'); lcd.dither(x0 + 1, y + 1, Math.max(0, w - 2), 5, '2'); }
        else lcd.rect(x0, y, w, 7, '3');
        if (ramp(t, 150 + i * 120, 700) >= 1) lcd.text(v + '%', x0 + w + 2, y + 1, '3');
      });
      lcd.text(lbl('heal.n'), 3, 88, '2');
    };
    f.still = 3000;
    return f;
  };

  // ------------------------------------------------------------------ heat: thermal comfort zones
  SP.SCENES['heat.chart'] = () => {
    const f = (t) => {
      const x0 = 30, pc = 4.75, base = 70;
      const X = c => Math.round(x0 + c * pc);
      [0, 5, 10, 15, 20].forEach(c => {
        lcd.rect(X(c), base, 1, 2, '3');
        lcd.textC(String(c), X(c), base + 4, '3');
      });
      lcd.rect(x0, base, X(20) - x0 + 1, 1, '3');
      lcd.text(lbl('heat.unit'), x0, base + 12, '2');
      // coast marker
      const xc = X(D.heat.coast);
      lcd.line(xc, 12, xc, base - 1, '2', 2);
      lcd.textC(lbl('heat.coast'), xc, 5, '2');
      // adults
      lcd.text(lbl('heat.adults'), 2, 28, '3');
      lcd.rect(X(D.heat.adultTested[0]), 30, X(D.heat.adultTested[1]) - X(D.heat.adultTested[0]), 1, '2');
      const k = eo(ramp(t, 300, 900));
      const a = X(D.heat.adultLCT), b = SP.lerp(a, X(20), k);
      lcd.rect(a, 27, Math.round(b - a), 7, '3');
      if (k >= 1) { lcd.text(lbl('heat.comfort'), a, 19, '3'); lcd.textC(String(D.heat.adultLCT), a, 36, '3'); }
      // juveniles
      lcd.text(lbl('heat.young'), 2, 52, '3');
      lcd.rect(X(D.heat.juvTested[0]), 54, X(D.heat.juvTested[1]) - X(D.heat.juvTested[0]), 1, '2');
      lcd.rect(X(D.heat.juvTested[0]), 52, 1, 5, '2'); lcd.rect(X(20), 52, 1, 5, '2');
      if (t > 1300) lcd.text(lbl('heat.none'), X(11), 46, '3');
    };
    f.still = 3000;
    return f;
  };

  // ------------------------------------------------------------------ tags: annual survival by age
  SP.SCENES['tags.chart'] = () => {
    const ages = SP.list('lcd', 'tags.ages');
    const f = (t) => {
      const base = 76, H = 56;
      lcd.text(lbl('tags.unit'), 4, 3, '2');
      [50, 100].forEach(v => {
        const y = base - Math.round(v / 100 * H);
        lcd.line(18, y, 124, y, '1', 2);
        lcd.textR(String(v), 15, y - 2, '2');
      });
      lcd.textR('0', 15, base - 2, '2');
      lcd.rect(18, base, 107, 1, '3');
      D.survival.forEach(([k, f1, m1], i) => {
        const cx = 40 + i * 34;
        [[f1, '3', -10], [m1, '2', 1]].forEach(([v, tone, dx], j) => {
          const k2 = eo(ramp(t, 200 + i * 200 + j * 90, 800));
          const h = Math.round(v / 100 * H * k2);
          if (tone === '2') { lcd.frame(cx + dx, base - h, 9, h, '2'); lcd.dither(cx + dx + 1, base - h + 1, 7, Math.max(0, h - 1), '2'); }
          else lcd.rect(cx + dx, base - h, 9, h, tone);
          if (k2 >= 1) lcd.textC(String(Math.round(v)), cx + dx + 4, base - h - 7, '3');
        });
        lcd.textC(ages[i] || k, cx, base + 4, '3');
      });
      lcd.rect(30, 88, 5, 5, '3'); lcd.text(lbl('tags.f'), 37, 88, '3');
      lcd.frame(76, 88, 5, 5, '2'); lcd.dither(77, 89, 3, 3, '2'); lcd.text(lbl('tags.m'), 83, 88, '3');
    };
    f.still = 3000;
    return f;
  };

  // ------------------------------------------------------------------ finale
  SP.SCENES['finale.release'] = () => {
    let splashed = false;
    const f = (t) => {
      if (t < 5200) {
        SP.beach(t, 40);
        if (t < 2600) {
          const x = SP.lerp(40, 92, eo(ramp(t, 300, 2000)));
          const walk = t > 300 && t < 2300;
          SP.pet(t, x, 50, { tag: true, frame: walk ? (Math.floor(t / 180) % 2 ? 'pup_walk0' : 'pup_walk1') : null });
        } else {
          const k = ramp(t, 2600, 2400);
          if (!splashed) { splashed = true; if (SP.audio) SP.audio.play('splash'); }
          if (k < 0.18) for (let i = 0; i < 8; i++) lcd.px(100 + i * 3, 36 - Math.round(Math.sin(i + t / 60) * 4), '3');
          lcd.spr(Math.floor(t / 200) % 2 ? 'swim1' : 'swim0', SP.lerp(92, 132, k), 22);
          lcd.rect(SP.lerp(92, 132, k) + 30, 30, 2, 2, 'o');
        }
        return;
      }
      SP.drawMap(1);
      breedLine();
      const x = SP.mapX(-121.4), y = SP.mapY(33.6);
      const b = Math.floor(t / 250) % 2;
      lcd.rect(x - 1, y - 1, 3, 3, b ? 'o' : '0');
      lcd.px(x, y, 'o');
      lcd.text('+1', x + 4, y - 6, '3');
      mapLegend(t);
    };
    f.still = 7000;
    return f;
  };
  SP.SCENES['finale.end'] = () => (t) => {
    for (let r = 0; r < 6; r++) {
      const y = 30 + r * 10, off = Math.floor(t / (380 + r * 70)) % 18;
      for (let x = -18 + off + (r % 2) * 9; x < 128; x += 18) lcd.rect(x, y, 6, 1, '1');
    }
    lcd.spr('sun', 100, 6);
    lcd.spr(Math.floor(t / 700) % 2 ? 'float1' : 'float0', 44, 40 + Math.round(Math.sin(t / 500) * 1.5));
  };
})();
