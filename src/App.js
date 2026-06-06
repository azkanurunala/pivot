// App.js — the Pivot shell. One component holds all app state via useState, two
// navigation axes (mode: menu|playing, tab: levels|daily|shop|settings), and the
// whole persistence layer. Offline-first, zero login. (Per the PANDUAN blueprint,
// with the "tap-to-rise orb" mechanic swapped for Pivot's angle-physics puzzle.)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  PlusJakartaSans_300Light, PlusJakartaSans_400Regular, PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  JetBrainsMono_500Medium, JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';

import { PIVOT_THEMES, PIVOT_SKINS, skinById, ALL_SKIN_IDS } from './theme';
import { LS, today } from './storage';
import { PIVOT_LEVELS, pvGenerateDaily, pvDateSeed } from './game/levels';
import { PV_STORY } from './game/story';
import { isValidGiftCode } from './giftcodes';
import { initIAP, getProStatus, restorePurchases, purchasePro as iapPurchasePro, getOfferingPrice, isStoreAvailable, presentCustomerCenter } from './iap';
import { authenticateGameCenter, submitScore, presentLeaderboard, loadTopScores } from './leaderboard';
import { initAudio, setSfxEnabled, setMusicEnabled } from './audio';
import { FREE_LEVELS } from './config';

import VoidBackdrop from './components/VoidBackdrop';
import BottomNav from './components/BottomNav';
import LevelSelectScreen from './screens/LevelSelectScreen';
import DailyScreen from './screens/DailyScreen';
import CosmeticsScreen from './screens/CosmeticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import PlayScreen from './screens/PlayScreen';
import TitleScreen from './screens/TitleScreen';
import Paywall from './screens/Paywall';
import StoryCutscene from './game/StoryCutscene';

const SAVE_KEY = 'save.v2';
const CH_SIZE = 30;

function defaultSave() {
  return {
    progress: { unlocked: 1, best: {} },
    ownedSkins: ['cyan'], skin: 'cyan', theme: 'night',
    guideOwned: false, guide: false, sound: true, music: false, minimal: false,
    dailyResult: null, dailySeed: null,
    seenIntro: false, seenStory: {}, proUnlocked: false,
  };
}

