// Paywall.js — the Pivot Pro unlock sheet (custom RevenueCat-style). The App
// wires onPurchase/onRestore to the IAP layer. Ported 1:1 from the design.

import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import Glass from '../components/Glass';
import { PvIcon } from '../components/Icons';
import { T } from '../components/typography';
import { PRO_FALLBACK_PRICE } from '../config';

function Feature({ theme, children }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 6 }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: theme.accent + '22', alignItems: 'center', justifyContent: 'center' }}>
        {PvIcon.check(theme.accent, 13)}
      </View>
      <Text style={[T.sans, { color: theme.ink, fontSize: 13.5 }]}>{children}</Text>
    </View>
  );
}

export default function Paywall({ theme, onClose, onPurchase, onRestore, price = PRO_FALLBACK_PRICE }) {
  const up = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(up, { toValue: 1, duration: 420, easing: Easing.bezier(0.7, 0, 0.2, 1), useNativeDriver: true }),
    ]).start();
  }, [up, fade]);
  const translateY = up.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 70, justifyContent: 'flex-end' }}>
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', opacity: fade }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View style={{ margin: 8, borderRadius: 26, overflow: 'hidden', backgroundColor: theme.void1, borderWidth: 1, borderColor: theme.hair, transform: [{ translateY }] }}>
        <Pressable onPress={onClose} style={{ position: 'absolute', top: 14, right: 14, zIndex: 2, backgroundColor: theme.glassDk, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.ink2, fontSize: 16 }}>×</Text>
        </Pressable>
        <View style={{ padding: 22, paddingTop: 26 }}>
          <View style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: theme.gold + '22', borderWidth: 1, borderColor: theme.gold + '55', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            {PvIcon.crown(theme.gold, 30)}
          </View>
          <Text style={[T.eyebrow, { color: theme.gold, fontSize: 10 }]}>Pivot Pro</Text>
          <Text style={[T.displayBold, { color: theme.ink, fontSize: 26, marginTop: 7 }]}>Unlock all 300 levels</Text>
          <Text style={[T.sans, { color: theme.ink2, fontSize: 13, marginTop: 6, lineHeight: 20 }]}>Chapter 1 is on the house. Go Pro for the other 9 chapters — and every cinematic story along the way.</Text>
          <View style={{ marginVertical: 17 }}>
            <Feature theme={theme}>All 300 handcrafted levels</Feature>
            <Feature theme={theme}>10 cinematic story chapters</Feature>
            <Feature theme={theme}>One-time purchase — no subscription</Feature>
          </View>
          <Pressable onPress={onPurchase} style={{ paddingVertical: 15, borderRadius: 14, backgroundColor: theme.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Text style={[T.displayBold, { color: theme.dark ? '#221603' : '#fff', fontSize: 15.5 }]}>Unlock Everything</Text>
            <Text style={[T.display, { color: theme.dark ? '#221603' : '#fff', fontSize: 15.5, opacity: 0.85 }]}>· {price}</Text>
          </Pressable>
          <Pressable onPress={onRestore} style={{ marginTop: 10, paddingVertical: 8, alignItems: 'center' }}>
            <Text style={[T.sansSemi, { color: theme.ink2, fontSize: 12.5 }]}>Restore purchase</Text>
          </Pressable>
          <Text style={[T.mono, { textAlign: 'center', color: theme.ink3, fontSize: 8.5, marginTop: 10, letterSpacing: 1.5 }]}>SECURE PURCHASE · POWERED BY REVENUECAT</Text>
        </View>
      </Animated.View>
    </View>
  );
}
