import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MicButton } from './MicButton';
import { useAuth } from '../hooks/useAuth';
import { useCellar } from '../hooks/useCellar';
import { fetchStorageLocations, assignWineToStorageLocation } from '../api/storageLocations';
import { addCellarWine, addCellarWineRemoval, updateCellarWine } from '../api/cellar';
import { parseCellarCommand, type CellarCommandAction, type CellarCommandResult } from '../api/cellarCommand';
import type { CellarWine } from '../types/wine';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

type Phase = 'choose' | 'speak' | 'parsing' | 'pick' | 'confirm' | 'need' | 'success' | 'error';

const ACTIONS: { key: CellarCommandAction; label: string; prompt: string; example: string }[] = [
  { key: 'move', label: 'Move bottles from one storage location to another', prompt: 'Say the wine and where to move it.', example: '"Move the Produttori Barolo to the fridge."' },
  { key: 'archive', label: 'Archive Bottles', prompt: 'Say the wine, and how many bottles.', example: '"Archive two bottles of the Chablis."' },
  { key: 'add', label: 'Add Bottles', prompt: 'Say the wine, the vintage, and how many.', example: '"Add six bottles of Produttori del Barolo 2019."' },
];

function wineLabel(w: CellarWine | undefined): string {
  if (!w) return 'this wine';
  return [w.producer, w.wine_name, w.vintage].filter(Boolean).join(' · ');
}

