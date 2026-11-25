/* æ-æ-æ-tchi — eight old-school mini-games, played by themselves (pure animations). */
(function () {
  'use strict';
  const SP = window.SP, lcd = SP.lcd;
  const ramp = SP.ramp, eo = SP.easeOut, lerp = SP.lerp;
  const play = (n, a) => { if (SP.audio) SP.audio.play(n, a); };
  const tri = p => { p = ((p % 1) + 1) % 1; return p < 0.25 ? p * 4 : p < 0.75 ? 2 - p * 4 : p * 4 - 4; };

  Object.assign(SP.EXTRA, {
    p_fish:  ['3.33.', '33333', '3.33.'],
    p_big:   ['3..333.', '3333333', '3..333.'],
    p_squid: ['.3.', '333', '333', '3.3', '3.3'],
    nap:     ['.333................', '33333....3333.......', '3333333333333333....', '.333333333333333333.', '..3333333333333..333'],
    nap_s:   ['.33...........', '3333..333.....', '33333333333...', '.333333333333.', '..33333333.33.'],
    pup_s:   ['......333..', '.....33333.', '.....3.3333', '.....33333.', '....3333...', '...33333...', '..333333...', '.3333333...', '33333.33...'],
    call:    ['.333.', '3...3', '3.3.3', '3...3', '.333.'],
    call_p:  ['.ooo.', 'o333o', 'o3o3o', 'o333o', '.ooo.'],
    inv_loop0: ['..33333..', '.3.....3.', '3..333..3', '3.3...3.3', '3..333..3', '.3.....3.', '..333.3..'],
    inv_loop1: ['..33333..', '.3.....3.', '3..333..3', '3.3...3.3', '3..333..3', '.3.....3.', '..3333...'],
    inv_alga0: ['3...3...3', '.3.333.3.', '..33333..', '3333.3333', '..33333..', '.3.333.3.', '3...3...3'],
    inv_alga1: ['....3....', '.3.333.3.', '.3333333.', '333.3.333', '.3333333.', '.3.333.3.', '....3....'],
    inv_germ0: ['..33333..', '.3333333.', '333.3.333', '333333333', '.3333333.', '3.3...3.3', '3..3.3..3'],
    inv_germ1: ['..33333..', '.3333333.', '333.3.333', '333333333', '.3333333.', '.3.3.3.3.', '3...3...3'],
    boom:    ['3..3..3', '.3.3.3.', '33...33', '.3.3.3.', '3..3..3'],
    cannon:  ['......3......', '.....333.....', '..333333333..', '.33333.33333.', '.3333...3333.', '.33333.33333.', '3333333333333'],
    brick:   ['33333333', '3...3..3', '3...3..3', '33333333', '3.3....3', '3.3....3', '33333333'],
    boat:    ['.....333......', '.....3.3......', '..3333333333..', '33333333333333', '.333333333333.', '..3333333333..'],
    net:     ['3.3.3.3.3.3.', '.3.3.3.3.3.3', '3.3.3.3.3.3.', '.3.3.3.3.3.3', '3.3.3.3.3.3.']
  });

  // ------------------------------------------------------------------ FOOD · Snake
  SP.SCENES['food.game'] = () => {
    const CELL = 6, X0 = 4, Y0 = 9, COLS = 20, ROWS = 14;
    const path = [];
    for (let k = 0; k < 6; k++) {
      const row = 1 + k * 2;
      for (let i = 0; i < 18; i++) path.push([k % 2 === 0 ? 1 + i : 18 - i, row]);
      if (k < 5) path.push([k % 2 === 0 ? 18 : 1, row + 1]);
    }
    const prey = [9, 25, 41, 57, 73, 89, 105];
    const kinds = ['p_squid', 'p_fish', 'p_big', 'p_fish', 'p_fish', 'p_fish', 'p_big'];
    const fired = new Set(), L = path.length, LOOP = L + 16, SPEED = 9;
    const f = (t) => {
      const s = Math.floor(t * SPEED / 1000), loop = Math.floor(s / LOOP), si = s % LOOP;
      const h = Math.min(si, L - 1);
      const eaten = prey.filter(p => p <= h).length;
      // frame + prey counter
      lcd.frame(X0 - 1, Y0 - 1, COLS * CELL + 2, ROWS * CELL + 2, '2');
      for (let i = 0; i < 7; i++) {
        const name = kinds[i], sz = SP.spriteSize(name);
        if (i < eaten) lcd.spr(name, 5 + i * 9 + (7 - sz.w) / 2, 1 + (5 - sz.h) / 2);
        else lcd.rect(6 + i * 9, 3, 3, 1, '1');
      }
      prey.forEach((p, i) => {
        if (p <= h) return;
        const [c, r] = path[p], sz = SP.spriteSize(kinds[i]);
        lcd.spr(kinds[i], X0 + c * CELL + Math.floor((CELL - sz.w) / 2), Y0 + r * CELL + Math.floor((CELL - sz.h) / 2));
      });
      const len = 3 + eaten * 2;
      const blink = si >= L && Math.floor(t / 150) % 2;
      for (let i = Math.max(0, h - len + 1); i < h; i++) {
        const [c, r] = path[i];
        if (!blink) lcd.rect(X0 + c * CELL + 1, Y0 + r * CELL + 1, 4, 4, '2');
      }
      const [hc, hr] = path[h], prev = path[Math.max(0, h - 1)];
      const dx = hc - prev[0], dy = hr - prev[1];
      const hx = X0 + hc * CELL, hy = Y0 + hr * CELL;
      lcd.rect(hx, hy + 1, 6, 4, '3'); lcd.rect(hx + 1, hy, 4, 6, '3');
      const ex = dx > 0 ? hx + 3 : dx < 0 ? hx + 2 : hx + 1, ey = dy > 0 ? hy + 3 : dy < 0 ? hy + 2 : hy + 1;
      lcd.px(ex, ey, '0'); if (dy !== 0) lcd.px(ex + 3, ey, '0');
      // gulp sparkle
      prey.forEach((p, i) => {
        if (p > h) return;
        const age = (si - p) * 1000 / SPEED;
        if (age < 220) { [[-2, -2], [7, -2], [-2, 7], [7, 7]].forEach(([ox, oy]) => lcd.px(hx + ox, hy + oy, '3')); }
        if (fired.has(loop + ':' + i) === false && si >= p && si < L) { fired.add(loop + ':' + i); play('gulp'); }
      });
    };
    f.still = 11000;
    return f;
  };

  // ------------------------------------------------------------------ SLEEP · Tetris
  SP.SCENES['sleep.game'] = () => {
    const WX = 32, WY = 8, CELL = 8, ROWS = 10;
    const slots = [
      [0, 9, 3], [3, 9, 3], [6, 9, 2], [0, 8, 2], [2, 8, 3], [5, 8, 3],
      [1, 7, 3], [4, 7, 2], [6, 7, 2], [0, 6, 2], [3, 6, 3], [2, 5, 3]
    ];
    const spawn = [3, 5, 2, 4, 1, 3, 5, 2, 4, 3, 1, 4];
    const GAP = 760, STEP = 55, LOOP = slots.length * GAP + 2600;
    const landed = new Set();
    const stars = [[6, 30], [14, 50], [110, 40], [118, 60], [104, 74], [8, 70], [20, 14]];
    const f = (t) => {
      const tl = t % LOOP;
      lcd.spr('i_sleep', 8, 4);
      stars.forEach(([x, y], i) => { if (Math.floor((t + i * 300) / 700) % 3) lcd.px(x, y, '2'); });
      lcd.rect(WX - 2, WY, 1, ROWS * CELL, '2'); lcd.rect(WX + 8 * CELL + 1, WY, 1, ROWS * CELL, '2');
      lcd.rect(WX - 8, 88, 8 * CELL + 16, 2, '3');
      lcd.rect(WX - 2, 90, 2, 6, '3'); lcd.rect(WX + 8 * CELL, 90, 2, 6, '3');
      for (let x = 0; x < 128; x += 3) lcd.px(x + (Math.floor(t / 300) % 3), 93, '1');
      // next-piece box
      const idx = Math.floor(tl / GAP);
      lcd.frame(104, 10, 22, 12, '2');
      const nxt = slots[Math.min(idx + 1, slots.length - 1)];
      if (idx + 1 < slots.length) lcd.spr(nxt[2] === 3 ? 'nap' : 'nap_s', nxt[2] === 3 ? 105 : 108, 13);
      slots.forEach(([col, row, size], i) => {
        const t0 = i * GAP;
        if (tl < t0) return;
        const steps = Math.floor((tl - t0) / STEP);
        const r = Math.min(row, steps);
        const slide = Math.min(1, steps / 4);
        const c = Math.round(lerp(Math.min(spawn[i], 8 - size), col, slide));
        const x = WX + c * CELL, y = WY + r * CELL;
        lcd.spr(size === 3 ? 'nap' : 'nap_s', x + (size === 3 ? 2 : 1), y + 2);
        if (r === row && row <= 7) {
          const ph = (t + i * 370) % 2400;
          if (ph < 1200) lcd.spr('zz', x + size * CELL - 6, y - Math.round(ph / 1200 * 10));
        }
        if (r === row && steps === row && !landed.has(i)) { landed.add(i); play('tick'); }
      });
      // full rows flash
      [9, 8].forEach((row, j) => {
        const done = (j === 0 ? 3 : 6) * GAP + row * STEP;
        if (tl > done && tl < done + 500 && Math.floor(tl / 100) % 2) lcd.rect(WX - 1, WY + row * CELL + 7, 8 * CELL + 1, 1, '3');
      });
    };
    f.still = 9800;
    return f;
  };

  // ------------------------------------------------------------------ PLAY · Pong to the beat
  SP.SCENES['play.game'] = () => {
    const P = 600;
    let lastBeat = -1;
    const f = (t) => {
      const beat = Math.floor(t / P), ph = (t % P) / P;
      if (beat !== lastBeat) { lastBeat = beat; play('tick'); }
      lcd.rect(0, 26, 128, 1, '3'); lcd.rect(0, 67, 128, 1, '3');
      for (let y = 28; y < 66; y += 4) lcd.rect(82, y, 1, 2, '1');
      const x = ph < 0.5 ? lerp(41, 115, ph * 2) : lerp(115, 41, (ph - 0.5) * 2);
      const y = 46 - Math.round(17 * tri(ph));
      lcd.rect(Math.round(x), y - 1, 3, 3, '3');
      const py = SP.clamp(Math.round(lerp(46, y, 0.6)) - 6, 28, 53);
      lcd.rect(119, py, 3, 12, '3');
      const hit = ph < 0.14 || ph > 0.96;
      lcd.spr(hit ? 'pup_open' : (ph > 0.4 && ph < 0.6 ? 'pup_up' : 'pup_idle0'), 5, 38);
      if (ph < 0.5) lcd.spr('note', 22 - Math.round(ph * 4), 30 - Math.round(ph * 16));
      for (let i = 0; i < 4; i++) {
        const on = beat % 4 === i;
        if (on) lcd.rect(48 + i * 8, 10, 5, 5, '3'); else lcd.frame(48 + i * 8, 10, 5, 5, '2');
      }
    };
    f.still = 0;
    return f;
  };

  // ------------------------------------------------------------------ TALK · Egg catch
  SP.SCENES['talk.game'] = () => {
    const R = [[2, 24, 38, 40], [2, 47, 38, 63], [126, 24, 90, 40], [126, 47, 90, 63]];
    const order = [0, 2, 1, 3, 3, 0, 2, 1];
    const GAP = 760, ROLL = 1500;
    const fired = new Set();
    const f = (t) => {
      R.forEach(([x0, y0, x1, y1]) => { lcd.line(x0, y0 + 3, x1, y1 + 3, '2'); lcd.rect(Math.min(x0, x1) === x0 ? x0 : x0 - 1, y0 + 3, 2, 6, '2'); });
      lcd.rect(0, 84, 128, 1, '2');
      for (let y = 87; y < 96; y += 3) for (let x = (y % 2) * 2; x < 128; x += 6) lcd.px(x, y, '1');
      lcd.spr('pup_s', 6, 75);
      let face = 'L', catching = false, caughtAt = -1e9;
      const kNow = Math.floor(t / GAP);
      for (let k = Math.max(0, kNow - 3); k <= kNow; k++) {
        const t0 = k * GAP, p = (t - t0) / ROLL;
        if (p < 0) continue;
        const ri = order[k % order.length], [x0, y0, x1, y1] = R[ri];
        const pup = k % 3 === 2;
        if (p < 1) {
          const x = lerp(x0, x1, p) - 2, y = lerp(y0, y1, p) - 3;
          lcd.spr(pup ? 'call_p' : 'call', x, y + (Math.floor(t / 120) % 2));
          if (pup && p > 0.55) { face = ri < 2 ? 'L' : 'R'; catching = true; }
        } else if (pup) {
          if (p < 1.3) { caughtAt = t0 + ROLL; face = ri < 2 ? 'L' : 'R'; catching = true; }
          if (!fired.has(k)) { fired.add(k); play('voice', [0.35, 0.9, 0.6, 0.85]); }
        } else {
          const fp = (p - 1) * ROLL;
          if (fp < 450) lcd.spr('call', x1 + (ri < 2 ? 2 : -6), y1 - 3 + Math.round(fp * fp / 9000));
          else if (fp < 650) { lcd.px(x1, 83, '2'); lcd.px(x1 + 3, 82, '2'); lcd.px(x1 - 3, 82, '2'); }
        }
      }
      const blink = (t % 2700) > 2580;
      lcd.spr(catching ? 'mom_call' : (blink ? 'mom_blink' : 'mom'), 51, 60, { flip: face === 'R' });
      if (t - caughtAt < 350) {
        const sx = face === 'L' ? 44 : 84;
        [[0, -3], [-3, 0], [3, 0], [0, 3]].forEach(([dx, dy]) => lcd.px(sx + dx, 64 + dy, 'o'));
        lcd.text('!', 63, 50, '3', 1);
      }
    };
    f.still = 2900;
    return f;
  };

  // ------------------------------------------------------------------ CARE · Pac-Man
  SP.SCENES['care.game'] = () => {
    const pts = [[8, 13], [92, 13], [92, 33], [8, 33], [8, 53], [92, 53], [92, 73], [8, 73], [8, 88], [104, 88]];
    const seg = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
    const at = d => {
      for (let i = 0; i < seg.length; i++) {
        if (d <= seg[i]) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], k = d / seg[i]; return [lerp(ax, bx, k), lerp(ay, by, k), Math.sign(bx - ax), Math.sign(by - ay)]; }
        d -= seg[i];
      }
      const [x, y] = pts[pts.length - 1]; return [x, y, 1, 0];
    };
    const dots = []; for (let d = 6; d < total - 4; d += 6) dots.push(d);
    const SPEED = 42, RUN = total / SPEED * 1000, LOOP = RUN + 2600;
    const day = SP.t('lcd', 'game.day');
    const f = (t) => {
      const tl = t % LOOP, d = Math.min(total, tl / 1000 * SPEED);
      [[0, 23, 84], [16, 43, 100], [0, 63, 84], [16, 81, 100]].forEach(([a, y, b]) => {
        lcd.rect(a, y, b - a, 1, '2');
        for (let x = a + 3; x < b; x += 7) { lcd.px(x, y - 1, '1'); lcd.px(x + 2, y + 1, '1'); }
      });
      lcd.rect(0, 4, 100, 1, '2'); lcd.rect(100, 4, 1, 77, '2');
      for (let y = 6; y < 96; y += 2) for (let x = 104 + (y % 4 ? 2 : 0); x < 128; x += 5) lcd.px(x, y, '1');
      dots.forEach(dd => { if (dd > d) { const [x, y] = at(dd); lcd.rect(Math.round(x), Math.round(y), 2, 1, '3'); } });
      const [mx, my, dx, dy] = at(d);
      const open = 0.15 + 0.6 * Math.abs(Math.sin(t / 90));
      const ang = Math.atan2(dy, dx);
      for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) {
        if (x * x + y * y > 18) continue;
        let a = Math.atan2(y, x) - ang; a = Math.atan2(Math.sin(a), Math.cos(a));
        if (Math.abs(a) < open && x * x + y * y > 1) continue;
        lcd.px(mx + x, my + y, '3');
      }
      lcd.px(mx + (dy ? 2 : -1 * dx), my + (dx ? -2 : -1 * dy), '0');
      const n = Math.min(4, 1 + Math.floor(d / total * 4));
      lcd.text(day, 105, 6, '3'); lcd.text(String(n), 109, 13, '3', 2);
      const home = tl > RUN;
      lcd.spr('pup_s', 112, 76);
      if (!home && Math.floor(t / 400) % 2) lcd.text('?', 117, 68, '3');
      if (home) { lcd.text('!', 117, 68, '3'); if (Math.floor(t / 300) % 2) lcd.spr('zz', 120, 66); }
    };
    f.still = 6000;
    return f;
  };

  // ------------------------------------------------------------------ HEAL · Space Invaders
  SP.SCENES['heal.game'] = () => {
    const types = ['inv_loop', 'inv_alga', 'inv_germ'];
    const N = 18, order = [];
    for (let i = 0; i < N; i++) order.push(i);
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(SP.rnd(i + 3) * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const START = 900, GAP = 620, LOOP = START + N * GAP + 1800;
    const fired = new Set();
    const f = (t) => {
      const tl = t % LOOP, loop = Math.floor(t / LOOP);
      const ox = 12 + Math.round(10 * tri(tl / 5000)), oy = 8 + Math.min(14, Math.floor(tl / 1600) * 2);
      const pos = i => [ox + (i % 6) * 15, oy + Math.floor(i / 6) * 12];
      const killT = {};
      order.forEach((idx, k) => { killT[idx] = START + k * GAP + 420; });
      // cannon follows the current target
      const k = SP.clamp(Math.floor((tl - START) / GAP), 0, N - 1);
      const tgt = pos(order[k]), prv = pos(order[Math.max(0, k - 1)]);
      const ck = ramp(tl - START - k * GAP, 0, 250);
      const cx = tl < START ? 58 : Math.round(lerp(prv[0], tgt[0], eo(ck)));
      lcd.spr('cannon', cx - 2, 84);
      lcd.rect(0, 92, 128, 1, '2');
      for (let i = 0; i < N; i++) {
        const [x, y] = pos(i), kt = killT[i];
        if (tl > kt + 220) continue;
        if (tl > kt) { lcd.spr('boom', x + 1, y + 1); if (!fired.has(loop + ':' + i)) { fired.add(loop + ':' + i); play('pop'); } continue; }
        lcd.spr(types[Math.floor(i / 6)] + (Math.floor(t / 400) % 2), x, y);
      }
      // the shot
      const sp = tl - START - k * GAP;
      if (tl >= START && sp > 250 && sp < 420) {
        const yy = Math.round(lerp(82, tgt[1] + 6, (sp - 250) / 170));
        lcd.rect(cx + 4, yy, 1, 3, '3');
      }
    };
    f.still = 2600;
    return f;
  };

  // ------------------------------------------------------------------ HEAT · Mario run
  SP.SCENES['heat.game'] = () => {
    const LOOP = 7400;
    const fired = new Set();
    const f = (t) => {
      const tl = t % LOOP, loop = Math.floor(t / LOOP);
      lcd.spr('sun', 112, 3);
      // sand and sea
      lcd.rect(0, 78, 90, 1, '2');
      for (let y = 80; y < 96; y += 2) for (let x = (y % 4 ? 2 : 0); x < 90; x += 4) lcd.px(x, y, '1');
      for (let x = 90; x < 128; x++) lcd.px(x, 72 + Math.round(Math.sin((x + t / 120) / 4)), '2');
      for (let y = 76; y < 96; y += 4) for (let x = 92 + (y % 8 ? 3 : 0); x < 128; x += 6) lcd.rect(x, y, 3, 1, '1');
      // heat shimmer
      [10, 30, 52, 74].forEach((x0, i) => { for (let y = 58; y < 77; y += 2) lcd.px(x0 + Math.round(Math.sin((y + t / 45 + i * 5) / 2.5)), y, '1'); });
      // blocks; one gets bumped
      const bump = tl > 2280 && tl < 2420 ? -2 : 0;
      lcd.spr('brick', 34, 20 + bump); lcd.spr('brick', 42, 20);
      if (tl > 2300 && tl < 3000) {
        const k = ramp(tl, 2300, 700);
        lcd.spr('drop', 36, Math.round(lerp(14, 40, k * k)));
      }
      let x, y, name, flip = false;
      if (tl < 2000) { x = lerp(-36, 18, tl / 2000); y = 48; name = Math.floor(tl / 160) % 2 ? 'pup_walk0' : 'pup_walk1'; }
      else if (tl < 2600) { const k = ramp(tl, 2000, 600); x = lerp(18, 32, k); y = 48 - Math.round(18 * Math.sin(Math.PI * k)); name = 'pup_up'; }
      else if (tl < 4300) { x = lerp(32, 58, ramp(tl, 2600, 1700)); y = 48; name = Math.floor(tl / 160) % 2 ? 'pup_walk0' : 'pup_walk1'; }
      else if (tl < 5000) { const k = ramp(tl, 4300, 700); x = lerp(58, 84, k); y = Math.round(48 - 16 * Math.sin(Math.PI * k * 0.8) + k * k * 18); name = 'pup_up'; }
      else {
        if (!fired.has(loop)) { fired.add(loop); play('splash'); }
        const k = tl - 5000;
        if (k < 300) for (let i = 0; i < 7; i++) lcd.px(98 + i * 4, 66 - Math.round(Math.sin(i * 1.7) * 3 + k / 60), '3');
        lcd.spr(Math.floor(t / 600) % 2 ? 'float1' : 'float0', 84, 50 + Math.round(Math.sin(t / 400)));
        return;
      }
      lcd.spr(name, Math.round(x), Math.round(y), { flip });
    };
    f.still = 6000;
    return f;
  };

  // ------------------------------------------------------------------ TAGS · Frogger
  SP.SCENES['tags.game'] = () => {
    const lanes = [
      { y: 71, spr: 'boat', v: 22, xs: [0, 34, 70, 104] },
      { y: 58, spr: 'net', v: -15, xs: [10, 60, 100] },
      { y: 45, spr: 'boat', v: 17, xs: [20, 84] },
      { y: 32, spr: 'net', v: -11, xs: [40, 110] },
      { y: 19, spr: 'boat', v: 8, xs: [60] }
    ];
    const W = 142;
    const obsX = (ln, x0, t) => { const sz = SP.spriteSize(ln.spr); return ((x0 + ln.v * t / 1000) % W + W) % W - sz.w; };
    const clear = (li, t) => {
      const ln = lanes[li]; if (!ln) return true;
      return ln.xs.every(x0 => { const x = obsX(ln, x0, t), w = SP.spriteSize(ln.spr).w; return x + w < 56 || x > 72; });
    };
    let lane = -1, hopAt = -1e9, doneAt = -1;
    const PUPX = 58;
    const f = (t) => {
      // goal rocks and beach
      for (let y = 2; y < 14; y += 2) for (let x = (y % 4 ? 2 : 0); x < 128; x += 4) lcd.px(x, y, '2');
      lcd.rect(0, 15, 128, 1, '3');
      lcd.rect(0, 83, 128, 1, '3');
      for (let y = 86; y < 96; y += 2) for (let x = (y % 4 ? 0 : 2); x < 128; x += 5) lcd.px(x, y, '1');
      lanes.forEach((ln, i) => {
        lcd.text(String(i + 1), 2, ln.y + 1, '2');
        if (i < 4) for (let x = 8; x < 128; x += 6) lcd.px(x, ln.y + 10, '1');
        ln.xs.forEach(x0 => lcd.spr(ln.spr, Math.round(obsX(ln, x0, t)), ln.y));
      });
      // the marked pup decides when to hop
      if (doneAt < 0 && t - hopAt > 650 && clear(lane + 1, t + 120) && clear(lane + 1, t + 380)) {
        lane++; hopAt = t; play('tick');
        if (lane >= lanes.length) doneAt = t;
      }
      if (doneAt > 0 && t - doneAt > 1600) { lane = -1; doneAt = -1; hopAt = t; }
      const yOf = l => l < 0 ? 85 : l >= lanes.length ? 4 : lanes[l].y - 2;
      const k = ramp(t - hopAt, 0, 180);
      const py = Math.round(lerp(yOf(lane - 1), yOf(lane), k)) - Math.round(Math.sin(Math.PI * k) * 3);
      lcd.spr('pup_s', PUPX, py);
      lcd.rect(PUPX + 5, py + 7, 2, 2, 'o');
      if (doneAt > 0 && Math.floor(t / 150) % 2) { lcd.px(PUPX - 3, py, '3'); lcd.px(PUPX + 13, py, '3'); lcd.px(PUPX + 5, py - 3, '3'); }
    };
    f.still = 2000;
    return f;
  };
})();
