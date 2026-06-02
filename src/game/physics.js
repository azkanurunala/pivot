// physics.js — the pure, deterministic physics core (ported 1:1 from the design).
// A launched ball falls under gravity, reflects off internal walls + board edges
// (angle in ≈ angle out − friction), and collects targets on contact. No React,
// no rendering — just math, so the engine, the level validator, the solver, and
// the story cutscenes all share one identical simulation. Determinism matters:
// same angle + same level = same result, every time, on every device.

export const PV_SUBSTEPS = 5;

export function pvReflect(b, nx, ny, e, ft) {
  const vn = b.vx * nx + b.vy * ny;
  if (vn >= 0) return false;
  const tx = -ny, ty = nx;
  const vt = b.vx * tx + b.vy * ty;
  const rvn = -vn * e, rvt = vt * ft;
  b.vx = nx * rvn + tx * rvt;
  b.vy = ny * rvn + ty * rvt;
  return true;
}

export function pvClosestOnSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return [x1 + t * dx, y1 + t * dy];
}

// advances ball by dt; mutates b; mutates targets[].hit; returns # of bounces
export function pvStep(b, targets, walls, board, P, dt) {
  let bounces = 0;
  const sub = dt / PV_SUBSTEPS;
  for (let s = 0; s < PV_SUBSTEPS; s++) {
    b.vy += P.g * sub;
    const drag = Math.exp(-P.airDrag * sub);
    b.vx *= drag; b.vy *= drag;
    b.x += b.vx * sub; b.y += b.vy * sub;
    const r = board.ballR;
    // board edges
    if (b.x < r) { b.x = r; if (pvReflect(b, 1, 0, P.eEdge, P.ft)) bounces++; }
    else if (b.x > board.w - r) { b.x = board.w - r; if (pvReflect(b, -1, 0, P.eEdge, P.ft)) bounces++; }
    if (b.y < r) { b.y = r; if (pvReflect(b, 0, 1, P.eEdge, P.ft)) bounces++; }
    else if (b.y > board.h - r) { b.y = board.h - r; if (pvReflect(b, 0, -1, P.eEdge, P.ft * 0.9)) bounces++; }
    // walls
    const halfT = board.wallT / 2;
    for (const w of walls) {
      const [cx, cy] = pvClosestOnSeg(b.x, b.y, w.x1, w.y1, w.x2, w.y2);
      let nx = b.x - cx, ny = b.y - cy;
      let d = Math.hypot(nx, ny);
      const minD = r + halfT;
      if (d < minD) {
        if (d < 0.001) { // degenerate: use segment normal
          const sx = w.x2 - w.x1, sy = w.y2 - w.y1, sl = Math.hypot(sx, sy) || 1;
          nx = -sy / sl; ny = sx / sl; d = 0.001;
        } else { nx /= d; ny /= d; }
        b.x = cx + nx * minD; b.y = cy + ny * minD;
        if (pvReflect(b, nx, ny, P.eWall, P.ft)) bounces++;
      }
    }
    // targets (collectible, pass-through) — slight forgiveness radius
    for (const t of targets) {
      if (t.hit) continue;
      if (Math.hypot(b.x - t.x, b.y - t.y) < r + board.targetR + 3) t.hit = true;
    }
  }
  return bounces;
}

// simulate a ghost trajectory from a launch state (for the trajectory guide)
export function pvGhost(start, angleDeg, speed, targets, walls, board, P, steps) {
  const b = { x: start.x, y: start.y };
  const a = angleDeg * Math.PI / 180;
  b.vx = Math.cos(a) * speed; b.vy = -Math.sin(a) * speed;
  const pts = [[b.x, b.y]];
  const tg = targets.map((t) => ({ ...t, hit: false }));
  let hitAll = false;
  for (let i = 0; i < steps; i++) {
    pvStep(b, tg, walls, board, P, 1 / 60);
    pts.push([b.x, b.y]);
    if (tg.every((t) => t.hit)) { hitAll = true; break; }
    if (Math.hypot(b.vx, b.vy) < 18 && b.y > board.h - board.ballR - 3) break;
  }
  return { pts, hitAll };
}

// default live-arena tuning — gravity is scaled per-frame by the settings.gravity
export function pvParams(settings = {}) {
  return {
    g: 300 * (settings.gravity ?? 1),
    airDrag: 0.05,
    eEdge: 0.9, eWall: 0.88, ft: 0.985,
  };
}

// ── solver: find a forgiving winning angle for a level via the live engine ──
// Sweeps 5°→175° at 0.5° steps, groups contiguous winning angles into bands,
// and returns the center of the widest band — the most forgiving aim. Used by
// the in-game "show the angle" hint after repeated misses.
export function pvSolveAngle(level, board) {
  if (!board) return null;
  const P = { g: 300, airDrag: 0.05, eEdge: 0.9, eWall: 0.88, ft: 0.985 };
  const wins = [];
  for (let a = 5; a <= 175; a += 0.5) {
    const b = { x: level.ball.x, y: level.ball.y };
    const r = a * Math.PI / 180; b.vx = Math.cos(r) * level.speed; b.vy = -Math.sin(r) * level.speed;
    const tg = level.targets.map((t) => ({ ...t, hit: false }));
    let rest = 0, ok = false;
    for (let s = 0; s < 800; s++) {
      pvStep(b, tg, level.walls, board, P, 1 / 60);
      if (tg.every((t) => t.hit)) { ok = true; break; }
      const sp = Math.hypot(b.vx, b.vy);
      if (sp < 16) rest += 1 / 60; else rest = 0;
      if (rest > 0.9 || s > 13 * 60) break;
    }
    if (ok) wins.push(a);
  }
  if (!wins.length) return null;
  let bands = [], cur = [wins[0]];
  for (let i = 1; i < wins.length; i++) {
    if (wins[i] - wins[i - 1] <= 0.75) cur.push(wins[i]);
    else { bands.push(cur); cur = [wins[i]]; }
  }
  bands.push(cur);
  bands.sort((x, y) => (y[y.length - 1] - y[0]) - (x[x.length - 1] - x[0]));
  const best = bands[0];
  return Math.round((best[0] + best[best.length - 1]) / 2);
}
