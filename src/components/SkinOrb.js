// SkinOrb.js — the cosmetic ball rendered as a glossy radial-gradient orb.
// Used on the title screen and throughout the Shop. Ported 1:1 from the design.

import React from 'react';
import Svg, { Defs, RadialGradient, Stop, Circle, Ellipse } from 'react-native-svg';

export default function SkinOrb({ skin, size = 54 }) {
  const id = 'g' + (skin.name || 'x').replace(/\W/g, '');
  const sid = 's' + (skin.name || 'x').replace(/\W/g, '');
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Defs>
        <RadialGradient id={id} cx="38%" cy="32%" r="72%">
          <Stop offset="0%" stopColor={skin.c0} />
          <Stop offset="52%" stopColor={skin.c1} />
          <Stop offset="100%" stopColor={skin.c2} />
        </RadialGradient>
        <RadialGradient id={sid} cx="68%" cy="74%" r="46%">
          <Stop offset="0%" stopColor={skin.glow} stopOpacity="0.55" />
          <Stop offset="100%" stopColor={skin.glow} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="30" cy="33" r="22" fill={skin.glow} opacity="0.30" />
      <Circle cx="30" cy="30" r="20" fill={`url(#${id})`} />
      <Circle cx="30" cy="30" r="20" fill={`url(#${sid})`} />
      <Circle cx="30" cy="30" r="19.4" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      <Ellipse cx="23" cy="22" rx="5.4" ry="4.2" fill="rgba(255,255,255,0.9)" transform="rotate(-28 23 22)" />
    </Svg>
  );
}
