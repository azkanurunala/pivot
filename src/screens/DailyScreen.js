// DailyScreen.js — the procedural daily board + a local leaderboard ranked by
// fewest bounces. Resets at midnight. Ported 1:1 from the design.

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Glass, { Chip } from '../components/Glass';
import ScreenHead from '../components/ScreenHead';
import { T } from '../components/typography';

export default function DailyScreen({ theme, daily, dailyResult, onPlay, unlocked }) {
  const now = new Date();
  const ms = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
  const hrs = Math.floor(ms / 3.6e6), mins = Math.floor((ms % 3.6e6) / 6e4);
  const board = [
    { n: 'ricochet_kai', a: 71, b: 6, you: false },
    { n: 'anglemaster', a: 64, b: 7, you: false },
    { n: dailyResult ? 'you' : '—', a: dailyResult?.angle ?? '—', b: dailyResult?.bounces ?? '—', you: true },
    { n: 'looplord', a: 83, b: 9, you: false },
    { n: 'pivotpete', a: 58, b: 11, you: false },
  ].sort((x, y) => (typeof x.b === 'number' ? x.b : 99) - (typeof y.b === 'number' ? y.b : 99));
  const onAcc = theme.dark ? '#05221E' : '#fff';

  return (
    <View style={{ paddingBottom: 24 }}>
      <ScreenHead theme={theme} eyebrow="Procedural · Resets midnight" title="Daily" />
      <View style={{ paddingHorizontal: 22 }}>
        <Glass theme={theme} radius={22} pad={20} tone="hi" style={{ marginBottom: 16 }} innerStyle={{ overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Chip theme={theme} color={theme.accent2}>{daily.targets.length} targets</Chip>
              <Text style={[T.display, { color: theme.ink, fontSize: 24, marginTop: 12 }]}>Today's Board</Text>
              <Text style={[T.sans, { color: theme.ink2, fontSize: 13, marginTop: 4, maxWidth: 200 }]}>One unique layout. One run on the leaderboard. Fewest bounces wins.</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            <Pressable disabled={!unlocked} onPress={() => unlocked && onPlay(daily)} style={{ flex: 1, borderRadius: 13, paddingVertical: 14, alignItems: 'center', backgroundColor: unlocked ? theme.accent : theme.glassDk, opacity: unlocked ? 1 : 0.7 }}>
              <Text style={[T.display, { color: unlocked ? onAcc : theme.ink3, fontSize: 16 }]}>{dailyResult ? 'Play again' : 'Start run'}</Text>
            </Pressable>
            <View style={{ borderRadius: 13, paddingHorizontal: 16, justifyContent: 'center', backgroundColor: theme.glass, borderWidth: 1, borderColor: theme.hair }}>
              <Text style={[T.mono, { color: theme.ink3, fontSize: 9 }]}>RESETS IN</Text>
              <Text style={[T.num, { color: theme.ink, fontSize: 17 }]}>{hrs}h {mins}m</Text>
            </View>
          </View>
          {!unlocked && <Text style={[T.mono, { color: theme.gold, fontSize: 10, marginTop: 12 }]}>Unlocks after Level 5</Text>}
        </Glass>

        <Text style={[T.eyebrow, { color: theme.ink3, paddingHorizontal: 4, paddingBottom: 10, fontSize: 10 }]}>Leaderboard · Local</Text>
        <Glass theme={theme} radius={18} pad={6}>
          {board.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 12, borderBottomWidth: i < board.length - 1 ? 1 : 0, borderBottomColor: theme.hair2, backgroundColor: r.you ? theme.accent + '14' : 'transparent' }}>
              <Text style={[T.num, { width: 18, color: i === 0 ? theme.gold : theme.ink3, fontSize: 14 }]}>{i + 1}</Text>
              <Text style={[r.you ? T.sansBold : T.sans, { flex: 1, color: r.you ? theme.accent : theme.ink, fontSize: 14 }]}>{r.n}{r.you ? ' (you)' : ''}</Text>
              <Text style={[T.mono, { color: theme.ink3, fontSize: 11 }]}>{r.a}°</Text>
              <Text style={[T.num, { color: theme.ink2, fontSize: 14, width: 30, textAlign: 'right' }]}>{r.b}{typeof r.b === 'number' ? 'b' : ''}</Text>
            </View>
          ))}
        </Glass>
      </View>
    </View>
  );
}
