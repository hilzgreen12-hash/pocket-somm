import { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Share,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useChosenWines } from '../hooks/useChosenWines';
import { useAuth } from '../hooks/useAuth';
import { CityAutocomplete } from './CityAutocomplete';
import { WineReviewShareCard } from './WineReviewShareCard';
import { publishCommunityReview } from '../api/community';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import { showAlert } from './AppAlert';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { ChosenWine } from '../types/wine';

interface Props {
  wine: ChosenWine | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function EditChosenWineModal({ wine, visible, onClose, onSaved }: Props) {
  const { update, remove } = useChosenWines();
  const { session } = useAuth();

  const [restaurant, setRestaurant] = useState('');
  const [city, setCity] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [tastingNote, setTastingNote] = useState('');
  const [otherObservations, setOtherObservations] = useState('');
  const [userScore, setUserScore] = useState<number | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [vinsterNotesOpen, setVinsterNotesOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [posting, setPosting] = useState(false);
  const shareCardRef = useRef<View>(null);

  useEffect(() => {
    if (visible && wine) {
      setRestaurant(wine.restaurant_name ?? '');
      setCity(wine.city ?? '');
      setListPrice(wine.menu_price != null ? String(wine.menu_price) : '');
      setTastingNote(wine.tasting_note ?? '');
      setOtherObservations(wine.other_observations ?? '');
      setUserScore(wine.user_score ?? null);
      setIsFavourite(!!wine.is_favourite);
      setVinsterNotesOpen(false);
    }
  }, [visible, wine]);

  // Favourite-star auto-save — the only field on this modal that
  // persists without the user tapping Save. Standard UX for a
  // favourite tick (Spotify, Apple Music, Letterboxd all behave this
  // way). All OTHER fields still wait for Save so in-flight edits
  // aren't surprise-committed.
  //
  // Important: we send the WINE's persisted values for the other
  // columns rather than the local draft, so toggling the star never
  // accidentally commits an in-progress tasting-note draft. On
  // failure we revert the optimistic flip and surface the error.
  async function handleToggleFavourite() {
    if (!wine) return;
    const next = !isFavourite;
    setIsFavourite(next);
    try {
      await update.mutateAsync({
        id: wine.id,
        input: {
          restaurantName: wine.restaurant_name ?? '',
          city: wine.city ?? '',
          tastingNote: wine.tasting_note ?? '',
          otherObservations: wine.other_observations ?? '',
          userScore: wine.user_score,
          listPrice: wine.menu_price,
          isFavourite: next,
          producer: wine.producer,
          wineName: wine.wine_name,
          vintage: wine.vintage,
        },
      });
    } catch (err) {
      // Revert the optimistic flip so the star reflects what's
      // actually saved server-side.
      setIsFavourite(!next);
      showAlert({ title: 'Could not update favourite', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Persist the current draft to chosen_wines. Shared by Save and by
  // "Share to Community" (so the published review matches the card).
  async function persist() {
    if (!wine) return;
    const trimmedPrice = listPrice.trim();
    const parsedPrice = trimmedPrice ? parseFloat(trimmedPrice) : NaN;
    await update.mutateAsync({
      id: wine.id,
      input: {
        restaurantName: restaurant,
        city,
        tastingNote,
        otherObservations,
        userScore,
        listPrice: Number.isFinite(parsedPrice) ? parsedPrice : null,
        isFavourite,
        // Identity passed through so the post-update sync can push the
        // new values onto a matching wishlist row if one exists.
        producer: wine.producer,
        wineName: wine.wine_name,
        vintage: wine.vintage,
      },
    });
  }

  async function handleSave() {
    if (!wine) return;
    // Dismiss the keyboard explicitly so the iOS first-tap-eats-the-tap
    // bug can't strand the user on this modal.
    Keyboard.dismiss();
    await persist();
    onSaved();
    onClose();
  }

  async function handleShareToCommunity() {
    if (!wine || posting) return;
    if (!session?.user.id) {
      showAlert({ title: 'Sign in required', body: 'You need an account to share a review to the community.' });
      return;
    }
    Keyboard.dismiss();
    setPosting(true);
    try {
      await persist();
      const title = [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' · ').trim() || wine.wine_name || 'Wine review';
      const subtitle = wine.region || null;
      const body = tastingNote.trim() || otherObservations.trim() || null;
      const displayName = (session.user.email ?? '').split('@')[0] || null;
      await publishCommunityReview(
        {
          category: 'wine',
          source_table: 'chosen_wines',
          source_id: wine.id,
          title,
          subtitle,
          rating: userScore,
          body,
          metadata: {
            producer: wine.producer ?? null,
            region: wine.region ?? null,
            vintage: wine.vintage ?? null,
            critic_score: wine.critic_score ?? null,
          },
        },
        displayName,
      );
      showAlert({ title: 'Shared to community', body: 'Your wine review now appears in the Vinster community feed.' });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      const already = detail.toLowerCase().includes('duplicate') || detail.toLowerCase().includes('unique');
      showAlert({
        title: already ? 'Already shared' : 'Could not share',
        body: already ? "You've already shared this review to the community." : detail,
      });
    } finally {
      setPosting(false);
    }
  }

  async function handleShare() {
    if (!wine || sharing) return;
    Keyboard.dismiss();
    setSharing(true);
    try {
      // One paint to mount the off-screen branded card before the snapshot.
      await new Promise((r) => setTimeout(r, 250));
      if (shareCardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share my wine review', UTI: 'public.png' });
        return;
      }
      // Plain-text fallback for devices without share-sheet support.
      const header = [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ');
      const scoreText = userScore != null ? `\nMy score: ${userScore}/100` : '';
      const where = [restaurant.trim(), city.trim()].filter(Boolean).join(', ');
      const locFormatted = where ? `\nWhere: ${where}` : '';
      const noteFormatted = tastingNote.trim() ? `\n\n"${tastingNote.trim()}"` : '';
      await Share.share({ message: `${header}${scoreText}${locFormatted}${noteFormatted}${VINSTER_TEXT_SHARE_FOOTER}`, title: header });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
    }
  }

  function handleDelete() {
    if (!wine) return;
    const label = wine.vintage ? `${wine.vintage} ${wine.wine_name}` : wine.wine_name;
    showAlert({
      title: 'Delete review?',
      body: `${label}\n\nThis permanently removes your review.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete review',
          style: 'destructive',
          onPress: () => {
            remove.mutate(wine.id, {
              onSuccess: () => { onSaved(); onClose(); },
              onError: (err) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }),
            });
          },
        },
      ],
    });
  }

  if (!wine) return null;

  const wineName = wine.vintage ? `${wine.vintage} ${wine.wine_name}` : wine.wine_name;
  const currencySymbol = (() => {
    const cur = (wine.currency ?? 'GBP').toUpperCase();
    const map: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$', NZD: 'NZ$', JPY: '¥', CHF: 'Fr', HKD: 'HK$', SGD: 'S$' };
    return map[cur] ?? `${cur} `;
  })();
  const reviewDate = wine.chosen_at
    ? new Date(wine.chosen_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  // Vinster captured the wine card analysis at save time — surface it
  // here as an expandable block so the user can revisit what Vinster
  // said about THIS specific wine on the original recommendation list.
  const hasVinsterNotes =
    wine.critic_score != null ||
    !!wine.rationale ||
    !!wine.vintage_assessment ||
    !!wine.drinking_window ||
    !!wine.rarity_assessment;
  const drinkingRange =
    wine.drinking_window?.from && wine.drinking_window?.to
      ? `${wine.drinking_window.from}–${wine.drinking_window.to}`
      : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          {/* Star auto-saves on tap — the only field on this modal
              that doesn't wait for the Save button. Other edits in the
              form are preserved (this handler only writes is_favourite
              + the wine's persisted other-fields, not the local draft). */}
          <TouchableOpacity
            style={styles.favouriteBtn}
            onPress={handleToggleFavourite}
            disabled={update.isPending}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Text style={[styles.favouriteStar, isFavourite && styles.favouriteStarActive]}>{isFavourite ? '★' : '☆'}</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always">

            <Text style={styles.heading}>{wineName}</Text>
            <Text style={styles.wineProducer}>{wine.producer}{wine.region ? ` · ${wine.region}` : ''}</Text>
            {reviewDate ? <Text style={styles.reviewDate}>Reviewed {reviewDate}</Text> : null}

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Where did you drink it?</Text>

            <Text style={styles.fieldLabel}>Restaurant name</Text>
            <TextInput
              style={styles.input}
              value={restaurant}
              onChangeText={setRestaurant}
              placeholder="e.g. The Clove Club"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>City</Text>
            <CityAutocomplete
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>List Price ({currencySymbol.trim() || wine.currency})</Text>
            <TextInput
              style={styles.input}
              value={listPrice}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, '');
                const parts = cleaned.split('.');
                const normalised = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
                setListPrice(normalised);
              }}
              placeholder={wine.menu_price != null ? String(wine.menu_price) : 'e.g. 65'}
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />

            {hasVinsterNotes ? (
              <View style={styles.vinsterWrap}>
                <TouchableOpacity
                  onPress={() => setVinsterNotesOpen((v) => !v)}
                  activeOpacity={0.7}
                  style={styles.vinsterLink}
                >
                  <Text style={styles.vinsterLinkText}>
                    {vinsterNotesOpen ? 'Hide Vinster’s notes for this wine' : 'View Vinster’s notes for this wine →'}
                  </Text>
                </TouchableOpacity>

                {vinsterNotesOpen ? (
                  <View style={styles.vinsterBlock}>
                    <Text style={styles.vinsterIntro}>Vinster sifted dozens of sources to present to you:</Text>
                    {wine.critic_score != null ? (
                      <View style={styles.vinsterRow}>
                        <Text style={styles.vinsterLabel}>Critic Score</Text>
                        <Text style={styles.vinsterScore}>{wine.critic_score} <Text style={styles.vinsterScoreUnit}>pts</Text></Text>
                      </View>
                    ) : null}

                    {wine.drinking_window ? (
                      <View style={styles.vinsterField}>
                        <Text style={styles.vinsterLabel}>Drinking Window</Text>
                        <Text style={styles.vinsterFieldValue}>
                          {drinkingRange ? `${drinkingRange} · ` : ''}{wine.drinking_window.status}
                        </Text>
                        {wine.drinking_window.notes ? (
                          <Text style={styles.vinsterFieldBody}>{wine.drinking_window.notes}</Text>
                        ) : null}
                      </View>
                    ) : null}

                    {wine.vintage_assessment ? (
                      <View style={styles.vinsterField}>
                        <Text style={styles.vinsterLabel}>Vintage</Text>
                        <Text style={styles.vinsterFieldValue}>{wine.vintage_assessment.label}</Text>
                        {wine.vintage_assessment.notes ? (
                          <Text style={styles.vinsterFieldBody}>{wine.vintage_assessment.notes}</Text>
                        ) : null}
                      </View>
                    ) : null}

                    {wine.rarity_assessment ? (
                      <View style={styles.vinsterField}>
                        <Text style={styles.vinsterLabel}>Rarity</Text>
                        <Text style={styles.vinsterFieldValue}>{wine.rarity_assessment.label}</Text>
                        {wine.rarity_assessment.notes ? (
                          <Text style={styles.vinsterFieldBody}>{wine.rarity_assessment.notes}</Text>
                        ) : null}
                      </View>
                    ) : null}

                    {wine.rationale ? (
                      <View style={styles.vinsterField}>
                        <Text style={styles.vinsterLabel}>Sommelier’s Note</Text>
                        <Text style={styles.vinsterFieldBody}>{wine.rationale}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : null}

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Your tasting note</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={tastingNote}
              onChangeText={setTastingNote}
              placeholder="Flavours, texture, finish…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.sectionLabel}>Other observations</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={otherObservations}
              onChangeText={setOtherObservations}
              placeholder="Value, food match, service, occasion…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.sectionLabel}>Your score</Text>
            <TextInput
              style={[styles.input, styles.scoreInput]}
              value={userScore != null ? String(userScore) : ''}
              onChangeText={(text) => {
                if (text === '') { setUserScore(null); return; }
                const n = parseInt(text, 10);
                if (!isNaN(n)) setUserScore(Math.min(100, Math.max(1, n)));
              }}
              placeholder="e.g. 88"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.scoreHint}>out of 100</Text>

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

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={update.isPending}
            >
              <Text style={styles.saveButtonText}>
                {update.isPending ? 'Saving…' : 'Save Changes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={remove.isPending}>
              <Text style={styles.deleteText}>{remove.isPending ? 'Deleting…' : 'Delete this review'}</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>

        {/* Off-screen branded share card — mounted only during a share so
            react-native-view-shot can snapshot it for the native share. */}
        {sharing && (
          <View style={styles.shareCardWrap} pointerEvents="none">
            <WineReviewShareCard
              ref={shareCardRef}
              producer={wine.producer}
              wineName={wine.wine_name}
              vintage={wine.vintage}
              region={wine.region}
              userScore={userScore}
              criticScore={wine.critic_score}
              tastingNote={tastingNote}
              otherObservations={otherObservations || null}
              date={reviewDate}
              location={[restaurant.trim(), city.trim()].filter(Boolean).join(', ') || null}
              isFavourite={isFavourite}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  favouriteBtn: {
    position: 'absolute',
    top: 56,
    right: spacing.xl,
    zIndex: 10,
    padding: 4,
  },
  favouriteStar: {
    fontSize: 30,
    color: colors.textMuted,
  },
  favouriteStarActive: {
    color: colors.gold,
  },
  content: {
    padding: spacing.xl,
    paddingTop: 64,
    paddingBottom: 60,
  },
  heading: {
    fontFamily: fonts.headingBold,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  wineProducer: {
    fontFamily: fonts.bodyItalic,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  reviewDate: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    color: colors.gold,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
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
    marginBottom: spacing.sm,
  },
  vinsterWrap: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  vinsterLink: {
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  vinsterLinkText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
    color: colors.gold,
    letterSpacing: 0.3,
  },
  vinsterIntro: {
    fontFamily: fonts.bodyItalic,
    fontSize: 14,
    color: colors.gold,
    lineHeight: 19,
  },
  vinsterBlock: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.xs,
    gap: spacing.sm,
    backgroundColor: 'rgba(212,176,96,0.06)',
  },
  vinsterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  vinsterLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  vinsterScore: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: colors.gold,
  },
  vinsterScoreUnit: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.gold,
  },
  vinsterField: {
    gap: 2,
  },
  vinsterFieldValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  vinsterFieldBody: {
    fontFamily: fonts.bodyItalic,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 21,
  },
  noteInput: {
    minHeight: 80,
    marginBottom: spacing.md,
  },
  scoreInput: {
    marginBottom: 4,
  },
  scoreHint: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
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
  saveButtonText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
    color: colors.gold,
  },
  cancelButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  cancelText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  deleteText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.gold,
    textDecorationLine: 'underline',
  },
  // Off-screen wrapper so the branded share card can be snapshotted while
  // staying out of the visible layout.
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
});
