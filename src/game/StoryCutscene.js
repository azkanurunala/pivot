// StoryCutscene.js — cinematic narrative vignettes, ported from the design.
// Each scene REPLAYS a real level's winning shot through the shared physics core
// (so trajectories match play exactly), then layers a per-chapter camera motif
// (push / follow / swirl / glitch / shake / flash / supernova), letterbox bars,
// and staged narration with a coda.
//
// Note: the web prototype synthesized ambient audio via the Web Audio API, which
// has no React Native equivalent — audio here degrades to a no-op. The full
// visual motif system (camera, grade, vignette, sparks, supernova) is intact.

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, Animated, Easing, ScrollView } from 'react-native';
import {
  Canvas, Picture, createPicture, Skia,
  PaintStyle, StrokeCap, TileMode, BlurStyle, BlendMode, ClipOp,
} from '@shopify/react-native-skia';
import { PV_BOARD, PIVOT_LEVELS } from './levels';
import { pvStep } from './physics';
import { PV_STORY_P, PV_MOTIF } from './story';
import { T } from '../components/typography';
import { rgba } from '../utils/color';

const nowMs = () => (global.performance && performance.now ? performance.now() : Date.now());
const col = (s) => Skia.Color(s);
function pvEase(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

// chapter tint mirrors pvChapterTint
function chapterTint(theme, levelId) {
  const i = Math.floor(((levelId || 1) - 1) / 30);
  return [theme.accent, theme.accent2, theme.target, theme.gold][i % 4];
}

// Simulate one launch; optionally record path + per-target hit step + bounce steps.
function pvStorySim(level, angleDeg, B, record) {
  const a = (angleDeg * Math.PI) / 180, sp = level.speed;
  const b = { x: level.ball.x, y: level.ball.y, vx: sp * Math.cos(a), vy: -sp * Math.sin(a) };
  const tg = level.targets.map((t) => ({ x: t.x, y: t.y, r: B.targetR, hit: false }));
  const pos = record ? [[b.x, b.y]] : null;
  const hitStep = record ? level.targets.map(() => null) : null;
  const bounces = record ? [] : null;
  let nB = 0, pvx = b.vx, pvy = b.vy;
  for (let s = 0; s < 720; s++) {
    pvStep(b, tg, level.walls, B, PV_STORY_P, 1 / 60);
    const flip = Math.sign(b.vx) !== Math.sign(pvx) || Math.sign(b.vy) !== Math.sign(pvy);
    if (flip) nB++;
    if (record) {
      pos.push([b.x, b.y]);
      if (flip) bounces.push(pos.length - 1);
      tg.forEach((t, i) => { if (t.hit && hitStep[i] == null) hitStep[i] = pos.length - 1; });
    }
    pvx = b.vx; pvy = b.vy;
    if (tg.every((t) => t.hit)) return { win: true, pos, hitStep, bounces, nB };
    const v = Math.hypot(b.vx, b.vy);
    if (v < 6 && b.y > B.h - 30) break;
  }
  return { win: tg.every((t) => t.hit), pos, hitStep, bounces, nB };
}
function pvStorySolve(level, B) {
  let bestAngle = null, bestB = -1;
  for (let aDeg = 8; aDeg <= 172; aDeg += 2) {
    const r = pvStorySim(level, aDeg, B, false);
    if (r.win) { if (r.nB > bestB) { bestB = r.nB; bestAngle = aDeg; } if (r.nB >= 4) break; }
  }
  if (bestAngle == null) return null;
  return pvStorySim(level, bestAngle, B, true);
}

export default function StoryCutscene({ theme, scene, sound = true, onDone }) {
  const data = scene;
  const B = PV_BOARD;
  const M = PV_MOTIF[data.motif] || PV_MOTIF.drift;
  const level = PIVOT_LEVELS[(data.levelId || 1) - 1];
  const tint = chapterTint(theme, data.levelId);

  const [, setFrame] = useState(0);
  const stateRef = useRef(null);     // { traj, sparks, bloomed, start, ... }
  const closeRef = useRef(false);
  const [closing, setClosing] = useState(false);
  const mounted = useRef(new Animated.Value(0)).current;
  const [bars, setBars] = useState(0);

  // entrance: letterbox bars in, canvas fade/scale up
  useEffect(() => {
    setBars(30);
    Animated.timing(mounted, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [mounted]);

  const finish = () => {
    if (closeRef.current) return;
    closeRef.current = true;
    setClosing(true);
    setBars(0);
    setTimeout(() => onDone && onDone(), 560);
  };

  // build the trajectory once, then run an rAF clock
  useEffect(() => {
    const traj =
      pvStorySolve(level, B) ||
      { pos: [[level.ball.x, level.ball.y], [level.ball.x, 80]], hitStep: level.targets.map(() => null), bounces: [] };
    stateRef.current = {
      traj,
      N: traj.pos.length,
      hitStep: traj.hitStep || [],
      bounceSet: new Set(traj.bounces || []),
      sparks: [],
      bloomed: new Set(),
      start: null,
      prevIdx: 0,
      shakeE: 0,
      flashE: 0,
      flashTimer: 0.8 + Math.random(),
    };
    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      setFrame((f) => (f + 1) % 1000000);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [level, B]);

  const picture = createPicture((cv) => {
    const st = stateRef.current; if (!st) return;
    const ts = nowMs();
    if (st.start == null) st.start = ts;
    const dt = 0.016;
    const Tm = (ts - st.start) / 1000;
    const { traj, N, hitStep, bounceSet } = st;
    const pos = traj.pos;

    const igniteDur = 0.6, playDur = Math.min(3.8, Math.max(1.8, N / 60));
    const tp = Tm < igniteDur ? 0 : Math.min(1, (Tm - igniteDur) / playDur);
    const curIdx = Math.floor(tp * (N - 1));
    const tip = pos[Math.max(0, Math.min(N - 1, curIdx))];

    for (let i = st.prevIdx + 1; i <= curIdx; i++) if (bounceSet.has(i)) st.shakeE = 1;
    st.prevIdx = curIdx;
    st.shakeE *= 0.86; st.flashE *= 0.82;
    if (M.flash) { st.flashTimer -= dt; if (st.flashTimer <= 0) { st.flashE = 1; st.flashTimer = 0.5 + Math.random() * 1.1; } }

    const stroke = (c, w, round) => { const p = Skia.Paint(); p.setStyle(PaintStyle.Stroke); p.setColor(col(c)); p.setStrokeWidth(w); if (round) p.setStrokeCap(StrokeCap.Round); return p; };
    const fill = (c) => { const p = Skia.Paint(); p.setColor(col(c)); return p; };

    // ── camera ──
    const zoom = M.z0 + (M.z1 - M.z0) * pvEase(tp);
    const rot = (M.spin ? M.spin * Tm : M.rot * pvEase(tp));
    let fx = B.w / 2, fy = B.h / 2;
    if (M.follow) { fx = B.w / 2 + (tip[0] - B.w / 2) * M.follow; fy = B.h / 2 + (tip[1] - B.h / 2) * M.follow; }
    fx = Math.max(110, Math.min(B.w - 110, fx)); fy = Math.max(150, Math.min(B.h - 150, fy));
    const shX = st.shakeE * M.shake * (Math.random() - 0.5) * 16, shY = st.shakeE * M.shake * (Math.random() - 0.5) * 16;

    cv.save();
    cv.clipRect(Skia.XYWHRect(0, 0, B.w, B.h), ClipOp.Intersect, true);
    cv.translate(B.w / 2 + shX, B.h / 2 + shY);
    cv.scale(zoom, zoom); cv.rotate((rot * 180) / Math.PI, 0, 0);
    cv.translate(-fx, -fy);

    // grid (extended so rotate/zoom-out keeps a floor)
    const gp = stroke(theme.grid, 0.8);
    for (let gx = -120; gx < B.w + 120; gx += 40) cv.drawLine(gx, -120, gx, B.h + 120, gp);
    for (let gy = -120; gy < B.h + 120; gy += 40) cv.drawLine(-120, gy, B.w + 120, gy, gp);

    // walls
    const wAlpha = Math.max(0, Math.min(1, (Tm - 0.15) / 0.7));
    if (wAlpha > 0) {
      for (const w of level.walls || []) {
        const sp = stroke(theme.wallSide, 9, true); sp.setAlphaf((M.vig > 0.6 ? 0.5 : 1) * wAlpha);
        cv.drawLine(w.x1, w.y1 + 3.5, w.x2, w.y2 + 3.5, sp);
        const top = stroke(theme.wallTop, 9, true); top.setAlphaf((M.vig > 0.6 ? 0.55 : 1) * wAlpha);
        top.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, 4, false));
        cv.drawLine(w.x1, w.y1, w.x2, w.y2, top);
      }
    }

    // targets + bloom spawns
    (level.targets || []).forEach((t, i) => {
      const isHit = hitStep[i] != null && curIdx >= hitStep[i];
      if (isHit && !st.bloomed.has(i)) {
        st.bloomed.add(i);
        const n = M.supernova ? 34 : 18;
        for (let k = 0; k < n; k++) {
          const a = (k / n) * 7;
          st.sparks.push({ x: t.x, y: t.y, vx: Math.cos(a) * (50 + Math.random() * 80), vy: Math.sin(a) * (50 + Math.random() * 80), life: 1 });
        }
      }
      const c = isHit ? theme.targetHit : theme.target;
      const pulse = 0.5 + 0.5 * Math.sin(Tm * 3 + i);
      const rp = stroke(c, 3, false); rp.setAlphaf(0.9);
      rp.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, 6 + pulse * 4, false));
      cv.drawCircle(t.x, t.y, B.targetR, rp);
      if (isHit) cv.drawCircle(t.x, t.y, B.targetR * 0.5, fill(c));
    });

    // ignite rings
    if (Tm < igniteDur + 0.4) {
      const ip = Math.min(1, Tm / igniteDur);
      const ir = stroke(theme.accent, 2); ir.setAlphaf((1 - ip) * 0.85);
      cv.drawCircle(pos[0][0], pos[0][1], 5 + ip * 40, ir);
    }

    // trail
    const trailStart = Math.max(0, curIdx - 42);
    for (let i = trailStart + 1; i <= curIdx; i++) {
      const al = (i - trailStart) / 42;
      const tpn = stroke(theme.accent, 5 * al, true); tpn.setAlphaf(al * 0.6);
      cv.drawLine(pos[i - 1][0], pos[i - 1][1], pos[i][0], pos[i][1], tpn);
    }

    // ball (+ chromatic split for fracture/tempest)
    const R = B.ballR || 8.5, igA = Math.min(1, Tm / (igniteDur * 0.6));
    const orb = (cx, cy, c, alpha) => {
      const p = Skia.Paint(); p.setAlphaf(alpha);
      p.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, 9, false));
      p.setColor(col(c)); cv.drawCircle(cx, cy, R * 0.7, p);
      const g = Skia.Paint(); g.setAlphaf(alpha);
      g.setShader(Skia.Shader.MakeRadialGradient({ x: cx - R * 0.3, y: cy - R * 0.35 }, R, [col('#FFFFFF'), col(c), col(rgba(c, 0))], [0, 0.5, 1], TileMode.Clamp));
      cv.drawCircle(cx, cy, R, g);
    };
    if (M.chroma) {
      const d = M.chroma * (2 + st.shakeE * 4 + (M.flash ? st.flashE * 5 : 0));
      orb(tip[0] - d, tip[1], '#FF2D6B', igA * 0.7);
      orb(tip[0] + d, tip[1], '#2D8BFF', igA * 0.7);
    }
    orb(tip[0], tip[1], theme.accent, igA);

    // bloom particles
    for (let i = st.sparks.length - 1; i >= 0; i--) {
      const sp = st.sparks[i]; sp.life -= 0.016; if (sp.life <= 0) { st.sparks.splice(i, 1); continue; }
      sp.x += sp.vx * 0.016; sp.y += sp.vy * 0.016; sp.vx *= 0.96; sp.vy *= 0.96;
      const p = fill(theme.targetHit); p.setAlphaf(sp.life * 0.9);
      cv.drawCircle(sp.x, sp.y, 2.4 * sp.life + 0.6, p);
    }
    cv.restore(); // end camera

    // ── screen-space overlays ──
    if (M.scan) {
      const p = fill(theme.ink); p.setAlphaf(0.06);
      for (let y = 0; y < B.h; y += 4) cv.drawRect(Skia.XYWHRect(0, y, B.w, 1), p);
    }
    // colour grade (chapter tint)
    if (M.tintA) {
      const p = Skia.Paint(); p.setAlphaf(M.tintA);
      p.setBlendMode(theme.dark ? BlendMode.Screen : BlendMode.Multiply);
      p.setShader(Skia.Shader.MakeRadialGradient({ x: B.w / 2, y: B.h * 0.42 }, B.h * 0.7, [col(tint), col(rgba(tint, 0))], [0, 1], TileMode.Clamp));
      cv.drawRect(Skia.XYWHRect(0, 0, B.w, B.h), p);
    }
    // vignette
    const vg = Skia.Paint();
    vg.setShader(Skia.Shader.MakeRadialGradient({ x: B.w / 2, y: B.h / 2 }, B.h * 0.72, [col('rgba(0,0,0,0)'), col(rgba(theme.void0, M.vig))], [0.44, 1], TileMode.Clamp));
    cv.drawRect(Skia.XYWHRect(0, 0, B.w, B.h), vg);
    // flash (tempest / supernova bloom near end)
    let fl = st.flashE * 0.5;
    if (M.supernova && tp > 0.96) fl = Math.max(fl, ((tp - 0.96) / 0.04) * 0.9);
    if (fl > 0.01) cv.drawRect(Skia.XYWHRect(0, 0, B.w, B.h), fill(`rgba(255,255,255,${fl})`));
  });

  // staged narration reveal values
  const lineAnims = useRef((data.lines || []).map(() => new Animated.Value(0))).current;
  const codaAnim = useRef(new Animated.Value(0)).current;
  const eyebrowAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const mk = (v, delay) => Animated.timing(v, { toValue: 1, duration: 750, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    const anims = [mk(eyebrowAnim, 250), mk(titleAnim, 450)];
    (data.lines || []).forEach((_, i) => anims.push(mk(lineAnims[i], 850 + i * 700)));
    if (data.coda) anims.push(mk(codaAnim, 850 + (data.lines || []).length * 700 + 200));
    anims.push(mk(ctaAnim, 1000 + (data.lines || []).length * 700));
    Animated.parallel(anims).start();
  }, []);

  const reveal = (v) => ({ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] });

  return (
    <View
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 60,
        backgroundColor: theme.void0, opacity: closing ? 0 : 1,
      }}
    >
      {/* letterbox bars */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: bars, backgroundColor: '#000', zIndex: 2 }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: bars, backgroundColor: '#000', zIndex: 2 }} />

      <Pressable onPress={finish} style={{ position: 'absolute', top: bars + 12, right: 18, zIndex: 3 }}>
        <Text style={[T.mono, { color: theme.ink3, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' }]}>Skip ›</Text>
      </Pressable>

      {/* scrollable so the scene never clips on shorter screens */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, paddingTop: bars + 44, paddingBottom: bars + 30 }}
        showsVerticalScrollIndicator={false}
      >
      <Animated.View
        style={{
          width: '100%', maxWidth: 210, aspectRatio: B.w / B.h,
          opacity: mounted,
          transform: [{ scale: mounted.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }],
        }}
      >
        <Canvas style={{ flex: 1 }}>
          <Picture picture={picture} />
        </Canvas>
      </Animated.View>

      <View style={{ alignItems: 'center', marginTop: 16, maxWidth: 304 }}>
        <Animated.Text style={[T.eyebrow, { color: tint, fontSize: 10 }, reveal(eyebrowAnim)]}>{data.eyebrow}</Animated.Text>
        <Animated.Text style={[T.displayBold, { color: theme.ink, fontSize: 30, marginTop: 8, textAlign: 'center' }, reveal(titleAnim)]}>{data.title}</Animated.Text>
        {(data.lines || []).map((ln, i) => (
          <Animated.Text key={i} style={[T.sans, { color: theme.ink2, fontSize: 13.5, lineHeight: 21, marginTop: i === 0 ? 13 : 7, textAlign: 'center' }, reveal(lineAnims[i])]}>
            {ln}
          </Animated.Text>
        ))}
        {data.coda && (
          <Animated.Text style={[T.sans, { color: theme.ink3, fontStyle: 'italic', fontSize: 12.5, lineHeight: 19, marginTop: 12, textAlign: 'center' }, reveal(codaAnim)]}>
            {data.coda}
          </Animated.Text>
        )}
      </View>

      <Animated.View style={[{ marginTop: 22 }, reveal(ctaAnim)]}>
        <Pressable
          onPress={finish}
          style={{ paddingVertical: 12, paddingHorizontal: 32, borderRadius: 13, backgroundColor: tint }}
        >
          <Text style={[T.display, { color: theme.dark ? '#06231F' : '#fff', fontSize: 14 }]}>{data.cta || 'Continue'}</Text>
        </Pressable>
      </Animated.View>
      </ScrollView>
    </View>
  );
}
