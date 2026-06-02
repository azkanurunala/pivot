// CosmeticsScreen.js — the Shop: Pivot Pro unlock, the Trajectory Guide
// feature, and a grid of ball skins (owned → equip, locked → buy). Ported 1:1.

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Glass, { Chip } from '../components/Glass';
import ScreenHead from '../components/ScreenHead';
import SkinOrb from '../components/SkinOrb';
import { PvIcon } from '../components/Icons';
import { T } from '../components/typography';

export default function CosmeticsScreen({ theme, skins, ownedSkins, currentSkin, onSelect, onBuy, guideOwned, onBuyGuide, proUnlocked, onUnlockPro }) {
  const onGold = theme.dark ? '#221603' : '#fff';
  const onAcc = theme.dark ? '#05221E' : '#fff';

  return (
    <View style={{ paddingBottom: 24 }}>
      <ScreenHead theme={theme} eyebrow="Pro unlock · Cosmetics" title="Shop" />
      <View style={{ paddingHorizontal: 22 }}>
        {/* Pivot Pro */}
        <Glass theme={theme} radius={20} pad={16} style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', gap: 13, alignItems: 'center' }}>
            <View style={{ width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.gold + '22', borderWidth: 1, borderColor: theme.gold + '55' }}>
              {PvIcon.crown(theme.gold, 26)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[T.sansBold, { color: theme.ink, fontSize: 15 }]}>Pivot Pro</Text>
              <Text style={[T.sans, { color: theme.ink2, fontSize: 12, marginTop: 2 }]}>Unlock all 300 levels & every story chapter.</Text>
            </View>
            <Pressable onPress={() => !proUnlocked && onUnlockPro && onUnlockPro()} style={{ borderRadius: 10, paddingVertical: 9, paddingHorizontal: 13, backgroundColor: proUnlocked ? theme.success + '22' : theme.gold }}>
              <Text style={[T.monoSemi, { fontSize: 11, letterSpacing: 0.5, color: proUnlocked ? theme.success : onGold }]}>{proUnlocked ? 'OWNED' : '$4.99'}</Text>
            </Pressable>
          </View>
        </Glass>

        {/* Trajectory guide */}
        <Glass theme={theme} radius={18} pad={16} style={{ marginBottom: 18 }} innerStyle={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <View style={{ width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.accent + '1F', borderWidth: 1, borderColor: theme.accent + '44' }}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M3 19c4-1 6-4 8-9s4-6 8-7" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3.4" /></Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[T.sansBold, { color: theme.ink, fontSize: 15 }]}>Trajectory Guide</Text>
            <Text style={[T.sans, { color: theme.ink2, fontSize: 12, marginTop: 2 }]}>Shows a ghost path before launch. Toggle it in Settings.</Text>
          </View>
          <Pressable onPress={() => !guideOwned && onBuyGuide()} style={{ borderRadius: 10, paddingVertical: 9, paddingHorizontal: 13, backgroundColor: guideOwned ? theme.success + '22' : theme.accent }}>
            <Text style={[T.monoSemi, { fontSize: 11, letterSpacing: 0.5, color: guideOwned ? theme.success : onAcc }]}>{guideOwned ? 'OWNED' : '$0.99'}</Text>
          </Pressable>
        </Glass>

        <Text style={[T.eyebrow, { color: theme.ink3, paddingHorizontal: 4, paddingBottom: 12, fontSize: 10 }]}>Ball Skins</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {Object.entries(skins).map(([key, sk]) => {
            const owned = ownedSkins.includes(key);
            const active = currentSkin === key;
            return (
              <Glass
                key={key}
                theme={theme}
                radius={18}
                pad={14}
                tone={active ? 'hi' : 'base'}
                onPress={() => (owned ? onSelect(key) : onBuy(key))}
                style={{ width: '47%', flexGrow: 1 }}
                innerStyle={{ borderColor: active ? theme.accent + '88' : theme.hair }}
              >
                {sk.seasonal && <Text style={[T.eyebrow, { position: 'absolute', top: 10, right: 12, color: theme.gold, fontSize: 8 }]}>Seasonal</Text>}
                <View style={{ alignItems: 'center', paddingTop: 6, paddingBottom: 10 }}><SkinOrb skin={sk} /></View>
                <Text style={[T.sansBold, { color: theme.ink, fontSize: 14, textAlign: 'center' }]}>{sk.name}</Text>
                <View style={{ alignItems: 'center', marginTop: 8 }}>
                  {active ? <Chip theme={theme} color={theme.accent}>Equipped</Chip> : owned ? <Chip theme={theme} color={theme.ink3}>Tap to equip</Chip> : <Chip theme={theme} color={theme.gold}>${sk.price.toFixed(2)}</Chip>}
                </View>
              </Glass>
            );
          })}
        </View>
      </View>
    </View>
  );
}
