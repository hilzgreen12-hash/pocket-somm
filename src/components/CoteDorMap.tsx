import { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';
import { COTE_DOR_VIEWBOX, COTE_DOR_PATHS } from '../../assets/maps/coteDorMap';
import coteDorData from '../../assets/maps/cote-dor.data.json';
import { fonts } from '../constants/fonts';

// Côte d'Or map: the recovered atlas silhouettes rendered via react-native-svg,
// with the villages + the user's own producers drawn over the top in RN so the
// labels stay crisp and we control what's owned. Producers are grouped by
// village by the caller (producersByVillage), keyed by the village name.
//
// The whole thing pinch-zooms + pans inside a clipped viewport (same in-place
// gesture pattern as the wine racks), so dense labels that overlap at 1× can be
// separated just by zooming in. The SVG and the labels live in one transformed
// layer, so a village dot stays exactly on its point at every zoom level.

const [, , VB_W, VB_H] = COTE_DOR_VIEWBOX.split(' ').map(Number);
const SVG_XML = `<svg viewBox="${COTE_DOR_VIEWBOX}" xmlns="http://www.w3.org/2000/svg">${COTE_DOR_PATHS}</svg>`;

// Parchment ground + ink, matching the Cabotte look of the source atlas.
const PARCHMENT = '#F4F1EA';
const INK = '#3A2018';
const INK_MUTED = '#8A7A66';
const WINE = '#6E2233';
const MAX_ZOOM = 6;

interface Props {
  // village name -> distinct producer names the user holds there.
  producersByVillage: Record<string, string[]>;
}

export function CoteDorMap({ producersByVillage }: Props) {
  const [width, setWidth] = useState(0);
  const scale = width > 0 ? width / VB_W : 0;
  const height = VB_H * scale;

  // In-place pinch/pan (JS-thread Animated via runOnJS, no Reanimated). zBase =
  // committed at gesture start; zCur = live.
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

  // Clamp the pan so the content can't be dragged past its own edges out of the
  // clipped viewport.
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
                {coteDorData.villages.map((v) => {
                  const producers = producersByVillage[v.name] ?? [];
                  const owned = producers.length > 0;
                  return (
                    // Anchor sits exactly on the village point; the dot is centred
                    // on it and a short leader connects it to the name.
                    <View key={v.name} style={[styles.labelAnchor, { left: v.x * scale, top: v.y * scale }]}>
                      <View style={[styles.dot, owned ? styles.dotOwned : styles.dotEmpty]} />
                      <View style={[styles.leader, owned ? styles.leaderOwned : styles.leaderEmpty]} />
                      <View style={styles.labelText}>
                        <Text style={[styles.village, owned && styles.villageOwned]} numberOfLines={1}>{v.name}</Text>
                        {producers.map((p, i) => (
                          <Text key={i} style={styles.producer} numberOfLines={1}>{p}</Text>
                        ))}
                      </View>
                    </View>
                  );
                })}
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

const DOT = 5;
const styles = StyleSheet.create({
  wrap: { backgroundColor: PARCHMENT, borderRadius: 12, overflow: 'hidden' },
  // Row anchored so the dot's centre lands on the village point (pull the row
  // left/up by half the dot). Leader + name follow tight to the right.
  labelAnchor: { position: 'absolute', flexDirection: 'row', alignItems: 'center', marginLeft: -DOT / 2, marginTop: -DOT / 2 },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  dotOwned: { backgroundColor: WINE },
  dotEmpty: { backgroundColor: INK_MUTED, opacity: 0.55 },
  // Short leader line from the dot to the name — makes clear which point a name
  // belongs to without pushing the name away from the map.
  leader: { height: 1, width: 5 },
  leaderOwned: { backgroundColor: WINE },
  leaderEmpty: { backgroundColor: INK_MUTED, opacity: 0.5 },
  labelText: { marginLeft: 1 },
  village: { fontFamily: fonts.bodyRegular, fontSize: 8.5, color: INK_MUTED, letterSpacing: 0.2 },
  villageOwned: { fontFamily: fonts.bodySemibold, fontSize: 9.5, color: INK },
  producer: { fontFamily: fonts.bodySemibold, fontSize: 8, color: WINE, marginTop: 0.5 },
  zoomHint: { position: 'absolute', bottom: 6, alignSelf: 'center', fontFamily: fonts.bodyRegular, fontSize: 10, color: INK_MUTED },
});
