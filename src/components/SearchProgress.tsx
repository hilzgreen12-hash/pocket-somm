import { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

interface Props {
  title: string;
  subtitle: string;
  body: string;
  durationMs?: number;
}

export function SearchProgress({ title, subtitle, body, durationMs = 50000 }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const id = progress.addListener(({ value }) => setPct(Math.round(value)));
    Animated.timing(progress, {
      toValue: 85,
      duration: durationMs,
      useNativeDriver: false,
    }).start();
    return () => progress.removeListener(id);
  }, []);

  const widthPercent = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Vinster</Text>

      <View style={styles.progressWrap}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: widthPercent }]} />
        </View>
        <Text style={styles.percent}>{pct}%</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.timing}>{subtitle}</Text>
      <Text style={styles.body}>{body}</Text>
      <Text style={styles.stayNote}>Please keep this page open</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  brand: {
    fontSize: 36,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.text,
    letterSpacing: 1.5,
    marginBottom: spacing.xxl,
  },
  progressWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  track: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 1,
  },
  percent: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 13,
    color: colors.gold,
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  timing: {
    fontSize: 15,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 14,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  stayNote: {
    fontSize: 12,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.textMuted,
    textAlign: 'center',
    opacity: 0.8,
  },
});
