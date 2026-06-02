// TitleScreen.js — the boot screen: floating orb, wordmark, tagline, and a
// pulsing "Tap to play". Tapping enters the app (and the intro cutscene on
// first launch). Ported 1:1 from the design.

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SkinOrb from '../components/SkinOrb';
import Float, { Pulse } from '../components/Float';
import { T } from '../components/typography';
import { rgba } from '../utils/color';

export default function TitleScreen({ theme, skin, onEnter }) {
  const onAcc = theme.dark ? '#05221E' : '#fff';
  return (
    <Pressable onPress={onEnter} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      {/* scrim: dim the levels behind so the title reads clearly */}
      <LinearGradient
        colors={[rgba(theme.void0, 0.4), rgba(theme.void0, 0.24), rgba(theme.void1, 0.08)]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0.05 }}
        end={{ x: 0.5, y: 0.85 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Float amount={6} style={{ marginBottom: 30 }}>
        <SkinOrb skin={skin} size={104} />
      </Float>
      <Text style={[T.displayBold, { color: theme.ink, fontSize: 64, letterSpacing: -2, lineHeight: 64 }]}>Pivot</Text>
      <Text style={[T.sans, { color: theme.ink2, fontSize: 15, marginTop: 16, maxWidth: 230, lineHeight: 22, textAlign: 'center' }]}>
        One swipe. Infinite depth.{'\n'}Master the angle.
      </Text>
      <Pulse style={{ marginTop: 40 }}>
        <View style={{ paddingVertical: 13, paddingHorizontal: 30, borderRadius: 14, backgroundColor: theme.accent }}>
          <Text style={[T.display, { color: onAcc, fontSize: 16 }]}>Tap to play</Text>
        </View>
      </Pulse>
    </Pressable>
  );
}
