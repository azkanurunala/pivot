// Local Expo native module: optional GameKit (Game Center) bridge. Returns null
// on platforms / builds where it isn't compiled in, so callers can degrade.

import { requireOptionalNativeModule, requireNativeModule } from 'expo-modules-core';

const ExpoGameCenter = requireOptionalNativeModule
  ? requireOptionalNativeModule('ExpoGameCenter')
  : (() => { try { return requireNativeModule('ExpoGameCenter'); } catch (e) { return null; } })();

export default ExpoGameCenter;