export function CellarCommandModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const { wines } = useCellar();
  const { data: locations = [] } = useQuery({
    queryKey: ['storage-locations', userId],
    queryFn: () => fetchStorageLocations(userId!),
    enabled: !!userId,
  });

  const [phase, setPhase] = useState<Phase>('choose');
  const [action, setAction] = useState<CellarCommandAction>('move');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<CellarCommandResult | null>(null);
  const [chosenWineId, setChosenWineId] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const actionMeta = ACTIONS.find((a) => a.key === action)!;
  const chosenWine = wines.find((w) => w.id === chosenWineId);
  const targetLocation = locations.find((l) => l.id === result?.locationId);

  function reset() {
    setPhase('choose');
    setTranscript('');
    setResult(null);
    setChosenWineId(null);
    setSuccessMsg('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function pickAction(a: CellarCommandAction) {
    setAction(a);
    setTranscript('');
    setResult(null);
    setChosenWineId(null);
    setPhase('speak');
  }

  function routeToAdd(res: CellarCommandResult) {
    const p = res.add;
    const q = new URLSearchParams();
    if (p?.producer) q.set('producer', p.producer);
    if (p?.wineName) q.set('wineName', p.wineName);
    if (p?.vintage) q.set('vintage', String(p.vintage));
    if (p?.region) q.set('region', p.region);
    if (res.quantity) q.set('quantity', String(res.quantity));
    if (res.locationId) q.set('storageLocationId', res.locationId);
    handleClose();
    router.push(`/cellar/add?${q.toString()}` as any);
  }

  async function runParse() {
    if (!transcript.trim()) return;
    setPhase('parsing');
    try {
      const res = await parseCellarCommand(action, transcript, wines, locations);
      setResult(res);

      if (action === 'add') {
        const named = res.add && (res.add.wineName || res.add.producer);
        if (!named || res.needs === 'wine') { setPhase('need'); return; }
        routeToAdd(res);
        return;
      }

      // move / archive both need a resolved wine
      if (!res.wineId || res.needs === 'wine') {
        if (res.candidates.length > 1) { setPhase('pick'); return; }
        setPhase('need');
        return;
      }
      if (action === 'move' && (!res.locationId || res.needs === 'location')) {
        setPhase('need');
        return;
      }
      setChosenWineId(res.wineId);
      setPhase('confirm');
    } catch {
      setPhase('error');
    }
  }

  async function execute() {
    if (!chosenWine || executing) return;
    setExecuting(true);
    try {
      if (action === 'move') {
        if (!result?.locationId) return;
        await assignWineToStorageLocation(chosenWine.id, result.locationId);
        qc.invalidateQueries({ queryKey: ['cellar', userId] });
        qc.invalidateQueries({ queryKey: ['storage-locations', userId] });
        setSuccessMsg(`Moved ${wineLabel(chosenWine)} to ${targetLocation?.name ?? 'its new home'}.`);
      } else {
        // archive — mirror the Chef pairing "Select & Archive" flow so the
        // removal log and archive stats stay consistent.
        const count = Math.min(chosenWine.quantity, Math.max(1, result?.quantity ?? chosenWine.quantity));
        const removedAt = new Date().toISOString();
        await addCellarWineRemoval({ cellarWineId: chosenWine.id, removedAt, count, note: 'Archived by voice command' });
        if (count >= chosenWine.quantity) {
          await updateCellarWine(chosenWine.id, { quantity: count, archived_at: removedAt });
        } else {
          await updateCellarWine(chosenWine.id, { quantity: chosenWine.quantity - count });
          const { id, created_at, updated_at, ...rest } = chosenWine;
          await addCellarWine({ ...rest, quantity: count, archived_at: removedAt, is_wishlist: false });
        }
        qc.invalidateQueries({ queryKey: ['cellar', userId] });
        qc.invalidateQueries({ queryKey: ['cellar-archive', userId] });
        qc.invalidateQueries({ queryKey: ['cellar-removals', chosenWine.id] });
        qc.invalidateQueries({ queryKey: ['slot-assignments'] });
        qc.invalidateQueries({ queryKey: ['rack-slots'] });
        setSuccessMsg(`Archived ${count} ${count === 1 ? 'bottle' : 'bottles'} of ${wineLabel(chosenWine)}.`);
      }
      setPhase('success');
    } catch {
      setPhase('error');
    } finally {
      setExecuting(false);
    }
  }

  // The confirm sentence for move / archive.
  function confirmText(): string {
    if (action === 'move') return `Move ${wineLabel(chosenWine)} to ${targetLocation?.name ?? 'the chosen location'}?`;
    const count = Math.min(chosenWine?.quantity ?? 1, Math.max(1, result?.quantity ?? (chosenWine?.quantity ?? 1)));
    return `Archive ${count} ${count === 1 ? 'bottle' : 'bottles'} of ${wineLabel(chosenWine)}?`;
  }

  const candidateWines = (result?.candidates ?? []).map((id) => wines.find((w) => w.id === id)).filter(Boolean) as CellarWine[];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {phase === 'choose' && (
            <>
              <Text style={styles.title}>What would you like to do?</Text>
              {ACTIONS.map((a) => (
                <TouchableOpacity key={a.key} style={styles.choiceBtn} onPress={() => pickAction(a.key)} activeOpacity={0.8}>
                  <Text style={styles.choiceText}>{a.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={handleClose} style={styles.cancelRow}><Text style={styles.cancelText}>Close</Text></TouchableOpacity>
            </>
          )}

          {phase === 'speak' && (
            <>
              <Text style={styles.title}>{actionMeta.prompt}</Text>
              <Text style={styles.example}>{actionMeta.example}</Text>
              <View style={styles.micRow}>
                <MicButton value={transcript} onChangeText={setTranscript} onClear={() => setTranscript('')} />
              </View>
              <Text style={styles.transcript}>{transcript || 'Tap the mic and speak…'}</Text>
              <TouchableOpacity
                style={[styles.primaryBtn, !transcript.trim() && styles.btnDisabled]}
                onPress={runParse}
                disabled={!transcript.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPhase('choose')} style={styles.cancelRow}><Text style={styles.cancelText}>Back</Text></TouchableOpacity>
            </>
          )}

          {phase === 'parsing' && (
            <View style={styles.centerBlock}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.parsingText}>Understanding…</Text>
            </View>
          )}

          {phase === 'pick' && (
            <>
              <Text style={styles.title}>Which wine did you mean?</Text>
              <ScrollView style={{ maxHeight: 320 }}>
                {candidateWines.map((w) => (
                  <TouchableOpacity key={w.id} style={styles.pickRow} onPress={() => { setChosenWineId(w.id); setPhase('confirm'); }} activeOpacity={0.7}>
                    <Text style={styles.pickWine} numberOfLines={2}>{wineLabel(w)}</Text>
                    {w.region ? <Text style={styles.pickRegion} numberOfLines={1}>{w.region}</Text> : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setPhase('speak')} style={styles.cancelRow}><Text style={styles.cancelText}>Try again</Text></TouchableOpacity>
            </>
          )}

          {phase === 'confirm' && (
            <>
              <Text style={styles.title}>Confirm</Text>
              <Text style={styles.confirmBody}>{confirmText()}</Text>
              <TouchableOpacity style={[styles.primaryBtn, executing && styles.btnDisabled]} onPress={execute} disabled={executing} activeOpacity={0.8}>
                {executing ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.primaryBtnText}>{action === 'archive' ? 'Archive' : 'Move'}</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPhase('speak')} style={styles.cancelRow}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            </>
          )}

          {phase === 'need' && (
            <>
              <Text style={styles.title}>Didn't quite catch that</Text>
              <Text style={styles.confirmBody}>{result?.message?.trim() || (action === 'move' ? "I couldn't match the wine or the location. Try again — name the wine and where to move it." : "I couldn't match that to a wine in your cellar. Try again with the producer or wine name.")}</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setPhase('speak')} activeOpacity={0.8}><Text style={styles.primaryBtnText}>Try again</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.cancelRow}><Text style={styles.cancelText}>Close</Text></TouchableOpacity>
            </>
          )}

          {phase === 'error' && (
            <>
              <Text style={styles.title}>Something went wrong</Text>
              <Text style={styles.confirmBody}>Please try again.</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setPhase('speak')} activeOpacity={0.8}><Text style={styles.primaryBtnText}>Try again</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.cancelRow}><Text style={styles.cancelText}>Close</Text></TouchableOpacity>
            </>
          )}

          {phase === 'success' && (
            <View style={styles.centerBlock}>
              <Text style={styles.tick}>✓</Text>
              <Text style={styles.confirmBody}>{successMsg}</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={reset} activeOpacity={0.8}><Text style={styles.primaryBtnText}>Another command</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.cancelRow}><Text style={styles.cancelText}>Done</Text></TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  title: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md },
  example: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold, textAlign: 'center', marginBottom: spacing.md },
  // Chooser buttons.
  choiceBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.md, paddingHorizontal: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  choiceText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: '#FFFFFF', textAlign: 'center' },
  micRow: { alignItems: 'center', marginBottom: spacing.md },
  transcript: { fontFamily: fonts.bodyRegular, fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg, minHeight: 44 },
  primaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  primaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  btnDisabled: { opacity: 0.5 },
  cancelRow: { alignItems: 'center', paddingVertical: spacing.md },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  centerBlock: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  parsingText: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, marginTop: spacing.sm },
  confirmBody: { fontFamily: fonts.bodyRegular, fontSize: 17, color: '#FFFFFF', textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  pickRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickWine: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  pickRegion: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  tick: { fontFamily: fonts.headingBold, fontSize: 52, color: colors.gold, textAlign: 'center' },
});
