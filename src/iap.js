// iap.js — RevenueCat hub. Model: ONE non-consumable "Pivot Pro" → a single
// entitlement → unlocks all 300 levels + every story chapter. No ads, no
// subscriptions. RevenueCat is the source of truth (never stored locally).
//
// Every function reaches the native module lazily inside try/catch, so a JS-only
// bundle (Expo Go / pre-SDK build / Android) degrades to safe no-ops — the app
// never crashes when the native side isn't compiled in.

import { Platform } from 'react-native';
import {
  REVENUECAT_IOS_KEY, REVENUECAT_ANDROID_KEY, ENTITLEMENT_ID,
  OFFERING_ID, PRO_PRODUCT_ID, PRO_FALLBACK_PRICE, isUsablePurchasesKey,
} from './config';

let configured = false;

function purchasesModule() { try { return require('react-native-purchases'); } catch (e) { return null; } }
function purchasesUIModule() { try { return require('react-native-purchases-ui'); } catch (e) { return null; } }
const Purchases = () => purchasesModule()?.default || null;
const RevenueCatUI = () => purchasesUIModule()?.default || null;

const platformKey = () => (Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY);

export function hasPro(info) {
  return !!info?.entitlements?.active?.[ENTITLEMENT_ID];
}

export function initIAP(onProChange) {
  const P = Purchases();
  if (!P || configured) return;
  const key = platformKey();
  if (!isUsablePurchasesKey(key)) return;  // not a real appl_/goog_ key → stay a no-op (never blocks)
  try {
    P.configure({ apiKey: key });
    configured = true;
    P.addCustomerInfoUpdateListener((info) => onProChange && onProChange(hasPro(info)));
  } catch (e) {}
}

export async function getProStatus() {
  const P = Purchases();
  if (!P || !configured) return false;
  try { return hasPro(await P.getCustomerInfo()); } catch (e) { return false; }
}

export async function restorePurchases() {
  const P = Purchases();
  if (!P || !configured) return false;
  try { return hasPro(await P.restorePurchases()); } catch (e) { return false; }
}

async function currentOffering() {
  const P = Purchases();
  if (!P || !configured) return null;
  try {
    const offerings = await P.getOfferings();
    return (OFFERING_ID && offerings.all?.[OFFERING_ID]) || offerings.current || null;
  } catch (e) { return null; }
}

// localized price string for the lifetime package, or the offline fallback
export async function getOfferingPrice() {
  const off = await currentOffering();
  const pkg = off?.availablePackages?.[0];
  return pkg?.product?.priceString || PRO_FALLBACK_PRICE;
}

// custom-paywall purchase path: returns true on success
export async function purchasePro() {
  const P = Purchases();
  const off = await currentOffering();
  const pkg = off?.availablePackages?.find((p) => p.product?.identifier === PRO_PRODUCT_ID) || off?.availablePackages?.[0];
  if (!P || !pkg) return false;
  try { const { customerInfo } = await P.purchasePackage(pkg); return hasPro(customerInfo); }
  catch (e) { return false; }
}

// hosted RevenueCat paywall (designed in the dashboard); returns true if purchased
export async function presentPaywall() {
  const UI = RevenueCatUI();
  if (!UI) return false;
  try {
    const res = await UI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: ENTITLEMENT_ID });
    return res === UI.PAYWALL_RESULT?.PURCHASED || res === 'PURCHASED';
  } catch (e) { return false; }
}

export async function presentCustomerCenter() {
  const UI = RevenueCatUI();
  if (!UI) return;
  try { await UI.presentCustomerCenter(); } catch (e) {}
}

export function isStoreAvailable() {
  return Platform.OS === 'ios' && !!Purchases() && isUsablePurchasesKey(platformKey());
}
