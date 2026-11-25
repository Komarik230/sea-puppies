/* æ-æ-æ-tchi — engine: palette, sprites, LCD drawing, device shell, input, render loop. */
(function () {
  'use strict';
  const SP = window.SP;

  const DEV_W = 128, DEV_H = 160;     // device shell, in "device units"
  const L_W = 128, L_H = 96;          // LCD resolution
  SP.L_W = L_W; SP.L_H = L_H;
  SP.DEV = { W: DEV_W, H: DEV_H, LCD: [24, 46, 80, 60] };

  const PAL = { day: { '0': '#a7b394', '1': '#879474', '2': '#5b664f', '3': '#212a1e', 'o': '#ff7a1a' } };
  const LCD_OFF = '#8b9780';
  SP.PAL = PAL;

  SP.qs = new URLSearchParams(location.search);
  SP.reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  SP.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  SP.lerp = (a, b, t) => a + (b - a) * t;
  SP.ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  SP.easeOut = t => 1 - Math.pow(1 - t, 3);
  SP.ramp = (t, start, dur) => SP.clamp((t - start) / dur, 0, 1);
  // deterministic pseudo-random in [0,1) for a seed
  SP.rnd = seed => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // ------------------------------------------------------------------ sprites
  const cache = {};
  SP.EXTRA = {};
  function rowsOf(name) { return SP.SPRITES[name] || SP.EXTRA[name]; }
  function sprite(name, flip) {
    const key = name + '|' + (flip ? 1 : 0);
    if (cache[key]) return cache[key];
    const rows = rowsOf(name);
    if (!rows) { console.warn('missing sprite', name); return null; }
    const h = rows.length, w = Math.max.apply(null, rows.map(r => r.length));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    for (let y = 0; y < h; y++) for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x];
      if (ch === '.' || ch === ' ') continue;
      g.fillStyle = PAL.day[ch] || PAL.day['3'];
      g.fillRect(flip ? w - 1 - x : x, y, 1, 1);
    }
    return (cache[key] = c);
  }
  SP.spriteSize = name => { const r = rowsOf(name); return r ? { w: Math.max.apply(null, r.map(s => s.length)), h: r.length } : { w: 0, h: 0 }; };
  // sprite as an <img>-ready data URL in any colors (used for panel icons)
  SP.spriteURL = function (name, scale, color) {
    const rows = rowsOf(name);
    const w = Math.max.apply(null, rows.map(r => r.length)), h = rows.length;
    const c = document.createElement('canvas'); c.width = w * scale; c.height = h * scale;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { if (r[x] === '.') continue; g.fillStyle = color || PAL.day[r[x]] || PAL.day['3']; g.fillRect(x * scale, y * scale, scale, scale); } });
    return c.toDataURL();
  };

  // need icons (9×9), shared by the shell and the side panel
  Object.assign(SP.EXTRA, {
    i_food:  ['.........', '....33...', '3..3333..', '33333.333', '333333333', '3..3333..', '....33...', '.........', '.........'],
    i_sleep: ['...333...', '..33.....', '.33......', '.33......', '.33......', '.333...3.', '..33333..', '...333...', '.........'],
    i_play:  ['....3333.', '....3..3.', '....3..3.', '....3..3.', '....3..3.', '.333.333.', '3333333..', '.33..33..', '.........'],
    i_talk:  ['.........', '.3333333.', '3.......3', '3.33.33.3', '3.......3', '.333333..', '...3.....', '..3......', '.........'],
    i_care:  ['....3....', '...333...', '...333...', '..33333..', '.333.333.', '.33...33.', '.333.333.', '..33333..', '...333...'],
    i_heal:  ['...333...', '...333...', '333333333', '333333333', '333333333', '...333...', '...333...', '.........', '.........'],
    i_heat:  ['....3....', '...3.3...', '...333...', '...3.3...', '...333...', '...333...', '..33333..', '..33333..', '...333...'],
    i_tags:  ['.........', '.33333333', '3.......3', '3.33....3', '3.33....3', '3.......3', '.33333333', '.........', '.........'],
    thought: ['....33333333333....', '..333.........333..', '.33.............33.', '3.................3', '3.................3', '3.................3', '3.................3', '3.................3', '3.................3', '3.................3', '.33.............33.', '..333.........333..', '....33333333333....', '...33..............', '.33................', '33.................']
  });

  // ------------------------------------------------------------------ pixel font
  const LETTERS = {
    A: ['333', '3.3', '333', '3.3', '3.3'], B: ['33.', '3.3', '33.', '3.3', '33.'], C: ['333', '3..', '3..', '3..', '333'],
    D: ['33.', '3.3', '3.3', '3.3', '33.'], E: ['333', '3..', '33.', '3..', '333'], F: ['333', '3..', '33.', '3..', '3..'],
    G: ['333', '3..', '3.3', '3.3', '333'], H: ['3.3', '3.3', '333', '3.3', '3.3'], I: ['333', '.3.', '.3.', '.3.', '333'],
    J: ['..3', '..3', '..3', '3.3', '333'], K: ['3.3', '3.3', '33.', '3.3', '3.3'], L: ['3..', '3..', '3..', '3..', '333'],
    M: ['3.3', '333', '333', '3.3', '3.3'], N: ['3..3', '33.3', '3.33', '3..3', '3..3'], O: ['333', '3.3', '3.3', '3.3', '333'],
    P: ['333', '3.3', '333', '3..', '3..'], Q: ['333', '3.3', '3.3', '333', '..3'], R: ['333', '3.3', '33.', '3.3', '3.3'],
    S: ['333', '3..', '333', '..3', '333'], T: ['333', '.3.', '.3.', '.3.', '.3.'], U: ['3.3', '3.3', '3.3', '3.3', '333'],
    V: ['3.3', '3.3', '3.3', '3.3', '.3.'], W: ['3.3', '3.3', '333', '333', '3.3'], X: ['3.3', '3.3', '.3.', '3.3', '3.3'],
    Y: ['3.3', '3.3', '.3.', '.3.', '.3.'], Z: ['333', '..3', '.3.', '3..', '333'],
    '<': ['..3', '.3.', '3..', '.3.', '..3'], '>': ['3..', '.3.', '..3', '.3.', '3..'], '*': ['...', '3.3', '.3.', '3.3', '...'],
    '(': ['.3', '3.', '3.', '3.', '.3'], ')': ['3.', '.3', '.3', '.3', '3.'], "'": ['3', '3', '.', '.', '.']
  };
  // lowercase glyphs for the logo only
  const BRAND = {
    t: ['.3.', '333', '.3.', '.3.', '.33'], c: ['...', '333', '3..', '3..', '333'],
    h: ['3..', '3..', '333', '3.3', '3.3'], i: ['.3.', '...', '.3.', '.3.', '.3.']
  };
  function glyph(ch, brand) {
    if (brand && BRAND[ch]) return BRAND[ch];
    return SP.FONT_WIDE[ch] || SP.FONT[ch] || LETTERS[ch.toUpperCase()] || null;
  }
  SP.glyph = glyph;

  // ------------------------------------------------------------------ LCD drawing API
  const lcdCanvas = document.getElementById('lcd');
  const L = lcdCanvas.getContext('2d');
  L.imageSmoothingEnabled = false;
  const C = t => PAL.day[t] || t;

  const lcd = SP.lcd = {
    on: false,
    ctx: L,
    clear(t) { L.fillStyle = C(t || '0'); L.fillRect(0, 0, L_W, L_H); },
    spr(name, x, y, o) {
      o = o || {};
      const c = sprite(name, o.flip);
      if (c) L.drawImage(c, Math.round(x), Math.round(y));
    },
    px(x, y, t) { L.fillStyle = C(t || '3'); L.fillRect(Math.round(x), Math.round(y), 1, 1); },
    rect(x, y, w, h, t) { if (w <= 0 || h <= 0) return; L.fillStyle = C(t || '3'); L.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
    frame(x, y, w, h, t) { this.rect(x, y, w, 1, t); this.rect(x, y + h - 1, w, 1, t); this.rect(x, y, 1, h, t); this.rect(x + w - 1, y, 1, h, t); },
    line(x0, y0, x1, y1, t, dash) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy, n = 0;
      L.fillStyle = C(t || '3');
      for (;;) {
        if (!dash || (n % dash) < Math.ceil(dash / 2)) L.fillRect(x0, y0, 1, 1);
        n++;
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    },
    dither(x, y, w, h, t, step) {
      step = step || 2; L.fillStyle = C(t || '1');
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (((i + j) % step) === 0 && (j % (step > 2 ? 2 : 1)) === 0) L.fillRect(x + i, y + j, 1, 1);
    },
    disc(cx, cy, r, t) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) this.px(cx + x, cy + y, t); },
    text(str, x, y, t, scale, brand) {
      scale = scale || 1;
      L.fillStyle = C(t || '3');
      let cx = Math.round(x);
      for (const ch of String(str)) {
        if (ch === ' ') { cx += 3 * scale; continue; }
        const g = glyph(ch, brand);
        if (!g) { cx += 4 * scale; continue; }
        for (let j = 0; j < g.length; j++) for (let i = 0; i < g[j].length; i++) if (g[j][i] !== '.') L.fillRect(cx + i * scale, Math.round(y) + j * scale, scale, scale);
        cx += (g[0].length + 1) * scale;
      }
      return cx - x;
    },
    textW(str, scale, brand) {
      scale = scale || 1; let w = 0;
      for (const ch of String(str)) { if (ch === ' ') { w += 3 * scale; continue; } const g = glyph(ch, brand); w += ((g ? g[0].length : 3) + 1) * scale; }
      return Math.max(0, w - scale);
    },
    textC(str, cx, y, t, scale, brand) { return this.text(str, Math.round(cx - this.textW(str, scale, brand) / 2), y, t, scale, brand); },
    textR(str, rx, y, t, scale) { return this.text(str, rx - this.textW(str, scale), y, t, scale); },
    bubble(x, y, w, h, tail) {
      this.rect(x + 1, y, w - 2, h, '0'); this.rect(x, y + 1, w, h - 2, '0');
      this.rect(x + 2, y, w - 4, 1); this.rect(x + 2, y + h - 1, w - 4, 1);
      this.rect(x, y + 2, 1, h - 4); this.rect(x + w - 1, y + 2, 1, h - 4);
      this.px(x + 1, y + 1); this.px(x + w - 2, y + 1); this.px(x + 1, y + h - 2); this.px(x + w - 2, y + h - 2);
      if (tail === 'l') { this.rect(x + 3, y + h - 1, 3, 1, '0'); this.px(x + 3, y + h); this.px(x + 2, y + h + 1); this.px(x + 4, y + h); this.px(x + 5, y + h - 1); }
      if (tail === 'r') { this.rect(x + w - 6, y + h - 1, 3, 1, '0'); this.px(x + w - 4, y + h); this.px(x + w - 3, y + h + 1); this.px(x + w - 5, y + h); this.px(x + w - 6, y + h - 1); }
    }
  };

  // ------------------------------------------------------------------ scenes (pure functions of time)
  // SP.SCENES[key] = () => (t, now) => { draw }   — a factory, so each visit starts fresh
  SP.SCENES = {};
  let scene = null, sceneT0 = 0;
  SP.setScene = function (key) {
    const f = SP.SCENES[key];
    scene = f ? f() : null;
    sceneT0 = performance.now();
  };
  SP.sceneTime = () => performance.now() - sceneT0;

  function renderLCD(now) {
    if (!lcd.on) { L.fillStyle = LCD_OFF; L.fillRect(0, 0, L_W, L_H); return; }
    lcd.clear();
    if (scene) {
      let t = Math.max(0, now - sceneT0);
      if (SP.reduced && scene.still != null) t = scene.still;
      try { scene(t, now); } catch (e) { console.error(e); scene = null; }
    }
  }

  // ------------------------------------------------------------------ device shell
  const shellCanvas = document.getElementById('shell');
  const S = shellCanvas.getContext('2d');
  const SHELL = {
    out: '#1c0f10', dark: '#5c1f21', mid: '#8e352f', light: '#b5513e', hi: '#d9805f',
    bone: '#e8dec5', boneShade: '#cbbf9f', boneEdge: '#a39577',
    icon: '#2a2420', ghost: '#d3c9ad', doneIcon: '#8c8168',
    btn: '#4d1a1d', btnMid: '#6f2629', btnHi: '#a8473f',
    metal: '#9aa0a8', metalDark: '#5c626b', metalHi: '#d6dbe0',
    frame: '#2a2723', orange: '#ff7a1a'
  };
  const ORDER = SP.ORDER = ['food', 'sleep', 'play', 'talk', 'care', 'heal', 'heat', 'tags'];
  const ICON_POS = [[28, 33], [49, 33], [70, 33], [91, 33], [28, 111], [49, 111], [70, 111], [91, 111]];
  const BTN = SP.BTN = { L: [40, 139], M: [64, 143], R: [88, 139] };
  const BTN_GLYPH = {
    L: ['...3.', '..33.', '.333.', '..33.', '...3.'],
    M: ['.333.', '33333', '33333', '33333', '.333.'],
    R: ['.3...', '.33..', '.333.', '.33..', '.3...']
  };

  const device = SP.device = { cursor: -1, done: {}, pressedAt: {}, glow: -1, sweep: false };

  function eggHW(y) {
    const top = 5, bot = 158, t = (y + 0.5 - top) / (bot - top);
    if (t < 0 || t > 1) return -1;
    const u = 2 * t - 1;
    const base = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.6)), 1 / 2.6);
    return Math.min(63, 62 * base * (1 + 0.08 * u));
  }

  let staticShell = null;
  function buildStaticShell() {
    const c = document.createElement('canvas'); c.width = DEV_W; c.height = DEV_H;
    const g = c.getContext('2d');
    const P = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    const inside = (x, y) => { const hw = eggHW(y); return hw > 0 && Math.abs(x + 0.5 - 64) <= hw; };

    // key ring and lug
    for (let a = 0; a < 72; a++) {
      const ang = a / 72 * Math.PI * 2;
      P(Math.round(105 + Math.cos(ang) * 5), Math.round(11 + Math.sin(ang) * 5), ang > Math.PI * 1.1 && ang < Math.PI * 1.8 ? SHELL.metalHi : SHELL.metal);
      P(Math.round(105 + Math.cos(ang) * 4), Math.round(11 + Math.sin(ang) * 4), SHELL.metalDark);
    }
    for (let y = 13; y <= 19; y++) for (let x = 96; x <= 101; x++) if (!inside(x, y)) P(x, y, (x === 96 || x === 101 || y === 13) ? SHELL.out : SHELL.dark);

    // egg body with soft pixel shading
    for (let y = 0; y < DEV_H; y++) {
      const hw = eggHW(y); if (hw <= 0) continue;
      const u = 2 * ((y + 0.5 - 5) / 153) - 1;
      for (let x = 0; x < DEV_W; x++) {
        if (!inside(x, y)) continue;
        const nx = (x + 0.5 - 64) / hw;
        let col = SHELL.mid;
        if (nx > 0.82 || u > 0.92) col = SHELL.dark;
        else if ((nx > 0.68 || u > 0.84) && (x + y) % 2 === 0) col = SHELL.dark;
        else if (nx < -0.68 && u < 0.45 && u > -0.85) col = SHELL.light;
        else if (nx < -0.54 && u < 0.3 && u > -0.8 && (x + y) % 2 === 0) col = SHELL.light;
        if (Math.abs(nx + 0.82) < 0.04 && u > -0.62 && u < 0.05) col = SHELL.hi;
        if (u < -0.84 && Math.abs(nx) < 0.5 && (x + y) % 2 === 0) col = SHELL.light;
        P(x, y, col);
      }
    }
    for (let y = 0; y < DEV_H; y++) for (let x = 0; x < DEV_W; x++) {
      if (inside(x, y) && (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1))) P(x, y, SHELL.out);
    }

    // logo: æ-æ-æ-tchi, embossed
    const logo = 'æ-æ-æ-tchi';
    let w = 0; for (const ch of logo) { const gl = glyph(ch, true); w += gl[0].length + 1; } w -= 1;
    let bx = Math.round(64 - w / 2);
    for (const ch of logo) {
      const gl = glyph(ch, true);
      for (let j = 0; j < 5; j++) for (let i = 0; i < gl[j].length; i++) if (gl[j][i] !== '.') { P(bx + i + 1, 19 + j + 1, SHELL.dark); P(bx + i, 19 + j, SHELL.bone); }
      bx += gl[0].length + 1;
    }

    // bone bezel with wavy edges and rounded corners
    const X0 = 15, X1 = 112, Y0 = 29, Y1 = 123, R = 9;
    const waveT = x => Math.round(1.1 * Math.sin((x - X0) * Math.PI * 2 / 16));
    for (let x = X0; x <= X1; x++) {
      const d = Math.min(x - X0, X1 - x);
      const cut = d < R ? Math.round(R - Math.sqrt(R * R - (R - d) * (R - d))) : 0;
      const t0 = Y0 + cut + (d >= R ? waveT(x) : 0), b0 = Y1 - cut - (d >= R ? waveT(x) : 0);
      for (let y = t0; y <= b0; y++) {
        let col = SHELL.bone;
        if (y === t0 || y === b0 || x === X0 || x === X1) col = SHELL.boneEdge;
        else if (y === t0 + 1 || x === X0 + 1) col = SHELL.boneShade;
        P(x, y, col);
      }
    }
    // LCD frame
    const [lx, ly, lw, lh] = SP.DEV.LCD;
    g.fillStyle = SHELL.frame; g.fillRect(lx - 2, ly - 2, lw + 4, lh + 4);
    g.fillStyle = '#47423b'; g.fillRect(lx - 2, ly + lh + 1, lw + 4, 1); g.fillRect(lx + lw + 1, ly - 2, 1, lh + 4);
    g.fillStyle = LCD_OFF; g.fillRect(lx, ly, lw, lh);

    // button wells
    for (const k in BTN) {
      const [cx, cy] = BTN[k];
      for (let y = -10; y <= 10; y++) for (let x = -10; x <= 10; x++) {
        const dd = Math.sqrt(x * x + y * y);
        if (dd <= 10 && dd > 9) P(cx + x, cy + y, SHELL.dark);
      }
    }
    // speaker holes
    for (let i = 0; i < 4; i++) { P(58 + i * 4, 154, SHELL.out); P(58 + i * 4, 155, SHELL.dark); }
    staticShell = c;
  }

  function drawButton(k, pressed) {
    const [cx, cy] = BTN[k];
    const dy = pressed ? 1 : 0;
    for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (d > 8.3) continue;
      let col = pressed ? SHELL.btn : SHELL.btnMid;
      if (d > 7.3) col = SHELL.out;
      else if (!pressed && x + y < -5 && d > 4) col = SHELL.btnHi;
      else if (x + y > 6) col = SHELL.btn;
      S.fillStyle = col; S.fillRect(cx + x, cy + y + dy, 1, 1);
    }
    const gl = BTN_GLYPH[k];
    for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) if (gl[j][i] !== '.') {
      S.fillStyle = SHELL.out; S.fillRect(cx - 2 + i, cy - 2 + j + dy + 1, 1, 1);
    }
    for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) if (gl[j][i] !== '.') {
      S.fillStyle = SHELL.bone; S.fillRect(cx - 2 + i, cy - 2 + j + dy, 1, 1);
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
    // power pill on top
    const pp = now - (device.pressedAt.POWER || -1e9) < 140;
    S.fillStyle = SHELL.out; S.fillRect(57, 1 + (pp ? 1 : 0), 14, 6);
    S.fillStyle = pp ? SHELL.btn : SHELL.btnMid; S.fillRect(58, 2 + (pp ? 1 : 0), 12, 4);
    if (!pp) { S.fillStyle = SHELL.btnHi; S.fillRect(59, 2, 6, 1); }
    // need icons around the screen
    const sweepI = device.sweep ? Math.floor(now / 260) % 10 : -1;
    ORDER.forEach((name, i) => {
      const [x, y] = ICON_POS[i];
      let col = SHELL.ghost;
      if (lcd.on) {
        if (device.done[name]) col = SHELL.doneIcon;
        if (i === sweepI || i === device.glow) col = SHELL.icon;
        if (i === device.cursor) col = SHELL.icon;
      }
      drawIcon(name, x, y, col);
      if (lcd.on && i === device.cursor) { S.fillStyle = SHELL.icon; S.fillRect(x - 1, y < 60 ? y + 10 : y - 2, 11, 1); }
      if (lcd.on && device.done[name]) { S.fillStyle = SHELL.orange; S.fillRect(x + 8, y - (y < 60 ? 1 : 0), 2, 2); }
    });
    for (const k in BTN) drawButton(k, now - (device.pressedAt[k] || -1e9) < 120);
  }

  // ------------------------------------------------------------------ input
  const input = SP.input = {
    handler: null,
    press(b) {
      device.pressedAt[b] = performance.now();
      if (SP.audio) SP.audio.play('beep');
      if (this.handler) this.handler(b);
    }
  };
  const KEYMAP = {
    ArrowLeft: 'L', a: 'L', A: 'L',
    ArrowRight: 'R', d: 'R', D: 'R',
    Enter: 'M', ' ': 'M', ArrowDown: 'M', s: 'M', S: 'M',
    p: 'POWER', P: 'POWER'
  };
  window.addEventListener('keydown', e => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); input.press('M'); }
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (tag === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return; // let focused buttons click
    if (tag === 'A' && e.key === 'Enter') return;
    const b = KEYMAP[e.key];
    if (!b) return;
    e.preventDefault();
    if (!e.repeat) input.press(b);
  });
  [['btnPower', 'POWER'], ['btnL', 'L'], ['btnM', 'M'], ['btnR', 'R']].forEach(([id, b]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('pointerdown', e => { e.preventDefault(); input.press(b); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); input.press(b); } });
  });

  // ------------------------------------------------------------------ loop
  let last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (now - last < 30) return;   // ~30 fps is plenty for a 128×96 LCD
    last = now;
    renderShell(now);
    renderLCD(now);
  }
  SP.startLoop = () => requestAnimationFrame(frame);
})();
