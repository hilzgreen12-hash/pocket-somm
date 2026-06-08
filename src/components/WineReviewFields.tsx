import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MicButton } from './MicButton';
import { formatCurrency } from '../constants/currency';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

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
  // Where the wine was had / discovered, and the user's own drinking window.
  discoveredAt: string;
  onDiscoveredAt: (s: string) => void;
  drinkingWindow: string;
  onDrinkingWindow: (s: string) => void;
  // Optional share actions.
  onShareCommunity?: () => void;
  onShare?: () => void;
  sharingCommunity?: boolean;
  sharing?: boolean;
  // Optional Wish List + Add to Cellar (hidden on cellar reviews).
  wishlistActive?: boolean;
  onWishlist?: () => void;
  onAddToCellar?: () => void;
  // Save (+ optional delete).
  saving?: boolean;
  onSave: () => void;
  saveLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
}

// The shared wine-review input body, used by every review surface (List
// Review, Your Wine Reviews drill-through, Bottle Picks → Review Wine) so
// they're exactly the same. Order: Your Score → Price Paid · Estimated
// Value → Your Review → Personal Notes → Discovered at → Drinking Window →
// Share → Wish List · Add to Cellar → Save. The parent owns state, save and
// the surrounding card chrome (header, share card, etc.).
export function WineReviewFields({
  score, onScore, pricePaid, onPricePaid, currency,
  estimatedValue, estimatedValueAt, estimating, onEstimate,
  review, onReview, personalNotes, onPersonalNotes,
  discoveredAt, onDiscoveredAt, drinkingWindow, onDrinkingWindow,
  onShareCommunity, onShare, sharingCommunity, sharing,
  wishlistActive, onWishlist, onAddToCellar,
  saving, onSave, saveLabel, onDelete, deleteLabel,
}: Props) {
  const currencySymbol = formatCurrency(0, currency, { decimals: 0 }).replace(/[\d.,\s]/g, '') || currency;

  return (
    <>
      {/* Discovered at — top of the card. */}
      <Text style={styles.fieldLabel}>Discovered at</Text>
      <TextInput
        style={styles.input}
        value={discoveredAt}
        onChangeText={onDiscoveredAt}
        placeholder="Restaurant, home, friend's place…"
        placeholderTextColor={colors.textMuted}
      />

      {/* Your Review */}
      <View style={styles.dictateRow}>
        <Text style={styles.sectionTitle}>Your Review</Text>
        <MicButton value={review} onChangeText={onReview} onClear={() => onReview('')} />
      </View>
      <TextInput
        style={[styles.input, styles.noteInput]}
        value={review}
        onChangeText={onReview}
        placeholder="What you thought of the wine — taste, occasion, anything worth sharing."
        placeholderTextColor={colors.textMuted}
        multiline numberOfLines={4} textAlignVertical="top"
      />

      {/* Your Score */}
      <Text style={styles.fieldLabel}>Your Score</Text>
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

      {/* Price Paid | Estimated Value */}
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
              <Text style={styles.estLink}>(estimate)</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.estValue, styles.estMuted]}>—</Text>
          )}
          {estimatedValueAt && estimatedValue != null ? (
            <Text style={styles.estSub}>{new Date(estimatedValueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          ) : null}
        </View>
      </View>

      {/* Personal Notes — separate, below the review details. */}
      <View style={styles.dictateRow}>
        <Text style={styles.sectionTitle}>Personal Notes</Text>
        <MicButton value={personalNotes} onChangeText={onPersonalNotes} onClear={() => onPersonalNotes('')} />
      </View>
      <TextInput
        style={[styles.input, styles.noteInput]}
        value={personalNotes}
        onChangeText={onPersonalNotes}
        placeholder="Just for you — anything you'd rather keep private."
        placeholderTextColor={colors.textMuted}
        multiline numberOfLines={4} textAlignVertical="top"
      />

      {/* Drinking Window — the user's own call. */}
      <Text style={styles.fieldLabel}>Drinking Window — your call (optional)</Text>
      <TextInput
        style={styles.input}
        value={drinkingWindow}
        onChangeText={onDrinkingWindow}
        placeholder="e.g. drinking well now, or hold to 2030"
        placeholderTextColor={colors.textMuted}
      />

      {/* Share */}
      {(onShareCommunity || onShare) ? (
        <View style={styles.shareRow}>
          {onShareCommunity ? (
            <TouchableOpacity style={[styles.shareBtn, sharingCommunity && styles.btnDisabled]} onPress={onShareCommunity} disabled={sharingCommunity} activeOpacity={0.8}>
              <Text style={styles.shareBtnText}>{sharingCommunity ? 'Sharing…' : 'Share to Community'}</Text>
            </TouchableOpacity>
          ) : null}
          {onShare ? (
            <TouchableOpacity style={[styles.shareBtn, sharing && styles.btnDisabled]} onPress={onShare} disabled={sharing} activeOpacity={0.8}>
              <Text style={styles.shareBtnText}>{sharing ? 'Preparing…' : 'Share'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {/* Wish List · Add to Cellar (omitted on cellar reviews). */}
      {(onWishlist || onAddToCellar) ? (
        <View style={styles.actionPairRow}>
          {onWishlist ? (
            <TouchableOpacity style={[styles.pairBtn, styles.goldBtn]} onPress={onWishlist} activeOpacity={0.8}>
              <Text style={styles.goldBtnText}>{wishlistActive ? 'In Your Wish List — Remove' : 'Add to Wish List'}</Text>
            </TouchableOpacity>
          ) : null}
          {onAddToCellar ? (
            <TouchableOpacity style={[styles.pairBtn, styles.goldBtn]} onPress={onAddToCellar} activeOpacity={0.8}>
              <Text style={styles.goldBtnText}>Add to Cellar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {/* Save Review */}
      <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saving} activeOpacity={0.85}>
        <Text style={styles.saveButtonText}>{saving ? 'Saving…' : (saveLabel ?? 'Save Review')}</Text>
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
  estSub: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.sm },
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shareRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  shareBtn: { flex: 1, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  shareBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: '#FFFFFF', textAlign: 'center' },
  btnDisabled: { opacity: 0.5 },
  actionPairRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  pairBtn: { flex: 1, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  goldBtn: { borderWidth: 1, borderColor: colors.gold },
  goldBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textAlign: 'center' },
  saveButton: { borderWidth: 1.5, borderColor: '#FFFFFF', borderRadius: 12, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  saveButtonText: { fontFamily: fonts.headingSemibold, fontSize: 17, color: '#FFFFFF', letterSpacing: 0.4 },
  deleteButton: { alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  deleteText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
