// VoidBackdrop.js — the gradient void with soft neon blobs that floats behind
// every glass surface. The web prototype blurred absolutely-positioned divs;
// RN can't blur arbitrary views, so we draw the same glow with SVG radial
// gradients (visually identical) over an expo-linear-gradient void.

import React, { useMemo } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';
import { rgba } from '../utils/color';

// deterministic pseudo-stars so the field doesn't reshuffle every render
function seededStars(n, w, h) {
  let s = 99173;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: n }, () => ({
    x: rnd() * w, y: rnd() * h, r: 0.4 + rnd() * 0.7, o: 0.05 + rnd() * 0.12,
  }));
}

export default function VoidBackdrop({ theme, intensity = 1, width = 402, height = 874 }) {
  const blobs = useMemo(
    () => [
      { c: theme.blobA, x: 0.12, y: 0.14, r: 200 },
      { c: theme.blobB, x: 0.72, y: 0.08, r: 230 },
      { c: theme.blobC, x: 0.58, y: 0.62, r: 210 },
      { c: theme.blobA, x: 0.05, y: 0.74, r: 170 },
    ],
    [theme]
  );
  const stars = useMemo(() => (theme.dark ? seededStars(70, width, height) : []), [theme.dark, width, height]);
  const blobOpacity = (theme.dark ? 0.42 : 0.3) * intensity;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
      <LinearGradient
        colors={[theme.void2, theme.void1, theme.void0]}
        locations={[0, 0.42, 1]}
        start={{ x: 0.5, y: -0.1 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          {blobs.map((b, i) => (
            <RadialGradient key={i} id={`blob${i}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={b.c} stopOpacity={blobOpacity} />
              <Stop offset="62%" stopColor={b.c} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {blobs.map((b, i) => (
          <Circle key={i} cx={b.x * width} cy={b.y * height} r={b.r} fill={`url(#blob${i})`} />
        ))}
        {stars.map((s, i) => (
          <Circle key={`s${i}`} cx={s.x} cy={s.y} r={s.r} fill={rgba('#FFFFFF', s.o)} />
        ))}
      </Svg>
    </View>
  );
}
