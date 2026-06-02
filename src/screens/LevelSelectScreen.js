// LevelSelectScreen.js — the campaign: a Continue/Unlock hero card, then 10
// chapters of 30 levels. Each tile shows a live mini-map of the board so every
// level looks distinct, plus its number and earned stars. Ported 1:1.

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Glass from '../components/Glass';
import ScreenHead from '../components/ScreenHead';
import BoardPreview from '../components/BoardPreview';
import { PvIcon, Star } from '../components/Icons';
import { T } from '../components/typography';
import { PV_BOARD } from '../game/levels';

export const PV_CHAPTERS = [
  { name: 'Drift', sub: 'First angles' },
  { name: 'Ricochet', sub: 'Off the walls' },
  { name: 'Lattice', sub: 'Threading lanes' },
  { name: 'Vortex', sub: 'Curved reads' },
  { name: 'Fracture', sub: 'Broken paths' },
  { name: 'Cascade', sub: 'Chain the hits' },
  { name: 'Helix', sub: 'Wind it through' },
  { name: 'Eclipse', sub: 'Blind angles' },
  { name: 'Tempest', sub: 'No margin' },
  { name: 'Singularity', sub: 'Mastery' },
];
const PV_CH_SIZE = 30;

export function pvChapterTint(theme, i) {
  return [theme.accent, theme.accent2, theme.target, theme.gold][i % 4];
}

function StarRow({ stars, theme, size = 10 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1.5 }}>
      {[0, 1, 2].map((i) => (
        <Star key={i} filled={i < stars} color={theme.gold} hollow={theme.ink3} size={size} />
      ))}
    </View>
  );
}

function LevelTile({ lv, num, theme, tint, unlocked, best, isCurrent, onPlay, paywalled, onPaywall }) {
  const done = !!best;
  const tappable = unlocked || paywalled;
  const onPress = () => (paywalled ? onPaywall && onPaywall(lv) : unlocked && onPlay(lv));
  return (
    <Pressable
      disabled={!tappable}
      onPress={onPress}
      style={{
        flex: 1, aspectRatio: 0.88, borderRadius: 15, overflow: 'hidden',
        backgroundColor: isCurrent ? theme.glassHi : done ? theme.glass : theme.glassDk,
        borderWidth: 1,
        borderColor: isCurrent ? tint + '88' : paywalled ? theme.gold + '44' : done ? theme.hair : theme.hair2,
        opacity: unlocked ? 1 : paywalled ? 0.7 : 0.5,
      }}
    >
      {!unlocked ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          {PvIcon.lock(paywalled ? theme.gold : theme.ink3, 18)}
          {paywalled && <Text style={[T.eyebrow, { color: theme.gold, fontSize: 7.5 }]}>Pro</Text>}
        </View>
      ) : (
        <>
          <View style={{ flex: 1, padding: 9, alignItems: 'center', justifyContent: 'center' }}>
            <BoardPreview level={lv} theme={theme} tint={isCurrent ? tint : theme.accent} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 9, paddingBottom: 8 }}>
            <Text style={[T.num, { color: isCurrent ? tint : theme.ink, fontSize: 15 }]}>{num}</Text>
            {done ? <StarRow stars={best.stars} theme={theme} /> : isCurrent ? <Text style={[T.eyebrow, { color: tint, fontSize: 8 }]}>Play</Text> : null}
          </View>
        </>
      )}
    </Pressable>
  );
}

function HeroBoard({ level, theme, tint, size = 86 }) {
  return (
    <View
      style={{
        width: size, borderRadius: 14, overflow: 'hidden', padding: 9,
        backgroundColor: theme.glassDk, borderWidth: 1, borderColor: theme.hair,
      }}
    >
      <BoardPreview level={level} theme={theme} tint={tint} />
    </View>
  );
}

