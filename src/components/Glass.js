// Glass.js — the frosted-glass panel that every card/sheet is built from.
// Recipe (ported from the design): a real BlurView behind, a semi-transparent
// tint on top, a 1px hairline border, big radius, and a soft lifting shadow.

import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { T } from './typography';

export default function Glass({
  theme,
  tone = 'base',     // 'base' | 'hi' | 'dk'
  radius = 18,
  pad = 16,
  intensity,
  style,
  innerStyle,
  children,
  onPress,
  ...rest
}) {
  const bg = tone === 'hi' ? theme.glassHi : tone === 'dk' ? theme.glassDk : theme.glass;
  const b = intensity != null ? intensity : theme.glassBlur;
  const Wrapper = onPress ? Pressable : View;
  const shadow = theme.dark
    ? { shadowColor: '#000', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 8 }
    : { shadowColor: 'rgba(40,50,30,0.5)', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.24, shadowRadius: 20, elevation: 6 };

  return (
    <Wrapper onPress={onPress} style={[{ borderRadius: radius }, shadow, style]} {...rest}>
      <BlurView
        intensity={b}
        tint={theme.dark ? 'dark' : 'light'}
        style={[
          {
            borderRadius: radius,
            borderColor: theme.hair,
            backgroundColor: bg,
            padding: pad,
            overflow: 'hidden',
            borderWidth: 1,
          },
          innerStyle,
        ]}
      >
        {children}
      </BlurView>
    </Wrapper>
  );
}

// Pill chip — small uppercase mono label tinted with an accent color.
export function Chip({ theme, color, children, style }) {
  const c = color || theme.accent;
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          paddingVertical: 4,
          paddingHorizontal: 10,
          backgroundColor: c + '1F',
          borderWidth: 1,
          borderColor: c + '44',
          borderRadius: 999,
        },
        style,
      ]}
    >
      <ChipText color={c}>{children}</ChipText>
    </View>
  );
}

function ChipText({ color, children }) {
  const { Text } = require('react-native');
  return (
    <Text style={[T.monoSemi, { fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color }]}>
      {children}
    </Text>
  );
}
