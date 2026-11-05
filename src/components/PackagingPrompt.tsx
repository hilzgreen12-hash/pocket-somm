import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { showAlert } from './AppAlert';
import { MicButton } from './MicButton';
import { fetchStorageLocationCases, createStorageCase } from '../api/storageLocations';
import {
  fetchPlacementsForWine, placedCount, decrementPlacement, addLocationPlacement,
} from '../api/placements';
import { getCellarWineById } from '../api/cellar';
import type { StorageCase } from '../types/wine';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// "How is this wine packaged?" — shown whenever a wine lands in an Other Home
// Storage location. Offers Loose Bottle(s), filing into an existing case, or
// creating a brand-new case (name + note). Case membership lives on the wine's
// 'location' PLACEMENT in this alt cellar (placement.case_id) — never the legacy
// cellar_wines.case_id. Loose leaves the bottles uncased. The caller invalidates
// via onDone.

// File `count` of a wine's bottles in an alt cellar into a case (or loose with
// caseId null) by moving them between that wine's placements there. The source is
// `placementId` when given, else the wine's LOOSE placement in the location. A
// partial file splits the placement (decrement the source, add to the case's
// placement — addLocationPlacement merges into an existing one, so no duplicate
// lines). If the wine has no placement here yet (legacy-only row) one is created,
// but only for bottles that aren't already placed elsewhere, so the placed total
// never exceeds the wine's quantity.
export async function fileLocationBottlesIntoCase(opts: {
  wineId: string;
  locationId: string;
  caseId: string | null;
  count?: number | null;
  placementId?: string | null;
}): Promise<void> {
  const { wineId, locationId, caseId, count, placementId } = opts;
  const placements = await fetchPlacementsForWine(wineId);
  const here = placements.filter((p) => p.kind === 'location' && p.storage_location_id === locationId);
  const src = placementId
    ? here.find((p) => p.id === placementId)
    : here.find((p) => !p.case_id);
  if (!src) {
    if (!caseId) return; // nothing loose here to file, and loose is the default anyway
    const wine = await getCellarWineById(wineId);
    const unplaced = Math.max(0, (wine?.quantity ?? 0) - placedCount(placements));
    const take = Math.min(count ?? unplaced, unplaced);
    if (take <= 0) throw new Error("Couldn't find this wine's bottles in this location — pull to refresh and try again.");
    await addLocationPlacement(wineId, locationId, caseId, take);
    return;
  }
  if ((src.case_id ?? null) === caseId) return; // already filed there
  const take = Math.max(1, Math.min(count ?? src.quantity, src.quantity));
  // Shed from the source first, then land in the case's placement.
  await decrementPlacement(src.id, take);
  await addLocationPlacement(wineId, locationId, caseId, take);
}

interface Props {
  visible: boolean;
  wineId: string | null;
  locationId: string | null;
  // How many bottles just landed here (they sit on the wine's loose placement).
  // Only that many are filed into a case; omitted = the whole loose placement.
  count?: number | null;
  userId: string;
  onClose: () => void;
  onDone: () => void; // fired after the wine is filed, so the caller can refresh
}

export function PackagingPrompt({ visible, wineId, locationId, count, userId, onClose, onDone }: Props) {
  // File the landed bottles into a case (or leave them loose with null).
  const fileInto = (caseId: string | null) =>
    fileLocationBottlesIntoCase({ wineId: wineId!, locationId: locationId!, caseId, count });
  const [step, setStep] = useState<'choose' | 'newCase' | 'existing'>('choose');
  const [caseName, setCaseName] = useState('');
  const [caseNote, setCaseNote] = useState('');
  const [cases, setCases] = useState<StorageCase[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setStep('choose'); setCaseName(''); setCaseNote('');
    if (locationId) fetchStorageLocationCases(locationId).then(setCases).catch(() => setCases([]));
  }, [visible, locationId]);

  async function finish(action: () => Promise<void>) {
    if (!wineId || !locationId || saving) return;
    setSaving(true);
    try {
      await action();
      onDone();
      onClose();
    } catch (err) {
      showAlert({ title: 'Could not file this wine', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function startNewCase() {
    setCaseName('');
    setCaseNote('');
    setStep('newCase');
  }

  function saveNewCase() {
    if (!caseName.trim()) { showAlert({ title: 'Name the case', body: 'Give this case a name so you can find it.' }); return; }
    void finish(async () => {
      const created = await createStorageCase(userId, { storageLocationId: locationId!, name: caseName, note: caseNote });
      await fileInto(created.id);
    });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {step === 'choose' ? (
            <>
              <Text style={styles.title}>How is this wine packaged?</Text>
              <TouchableOpacity style={styles.optBtn} onPress={() => finish(() => fileInto(null))} disabled={saving} activeOpacity={0.85}>
                <Text style={styles.optText}>Loose Bottle(s)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.optBtn, !cases.length && styles.optBtnDisabled]} onPress={() => cases.length && setStep('existing')} disabled={!cases.length} activeOpacity={0.85}>
                <Text style={[styles.optText, !cases.length && styles.optTextDisabled]}>Add to Existing Case{cases.length ? '' : ' (none yet)'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optBtn} onPress={startNewCase} activeOpacity={0.85}>
                <Text style={styles.optText}>Create New Case</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            </>
          ) : step === 'newCase' ? (
            <>
              <Text style={styles.title}>Create New Case</Text>
              <Text style={styles.fieldLabel}>Case name</Text>
              <TextInput style={styles.input} value={caseName} onChangeText={setCaseName} placeholder="e.g. Rhône reds" placeholderTextColor={colors.textMuted} maxLength={12} autoFocus />
              <Text style={styles.fieldLabel}>Note (optional)</Text>
              <View style={styles.noteRow}>
                <TextInput style={[styles.input, styles.noteInput]} value={caseNote} onChangeText={setCaseNote} placeholder="e.g. bought en primeur" placeholderTextColor={colors.textMuted} multiline />
                <MicButton value={caseNote} onChangeText={setCaseNote} onClear={() => setCaseNote('')} />
              </View>
              <TouchableOpacity style={[styles.saveBtn, saving && styles.optBtnDisabled]} onPress={saveNewCase} disabled={saving} activeOpacity={0.85}>
                <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancel} onPress={() => setStep('choose')}><Text style={styles.cancelText}>Back</Text></TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Add to Existing Case</Text>
              <ScrollView style={{ maxHeight: 320 }} keyboardShouldPersistTaps="handled">
                {cases.map((c) => (
                  <TouchableOpacity key={c.id} style={styles.caseRow} onPress={() => finish(() => fileInto(c.id))} disabled={saving} activeOpacity={0.7}>
                    <Text style={styles.caseName} numberOfLines={1}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.cancel} onPress={() => setStep('choose')}><Text style={styles.cancelText}>Back</Text></TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  // White, unfilled packaging-option buttons (no solid yellow).
  optBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  optBtnDisabled: { opacity: 0.4 },
  optText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: '#FFFFFF' },
  optTextDisabled: { color: colors.textMuted },
  fieldLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: spacing.sm, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, backgroundColor: colors.surface },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  noteInput: { flex: 1, minHeight: 44 },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  saveText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  caseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  caseName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, flexShrink: 1 },
  caseKind: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginLeft: spacing.md },
  cancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
