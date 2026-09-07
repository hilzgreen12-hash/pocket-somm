import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MicButton } from './MicButton';
import { useAuth } from '../hooks/useAuth';
import { useCellar } from '../hooks/useCellar';
import { fetchStorageLocations } from '../api/storageLocations';
import { addCellarWine, addCellarWineRemoval, updateCellarWine } from '../api/cellar';
import { getRacks, clearWineFromRacks, removeSlotsForWine } from '../api/racks';
import { getBins } from '../api/bins';
import { parseCellarCommand, type CellarCommandAction, type CellarCommandResult } from '../api/cellarCommand';
import type { CellarWine } from '../types/wine';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

type Phase = 'choose' | 'speak' | 'parsing' | 'pick' | 'confirm' | 'need' | 'success' | 'error';


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
  // Placement units a voice move can target — racks & fridges plus bins (all
  // wine_racks rows). Each destination screen surfaces awaiting-placement
  // bottles so a moved bottle is never invisible.
  const { data: units = [] } = useQuery({
    queryKey: ['placement-units', userId],
    queryFn: async () => [...(await getRacks(userId!)), ...(await getBins(userId!))],
    enabled: !!userId,
  });

  const [phase, setPhase] = useState<Phase>('speak');
  const [action, setAction] = useState<CellarCommandAction>('move');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<CellarCommandResult | null>(null);
  const [chosenWineId, setChosenWineId] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [success, setSuccess] = useState<{
    action: 'move' | 'archive';
    wine: string;        // producer + name
    meta: string;        // region · vintage
    detail: string;      // "from X to Y" (move) / "N bottles archived" (archive)
    viewLabel: string;   // "View in <destination>"
    viewRoute: string;
  } | null>(null);

  const chosenWine = wines.find((w) => w.id === chosenWineId);
  const targetLocation = locations.find((l) => l.id === result?.locationId);
  const targetUnit = units.find((u) => u.id === result?.unitId);
  const destName = targetUnit?.name ?? targetLocation?.name ?? null;

  function reset() {
    setPhase('speak');
    setTranscript('');
    setResult(null);
    setChosenWineId(null);
    setSuccess(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function runParse() {
    if (!transcript.trim()) return;
    // Free-form command: infer the verb from the words (archive vs move) rather
    // than making the user pick it up front.
    const act: CellarCommandAction = /\barchiv/i.test(transcript) ? 'archive' : 'move';
    setAction(act);
    setPhase('parsing');
    try {
      const res = await parseCellarCommand(act, transcript, wines, locations, units);
      setResult(res);

      // move / archive both need a resolved wine
      if (!res.wineId || res.needs === 'wine') {
        if (res.candidates.length > 1) { setPhase('pick'); return; }
        setPhase('need');
        return;
      }
      // A move needs a destination — either an Alt Cellar or a rack/fridge/bin.
      if (act === 'move' && (res.needs === 'location' || (!res.locationId && !res.unitId))) {
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
        if (!result?.locationId && !result?.unitId) return;
        const count = Math.min(chosenWine.quantity, Math.max(1, result?.quantity ?? chosenWine.quantity));
        const whole = count >= chosenWine.quantity;
        const fromName = chosenWine.storage_location_id
          ? (locations.find((l) => l.id === chosenWine.storage_location_id)?.name ?? 'your cellar')
          : 'your cellar';
        const toName = destName ?? 'its new location';
        // A rack/fridge/bin destination flags the bottle "awaiting placement" in
        // that unit (no slot yet); an Alt Cellar keeps storage_location_id and
        // is flagged awaiting placement too (the user can "ignore" it there).
        const destFields = result?.unitId
          ? { storage_location_id: null, case_id: null, bin_cell_id: null, awaiting_placement: true, awaiting_placement_unit_id: result.unitId }
          : { storage_location_id: result!.locationId, case_id: null, bin_cell_id: null, awaiting_placement: true, awaiting_placement_unit_id: null };

        if (whole) {
          await clearWineFromRacks(chosenWine.id);
          await updateCellarWine(chosenWine.id, destFields);
        } else {
          // Partial move: free that many source slots, decrement the source, and
          // clone a destination row carrying the moved bottles (awaiting placement).
          await removeSlotsForWine(chosenWine.id, count);
          await updateCellarWine(chosenWine.id, { quantity: chosenWine.quantity - count });
          const { id, created_at, updated_at, ...rest } = chosenWine;
          await addCellarWine({ ...rest, quantity: count, is_wishlist: false, ...destFields });
        }
        qc.invalidateQueries({ queryKey: ['cellar', userId] });
        qc.invalidateQueries({ queryKey: ['storage-locations', userId] });
        qc.invalidateQueries({ queryKey: ['storage-location-wines'] });
        qc.invalidateQueries({ queryKey: ['racks', userId] });
        qc.invalidateQueries({ queryKey: ['rack-slots'] });
        qc.invalidateQueries({ queryKey: ['slot-assignments'] });
        qc.invalidateQueries({ queryKey: ['bins', userId] });
        const viewRoute = result?.unitId
          ? (targetUnit?.storage_type === 'bin' ? `/cellar/bin/${result.unitId}` : `/cellar/rack/${result.unitId}`)
          : `/cellar/storage-location/${result!.locationId}`;
        setSuccess({
          action: 'move',
          wine: [chosenWine.producer, chosenWine.wine_name].filter(Boolean).join(' '),
          meta: [chosenWine.region, chosenWine.vintage].filter(Boolean).join(' · '),
          detail: `${count} ${count === 1 ? 'bottle' : 'bottles'} · from ${fromName} to ${toName} — awaiting placement`,
          viewLabel: `View in ${toName}`,
          viewRoute,
        });
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
        setSuccess({
          action: 'archive',
          wine: [chosenWine.producer, chosenWine.wine_name].filter(Boolean).join(' '),
          meta: [chosenWine.region, chosenWine.vintage].filter(Boolean).join(' · '),
          detail: `${count} ${count === 1 ? 'bottle' : 'bottles'} moved to Your Cellar Archive`,
          viewLabel: 'View in Your Cellar Archive',
          viewRoute: '/cellar/list?archived=1',
        });
      }
      setPhase('success');
    } catch {
      setPhase('error');
    } finally {
      setExecuting(false);
    }
  }

  // The confirm sentence for move / archive — always states the bottle count.
  function confirmText(): string {
    const count = Math.min(chosenWine?.quantity ?? 1, Math.max(1, result?.quantity ?? (chosenWine?.quantity ?? 1)));
    const bottles = `${count} ${count === 1 ? 'bottle' : 'bottles'}`;
    if (action === 'move') return `Move ${bottles} of ${wineLabel(chosenWine)} to ${destName ?? 'the chosen location'}?`;
    return `Archive ${bottles} of ${wineLabel(chosenWine)}?`;
  }

  const candidateWines = (result?.candidates ?? []).map((id) => wines.find((w) => w.id === id)).filter(Boolean) as CellarWine[];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {phase === 'speak' && (
            <>
              <Text style={styles.title}>Tap the mic and give your command…</Text>
              <Text style={styles.example}>e.g. “Move 3 bottles of d’Yquem from the small rack to my wine fridge”</Text>
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
              <TouchableOpacity onPress={handleClose} style={styles.cancelRow}><Text style={styles.cancelText}>Close</Text></TouchableOpacity>
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

          {phase === 'success' && success && (
            <>
              <Text style={styles.successAction}>{success.action === 'archive' ? 'Archived' : 'Moved'}</Text>
              <Text style={styles.successWine}>{success.wine}</Text>
              {success.meta ? <Text style={styles.successMeta}>{success.meta}</Text> : null}
              <Text style={styles.successDetail}>{success.detail}</Text>
              <TouchableOpacity onPress={() => { handleClose(); router.push(success.viewRoute as any); }} activeOpacity={0.7} style={styles.viewLinkRow}>
                <Text style={styles.viewLink}>{success.viewLabel} →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, styles.successBtn]} onPress={reset} activeOpacity={0.8}><Text style={styles.primaryBtnText}>Another Command</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.cancelRow}><Text style={styles.cancelText}>Done</Text></TouchableOpacity>
            </>
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
  // Success popup — "Moved"/"Archived" header, the wine, its region · vintage,
  // the from→to (or count) detail, then a "View in <destination>" link.
  successAction: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  successWine: { fontFamily: fonts.headingSemibold, fontSize: 18, color: colors.text, textAlign: 'center', marginBottom: 2 },
  successMeta: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold, textAlign: 'center', marginBottom: spacing.sm },
  successDetail: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  viewLinkRow: { alignItems: 'center', paddingVertical: spacing.sm, marginBottom: spacing.sm },
  viewLink: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  // Enlarged so "Another Command" isn't cramped.
  successBtn: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
});
