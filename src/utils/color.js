// color.js — small color helpers. Skia + RN both prefer rgba() strings; the
// design language leans on hex + alpha overlays everywhere.

export function hexToRgb(h) {
  const c = String(h || '#000').replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// hex + alpha → 'rgba(r,g,b,a)'
export function rgba(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// in the prototype this was pvHexA — identical behaviour, kept under both names.
export const hexA = rgba;

// interpolate two hex colors → '#rrggbb'
export function mixHex(a, b, t) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const m = (x, y) => Math.round(x + (y - x) * t);
  const h = (n) => n.toString(16).padStart(2, '0');
  return `#${h(m(ar, br))}${h(m(ag, bg))}${h(m(ab, bb))}`;
}
