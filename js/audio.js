/* æ-æ-æ-tchi — every sound is synthesized: pager beeps, not animal recordings. */
window.SP = window.SP || {};

SP.audio = (function () {
  let ctx = null, master = null, noiseBuf = null;
  let muted = false;
  try { muted = localStorage.getItem('sp-mute') === '1'; } catch (e) { /* ignore */ }

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  function tone(freq, dur, opt) {
    if (!ensure()) return;
    opt = opt || {};
    const t = ctx.currentTime + (opt.delay || 0);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = opt.type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (opt.to) o.frequency.exponentialRampToValueAtTime(opt.to, t + dur);
    let node = o;
    if (opt.lp) {
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opt.lp;
      o.connect(f); node = f;
    }
    node.connect(g); g.connect(master);
    env(g, t, opt.a || 0.004, opt.vol || 0.18, dur);
    o.start(t); o.stop(t + dur + 0.05);
    return o;
  }

  function noise(dur, opt) {
    if (!ensure()) return;
    opt = opt || {};
    const t = ctx.currentTime + (opt.delay || 0);
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = opt.ftype || 'bandpass';
    f.frequency.setValueAtTime(opt.f || 1200, t);
    if (opt.fto) f.frequency.exponentialRampToValueAtTime(opt.fto, t + dur);
    f.Q.value = opt.q || 1;
    const g = ctx.createGain();
    s.connect(f); f.connect(g); g.connect(master);
    env(g, t, opt.a || 0.003, opt.vol || 0.2, dur);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }

  // a pitch contour (array of 0..1) played as a bending voice
  function contour(points, opt) {
    if (!ensure()) return;
    opt = opt || {};
    const t = ctx.currentTime + (opt.delay || 0);
    const dur = opt.dur || 0.9, lo = opt.lo || 500, hi = opt.hi || 1300;
    const o = ctx.createOscillator(); o.type = opt.type || 'sawtooth';
    const vib = ctx.createOscillator(); vib.frequency.value = opt.vib || 11;
    const vibG = ctx.createGain(); vibG.gain.value = opt.vibDepth || 18;
    vib.connect(vibG); vibG.connect(o.frequency);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opt.lp || 2400; f.Q.value = 3;
    const g = ctx.createGain();
    o.connect(f); f.connect(g); g.connect(master);
    const n = points.length;
    o.frequency.setValueAtTime(lo + (hi - lo) * points[0], t);
    for (let i = 1; i < n; i++) o.frequency.linearRampToValueAtTime(lo + (hi - lo) * points[i], t + dur * i / (n - 1));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opt.vol || 0.16, t + 0.05);
    g.gain.setValueAtTime(opt.vol || 0.16, t + dur - 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); vib.start(t); o.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
  }

  const sfx = {
    beep() { tone(2350, 0.03, { vol: 0.07 }); },
    powerOn() { tone(180, 0.35, { to: 1400, vol: 0.12 }); tone(1400, 0.08, { delay: 0.36, vol: 0.1 }); tone(1870, 0.12, { delay: 0.46, vol: 0.1 }); },
    powerOff() { tone(1400, 0.45, { to: 60, vol: 0.13 }); },
    bark(times) {
      times = times || 3;
      for (let i = 0; i < times; i++) {
        tone(560, 0.11, { to: 260, delay: i * 0.19, vol: 0.2, type: 'sawtooth', lp: 1700 });
        noise(0.08, { delay: i * 0.19, f: 900, vol: 0.12, q: 0.8 });
      }
    },
    bleat() { contour([0.4, 0.62, 0.7, 0.66, 0.58, 0.5, 0.42], { dur: 0.55, lo: 700, hi: 1300, type: 'triangle', vib: 13, vibDepth: 35, vol: 0.2 }); },
    trumpet(delay) { contour([0.2, 0.5, 0.8, 0.9, 0.75, 0.5, 0.3], { dur: 0.8, lo: 240, hi: 620, type: 'sawtooth', lp: 1300, vib: 7, vibDepth: 10, vol: 0.18, delay: delay || 0 }); },
    voice(points, delay) { contour(points, { dur: 0.85, lo: 620, hi: 1500, type: 'sawtooth', lp: 2600, vib: 12, vibDepth: 22, vol: 0.15, delay: delay || 0 }); },
    gulp() { tone(260, 0.12, { to: 90, type: 'sine', vol: 0.3 }); tone(200, 0.09, { to: 70, type: 'sine', vol: 0.22, delay: 0.14 }); },
    shake() { for (let i = 0; i < 3; i++) noise(0.07, { delay: i * 0.12, f: 2200, vol: 0.16 }); },
    splash() { noise(0.55, { f: 3000, fto: 300, ftype: 'lowpass', vol: 0.25, a: 0.01 }); },
    scratch() { for (let i = 0; i < 4; i++) noise(0.04, { delay: i * 0.09, f: 4200, q: 2, vol: 0.12 }); },
    snip() { noise(0.035, { f: 5200, q: 3, vol: 0.22 }); tone(3100, 0.03, { vol: 0.08, delay: 0.01 }); },
    pop() { tone(900, 0.06, { to: 1600, vol: 0.12 }); },
    jingle() { [1046, 1318, 1568, 2093].forEach((f, i) => tone(f, 0.09, { delay: i * 0.085, vol: 0.1 })); },
    sad() { tone(660, 0.16, { vol: 0.1 }); tone(520, 0.24, { delay: 0.17, vol: 0.1 }); },
    sniff() { noise(0.06, { f: 1800, vol: 0.12 }); noise(0.06, { delay: 0.12, f: 1900, vol: 0.12 }); },
    tick(accent) { tone(accent ? 1760 : 1320, 0.025, { type: 'sine', vol: accent ? 0.35 : 0.25 }); },
    snore() { noise(0.6, { f: 280, q: 4, vol: 0.06, a: 0.25 }); },
    wind() { noise(1.4, { f: 600, fto: 1400, q: 0.6, vol: 0.08, a: 0.4 }); },
    crowd(sec) {
      if (!ensure()) return;
      const n = Math.floor((sec || 2) * 16);
      for (let i = 0; i < n; i++) {
        const d = Math.random() * (sec || 2);
        tone(320 + Math.random() * 900, 0.07 + Math.random() * 0.08, { to: 200 + Math.random() * 300, delay: d, vol: 0.03 + Math.random() * 0.04, type: 'sawtooth', lp: 1500 });
      }
    },
    fill() { tone(220, 2.2, { to: 880, vol: 0.05, type: 'triangle' }); },
    error() { tone(140, 0.25, { vol: 0.12 }); tone(110, 0.3, { delay: 0.12, vol: 0.12 }); }
  };

  return {
    ensure,
    get ctx() { return ctx; },
    get muted() { return muted; },
    setMuted(m) {
      muted = m;
      try { localStorage.setItem('sp-mute', m ? '1' : '0'); } catch (e) { /* ignore */ }
      if (master) master.gain.value = m ? 0 : 0.5;
    },
    play(name, a, b) { try { if (sfx[name]) sfx[name](a, b); } catch (e) { /* audio is optional */ } },
    tone, noise
  };
})();
