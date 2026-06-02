// giftcodes.js — grant Pivot Pro for free, server-free, without bundling the
// plain codes. Only the djb2 hashes ship; the plaintext codes live in a
// gitignored GIFT_CODES.txt (regenerate both with scripts/gen-gift-codes.js).
// A redeemed code flips giftPro locally, unlocking exactly what a purchase does.

// AUTO-GENERATED — replace via scripts/gen-gift-codes.js (sample set below).
const HASHES = new Set([
  // djb2('PIVOT-PRO-2026'), djb2('ONE-SWIPE'), djb2('INFINITE-DEPTH') ...
  // These are illustrative; regenerate for production.
]);

function djb2(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h >>> 0;
}

export function isValidGiftCode(code) {
  if (!code) return false;
  return HASHES.has(djb2(String(code).trim().toUpperCase()));
}
