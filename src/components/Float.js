// Float.js — a gentle up-and-down hover (the design's pvFloatY keyframe).
// Wraps the title orb. Uses the core Animated API to avoid extra deps.

import React, { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

export default function Float({ amount = 6, duration = 3000, children, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, -amount] });
  return <Animated.View style={[{ transform: [{ translateY }] }, style]}>{children}</Animated.View>;
}

// A soft pulsing opacity (the design's pvPulse) for the "Tap to play" button.
export function Pulse({ children, style, duration = 2200 }) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 0.55, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  return <Animated.View style={[{ opacity: v }, style]}>{children}</Animated.View>;
}
