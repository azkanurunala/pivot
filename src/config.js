// config.js — the single home for service keys & IDs (RevenueCat, Game Center).
// Public SDK keys are safe to embed in the client. Replace the placeholders with
// your own before shipping; the wrappers degrade to no-op while they're empty.

import { Platform } from 'react-native';

// ── RevenueCat (IAP) ──────────────────────────────────────────────────
export const REVENUECAT_IOS_KEY = 'REPLACE_ME_appl_xxxxxxxx';
export const REVENUECAT_ANDROID_KEY = 'REPLACE_ME_goog_xxxxxxxx';
export const ENTITLEMENT_ID = 'Pivot Pro';   // MUST match the RevenueCat dashboard exactly
export const OFFERING_ID = null;             // null = use the "current" offering
export const PRO_PRODUCT_ID = 'lifetime';    // non-consumable lifetime unlock
export const PRO_FALLBACK_PRICE = '$4.99';   // shown when the store is offline

export const isPlaceholder = (v) =>
  typeof v !== 'string' || v.startsWith('REPLACE_ME');
export const IAP_CONFIGURED = !isPlaceholder(REVENUECAT_IOS_KEY);

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
