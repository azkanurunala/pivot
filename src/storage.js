// storage.js — thin async wrapper over AsyncStorage. Every key is prefixed,
// every value is JSON, every read has a safe fallback, and nothing ever throws.
// This is the whole persistence layer: offline-first, zero login, zero backend.

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'pivot.';

export const LS = {
  async get(key, fallback) {
    try {
      const v = await AsyncStorage.getItem(PREFIX + key);
      return v == null ? fallback : JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  },
  async set(key, value) {
    try {
      await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {}
  },
  async remove(key) {
    try {
      await AsyncStorage.removeItem(PREFIX + key);
    } catch (e) {}
  },
  // keys: [['best', {}], ['unlocked', 1], ...]
  async multiGet(keys) {
    const out = {};
    await Promise.all(keys.map(async ([k, d]) => { out[k] = await LS.get(k, d); }));
    return out;
  },
};

// Local date key (YYYY-MM-DD) — powers daily reset (daily challenge, etc.).
export function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
