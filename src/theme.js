// theme.js — Pivot's single source of visual truth (ported 1:1 from the design).
// Dark "Night" glassmorphism by default, plus 9 more worlds (5 dark, 5 light).
// PIVOT_THEMES drives every surface color; PIVOT_SKINS are the cosmetic orbs.
// Fonts: Space Grotesk (display + numerals), Plus Jakarta Sans (UI), JetBrains
// Mono (data) — JetBrains substitutes the design's Geist Mono on-device.

export const PIVOT_THEMES = {
  // ── NIGHT (default) — deep steel void, electric accents ──────────────
  night: {
    name: "Night",
    dark: true,
    // void background gradient
    void0: "#080B11",
    void1: "#0E141E",
    void2: "#141C2A",
    // neon blobs behind glass (parallax layer)
    blobA: "#2BE6CF",   // cyan
    blobB: "#7C5CFF",   // violet
    blobC: "#1E6FFF",   // blue
    // glass surfaces
    glass:   "rgba(255,255,255,0.055)",
    glassHi: "rgba(255,255,255,0.10)",
    glassDk: "rgba(255,255,255,0.028)",
    glassBlur: 26,
    // board slab (the play arena)
    slab0:   "rgba(255,255,255,0.07)",
    slab1:   "rgba(255,255,255,0.025)",
    slabEdge:"rgba(255,255,255,0.16)",
    grid:    "rgba(255,255,255,0.05)",
    // walls (2.5D extruded)
    wallTop: "#8FA2C4",
    wallSide:"#2A3650",
    wallEdge:"#C7D4EC",
    // hairlines + ink
    hair:  "rgba(255,255,255,0.12)",
    hair2: "rgba(255,255,255,0.06)",
    ink:   "#F1F4FB",
    ink2:  "#A7B2C6",
    ink3:  "#5E6A82",
    // signal
    accent:  "#34E6CE",  // primary neon (cyan)
    accent2: "#7C5CFF",  // secondary (violet)
    target:  "#FF5C9A",  // target neon (magenta-pink)
    targetHit:"#34E6CE",
    success: "#5CF0A8",
    danger:  "#FF6B57",
    gold:    "#FFC861",
  },
  // ── MEADOW — warm cream glass, green accents (template signature) ─────
  meadow: {
    name: "Meadow",
    dark: false,
    void0: "#F2F1E4",
    void1: "#E7E9D6",
    void2: "#DDE3C9",
    blobA: "#7AC93C",
    blobB: "#C68B1F",
    blobC: "#5C8AAE",
    glass:   "rgba(255,253,240,0.58)",
    glassHi: "rgba(255,255,245,0.86)",
    glassDk: "rgba(255,253,240,0.40)",
    glassBlur: 22,
    slab0:   "rgba(255,255,248,0.70)",
    slab1:   "rgba(255,255,248,0.42)",
    slabEdge:"rgba(40,60,25,0.16)",
    grid:    "rgba(40,60,25,0.07)",
    wallTop: "#3F8B2A",
    wallSide:"#2A6019",
    wallEdge:"#7AC93C",
    hair:  "rgba(40,60,25,0.16)",
    hair2: "rgba(40,60,25,0.08)",
    ink:   "#1C2613",
    ink2:  "#506347",
    ink3:  "#8A9281",
    accent:  "#3F8B2A",
    accent2: "#C68B1F",
    target:  "#A8462A",
    targetHit:"#3F8B2A",
    success: "#3F8B2A",
    danger:  "#A8462A",
    gold:    "#C68B1F",
  },
  // ── SAGE — saturated green canvas ─────────────────────────────────────
  sage: {
    name: "Sage",
    dark: false,
    void0: "#E5E8D2",
    void1: "#D8DDC2",
    void2: "#CBD3B0",
    blobA: "#7AC93C",
    blobB: "#5C8AAE",
    blobC: "#86598A",
    glass:   "rgba(255,255,245,0.52)",
    glassHi: "rgba(255,255,245,0.80)",
    glassDk: "rgba(255,255,245,0.34)",
    glassBlur: 20,
    slab0:   "rgba(255,255,246,0.62)",
    slab1:   "rgba(255,255,246,0.36)",
    slabEdge:"rgba(36,56,24,0.20)",
    grid:    "rgba(36,56,24,0.09)",
    wallTop: "#3F8B2A",
    wallSide:"#2A6019",
    wallEdge:"#A9D744",
    hair:  "rgba(36,56,24,0.20)",
    hair2: "rgba(36,56,24,0.10)",
    ink:   "#1A2410",
    ink2:  "#4B5C40",
    ink3:  "#7E8B72",
    accent:  "#3F8B2A",
    accent2: "#86598A",
    target:  "#A0381B",
    targetHit:"#3F8B2A",
    success: "#3F8B2A",
    danger:  "#A0381B",
    gold:    "#B58218",
  },
  // ── PAPER — stark white glass ─────────────────────────────────────────
  paper: {
    name: "Paper",
    dark: false,
    void0: "#FCFCF7",
    void1: "#F1F1EA",
    void2: "#E7E7DE",
    blobA: "#5C8AAE",
    blobB: "#8A5F87",
    blobC: "#3F8B2A",
    glass:   "rgba(255,255,255,0.62)",
    glassHi: "rgba(255,255,255,0.92)",
    glassDk: "rgba(255,255,255,0.42)",
    glassBlur: 22,
    slab0:   "rgba(255,255,255,0.74)",
    slab1:   "rgba(255,255,255,0.46)",
    slabEdge:"rgba(0,0,0,0.12)",
    grid:    "rgba(0,0,0,0.05)",
    wallTop: "#3a4a63",
    wallSide:"#1f2a3d",
    wallEdge:"#5C8AAE",
    hair:  "rgba(0,0,0,0.12)",
    hair2: "rgba(0,0,0,0.06)",
    ink:   "#15170E",
    ink2:  "#535647",
    ink3:  "#92957F",
    accent:  "#2A6FDB",
    accent2: "#8A5F87",
    target:  "#D8456B",
    targetHit:"#2A6FDB",
    success: "#1F8A5B",
    danger:  "#D8456B",
    gold:    "#BC8616",
  },
  // ── EMBER — warm charcoal void, fire accents ─────────────────────────
  ember: {
    name: "Ember",
    dark: true,
    void0: "#0C0806", void1: "#16100B", void2: "#211711",
    blobA: "#FF7A2F", blobB: "#FF477E", blobC: "#B23A0E",
    glass:   "rgba(255,255,255,0.055)", glassHi: "rgba(255,255,255,0.10)", glassDk: "rgba(255,255,255,0.028)", glassBlur: 26,
    slab0:   "rgba(255,255,255,0.07)", slab1:   "rgba(255,255,255,0.025)", slabEdge:"rgba(255,255,255,0.16)", grid:    "rgba(255,255,255,0.05)",
    wallTop: "#C9A98F", wallSide:"#4A3326", wallEdge:"#F0D9C4",
    hair:  "rgba(255,255,255,0.12)", hair2: "rgba(255,255,255,0.06)",
    ink:   "#FBF2EA", ink2:  "#CBB4A3", ink3:  "#7E6555",
    accent:  "#FF7A2F", accent2: "#FFB627", target:  "#FF477E", targetHit:"#FF7A2F",
    success: "#7FE0A0", danger:  "#FF5B57", gold:    "#FFC861",
  },
  // ── ABYSS — deep-sea black, aqua + coral ─────────────────────────────
  abyss: {
    name: "Abyss",
    dark: true,
    void0: "#04090E", void1: "#08161F", void2: "#0C2330",
    blobA: "#22D3EE", blobB: "#2DD4BF", blobC: "#3B82F6",
    glass:   "rgba(255,255,255,0.055)", glassHi: "rgba(255,255,255,0.10)", glassDk: "rgba(255,255,255,0.028)", glassBlur: 26,
    slab0:   "rgba(255,255,255,0.07)", slab1:   "rgba(255,255,255,0.025)", slabEdge:"rgba(255,255,255,0.16)", grid:    "rgba(255,255,255,0.05)",
    wallTop: "#7FA8B8", wallSide:"#1B3A47", wallEdge:"#B8DCE6",
    hair:  "rgba(255,255,255,0.12)", hair2: "rgba(255,255,255,0.06)",
    ink:   "#EAF6FA", ink2:  "#9DBAC4", ink3:  "#4F6975",
    accent:  "#2DD4BF", accent2: "#38BDF8", target:  "#FF6B81", targetHit:"#2DD4BF",
    success: "#34E6A8", danger:  "#FF6B57", gold:    "#FFCF6B",
  },
  // ── NEBULA — cosmic indigo, magenta + lime ───────────────────────────
  nebula: {
    name: "Nebula",
    dark: true,
    void0: "#0A0612", void1: "#140C24", void2: "#1E1238",
    blobA: "#A855F7", blobB: "#EC4899", blobC: "#6366F1",
    glass:   "rgba(255,255,255,0.055)", glassHi: "rgba(255,255,255,0.10)", glassDk: "rgba(255,255,255,0.028)", glassBlur: 26,
    slab0:   "rgba(255,255,255,0.07)", slab1:   "rgba(255,255,255,0.025)", slabEdge:"rgba(255,255,255,0.16)", grid:    "rgba(255,255,255,0.05)",
    wallTop: "#A99BC9", wallSide:"#2E2350", wallEdge:"#D6CCF0",
    hair:  "rgba(255,255,255,0.12)", hair2: "rgba(255,255,255,0.06)",
    ink:   "#F3EEFB", ink2:  "#B6A7CE", ink3:  "#6E5E86",
    accent:  "#C084FC", accent2: "#F472B6", target:  "#A3E635", targetHit:"#C084FC",
    success: "#5CF0A8", danger:  "#FB7185", gold:    "#FCD34D",
  },
  // ── BLUSH — warm pink paper, rose + plum ─────────────────────────────
  blush: {
    name: "Blush",
    dark: false,
    void0: "#FBF1EE", void1: "#F6E3DE", void2: "#F0D5CE",
    blobA: "#F472B6", blobB: "#FB923C", blobC: "#A78BFA",
    glass:   "rgba(255,255,255,0.60)", glassHi: "rgba(255,255,255,0.90)", glassDk: "rgba(255,255,255,0.40)", glassBlur: 22,
    slab0:   "rgba(255,255,255,0.72)", slab1:   "rgba(255,255,255,0.44)", slabEdge:"rgba(74,30,42,0.16)", grid:    "rgba(74,30,42,0.06)",
    wallTop: "#B05B73", wallSide:"#7A3247", wallEdge:"#E59BB3",
    hair:  "rgba(74,30,42,0.15)", hair2: "rgba(74,30,42,0.07)",
    ink:   "#2A1720", ink2:  "#6B4A56", ink3:  "#A6838E",
    accent:  "#D6457A", accent2: "#9D6BC9", target:  "#2E9BB5", targetHit:"#D6457A",
    success: "#1F8A5B", danger:  "#D8456B", gold:    "#C2870E",
  },
  // ── AZURE — cool ice-blue paper, blue + coral ────────────────────────
  azure: {
    name: "Azure",
    dark: false,
    void0: "#EFF5FB", void1: "#E0EBF6", void2: "#D0E1F0",
    blobA: "#38BDF8", blobB: "#818CF8", blobC: "#22D3EE",
    glass:   "rgba(255,255,255,0.60)", glassHi: "rgba(255,255,255,0.90)", glassDk: "rgba(255,255,255,0.40)", glassBlur: 22,
    slab0:   "rgba(255,255,255,0.72)", slab1:   "rgba(255,255,255,0.44)", slabEdge:"rgba(20,40,60,0.14)", grid:    "rgba(20,40,60,0.06)",
    wallTop: "#4A6E8C", wallSide:"#27435C", wallEdge:"#8FB8D6",
    hair:  "rgba(20,40,60,0.13)", hair2: "rgba(20,40,60,0.06)",
    ink:   "#0E1B28", ink2:  "#41576B", ink3:  "#7C93A6",
    accent:  "#2563EB", accent2: "#0EA5A0", target:  "#EC5A6E", targetHit:"#2563EB",
    success: "#1F8A5B", danger:  "#E0455F", gold:    "#C2870E",
  },
};

