// story.js — cinematic narrative data (chapters, motifs). Ported 1:1.
// chapters[i] = interlude AFTER completing chapter (i+1); stage = that chapter's
// final ("boss") level. motif drives the camera/grade/audio mood in StoryCutscene.

export const PV_STORY = {
  intro: {
    eyebrow: "Prologue", title: "The Spark", cta: "Begin", levelId: 1, motif: "awaken",
    lines: [
      "In the dark between the walls, a single point of light wakes.",
      "It knows only this: to stay still is to fade.",
    ],
    coda: "So it learns to choose an angle, and go.",
  },
  chapters: [
    { eyebrow: "Interlude I", title: "Drift", cta: "Onward", levelId: 30, motif: "drift",
      lines: ["First light learns it can move.", "A wall is not a cage — only a question of angle."],
      coda: "Every surface, it turns out, points somewhere." },
    { eyebrow: "Interlude II", title: "Ricochet", cta: "Onward", levelId: 60, motif: "ricochet",
      lines: ["It stops fearing the walls.", "It begins to use them."],
      coda: "What pushed back becomes the push forward." },
    { eyebrow: "Interlude III", title: "Lattice", cta: "Onward", levelId: 90, motif: "lattice",
      lines: ["The world tightens into a maze of light.", "Patience becomes a kind of speed."],
      coda: "Between the bars, a single clean lane." },
    { eyebrow: "Interlude IV", title: "Vortex", cta: "Onward", levelId: 120, motif: "vortex",
      lines: ["A current it cannot see pulls it deeper.", "Down is just another way forward."],
      coda: "It stops resisting the spin." },
    { eyebrow: "Interlude V", title: "Fracture", cta: "Onward", levelId: 150, motif: "fracture",
      lines: ["The walls multiply, and the dark narrows.", "The picture splits — but the line holds."],
      coda: "Broken is not the same as lost." },
    { eyebrow: "Interlude VI", title: "Cascade", cta: "Onward", levelId: 180, motif: "cascade",
      lines: ["Momentum becomes the only language left.", "It falls forward, and forward becomes up."],
      coda: "Never the same point twice." },
    { eyebrow: "Interlude VII", title: "Helix", cta: "Onward", levelId: 210, motif: "helix",
      lines: ["It learns to climb.", "Each turn a little closer to the light above."],
      coda: "The spiral was always an ascent." },
    { eyebrow: "Interlude VIII", title: "Eclipse", cta: "Onward", levelId: 240, motif: "eclipse",
      lines: ["For a while the path all but disappears.", "It moves on memory of the angle."],
      coda: "In the dark, it is its own lamp." },
    { eyebrow: "Interlude IX", title: "Tempest", cta: "Onward", levelId: 270, motif: "tempest",
      lines: ["Everything moves at once.", "Stillness, it finally understands, is the trap."],
      coda: "It rides the storm instead of weathering it." },
  ],
  ending: {
    eyebrow: "Finale", title: "Singularity", cta: "Complete", levelId: 300, motif: "singularity",
    lines: [
      "The last wall falls away.",
      "The spark does not arrive home —",
    ],
    coda: "— it becomes the light others will steer by.",
  },
};

// physics tuning — identical to the live arena so trajectories match play
export const PV_STORY_P = { g: 300, airDrag: 0.05, eEdge: 0.9, eWall: 0.88, ft: 0.985 };

// ── per-motif camera + grade + audio config ──────────────────────────
export const PV_MOTIF = {
  awaken:   { z0: 1.20, z1: 1.0, rot: 0, spin: 0, follow: 0, shake: 0, vig: 0.46, tintA: 0.10, chroma: 0, flash: 0, scan: 0,
              wave: "sine",     chord: [98.0, 146.83, 196.0], cutoff: 620, lfo: 0.05, vol: 0.10, rumble: 0 },
  drift:    { z0: 1.0, z1: 1.12, rot: 0, spin: 0, follow: 0, shake: 0, vig: 0.34, tintA: 0.12, chroma: 0, flash: 0, scan: 0,
              wave: "sine",     chord: [110.0, 164.81, 220.0], cutoff: 820, lfo: 0.06, vol: 0.11, rumble: 0 },
  ricochet: { z0: 1.06, z1: 1.06, rot: 0, spin: 0, follow: 0.34, shake: 1.0, vig: 0.34, tintA: 0.12, chroma: 0, flash: 0, scan: 0,
              wave: "triangle", chord: [110.0, 146.83, 220.0], cutoff: 900, lfo: 0.10, vol: 0.11, rumble: 0 },
  lattice:  { z0: 1.0, z1: 1.0, rot: 0, spin: 0, follow: 0, shake: 0, vig: 0.30, tintA: 0.14, chroma: 0, flash: 0, scan: 1,
              wave: "sine",     chord: [130.81, 196.0, 261.63], cutoff: 1050, lfo: 0.05, vol: 0.10, rumble: 0 },
  vortex:   { z0: 1.04, z1: 1.14, rot: 0.16, spin: 0, follow: 0, shake: 0, vig: 0.42, tintA: 0.16, chroma: 0, flash: 0, scan: 0,
              wave: "triangle", chord: [110.0, 155.56, 207.65], cutoff: 640, lfo: 0.12, vol: 0.11, rumble: 0 },
  fracture: { z0: 1.04, z1: 1.04, rot: 0, spin: 0, follow: 0, shake: 0.5, vig: 0.44, tintA: 0.16, chroma: 1.2, flash: 0, scan: 0,
              wave: "sawtooth", chord: [110.0, 116.54, 174.61], cutoff: 520, lfo: 0.2, vol: 0.10, rumble: 0 },
  cascade:  { z0: 1.22, z1: 1.22, rot: 0, spin: 0, follow: 0.72, shake: 0, vig: 0.36, tintA: 0.14, chroma: 0, flash: 0, scan: 0,
              wave: "sine",     chord: [123.47, 185.0, 246.94], cutoff: 880, lfo: 0.09, vol: 0.11, rumble: 0 },
  helix:    { z0: 1.08, z1: 1.08, rot: 0, spin: 0.34, follow: 0.2, shake: 0, vig: 0.40, tintA: 0.16, chroma: 0, flash: 0, scan: 0,
              wave: "triangle", chord: [130.81, 196.0, 392.0], cutoff: 760, lfo: 0.08, vol: 0.11, rumble: 0 },
  eclipse:  { z0: 1.14, z1: 1.14, rot: 0, spin: 0, follow: 0.5, shake: 0, vig: 0.74, tintA: 0.18, chroma: 0, flash: 0, scan: 0,
              wave: "sine",     chord: [82.41, 98.0, 123.47], cutoff: 380, lfo: 0.05, vol: 0.12, rumble: 1 },
  tempest:  { z0: 1.05, z1: 1.05, rot: 0, spin: 0, follow: 0.34, shake: 1.5, vig: 0.46, tintA: 0.18, chroma: 0.6, flash: 1, scan: 0,
              wave: "sawtooth", chord: [110.0, 155.56, 233.08], cutoff: 520, lfo: 0.22, vol: 0.11, rumble: 1 },
  singularity: { z0: 1.42, z1: 0.92, rot: 0.18, spin: 0, follow: 0, shake: 0, vig: 0.40, tintA: 0.2, chroma: 0, flash: 0, scan: 0, supernova: 1,
              wave: "sine",     chord: [130.81, 196.0, 261.63, 392.0], cutoff: 700, lfo: 0.07, vol: 0.12, rumble: 0 },
};
