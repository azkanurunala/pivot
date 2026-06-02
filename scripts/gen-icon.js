// gen-icon.js — render assets/icon.png (1024×1024, NO alpha) with zero deps.
// A "Cyan Core" orb on the Night void, echoing the title screen. App Store
// rejects icons with an alpha channel, so we emit opaque RGB.
// Run: node scripts/gen-icon.js

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const S = 1024;
const hex = (h) => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

// palette (theme.night + skin.cyan)
const void0 = hex('#080B11'), void1 = hex('#0E141E'), void2 = hex('#141C2A');
const c0 = hex('#9CFFF1'), c1 = hex('#34E6CE'), c2 = hex('#0E9E8C'), glow = hex('#34E6CE');

const cx = S * 0.5, cy = S * 0.46, R = S * 0.30;
const rows = [];
for (let y = 0; y < S; y++) {
  const row = Buffer.alloc(1 + S * 3);
  row[0] = 0; // filter: none
  for (let x = 0; x < S; x++) {
    // void radial background
    const dv = Math.hypot(x - S / 2, y - S * 0.32) / (S * 0.8);
    let col = mix(mix(void2, void1, Math.min(1, dv * 1.6)), void0, Math.min(1, dv));
    // glow halo
    const d = Math.hypot(x - cx, y - cy);
    const halo = Math.max(0, 1 - d / (R * 1.9));
    col = mix(col, glow, halo * halo * 0.5);
    // orb body (radial gradient, light source up-left)
    if (d < R) {
      const lx = cx - R * 0.32, ly = cy - R * 0.38;
      const ld = Math.hypot(x - lx, y - ly) / (R * 1.25);
      let orb = ld < 0.55 ? mix(c0, c1, ld / 0.55) : mix(c1, c2, Math.min(1, (ld - 0.55) / 0.45));
      const edge = Math.min(1, (R - d) / 14); // soft rim
      col = mix(col, orb, edge);
      // specular highlight
      const sd = Math.hypot(x - (cx - R * 0.34), y - (cy - R * 0.4));
      const spec = Math.max(0, 1 - sd / (R * 0.26));
      col = mix(col, [255, 255, 255], spec * spec * 0.85);
    }
    const o = 1 + x * 3;
    row[o] = clamp(col[0]); row[o + 1] = clamp(col[1]); row[o + 2] = clamp(col[2]);
  }
  rows.push(row);
}

// ── minimal PNG encoder (RGB, 8-bit, no alpha) ──
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const tb = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tb, data])) >>> 0, 0);
  return Buffer.concat([len, tb, data, crc]);
}
let crcTable;
function crc32(buf) {
  if (!crcTable) { crcTable = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; } }
  let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return c ^ 0xffffffff;
}
const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4); ihdr[8] = 8; ihdr[9] = 2; // bit depth 8, color type 2 (RGB)
const idat = zlib.deflateSync(Buffer.concat(rows), { level: 9 });
const png = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
const out = path.join(__dirname, '..', 'assets', 'icon.png');
fs.writeFileSync(out, png);
console.log(`Wrote ${out} (${S}×${S}, RGB no-alpha, ${(png.length / 1024).toFixed(0)} KB)`);
