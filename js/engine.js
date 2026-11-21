/* SEA PUPPIES — the pager: shell, LCD, buttons, dialog box, hints, sky. */
(function () {
  const SP = window.SP;

  // ------------------------------------------------------------------ constants
  const DEV_W = 112, DEV_H = 160;
  const L_W = 128, L_H = 96;
  SP.L_W = L_W; SP.L_H = L_H;
  SP.GROUND = 58;                       // LCD row where the beach starts

  const PAL = {
    day:   { '0': '#a7b394', '1': '#879474', '2': '#5b664f', '3': '#212a1e', 'o': '#ff7a1a' },
    night: { '0': '#6e7962', '1': '#5a6450', '2': '#3e4737', '3': '#131911', 'o': '#ff7a1a' }
  };
  const LCD_OFF = '#8b9780';
  SP.PAL = PAL;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  SP.reduced = reduced;
  const qs = new URLSearchParams(location.search);
  SP.fast = qs.has('fast');

  // ------------------------------------------------------------------ helpers
  SP.wait = (ms) => new Promise(r => setTimeout(r, SP.fast ? Math.min(ms, 60) : ms));
  SP.now = () => performance.now();
  SP.lerp = (a, b, t) => a + (b - a) * t;
  SP.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  SP.ease = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  SP.tween = function (obj, to, ms, ease) {
    ms = SP.fast ? Math.min(ms, 60) : ms;
    const from = {}; for (const k in to) from[k] = obj[k];
    const t0 = performance.now(); ease = ease || SP.ease;
    return new Promise(res => {
      function step() {
        const t = Math.min(1, (performance.now() - t0) / ms);
        const e = ease(t);
        for (const k in to) obj[k] = from[k] + (to[k] - from[k]) * e;
        if (t < 1) requestAnimationFrame(step); else res();
      }
      requestAnimationFrame(step);
    });
  };
  SP.anim = (frames, ms) => (now) => frames[Math.floor(now / ms) % frames.length];

  // ------------------------------------------------------------------ sprite cache
  const cache = {};
  function sprite(name, pal, flip) {
    pal = pal || 'day';
    const key = name + '|' + pal + '|' + (flip ? 1 : 0);
    if (cache[key]) return cache[key];
    const rows = SP.SPRITES[name] || SP.EXTRA[name];
    if (!rows) { console.warn('missing sprite', name); return null; }
    const h = rows.length, w = Math.max.apply(null, rows.map(r => r.length));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    const P = PAL[pal];
    for (let y = 0; y < h; y++) {
      const r = rows[y];
      for (let x = 0; x < r.length; x++) {
        const ch = r[x];
        if (ch === '.' || ch === ' ') continue;
        g.fillStyle = P[ch] || P['3'];
        g.fillRect(flip ? w - 1 - x : x, y, 1, 1);
      }
    }
    cache[key] = c;
    return c;
  }
  SP.sprite = sprite;
  SP.spriteSize = (name) => { const r = SP.SPRITES[name] || SP.EXTRA[name]; return r ? { w: Math.max.apply(null, r.map(s => s.length)), h: r.length } : { w: 0, h: 0 }; };
  SP.spriteURL = function (name, scale, colors) {
    const rows = SP.SPRITES[name] || SP.EXTRA[name];
    const w = Math.max.apply(null, rows.map(r => r.length)), h = rows.length;
    const c = document.createElement('canvas'); c.width = w * scale; c.height = h * scale;
    const g = c.getContext('2d');
    const P = colors || PAL.day;
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const ch = r[x]; if (ch === '.') continue; g.fillStyle = P[ch] || P['3']; g.fillRect(x * scale, y * scale, scale, scale); } });
    return c.toDataURL();
  };

  // extra sprites defined here (need icons, small UI glyphs, accessories)
  SP.EXTRA = {
    i_food:   ['.........', '....33...', '3..3333..', '33333.333', '333333333', '3..3333..', '....33...', '.........', '.........'],
    i_sleep:  ['...333...', '..33.....', '.33......', '.33......', '.33......', '.333...3.', '..33333..', '...333...', '.........'],
    i_play:   ['...333...', '.33...33.', '.3.3.3.3.', '3...3...3', '3..333..3', '3...3...3', '.3.3.3.3.', '.33...33.', '...333...'],
    i_talk:   ['.........', '.3333333.', '3.......3', '3.33.33.3', '3.......3', '.333333..', '...3.....', '..3......', '.........'],
    i_care:   ['.........', '333333333', '333333333', '3.3.3.3.3', '3.3.3.3.3', '3.3.3.3.3', '.........', '.........', '.........'],
    i_heal:   ['...333...', '...333...', '333333333', '333333333', '333333333', '...333...', '...333...', '.........', '.........'],
    i_thermo: ['....3....', '...3.3...', '...333...', '...3.3...', '...333...', '...333...', '..33333..', '..33333..', '...333...'],
    i_decor:  ['...333...', '...333...', '...333...', '...333...', '..33333..', '333333333', '333333333', '.........', '.........'],
    thought:  ['....33333333333....', '..333.........333..', '.33.............33.', '3.................3', '3.................3', '3.................3', '3.................3', '3.................3', '3.................3', '3.................3', '.33.............33.', '..333.........333..', '....33333333333....', '...33..............', '.33................', '33.................'],
    acc_bow:     ['33...33', '3133313', '3113113', '3133313', '33...33'],
    acc_glasses: ['3333.3333', '3113.3113', '3113331130', '3333.3333'],
    ronan_note:  ['..333', '..3.3', '..3..', '333..', '333..']
  };

  // ------------------------------------------------------------------ LCD drawing API
  const lcdCanvas = document.getElementById('lcd');
  const L = lcdCanvas.getContext('2d');
  L.imageSmoothingEnabled = false;

  const lcd = SP.lcd = {
    pal: 'day',
    on: false,
    c(t) { return PAL[this.pal][t] || t; },
    clear() { L.fillStyle = this.c('0'); L.fillRect(0, 0, L_W, L_H); },
    spr(name, x, y, o) {
      o = o || {};
      const c = sprite(name, o.pal || this.pal, o.flip);
      if (!c) return;
      if (o.scale && o.scale !== 1) {
        const w = Math.max(1, Math.round(c.width * o.scale)), h = Math.max(1, Math.round(c.height * o.scale));
        if (o.scale < 0.06) { L.fillStyle = this.c('3'); L.fillRect(Math.round(x + c.width / 2), Math.round(y + c.height - 1), 1, 1); return; }
        L.drawImage(c, Math.round(x + c.width / 2 - w / 2), Math.round(y + c.height - h), w, h);
      } else {
        L.drawImage(c, Math.round(x), Math.round(y));
      }
    },
    px(x, y, t) { L.fillStyle = this.c(t || '3'); L.fillRect(Math.round(x), Math.round(y), 1, 1); },
    rect(x, y, w, h, t) { L.fillStyle = this.c(t || '3'); L.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
    frame(x, y, w, h, t) { this.rect(x, y, w, 1, t); this.rect(x, y + h - 1, w, 1, t); this.rect(x, y, 1, h, t); this.rect(x + w - 1, y, 1, h, t); },
    line(x0, y0, x1, y1, t) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      L.fillStyle = this.c(t || '3');
      for (;;) {
        L.fillRect(x0, y0, 1, 1);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    },
    dither(x, y, w, h, t, step) {
      step = step || 2; L.fillStyle = this.c(t || '1');
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (((i + j) % step) === 0 && (j % (step > 2 ? 2 : 1)) === 0) L.fillRect(x + i, y + j, 1, 1);
    },
    text(str, x, y, t, scale) {
      scale = scale || 1;
      L.fillStyle = this.c(t || '3');
      let cx = Math.round(x);
      for (const ch of String(str)) {
        const g = SP.FONT_WIDE[ch] || SP.FONT[ch] || LETTERS[ch.toUpperCase()] || null;
        if (!g) { cx += 4 * scale; continue; }
        for (let j = 0; j < g.length; j++) for (let i = 0; i < g[j].length; i++) if (g[j][i] !== '.') L.fillRect(cx + i * scale, Math.round(y) + j * scale, scale, scale);
        cx += (g[0].length + 1) * scale;
      }
      return cx - x;
    },
    textW(str, scale) {
      scale = scale || 1; let w = 0;
      for (const ch of String(str)) { const g = SP.FONT_WIDE[ch] || SP.FONT[ch] || LETTERS[ch.toUpperCase()]; w += ((g ? g[0].length : 3) + 1) * scale; }
      return w - scale;
    },
    bubble(x, y, w, h, tail) {
      // pixel speech bubble with a tail on the bottom-left ('l') or bottom-right ('r')
      this.rect(x + 1, y, w - 2, h, '0'); this.rect(x, y + 1, w, h - 2, '0');
      this.rect(x + 2, y, w - 4, 1); this.rect(x + 2, y + h - 1, w - 4, 1);
      this.rect(x, y + 2, 1, h - 4); this.rect(x + w - 1, y + 2, 1, h - 4);
      this.px(x + 1, y + 1); this.px(x + w - 2, y + 1); this.px(x + 1, y + h - 2); this.px(x + w - 2, y + h - 2);
      if (tail === 'l') { this.rect(x + 3, y + h - 1, 3, 1, '0'); this.px(x + 3, y + h); this.px(x + 2, y + h + 1); this.px(x + 4, y + h); this.px(x + 5, y + h - 1); }
      if (tail === 'r') { this.rect(x + w - 6, y + h - 1, 3, 1, '0'); this.px(x + w - 4, y + h); this.px(x + w - 3, y + h + 1); this.px(x + w - 5, y + h); this.px(x + w - 6, y + h - 1); }
    }
  };

  const LETTERS = {
    A: ['333', '3.3', '333', '3.3', '3.3'], B: ['33.', '3.3', '33.', '3.3', '33.'], C: ['333', '3..', '3..', '3..', '333'],
    D: ['33.', '3.3', '3.3', '3.3', '33.'], E: ['333', '3..', '33.', '3..', '333'], F: ['333', '3..', '33.', '3..', '3..'],
    G: ['333', '3..', '3.3', '3.3', '333'], H: ['3.3', '3.3', '333', '3.3', '3.3'], I: ['333', '.3.', '.3.', '.3.', '333'],
    J: ['..3', '..3', '..3', '3.3', '333'], K: ['3.3', '3.3', '33.', '3.3', '3.3'], L: ['3..', '3..', '3..', '3..', '333'],
    M: ['3.3', '333', '333', '3.3', '3.3'], N: ['333', '3.3', '3.3', '3.3', '3.3'], O: ['333', '3.3', '3.3', '3.3', '333'],
    P: ['333', '3.3', '333', '3..', '3..'], Q: ['333', '3.3', '3.3', '333', '..3'], R: ['333', '3.3', '33.', '3.3', '3.3'],
    S: ['333', '3..', '333', '..3', '333'], T: ['333', '.3.', '.3.', '.3.', '.3.'], U: ['3.3', '3.3', '3.3', '3.3', '333'],
    V: ['3.3', '3.3', '3.3', '3.3', '.3.'], W: ['3.3', '3.3', '333', '333', '3.3'], X: ['3.3', '3.3', '.3.', '3.3', '3.3'],
    Y: ['3.3', '3.3', '.3.', '.3.', '.3.'], Z: ['333', '..3', '.3.', '3..', '333']
  };
  SP.LETTERS = LETTERS;

  // ------------------------------------------------------------------ stage (actors + particles + overlays)
  const stage = SP.stage = {
    bg: null, actors: [], particles: [], overlays: [], t0: 0,
    reset(bg) { this.bg = bg || null; this.actors = []; this.particles = []; this.overlays = []; this.t0 = performance.now(); },
    add(a) { const o = Object.assign({ x: 0, y: 0, z: 0, show: true, flip: false, scale: 1 }, a); this.actors.push(o); return o; },
    remove(a) { this.actors = this.actors.filter(x => x !== a); },
    overlay(fn) { this.overlays.push(fn); return fn; },
    unoverlay(fn) { this.overlays = this.overlays.filter(x => x !== fn); },
    burst(x, y, n, opt) {
      opt = opt || {};
      for (let i = 0; i < n; i++) {
        const a = (opt.angle != null ? opt.angle : -Math.PI / 2) + (Math.random() - 0.5) * (opt.spread != null ? opt.spread : 2.2);
        const sp = (opt.speed || 40) * (0.5 + Math.random());
        this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: opt.g != null ? opt.g : 90, life: opt.life || 0.9, age: 0, spr: opt.spr, t: opt.tone || '3' });
      }
    }
  };
  SP.BG = {};   // background painters, filled by story.js

  let lastRender = 0;
  function renderLCD(now) {
    if (!lcd.on) { L.fillStyle = LCD_OFF; L.fillRect(0, 0, L_W, L_H); return; }
    lcd.clear();
    const t = now - stage.t0;
    if (stage.bg && SP.BG[stage.bg]) SP.BG[stage.bg](t, now);
    const acts = stage.actors.slice().sort((a, b) => a.z - b.z);
    for (const a of acts) {
      if (!a.show) continue;
      if (a.draw) { a.draw(now, a); continue; }
      const name = typeof a.spr === 'function' ? a.spr(now, a) : a.spr;
      if (name) lcd.spr(name, a.x, a.y, { flip: a.flip, scale: a.scale, pal: a.pal });
    }
    const dt = Math.min(0.2, (now - lastRender) / 1000);
    stage.particles = stage.particles.filter(p => (p.age += dt) < p.life);
    for (const p of stage.particles) {
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.spr) lcd.spr(p.spr, p.x, p.y); else lcd.px(p.x, p.y, p.t);
    }
    for (const o of stage.overlays) o(now, t);
    lastRender = now;
  }

  // ------------------------------------------------------------------ device shell
  const shellCanvas = document.getElementById('shell');
  const S = shellCanvas.getContext('2d');
  const SHELL = {
    out: '#1c0f10', dark: '#5c1f21', mid: '#8e352f', light: '#b5513e', hi: '#d9805f',
    bone: '#e8dec5', boneShade: '#cbbf9f', boneEdge: '#a39577',
    icon: '#2a2420', ghost: '#d6ccb0', doneIcon: '#857a62',
    btn: '#4d1a1d', btnMid: '#6f2629', btnHi: '#a8473f',
    metal: '#9aa0a8', metalDark: '#5c626b', metalHi: '#d6dbe0',
    frame: '#2a2723', led: '#ffe6a6', ledOff: '#6b2a26'
  };
  const ORDER = ['food', 'sleep', 'play', 'talk', 'care', 'heal', 'thermo', 'decor'];
  SP.ORDER = ORDER;
  const ICON_POS = [[20, 31], [41, 31], [62, 31], [83, 31], [20, 101], [41, 101], [62, 101], [83, 101]];
  const BTN = { A: [34, 134], B: [56, 139], C: [78, 134] };

  const device = SP.device = {
    cursor: 0, next: 0, done: {}, pressedAt: {}, iconsOn: false, attention: true, led: false
  };

  function eggHW(y) {
    const top = 12, bot = 158, H = bot - top;
    const t = (y + 0.5 - top) / H;
    if (t < 0 || t > 1) return -1;
    const u = 2 * t - 1;
    const base = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.6)), 1 / 2.6);
    return Math.min(55, 54 * base * (1 + 0.08 * u));
  }

  let staticShell = null;
  function buildStaticShell() {
    const c = document.createElement('canvas'); c.width = DEV_W; c.height = DEV_H;
    const g = c.getContext('2d');
    const P = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    const inside = (x, y) => { const hw = eggHW(y); return hw > 0 && Math.abs(x + 0.5 - 56) <= hw; };

    // keychain lug + ring (drawn first so the shell overlaps the lug)
    for (let a = 0; a < 64; a++) {
      const ang = a / 64 * Math.PI * 2;
      const x = Math.round(90 + Math.cos(ang) * 5), y = Math.round(10 + Math.sin(ang) * 5);
      P(x, y, ang > Math.PI * 1.1 && ang < Math.PI * 1.8 ? SHELL.metalHi : SHELL.metal);
      P(Math.round(90 + Math.cos(ang) * 4), Math.round(10 + Math.sin(ang) * 4), SHELL.metalDark);
    }
    // egg body
    for (let y = 0; y < DEV_H; y++) {
      const hw = eggHW(y); if (hw <= 0) continue;
      const t = (y + 0.5 - 12) / 146, u = 2 * t - 1;
      for (let x = 0; x < DEV_W; x++) {
        if (!inside(x, y)) continue;
        const nx = (x + 0.5 - 56) / hw;
        let col = SHELL.mid;
        if (nx > 0.8 || u > 0.92) col = SHELL.dark;
        else if ((nx > 0.66 || u > 0.84) && (x + y) % 2 === 0) col = SHELL.dark;
        else if (nx < -0.66 && u < 0.45 && u > -0.85) col = SHELL.light;
        else if (nx < -0.52 && u < 0.3 && u > -0.8 && (x + y) % 2 === 0) col = SHELL.light;
        if (Math.abs(nx + 0.8) < 0.05 && u > -0.62 && u < 0.05) col = SHELL.hi;
        if (u < -0.82 && Math.abs(nx) < 0.5 && (x + y) % 2 === 0) col = SHELL.light;
        P(x, y, col);
      }
    }
    // outline
    for (let y = 0; y < DEV_H; y++) for (let x = 0; x < DEV_W; x++) {
      if (!inside(x, y)) continue;
      if (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1)) P(x, y, SHELL.out);
    }
    // lug connecting ring and shell
    for (let y = 13; y <= 19; y++) for (let x = 84; x <= 88; x++) if (!inside(x, y) && (x + y) % 1 === 0) P(x, y, (x === 84 || x === 88 || y === 13) ? SHELL.out : SHELL.dark);

    // brand: SEA PUPPIES (embossed bone letters)
    const brand = 'SEA PUPPIES';
    let w = 0; for (const ch of brand) w += (ch === ' ' ? 2 : 4); w -= 1;
    let bx = Math.round(56 - w / 2);
    for (const ch of brand) {
      if (ch === ' ') { bx += 2; continue; }
      const gl = LETTERS[ch];
      for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (gl[j][i] !== '.') { P(bx + i + 1, 18 + j + 1, SHELL.dark); P(bx + i, 18 + j, SHELL.bone); }
      bx += 4;
    }

    // bezel with wavy (sea) edges
    const top = (x) => 27 + Math.round(1.2 * Math.sin((x - 14) * Math.PI * 2 / 14));
    const bot = (x) => 121 + Math.round(1.2 * Math.sin((x - 14) * Math.PI * 2 / 14 + Math.PI));
    const corner = (x) => { const d = Math.min(x - 14, 97 - x); return d < 4 ? Math.round((4 - d) * (4 - d) / 3) : 0; };
    for (let x = 14; x <= 97; x++) {
      const t0 = top(x) + corner(x), b0 = bot(x) - corner(x);
      for (let y = t0; y <= b0; y++) {
        let col = SHELL.bone;
        if (y === t0 || y === b0 || x === 14 || x === 97) col = SHELL.boneEdge;
        else if (y === t0 + 1 || x === 15) col = SHELL.boneShade;
        P(x, y, col);
      }
    }
    // LCD frame
    g.fillStyle = SHELL.frame; g.fillRect(22, 44, 68, 52);
    g.fillStyle = '#47423b'; g.fillRect(22, 95, 68, 1); g.fillRect(89, 44, 1, 52);
    g.fillStyle = LCD_OFF; g.fillRect(24, 46, 64, 48);

    // button wells
    for (const k in BTN) {
      const [cx, cy] = BTN[k];
      for (let y = -9; y <= 9; y++) for (let x = -9; x <= 9; x++) {
        const d = Math.sqrt(x * x + y * y);
        if (d <= 9 && d > 8) P(cx + x, cy + y, SHELL.dark);
      }
      const gl = LETTERS[k];
      const ly = cy + 11;
      for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (gl[j][i] !== '.') { P(cx - 1 + i + 1, ly + j + 1, SHELL.dark); P(cx - 1 + i, ly + j, SHELL.bone); }
    }
    // speaker holes
    for (let i = 0; i < 4; i++) { P(50 + i * 4, 153, SHELL.out); P(50 + i * 4, 154, SHELL.dark); }
    staticShell = c;
  }

  function drawButton(cx, cy, pressed) {
    const dy = pressed ? 1 : 0;
    for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (d > 7.3) continue;
      let col = pressed ? SHELL.btn : SHELL.btnMid;
      if (d > 6.3) col = SHELL.out;
      else if (!pressed && x + y < -4 && d > 3.5) col = SHELL.btnHi;
      else if (x + y > 5) col = SHELL.btn;
      S.fillStyle = col; S.fillRect(cx + x, cy + y + dy, 1, 1);
    }
  }

  function drawIcon(name, x, y, col) {
    const rows = SP.EXTRA['i_' + name];
    S.fillStyle = col;
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) if (rows[j][i] !== '.') S.fillRect(x + i, y + j, 1, 1);
  }

  function renderShell(now) {
    if (!staticShell) buildStaticShell();
    S.clearRect(0, 0, DEV_W, DEV_H);
    S.drawImage(staticShell, 0, 0);
    // power button (pill on top)
    const pp = now - (device.pressedAt.POWER || -1e9) < 140;
    S.fillStyle = SHELL.out; S.fillRect(49, 7 + (pp ? 1 : 0), 14, 6);
    S.fillStyle = pp ? SHELL.btn : SHELL.btnMid; S.fillRect(50, 8 + (pp ? 1 : 0), 12, 4);
    if (!pp) { S.fillStyle = SHELL.btnHi; S.fillRect(51, 8, 6, 1); }
    // status LED next to the brand
    S.fillStyle = device.led ? SHELL.led : SHELL.ledOff; S.fillRect(82, 19, 2, 2);
    // icons
    const blink = Math.floor(now / 420) % 2 === 0;
    ORDER.forEach((name, i) => {
      const [x, y] = ICON_POS[i];
      let col = SHELL.ghost;
      if (device.iconsOn) {
        if (device.done[name]) col = SHELL.doneIcon;
        if (i === device.next && device.attention && blink) col = SHELL.icon;
        if (i === device.cursor) col = SHELL.icon;
      }
      if (device.iconsOn && i === device.cursor) { S.fillStyle = SHELL.icon; S.fillRect(x - 1, y + 10, 11, 1); }
      drawIcon(name, x, y, col);
      if (device.iconsOn && device.done[name]) { S.fillStyle = SHELL.icon; S.fillRect(x + 4, y - 3, 1, 1); }
    });
    // buttons
    for (const k in BTN) drawButton(BTN[k][0], BTN[k][1], now - (device.pressedAt[k] || -1e9) < 120);
  }

  // ------------------------------------------------------------------ layout & zoom
  const devEl = document.getElementById('device');
  let devScale = 1;
  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const fit = Math.min((vw * 0.96) / DEV_W, (vh * 0.93) / DEV_H);
    devScale = fit;
    devEl.style.width = Math.round(DEV_W * fit) + 'px';
    devEl.style.height = Math.round(DEV_H * fit) + 'px';
    const lcdPx = 64 * fit;
    document.documentElement.style.setProperty('--fs', SP.clamp(Math.round(lcdPx / 21), 13, 19) + 'px');
    if (hintState) ui.hint(hintState.target, hintState.key);
    applyZoom(true);
  }
  function applyZoom(instant) {
    const offScale = window.innerWidth < 600 ? 0.72 : 0.6;
    const off = document.body.classList.contains('is-off');
    if (instant) { devEl.style.transition = 'none'; requestAnimationFrame(() => { devEl.style.transition = ''; }); }
    devEl.style.transform = off ? `translateY(14%) scale(${offScale})` : 'none';
  }
  SP.zoom = function (on) {
    document.body.classList.toggle('is-off', !on);
    document.body.classList.toggle('is-on', on);
    applyZoom(SP.reduced);
  };
  window.addEventListener('resize', layout);

  // ------------------------------------------------------------------ input
  const input = SP.input = {
    waiters: [],
    handler: null,
    enabled: true,
    press(btn) {
      if (!this.enabled) return;
      SP.audio.ensure();
      device.pressedAt[btn] = performance.now();
      if (btn !== 'POWER') SP.audio.play('beep');
      const w = this.waiters.find(w => w.btns.indexOf(btn) >= 0);
      if (w) { this.waiters = this.waiters.filter(x => x !== w); w.resolve(btn); return; }
      if (this.handler) this.handler(btn);
    },
    wait(btns) {
      let w;
      const p = new Promise(resolve => { w = { btns, resolve }; this.waiters.push(w); });
      p.cancel = () => { this.waiters = this.waiters.filter(x => x !== w); };
      return p;
    },
    clear() { this.waiters = []; this.handler = null; }
  };
  const BTN_EL = { A: 'btnA', B: 'btnB', C: 'btnC', POWER: 'btnPower' };
  for (const k in BTN_EL) {
    const el = document.getElementById(BTN_EL[k]);
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); input.press(k); });
    el.addEventListener('click', (e) => { if (e.detail === 0) input.press(k); }); // keyboard activation
  }
  document.addEventListener('keydown', (e) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (!document.getElementById('bonus').hidden) return;
    if (document.body.classList.contains('is-credits')) return;
    const tgt = e.target;
    if (tgt && tgt.classList && tgt.classList.contains('hw') && (e.key === 'Enter' || e.key === ' ')) return; // handled by click
    if (tgt && tgt.closest && tgt.closest('.corner')) return;
    const k = e.key;
    let b = null;
    if (k === 'a' || k === 'A' || k === 'ArrowLeft' || k === 'ф' || k === 'Ф') b = 'A';
    else if (k === ' ' || k === 'Enter' || k === 'b' || k === 'B' || k === 'ArrowDown' || k === 'и' || k === 'И') b = 'B';
    else if (k === 'c' || k === 'C' || k === 'ArrowRight' || k === 'Escape' || k === 'с' || k === 'С') b = 'C';
    else if (k === 'p' || k === 'P' || k === 'з' || k === 'З') b = 'POWER';
    if (b) { e.preventDefault(); input.press(b); }
  });

  // ------------------------------------------------------------------ dialog box
  const tb = document.getElementById('textbox');
  const tbBody = document.getElementById('tbBody');
  const tbMore = document.getElementById('tbMore');
  const sr = document.getElementById('sr');
  let current = null;       // {key, vars, puppy}
  let typing = null;

  function pageHTML(p) {
    if (p.puppy != null) {
      const v = p.puppy ? SP.t('puppy.yes') : SP.t('puppy.no');
      return `<div class="puppy-head"><img alt="" src="${SP.spriteURL('dog', 4)}"><span>${SP.t('puppy.head')}</span><span class="verdict ${p.puppy ? 'yes' : 'no'}">${v}</span></div><p>${SP.t(p.key, p.vars)}</p>`;
    }
    return `<p>${SP.t(p.key, p.vars)}</p>`;
  }
  function plain(html) { const d = document.createElement('div'); d.innerHTML = html; return d.textContent; }

  const ui = SP.ui = {
    show(p, opts) {
      opts = opts || {};
      p = typeof p === 'string' ? { key: p } : p;
      current = p;
      tb.hidden = false;
      const html = pageHTML(p);
      sr.textContent = plain(html);
      tbMore.classList.toggle('done', !!opts.noMore);
      if (typing) { clearInterval(typing.iv); typing = null; }
      if (SP.reduced || SP.fast || opts.instant) { tbBody.innerHTML = html; return Promise.resolve(); }
      // type out the text (head stays, paragraph types)
      const tmp = document.createElement('div'); tmp.innerHTML = html;
      const para = tmp.querySelector('p');
      const full = para.textContent;
      para.textContent = '';
      tbBody.innerHTML = tmp.innerHTML;
      const target = tbBody.querySelector('p');
      let i = 0;
      return new Promise(res => {
        const done = () => { if (typing) { clearInterval(typing.iv); typing = null; } tbBody.innerHTML = pageHTML(current || p); res(); };
        typing = { done, iv: setInterval(() => { i += 2; target.textContent = full.slice(0, i); if (i >= full.length) done(); }, 26) };
      });
    },
    hide() { tb.hidden = true; current = null; if (typing) { clearInterval(typing.iv); typing = null; } },
    refresh() { if (current && !tb.hidden) { tbBody.innerHTML = pageHTML(current); sr.textContent = plain(tbBody.innerHTML); } },
    // show pages; B = next, C = back. resolves after the last page.
    async say(pages, opts) {
      opts = opts || {};
      let i = 0;
      while (i < pages.length) {
        const last = i === pages.length - 1;
        const typed = this.show(pages[i], { noMore: last && opts.noMoreOnLast });
        if (typing) {
          // while typing, B finishes the line instead of advancing
          const w = input.wait(['B']);
          const r = await Promise.race([typed.then(() => 'typed'), w.then(() => 'skip')]);
          if (r === 'skip') { if (typing) typing.done(); } else w.cancel();
        }
        const b = await input.wait(['B', 'C']);
        if (b === 'C' && i > 0) { i--; continue; }
        if (b === 'C') continue;
        i++;
      }
      if (!opts.keep) this.hide();
    },
    // a caption that stays until replaced; resolves when typing finished
    caption(p) { return this.show(p, { noMore: true }); },
    announce(text) { sr.textContent = text; }
  };

  // hint arrow
  const hintEl = document.getElementById('hint');
  const HINT_POS = { A: [34, 143, 'up'], B: [56, 148, 'up'], C: [78, 143, 'up'], POWER: [47, 10, 'right'] };
  let hintState = null;
  ui.hint = function (target, key) {
    hintState = target ? { target, key } : null;
    if (!target) { hintEl.hidden = true; return; }
    let [x, y, dir] = HINT_POS[target];
    if (target === 'POWER' && window.innerWidth < 700) { x = 56; y = 3; dir = 'down'; }
    hintEl.className = 'dir-' + dir;
    hintEl.style.left = (x / DEV_W * 100) + '%';
    hintEl.style.top = (y / DEV_H * 100) + '%';
    hintEl.querySelector('.hint-label').textContent = SP.t(key || 'ui.ok');
    hintEl.hidden = false;
  };

  SP.onLang = function () {
    ui.refresh();
    if (hintState) ui.hint(hintState.target, hintState.key);
    if (SP.onLangExtra) SP.onLangExtra();
  };

  // ------------------------------------------------------------------ corner controls
  document.getElementById('langBtn').addEventListener('click', () => SP.setLang(SP.lang === 'en' ? 'ru' : 'en'));
  const soundBtn = document.getElementById('soundBtn');
  function syncSound() { soundBtn.setAttribute('aria-pressed', SP.audio.muted ? 'false' : 'true'); soundBtn.setAttribute('aria-label', SP.t('ui.sound')); }
  soundBtn.addEventListener('click', () => { SP.audio.setMuted(!SP.audio.muted); syncSound(); });
  syncSound();

  // ------------------------------------------------------------------ the night sea behind everything
  const sky = document.getElementById('sky');
  const K = sky.getContext('2d');
  let drops = [];
  function sizeSky() {
    const px = 4;
    sky.width = Math.ceil(window.innerWidth / px); sky.height = Math.ceil(window.innerHeight / px);
    drops = Array.from({ length: Math.round(sky.width * sky.height / 900) }, () => ({ x: Math.random() * sky.width, y: Math.random() * sky.height, v: 18 + Math.random() * 22, l: 2 + Math.floor(Math.random() * 3) }));
  }
  function renderSky(now) {
    const W = sky.width, H = sky.height;
    K.fillStyle = '#141838'; K.fillRect(0, 0, W, H);
    // wave lines across the whole night sea; rows get denser and darker towards the bottom
    const rows = Math.ceil(H / 6);
    for (let r = 0; r < rows; r++) {
      const y0 = 4 + r * 6;
      const deep = y0 / H;
      K.fillStyle = deep < 0.55 ? '#232a63' : '#1d2358';
      const off = (now / (700 + r * 37) * (r % 2 ? 1 : -1) + r * 13);
      const dash = deep < 0.55 ? 16 : 10;
      for (let x = 0; x < W; x++) {
        if (((x + Math.floor(off)) % 24) >= dash) continue;
        const y = y0 + Math.round(Math.sin((x + off) / 6) * 1.2);
        K.fillRect(x, y, 1, 1);
      }
    }
    // rain
    if (!reduced) {
      K.fillStyle = '#4b52a3';
      const dt = 1 / 30;
      for (const d of drops) {
        d.y += d.v * dt; if (d.y > H) { d.y = -4; d.x = Math.random() * W; }
        K.fillRect(Math.floor(d.x), Math.floor(d.y), 1, d.l);
      }
    }
  }
  window.addEventListener('resize', sizeSky);

  // ------------------------------------------------------------------ main loop (LCD at 12 fps)
  let lastFrame = -1, lastSky = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    const f = Math.floor(now / 83);
    if (f !== lastFrame) { lastFrame = f; renderLCD(now); renderShell(now); }
    if (now - lastSky > 33 && !document.body.classList.contains('is-credits')) { lastSky = now; renderSky(now); }
  }

  SP.boot = function () {
    SP.applyI18n();
    layout(); sizeSky();
    requestAnimationFrame(loop);
  };
})();
