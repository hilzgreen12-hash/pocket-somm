import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { repairLabelImage, useLabelImageState } from '../hooks/useLabelImageUrl';
import { LabelImage } from './LabelImage';
import { colors } from '../constants/theme';
import { fonts } from '../constants/fonts';

// A lineup photo thumbnail that never just vanishes. Lineup photos share the
// label bucket, so they go through the same on-disk cache: downloaded once,
// then drawn instantly (and offline) from a small cached thumbnail. With no
// connection on a first view it shows an offline placeholder, and retries by
// itself as soon as the connection is back.
export function LineupThumb({ path, width, height, borderRadius = 0 }: {
  path: string | null | undefined;
  width: number;
  height: number;
  borderRadius?: number;
}) {
  const qc = useQueryClient();
  const { uri, pending } = useLabelImageState(path, 'thumb');
  const failed = !pending && !uri;

  // Back online after a failure → try again.
  useEffect(() => {
    if (!failed || !path) return;
    return NetInfo.addEventListener((s) => {
      if (s.isConnected && s.isInternetReachable !== false) void qc.invalidateQueries({ queryKey: ['label-image', path] });
    });
  }, [failed, path, qc]);

  const box = { width, height, borderRadius };
  if (failed) return <OfflinePhotoPlaceholder width={width} height={height} borderRadius={borderRadius} />;
  if (!uri) {
    return <View style={[styles.placeholder, box]}><ActivityIndicator color={colors.gold} /></View>;
  }
  return <LabelImage uri={uri} style={box} onError={() => repairLabelImage(qc, path)} />;
}

// Shown in place of a cloud photo that can't load (no connection).
export function OfflinePhotoPlaceholder({ width, height, borderRadius = 0 }: {
  width: number | '100%';
  height: number;
  borderRadius?: number;
}) {
  const roomy = width === '100%' || width >= 120;
  return (
    <View style={[styles.placeholder, { width, height, borderRadius }]}>
      <Ionicons name="cloud-offline-outline" size={roomy ? 28 : 20} color={colors.gold} allowFontScaling={false} />
      {roomy ? <Text style={styles.placeholderText} allowFontScaling={false}>Photo will appear when you're back online</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  placeholderText: {
    marginTop: 6,
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
});
