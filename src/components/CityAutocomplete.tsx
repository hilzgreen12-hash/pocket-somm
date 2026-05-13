import { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { CITIES } from '../constants/cities';
import { useCityHistory } from '../hooks/useCityHistory';
import { colors, spacing } from '../constants/theme';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  // Called when the user accepts a suggestion (taps a row) or commits the
  // field (blur). Stores the city in the user's history so it surfaces first
  // on future fields.
  onCommit?: (v: string) => void;
  placeholder?: string;
  style?: StyleProp<TextStyle>;
  placeholderTextColor?: string;
  autoFocus?: boolean;
  maxSuggestions?: number;
}

const DEFAULT_MAX = 6;

function matches(query: string, city: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const c = city.toLowerCase();
  if (c.startsWith(q)) return true;
  // Match on word boundary too — so "ang" finds "Los Angeles".
  for (const word of c.split(/\s|-/)) {
    if (word.startsWith(q)) return true;
  }
  return false;
}

export function CityAutocomplete({ value, onChangeText, onCommit, placeholder = 'City', style, placeholderTextColor, autoFocus, maxSuggestions = DEFAULT_MAX }: Props) {
  const { history, recordCity } = useCityHistory();
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim();
    if (!q) return [];
    // History first (most-recent order), then bundled cities. De-duplicate
    // case-insensitively so a city in both lists shows once.
    const seen = new Set<string>();
    const out: { city: string; source: 'history' | 'list' }[] = [];
    for (const h of history) {
      if (matches(q, h) && !seen.has(h.toLowerCase())) {
        seen.add(h.toLowerCase());
        out.push({ city: h, source: 'history' });
        if (out.length >= maxSuggestions) return out;
      }
    }
    for (const c of CITIES) {
      if (matches(q, c) && !seen.has(c.toLowerCase())) {
        seen.add(c.toLowerCase());
        out.push({ city: c, source: 'list' });
        if (out.length >= maxSuggestions) break;
      }
    }
    return out;
  }, [value, history, maxSuggestions]);

  function handleSelect(city: string) {
    onChangeText(city);
    recordCity(city);
    onCommit?.(city);
    setFocused(false);
  }

  function handleBlur() {
    setFocused(false);
    const trimmed = value.trim();
    if (trimmed) {
      recordCity(trimmed);
      onCommit?.(trimmed);
    }
  }

  const showSuggestions = focused && suggestions.length > 0;

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor ?? colors.textMuted}
        style={style}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="words"
      />
      {showSuggestions && (
        <View style={styles.dropdown}>
          {suggestions.map((s) => (
            <TouchableOpacity
              key={`${s.source}:${s.city}`}
              style={styles.row}
              onPress={() => handleSelect(s.city)}
              activeOpacity={0.7}
            >
              <Text style={styles.rowText}>{s.city}</Text>
              {s.source === 'history' && <Text style={styles.rowHint}>recent</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  rowHint: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 12,
    color: colors.gold,
    marginLeft: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
