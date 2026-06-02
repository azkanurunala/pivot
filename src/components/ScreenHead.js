// ScreenHead.js — shared list-screen header: a small mono eyebrow over a big
// display title, with optional right-side content. Ported 1:1.

import React from 'react';
import { View, Text } from 'react-native';
import { T } from './typography';

export default function ScreenHead({ theme, eyebrow, title, right }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 22,
        paddingTop: 4,
        paddingBottom: 14,
      }}
    >
      <View style={{ flexShrink: 1 }}>
        <Text style={[T.eyebrow, { color: theme.accent, marginBottom: 7, fontSize: 10 }]}>{eyebrow}</Text>
        <Text style={[T.display, { color: theme.ink, fontSize: 30, lineHeight: 32 }]}>{title}</Text>
      </View>
      {right}
    </View>
  );
}
