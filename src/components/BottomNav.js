// BottomNav.js — the glass tab bar (Levels / Daily / Shop / Settings).
// Same glass recipe as everything else, with the active tab tinted by accent.

import React from 'react';
import { View, Pressable, Text } from 'react-native';
import Glass from './Glass';
import { PvIcon } from './Icons';
import { T } from './typography';

const ITEMS = [
  ['levels', 'Levels', PvIcon.levels],
  ['daily', 'Daily', PvIcon.daily],
  ['shop', 'Shop', PvIcon.shop],
  ['settings', 'Settings', PvIcon.gear],
];

export default function BottomNav({ theme, tab, setTab, bottomInset = 0 }) {
  return (
    <View style={{ position: 'absolute', left: 12, right: 12, bottom: 12 + bottomInset, zIndex: 8 }}>
      <Glass theme={theme} pad={7} radius={22} tone="hi" innerStyle={{ flexDirection: 'row' }}>
        {ITEMS.map(([key, label, icon]) => {
          const on = tab === key;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={{
                flex: 1,
                backgroundColor: on ? theme.accent + '1F' : 'transparent',
                borderRadius: 15,
                paddingVertical: 9,
                alignItems: 'center',
                gap: 4,
              }}
            >
              {icon(on ? theme.accent : theme.ink3, 21)}
              <Text style={[on ? T.sansBold : T.sans, { fontSize: 9.5, color: on ? theme.accent : theme.ink3, letterSpacing: 0.2 }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </Glass>
    </View>
  );
}
