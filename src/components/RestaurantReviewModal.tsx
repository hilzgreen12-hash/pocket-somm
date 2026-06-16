import { useRef, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard, Share,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';
import { publishRestaurantSessionToCommunity } from '../services/communityPublish';
import { StarRating } from './StarRating';
import { RestaurantReviewShareCard } from './RestaurantReviewShareCard';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import { showAlert } from './AppAlert';
import { MicButton } from './MicButton';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

interface WineLine {
  producer: string | null;
  wineName: string;
  vintage: string | number | null;
  userScore: number | null;
}

interface Props {
  visible: boolean;
  sessionId: string;
  initialName?: string | null;
  initialNote?: string | null;
  initialRatings?: { food: number | null; service: number | null; wineList: number | null; overall: number | null; value: number | null } | null;
  initialFavourite?: boolean;
  // Read-only context shown at the top of the card, mirroring the wine
  // review page's header: where/when the visit was, all pre-filled by
  // Vinster from the scan, and which wine(s) were chosen.
  city?: string | null;
  date?: string | null;
  wines?: WineLine[];
  // Opens the per-wine review (ChosenWineModal) for the picked wine at this
  // index. Wired by the results screen; absent when there's nothing to link.
  onReviewWine?: (index: number) => void;
  onClose: () => void;
  // Reports the saved name + city back so callers (e.g. the List results
  // card) can reflect edits without refetching.
  onSaved: (details?: { name: string | null; city: string | null }) => void;
}

export function RestaurantReviewModal({
  visible, sessionId, initialName, initialNote, initialRatings, initialFavourite,
  city, date, wines, onReviewWine, onClose, onSaved,
}: Props) {
  const qc = useQueryClient();
  // Restaurant identity — prefilled from the scan but editable here so the
  // user can correct the name or place while saving their review.
  const [restaurantName, setRestaurantName] = useState((initialName ?? '').trim());
  const [cityValue, setCityValue] = useState((city ?? '').trim());
  const [note, setNote] = useState(initialNote ?? '');
  const [overall, setOverall] = useState<number | null>(initialRatings?.overall ?? null);
  const [food, setFood] = useState<number | null>(initialRatings?.food ?? null);
  const [wineList, setWineList] = useState<number | null>(initialRatings?.wineList ?? null);
  const [service, setService] = useState<number | null>(initialRatings?.service ?? null);
  const [value, setValue] = useState<number | null>(initialRatings?.value ?? null);
  const [isFavourite, setIsFavourite] = useState(initialFavourite ?? false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [posting, setPosting] = useState(false);
  const shareCardRef = useRef<View>(null);

  function communityPayload() {
    return {
      id: sessionId,
      restaurant_name: restaurantName || null,
      restaurant_note: note.trim() || null,
      rating_food: food,
      rating_service: service,
      rating_wine_list: wineList,
      rating_overall: overall,
    };
  }

  async function persist() {
    await supabase.from('scan_sessions').update({
      restaurant_name: restaurantName.trim() || null,
      city: cityValue.trim() || null,
      restaurant_note: note.trim() || null,
      rating_food: food,
      rating_service: service,
      rating_wine_list: wineList,
      rating_overall: overall,
      rating_value: value,
      is_favourite: isFavourite,
    }).eq('id', sessionId);
  }

  async function handleSave() {
    // Dismiss the keyboard explicitly — on iOS, tapping a button outside a
    // focused TextInput can cost the first tap to a keyboard dismiss.
    Keyboard.dismiss();
    setSaving(true);
    try {
      await persist();
      // Saving a restaurant review no longer auto-publishes it. Community
      // sharing happens only via the explicit "Share to Community" button
      // (handleShareToCommunity) so nothing reaches the public feed silently.
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads'] });
      onSaved({ name: restaurantName.trim() || null, city: cityValue.trim() || null });
    } finally {
      setSaving(false);
    }
  }

  async function handleShareToCommunity() {
    Keyboard.dismiss();
    if (posting) return;
    setPosting(true);
    try {
      // Persist first so the published review matches what's on screen.
      await persist();
      await publishRestaurantSessionToCommunity(communityPayload());
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads'] });
      showAlert({ title: 'Shared to community', body: 'Your restaurant review now appears in the Vinster community feed.' });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setPosting(false);
    }
  }

  async function handleShare() {
    Keyboard.dismiss();
    if (sharing) return;
    setSharing(true);
    try {
      // One paint to mount the off-screen branded card before the snapshot.
      await new Promise((r) => setTimeout(r, 250));
      const restaurant = restaurantName || 'Restaurant visit';
      if (shareCardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: `Share ${restaurant}`, UTI: 'public.png' });
        return;
      }
      // Plain-text fallback for devices without share-sheet support.
      const ratingText = (label: string, v: number | null) =>
        v == null ? null : `${label}: ${'★'.repeat(v)}${'☆'.repeat(5 - v)} (${v}/5)`;
      const header = cityValue.trim() ? `${restaurant} · ${cityValue.trim()}` : restaurant;
      const ratings = [
        ratingText('Overall', overall),
        ratingText('Food', food),
        ratingText('Wine list', wineList),
        ratingText('Service', service),
        ratingText('Value', value),
      ].filter(Boolean).join('\n');
      const noteText = note.trim() ? `\n\n"${note.trim()}"` : '';
      const winesBlock = !wines || wines.length === 0 ? '' : '\n\nWines I had:\n' + wines.map((w) => {
        const line = [w.producer, w.wineName, w.vintage].filter((x) => x != null && String(x).trim().length > 0).join(' · ');
        return `· ${line}${w.userScore != null ? ` (${w.userScore}/100)` : ''}`;
      }).join('\n');
      const message = `${header}${date ? `\n${date}` : ''}` + (ratings ? `\n\n${ratings}` : '') + noteText + winesBlock + VINSTER_TEXT_SHARE_FOOTER;
      await Share.share({ message, title: restaurant });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Favourite star — top-left, mirroring the wine review page. */}
          <TouchableOpacity
            style={styles.favouriteBtn}
            onPress={() => setIsFavourite((v) => !v)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Text style={[styles.favouriteStar, isFavourite && styles.favouriteStarActive]}>{isFavourite ? '★' : '☆'}</Text>
          </TouchableOpacity>

          <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>
            {/* Restaurant + Place on one line — replaces the old "Add a
                Review" heading. Both prefilled from the scan, editable here. */}
            <View style={styles.identityRow}>
              <View style={styles.identityCol}>
                <Text style={styles.fieldLabel}>Restaurant</Text>
                <TextInput
                  style={styles.input}
                  value={restaurantName}
                  onChangeText={setRestaurantName}
                  placeholder="Restaurant name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.identityCol}>
                <Text style={styles.fieldLabel}>Place</Text>
                <TextInput
                  style={styles.input}
                  value={cityValue}
                  onChangeText={setCityValue}
                  placeholder="City or location"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
            {date ? <Text style={styles.stampMeta}>{date}</Text> : null}

            {/* Bottle pick(s) — auto-attached by Vinster from the scan, sitting
                directly under the restaurant line. Each links out to its own
                wine review. */}
            {wines && wines.length > 0 ? (
              <View style={styles.bottlePickBlock}>
                <Text style={styles.sectionLabel}>{wines.length > 1 ? 'Your Bottle Picks' : 'Your Bottle Pick'}</Text>
                <View style={styles.wineBlock}>
                  {wines.map((w, i) => {
                    const line = [w.producer, w.wineName, w.vintage]
                      .filter((x) => x != null && String(x).trim().length > 0)
                      .join(' · ');
                    return (
                      <View key={i} style={styles.wineRow}>
                        <Text style={styles.wineLine}>
                          {line}{w.userScore != null ? ` · ${w.userScore}/100` : ''}
                        </Text>
                        {onReviewWine ? (
                          <TouchableOpacity onPress={() => onReviewWine(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                            <Text style={styles.wineReviewLink}>Review this wine →</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <View style={styles.divider} />

            <Text style={styles.fieldLabel}>Ratings</Text>
            <View style={styles.ratingsBlock}>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Overall</Text>
                <StarRating value={overall} onChange={setOverall} />
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Food</Text>
                <StarRating value={food} onChange={setFood} />
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Wine list</Text>
                <StarRating value={wineList} onChange={setWineList} />
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Service</Text>
                <StarRating value={service} onChange={setService} />
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Value</Text>
                <StarRating value={value} onChange={setValue} />
              </View>
            </View>

            <View style={styles.dictateRow}>
              <Text style={styles.fieldLabel}>Your review</Text>
              <MicButton value={note} onChangeText={setNote} onClear={() => setNote('')} />
            </View>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Food, service, atmosphere, wine list quality…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            {/* Share — community + native share, side by side. */}
            <View style={styles.shareRow}>
              <TouchableOpacity
                style={[styles.shareBtn, (posting || !sessionId) && styles.btnDisabled]}
                onPress={handleShareToCommunity}
                disabled={posting || !sessionId}
                activeOpacity={0.8}
              >
                <Text style={styles.shareBtnText}>{posting ? 'Sharing…' : 'Share to Community'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareBtn, sharing && styles.btnDisabled]}
                onPress={handleShare}
                disabled={sharing}
                activeOpacity={0.8}
              >
                <Text style={styles.shareBtnText}>{sharing ? 'Preparing…' : 'Share'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.saveButton, (saving || !sessionId) && styles.btnDisabled]} onPress={handleSave} disabled={saving || !sessionId}>
              <Text style={styles.saveButtonText}>{saving ? 'Saving…' : !sessionId ? 'Preparing…' : 'Save Review'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </View>
      </View>

      {/* Off-screen branded share card — mounted only during a share so
          react-native-view-shot can snapshot it for the native share. No
          opacity:0 here: on Android that degrades the rasterised PNG, so we
          hide it by off-screen position alone. */}
      {sharing && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <RestaurantReviewShareCard
            ref={shareCardRef}
            restaurantName={restaurantName || 'Restaurant visit'}
            city={city?.trim() || null}
            date={date ?? null}
            ratingOverall={overall}
            ratingFood={food}
            ratingService={service}
            ratingWineList={wineList}
            ratingValue={value}
            note={note.trim() || null}
            wines={(wines ?? []).map((w) => ({ producer: w.producer, wineName: w.wineName, vintage: w.vintage, userScore: w.userScore }))}
          />
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.background },
  sheet: { flex: 1, backgroundColor: colors.background },
  favouriteBtn: {
    position: 'absolute',
    top: 56,
    left: spacing.xl,
    zIndex: 10,
    padding: 4,
  },
  favouriteStar: { fontSize: 30, color: colors.textMuted },
  favouriteStarActive: { color: colors.gold },
  content: { padding: spacing.xl, paddingTop: 64, paddingBottom: 60 },
  heading: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  subheading: { fontFamily: fonts.headingItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm, lineHeight: 21 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  // Restaurant + Place inputs share one row at the top of the card.
  identityRow: { flexDirection: 'row', gap: spacing.sm },
  identityCol: { flex: 1 },
  // Vinster's auto-attached bottle pick(s), sitting under the date.
  bottlePickBlock: { marginTop: spacing.xs, marginBottom: spacing.sm },
  // Read-only restaurant identity stamp.
  stamp: { marginBottom: spacing.lg },
  stampNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stampPin: { fontSize: 20 },
  stampName: { flex: 1, fontFamily: fonts.headingBold, fontSize: 24, color: colors.text },
  stampMeta: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, marginTop: spacing.xs },
  sectionLabel: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, marginBottom: spacing.sm },
  fieldLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  // Field label + dictation mic on one row.
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  noteInput: { minHeight: 110, marginBottom: spacing.lg },
  ratingsBlock: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingLabel: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  wineBlock: { marginBottom: spacing.lg, gap: spacing.sm },
  wineRow: { gap: 2 },
  // Wine reference — gold italic, matching the wine reference style elsewhere.
  wineLine: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, lineHeight: 21 },
  wineReviewLink: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 2 },
  shareRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  shareBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  shareBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: '#FFFFFF', textAlign: 'center' },
  btnDisabled: { opacity: 0.5 },
  saveButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancelButton: { alignItems: 'center', padding: spacing.sm },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  // Off-screen wrapper so the branded share card can be snapshotted while
  // staying out of the visible layout (off-screen position only — no opacity).
  shareCardWrap: { position: 'absolute', left: -10000, top: 0 },
});
