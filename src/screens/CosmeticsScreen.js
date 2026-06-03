// CosmeticsScreen.js — the Shop. Single-package model: Pivot Pro is the ONE
// purchase that unlocks every ball skin + the Trajectory Guide (and, in play,
// the hints). Free players get only the Cyan Core skin. Nothing is sold
// individually — every locked item opens the Pivot Pro paywall.

import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Glass, { Chip } from '../components/Glass';
import ScreenHead from '../components/ScreenHead';
import SkinOrb from '../components/SkinOrb';
import { PvIcon } from '../components/Icons';
import { T } from '../components/typography';
import { PRO_FALLBACK_PRICE } from '../config';

export default function CosmeticsScreen({ theme, skins, ownedSkins, currentSkin, onSelect, onBuy, guideOwned, onBuyGuide, proUnlocked, onUnlockPro, price = PRO_FALLBACK_PRICE }) {
  const onGold = theme.dark ? '#221603' : '#fff';
  const { width } = useWindowDimensions();
  const cols = Math.max(2, Math.floor(width / 210));      // 2 on phones, more on iPad
  const colW = `${100 / cols - 2}%`;

  return (
    <View style={{ paddingBottom: 24 }}>
      <ScreenHead theme={theme} eyebrow="One unlock · Everything" title="Shop" />
      <View style={{ paddingHorizontal: 22 }}>
        {/* Pivot Pro — the single package */}
        <Glass theme={theme} radius={20} pad={16} style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', gap: 13, alignItems: 'center' }}>
            <View style={{ width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.gold + '22', borderWidth: 1, borderColor: theme.gold + '55' }}>
              {PvIcon.crown(theme.gold, 26)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[T.sansBold, { color: theme.ink, fontSize: 15 }]}>Pivot Pro</Text>
              <Text style={[T.sans, { color: theme.ink2, fontSize: 12, marginTop: 2 }]}>All 300 levels, every skin, the trajectory guide & hints.</Text>
            </View>
            <Pressable onPress={() => !proUnlocked && onUnlockPro && onUnlockPro()} style={{ borderRadius: 10, paddingVertical: 9, paddingHorizontal: 13, backgroundColor: proUnlocked ? theme.success + '22' : theme.gold }}>
              <Text style={[T.monoSemi, { fontSize: 11, letterSpacing: 0.5, color: proUnlocked ? theme.success : onGold }]}>{proUnlocked ? 'OWNED' : price}</Text>
            </Pressable>
          </View>
        </Glass>

        {/* Trajectory guide — included with Pro */}
        <Glass theme={theme} radius={18} pad={16} style={{ marginBottom: 18 }} innerStyle={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <View style={{ width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.accent + '1F', borderWidth: 1, borderColor: theme.accent + '44' }}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M3 19c4-1 6-4 8-9s4-6 8-7" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3.4" /></Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[T.sansBold, { color: theme.ink, fontSize: 15 }]}>Trajectory Guide</Text>
            <Text style={[T.sans, { color: theme.ink2, fontSize: 12, marginTop: 2 }]}>Ghost path before launch{guideOwned ? '. Toggle it in Settings.' : ' — included with Pivot Pro.'}</Text>
          </View>
          {guideOwned ? (
            <View style={{ borderRadius: 10, paddingVertical: 9, paddingHorizontal: 13, backgroundColor: theme.success + '22' }}>
              <Text style={[T.monoSemi, { fontSize: 11, letterSpacing: 0.5, color: theme.success }]}>INCLUDED</Text>
            </View>
          ) : (
            <Pressable onPress={() => onBuyGuide && onBuyGuide()} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: theme.gold }}>
              {PvIcon.crown(onGold, 12)}
              <Text style={[T.monoSemi, { fontSize: 11, letterSpacing: 0.5, color: onGold }]}>PRO</Text>
            </Pressable>
          )}
        </Glass>

        <Text style={[T.eyebrow, { color: theme.ink3, paddingHorizontal: 4, paddingBottom: 12, fontSize: 10 }]}>Ball Skins</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {Object.entries(skins).map(([key, sk]) => {
            const owned = ownedSkins.includes(key);
            const active = currentSkin === key && owned;
            return (
              <Glass
                key={key}
                theme={theme}
                radius={18}
                pad={14}
                tone={active ? 'hi' : 'base'}
                onPress={() => (owned ? onSelect(key) : onBuy(key))}
                style={{ width: colW, flexGrow: 1 }}
                innerStyle={{ borderColor: active ? theme.accent + '88' : theme.hair }}
              >
                {!owned && (
                  <View style={{ position: 'absolute', top: 10, right: 12, zIndex: 2 }}>{PvIcon.lock(theme.gold, 13)}</View>
                )}
                <View style={{ alignItems: 'center', paddingTop: 6, paddingBottom: 10, opacity: owned ? 1 : 0.5 }}><SkinOrb skin={sk} /></View>
                <Text style={[T.sansBold, { color: theme.ink, fontSize: 14, textAlign: 'center' }]}>{sk.name}</Text>
                <View style={{ alignItems: 'center', marginTop: 8 }}>
                  {active ? <Chip theme={theme} color={theme.accent}>Equipped</Chip>
                    : owned ? <Chip theme={theme} color={theme.ink3}>Tap to equip</Chip>
                    : <Chip theme={theme} color={theme.gold}>Pivot Pro</Chip>}
                </View>
              </Glass>
            );
          })}
        </View>
      </View>
    </View>
  );
}
