// DailyScreen.js — the procedural daily board. Your run is recorded locally and
// submitted to Game Center (fewest bounces wins); global ranks open in the native
// Game Center UI. Resets at midnight. No fabricated competitors.

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Glass, { Chip } from '../components/Glass';
import ScreenHead from '../components/ScreenHead';
import { PvIcon } from '../components/Icons';
import { T } from '../components/typography';

export default function DailyScreen({ theme, daily, dailyResult, onPlay, unlocked, onOpenLeaderboard }) {
  const now = new Date();
  const ms = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
  const hrs = Math.floor(ms / 3.6e6), mins = Math.floor((ms % 3.6e6) / 6e4);
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

        <Text style={[T.eyebrow, { color: theme.ink3, paddingHorizontal: 4, paddingBottom: 10, fontSize: 10 }]}>Your run</Text>
        <Glass theme={theme} radius={18} pad={16}>
          {dailyResult ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.accent + '1F', borderWidth: 1, borderColor: theme.accent + '44' }}>
                {PvIcon.daily(theme.accent, 20)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[T.sansBold, { color: theme.ink, fontSize: 14 }]}>Today — solved</Text>
                <Text style={[T.sans, { color: theme.ink3, fontSize: 11.5, marginTop: 1 }]}>Submitted to Game Center</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[T.num, { color: theme.accent, fontSize: 18 }]}>{dailyResult.bounces}<Text style={{ color: theme.ink3, fontSize: 12 }}>b</Text></Text>
                <Text style={[T.mono, { color: theme.ink3, fontSize: 10 }]}>{dailyResult.angle}°</Text>
              </View>
            </View>
          ) : (
            <Text style={[T.sans, { color: theme.ink2, fontSize: 13, textAlign: 'center', paddingVertical: 6 }]}>No run yet today — play the board to set your score.</Text>
          )}
        </Glass>

        <Pressable onPress={() => onOpenLeaderboard && onOpenLeaderboard()} style={{ marginTop: 12, borderRadius: 14, paddingVertical: 13, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glass }}>
          {PvIcon.crown(theme.gold, 16)}
          <Text style={[T.sansSemi, { color: theme.ink, fontSize: 13 }]}>View global ranks in Game Center</Text>
        </Pressable>
        <Text style={[T.mono, { color: theme.ink3, fontSize: 9.5, textAlign: 'center', marginTop: 10, letterSpacing: 0.5 }]}>RANKED BY FEWEST BOUNCES · iOS GAME CENTER</Text>
      </View>
    </View>
  );
}