// Ball skins (cosmetics) — independent of theme. Each is a radial-ish orb.
export const PIVOT_SKINS = {
  cyan:    { name: "Cyan Core",  c0: "#9CFFF1", c1: "#34E6CE", c2: "#0E9E8C", glow: "#34E6CE", price: null, owned: true },
  lime:    { name: "Acid",       c0: "#E8FFB0", c1: "#B6F94B", c2: "#6FA814", glow: "#B6F94B", price: 0.99, owned: false },
  magenta: { name: "Hotline",    c0: "#FFB3D2", c1: "#FF5C9A", c2: "#B01E5E", glow: "#FF5C9A", price: 0.99, owned: false },
  amber:   { name: "Ember",      c0: "#FFE0A8", c1: "#FFB13C", c2: "#C2730A", glow: "#FFB13C", price: 0.99, owned: false },
  violet:  { name: "Nebula",     c0: "#D4C7FF", c1: "#9B7CFF", c2: "#5A38C2", glow: "#9B7CFF", price: 0.99, owned: false },
  aurora:  { name: "Aurora",     c0: "#A8FFE6", c1: "#6FE0FF", c2: "#7C5CFF", glow: "#6FE0FF", price: 1.99, owned: false, seasonal: true },
  // ── gradient series — multi-hue iridescent orbs ─────────────────────
  prism:   { name: "Prism",      c0: "#BFFFF2", c1: "#8A6BFF", c2: "#FF5CA8", glow: "#A07CFF", price: 1.99, owned: false },
  vapor:   { name: "Vapor",      c0: "#CFFBFF", c1: "#5CC8FF", c2: "#B06CFF", glow: "#7FD8FF", price: 1.99, owned: false },
  sunset:  { name: "Sunset",     c0: "#FFE7A8", c1: "#FF8A3D", c2: "#D6457A", glow: "#FF8A3D", price: 0.99, owned: false },
  magma:   { name: "Magma",      c0: "#FFD27A", c1: "#FF5B3D", c2: "#8E1A2E", glow: "#FF5B3D", price: 0.99, owned: false },
  oceanic: { name: "Oceanic",    c0: "#A8F0FF", c1: "#38BDF8", c2: "#3730A3", glow: "#38BDF8", price: 0.99, owned: false },
  abyssal: { name: "Abyssal",    c0: "#7FE9FF", c1: "#2DD4BF", c2: "#1E3A8A", glow: "#2DD4BF", price: 0.99, owned: false },
  toxic:   { name: "Toxic",      c0: "#EAFFB0", c1: "#66E04D", c2: "#0E7A5A", glow: "#66E04D", price: 0.99, owned: false },
  royale:  { name: "Royale",     c0: "#E7D0FF", c1: "#A855F7", c2: "#4C1D95", glow: "#A855F7", price: 0.99, owned: false },
  plasma:  { name: "Plasma",     c0: "#FFB3F0", c1: "#C026D3", c2: "#5B1466", glow: "#E040FB", price: 1.99, owned: false },
  rosegold:{ name: "Rosé Gold",  c0: "#FFE9E2", c1: "#F0A89A", c2: "#A85F5F", glow: "#F4B9A8", price: 1.99, owned: false },
  gilded:  { name: "Gilded",     c0: "#FFF3C8", c1: "#FFC861", c2: "#A86A12", glow: "#FFD27A", price: 1.99, owned: false },
  glacier: { name: "Glacier",    c0: "#FFFFFF", c1: "#AED9FF", c2: "#3B6EA5", glow: "#CFE8FF", price: 0.99, owned: false },
  mint:    { name: "Spearmint",  c0: "#DFFFF0", c1: "#34E6A8", c2: "#0E6E66", glow: "#34E6A8", price: 0.99, owned: false },
   inferno: { name: "Inferno",   c0: "#FFE08A", c1: "#FF3D6B", c2: "#6E0E2E", glow: "#FF3D6B", price: 0.99, owned: false },
  spectrum:{ name: "Spectrum",   c0: "#FFD9F0", c1: "#7CE0FF", c2: "#B6F94B", glow: "#7CE0FF", price: 2.99, owned: false, seasonal: true },
  obsidian:{ name: "Obsidian",   c0: "#9FB0C8", c1: "#3A4660", c2: "#0C1018", glow: "#6B7E9E", price: 2.99, owned: false, seasonal: true },
};

export const ALL_SKIN_IDS = Object.keys(PIVOT_SKINS);
export const DEFAULT_OWNED = ['cyan'];

export function skinById(id) {
  return PIVOT_SKINS[id] || PIVOT_SKINS.cyan;
}

// Font role names — three families: display (titles/numerals), sans (UI), mono (data).
export const FONT = {
  display: 'SpaceGrotesk_700Bold',
  displaySemi: 'SpaceGrotesk_600SemiBold',
  displayMed: 'SpaceGrotesk_500Medium',
  num: 'SpaceGrotesk_600SemiBold',
  sans: 'PlusJakartaSans_500Medium',
  sansSemi: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
  sansExtra: 'PlusJakartaSans_800ExtraBold',
  sansLight: 'PlusJakartaSans_300Light',
  mono: 'JetBrainsMono_500Medium',
  monoSemi: 'JetBrainsMono_600SemiBold',
};
