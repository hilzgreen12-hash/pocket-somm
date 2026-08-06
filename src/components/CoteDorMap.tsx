import { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SvgXml, Svg, Line, Circle } from 'react-native-svg';
import { COTE_DOR_VIEWBOX, COTE_DOR_PATHS } from '../../assets/maps/coteDorMap';
import coteDorData from '../../assets/maps/cote-dor.data.json';
import { fonts } from '../constants/fonts';

// Côte d'Or map: the recovered atlas silhouettes rendered via react-native-svg,
// with the villages + the user's own producers drawn over the top in RN so the
// labels stay crisp and we control what's owned. Producers are grouped by
// village by the caller (producersByVillage), keyed by the village name.
//
// The villages run down a NE→SW diagonal on the right/centre of the sheet, so
// the labels are pulled out into a single column down the empty left margin and
// spread vertically (greedy, so none overlap even at 1×), each tied back to its
// exact point by a leader line. The whole thing also pinch-zooms + pans inside a
// clipped viewport (the wine-rack gesture pattern); the map, leaders, dots and
// labels share one transformed layer, so a dot stays on its point at every zoom.

const [, , VB_W, VB_H] = COTE_DOR_VIEWBOX.split(' ').map(Number);
const SVG_XML = `<svg viewBox="${COTE_DOR_VIEWBOX}" xmlns="http://www.w3.org/2000/svg">${COTE_DOR_PATHS}</svg>`;

// Parchment ground + ink, matching the Cabotte look of the source atlas.
const PARCHMENT = '#F4F1EA';
const INK = '#3A2018';
const INK_MUTED = '#8A7A66';
const WINE = '#6E2233';
const MAX_ZOOM = 6;
const GAP = 4; // min vertical gap between stacked labels (px, at 1×)

interface Props {
  // village name -> distinct producer names the user holds there.
  producersByVillage: Record<string, string[]>;
}

