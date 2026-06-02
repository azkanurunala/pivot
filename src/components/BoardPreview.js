// BoardPreview.js — a tiny vector map of a level's board (walls + glowing
// targets + launch orb) so every level tile looks distinct. Ported 1:1.

import React from 'react';
import Svg, { Line, Circle, G } from 'react-native-svg';
import { PV_BOARD } from '../game/levels';

export default function BoardPreview({ level, theme, tint }) {
  const B = PV_BOARD;
  const tr = (B.targetR || 16) * 0.74;
  return (
    <Svg viewBox={`0 0 ${B.w} ${B.h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {(level.walls || []).map((w, i) => (
        <Line
          key={i}
          x1={w.x1}
          y1={w.y1}
          x2={w.x2}
          y2={w.y2}
          stroke={theme.wallTop}
          strokeOpacity="0.55"
          strokeWidth={(B.wallT || 9) * 0.9}
          strokeLinecap="round"
        />
      ))}
      {(level.targets || []).map((t, i) => (
        <G key={i}>
          <Circle cx={t.x} cy={t.y} r={tr * 1.85} fill={theme.target} fillOpacity="0.18" />
          <Circle cx={t.x} cy={t.y} r={tr} fill="none" stroke={theme.target} strokeWidth="4" strokeOpacity="0.95" />
          <Circle cx={t.x} cy={t.y} r={tr * 0.34} fill={theme.target} />
        </G>
      ))}
      {level.ball && (
        <G>
          <Circle cx={level.ball.x} cy={level.ball.y} r="19" fill={tint} fillOpacity="0.22" />
          <Circle cx={level.ball.x} cy={level.ball.y} r="9" fill={tint} />
        </G>
      )}
    </Svg>
  );
}
