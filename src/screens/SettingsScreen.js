// SettingsScreen.js — gameplay toggles, the grouped theme picker (Dark/Light),
// minimal UI, redeem gift code, and reset. Ported 1:1 from the design.

import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Animated } from 'react-native';
import Glass from '../components/Glass';
import ScreenHead from '../components/ScreenHead';
import { T } from '../components/typography';
import { PIVOT_THEMES } from '../theme';

function SettingsRow({ theme, label, sub, control, last }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.hair2 }}>
      <View style={{ flex: 1 }}>
        <Text style={[T.sansSemi, { color: theme.ink, fontSize: 14 }]}>{label}</Text>
        {sub && <Text style={[T.sans, { color: theme.ink3, fontSize: 11.5, marginTop: 1 }]}>{sub}</Text>}
      </View>
      {control}
    </View>
  );
}

export function PvSwitch({ theme, on, onToggle }) {
  return (
    <Pressable onPress={onToggle} style={{ width: 46, height: 27, borderRadius: 999, backgroundColor: on ? theme.accent : theme.hair, justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 21, height: 21, borderRadius: 999, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 2 }} />
    </Pressable>
  );
}

function ThemePicker({ theme, current, onPick }) {
  const keys = Object.keys(PIVOT_THEMES);
  const Group = ({ title, ks }) => (
    <View style={{ marginBottom: 6 }}>
      <Text style={[T.eyebrow, { color: theme.ink3, fontSize: 8.5, marginHorizontal: 2, marginBottom: 9 }]}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        {ks.map((k) => {
          const tt = PIVOT_THEMES[k], sel = current === k;
          return (
            <Pressable key={k} onPress={() => onPick(k)} style={{ width: '22%', flexGrow: 1 }}>
              <View style={{ height: 44, borderRadius: 11, overflow: 'hidden', borderWidth: sel ? 2 : 1, borderColor: sel ? theme.accent : theme.hair, backgroundColor: tt.void0 }}>
                <View style={{ position: 'absolute', left: 8, bottom: 7, width: 9, height: 9, borderRadius: 999, backgroundColor: tt.accent }} />
                <View style={{ position: 'absolute', left: 19, bottom: 7, width: 8, height: 8, borderRadius: 999, backgroundColor: tt.target }} />
                <View style={{ position: 'absolute', left: 29, bottom: 8, width: 6, height: 6, borderRadius: 999, backgroundColor: tt.accent2 }} />
              </View>
              <Text style={[sel ? T.sansBold : T.sans, { color: sel ? theme.ink : theme.ink2, fontSize: 10, marginTop: 5, textAlign: 'center' }]}>{tt.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
  return (
    <View style={{ padding: 13, paddingBottom: 4 }}>
      <Group title="Dark" ks={keys.filter((k) => PIVOT_THEMES[k].dark)} />
      <Group title="Light" ks={keys.filter((k) => !PIVOT_THEMES[k].dark)} />
    </View>
  );
}

export default function SettingsScreen({ theme, settings, setSetting, guideOwned, onReset, onRedeem, proUnlocked, onRestore, onManage }) {
  const [code, setCode] = useState('');
  const [redeemMsg, setRedeemMsg] = useState(null);
  const [restoreMsg, setRestoreMsg] = useState(null);

  const redeem = () => {
    const ok = onRedeem && onRedeem(code.trim());
    setRedeemMsg(ok ? 'Redeemed — Pivot Pro unlocked!' : 'Invalid code.');
    if (ok) setCode('');
  };
  const restore = async () => {
    setRestoreMsg('Restoring…');
    const ok = onRestore ? await onRestore() : false;
    setRestoreMsg(ok ? 'Restored — Pivot Pro is active.' : 'No purchases found to restore.');
  };

  return (
    <View style={{ paddingBottom: 24 }}>
      <ScreenHead theme={theme} eyebrow="v1.0 · Offline" title="Settings" />
      <View style={{ paddingHorizontal: 22 }}>
        <Text style={[T.eyebrow, { color: theme.ink3, paddingHorizontal: 4, paddingBottom: 10, fontSize: 10 }]}>Gameplay</Text>
        <Glass theme={theme} radius={18} pad={4} style={{ marginBottom: 16 }}>
          <SettingsRow theme={theme} label="Trajectory guide" sub={guideOwned ? 'Show ghost path before launch' : 'Purchase in Shop to enable'} control={guideOwned ? <PvSwitch theme={theme} on={settings.guide} onToggle={() => setSetting('guide', !settings.guide)} /> : <Text style={[T.mono, { color: theme.gold, fontSize: 11 }]}>$0.99</Text>} />
          <SettingsRow theme={theme} label="Sound" sub="Bounce & target SFX" control={<PvSwitch theme={theme} on={settings.sound} onToggle={() => setSetting('sound', !settings.sound)} />} last />
        </Glass>

        <Text style={[T.eyebrow, { color: theme.ink3, paddingHorizontal: 4, paddingBottom: 10, fontSize: 10 }]}>Appearance</Text>
        <Glass theme={theme} radius={18} pad={4} style={{ marginBottom: 16 }}>
          <ThemePicker theme={theme} current={settings.theme} onPick={(k) => setSetting('theme', k)} />
          <View style={{ height: 1, backgroundColor: theme.hair2, marginHorizontal: 12, marginTop: 8 }} />
          <SettingsRow theme={theme} label="Minimal UI" sub="Hide HUD chrome during play" control={<PvSwitch theme={theme} on={settings.minimal} onToggle={() => setSetting('minimal', !settings.minimal)} />} last />
        </Glass>

        <Text style={[T.eyebrow, { color: theme.ink3, paddingHorizontal: 4, paddingBottom: 10, fontSize: 10 }]}>Redeem</Text>
        <Glass theme={theme} radius={18} pad={14} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="PIVOT-XXXX-XXXX"
              placeholderTextColor={theme.ink3}
              autoCapitalize="characters"
              style={[T.mono, { flex: 1, color: theme.ink, fontSize: 13, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassDk }]}
            />
            <Pressable onPress={redeem} style={{ borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16, backgroundColor: theme.accent }}>
              <Text style={[T.monoSemi, { color: theme.dark ? '#05221E' : '#fff', fontSize: 12 }]}>REDEEM</Text>
            </Pressable>
          </View>
          {redeemMsg && <Text style={[T.sans, { color: redeemMsg.startsWith('Invalid') ? theme.danger : theme.success, fontSize: 11.5, marginTop: 8 }]}>{redeemMsg}</Text>}
        </Glass>

        <Text style={[T.eyebrow, { color: theme.ink3, paddingHorizontal: 4, paddingBottom: 10, fontSize: 10 }]}>Purchases</Text>
        <Glass theme={theme} radius={18} pad={4} style={{ marginBottom: 16 }}>
          <SettingsRow theme={theme} label="Pivot Pro" sub={proUnlocked ? 'Active on this device' : 'All 300 levels & every story chapter'}
            control={<Text style={[T.monoSemi, { color: proUnlocked ? theme.success : theme.ink3, fontSize: 11 }]}>{proUnlocked ? 'OWNED' : '—'}</Text>} />
          <SettingsRow theme={theme} label="Restore purchases" sub="Bring Pro back via your Apple ID"
            control={<Pressable onPress={restore} style={{ borderWidth: 1, borderColor: theme.hair, borderRadius: 9, paddingVertical: 7, paddingHorizontal: 12 }}><Text style={[T.monoSemi, { color: theme.accent, fontSize: 11 }]}>RESTORE</Text></Pressable>} />
          <SettingsRow theme={theme} label="Manage purchases" sub="Receipts, refunds & subscriptions"
            control={<Pressable onPress={onManage} style={{ borderWidth: 1, borderColor: theme.hair, borderRadius: 9, paddingVertical: 7, paddingHorizontal: 12 }}><Text style={[T.monoSemi, { color: theme.ink, fontSize: 11 }]}>OPEN</Text></Pressable>} last />
          {restoreMsg && <Text style={[T.sans, { color: restoreMsg.startsWith('No') ? theme.ink3 : theme.success, fontSize: 11.5, paddingHorizontal: 14, paddingBottom: 12 }]}>{restoreMsg}</Text>}
        </Glass>

        <Glass theme={theme} radius={18} pad={4}>
          <SettingsRow theme={theme} label="Reset progress" sub="Clears solved levels & purchases" control={<Pressable onPress={onReset} style={{ borderWidth: 1, borderColor: theme.danger + '55', backgroundColor: theme.danger + '18', borderRadius: 9, paddingVertical: 7, paddingHorizontal: 12 }}><Text style={[T.monoSemi, { color: theme.danger, fontSize: 11 }]}>RESET</Text></Pressable>} last />
        </Glass>
        <Text style={[T.mono, { textAlign: 'center', color: theme.ink3, fontSize: 10, marginTop: 20, letterSpacing: 1 }]}>PIVOT · ONE SWIPE. INFINITE DEPTH.</Text>
      </View>
    </View>
  );
}