export function CoteDorMap({ producersByVillage }: Props) {
  const [width, setWidth] = useState(0);
  const scale = width > 0 ? width / VB_W : 0;
  const height = VB_H * scale;
  // Left rail the callout labels right-align against; leaders start here.
  const rail = Math.round(width * 0.34);

  // Callout layout: labels down the left margin, sorted by latitude, each nudged
  // down only as far as needed to clear the one above it (greedy). anchorY is
  // where the leader meets the label; (dotX,dotY) is the true point.
  const layout = useMemo(() => {
    if (scale <= 0) return [] as Array<{ name: string; producers: string[]; owned: boolean; dotX: number; dotY: number; top: number; h: number; anchorY: number }>;
    const villages = [...coteDorData.villages].sort((a, b) => a.y - b.y);
    let prevBottom = -Infinity;
    return villages.map((v) => {
      const producers = producersByVillage[v.name] ?? [];
      const h = 12 + producers.length * 10;
      let top = v.y * scale - h / 2;
      if (top < prevBottom + GAP) top = prevBottom + GAP;
      prevBottom = top + h;
      return { name: v.name, producers, owned: producers.length > 0, dotX: v.x * scale, dotY: v.y * scale, top, h, anchorY: top + h / 2 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, producersByVillage]);

  // In-place pinch/pan (JS-thread Animated via runOnJS, no Reanimated).
  const [isZoomed, setIsZoomed] = useState(false);
  const zScale = useRef(new Animated.Value(1)).current;
  const zTx = useRef(new Animated.Value(0)).current;
  const zTy = useRef(new Animated.Value(0)).current;
  const zBase = useRef({ scale: 1, tx: 0, ty: 0 }).current;
  const zCur = useRef({ scale: 1, tx: 0, ty: 0 }).current;

  function resetZoom() {
    zBase.scale = 1; zCur.scale = 1; zBase.tx = 0; zBase.ty = 0; zCur.tx = 0; zCur.ty = 0;
    Animated.parallel([
      Animated.timing(zScale, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.timing(zTx, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(zTy, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start();
    setIsZoomed(false);
  }

  function clampPan(tx: number, ty: number, s: number) {
    const maxX = Math.max(0, (width * s - width) / 2);
    const maxY = Math.max(0, (height * s - height) / 2);
    return { tx: Math.min(maxX, Math.max(-maxX, tx)), ty: Math.min(maxY, Math.max(-maxY, ty)) };
  }

  const gesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onUpdate((e) => {
        let s = zBase.scale * e.scale;
        if (s < 1) s = 1;
        if (s > MAX_ZOOM) s = MAX_ZOOM;
        zCur.scale = s;
        zScale.setValue(s);
        const c = clampPan(zCur.tx, zCur.ty, s);
        zCur.tx = c.tx; zCur.ty = c.ty;
        zTx.setValue(c.tx); zTy.setValue(c.ty);
      })
      .onEnd(() => {
        zBase.scale = zCur.scale; zBase.tx = zCur.tx; zBase.ty = zCur.ty;
        if (zCur.scale <= 1.02) resetZoom();
        else if (!isZoomed) setIsZoomed(true);
      });
    const pan = Gesture.Pan()
      .enabled(isZoomed)
      .runOnJS(true)
      .minDistance(2)
      .onUpdate((e) => {
        const c = clampPan(zBase.tx + e.translationX, zBase.ty + e.translationY, zCur.scale);
        zCur.tx = c.tx; zCur.ty = c.ty;
        zTx.setValue(c.tx); zTy.setValue(c.ty);
      })
      .onEnd(() => { zBase.tx = zCur.tx; zBase.ty = zCur.ty; });
    return Gesture.Simultaneous(pinch, pan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isZoomed, width, height]);

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <GestureHandlerRootView style={{ width, height }}>
          <GestureDetector gesture={gesture}>
            <View style={{ width, height, overflow: 'hidden' }}>
              <Animated.View style={{ width, height, transform: [{ translateX: zTx }, { translateY: zTy }, { scale: zScale }] }}>
                <SvgXml xml={SVG_XML} width={width} height={height} />
                {/* Leaders + dots — accurate arbitrary-angle lines from each
                    label anchor to its true village point. */}
                <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
                  {layout.map((l) => (
                    <Line key={`ln-${l.name}`} x1={rail} y1={l.anchorY} x2={l.dotX} y2={l.dotY} stroke={l.owned ? WINE : INK_MUTED} strokeWidth={0.6} opacity={l.owned ? 0.9 : 0.5} />
                  ))}
                  {layout.map((l) => (
                    <Circle key={`dt-${l.name}`} cx={l.dotX} cy={l.dotY} r={2.4} fill={l.owned ? WINE : INK_MUTED} opacity={l.owned ? 1 : 0.6} />
                  ))}
                </Svg>
                {/* Labels, right-aligned against the left rail. */}
                {layout.map((l) => (
                  <View key={`lb-${l.name}`} style={[styles.label, { top: l.top, width: rail - 3 }]}>
                    <Text style={[styles.village, l.owned && styles.villageOwned]} numberOfLines={1}>{l.name}</Text>
                    {l.producers.map((p, i) => (
                      <Text key={i} style={styles.producer} numberOfLines={1}>{p}</Text>
                    ))}
                  </View>
                ))}
              </Animated.View>
            </View>
          </GestureDetector>
          {isZoomed ? <Text style={styles.zoomHint}>Pinch to zoom · drag to pan</Text> : null}
        </GestureHandlerRootView>
      ) : (
        <View style={{ height: 240 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: PARCHMENT, borderRadius: 12, overflow: 'hidden' },
  // Callout label: pinned to the left edge, right-aligned so its text ends at
  // the rail where the leader begins.
  label: { position: 'absolute', left: 0, alignItems: 'flex-end' },
  village: { fontFamily: fonts.bodyRegular, fontSize: 8.5, color: INK_MUTED, letterSpacing: 0.2, textAlign: 'right' },
  villageOwned: { fontFamily: fonts.bodySemibold, fontSize: 9.5, color: INK },
  producer: { fontFamily: fonts.bodySemibold, fontSize: 8, color: WINE, marginTop: 0.5, textAlign: 'right' },
  zoomHint: { position: 'absolute', bottom: 6, alignSelf: 'center', fontFamily: fonts.bodyRegular, fontSize: 10, color: INK_MUTED },
});
