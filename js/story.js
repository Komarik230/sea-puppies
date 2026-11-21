/* SEA PUPPIES — the story: power on, eight needs, goodbye. */
(function () {
  const SP = window.SP;
  const { lcd, stage, ui, input, device, wait, tween, anim } = SP;
  const audio = SP.audio;
  const G = SP.GROUND;              // 58
  const PX = 46, PY = G - 30;       // pup home position (sprite 36x30)
  const L_W = SP.L_W, L_H = SP.L_H;

  // ================================================================ backgrounds
  function seaDashes(y0, rows, t, tone) {
    for (let r = 0; r < rows; r++) {
      const y = y0 + r * 4;
      const off = Math.floor(t / (420 + r * 90)) * (r % 2 ? 1 : -1);
      for (let x = 0; x < L_W; x++) if (((x + off + r * 5) % 14) < 5) lcd.px(x, y + (((x + off) % 14) < 2 ? 0 : 1), tone || '1');
    }
  }
  function sand(y0) {
    lcd.rect(0, y0, L_W, 1, '2');
    for (let y = y0 + 2; y < L_H; y += 2) for (let x = (y % 4 === 0 ? 0 : 2); x < L_W; x += 4) lcd.px(x, y, '1');
    [[8, 66], [30, 72], [97, 64], [116, 75], [70, 80]].forEach(([x, y]) => { lcd.px(x, y, '2'); lcd.px(x + 1, y, '2'); });
  }
  function waterRect(x0, y0, w, h, t) {
    lcd.rect(x0, y0, w, h, '0');
    const off = Math.floor(t / 260);
    for (let x = x0; x < x0 + w; x++) {
      const yy = y0 + (((x + off) % 8) < 4 ? 0 : 1);
      lcd.px(x, yy, '2'); lcd.px(x, yy + 1, '1');
    }
    for (let y = y0 + 4, r = 0; y < y0 + h; y += 3, r++) {
      const o = (off * (r % 2 ? 1 : -1) + r * 3) % 8;
      for (let x = x0; x < x0 + w; x++) if (((x - x0 + 64 + o) % 8) < 4) lcd.px(x, y, '1');
    }
  }
  SP.BG.blank = () => {};
  SP.BG.beach = (t) => { seaDashes(37, 3, t, '1'); sand(G); };
  SP.BG.shore = (t) => { seaDashes(37, 3, t, '1'); sand(G); waterRect(96, G - 4, 32, L_H - G + 4, t); };
  SP.BG.water = (t) => { const y = stage.waterY || 40; waterRect(0, y, L_W, L_H - y, t); };
  SP.BG.perspective = (t) => {
    seaDashes(16, 4, t, '1');
    lcd.rect(0, 31, L_W, 1, '2');
    for (let y = 33; y < L_H; y++) {
      const gap = Math.max(2, Math.round(14 - (y - 33) / 4));
      if ((y - 33) % 2 === 0) for (let x = (y % 4) * 2; x < L_W; x += gap) lcd.px(x, y, '1');
    }
  };

  // ================================================================ shared actors & overlays
  let pup = null;
  const idle = anim(['pup_idle0', 'pup_idle0', 'pup_idle1', 'pup_idle1', 'pup_idle0', 'pup_blink', 'pup_idle0', 'pup_idle1'], 330);
  function addPup(x, y, spr) { pup = stage.add({ x: x == null ? PX : x, y: y == null ? PY : y, spr: spr || idle, z: 5 }); return pup; }

  function barkBubble(x, y) {
    return stage.overlay((now) => {
      lcd.bubble(x, y, 31, 11, 'l');
      const n = 1 + Math.floor(now / 190) % 3;
      for (let i = 0; i < 3; i++) if (i < n) lcd.text('æ', x + 4 + i * 8, y + 3, '3');
    });
  }
  function iconBubble(x, y, spriteName, tail) {
    return stage.overlay((now) => {
      const sz = SP.spriteSize(spriteName);
      lcd.bubble(x, y, sz.w + 6, sz.h + 6, tail || 'l');
      lcd.spr(spriteName, x + 3, y + 3);
    });
  }

  async function prompt(key, hintTarget, hintKey) {
    ui.caption(key);
    ui.hint(hintTarget || 'B', hintKey || 'ui.ok');
    await input.wait(['B']);
    ui.hint(null);
  }
  async function puppy(yes, key, pagesBefore) {
    await ui.say((pagesBefore || []).concat([{ key, puppy: yes }]));
  }

  // ================================================================ BOOT
  async function powerOn() {
    device.iconsOn = false;
    lcd.on = false;
    ui.hint('POWER', 'ui.power');
    await input.wait(['POWER']);
    ui.hint(null);
    audio.play('powerOn');
    SP.zoom(true);
    device.led = true;
    await wait(650);
    // boot: scanlines then logo
    lcd.on = true;
    stage.reset('blank');
    const boot = stage.overlay((now, t) => {
      const rows = Math.min(L_H, Math.floor(t / 4));
      lcd.rect(0, 0, L_W, rows, '3');
      if (t > 420) {
        lcd.rect(0, 0, L_W, L_H, '0');
        const w1 = lcd.textW('SEA', 2), w2 = lcd.textW('PUPPIES', 2);
        lcd.text('SEA', (L_W - w1) / 2, 28, '3', 2);
        lcd.text('PUPPIES', (L_W - w2) / 2, 42, '3', 2);
        if (Math.floor(t / 300) % 2) lcd.rect((L_W + w2) / 2 + 3, 50, 4, 2, '3');
        lcd.text('V1.0', L_W - 22, L_H - 8, '1');
      }
    });
    await wait(1900);
    stage.unoverlay(boot);
  }

  async function intro() {
    stage.reset('beach');
    stage.burst(64, 44, 14, { speed: 35, g: 0, life: 0.5, tone: '2' });
    audio.play('pop');
    const st = stage.add({ x: 49, y: G - 36, spr: anim(['stand0', 'stand1', 'stand2', 'stand3'], 160), z: 5 });
    await wait(1700);
    stage.remove(st);
    addPup();
    const b = barkBubble(80, 6);
    pup.spr = anim(['pup_bark0', 'pup_bark1'], 190);
    audio.play('bark', 3);
    await wait(900);
    pup.spr = idle;
    await wait(400);
    stage.unoverlay(b);
    ui.hint('B', 'ui.ok');
    await ui.say(['intro.p1', 'intro.p2', 'intro.p3']);
    ui.hint(null);
  }

  // ================================================================ MENU
  function menu(nextIdx) {
    const id = SP.ORDER[nextIdx];
    device.iconsOn = true; device.next = nextIdx; device.cursor = nextIdx; device.attention = true;
    stage.reset('beach');
    addPup();
    const bub = stage.overlay((now) => {
      if (Math.floor(now / 1400) % 3 === 2) return;
      lcd.spr('thought', 78, 6);
      lcd.spr('i_' + id, 83, 8);
    });
    ui.caption({ key: 'menu.next', vars: { need: () => SP.t('need.' + id) } });
    ui.hint('B', 'ui.ok');
    return new Promise(resolve => {
      input.handler = async (b) => {
        if (b === 'A') device.cursor = (device.cursor + 1) % 8;
        if (b === 'C') device.cursor = (device.cursor + 7) % 8;
        if (b === 'B') {
          if (device.cursor === nextIdx) {
            input.handler = null; stage.unoverlay(bub); ui.hint(null);
            resolve(id); return;
          }
          audio.play('sad');
          pup.spr = anim(['pup_sad', 'pup_idle0'], 200);
          setTimeout(() => { if (pup) pup.spr = idle; }, 900);
          ui.caption('menu.notyet');
        }
        ui.hint(device.cursor === nextIdx ? 'B' : 'A', device.cursor === nextIdx ? 'ui.ok' : 'ui.choose');
      };
    });
  }

  // ================================================================ STATUS (Tamagotchi hearts)
  async function status(final) {
    const n = SP.ORDER.filter(k => device.done[k]).length;
    const dogs = SP.ORDER.filter(k => device.done[k] && PUPPY[k]).length;
    stage.reset('blank');
    stage.overlay((now) => {
      const x0 = Math.round((L_W - (8 * 7 + 7 * 2)) / 2);
      for (let i = 0; i < 8; i++) {
        const full = i < n;
        const flash = final && Math.floor(now / 250) % 2;
        lcd.spr(full && !flash ? 'heart' : (full ? 'heart_empty' : 'heart_empty'), x0 + i * 9, 14);
      }
      lcd.spr('dog', 46, 30);
      lcd.text(dogs + '/' + n, 60, 32, '3');
      lcd.spr('check', 76, 31);
    });
    ui.announce(SP.t('status', { n }));
    audio.play('jingle');
    await wait(final ? 1600 : 1300);
  }

  // ================================================================ CHAPTERS
  const PUPPY = { food: true, sleep: true, play: true, talk: true, care: true, heal: false, thermo: false, decor: true };
  const CH = {};

  // ---------------------------------------------------------------- food
  CH.food = async function () {
    stage.reset('shore');
    addPup(40);
    await prompt('food.prompt');
    ui.hide();
    const walk = anim(['pup_walk0', 'pup_walk1'], 160);
    async function dive() {
      pup.spr = walk; pup.flip = false;
      await tween(pup, { x: 62 }, 800);
      pup.show = false;
      audio.play('splash');
      stage.burst(102, G - 6, 16, { speed: 45, g: 120, life: 0.8, tone: '2' });
      for (let i = 0; i < 4; i++) setTimeout(() => stage.burst(106 + Math.random() * 14, 84, 1, { angle: -Math.PI / 2, spread: 0.2, speed: 22, g: -10, life: 1.2, spr: 'bubble' }), i * 220);
      await wait(1100);
      pup.show = true; pup.x = 62;
    }
    // small fish → swallowed whole
    await dive();
    const fish = stage.add({ x: 0, y: 0, spr: anim(['fish_s0', 'fish_s1'], 150), z: 6 });
    const follow = () => { fish.x = pup.flip ? pup.x - 3 : pup.x + 30; fish.y = pup.y + 9; fish.flip = !pup.flip; };
    pup.spr = 'pup_open';
    const tick = setInterval(follow, 30);
    pup.spr = walk; pup.flip = true;
    await tween(pup, { x: 46 }, 700);
    pup.flip = false; pup.spr = 'pup_open';
    await wait(400);
    clearInterval(tick);
    stage.remove(fish);
    pup.spr = 'pup_gulp'; audio.play('gulp');
    await wait(700);
    pup.spr = idle;
    await wait(300);
    // big fish → shake it apart at the surface
    await dive();
    const big = stage.add({ x: 0, y: 0, spr: anim(['fish_b0', 'fish_b1'], 120), z: 6 });
    const tick2 = setInterval(() => {
      const L = pup.spr === 'pup_shakeL';
      big.x = pup.x + (L ? 26 : 27); big.y = pup.y + (L ? 12 : 3);
    }, 30);
    pup.spr = 'pup_shakeR';
    await wait(300);
    for (let i = 0; i < 6; i++) {
      pup.spr = i % 2 ? 'pup_shakeR' : 'pup_shakeL';
      if (i % 2 === 0) { audio.play('shake'); stage.burst(pup.x + 36, pup.y + 12, 3, { speed: 50, g: 140, life: 0.7, spr: 'chunk' }); }
      await wait(190);
    }
    clearInterval(tick2);
    stage.remove(big);
    pup.spr = 'pup_gulp'; audio.play('gulp');
    await wait(500);
    pup.spr = 'pup_idle0';
    await wait(200);
    pup.spr = 'pup_gulp'; audio.play('gulp');
    await wait(600);
    pup.spr = 'pup_happy';
    await wait(500);
    pup.spr = idle;
    await puppy(PUPPY.food, 'food.puppy', ['food.p1', 'food.p2']);
  };

  // ---------------------------------------------------------------- sleep
  CH.sleep = async function () {
    stage.reset('beach');
    addPup();
    await prompt('sleep.prompt');
    ui.hide();
    lcd.pal = 'night';
    pup.spr = anim(['lie0', 'lie1'], 900); pup.x = 44; pup.y = G - 20;
    audio.play('snore');
    const zz = setInterval(() => stage.particles.push({ x: 80, y: 30, vx: 7, vy: -9, g: 0, life: 2.4, age: 0, spr: 'zz' }), 950);
    await wait(1000);
    const a = stage.add({ x: -40, y: G - 20, spr: 'lie0', z: 2 });
    const b = stage.add({ x: 130, y: G - 20, spr: 'lie1', flip: true, z: 2 });
    await Promise.all([tween(a, { x: 10 }, 1300), tween(b, { x: 80 }, 1300)]);
    audio.play('snore');
    await ui.say(['sleep.p1']);
    clearInterval(zz);
    // the cousin: a northern fur seal asleep at sea, half a brain at a time
    stage.reset('water'); stage.waterY = 41;
    const fur = stage.add({ x: 42, y: 41 - 19, spr: anim(['fur0', 'fur1', 'fur2', 'fur3'], 260), z: 5 });
    stage.overlay((now) => {
      // pixels below the waterline look submerged
      for (let y = 42; y < 47; y++) for (let x = fur.x; x < fur.x + 40; x++) if ((x + y) % 2 === 0) lcd.px(x, y, '0');
      // the brain: one hemisphere asleep, one awake
      const bx = 98, by = 6;
      lcd.rect(bx + 2, by, 20, 1); lcd.rect(bx + 2, by + 13, 20, 1); lcd.rect(bx, by + 2, 1, 10); lcd.rect(bx + 23, by + 2, 1, 10);
      lcd.px(bx + 1, by + 1); lcd.px(bx + 22, by + 1); lcd.px(bx + 1, by + 12); lcd.px(bx + 22, by + 12);
      lcd.rect(bx + 1, by + 1, 11, 12, '3');
      lcd.rect(bx + 12, by + 1, 11, 12, '0');
      lcd.rect(bx + 12, by + 1, 1, 12, '2');
      lcd.text('z', bx + 4, by + 4, '0');
      if (Math.floor(now / 500) % 4) { lcd.rect(bx + 16, by + 5, 3, 3, '3'); lcd.px(bx + 16, by + 5, '0'); }
      lcd.line(bx + 12, by + 14, fur.x + 30, fur.y + 12, '1');
    });
    await puppy(PUPPY.sleep, 'sleep.puppy', ['sleep.p2', 'sleep.p3']);
    lcd.pal = 'day';
    stage.waterY = 40;
  };

  // ---------------------------------------------------------------- play
  CH.play = async function () {
    stage.reset('perspective');
    addPup(30);
    await prompt('play.prompt');
    ui.hide();
    const VP = { x: 104, y: 31 };
    const ball = stage.add({ x: 8, y: 26, spr: 'ball', z: 6, scale: 1 });
    const bp = { k: 0 };
    const ballTick = setInterval(() => {
      const k = bp.k;
      ball.x = SP.lerp(8, VP.x - 3, k); ball.y = SP.lerp(26, VP.y - 6, k) - Math.sin(k * Math.PI) * 18; ball.scale = SP.lerp(1, 0.1, k);
    }, 16);
    audio.play('pop');
    const pos = { k: 0 };
    const run = anim(['pup_walk0', 'pup_walk1'], 110);
    pup.draw = (now) => {
      const k = pos.k;
      const bx = SP.lerp(PX - 16 + 18, VP.x, k), by = SP.lerp(G, VP.y + 1, k);
      const sc = SP.lerp(1, 0.02, Math.pow(k, 0.7));
      lcd.spr(pos.spr || run(now), bx - 18, by - 30, { scale: sc, flip: pos.flip });
      if (pos.carry) lcd.spr('ball', bx - 18 + (pos.flip ? 2 : 31) * 1 * (sc) + (1 - sc) * 18, by - 30 + 30 - (30 - 9) * sc, { scale: sc });
    };
    await tween(bp, { k: 1 }, 900);
    clearInterval(ballTick);
    await tween(pos, { k: 1 }, 1700, (t) => t);
    ball.show = false;
    await wait(900);          // ...a single pixel, far away
    pos.flip = true; pos.carry = true;
    await tween(pos, { k: 0 }, 1700, (t) => t);
    pos.carry = false; pos.flip = false;
    pup.draw = null; pup.x = PX - 16; pup.y = PY;
    stage.burst(pup.x + 32, pup.y + 12, 1, { speed: 10, g: 140, life: 0.5, spr: 'ball' });
    pup.spr = anim(['pup_happy', 'pup_bark1'], 200);
    audio.play('bark', 2);
    await wait(900);
    pup.spr = idle;
    await puppy(PUPPY.play, 'play.puppy', ['play.p1', 'play.p2']);
  };

  // ---------------------------------------------------------------- talk (bark · roll call · nose to nose)
  const VOICES = {
    you: [0.12, 0.34, 0.62, 0.84, 0.7, 0.46, 0.38, 0.52, 0.76, 0.92, 0.74, 0.4],
    flat: [0.6, 0.63, 0.66, 0.67, 0.66, 0.64, 0.62, 0.6, 0.57, 0.54, 0.5, 0.46],
    rise: [0.12, 0.22, 0.31, 0.4, 0.49, 0.57, 0.65, 0.72, 0.79, 0.85, 0.9, 0.92],
    w: [0.9, 0.76, 0.52, 0.34, 0.46, 0.72, 0.86, 0.62, 0.34, 0.26, 0.4, 0.62]
  };
  function drawCard(x, y, w, h, pts, sel, crossed) {
    lcd.rect(x, y, w, h, '0');
    lcd.frame(x, y, w, h, '3');
    if (sel) lcd.frame(x + 1, y + 1, w - 2, h - 2, '3');
    for (let gy = 1; gy <= 2; gy++) { const yy = y + Math.round(h * gy / 3); for (let xx = x + 3; xx < x + w - 3; xx += 2) lcd.px(xx, yy, '1'); }
    const n = pts.length;
    let px0 = null, py0 = null;
    for (let i = 0; i < n; i++) {
      const xx = x + 3 + i * (w - 7) / (n - 1), yy = y + h - 4 - pts[i] * (h - 8);
      if (px0 != null) { lcd.line(px0, py0, xx, yy, '3'); lcd.line(px0, py0 - 1, xx, yy - 1, '3'); }
      px0 = xx; py0 = yy;
    }
    if (crossed) lcd.spr('cross', x + w / 2 - 3, y + h / 2 - 3);
  }

  CH.talk = async function () {
    stage.reset('beach');
    addPup();
    ui.caption('talk.prompt');
    ui.hint('B', 'ui.x3');
    await input.wait(['B']);
    ui.hint(null);
    // 1 · bark
    const bb = barkBubble(80, 6);
    pup.spr = anim(['pup_bark0', 'pup_bark1'], 200);
    audio.play('bark', 3);
    setTimeout(() => audio.play('bark', 3), 700);
    ui.caption('talk.bark');
    await wait(1400);
    pup.spr = idle;
    ui.hint('B', 'ui.x3');
    await input.wait(['B']);
    stage.unoverlay(bb);
    ui.hint(null);
    // 2 · roll call
    pup.spr = 'pup_open';
    const q = iconBubble(78, 8, 'quest', 'l');
    audio.play('bleat');
    ui.caption('talk.call');
    await wait(800);
    pup.spr = idle;
    const m = stage.overlay((now) => {
      lcd.bubble(104, 12, 16, 12, 'r');
      lcd.spr('note', 110, 15);
    });
    audio.play('trumpet');
    await wait(900);
    audio.play('bleat');
    await wait(600);
    audio.play('trumpet');
    await wait(500);
    await input.wait(['B']);
    stage.unoverlay(q); stage.unoverlay(m);
    // the crowd: one pixel per sea lion
    await ui.say(['talk.crowd1'], { keep: true });
    ui.hide();
    const N = L_W * L_H;
    const order = new Uint16Array(N);
    for (let i = 0; i < N; i++) order[i] = i;
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
    const fill = { n: 0, flash: false };
    const crowd = stage.overlay(() => {
      const n = Math.floor(fill.n);
      for (let i = 0; i < n; i++) { const p = order[i]; lcd.px(p % L_W, (p / L_W) | 0, (p * 7) % 3 ? '3' : '2'); }
      const label = String(n).padStart(5, ' ');
      lcd.rect(1, 1, 25, 9, fill.flash ? '3' : '0'); lcd.frame(1, 1, 25, 9, '3');
      lcd.text(label, 3, 3, fill.flash ? '0' : '3');
    });
    audio.play('crowd', 2.8); audio.play('fill');
    await tween(fill, { n: N }, 2800, (t) => t * t);
    for (let i = 0; i < 4; i++) { fill.flash = !fill.flash; await wait(160); }
    fill.flash = false;
    await ui.say(['talk.crowd2'], { keep: true });
    stage.unoverlay(crowd);
    // mini game: be the mom, find your pup by voice
    stage.reset('blank');
    const big = stage.overlay(() => { drawCard(30, 6, 68, 36, VOICES.you, true, false); lcd.spr('note', 22, 8); });
    ui.caption('talk.game1');
    audio.play('voice', VOICES.you); setTimeout(() => audio.play('voice', VOICES.you), 1150);
    await wait(900);
    await input.wait(['B']);
    stage.unoverlay(big);
    const decoys = ['flat', 'rise', 'w'].sort(() => Math.random() - 0.5).slice(0, 2);
    const cards = ['you'].concat(decoys).sort(() => Math.random() - 0.5);
    const crossed = {};
    const g = { sel: 0 };
    stage.overlay((now) => {
      cards.forEach((c, i) => {
        const x = 3 + i * 42;
        drawCard(x, 9, 38, 26, VOICES[c], g.sel === i, crossed[i]);
        lcd.text(String(i + 1), x + 18, 38, '3');
      });
      if (Math.floor(now / 300) % 2) lcd.spr('cursor_down', 3 + g.sel * 42 + 17, 3);
    });
    ui.caption('talk.game2');
    ui.hint('A', 'ui.listen');
    audio.play('voice', VOICES[cards[0]]);
    for (;;) {
      const b = await input.wait(['A', 'B', 'C']);
      if (b === 'A' || b === 'C') {
        g.sel = (g.sel + (b === 'A' ? 1 : 2)) % 3;
        audio.play('voice', VOICES[cards[g.sel]]);
        ui.hint('B', 'ui.pick');
        continue;
      }
      if (cards[g.sel] === 'you') break;
      crossed[g.sel] = true;
      audio.play('error');
      await ui.caption('talk.wrong');
      await wait(1300);
      ui.caption('talk.game2');
      ui.hint('A', 'ui.listen');
    }
    ui.hint(null);
    audio.play('jingle');
    await ui.say(['talk.right'], { keep: true });
    // 3 · nose to nose
    stage.reset('beach');
    addPup(38);
    pup.spr = 'pup_sniff';
    const mom = stage.add({ x: 130, y: G - 24, spr: anim(['mom', 'mom', 'mom', 'mom_blink'], 300), z: 4 });
    ui.caption('talk.sniff');
    ui.hint('B', 'ui.ok');
    await tween(mom, { x: 74 }, 1100);
    audio.play('sniff');
    stage.burst(73, G - 20, 1, { angle: -Math.PI / 2, spread: 0.1, speed: 14, g: -6, life: 1.6, spr: 'heart' });
    audio.play('pop');
    await input.wait(['B']);
    ui.hint(null);
    await puppy(PUPPY.talk, 'talk.puppy', ['talk.p1', 'talk.p2']);
  };

  // ---------------------------------------------------------------- care
  CH.care = async function () {
    stage.reset('beach');
    addPup();
    await prompt('care.prompt');
    ui.hide();
    pup.spr = anim(['pup_scratch0', 'pup_scratch1'], 170);
    for (let i = 0; i < 5; i++) {
      audio.play('scratch');
      stage.burst(pup.x + 16, pup.y + 13, 3, { speed: 30, g: 80, life: 0.6, tone: i % 2 ? '1' : '2' });
      await wait(420);
    }
    pup.spr = 'pup_happy';
    await wait(500);
    pup.spr = idle;
    await puppy(PUPPY.care, 'care.puppy', ['care.p1', 'care.p2']);
  };

  // ---------------------------------------------------------------- heal (the data twist)
  CH.heal = async function () {
    stage.reset('beach');
    addPup(PX, PY, anim(['pup_sad', 'pup_sad', 'pup_sad', 'pup_blink'], 300));
    const cuts = [];
    const strap = { on: true, pts: [] };
    for (let i = 0; i <= 11; i++) strap.pts.push([pup.x + 14 + i, pup.y + 19 - Math.round(i * 0.36)]);
    const s = stage.overlay(() => {
      if (!strap.on) return;
      strap.pts.forEach(([x, y], i) => {
        if (cuts.some(c => Math.abs(c - i) <= 1)) return;
        lcd.px(x, y - 1, '3'); lcd.px(x, y, '0'); lcd.px(x, y + 1, '0'); lcd.px(x, y + 2, '3');
      });
    });
    const bang = stage.overlay((now) => { if (Math.floor(now / 400) % 2) lcd.spr('bang', pup.x + 32, pup.y - 4); });
    await prompt('heal.prompt', 'B', 'ui.cut');
    ui.hint('B', 'ui.cut');
    const points = [2, 5, 9];
    for (let k = 0; k < 3; k++) {
      const [x, y] = strap.pts[points[k]];
      const sc = stage.add({ x: x - 8, y: y - 10, spr: 'scis_open', z: 9 });
      await input.wait(['B']);
      sc.spr = 'scis_shut'; audio.play('snip');
      cuts.push(points[k]);
      await wait(260);
      stage.remove(sc);
    }
    ui.hint(null);
    stage.unoverlay(bang);
    strap.on = false;
    strap.pts.forEach(([x, y]) => stage.particles.push({ x, y, vx: (Math.random() - 0.5) * 30, vy: -10, g: 160, life: 0.9, age: 0, t: '3' }));
    ui.hide();
    pup.spr = 'pup_wide';
    await wait(600);
    pup.spr = anim(['pup_happy', 'pup_bark1'], 220);
    audio.play('jingle'); audio.play('bark', 2);
    await wait(1000);
    pup.spr = idle;
    // the chart: what actually gets stuck around sea lions' necks
    stage.reset('blank');
    const DATA = [['ico_strap', 54], ['ico_rubber', 30], ['ico_net', 7], ['ico_rope', 7], ['ico_line', 2]];
    const grow = { k: 0, hi: -1 };
    stage.overlay((now) => {
      DATA.forEach(([ico, v], i) => {
        const y = 3 + i * 8;
        lcd.spr(ico, 3, y);
        const len = Math.max(1, Math.round((v / 54) * 86 * SP.clamp(grow.k * 1.6 - i * 0.15, 0, 1)));
        lcd.rect(13, y, len, 5, '3');
        lcd.rect(13, y, len, 1, '2');
        const blink = grow.hi === i && Math.floor(now / 300) % 2;
        if (blink) lcd.frame(11, y - 2, len + 4, 9, '3');
        if (grow.k > 0.6) lcd.text(v + '%', 13 + len + 3, y, '3');
      });
      lcd.rect(12, 1, 1, 41, '2'); // baseline
    });
    tween(grow, { k: 1 }, 1400, (t) => t);
    await ui.say(['heal.p1'], { keep: true });
    grow.hi = 2;
    await ui.say(['heal.p2'], { keep: true });
    grow.hi = -1;
    await puppy(PUPPY.heal, 'heal.puppy', ['heal.p3', 'heal.p4']);
  };

  // ---------------------------------------------------------------- thermoregulation
  function thermometer(level) {
    return stage.overlay(() => {
      const x = 117, y = 6, h = 34;
      lcd.frame(x, y, 5, h, '3');
      lcd.rect(x - 1, y + h - 1, 7, 6, '3');
      const fillH = Math.round((h - 2) * level.v);
      lcd.rect(x + 1, y + h - 1 - fillH, 3, fillH, '2');
      lcd.rect(x, y + h, 5, 4, '2');
      for (let i = 0; i < 4; i++) lcd.px(x - 2, y + 4 + i * 8, '3');
    });
  }
  CH.thermo = async function () {
    stage.reset('beach');
    addPup(40);
    const level = { v: 0.45 };
    thermometer(level);
    await prompt('thermo.prompt', 'B', 'ui.sun');
    const sun = stage.add({ x: 6, y: 4, spr: 'sun', z: 1 });
    const shimmer = stage.overlay((now) => {
      for (let i = 0; i < 6; i++) { const x = 8 + i * 18 + (Math.floor(now / 200) % 3); lcd.px(x, G - 6 - (i % 2), '1'); lcd.px(x + 1, G - 7 - (i % 2), '1'); }
    });
    tween(level, { v: 0.95 }, 1500);
    pup.spr = anim(['pup_fan', 'pup_idle0'], 230);
    await wait(1500);
    pup.spr = 'pup_bark1';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 5; j++) stage.particles.push({ x: pup.x + 22 + Math.random() * 8, y: G - 1, vx: -28 - Math.random() * 18, vy: -55 - Math.random() * 20, g: 150, life: 0.8, age: 0, t: '2' });
      audio.play('scratch');
      await wait(420);
    }
    pup.spr = idle;
    ui.caption('thermo.hot');
    ui.hint('B', 'ui.wind');
    await input.wait(['B']);
    ui.hint(null);
    stage.unoverlay(shimmer);
    // cold: float, flipper to the sun
    stage.reset('water'); stage.waterY = 44;
    thermometer(level);
    stage.add({ x: 6, y: 4, spr: 'sun', z: 1 });
    const fl = stage.add({ x: 36, y: 44 - 21, spr: anim(['float0', 'float1', 'float2', 'float3'], 280), z: 5 });
    stage.overlay((now) => {
      for (let i = 0; i < 5; i++) { const x = (L_W - ((now / 12 + i * 37) % (L_W + 20))) | 0; lcd.rect(x, 12 + i * 6, 8, 1, '1'); }
    });
    audio.play('wind');
    tween(level, { v: 0.15 }, 1500);
    ui.caption('thermo.cold');
    await wait(900);
    await input.wait(['B']);
    stage.waterY = 40;
    await puppy(PUPPY.thermo, 'thermo.puppy', ['thermo.p1', 'thermo.p2']);
  };

  // ---------------------------------------------------------------- decor
  CH.decor = async function () {
    stage.reset('beach');
    addPup();
    const HATS = ['hat_beanie', 'hat_top', 'hat_prop', 'hat_party'];
    const h = { i: 0, on: true };
    stage.add({ z: 7, draw: (now) => {
      if (!h.on) return;
      const name = HATS[h.i];
      const sz = SP.spriteSize(name);
      const cur = typeof pup.spr === 'function' ? pup.spr(now) : pup.spr;
      const dy = cur === 'pup_idle1' ? 1 : 0;
      lcd.spr(name, pup.x + 23 - Math.floor(sz.w / 2) + 1, pup.y + 2 - sz.h + dy);
    } });
    ui.caption('decor.prompt');
    ui.hint('A', 'ui.hat');
    for (;;) {
      const b = await input.wait(['A', 'B', 'C']);
      if (b === 'A') { h.i = (h.i + 1) % HATS.length; audio.play('pop'); ui.hint('B', 'ui.ok'); }
      else if (b === 'C') { h.i = (h.i + HATS.length - 1) % HATS.length; audio.play('pop'); }
      else break;
    }
    ui.hint(null);
    audio.play('jingle');
    pup.spr = 'pup_happy';
    await wait(700);
    pup.spr = idle;
    await ui.say(['decor.p1'], { keep: true });
    // the real accessory: the only colour on the whole screen
    h.on = false;
    const tag = { on: false };
    stage.add({ z: 8, draw: (now) => {
      if (!tag.on) return;
      lcd.spr('tag', pup.x + 27, pup.y + 21);
      lcd.spr('sat_tag', pup.x + 12, pup.y + 14);
    } });
    for (let i = 0; i < 5; i++) { tag.on = !tag.on; audio.play(tag.on ? 'snip' : 'beep'); await wait(180); }
    tag.on = true;
    await puppy(PUPPY.decor, 'decor.puppy', ['decor.p2', 'decor.p3']);
  };

  // ================================================================ FINALE
  async function finale() {
    device.attention = false;
    await status(true);
    await ui.say(['end.p1'], { keep: true });
    stage.reset('blank');
    stage.overlay(() => {
      lcd.spr('dog', 30, 18);
      lcd.text('6/8', 46, 14, '3', 3);
    });
    audio.play('jingle');
    await ui.say(['end.p2', 'end.p3']);
    // goodbye
    stage.reset('shore');
    addPup(40);
    await wait(500);
    pup.spr = anim(['pup_walk0', 'pup_walk1'], 170);
    await tween(pup, { x: 58 }, 1100);
    pup.spr = 'pup_idle0'; pup.flip = true;     // one look back
    await wait(900);
    pup.flip = false; pup.spr = 'pup_bark1';
    audio.play('bark', 1);
    await wait(500);
    pup.spr = anim(['pup_walk0', 'pup_walk1'], 170);
    await tween(pup, { x: 66 }, 600);
    pup.show = false;
    audio.play('splash');
    stage.burst(104, G - 6, 18, { speed: 46, g: 120, life: 0.9, tone: '2' });
    await wait(1500);
    ui.caption('end.p4');
    ui.hint('POWER', 'ui.powerOff');
    await input.wait(['POWER']);
    ui.hint(null);
    ui.hide();
    audio.play('powerOff');
    device.iconsOn = false;
    device.led = false;
    const wrap = document.getElementById('lcdWrap');
    wrap.classList.add('collapse');
    await wait(650);
    lcd.on = false;
    wrap.classList.remove('collapse');
    if (SP.showCredits) SP.showCredits();
  }

  // ================================================================ main
  async function main() {
    SP.boot();
    const q = new URLSearchParams(location.search);
    if (q.has('credits')) { SP.zoom(false); SP.showCredits(true); return; }
    await powerOn();
    const jump = q.get('ch');
    if (!jump && !q.has('end')) await intro();
    let start = 0;
    if (jump && SP.ORDER.indexOf(jump) >= 0) start = SP.ORDER.indexOf(jump);
    if (q.has('end')) start = SP.ORDER.length;
    for (let i = 0; i < start; i++) device.done[SP.ORDER[i]] = true;
    for (let i = start; i < SP.ORDER.length; i++) {
      const id = await menu(i);
      device.attention = false;
      ui.hide();
      await CH[id]();
      device.done[id] = true;
      if (i < SP.ORDER.length - 1) await status(false);
    }
    await finale();
  }
  SP.PUPPY = PUPPY;
  window.addEventListener('DOMContentLoaded', main);
  if (document.readyState !== 'loading') { window.removeEventListener('DOMContentLoaded', main); main(); }
})();
