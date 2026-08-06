import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { showAlert } from './AppAlert';
import { MicButton } from './MicButton';
import {
  fetchStorageLocationCases, createStorageCase, assignWineToCase,
  caseKindLabel, type CaseKind,
} from '../api/storageLocations';
import type { StorageCase } from '../types/wine';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// "How is this wine packaged?" — shown whenever a wine lands in an Other Home
// Storage location. Offers Loose Bottles, a new case (Mixed / Non-OWC / OWC), or
// filing into an existing case in that location. Files the wine via case_id;
// Loose leaves it uncased. The caller invalidates via onDone.
const NEW_KINDS: { kind: CaseKind; label: string }[] = [
  { kind: 'mixed', label: 'Mixed Case' },
  { kind: 'non_owc', label: 'Non-OWC Case' },
  { kind: 'owc', label: 'OWC' },
];

interface Props {
  visible: boolean;
  wineId: string | null;
  locationId: string | null;
  userId: string;
  onClose: () => void;
  onDone: () => void; // fired after the wine is filed, so the caller can refresh
}

export function PackagingPrompt({ visible, wineId, locationId, userId, onClose, onDone }: Props) {
  const [step, setStep] = useState<'choose' | 'newCase' | 'existing'>('choose');
  const [kind, setKind] = useState<CaseKind>('mixed');
  const [caseName, setCaseName] = useState('');
  const [caseNote, setCaseNote] = useState('');
  const [cases, setCases] = useState<StorageCase[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setStep('choose'); setKind('mixed'); setCaseName(''); setCaseNote('');
    if (locationId) fetchStorageLocationCases(locationId).then(setCases).catch(() => setCases([]));
  }, [visible, locationId]);

  async function finish(action: () => Promise<void>) {
    if (!wineId || saving) return;
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

  function chooseKind(k: CaseKind) {
    setKind(k);
    setCaseName('');
    setCaseNote('');
    setStep('newCase');
  }

  function saveNewCase() {
    if (!caseName.trim()) { showAlert({ title: 'Name the case', body: `Give this ${caseKindLabel(kind)} a name so you can find it.` }); return; }
    void finish(async () => {
      const created = await createStorageCase(userId, { storageLocationId: locationId!, name: caseName, kind, note: caseNote });
      await assignWineToCase(wineId!, created.id);
    });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {step === 'choose' ? (
            <>
              <Text style={styles.title}>How is this wine packaged?</Text>
              <TouchableOpacity style={styles.optBtn} onPress={() => finish(() => assignWineToCase(wineId!, null))} disabled={saving} activeOpacity={0.85}>
                <Text style={styles.optText}>Loose Bottles</Text>
              </TouchableOpacity>
              {NEW_KINDS.map((o) => (
                <TouchableOpacity key={o.kind} style={styles.optBtn} onPress={() => chooseKind(o.kind)} activeOpacity={0.85}>
                  <Text style={styles.optText}>{o.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.optBtn, !cases.length && styles.optBtnDisabled]} onPress={() => cases.length && setStep('existing')} disabled={!cases.length} activeOpacity={0.85}>
                <Text style={[styles.optText, !cases.length && styles.optTextDisabled]}>Add to Existing Case{cases.length ? '' : ' (none yet)'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            </>
          ) : step === 'newCase' ? (
            <>
              <Text style={styles.title}>{caseKindLabel(kind)}</Text>
              <Text style={styles.fieldLabel}>Case name</Text>
              <TextInput style={styles.input} value={caseName} onChangeText={setCaseName} placeholder={kind === 'mixed' ? 'e.g. Mixed Burgundy' : 'e.g. OWC'} placeholderTextColor={colors.textMuted} autoFocus />
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
                  <TouchableOpacity key={c.id} style={styles.caseRow} onPress={() => finish(() => assignWineToCase(wineId!, c.id))} disabled={saving} activeOpacity={0.7}>
                    <Text style={styles.caseName} numberOfLines={1}>{c.name}</Text>
                    <Text style={styles.caseKind}>{caseKindLabel(c.kind)}</Text>
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
  optBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  optBtnDisabled: { opacity: 0.4 },
  optText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  optTextDisabled: { color: colors.textMuted },
  fieldLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: spacing.sm, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, backgroundColor: colors.surface },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  noteInput: { flex: 1, minHeight: 44 },
  saveBtn: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  saveText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.background },
  caseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  caseName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, flexShrink: 1 },
  caseKind: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginLeft: spacing.md },
  cancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
