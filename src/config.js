// config.js — the single home for service keys & IDs (RevenueCat, Game Center).
// Public SDK keys are safe to embed in the client. Replace the placeholders with
// your own before shipping; the wrappers degrade to no-op while they're empty.

import { Platform } from 'react-native';

// ── RevenueCat (IAP) ──────────────────────────────────────────────────
// Apple public SDK key (safe to embed in the client). This is the real `appl_`
// key from RevenueCat → Project → API Keys, so the SDK configures and processes
// real App Store purchases.
export const REVENUECAT_IOS_KEY = 'appl_XopUcDFTdinXxNtjpABiwMDtCGh';
export const REVENUECAT_ANDROID_KEY = 'REPLACE_ME_goog_xxxxxxxx';
export const ENTITLEMENT_ID = 'Pivot Pro';   // MUST match the RevenueCat dashboard exactly
export const OFFERING_ID = null;             // null = use the "current" offering
export const PRO_PRODUCT_ID = 'pivot_lifetime';  // non-consumable lifetime unlock (matches App Store Connect + RevenueCat)
export const PRO_FALLBACK_PRICE = '$2.99';   // shown when the store is offline

export const isPlaceholder = (v) =>
  typeof v !== 'string' || v.startsWith('REPLACE_ME');

// The RevenueCat SDK only accepts real public platform keys: Apple keys start
// with `appl_`, Google with `goog_`. Anything else (the current `test_` key, or
// a placeholder) is treated as NON-configuring so it can never block the app —
// the SDK simply isn't initialized and purchases degrade to the offline unlock
// path. Paste a real `appl_` key and it activates automatically.
export const isUsablePurchasesKey = (k) =>
  typeof k === 'string' && (k.startsWith('appl_') || k.startsWith('goog_'));
export const IAP_CONFIGURED = isUsablePurchasesKey(REVENUECAT_IOS_KEY);

// ── Game Center (leaderboards) ────────────────────────────────────────
// Pivot ranks the daily challenge by fewest bounces. One global board.
export const GAME_CENTER_LEADERBOARDS = {
  daily: 'pivot.daily.bounces',
  campaign: 'pivot.campaign.stars',
};
export const leaderboardIdFor = (board) =>
  GAME_CENTER_LEADERBOARDS[board] || GAME_CENTER_LEADERBOARDS.daily;

// ── monetization model constants ──────────────────────────────────────
export const FREE_LEVELS = 30;   // Chapter 1 is free; the rest unlock with Pivot Pro.

export const STORE_PLATFORM = Platform.OS;
