// withIpadPortrait.js — config plugin that locks iPad to portrait.
// Expo's prebuild defaults tablets to all four orientations (the `orientation:
// "portrait"` field only locks iPhone), and a raw `ios.infoPlist` override for
// `UISupportedInterfaceOrientations~ipad` gets clobbered by that default. This
// plugin runs AFTER Expo's defaults and forces portrait-only on iPad, so the
// lock survives every prebuild — including `eas build` for production.

const { withInfoPlist } = require('expo/config-plugins');

module.exports = function withIpadPortrait(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults['UISupportedInterfaceOrientations~ipad'] = [
      'UIInterfaceOrientationPortrait',
    ];
    return cfg;
  });
};
