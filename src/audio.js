// audio.js — Pivot's sound engine. Real SFX + an ambient music loop, gated by
// the Sound setting. Built on expo-audio; like the other service wrappers it
// reaches the native module lazily and degrades to a safe no-op if it's absent
// (so a JS-only bundle never crashes). Assets are synthesized WAVs in
// assets/audio/ (regenerate with scripts/gen-audio.js).

function audioModule() {
  try { return require('expo-audio'); } catch (e) { return null; }
}

const SFX_SOURCES = {
  tap: require('../assets/audio/tap.wav'),
  launch: require('../assets/audio/launch.wav'),
  bounce: require('../assets/audio/bounce.wav'),
  hit: require('../assets/audio/hit.wav'),
  win: require('../assets/audio/win.wav'),
};
const MUSIC_SOURCE = require('../assets/audio/music.wav');

const POOL = 3;              // players per SFX → allows rapid overlap (e.g. bounces)
const SFX_VOL = 0.7;
const MUSIC_VOL = 0.3;

let sfxEnabled = true;       // driven by the "Sound effects" setting
let musicEnabled = true;     // driven by the "Music" setting
let ready = false;
const pools = {};            // name → { i, players: [] }
let music = null;

// Build the player pools + music once. Safe to call repeatedly.
export async function initAudio() {
  const A = audioModule();
  if (!A || ready) return;
  try {
    await A.setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
  } catch (e) {}
  try {
    for (const [name, src] of Object.entries(SFX_SOURCES)) {
      pools[name] = {
        i: 0,
        players: Array.from({ length: POOL }, () => {
          const p = A.createAudioPlayer(src);
          p.volume = SFX_VOL;
          return p;
        }),
      };
    }
    music = A.createAudioPlayer(MUSIC_SOURCE);
    music.loop = true;
    music.volume = MUSIC_VOL;
    ready = true;
  } catch (e) {}
}

// Sound effects on/off (independent of music).
export function setSfxEnabled(on) {
  sfxEnabled = !!on;
}

// Music on/off (independent of SFX) — starts/stops the loop.
export function setMusicEnabled(on) {
  musicEnabled = !!on;
  if (musicEnabled) startMusic();
  else stopMusic();
}

// Fire a one-shot effect: 'tap' | 'launch' | 'bounce' | 'hit' | 'win'.
export function playSfx(name, vol) {
  if (!sfxEnabled || !ready) return;
  const pool = pools[name];
  if (!pool) return;
  try {
    pool.i = (pool.i + 1) % POOL;
    const p = pool.players[pool.i];
    if (vol != null) p.volume = vol;
    p.seekTo(0);
    p.play();
  } catch (e) {}
}

export function startMusic() {
  if (!musicEnabled || !ready || !music) return;
  try { music.play(); } catch (e) {}
}

export function stopMusic() {
  if (!music) return;
  try { music.pause(); } catch (e) {}
}
