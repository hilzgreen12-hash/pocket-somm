import { useRef, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Share,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';
import { publishRestaurantSessionToCommunity } from '../services/communityPublish';
import { StarRating } from './StarRating';
import { RestaurantReviewShareCard } from './RestaurantReviewShareCard';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import { showAlert } from './AppAlert';
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
  initialRatings?: { food: number | null; service: number | null; wineList: number | null; overall: number | null } | null;
  // Read-only context shown at the top of the card, mirroring the wine
  // card's header: where/when the visit was and which wine(s) were chosen.
  city?: string | null;
  date?: string | null;
  wines?: WineLine[];
  onClose: () => void;
  onSaved: () => void;
}

export function RestaurantReviewModal({ visible, sessionId, initialName, initialNote, initialRatings, city, date, wines, onClose, onSaved }: Props) {
  const qc = useQueryClient();
  const [name, setName] = useState(initialName ?? '');
  const [note, setNote] = useState(initialNote ?? '');
  const [food, setFood] = useState<number | null>(initialRatings?.food ?? null);
  const [service, setService] = useState<number | null>(initialRatings?.service ?? null);
  const [wineList, setWineList] = useState<number | null>(initialRatings?.wineList ?? null);
  const [overall, setOverall] = useState<number | null>(initialRatings?.overall ?? null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [posting, setPosting] = useState(false);
  const shareCardRef = useRef<View>(null);

  function communityPayload() {
    return {
      id: sessionId,
      restaurant_name: name.trim() || null,
      restaurant_note: note.trim() || null,
      rating_food: food,
      rating_service: service,
      rating_wine_list: wineList,
      rating_overall: overall,
    };
  }

  async function persist() {
    await supabase.from('scan_sessions').update({
      restaurant_name: name.trim() || null,
      restaurant_note: note.trim() || null,
      rating_food: food,
      rating_service: service,
      rating_wine_list: wineList,
      rating_overall: overall,
    }).eq('id', sessionId);
  }

  async function handleSave() {
    // Dismiss the keyboard explicitly — on iOS, tapping a button outside a
    // focused TextInput can cost the first tap to a keyboard dismiss.
    Keyboard.dismiss();
    setSaving(true);
    try {
      await persist();
      try {
        await publishRestaurantSessionToCommunity(communityPayload());
      } catch (err) {
        console.warn('[community] publishRestaurantSessionToCommunity failed (non-fatal):', err);
      }
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads'] });
      onSaved();
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
      const restaurant = name.trim() || 'Restaurant visit';
      if (shareCardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: `Share ${restaurant}`, UTI: 'public.png' });
        return;
      }
      // Plain-text fallback for devices without share-sheet support.
      const ratingText = (label: string, value: number | null) =>
        value == null ? null : `${label}: ${'★'.repeat(value)}${'☆'.repeat(5 - value)} (${value}/5)`;
      const header = city?.trim() ? `${restaurant} · ${city.trim()}` : restaurant;
      const ratings = [
        ratingText('Overall', overall),
        ratingText('Food', food),
        ratingText('Service', service),
        ratingText('Wine list', wineList),
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

  const metaLine = [city?.trim() || null, date || null].filter(Boolean).join('  ·  ');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.sheet}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always">
              {/* Lead like a wine card: restaurant name (with pin), then the
                  city/date meta and the wine(s) chosen — before ratings and
                  the review below. */}
              <View style={styles.nameRow}>
                <Text style={styles.namePin}>📍</Text>
                <TextInput
                  style={styles.nameInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Restaurant name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {metaLine ? <Text style={styles.metaLine}>{metaLine}</Text> : null}

              {wines && wines.length > 0 ? (
                <View style={styles.wineBlock}>
                  {wines.map((w, i) => {
                    const line = [w.producer, w.wineName, w.vintage]
                      .filter((x) => x != null && String(x).trim().length > 0)
                      .join(' · ');
                    return (
                      <Text key={i} style={styles.wineLine}>
                        {line}{w.userScore != null ? ` · ${w.userScore}/100` : ''}
                      </Text>
                    );
                  })}
                </View>
              ) : null}

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
                  <Text style={styles.ratingLabel}>Service</Text>
                  <StarRating value={service} onChange={setService} />
                </View>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>Wine list</Text>
                  <StarRating value={wineList} onChange={setWineList} />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Your review</Text>
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
                  style={[styles.shareBtn, posting && styles.btnDisabled]}
                  onPress={handleShareToCommunity}
                  disabled={posting}
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

              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Review'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {/* Off-screen branded share card — mounted only during a share so
            react-native-view-shot can snapshot it for the native share. */}
        {sharing && (
          <View style={styles.shareCardWrap} pointerEvents="none">
            <RestaurantReviewShareCard
              ref={shareCardRef}
              restaurantName={name.trim() || 'Restaurant visit'}
              city={city?.trim() || null}
              date={date ?? null}
              ratingOverall={overall}
              ratingFood={food}
              ratingService={service}
              ratingWineList={wineList}
              note={note.trim() || null}
              wines={(wines ?? []).map((w) => ({ producer: w.producer, wineName: w.wineName, vintage: w.vintage, userScore: w.userScore }))}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  content: { padding: spacing.xl, paddingBottom: 40 },
  // Lead title — restaurant name + pin, sized like the wine card name.
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  namePin: { fontSize: 20 },
  nameInput: { flex: 1, fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, paddingVertical: 2 },
  metaLine: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, marginBottom: spacing.sm },
  wineBlock: { marginBottom: spacing.lg },
  // Wine reference — gold italic, matching the wine reference style elsewhere.
  wineLine: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, lineHeight: 21, marginTop: 2 },
  fieldLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
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
  // staying out of the visible layout.
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
});
