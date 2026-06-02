// PlayScreen.js — the level play surface: top HUD (targets / par), the floating
// glass arena slab hosting <PivotArena/>, the aim readout bar, and the win/miss
// result overlay (stars, par-relative copy, retry/next, and progressive hints
// after repeated misses). Ported 1:1 from the design.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle } from 'react-native-svg';
import PivotArena from '../game/PivotArena';
import Glass from '../components/Glass';
import { PvIcon, Star } from '../components/Icons';
import { T } from '../components/typography';
import { PV_BOARD } from '../game/levels';
import { pvSolveAngle } from '../game/physics';

const FAIL_THRESHOLD = 5;

export default function PlayScreen({ theme, level, skin, settings, onExit, onWinPersist, levels, onPlay, pro = false, onPaywall, topInset = 0, bottomInset = 0 }) {
  const [resetSignal, setResetSignal] = useState(0);
  const [result, setResult] = useState(null);
  const [angle, setAngle] = useState(58);
  const [hits, setHits] = useState(0);
  const [fails, setFails] = useState(0);
  const [hintArmed, setHintArmed] = useState(false);
  const [solveAngle, setSolveAngle] = useState(null);
  const total = level.targets.length;
  const savedRef = useRef(false);
  const usedHintRef = useRef(false);

  useEffect(() => {
    setResult(null); setHits(0); setFails(0); setHintArmed(false); setSolveAngle(null);
    savedRef.current = false; usedHintRef.current = false;
  }, [level]);

  const handleResult = useCallback((res) => {
    if (res.win) {
      const tagged = { ...res, hinted: usedHintRef.current };
      if (!savedRef.current) { savedRef.current = true; onWinPersist(level, tagged); }
      setResult(tagged); setHits(tagged.hits);
    } else {
      if (settings.sound) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setFails((f) => f + 1);
      setResult(res); setHits(res.hits);
    }
  }, [level, onWinPersist, settings.sound]);

  const retry = (withHint) => {
    if (withHint) { setHintArmed(true); usedHintRef.current = true; }
    setResult(null); setHits(0); savedRef.current = false; setResetSignal((s) => s + 1);
  };

  const playSettings = hintArmed ? { ...settings, guide: true } : settings;
  const nextLevel = () => {
    if (level.daily) { onExit(); return; }
    const idx = levels.findIndex((l) => l.id === level.id);
    if (idx >= 0 && idx + 1 < levels.length) onPlay(levels[idx + 1]);
    else onExit();
  };

  const minimal = settings.minimal;
  const win = result?.win;
  const rawStars = win ? (result.bounces <= level.par ? 3 : result.bounces <= level.par + 2 ? 2 : 1) : 0;
  const stars = result?.hinted ? Math.min(rawStars, 2) : rawStars;
  const onAcc = theme.dark ? '#05221E' : '#fff';

  const resultCopy = () => {
    if (result.hinted) return 'Solved with the line — third star stays locked.';
    const over = result.bounces - level.par;
    if (over <= 0) return 'Optimal line — right on par.';
    if (stars === 2) return over === 1 ? 'One over par. Trim a bounce for the third star.' : 'Two over par. Tighten the line for the third star.';
    return `${over} over par — find a cleaner line through.`;
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'column' }}>
      {/* top HUD */}
      {!minimal && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: topInset + 14, paddingHorizontal: 18, paddingBottom: 8, zIndex: 4 }}>
          <Pressable onPress={onExit}>
            <Glass theme={theme} pad={0} radius={12} innerStyle={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
              {PvIcon.back(theme.ink)}
            </Glass>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[T.eyebrow, { color: theme.accent, fontSize: 10 }]}>{level.daily ? 'Daily' : 'Level ' + level.id}</Text>
            <Text style={[T.display, { color: theme.ink, fontSize: 18 }]}>{level.name}</Text>
          </View>
          <Glass theme={theme} pad={0} radius={12} innerStyle={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 7, paddingHorizontal: 11 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[T.num, { color: theme.target, fontSize: 16 }]}>{hits}<Text style={{ color: theme.ink3, fontSize: 11 }}>/{total}</Text></Text>
              <Text style={[T.eyebrow, { color: theme.ink3, fontSize: 7, marginTop: 2 }]}>Targets</Text>
            </View>
            <View style={{ width: 1, height: 24, backgroundColor: theme.hair }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={[T.num, { color: theme.ink, fontSize: 16 }]}>{level.par}</Text>
              <Text style={[T.eyebrow, { color: theme.ink3, fontSize: 7, marginTop: 2 }]}>Par</Text>
            </View>
          </Glass>
        </View>
      )}

      {/* arena slab */}
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: minimal ? topInset + 16 : 4, paddingBottom: 8 }}>
        <View style={{ flex: 1, borderRadius: 26, overflow: 'hidden', borderWidth: 1, borderColor: theme.slabEdge, ...(theme.dark ? { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.55, shadowRadius: 30, elevation: 10 } : { shadowColor: 'rgba(40,50,30,0.6)', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 8 }) }}>
          <LinearGradient colors={[theme.slab0, theme.slab1]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <PivotArena theme={theme} level={level} skin={skin} settings={playSettings} resetSignal={resetSignal} onResult={handleResult} onAimChange={setAngle} paused={!!result} />
          {/* corner ticks for slab framing */}
          {[[1, 1], [-1, 1], [1, -1], [-1, -1]].map((c, i) => (
            <View
              key={i}
              pointerEvents="none"
              style={{
                position: 'absolute', width: 14, height: 14,
                [c[0] > 0 ? 'left' : 'right']: 12,
                [c[1] > 0 ? 'top' : 'bottom']: 12,
                borderTopWidth: c[1] > 0 ? 2 : 0, borderBottomWidth: c[1] < 0 ? 2 : 0,
                borderLeftWidth: c[0] > 0 ? 2 : 0, borderRightWidth: c[0] < 0 ? 2 : 0,
                borderColor: theme.accent + '55',
              }}
            />
          ))}
        </View>
      </View>

      {/* bottom aim bar */}
      {!result && (
        <View style={{ paddingHorizontal: 18, paddingBottom: bottomInset + 18, paddingTop: 4, zIndex: 4 }}>
          <Glass theme={theme} pad={0} radius={14} innerStyle={{ paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[T.sans, { color: theme.ink2, fontSize: 12 }]}>Drag the board to aim · release to launch</Text>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: theme.hair, marginTop: 8 }}>
                <View style={{ position: 'absolute', left: `${(angle / 180) * 100}%`, top: -3, marginLeft: -5.5, width: 11, height: 11, borderRadius: 999, backgroundColor: theme.accent }} />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[T.num, { color: theme.accent, fontSize: 22 }]}>{angle}°</Text>
              <Text style={[T.eyebrow, { color: theme.ink3, fontSize: 7, marginTop: 2 }]}>Angle</Text>
            </View>
          </Glass>
        </View>
      )}

      {/* result overlay */}
      {result && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, justifyContent: 'flex-end', backgroundColor: theme.dark ? 'rgba(6,9,14,0.55)' : 'rgba(255,255,255,0.35)' }}>
          <Glass theme={theme} tone="hi" radius={28} pad={24} style={{ margin: 14, marginBottom: bottomInset + 24 }} innerStyle={{ alignItems: 'center' }}>
            {win ? (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
                  {[0, 1, 2].map((i) => (
                    <Star key={i} filled={i < stars} color={theme.gold} hollow={theme.ink3} size={34} />
                  ))}
                </View>
                <Text style={[T.display, { color: theme.ink, fontSize: 28 }]}>Solved</Text>
                <Text style={[T.sans, { color: theme.ink2, fontSize: 13, marginTop: 4, textAlign: 'center' }]}>{resultCopy()}</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginVertical: 19, alignSelf: 'stretch' }}>
                  {[['Angle', result.angle + '°'], ['Bounces', result.bounces], ['Par', level.par]].map(([k, v]) => (
                    <View key={k} style={{ flex: 1, paddingVertical: 11, borderRadius: 13, backgroundColor: theme.glass, borderWidth: 1, borderColor: theme.hair, alignItems: 'center' }}>
                      <Text style={[T.num, { color: theme.ink, fontSize: 20 }]}>{v}</Text>
                      <Text style={[T.eyebrow, { color: theme.ink3, fontSize: 8, marginTop: 3 }]}>{k}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                <View style={{ width: 56, height: 56, marginBottom: 14, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.danger + '1F', borderWidth: 1, borderColor: theme.danger + '44' }}>
                  <Svg width="28" height="28" viewBox="0 0 24 24" fill="none"><Path d="M12 7v6M12 16.5v.5" stroke={theme.danger} strokeWidth="2.4" strokeLinecap="round" /></Svg>
                </View>
                <Text style={[T.display, { color: theme.ink, fontSize: 26 }]}>So close</Text>
                <Text style={[T.sans, { color: theme.ink2, fontSize: 13, marginTop: 4, textAlign: 'center' }]}>{result.hits}/{result.total} hit at {result.angle}°. Adjust the angle and try again.</Text>
              </>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: win ? 0 : 20, alignSelf: 'stretch' }}>
              <Pressable onPress={() => retry(false)} style={{ flex: win ? 1 : 2, borderWidth: 1, borderColor: theme.hair, borderRadius: 14, paddingVertical: 14, backgroundColor: theme.glass, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                {PvIcon.retry(theme.ink)}
                <Text style={[T.display, { color: theme.ink, fontSize: 15 }]}>Retry</Text>
              </Pressable>
              {win && (
                <Pressable onPress={nextLevel} style={{ flex: 1.4, borderRadius: 14, paddingVertical: 14, backgroundColor: theme.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <Text style={[T.display, { color: onAcc, fontSize: 15 }]}>{level.daily ? 'Done' : 'Next'}</Text>
                  {!level.daily && PvIcon.arrow(onAcc)}
                </Pressable>
              )}
            </View>

            {/* progressive hints — a Pivot Pro feature; free users get a paywall nudge */}
            {!win && fails >= FAIL_THRESHOLD && !pro && (
              <Pressable onPress={() => onPaywall && onPaywall()} style={{ marginTop: 10, alignSelf: 'stretch', borderWidth: 1, borderColor: theme.gold + '55', borderRadius: 14, paddingVertical: 12, backgroundColor: theme.gold + '14', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                {PvIcon.crown(theme.gold, 16)}
                <Text style={[T.display, { color: theme.ink, fontSize: 13.5 }]}>Unlock hints with Pivot Pro</Text>
              </Pressable>
            )}
            {!win && fails >= FAIL_THRESHOLD && pro && (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, alignSelf: 'stretch' }}>
                {!hintArmed && (
                  <Pressable onPress={() => retry(true)} style={{ flex: 1, borderWidth: 1, borderColor: theme.gold + '55', borderRadius: 14, paddingVertical: 12, backgroundColor: theme.gold + '14', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    <Svg width="17" height="17" viewBox="0 0 24 24" fill="none"><Path d="M4 18c5-9 11-9 16 0" stroke={theme.gold} strokeWidth="1.7" strokeLinecap="round" strokeDasharray="1.5 3" /></Svg>
                    <Text style={[T.display, { color: theme.ink, fontSize: 13.5 }]}>Show the path</Text>
                  </Pressable>
                )}
                {solveAngle == null ? (
                  <Pressable onPress={() => { usedHintRef.current = true; setSolveAngle(pvSolveAngle(level, PV_BOARD) ?? -1); }} style={{ flex: 1, borderWidth: 1, borderColor: theme.gold + '55', borderRadius: 14, paddingVertical: 12, backgroundColor: theme.gold + '14', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    <Svg width="17" height="17" viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="8.5" stroke={theme.gold} strokeWidth="1.7" /><Path d="M12 12l4-4M12 12v3" stroke={theme.gold} strokeWidth="1.7" strokeLinecap="round" /></Svg>
                    <Text style={[T.display, { color: theme.ink, fontSize: 13.5 }]}>Show the angle</Text>
                  </Pressable>
                ) : (
                  <View style={{ flex: 1, borderWidth: 1, borderColor: theme.gold, borderRadius: 14, paddingVertical: 12, backgroundColor: theme.gold + '22', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    <Text style={[T.sans, { fontSize: 11, color: theme.ink2 }]}>Aim</Text>
                    <Text style={[T.num, { fontSize: 19, color: theme.gold }]}>{solveAngle < 0 ? '—' : '~' + solveAngle + '°'}</Text>
                  </View>
                )}
              </View>
            )}
            {!win && fails >= FAIL_THRESHOLD - 2 && fails < FAIL_THRESHOLD && (
              <Text style={[T.sans, { marginTop: 10, textAlign: 'center', color: theme.ink3, fontSize: 11 }]}>
                {FAIL_THRESHOLD - fails} more {FAIL_THRESHOLD - fails === 1 ? 'miss' : 'misses'} unlocks a hint
              </Text>
            )}
          </Glass>
        </View>
      )}
    </View>
  );
}
