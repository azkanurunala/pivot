// gen-audio.js — synthesize Pivot's sound effects + ambient music loop to WAV
// (16-bit PCM mono, 44.1 kHz). Zero external assets. Run: node scripts/gen-audio.js
// Soft, sine-based, low-volume tones to match the minimal glassmorphism aesthetic.

const fs = require('fs');
const path = require('path');

const SR = 44100;
const OUT = path.join(__dirname, '..', 'assets', 'audio');
fs.mkdirSync(OUT, { recursive: true });

function writeWav(name, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log(`  ${name}  ${(buf.length / 1024).toFixed(0)} KB`);
}

const sine = (f, t) => Math.sin(2 * Math.PI * f * t);
const env = (t, dur, atk = 0.005) => {
  if (t < atk) return t / atk;
  const r = (t - atk) / (dur - atk);
  return Math.max(0, Math.exp(-3.2 * r));
};
function buf(dur) { return new Float32Array(Math.ceil(SR * dur)); }

// ── tap — soft UI blip ───────────────────────────────────────────────
{
  const d = 0.06, b = buf(d);
  for (let i = 0; i < b.length; i++) { const t = i / SR; b[i] = sine(660, t) * env(t, d) * 0.28; }
  writeWav('tap.wav', b);
}

// ── launch — quick upward swoosh ─────────────────────────────────────
{
  const d = 0.2, b = buf(d);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR, k = t / d;
    const f = 300 + 520 * k;
    b[i] = (sine(f, t) * 0.6 + sine(f * 2.01, t) * 0.18) * env(t, d, 0.01) * 0.32;
  }
  writeWav('launch.wav', b);
}

// ── bounce — short soft thud ─────────────────────────────────────────
{
  const d = 0.09, b = buf(d);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = (sine(180, t) * 0.7 + sine(300, t) * 0.25) * Math.exp(-30 * t) * 0.4;
  }
  writeWav('bounce.wav', b);
}

// ── hit — bright bell ding (target collected) ────────────────────────
{
  const d = 0.4, b = buf(d);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = (sine(880, t) * 0.5 + sine(1320, t) * 0.32 + sine(1760, t) * 0.16) * env(t, d, 0.004) * 0.34;
  }
  writeWav('hit.wav', b);
}

// ── win — ascending arpeggio ─────────────────────────────────────────
{
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  const step = 0.13, ndur = 0.34, d = step * notes.length + ndur, b = buf(d);
  notes.forEach((f, k) => {
    const start = Math.floor(step * k * SR);
    for (let i = 0; i < ndur * SR; i++) {
      const t = i / SR;
      const v = (sine(f, t) * 0.6 + sine(f * 2, t) * 0.2) * env(t, ndur, 0.004) * 0.3;
      if (start + i < b.length) b[start + i] += v;
    }
  });
  writeWav('win.wav', b);
}

// ── music — seamless ambient loop ────────────────────────────────────
// An Am-ish pad: low drone + chord voices with slow tremolo, plus soft bells.
// All frequencies snapped to the loop's harmonic grid (1/L) so it loops cleanly.
{
  const L = 8; // seconds
  const N = SR * L;
  const grid = 1 / L;
  const snap = (f) => Math.round(f / grid) * grid;
  const b = buf(L);
  // pad voices: A2, A3, C4, E4, A4
  const voices = [
    { f: snap(110.0), a: 0.16, lfo: snap(0.125), ph: 0.0 },
    { f: snap(220.0), a: 0.11, lfo: snap(0.25), ph: 0.3 },
    { f: snap(261.63), a: 0.09, lfo: snap(0.375), ph: 0.6 },
    { f: snap(329.63), a: 0.08, lfo: snap(0.25), ph: 0.1 },
    { f: snap(440.0), a: 0.05, lfo: snap(0.5), ph: 0.8 },
  ];
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let s = 0;
    for (const v of voices) {
      const trem = 0.6 + 0.4 * Math.sin(2 * Math.PI * v.lfo * t + v.ph * Math.PI * 2);
      s += sine(v.f, t) * v.a * trem;
    }
    // gentle high shimmer
    s += sine(snap(880), t) * 0.02 * (0.5 + 0.5 * Math.sin(2 * Math.PI * snap(0.125) * t));
    b[i] = s * 0.85;
  }
  // soft bell motif (E5, A5) at a couple of points, decaying — kept inside the loop
  const bell = (freq, at) => {
    const start = Math.floor(at * SR);
    for (let i = 0; i < 1.6 * SR && start + i < N; i++) {
      const t = i / SR;
      b[start + i] += sine(snap(freq), t) * Math.exp(-2.2 * t) * 0.07;
    }
  };
  bell(659.25, 1.0); bell(880.0, 3.4); bell(659.25, 5.2);
  writeWav('music.wav', b);
}

console.log('Done — wrote SFX + music to assets/audio/');
