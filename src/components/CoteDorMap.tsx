import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { COTE_DOR_VIEWBOX, COTE_DOR_PATHS } from '../../assets/maps/coteDorMap';
import coteDorData from '../../assets/maps/cote-dor.data.json';
import { fonts } from '../constants/fonts';

// Côte d'Or map: the recovered atlas silhouettes rendered via react-native-svg,
// with the villages + the user's own producers drawn over the top in RN so the
// labels stay crisp and we control what's owned. Producers are grouped by
// village by the caller (producersByVillage), keyed by the village name.

const [, , VB_W, VB_H] = COTE_DOR_VIEWBOX.split(' ').map(Number);
const SVG_XML = `<svg viewBox="${COTE_DOR_VIEWBOX}" xmlns="http://www.w3.org/2000/svg">${COTE_DOR_PATHS}</svg>`;

// Parchment ground + ink, matching the Cabotte look of the source atlas.
const PARCHMENT = '#F4F1EA';
const INK = '#3A2018';
const INK_MUTED = '#8A7A66';
const WINE = '#6E2233';

interface Props {
  // village name -> distinct producer names the user holds there.
  producersByVillage: Record<string, string[]>;
}

export function CoteDorMap({ producersByVillage }: Props) {
  const [width, setWidth] = useState(0);
  const scale = width > 0 ? width / VB_W : 0;
  const height = VB_H * scale;

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <View style={{ width, height }}>
          <SvgXml xml={SVG_XML} width={width} height={height} />
          {coteDorData.villages.map((v) => {
            const producers = producersByVillage[v.name] ?? [];
            const owned = producers.length > 0;
            return (
              <View key={v.name} style={[styles.labelAnchor, { left: v.x * scale, top: v.y * scale }]}>
                <View style={styles.labelRow}>
                  <View style={[styles.dot, owned ? styles.dotOwned : styles.dotEmpty]} />
                  <View style={styles.labelText}>
                    <Text style={[styles.village, owned && styles.villageOwned]} numberOfLines={1}>{v.name}</Text>
                    {producers.map((p, i) => (
                      <Text key={i} style={styles.producer} numberOfLines={1}>{p}</Text>
                    ))}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={{ height: 240 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: PARCHMENT, borderRadius: 12, overflow: 'hidden' },
  // Anchored at the village's baseline point; nudged up so the row sits on it.
  labelAnchor: { position: 'absolute', transform: [{ translateY: -6 }] },
  labelRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
  dotOwned: { backgroundColor: WINE },
  dotEmpty: { backgroundColor: INK_MUTED, opacity: 0.5 },
  labelText: {},
  village: { fontFamily: fonts.bodyRegular, fontSize: 8.5, color: INK_MUTED, letterSpacing: 0.2 },
  villageOwned: { fontFamily: fonts.bodySemibold, fontSize: 9.5, color: INK },
  producer: { fontFamily: fonts.bodySemibold, fontSize: 8, color: WINE, marginTop: 0.5 },
});
