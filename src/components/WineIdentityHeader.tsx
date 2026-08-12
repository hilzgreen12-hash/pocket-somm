import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../constants/theme';
import { fonts } from '../constants/fonts';
import { wineHeaderLine } from '../utils/wineHeader';

// The one canonical wine header used across the whole app — wine cards, review
// pages, scan/intel cards and modals. Enforces a single, consistent identity:
//
//   Line 1 (white)  Producer · Wine Name · Vintage
//   Line 2 (gold)   Region
//   Line 3 (gold)   Grape variety   (same face as the region line)
//
// Field names differ per data type (wine_name vs name vs wineName, grape_variety
// vs grape), so each caller maps the right fields into these normalised props.
// `size` and `align` cover the layout variation between a full card header, a
// centred modal header and a compact review-card header without letting the
// STRUCTURE drift.

export type WineHeaderSize = 'sm' | 'md' | 'lg';

export interface WineIdentityHeaderProps {
  producer?: string | null;
  wineName?: string | null;
  vintage?: string | number | null;
  region?: string | null;
  grape?: string | null;
  align?: 'left' | 'center';
  size?: WineHeaderSize;
  containerStyle?: StyleProp<ViewStyle>;
  nameStyle?: StyleProp<TextStyle>;
  subStyle?: StyleProp<TextStyle>;
  numberOfLinesName?: number;
}

const SIZE: Record<WineHeaderSize, { name: number; sub: number }> = {
  sm: { name: 16, sub: 13 },
  md: { name: 21, sub: 15 },
  lg: { name: 24, sub: 15.5 },
};

export function WineIdentityHeader({
  producer,
  wineName,
  vintage,
  region,
  grape,
  align = 'center',
  size = 'md',
  containerStyle,
  nameStyle,
  subStyle,
  numberOfLinesName,
}: WineIdentityHeaderProps) {
  const line1 = wineHeaderLine(producer, wineName, vintage);
  const regionText = (region ?? '').trim();
  const grapeText = (grape ?? '').trim();
  const textAlign = align === 'center' ? 'center' : 'left';
  const s = SIZE[size];

  return (
    <View style={containerStyle}>
      {!!line1 && (
        <Text
          style={[styles.name, { fontSize: s.name, textAlign }, nameStyle]}
          numberOfLines={numberOfLinesName}
        >
          {line1}
        </Text>
      )}
      {!!regionText && (
        <Text style={[styles.sub, { fontSize: s.sub, textAlign }, subStyle]}>{regionText}</Text>
      )}
      {!!grapeText && (
        <Text style={[styles.sub, { fontSize: s.sub, textAlign, marginTop: 1 }, subStyle]}>
          {grapeText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Producer · Wine Name · Vintage — white, editorial display face.
  name: {
    fontFamily: fonts.headingBold,
    color: colors.text,
  },
  // Region, then grape — gold italic subtitle, same face for both so they read
  // as one identity block beneath the name.
  sub: {
    fontFamily: fonts.headingItalic,
    color: colors.gold,
    fontStyle: 'italic',
    marginTop: 3,
  },
});