function Game() {
  const insets = useSafeAreaInsets();
  const [loaded, setLoaded] = useState(false);
  const [save, setSave] = useState(defaultSave());
  const [tab, setTab] = useState('levels');
  const [playing, setPlaying] = useState(null);
  const [booted, setBooted] = useState(false);
  const [story, setStory] = useState(null);     // { data, onComplete }
  const [paywall, setPaywall] = useState(null);  // pending level | true | null
  const [entitlementPro, setEntitlementPro] = useState(false);
  const [proPrice, setProPrice] = useState(undefined);

  // ── load once ───────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      const s = await LS.get(SAVE_KEY, null);
      if (!alive) return;
      setSave({ ...defaultSave(), ...(s || {}) });
      setLoaded(true);
    })();
    return () => { alive = false; };
  }, []);

  // ── init services once ──────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    authenticateGameCenter();
    initIAP((isPro) => { if (alive) setEntitlementPro(isPro); });
    (async () => {
      const [proNow, price] = await Promise.all([getProStatus(), getOfferingPrice()]);
      if (!alive) return;
      setEntitlementPro((prev) => prev || proNow);
      if (price) setProPrice(price);
    })();
    return () => { alive = false; };
  }, []);

  // ── audio: preload once, then mirror the SFX + Music settings independently ──
  useEffect(() => {
    let alive = true;
    (async () => {
      await initAudio();
      if (alive && loaded) { setSfxEnabled(save.sound); setMusicEnabled(save.music); }
    })();
    return () => { alive = false; };
  }, [loaded, save.sound, save.music]);

  // persist the whole save blob whenever it changes (after the initial load)
  const persist = useCallback((next) => {
    setSave((prev) => {
      const v = typeof next === 'function' ? next(prev) : { ...prev, ...next };
      LS.set(SAVE_KEY, v);
      return v;
    });
  }, []);

  const theme = PIVOT_THEMES[save.theme] || PIVOT_THEMES.night;
  const proUnlocked = save.proUnlocked || entitlementPro;
  // ── single-package model: Pivot Pro unlocks EVERYTHING ──────────────
  // skins (free users get only Cyan Core), the trajectory guide, and the
  // in-game hints. Nothing is sold individually.
  const ownedSkins = proUnlocked ? ALL_SKIN_IDS : ['cyan'];
  const guideOwned = proUnlocked;
  const equippedKey = ownedSkins.includes(save.skin) ? save.skin : 'cyan';
  const skin = useMemo(() => skinById(equippedKey), [equippedKey]);

  const daily = useMemo(() => pvGenerateDaily(pvDateSeed()), []);
  const dailyToday = save.dailySeed === pvDateSeed() ? save.dailyResult : null;

  const arenaSettings = {
    gravity: 1, depth: 1, blur: theme.glassBlur,
    guide: save.guide && guideOwned, minimal: save.minimal, sound: save.sound,
  };

  // ── win persistence ─────────────────────────────────────────────────
  const onWinPersist = useCallback((level, res) => {
    if (level.daily) {
      persist({ dailySeed: pvDateSeed(), dailyResult: { angle: res.angle, bounces: res.bounces } });
      submitScore(res.bounces, 'daily');
      return;
    }
    persist((prev) => {
      const best = { ...(prev.progress.best || {}) };
      const cur = best[level.id];
      const rawStars = res.bounces <= level.par ? 3 : res.bounces <= level.par + 2 ? 2 : 1;
      const newStars = res.hinted ? Math.min(rawStars, 2) : rawStars;
      if (!cur || newStars > cur.stars || (newStars === cur.stars && res.bounces < cur.bounces))
        best[level.id] = { bounces: res.bounces, angle: res.angle, stars: newStars };
      const unlocked = Math.max(prev.progress.unlocked, Math.min(PIVOT_LEVELS.length, level.id + 1));
      const totalStars = Object.values(best).reduce((a, b) => a + (b.stars || 0), 0);
      submitScore(totalStars, 'campaign');
      return { ...prev, progress: { unlocked, best } };
    });
  }, [persist]);

  // ── cosmetics & settings ────────────────────────────────────────────
  // Owned skins equip directly; anything locked opens the single Pivot Pro paywall.
  const openPaywall = () => setPaywall(true);
  const equipSkin = (key) => { if (ownedSkins.includes(key)) persist({ skin: key }); else openPaywall(); };
  const setSetting = (k, v) => persist({ [k]: v });
  const resetAll = () => { LS.remove(SAVE_KEY); setSave(defaultSave()); setPlaying(null); setTab('levels'); };

  const redeem = (code) => {
    if (!isValidGiftCode(code)) return false;
    persist({ proUnlocked: true });
    if (paywall) setPaywall(null);
    return true;
  };

  // ── story / cutscenes ───────────────────────────────────────────────
  const handleEnter = () => {
    if (!save.seenIntro) {
      setStory({ data: PV_STORY.intro, onComplete: () => { persist({ seenIntro: true }); setStory(null); setBooted(true); } });
    } else setBooted(true);
  };
  const replayStory = (ci) => {
    const data = ci < PV_STORY.chapters.length ? PV_STORY.chapters[ci] : PV_STORY.ending;
    if (data) setStory({ data, onComplete: () => setStory(null) });
  };

  // play a level — gate by paywall, then by the chapter's opening cutscene
  const launchLevel = (lv) => {
    if (lv && !lv.daily && lv.id > FREE_LEVELS && !proUnlocked) { setPaywall(lv); return; }
    if (lv && !lv.daily && (lv.id - 1) % CH_SIZE === 0) {
      const ci = Math.floor((lv.id - 1) / CH_SIZE);
      const data = ci < PV_STORY.chapters.length ? PV_STORY.chapters[ci] : PV_STORY.ending;
      if (data && !(save.seenStory || {})[ci]) {
        setStory({ data, onComplete: () => { persist({ seenStory: { ...(save.seenStory || {}), [ci]: true } }); setStory(null); setPlaying(lv); } });
        return;
      }
    }
    setPlaying(lv);
  };

  // RevenueCat purchase. When a real store is wired, the entitlement listener is
  // the source of truth; without keys (demo / offline) we optimistically unlock.
  const completePurchase = (lv) => {
    persist({ proUnlocked: true });
    setPaywall(null);
    if (lv && lv.id) {
      if ((lv.id - 1) % CH_SIZE === 0) {
        const ci = Math.floor((lv.id - 1) / CH_SIZE);
        const data = ci < PV_STORY.chapters.length ? PV_STORY.chapters[ci] : PV_STORY.ending;
        if (data && !(save.seenStory || {})[ci]) {
          setStory({ data, onComplete: () => { persist({ seenStory: { ...(save.seenStory || {}), [ci]: true } }); setStory(null); setPlaying(lv); } });
          return;
        }
      }
      setPlaying(lv);
    }
  };
  const purchasePro = async () => {
    const lv = paywall && paywall.id ? paywall : null;
    if (isStoreAvailable()) { const ok = await iapPurchasePro(); if (ok) completePurchase(lv); }
    else completePurchase(lv);
  };
  const restore = async () => {
    const ok = await restorePurchases();
    if (ok || !isStoreAvailable()) completePurchase(paywall && paywall.id ? paywall : null);
  };
  // standalone restore from Settings (not tied to a pending paywall) → returns bool
  const restoreFromSettings = async () => {
    const ok = await restorePurchases();
    if (ok) persist({ proUnlocked: true });
    return ok;
  };
  const managePurchases = () => presentCustomerCenter();   // RevenueCat Customer Center

  // ── render ──────────────────────────────────────────────────────────
  const screens = {
    levels: (
      <LevelSelectScreen theme={theme} levels={PIVOT_LEVELS} progress={save.progress} onPlay={launchLevel}
        seenStory={save.seenStory} onReplayStory={replayStory} proUnlocked={proUnlocked}
        freeLevels={FREE_LEVELS} onPaywall={(lv) => setPaywall(lv || true)} price={proPrice} />
    ),
    daily: (
      <DailyScreen theme={theme} daily={daily} dailyResult={dailyToday}
        unlocked={save.progress.unlocked >= 5} onPlay={launchLevel}
        onOpenLeaderboard={() => presentLeaderboard('daily')}
        loadScores={() => loadTopScores('daily', 50)} />
    ),
    shop: (
      <CosmeticsScreen theme={theme} skins={PIVOT_SKINS} ownedSkins={ownedSkins} currentSkin={save.skin}
        onSelect={equipSkin} onBuy={openPaywall} guideOwned={guideOwned} onBuyGuide={openPaywall}
        proUnlocked={proUnlocked} onUnlockPro={openPaywall} price={proPrice} />
    ),
    settings: (
      <SettingsScreen theme={theme}
        settings={{ theme: save.theme, guide: save.guide, sound: save.sound, music: save.music, minimal: save.minimal }}
        setSetting={setSetting} guideOwned={guideOwned} onReset={resetAll} onRedeem={redeem}
        proUnlocked={proUnlocked} onRestore={restoreFromSettings} onManage={managePurchases} />
    ),
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.void0 }}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <VoidBackdrop theme={theme} />

      {/* Full-bleed: content fills the full screen width (incl. iPad). The level
          and shop grids adapt their column count to the width (see those screens)
          so a wide canvas looks intentional rather than stretched. */}
      <View style={{ flex: 1, width: '100%' }}>
        {!playing && (
          <ScrollView
            key={tab}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 110 }}
            showsVerticalScrollIndicator={false}
          >
            {screens[tab]}
          </ScrollView>
        )}
        {!playing && <BottomNav theme={theme} tab={tab} setTab={setTab} bottomInset={insets.bottom} />}

        {playing && (
          <PlayScreen theme={theme} level={playing} skin={skin} settings={arenaSettings}
            levels={PIVOT_LEVELS} onPlay={launchLevel} onExit={() => setPlaying(null)}
            onWinPersist={onWinPersist} pro={proUnlocked} onPaywall={openPaywall}
            topInset={insets.top} bottomInset={insets.bottom} />
        )}

        {!booted && <TitleScreen theme={theme} skin={skin} onEnter={handleEnter} />}
        {story && <StoryCutscene theme={theme} scene={story.data} sound={save.sound} onDone={story.onComplete} />}
        {paywall && (
          <Paywall theme={theme} price={proPrice} onClose={() => setPaywall(null)}
            onPurchase={purchasePro} onRestore={restore} />
        )}
      </View>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold,
    PlusJakartaSans_300Light, PlusJakartaSans_400Regular, PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
    JetBrainsMono_500Medium, JetBrainsMono_600SemiBold,
  });
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: '#080B11' }} />;
  }
  return (
    <SafeAreaProvider>
      <Game />
    </SafeAreaProvider>
  );
}
