import { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { lineupSignedUrl } from '../api/lineups';
import { colors } from '../constants/theme';
import { fonts } from '../constants/fonts';

// A lineup photo thumbnail that never just vanishes. The photo lives in cloud
// storage, so with no connection the signed URL or the image download fails —
// previously that left a spinner forever or an empty box. Now it shows an
// offline placeholder, and retries by itself as soon as the connection is back.

const URL_TIMEOUT_MS = 8000;

export function LineupThumb({ path, width, height, borderRadius = 0 }: {
  path: string | null | undefined;
  width: number;
  height: number;
  borderRadius?: number;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setUrl(null);
    setFailed(false);
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), URL_TIMEOUT_MS));
    Promise.race([lineupSignedUrl(path).catch(() => null), timeout]).then((u) => {
      if (!active) return;
      if (u) setUrl(u); else setFailed(true);
    });
    return () => { active = false; };
  }, [path, attempt]);

  // Back online after a failure → try again.
  useEffect(() => {
    if (!failed) return;
    return NetInfo.addEventListener((s) => {
      if (s.isConnected && s.isInternetReachable !== false) setAttempt((a) => a + 1);
    });
  }, [failed]);

  const box = { width, height, borderRadius };
  if (failed) return <OfflinePhotoPlaceholder width={width} height={height} borderRadius={borderRadius} />;
  if (!url) {
    return <View style={[styles.placeholder, box]}><ActivityIndicator color={colors.gold} /></View>;
  }
  return <Image source={{ uri: url }} style={box} resizeMode="cover" onError={() => setFailed(true)} />;
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