function ContinueCard({ theme, level, chapterName, tint, best, allDone, onPlay }) {
  const onTint = theme.dark ? '#06231F' : '#FFFFFF';
  return (
    <Pressable
      onPress={() => onPlay(level)}
      style={{
        marginHorizontal: 22, marginBottom: 20, borderRadius: 20, overflow: 'hidden',
        backgroundColor: theme.glassHi, borderWidth: 1, borderColor: tint + '55',
        flexDirection: 'row', gap: 14, padding: 14,
      }}
    >
      <HeroBoard level={level} theme={theme} tint={tint} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={[T.eyebrow, { color: tint, fontSize: 9 }]}>{(allDone ? 'Replay' : 'Continue') + ' · ' + chapterName}</Text>
        <Text numberOfLines={1} style={[T.display, { color: theme.ink, fontSize: 19, marginTop: 6 }]}>
          <Text style={T.num}>{level.id}</Text> · {level.name}
        </Text>
        <Text numberOfLines={1} style={[T.sans, { color: theme.ink2, fontSize: 11.5, marginTop: 4 }]}>{level.hint}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 13 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 17, borderRadius: 12, backgroundColor: tint }}>
            {PvIcon.arrow(onTint, 16)}
            <Text style={[T.display, { color: onTint, fontSize: 13 }]}>{allDone ? 'Replay' : 'Play'}</Text>
          </View>
          <Text style={[T.mono, { color: theme.ink3, fontSize: 10 }]}>PAR {level.par}{best ? ` · BEST ${best.bounces}` : ''}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function UnlockCard({ theme, onUnlock, price = '$4.99' }) {
  const onTint = theme.dark ? '#06231F' : '#fff';
  return (
    <View style={{ marginHorizontal: 22, marginBottom: 20, borderRadius: 20, overflow: 'hidden', backgroundColor: theme.glassHi, borderWidth: 1, borderColor: theme.gold + '66', padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: theme.gold + '22', borderWidth: 1, borderColor: theme.gold + '55', alignItems: 'center', justifyContent: 'center' }}>
          {PvIcon.crown(theme.gold, 22)}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[T.eyebrow, { color: theme.gold, fontSize: 9 }]}>Pivot Pro</Text>
          <Text style={[T.displayBold, { color: theme.ink, fontSize: 18, marginTop: 3 }]}>Unlock all 300 levels</Text>
          <Text style={[T.sans, { color: theme.ink2, fontSize: 11.5, marginTop: 2 }]}>9 more chapters & every story await.</Text>
        </View>
      </View>
      <Pressable onPress={onUnlock} style={{ marginTop: 14, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.gold, alignItems: 'center' }}>
        <Text style={[T.displayBold, { color: onTint, fontSize: 14 }]}>Go Pro · {price}</Text>
      </Pressable>
    </View>
  );
}

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

