// leaderboard.js — a safe JS wrapper over the local Game Center native module.
// No login UI: GameKit auto-authenticates with the device Apple ID. Every call
// degrades to a no-op when the native module isn't present (Expo Go / Android /
// pre-SDK build), so the JS bundle never crashes.

import { Platform } from 'react-native';
import { leaderboardIdFor } from './config';

function gc() {
  try { return require('../modules/expo-game-center').default; } catch (e) { return null; }
}

export const isLeaderboardAvailable = () => Platform.OS === 'ios' && !!gc();

export async function authenticateGameCenter() {
  const m = gc();
  try { return m ? await m.authenticate() : false; } catch (e) { return false; }
}

export async function isAuthenticated() {
  const m = gc();
  try { return m ? await m.isAuthenticated() : false; } catch (e) { return false; }
}

// Game Center keeps the best score automatically. board: 'daily' | 'campaign'.
export async function submitScore(score, board = 'daily') {
  const m = gc();
  if (!m || score == null || score < 0) return false;
  try { return await m.submitScore(Math.floor(score), leaderboardIdFor(board)); }
  catch (e) { return false; }
}

export async function presentLeaderboard(board = 'daily') {
  const m = gc();
  if (!m) return;
  try { await m.presentLeaderboard(leaderboardIdFor(board)); } catch (e) {}
}

// → [{ rank, name, score, me }]
export async function loadTopScores(board = 'daily', count = 50) {
  const m = gc();
  if (!m) return [];
  try {
    const rows = await m.loadTopScores(leaderboardIdFor(board), count);
    return Array.isArray(rows) ? rows : [];
  } catch (e) { return []; }
}
