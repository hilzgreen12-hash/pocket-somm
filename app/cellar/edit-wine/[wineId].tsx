import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar, useWishList } from '../../../src/hooks/useCellar';
import { useAttachLabelPhoto } from '../../../src/hooks/useAttachLabelPhoto';
import { usePreferences } from '../../../src/hooks/usePreferences';
import { valueWine } from '../../../src/services/pricing';
import { fetchWineCandidates } from '../../../src/api/label';
import { updateCellarWine } from '../../../src/api/cellar';
import { showAlert } from '../../../src/components/AppAlert';
import { LabelThumb } from '../../../src/components/LabelThumb';
import { BottleSizePicker } from '../../../src/components/BottleSizePicker';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// THE edit screen for an EXISTING cellar wine — the single surface reached from
// both edit pathways (the wine card's identity block and the Full Cellar List
// long-press). A wine card only exists for a wine the user already confirmed,
// so this is an EDIT, not a "confirm": it carries the same fields as the
// scan-flow confirm screen plus the things only an owned bottle has (bottles
// held, spirit flag, label photo), and updates the wine in place — everywhere
// it's placed (rack slot, bin cell, location list, Full Cellar List).
export default function EditWineScreen() {
  const { wineId } = useLocalSearchParams<{ wineId: string }>();
  const qc = useQueryClient();
  const { wines } = useCellar();
  const { wines: wishlist } = useWishList();
  const { preferences } = usePreferences();
  const attachPhoto = useAttachLabelPhoto();
  const wine = wines.find((w) => w.id === wineId) ?? wishlist.find((w) => w.id === wineId) ?? null;

  const [producer, setProducer] = useState('');
  const [region, setRegion] = useState('');
  const [wineName, setWineName] = useState('');
  const [grape, setGrape] = useState('');
  const [vintage, setVintage] = useState('');
  const [bottleSizeMl, setBottleSizeMl] = useState(750);
  const [style, setStyle] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isSpirit, setIsSpirit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (wine && !loaded) {
      setProducer(wine.producer ?? '');
      setRegion(wine.region ?? '');
      setWineName(wine.wine_name ?? '');
      setGrape(wine.grape_variety ?? '');
      setVintage(wine.vintage ?? '');
      setBottleSizeMl(wine.bottle_size_ml ?? 750);
      setStyle(wine.style ?? '');
      setQuantity(String(wine.quantity ?? 1));
      setIsSpirit(!!wine.is_spirit);
      setLoaded(true);
    }
  }, [wine, loaded]);

  // Sanity-check that this producer actually makes this wine before saving an identity
  // edit. wine-candidates returns ONLY a producer's real bottlings (it will not invent),
  // so an empty list means the producer is unrecognised, and a non-empty list that
  // doesn't include this cuvée means the producer doesn't make it. Returns true to
  // proceed. It's a SOFT warning (the user can save anyway), and any lookup failure
  // proceeds silently so a network blip never blocks an edit.
  async function passesPlausibilityCheck(): Promise<boolean> {
    let cands;
    try {
      cands = await fetchWineCandidates({ producer: producer.trim(), region: region.trim(), wineName: wineName.trim() || null, vintage: vintage.trim() || null });
    } catch {
      return true;
    }
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const target = norm(wineName.trim());
    const plausible = (() => {
      if (!cands || cands.length === 0) return false; // producer unrecognised / makes nothing matching
      if (!target) return true; // sold under the producer's own name; producer is recognised
      const tokens = target.split(' ').filter((w) => w.length >= 4);
      return cands.some((c) => {
        const cn = norm(c.wineName ?? '');
        if (!cn) return false;
        if (cn.includes(target) || target.includes(cn)) return true;
        return tokens.some((t) => cn.includes(t));
      });
    })();
    if (plausible) return true;
    return await new Promise<boolean>((resolve) => {
      showAlert({
        title: 'Double-check this wine?',
        body: `Vinster doesn't recognise "${wineName.trim() || producer.trim()}" as a wine ${producer.trim() || 'this producer'} makes. Save it anyway?`,
        buttons: [
          { text: 'Save anyway', onPress: () => resolve(true) },
          { text: 'Go back & edit', style: 'cancel', onPress: () => resolve(false) },
        ],
      });
    });
  }

  async function handleSave() {
    if (!wine || saving) return;
    if (!wineName.trim() && !producer.trim()) {
      showAlert({ title: 'Name needed', body: 'Add a wine name or producer.' });
      return;
    }
    // Only when the producer/name actually changed, and a producer is given — no point
    // re-checking a wine whose identity the user didn't touch.
    const identityChanged = producer.trim() !== (wine.producer ?? '').trim() || wineName.trim() !== (wine.wine_name ?? '').trim();
    if (identityChanged && producer.trim()) {
      const ok = await passesPlausibilityCheck();
      if (!ok) return;
    }
    // Bottles held and the spirit flag don't change what the wine IS, so when
    // they're the ONLY edit there's nothing for a re-lookup to improve. A save
    // with no field changes at all still re-derives (that's the way to repair a
    // wine stored with the wrong intel).
    const detailsChanged =
      identityChanged ||
      region.trim() !== (wine.region ?? '').trim() ||
      grape.trim() !== (wine.grape_variety ?? '').trim() ||
      vintage.trim() !== (wine.vintage ?? '').trim() ||
      style.trim() !== (wine.style ?? '').trim() ||
      bottleSizeMl !== (wine.bottle_size_ml ?? 750);
    const countOrSpiritChanged =
      isSpirit !== !!wine.is_spirit ||
      (!wine.is_wishlist && (parseInt(quantity, 10) || 0) !== (wine.quantity ?? 0));
    const shouldRevalue = detailsChanged || !countOrSpiritChanged;
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        producer: producer.trim() || null,
        region: region.trim() || null,
        wine_name: wineName.trim() || producer.trim(),
        grape_variety: grape.trim() || null,
        vintage: vintage.trim() || null,
        bottle_size_ml: bottleSizeMl,
        style: style.trim() || null,
        is_spirit: isSpirit,
      };
      // Bottles held — a wishlist wine isn't owned, so it has no count to edit.
      if (!wine.is_wishlist) {
        const qty = parseInt(quantity, 10);
        if (Number.isFinite(qty) && qty >= 0) updates.quantity = qty;
      }

      // "Save & Update Wine Intel" re-derives value + intel from the details the
      // user just confirmed — feeding Claude the grape + colour so it pins the
      // right cuvée (e.g. Guigal Ex-Voto Blanc, previously mis-stored as the
      // Syrah). It runs whenever ANY wine detail was touched, so correcting
      // grape/colour alone refreshes the intel and a wine saved with the wrong
      // intel can be fixed by simply re-saving. The one case it's skipped is an
      // edit that ONLY moved the bottle count or the spirit flag — neither can
      // change the intel, and this screen is now the bottle-count editor too, so
      // a count change shouldn't cost a Claude lookup. Wrapped in try/catch so a
      // failed lookup still keeps the edit.
      if (shouldRevalue) {
        try {
          const currency = (preferences?.defaultCurrency ?? wine.estimated_value_currency ?? 'GBP').toUpperCase();
          const v = await valueWine(
            { producer: producer.trim(), region: region.trim(), wineName: wineName.trim() || null, vintage: vintage.trim() || 'NV', grape: grape.trim() || null, style: style.trim() || null } as any,
            currency,
          );
          Object.assign(updates, {
            estimated_value: v.estimatedValue,
            estimated_value_currency: v.currency,
            estimated_value_at: v.estimatedValue != null ? new Date().toISOString() : null,
            estimated_value_source: v.estimatedValue != null ? v.valueSource : null,
            estimated_value_low: v.estimatedValueLow ?? null,
            estimated_value_high: v.estimatedValueHigh ?? null,
            estimated_value_scope: v.priceScope ?? null,
            critic_score: v.criticScore,
            critic_score_note: v.criticScoreNote,
            tasting_notes: v.tastingNotes,
            drinking_window_from: v.drinkingWindowFrom,
            drinking_window_to: v.drinkingWindowTo,
            drinking_window_status: v.drinkingWindowStatus,
            // The user's typed grape wins; only fall back to the re-derived one
            // when they left the field blank.
            grape_variety: grape.trim() || v.grapeVariety,
            ws_wine_id: v.wsWineId ?? null,
            ws_wine_name: v.wsWineName ?? null,
            // If the recorded purchase price was an auto-estimate (never a figure
            // the user typed), refresh it to the new wine's value too.
            ...(wine.purchase_price_estimated ? { purchase_price: v.estimatedValue, purchase_price_currency: v.currency } : {}),
          });
        } catch { /* keep the identity edit even if the revalue lookup fails */ }
      }

      // A spirit has no drinking window — strip whatever the revalue returned so
      // the card reads NA, no maturity rating applies and it stays out of the
      // "drink now / peak" surfacing. is_spirit drives the rest of that
      // behaviour, so the status string is left alone.
      if (isSpirit) {
        updates.drinking_window_from = null;
        updates.drinking_window_to = null;
      }

      await updateCellarWine(wine.id, updates);
      // The wine's identity shows in every surface it's placed in — refresh them all.
      qc.invalidateQueries({ queryKey: ['cellar'] });
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['bin-cells'] });
      qc.invalidateQueries({ queryKey: ['bins'] });
      qc.invalidateQueries({ queryKey: ['storage-location-wines'] });

      // Bottles were ADDED here, so they exist in the Full Cellar List but sit
      // in no rack, fridge, diamond or alt cellar yet. Offer to file them now
      // rather than letting them quietly become "awaiting placement".
      const added = (typeof updates.quantity === 'number' ? updates.quantity : (wine.quantity ?? 0)) - (wine.quantity ?? 0);
      if (added > 0) {
        // The save itself is finished — drop the spinner before the popup, so
        // dismissing it by tapping outside doesn't leave Save stuck saving.
        setSaving(false);
        showAlert({
          title: 'Bottles Added',
          body: `${added} ${added === 1 ? 'wine' : 'wines'} added to your bottle count. You can place the ${added === 1 ? 'wine' : 'wines'} in a home location now, or leave them in your Full Cellar List to place later.`,
          buttons: [
            // Straight to the wine card's placement chooser for the loose bottles.
            { text: 'Place Now', onPress: () => router.replace(`/cellar/${wine.id}?place=1` as any) },
            { text: 'Place Later', onPress: () => router.back() },
            { text: 'Done', style: 'cancel', onPress: () => router.back() },
          ],
        });
        return;
      }
      router.back();
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Wine Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {!wine ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : (
        <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bottomOffset={24}>
          {/* Label thumbnail + a way to change it, mirroring the wine card. */}
          <View style={styles.thumbBlock}>
            <LabelThumb path={wine.label_image_path} fallbackText={wine.wine_name} style={styles.thumb} radius={8} />
            <TouchableOpacity
              onPress={() => attachPhoto.present({ kind: 'cellar', wineId: wine.id, producer: wine.producer, wineName: wine.wine_name })}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
            >
              <Text style={styles.updateThumbLink}>{wine.label_image_path ? 'Update Label Thumbnail' : '+ Add Label Thumbnail'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Producer</Text>
          <TextInput style={styles.input} value={producer} onChangeText={setProducer} placeholder="e.g. Château Margaux" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Region</Text>
          <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="e.g. Margaux, Bordeaux" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Wine Name (optional)</Text>
          <TextInput style={styles.input} value={wineName} onChangeText={setWineName} placeholder="e.g. Reserve, Cuvée Prestige" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Grape Variety</Text>
          <TextInput style={styles.input} value={grape} onChangeText={setGrape} placeholder="e.g. Albariño, Cabernet Sauvignon" placeholderTextColor={colors.textMuted} autoCapitalize="words" />

          <Text style={styles.label}>Vintage</Text>
          <TextInput style={styles.input} value={vintage} onChangeText={(t) => setVintage(t.slice(0, 7))} placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textMuted} autoCapitalize="characters" maxLength={7} />

          <Text style={styles.label}>Bottle Size</Text>
          <BottleSizePicker value={bottleSizeMl} onChange={setBottleSizeMl} />

          {/* Bottles held — the count shown as "Bottles in My Cellar" on the
              wine card. Not shown for a wishlist wine (not owned yet). */}
          {!wine.is_wishlist ? (
            <>
              <Text style={styles.label}>Bottles in Your Cellar</Text>
              <Text style={styles.qtyHelper}>How many bottles of this wine you hold.</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={(t) => setQuantity(t.replace(/[^0-9]/g, '').slice(0, 4))}
                keyboardType="number-pad"
                placeholder="e.g. 6"
                placeholderTextColor={colors.textMuted}
              />
            </>
          ) : null}

          <Text style={styles.label}>Style</Text>
          <TextInput style={styles.input} value={style} onChangeText={setStyle} placeholder="e.g. Red, White, Rosé, Sparkling, Fortified" placeholderTextColor={colors.textMuted} autoCapitalize="words" />

          {/* Spirits get no drinking window and no maturity rating. */}
          <TouchableOpacity style={styles.spiritToggleRow} onPress={() => setIsSpirit((v) => !v)} activeOpacity={0.7}>
            <View style={[styles.spiritCheckbox, isSpirit && styles.spiritCheckboxOn]}>
              {isSpirit ? <Text style={styles.spiritCheckMark}>✓</Text> : null}
            </View>
            <Text style={styles.spiritToggleLabel}>This is a spirit (whisky, gin, rum…)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.buttonText}>Save & Update Wine Intel</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  content: { padding: spacing.xl, paddingBottom: 60 },
  thumbBlock: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  thumb: { width: 168, height: 218 },
  qtyHelper: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textSubtle, marginBottom: 6, lineHeight: 16 },
  updateThumbLink: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.3 },
  label: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontFamily: fonts.headingSemibold, fontSize: 17, color: colors.gold },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.md },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  spiritToggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, marginTop: spacing.sm },
  spiritCheckbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  spiritCheckboxOn: { backgroundColor: 'rgba(224,184,74,0.18)' },
  spiritCheckMark: { fontSize: 14, color: colors.gold, fontFamily: fonts.headingBold, lineHeight: 16 },
  spiritToggleLabel: { flex: 1, fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.text },
});
