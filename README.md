# Pivot — One swipe. Infinite depth.

A glassmorphism / 2.5D **angle-physics puzzle** for iOS. Swipe to set a launch
angle; the ball falls under gravity, ricochets off extruded walls, and collects
neon targets. 300 handcrafted, physics-validated levels across 10 chapters, a
procedural daily challenge, ball-skin cosmetics, cinematic story interludes, and
10 themes — fully offline, zero login.

Built per **PANDUAN_IMPLEMENTASI.md** (React Native + Expo + Skia, single-component
state machine, offline `AsyncStorage`, RevenueCat IAP, native Game Center module),
implementing the product defined in **PRD-Pivot-2026-05-31.md** and the visual
design exported from Claude Design (`Pivot.html`). The UI is recreated natively —
not a webview.

## Run it

These are native modules (Skia, blur, purchases, Game Center), so **Expo Go is not
enough** — you need a development build.

```bash
npm install                    # .npmrc forces legacy-peer-deps
npx expo run:ios               # compile dev client (needs Xcode), start Metro
npx expo export --platform ios # bundle-only sanity check (no device)
```

There is no test suite/linter; verification is `expo export` + run in the simulator.

## Architecture (where things live)

```
src/
├── App.js              # shell: state machine, load-once persistence, navigation, fonts
├── config.js           # RevenueCat keys, entitlement, Game Center leaderboard IDs
├── theme.js            # SOURCE OF TRUTH: 10 themes (PIVOT_THEMES), skins, fonts
├── storage.js          # AsyncStorage wrapper (LS) + today()
├── iap.js              # RevenueCat hub (degrades to no-op without keys)
├── leaderboard.js      # Game Center wrapper (degrades to no-op)
├── game/
│   ├── physics.js      # pure deterministic sim core (shared by engine/solver/story)
│   ├── levels.js       # 300 levels + the validated daily generator
│   ├── story.js        # cutscene data + per-chapter motifs
│   ├── PivotArena.js   # Skia renderer + rAF physics loop + drag-to-aim
│   └── StoryCutscene.js# Skia cinematic replay of a level's winning shot
├── components/         # VoidBackdrop, Glass, Icons, SkinOrb, BoardPreview, BottomNav, …
├── screens/            # Title, LevelSelect, Daily, Cosmetics, Settings, Play, Paywall
└── utils/color.js
modules/expo-game-center/   # local Swift/GameKit native module (no login UI)
```

Mental model: **two worlds** (menu RN views ↔ the Skia arena) chosen by `playing`.
**One component** holds all state and persists one save blob. The **engine** keeps
the whole world in a ref, runs one rAF loop, and reads props via ref-mirrors.
**Theme** is the only home for color. External services degrade to no-op.

## What's done vs. what needs your accounts

The code is complete and runs. Before shipping you must do the **manual portal work**
(only a human can): see PANDUAN §§15–20.

- **RevenueCat** — paste your `appl_…` key into `src/config.js`; create the
  `lifetime` non-consumable + entitlement `Pivot Pro` + a default offering + paywall.
- **Game Center** — create leaderboards matching `GAME_CENTER_LEADERBOARDS` in
  `src/config.js`; the native module needs a fresh dev/EAS build to compile.
- **App Store Connect** — app record, IAP attached to the version, App Privacy
  form (Purchases + Game Center; no ads/tracking), screenshots, age rating 4+.
- **Privacy/Support** — host `docs/` on GitHub Pages and set the URLs.
- **Icon** — add `assets/icon.png` (1024×1024, no alpha) before `eas build`.
