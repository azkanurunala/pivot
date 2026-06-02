// Icons.js — the PvIcon set, ported from the design's inline SVGs to
// react-native-svg. Each is a function (color, size) => <Svg/>.

import React from 'react';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';

export const PvIcon = {
  levels: (c, s = 22) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="2" stroke={c} strokeWidth="2" />
      <Rect x="14" y="3" width="7" height="7" rx="2" stroke={c} strokeWidth="2" />
      <Rect x="3" y="14" width="7" height="7" rx="2" stroke={c} strokeWidth="2" />
      <Rect x="14" y="14" width="7" height="7" rx="2" stroke={c} strokeWidth="2" />
    </Svg>
  ),
  daily: (c, s = 22) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" stroke={c} strokeWidth="2" strokeLinejoin="round" fill="none" />
    </Svg>
  ),
  shop: (c, s = 22) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M5 8h14l-1 12H6L5 8z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <Path d="M9 8a3 3 0 016 0" stroke={c} strokeWidth="2" />
    </Svg>
  ),
  gear: (c, s = 22) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3.2" stroke={c} strokeWidth="2" />
      <Path
        d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  ),
  lock: (c, s = 16) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="10" width="14" height="10" rx="2.5" stroke={c} strokeWidth="2" />
      <Path d="M8 10V7a4 4 0 018 0v3" stroke={c} strokeWidth="2" />
    </Svg>
  ),
  check: (c, s = 16) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12.5l5 5L20 6.5" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  back: (c, s = 22) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  retry: (c, s = 20) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12a8 8 0 1 1 2.3 5.6" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      <Path d="M4 19v-5h5" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  arrow: (c, s = 20) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  crown: (c, s = 22) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path d="M3 8l4 4 5-7 5 7 4-4-1.5 11h-15L3 8z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" fill={c} fillOpacity="0.18" />
    </Svg>
  ),
};

// A single star — filled when earned, hollow otherwise.
export function Star({ filled, color, hollow, size = 12 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9L12 2.5z"
        fill={filled ? color : 'none'}
        stroke={filled ? color : hollow}
        strokeOpacity={filled ? 1 : 0.45}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