export default function LevelSelectScreen({ theme, levels, progress, onPlay, seenStory, onReplayStory, proUnlocked = true, freeLevels = 30, onPaywall, price = '$4.99' }) {
  const bestMap = progress.best || {};
  const cleared = Object.keys(bestMap).length;
  const totalStars = Object.values(bestMap).reduce((s, b) => s + (b.stars || 0), 0);
  const chapterCount = Math.ceil(levels.length / PV_CH_SIZE);
  const nextLevel = levels.find((lv) => lv.id <= progress.unlocked && !bestMap[lv.id]);
  const allDone = !nextLevel;
  const heroLevel = nextLevel || levels[levels.length - 1];
  const heroChapterIdx = Math.floor((heroLevel.id - 1) / PV_CH_SIZE);
  const heroTint = pvChapterTint(theme, heroChapterIdx);
  const heroPaywalled = !proUnlocked && heroLevel.id > freeLevels;

  return (
    <View style={{ paddingBottom: 24 }}>
      <ScreenHead
        theme={theme}
        eyebrow="Campaign"
        title="Levels"
        right={
          <Glass theme={theme} pad={0} radius={14} innerStyle={{ padding: 8, paddingHorizontal: 13, minWidth: 92 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <Star filled color={theme.gold} hollow={theme.gold} size={13} />
              <Text style={[T.num, { color: theme.ink, fontSize: 19 }]}>{totalStars}</Text>
            </View>
            <Text style={[T.eyebrow, { color: theme.ink3, marginTop: 5, textAlign: 'right', fontSize: 9 }]}>{cleared} solved</Text>
          </Glass>
        }
      />

      {heroPaywalled ? (
        <UnlockCard theme={theme} price={price} onUnlock={() => onPaywall && onPaywall(heroLevel)} />
      ) : (
        <ContinueCard theme={theme} level={heroLevel} chapterName={(PV_CHAPTERS[heroChapterIdx] || {}).name || ''} tint={heroTint} best={bestMap[heroLevel.id]} allDone={allDone} onPlay={onPlay} />
      )}

      {Array.from({ length: chapterCount }).map((_, ci) => {
        const start = ci * PV_CH_SIZE;
        const chapterLevels = levels.slice(start, start + PV_CH_SIZE);
        const meta = PV_CHAPTERS[ci] || { name: `Chapter ${ci + 1}`, sub: '' };
        const tint = pvChapterTint(theme, ci);
        const chCleared = chapterLevels.filter((lv) => bestMap[lv.id]).length;
        const chStars = chapterLevels.reduce((s, lv) => s + (bestMap[lv.id]?.stars || 0), 0);
        const chUnlocked = chapterLevels.some((lv) => lv.id <= progress.unlocked);
        const chPaywalled = !proUnlocked && start >= freeLevels;
        const pct = Math.round((chCleared / chapterLevels.length) * 100);
        const showStory = onReplayStory && (seenStory ? !!seenStory[ci] : true);

        return (
          <View key={ci} style={{ marginBottom: 4 }}>
            <View style={{ paddingHorizontal: 22, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: theme.hair2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                <View style={{ width: 4, height: 30, borderRadius: 3, backgroundColor: chUnlocked ? tint : theme.ink3, opacity: chUnlocked ? 1 : 0.5 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={[T.eyebrow, { color: chUnlocked ? tint : theme.ink3, fontSize: 9 }]}>CH {String(ci + 1).padStart(2, '0')}</Text>
                    <Text style={[T.display, { color: chUnlocked ? theme.ink : theme.ink3, fontSize: 17 }]}>{meta.name}</Text>
                    {!chUnlocked && !chPaywalled && PvIcon.lock(theme.ink3, 12)}
                    {chPaywalled && (
                      <Pressable onPress={() => onPaywall && onPaywall(chapterLevels[0])} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: theme.gold + '66', borderRadius: 7, paddingVertical: 2, paddingHorizontal: 7 }}>
                        {PvIcon.crown(theme.gold, 9)}
                        <Text style={[T.mono, { color: theme.gold, fontSize: 8.5, letterSpacing: 1, textTransform: 'uppercase' }]}>Pro</Text>
                      </Pressable>
                    )}
                    {showStory && (
                      <Pressable onPress={() => onReplayStory(ci)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: tint + '55', borderRadius: 7, paddingVertical: 2, paddingHorizontal: 7 }}>
                        <Svg width="7" height="8" viewBox="0 0 8 10"><Path d="M0 0l8 5-8 5z" fill={tint} /></Svg>
                        <Text style={[T.mono, { color: tint, fontSize: 8.5, letterSpacing: 1, textTransform: 'uppercase' }]}>Story</Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={[T.sans, { color: theme.ink3, fontSize: 11, marginTop: 2 }]}>{meta.sub}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[T.num, { color: theme.ink2, fontSize: 13 }]}>{chCleared}<Text style={{ color: theme.ink3 }}>/{chapterLevels.length}</Text></Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 }}>
                    <Star filled color={theme.gold} hollow={theme.gold} size={9} />
                    <Text style={[T.mono, { color: theme.ink3, fontSize: 10 }]}>{chStars}</Text>
                  </View>
                </View>
              </View>
              <View style={{ height: 3, borderRadius: 2, backgroundColor: theme.hair2, marginTop: 9, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${pct}%`, borderRadius: 2, backgroundColor: tint }} />
              </View>
            </View>

            {/* Only render the 30-tile grid for chapters you've reached — keeps
                the list from laying out all 300 tiles at once. Locked chapters
                collapse to a single row. */}
            {chUnlocked ? (
              <View style={{ paddingHorizontal: 22, paddingTop: 13, gap: 11 }}>
                {chunk(chapterLevels, 3).map((row, ri) => (
                  <View key={ri} style={{ flexDirection: 'row', gap: 11 }}>
                    {row.map((lv) => {
                      const best = bestMap[lv.id];
                      const paywalled = !proUnlocked && lv.id > freeLevels;
                      const unlocked = !paywalled && lv.id <= progress.unlocked;
                      const isCurrent = unlocked && !best;
                      return (
                        <LevelTile key={lv.id} lv={lv} num={lv.id} theme={theme} tint={tint} unlocked={unlocked} best={best} isCurrent={isCurrent} onPlay={onPlay} paywalled={paywalled} onPaywall={onPaywall} />
                      );
                    })}
                    {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, k) => <View key={`pad${k}`} style={{ flex: 1 }} />)}
                  </View>
                ))}
              </View>
            ) : (
              <Pressable
                onPress={() => chPaywalled && onPaywall && onPaywall(chapterLevels[0])}
                style={{ marginHorizontal: 22, marginTop: 13, borderRadius: 14, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.glassDk, borderWidth: 1, borderColor: theme.hair2 }}
              >
                {PvIcon.lock(chPaywalled ? theme.gold : theme.ink3, 16)}
                <Text style={[T.sans, { color: theme.ink3, fontSize: 12.5, flex: 1 }]}>
                  {chPaywalled ? 'Unlock all chapters with Pivot Pro' : `Clear Level ${chapterLevels[0].id - 1} to open this chapter`}
                </Text>
                {chPaywalled && <Text style={[T.mono, { color: theme.gold, fontSize: 10 }]}>PRO ›</Text>}
              </Pressable>
            )}
          </View>
        );
      })}

      <View style={{ paddingHorizontal: 22, paddingTop: 16, alignItems: 'center' }}>
        <Text style={[T.mono, { color: theme.ink3, fontSize: 10, letterSpacing: 1 }]}>{levels.length} handcrafted levels · {chapterCount} chapters</Text>
      </View>
    </View>
  );
}
