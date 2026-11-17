import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MicButton } from './MicButton';
import { showAlert } from './AppAlert';
import { formatCurrency } from '../constants/currency';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Personal Notes are a short private aside. A longer existing note (e.g. from
// an import) is kept whole when edited — the cap only stops it growing.
const PERSONAL_NOTES_MAX = 50;

interface Props {
  // Your Score (0–100).
  score: number | null;
  onScore: (n: number | null) => void;
  // Price Paid (free numeric string) + currency for the symbol.
  pricePaid: string;
  onPricePaid: (s: string) => void;
  currency: string;
  // Estimated Value — generated on demand via onEstimate when provided.
  estimatedValue: number | null;
  estimatedValueAt?: string | null;
  estimating?: boolean;
  onEstimate?: () => void;
  // Your Review (sharable) + Personal Notes (private), both dictatable.
  review: string;
  onReview: (s: string) => void;
  personalNotes: string;
  onPersonalNotes: (s: string) => void;
  // The review's city, edited on the card's date · city · venue line above
  // these fields. A review can't be saved without one.
  city: string;
  drinkingWindow: string;
  onDrinkingWindow: (s: string) => void;
  // Save (+ optional delete).
  saving?: boolean;
  // When true the save button reads "Review Saved" in gold — set by the parent
  // after a successful save, cleared when the user edits a field again.
  saved?: boolean;
  onSave: () => void;
  saveLabel?: string;
  savedLabel?: string;
  // Render the primary save button in gold (border + text) rather than white.
  goldSave?: boolean;
  onDelete?: () => void;
  deleteLabel?: string;
}

// The shared wine-review input body, used by every Your Wine Reviews input
// (add, edit, cellar) so they're exactly the same. Order: Your Score → Your
// Review → Personal Notes → Drinking Window → Price Paid · Estimated Value →
// Save → Delete. The parent owns state, save and the surrounding card chrome.
export function WineReviewFields({
  score, onScore, pricePaid, onPricePaid, currency,
  estimatedValue, estimatedValueAt, estimating, onEstimate,
  review, onReview, personalNotes, onPersonalNotes,
  city, drinkingWindow, onDrinkingWindow,
  saving, saved, onSave, saveLabel, savedLabel, goldSave, onDelete, deleteLabel,
}: Props) {
  const currencySymbol = formatCurrency(0, currency, { decimals: 0 }).replace(/[\d.,\s]/g, '') || currency;
  const personalNotesMax = Math.max(PERSONAL_NOTES_MAX, personalNotes.length);

  // Drinking window as TWO year fields (From / To) — no free text like
  // "until 2050". Stored as a single "YYYY - YYYY" string via drinkingWindow, so
  // callers don't change. Sync local state from the prop only on EXTERNAL
  // changes (a new wine loading), not on our own edits.
  const dwYears = (drinkingWindow ?? '').match(/\d{4}/g) ?? [];
  const [fromYear, setFromYear] = useState(dwYears[0] ?? '');
  const [toYear, setToYear] = useState(dwYears[1] ?? '');
  const lastEmitted = useRef<string | null>(null);
  useEffect(() => {
    if (drinkingWindow === lastEmitted.current) return; // our own edit — ignore
    const years = (drinkingWindow ?? '').match(/\d{4}/g) ?? [];
    setFromYear(years[0] ?? '');
    setToYear(years[1] ?? '');
  }, [drinkingWindow]);
  function emitDrinkingWindow(f: string, t: string) {
    const combined = f && t ? `${f} - ${t}` : (f || t || '');
    lastEmitted.current = combined;
    onDrinkingWindow(combined);
  }

  return (
    <>
      {/* Your Score — top of the card, styled like the other section headers. */}
      <Text style={styles.sectionTitle}>Your Score</Text>
      <TextInput
        style={[styles.input, styles.scoreInput]}
        value={score != null ? String(score) : ''}
        onChangeText={(t) => {
          const digits = t.replace(/[^0-9]/g, '').slice(0, 3);
          if (digits === '') { onScore(null); return; }
          const n = parseInt(digits, 10);
          if (!isNaN(n)) onScore(Math.min(100, Math.max(0, n)));
        }}
        keyboardType="number-pad"
        placeholder="e.g. 92"
        placeholderTextColor={colors.textMuted}
        maxLength={3}
      />

      {/* Your Review */}
      <View style={styles.dictateRow}>
        <Text style={styles.sectionTitle}>Your Review</Text>
        <MicButton value={review} onChangeText={onReview} onClear={() => onReview('')} domain="note" serverCorrect />
      </View>
      <TextInput
        style={[styles.input, styles.noteInput]}
        value={review}
        onChangeText={onReview}
        placeholder="What you thought of the wine — taste, occasion, anything worth sharing."
        placeholderTextColor={colors.textMuted}
        multiline numberOfLines={4} textAlignVertical="top"
      />

      {/* Personal Notes */}
      <View style={styles.dictateRow}>
        <Text style={styles.sectionTitle}>Personal Notes</Text>
        <MicButton value={personalNotes} onChangeText={onPersonalNotes} onClear={() => onPersonalNotes('')} domain="note" serverCorrect />
      </View>
      <TextInput
        style={[styles.input, styles.noteInput]}
        value={personalNotes}
        onChangeText={(t) => onPersonalNotes(t.slice(0, personalNotesMax))}
        placeholder={`A short private note — max ${PERSONAL_NOTES_MAX} characters.`}
        placeholderTextColor={colors.textMuted}
        maxLength={personalNotesMax}
        multiline numberOfLines={2} textAlignVertical="top"
      />

      {/* Drinking Window — the user's own call, as a start + end year. */}
      <Text style={styles.fieldLabel}>Drinking Window — your call (optional)</Text>
      <View style={styles.dwRow}>
        <TextInput
          style={[styles.input, styles.dwInput]}
          value={fromYear}
          onChangeText={(t) => { const v = t.replace(/[^0-9]/g, '').slice(0, 4); setFromYear(v); emitDrinkingWindow(v, toYear); }}
          placeholder="From (e.g. 2026)"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={4}
        />
        <Text style={styles.dwDash}>–</Text>
        <TextInput
          style={[styles.input, styles.dwInput]}
          value={toYear}
          onChangeText={(t) => { const v = t.replace(/[^0-9]/g, '').slice(0, 4); setToYear(v); emitDrinkingWindow(fromYear, v); }}
          placeholder="To (e.g. 2032)"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>

      {/* Price Paid | Estimated Value — often already known, so kept low. */}
      <View style={styles.pairRow}>
        <View style={styles.pairCell}>
          <Text style={styles.fieldLabel}>Price Paid (optional)</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceCurrency}>{currencySymbol}</Text>
            <TextInput
              style={styles.priceInput}
              value={pricePaid}
              onChangeText={(t) => onPricePaid(t.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>
        <View style={styles.pairCell}>
          <Text style={styles.fieldLabel}>Estimated Value</Text>
          {estimating ? (
            <Text style={[styles.estValue, styles.estMuted]}>Estimating…</Text>
          ) : estimatedValue != null ? (
            onEstimate ? (
              <TouchableOpacity onPress={onEstimate} activeOpacity={0.7}>
                <Text style={[styles.estValue, styles.estGold]}>
                  {formatCurrency(estimatedValue, currency, { decimals: 0 })}
                  <Text style={styles.estLink}> (update)</Text>
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.estValue, styles.estGold]}>{formatCurrency(estimatedValue, currency, { decimals: 0 })}</Text>
            )
          ) : onEstimate ? (
            <TouchableOpacity onPress={onEstimate} activeOpacity={0.7}>
              <Text style={styles.estGenerate}>Generate</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.estValue, styles.estMuted]}>—</Text>
          )}
          {estimatedValueAt && estimatedValue != null ? (
            <Text style={styles.estSub}>{new Date(estimatedValueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          ) : null}
        </View>
      </View>

      {/* Save Review — primary action at the top of the button stack. */}
      <TouchableOpacity
        style={[styles.saveButton, (saved || goldSave) && styles.saveButtonSaved]}
        onPress={() => {
          if (!city.trim()) { showAlert({ title: 'Add a location', body: 'Add at least a city before saving your review.' }); return; }
          onSave();
        }}
        disabled={saving}
        activeOpacity={0.85}
      >
        <Text style={[styles.saveButtonText, (saved || goldSave) && styles.saveButtonTextSaved]}>
          {saving ? 'Saving…' : saved ? (savedLabel ?? 'Review Saved') : (saveLabel ?? 'Save Review')}
        </Text>
      </TouchableOpacity>

      {onDelete ? (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteText}>{deleteLabel ?? 'Delete this review'}</Text>
        </TouchableOpacity>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  dwRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dwInput: { flex: 1, textAlign: 'center' },
  dwDash: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.textMuted, marginBottom: spacing.md },

  scoreInput: { width: 96 },
  noteInput: { minHeight: 90 },
  pairRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xs },
  pairCell: { flex: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, backgroundColor: colors.surface, marginBottom: spacing.md },
  priceCurrency: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.textMuted, marginRight: 4 },
  priceInput: { flex: 1, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, paddingVertical: spacing.xs },
  estValue: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, lineHeight: 20, paddingVertical: spacing.xs },
  estMuted: { color: colors.textMuted, fontFamily: fonts.bodyItalic },
  estGold: { color: colors.gold },
  estLink: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  // Yellow italic "Generate" — click to fetch an estimate on demand (Vinster no
  // longer estimates automatically on every review open).
  estGenerate: { fontFamily: fonts.bodyItalic, fontSize: 16, color: colors.gold, paddingVertical: spacing.xs },
  estSub: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.sm },
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  saveButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  saveButtonText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
  // After a successful save the button turns gold and reads "Review Saved".
  saveButtonSaved: { borderColor: colors.gold },
  saveButtonTextSaved: { color: colors.gold },
  deleteButton: { alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  deleteText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
