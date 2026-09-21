import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { searchWines, type WineSearchResult } from '../api/label';
import { formatWineTitle } from '../utils/wineTitle';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

interface Props {
  // Called when the user taps a suggestion — fills the identity fields.
  onSelect: (result: WineSearchResult) => void;
  // Optional starting text — used when the user typed a wine in the Review
  // tab's "Search A Wine" bar and we carry it straight into this box.
  initialQuery?: string;
}

// Predictive "search your wine" box for manual entry. As the user types
// (debounced, from 3 characters) it lists real matching wines; picking one fills
// the producer / name / region / style fields below. The user can still edit
// those fields afterwards — this is a shortcut, not a lock-in.
export function WineSearchInput({ onSelect, initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery ?? '');
  const [results, setResults] = useState<WineSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const reqIdRef = useRef(0);
  // Set true when the query was filled by picking a suggestion, so the effect
  // doesn't immediately re-search (and re-open the dropdown) for that value.
  const skipSearch = useRef(false);

  useEffect(() => {
    if (skipSearch.current) { skipSearch.current = false; setLoading(false); setOpen(false); return; }
    const q = query.trim();
    if (q.length < 3) { setResults([]); setLoading(false); setOpen(false); return; }
    setLoading(true);
    setOpen(true);
    const id = ++reqIdRef.current;
    const t = setTimeout(async () => {
      try {
        const r = await searchWines(q);
        // Ignore stale responses (a newer keystroke superseded this one).
        if (id !== reqIdRef.current) return;
        setResults(r);
      } catch {
        if (id === reqIdRef.current) setResults([]);
      } finally {
        if (id === reqIdRef.current) setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  function choose(r: WineSearchResult) {
    onSelect(r);
    // Keep the chosen wine in the bar (rather than clearing it) so the user can
    // see what they picked; suppress the follow-up search it would trigger.
    skipSearch.current = true;
    setQuery([r.producer, r.wineName, r.vintage].filter(Boolean).join(' '));
    setResults([]);
    setOpen(false);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Search your wine</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Start typing — e.g. Penfolds Grange"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {loading ? <ActivityIndicator color={colors.gold} style={styles.spinner} /> : null}
      </View>
      {open && (loading || results.length > 0 || query.trim().length >= 3) ? (
        <View style={styles.dropdown}>
          {results.length === 0 && loading ? (
            <Text style={styles.searchingText}>Searching…</Text>
          ) : (
            <>
              {results.map((r, i) => (
                <TouchableOpacity key={`${r.producer}-${r.wineName ?? ''}-${i}`} style={styles.option} onPress={() => choose(r)} activeOpacity={0.7}>
                  <Text style={styles.optionName}>
                    {formatWineTitle({ producer: r.producer, wineName: r.wineName, region: r.region })}
                  </Text>
                  {r.style ? (
                    <Text style={styles.optionMeta} numberOfLines={1}>{r.style}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
              {/* Always-present escape hatch: rare bottles Vinster doesn't know
                  (or mis-guesses) are never a dead end — enter them as typed and
                  edit the fields below. */}
              {!loading && query.trim().length >= 3 ? (
                <TouchableOpacity style={styles.option} onPress={() => {
                  // Split a typed-in vintage off the free-text name so "…2009" fills
                  // the vintage field rather than becoming part of the wine name.
                  const typed = query.trim();
                  const vm = typed.match(/\b(?:19|20)\d{2}\b/);
                  const v = vm ? vm[0] : null;
                  const name = v ? typed.replace(vm![0], ' ').replace(/\s{2,}/g, ' ').trim() : typed;
                  choose({ producer: name || typed, wineName: null, region: null, style: null, grape: null, vintage: v });
                }} activeOpacity={0.7}>
                  <Text style={styles.optionName} numberOfLines={2}>Use “{query.trim()}”</Text>
                  <Text style={styles.optionMeta}>{results.length ? "Not listed? Add it as typed and edit below." : "No matches — add it as typed and edit the details below."}</Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: { position: 'relative', justifyContent: 'center' },
  input: {
    borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md,
    paddingRight: 40, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface,
  },
  spinner: { position: 'absolute', right: spacing.md },
  dropdown: {
    borderWidth: 1, borderColor: colors.border, borderTopWidth: 0,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: colors.surfaceElevated, overflow: 'hidden',
  },
  searchingText: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, padding: spacing.md },
  option: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  optionMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  hint: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
});
