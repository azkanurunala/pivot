// typography.js — the design's text roles as RN style objects. In the web
// prototype these were CSS classes (.pv-display / .pv-sans / .pv-mono / etc.);
// here they're base styles you spread alongside color/size. Three families:
// display (titles + numerals), sans (UI), mono (data/eyebrows).

import { FONT } from '../theme';

export const T = {
  display: { fontFamily: FONT.displaySemi, letterSpacing: -0.6 },
  displayBold: { fontFamily: FONT.display, letterSpacing: -0.6 },
  displayMed: { fontFamily: FONT.displayMed, letterSpacing: -0.4 },
  sans: { fontFamily: FONT.sans },
  sansSemi: { fontFamily: FONT.sansSemi },
  sansBold: { fontFamily: FONT.sansBold },
  mono: { fontFamily: FONT.mono },
  monoSemi: { fontFamily: FONT.monoSemi },
  // tabular numerals so digits don't jitter as scores change
  num: { fontFamily: FONT.num, fontVariant: ['tabular-nums'] },
  eyebrow: {
    fontFamily: FONT.mono,
    fontSize: 10,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
  },
};
