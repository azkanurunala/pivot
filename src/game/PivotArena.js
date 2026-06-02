// PivotArena.js — the live physics arena, ported from the design's HTML-Canvas
// renderer to React Native Skia. A launched ball falls under gravity, reflects
// off 2.5D-extruded walls + board edges, and collects glowing targets. Drag the
// board to aim (PanResponder), release to launch.
//
// Architecture (per the PANDUAN engine patterns):
//   • The ENTIRE mutable world lives in one ref (simRef) — never useState.
//   • Props (skin/paused/settings/callbacks) are mirrored into refs each render
//     so the single rAF loop always reads the latest without restarting.
//   • One rAF loop steps the shared pure physics core and bumps a frame counter;
//     drawing is an imperative Skia Picture rebuilt from simRef each repaint.

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, PanResponder } from 'react-native';
import {
  Canvas, Picture, createPicture, Skia,
  PaintStyle, StrokeCap, TileMode, BlurStyle, ClipOp,
} from '@shopify/react-native-skia';
import { PV_BOARD } from './levels';
import { pvStep, pvGhost, pvParams } from './physics';

const nowMs = () => (global.performance && performance.now ? performance.now() : Date.now());
const col = (s) => Skia.Color(s);

export default function PivotArena({ theme, level, skin, settings, resetSignal, onResult, onAimChange, paused }) {
  const simRef = useRef(null);
  const aimRef = useRef({ active: false, angle: 58 });
  const layoutRef = useRef({ w: 0, h: 0, scale: 1, ox: 0, oy: 0 });
  const phaseRef = useRef('aim');           // aim | fly | win | miss
  const rafRef = useRef(0);
  const [, setFrame] = useState(0);
  const [angle, setAngle] = useState(58);
  const [canvas, setCanvas] = useState({ w: 0, h: 0 });

  // mirror volatile props into refs so the long-lived loop reads fresh values
  const themeRef = useRef(theme); themeRef.current = theme;
  const skinRef = useRef(skin); skinRef.current = skin;
  const settingsRef = useRef(settings); settingsRef.current = settings;
  const pausedRef = useRef(paused); pausedRef.current = paused;
  const onResultRef = useRef(onResult); onResultRef.current = onResult;
  const onAimRef = useRef(onAimChange); onAimRef.current = onAimChange;
  const levelRef = useRef(level); levelRef.current = level;

  // ── world bootstrap ─────────────────────────────────────────────────
  const initSim = useCallback(() => {
    const L = levelRef.current;
    simRef.current = {
      ball: { x: L.ball.x, y: L.ball.y, vx: 0, vy: 0 },
      targets: L.targets.map((t) => ({ ...t, hit: false, pop: 0 })),
      walls: L.walls,
      trail: [], effects: [],
      bounces: 0, t: 0, restTimer: 0, startMs: 0,
    };
    aimRef.current.active = false;
    phaseRef.current = 'aim';
  }, []);

  useEffect(() => { initSim(); }, [initSim, resetSignal, level]);

  // ── fit board into the slab, letterboxed, preserving 320×460 aspect ──
  const onCanvasLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    const ar = PV_BOARD.w / PV_BOARD.h;
    let w = width, h = w / ar;
    if (h > height) { h = height; w = h * ar; }
    const scale = w / PV_BOARD.w;
    layoutRef.current = { w, h, scale, ox: (width - w) / 2, oy: (height - h) / 2, fullW: width, fullH: height };
    setCanvas({ w: width, h: height });
  };

  // ── pointer aim (drag the board, release to launch) ─────────────────
  const toBoard = (locX, locY) => {
    const L = layoutRef.current;
    return [(locX - L.ox) / L.scale, (locY - L.oy) / L.scale];
  };
  const updateAim = (locX, locY) => {
    const sim = simRef.current; if (!sim) return;
    const b = sim.ball;
    const [px, py] = toBoard(locX, locY);
    let a = (Math.atan2(-(py - b.y), px - b.x) * 180) / Math.PI;
    if (a < 0) a += 360;
    a = Math.max(8, Math.min(172, a));   // keep it an upward launch
    aimRef.current.angle = a;
    setAngle(Math.round(a));
    onAimRef.current && onAimRef.current(Math.round(a));
  };
  const launch = () => {
    if (phaseRef.current !== 'aim') return;
    const sim = simRef.current; if (!sim) return;
    aimRef.current.active = false;
    const b = sim.ball;
    const a = (aimRef.current.angle * Math.PI) / 180;
    b.vx = Math.cos(a) * levelRef.current.speed;
    b.vy = -Math.sin(a) * levelRef.current.speed;
    sim.startMs = nowMs();
    sim.bounces = 0;
    phaseRef.current = 'fly';
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        if (phaseRef.current !== 'aim' || pausedRef.current) return;
        aimRef.current.active = true;
        updateAim(e.nativeEvent.locationX, e.nativeEvent.locationY);
      },
      onPanResponderMove: (e) => {
        if (!aimRef.current.active || phaseRef.current !== 'aim') return;
        updateAim(e.nativeEvent.locationX, e.nativeEvent.locationY);
      },
      onPanResponderRelease: () => { if (aimRef.current.active) launch(); },
      onPanResponderTerminate: () => { if (aimRef.current.active) launch(); },
    })
  ).current;

  // ── main loop ───────────────────────────────────────────────────────
  useEffect(() => {
    let last = nowMs();
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const now = nowMs();
      let dt = (now - last) / 1000; last = now;
      dt = Math.min(dt, 1 / 30);
      const sim = simRef.current;
      if (!sim) return;
      const P = pvParams(settingsRef.current);
      const L = levelRef.current;

      if (phaseRef.current === 'fly' && !pausedRef.current) {
        const prevHits = sim.targets.filter((t) => t.hit).length;
        const bn = pvStep(sim.ball, sim.targets, sim.walls, PV_BOARD, P, dt);
        sim.bounces += bn;
        sim.t += dt;
        const nowHits = sim.targets.filter((t) => t.hit).length;
        if (nowHits > prevHits) {
          for (const t of sim.targets) {
            if (t.hit && t.pop === 0) {
              t.pop = 0.001;
              sim.effects.push({ x: t.x, y: t.y, r: PV_BOARD.targetR, life: 1 });
            }
          }
        }
        sim.trail.push([sim.ball.x, sim.ball.y]);
        if (sim.trail.length > 18) sim.trail.shift();
        if (sim.targets.every((t) => t.hit)) {
          phaseRef.current = 'win';
          onResultRef.current && onResultRef.current({
            win: true, bounces: sim.bounces, hits: nowHits, total: sim.targets.length,
            angle: Math.round(aimRef.current.angle), durationMs: now - sim.startMs, par: L.par,
          });
        } else {
          const sp = Math.hypot(sim.ball.vx, sim.ball.vy);
          if (sp < 16) sim.restTimer += dt; else sim.restTimer = 0;
          if (sim.restTimer > 0.9 || sim.t > 13) {
            phaseRef.current = 'miss';
            onResultRef.current && onResultRef.current({
              win: false, bounces: sim.bounces, hits: nowHits, total: sim.targets.length,
              angle: Math.round(aimRef.current.angle),
            });
          }
        }
      }
      for (const t of sim.targets) if (t.pop > 0) t.pop = Math.min(1, t.pop + dt * 4);
      sim.effects = sim.effects.filter((fx) => (fx.life -= dt * 1.8) > 0);
      setFrame((f) => (f + 1) % 1000000);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── draw (imperative Skia Picture, rebuilt each repaint) ────────────
  const picture = createPicture((cv) => {
    const sim = simRef.current; const L = layoutRef.current;
    if (!sim || !L.scale) return;
    const th = themeRef.current, sk = skinRef.current, s = settingsRef.current;
    const now = nowMs();
    const depth = s.depth ?? 1, dz = 6 * depth;

    cv.save();
    cv.translate(L.ox, L.oy);
    cv.scale(L.scale, L.scale);
    cv.clipRect(Skia.XYWHRect(0, 0, PV_BOARD.w, PV_BOARD.h), ClipOp.Intersect, true);

    const stroke = (color, width, capRound) => {
      const p = Skia.Paint(); p.setStyle(PaintStyle.Stroke); p.setColor(col(color)); p.setStrokeWidth(width);
      if (capRound) p.setStrokeCap(StrokeCap.Round); return p;
    };
    const fill = (color) => { const p = Skia.Paint(); p.setColor(col(color)); return p; };
    const glowPaint = (color, blur) => {
      const p = Skia.Paint(); p.setColor(col(color));
      p.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, blur, false)); return p;
    };

    // grid
    const gridP = stroke(th.grid, 0.7);
    for (let gx = 40; gx < PV_BOARD.w; gx += 40) cv.drawLine(gx, 6, gx, PV_BOARD.h - 6, gridP);
    for (let gy = 40; gy < PV_BOARD.h; gy += 40) cv.drawLine(6, gy, PV_BOARD.w - 6, gy, gridP);

    // walls (2.5D extruded): side face, top face, bright edge
    const sideP = stroke(th.wallSide, PV_BOARD.wallT, true);
    const topP = stroke(th.wallTop, PV_BOARD.wallT, true);
    const edgeP = stroke(th.wallEdge, 1.5, true);
    const drawWall = (x1, y1, x2, y2) => {
      cv.drawLine(x1, y1 + dz, x2, y2 + dz, sideP);
      cv.drawLine(x1, y1, x2, y2, topP);
      cv.drawLine(x1, y1 - PV_BOARD.wallT / 2 + 1, x2, y2 - PV_BOARD.wallT / 2 + 1, edgeP);
    };

    // board boundary — the implicit reflective edges the ball bounces off.
    // Rendered as a thin, dimmer, low-profile rim so the play area reads as
    // enclosed, yet stays clearly subordinate to the taller interactive walls
    // (and slim enough not to sit under the ball when it rests against an edge).
    const bt = 4.5;                         // thinner than wall thickness (9)
    const bdz = dz * 0.5;                   // shallower extrusion than walls
    const bSide = stroke(th.wallSide, bt, true); bSide.setAlphaf(0.5);
    const bTop = stroke(th.wallTop, bt, true); bTop.setAlphaf(0.5);
    const bEdge = stroke(th.wallEdge, 1.2, true); bEdge.setAlphaf(0.6);
    const drawBound = (x1, y1, x2, y2) => {
      cv.drawLine(x1, y1 + bdz, x2, y2 + bdz, bSide);
      cv.drawLine(x1, y1, x2, y2, bTop);
      cv.drawLine(x1, y1 - bt / 2 + 1, x2, y2 - bt / 2 + 1, bEdge);
    };
    const bi = bt / 2, Bw = PV_BOARD.w, Bh = PV_BOARD.h;
    drawBound(bi, bi, Bw - bi, bi);            // top
    drawBound(bi, Bh - bi, Bw - bi, Bh - bi);  // bottom
    drawBound(bi, bi, bi, Bh - bi);            // left
    drawBound(Bw - bi, bi, Bw - bi, Bh - bi);  // right

    for (const w of sim.walls) drawWall(w.x1, w.y1, w.x2, w.y2);

    // targets
    for (const t of sim.targets) {
      if (t.hit) continue;
      const pulse = 0.5 + 0.5 * Math.sin(now / 360 + t.x);
      // shadow
      const shp = Skia.Paint(); shp.setColor(col('rgba(0,0,0,0.18)'));
      cv.drawOval(Skia.XYWHRect(t.x - PV_BOARD.targetR * 0.9, t.y + dz - PV_BOARD.targetR * 0.4, PV_BOARD.targetR * 1.8, PV_BOARD.targetR * 0.8), shp);
      // glow ring
      const gp = glowPaint(th.target, 8 + pulse * 5); gp.setStyle(PaintStyle.Stroke); gp.setStrokeWidth(3);
      cv.drawCircle(t.x, t.y, PV_BOARD.targetR, gp);
      // core
      const cp = fill(th.target); cp.setAlphaf(0.35 + pulse * 0.4);
      cv.drawCircle(t.x, t.y, PV_BOARD.targetR * 0.34, cp);
      // outer tick ring
      const tp = stroke(th.target, 1.4); tp.setAlphaf(0.5);
      cv.drawCircle(t.x, t.y, PV_BOARD.targetR + 5 + pulse * 3, tp);
    }

    // hit-burst effects
    for (const fx of sim.effects) {
      const p = 1 - fx.life;
      const ep = stroke(th.targetHit, 2.5); ep.setAlphaf(fx.life);
      cv.drawCircle(fx.x, fx.y, PV_BOARD.targetR + p * 26, ep);
    }

    // aim guidance (only while aiming)
    if (phaseRef.current === 'aim') {
      const b = sim.ball;
      const a = (aimRef.current.angle * Math.PI) / 180;
      const dirx = Math.cos(a), diry = -Math.sin(a);
      if (s.guide) {
        const g = pvGhost(b, aimRef.current.angle, levelRef.current.speed, sim.targets, sim.walls, PV_BOARD, pvParams(s), 150);
        for (let i = 4; i < g.pts.length; i += 4) {
          const al = 1 - i / g.pts.length;
          const dp = fill(g.hitAll ? th.success : th.ink2); dp.setAlphaf(0.18 + al * 0.55);
          cv.drawCircle(g.pts[i][0], g.pts[i][1], 2.1, dp);
        }
      }
      // aim arrow
      const len = 64;
      const ap = glowPaint(th.accent, 6); ap.setStyle(PaintStyle.Stroke); ap.setStrokeWidth(3); ap.setStrokeCap(StrokeCap.Round);
      cv.drawLine(b.x + dirx * (PV_BOARD.ballR + 6), b.y + diry * (PV_BOARD.ballR + 6), b.x + dirx * len, b.y + diry * len, ap);
      const hx = b.x + dirx * len, hy = b.y + diry * len, pa = a + Math.PI, wing = 0.42;
      const headP = stroke(th.accent, 3, true);
      cv.drawLine(hx, hy, hx + Math.cos(pa - wing) * 12, hy - Math.sin(pa - wing) * 12, headP);
      cv.drawLine(hx, hy, hx + Math.cos(pa + wing) * 12, hy - Math.sin(pa + wing) * 12, headP);
      // angle arc
      const arcP = stroke(th.accent, 2); arcP.setAlphaf(0.35); arcP.setStyle(PaintStyle.Stroke);
      const arc = Skia.Path.Make();
      arc.addArc(Skia.XYWHRect(b.x - 30, b.y - 30, 60, 60), (-a * 180) / Math.PI, (a * 180) / Math.PI);
      cv.drawPath(arc, arcP);
    }

    // ball trail
    if (sim.trail.length > 1) {
      for (let i = 1; i < sim.trail.length; i++) {
        const al = i / sim.trail.length;
        const tp = stroke(sk.glow, PV_BOARD.ballR * 1.2 * al, true); tp.setAlphaf(al * 0.5);
        cv.drawLine(sim.trail[i - 1][0], sim.trail[i - 1][1], sim.trail[i][0], sim.trail[i][1], tp);
      }
    }

    // ball + shadow
    const b = sim.ball, R = PV_BOARD.ballR;
    const bsh = Skia.Paint(); bsh.setColor(col('rgba(0,0,0,0.30)'));
    cv.drawOval(Skia.XYWHRect(b.x - R * 1.05, b.y + dz + 2 - R * 0.5, R * 2.1, R), bsh);
    // glow halo
    const halo = glowPaint(sk.glow, 12); cv.drawCircle(b.x, b.y, R, halo);
    // gradient body
    const bp = Skia.Paint();
    bp.setShader(Skia.Shader.MakeRadialGradient(
      { x: b.x - R * 0.3, y: b.y - R * 0.35 }, R * 1.25,
      [col(sk.c0), col(sk.c1), col(sk.c2)], [0, 0.55, 1], TileMode.Clamp
    ));
    cv.drawCircle(b.x, b.y, R, bp);
    // specular
    const spec = fill('rgba(255,255,255,0.85)');
    cv.drawCircle(b.x - R * 0.32, b.y - R * 0.38, R * 0.22, spec);

    cv.restore();
  });

  return (
    <View style={{ flex: 1 }} onLayout={onCanvasLayout} {...pan.panHandlers}>
      {canvas.w > 0 && (
        <Canvas style={{ flex: 1 }}>
          <Picture picture={picture} />
        </Canvas>
      )}
    </View>
  );
}
