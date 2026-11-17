import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { wc } from '../wcStyles';
import { s } from './styles';
import { fmtDay, bottlesLabel } from './format';
import { showAlert } from '../../AppAlert';
import { useCellar } from '../../../hooks/useCellar';
import { bottleSizeCl } from '../../BottleSizePicker';
import { colors } from '../../../constants/theme';
import { ARCHIVE_NOTE_MAX } from '../../../services/archiveNight';
import type { CellarWine } from '../../../types/wine';
import type { WineCardData } from './useWineCardData';

const CELLAR_NOTE_MAX = 35;

// The Cellar Note, edited in place under the Cellared date and saved when the
// field loses focus (only if it changed). A note saved before the 35-character
// limit keeps its length.
function CellarNoteField({ wine, canEdit }: { wine: CellarWine; canEdit: boolean }) {
  const { updateWine } = useCellar();
  const qc = useQueryClient();
  const saved = wine.cellar_note ?? '';
  const [text, setText] = useState(saved);
  const [dirty, setDirty] = useState(false);
  // Follow the saved note until the user starts typing.
  useEffect(() => { if (!dirty) setText(saved); }, [saved, dirty]);
  const max = Math.max(CELLAR_NOTE_MAX, saved.length);

  async function save() {
    if (!dirty) return;
    setDirty(false);
    const next = text.trim();
    if (next === saved) return;
    try {
      await updateWine.mutateAsync({ id: wine.id, updates: { cellar_note: next || null } });
      void qc.invalidateQueries({ queryKey: ['rack-slots'] });
    } catch {
      showAlert({ title: 'Error', body: 'Could not save note.' });
    }
  }

  if (!canEdit) {
    return saved ? (
      <View style={wc.CellarNoteRow}>
        <Text style={wc.CellarNoteLabel}>Cellar Note: </Text>
        <Text style={wc.CellarNoteInput}>{saved}</Text>
      </View>
    ) : null;
  }
  return (
    <View style={wc.CellarNoteRow}>
      {text.trim() ? <Text style={wc.CellarNoteLabel}>Cellar Note: </Text> : null}
      <TextInput
        style={wc.CellarNoteInput}
        value={text}
        onChangeText={(t) => { setDirty(true); setText(t.slice(0, max)); }}
        onBlur={() => void save()}
        onSubmitEditing={() => Keyboard.dismiss()}
        placeholder="Add Cellar Note"
        placeholderTextColor={colors.gold}
        maxLength={max}
        returnKeyType="done"
        blurOnSubmit
        accessibilityLabel="Cellar Note"
      />
    </View>
  );
}

// An archived entry's note (its archive_note), from the Archive history list.
function ArchiveEntryNoteModal({ entry, onClose }: { entry: { id: string; label: string; note: string } | null; onClose: () => void }) {
  const { updateWine } = useCellar();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { setText(entry?.note ?? ''); }, [entry]);

  async function save(clear?: boolean) {
    if (!entry) return;
    setSaving(true);
    try {
      await updateWine.mutateAsync({ id: entry.id, updates: { archive_note: clear ? null : (text.trim().slice(0, ARCHIVE_NOTE_MAX) || null) } });
      onClose();
    } catch {
      showAlert({ title: 'Error', body: 'Could not save note.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={!!entry} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.cnOverlay}>
        <View style={s.cnSheet}>
          <View style={s.cnHeaderRow}>
            <Text style={s.cnTitle}>Archive Note</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Close">
              <Text style={s.cnCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.cnWineLine} numberOfLines={2}>{entry?.label}</Text>
          <TextInput
            style={s.cnInput}
            value={text}
            onChangeText={(t) => setText(t.slice(0, ARCHIVE_NOTE_MAX))}
            placeholder="e.g. Birthday dinner with friends"
            placeholderTextColor={colors.textMuted}
            maxLength={ARCHIVE_NOTE_MAX}
            multiline
            autoFocus={!entry?.note}
          />
          <Text style={s.cnCount}>{text.length}/{ARCHIVE_NOTE_MAX}</Text>
          <TouchableOpacity style={s.cnSaveBtn} onPress={() => void save()} disabled={saving} activeOpacity={0.85}>
            <Text style={s.cnSaveText}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
          {entry?.note ? (
            <TouchableOpacity style={s.cnCancel} onPress={() => void save(true)} disabled={saving}>
              <Text style={s.cnDeleteText}>Delete Note</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

export function CellarTab({ wine, data, canEdit, moving, returning, onPlace, onAddToLocation, onAdd, onMove, onArchive, onDelete, onReturn }: {
  wine: CellarWine;
  data: WineCardData;
  canEdit: boolean;
  moving: boolean;
  returning: boolean;
  onPlace: () => void;
  onAddToLocation: () => void;
  onAdd: () => void;
  onMove: () => void;
  onArchive: () => void;
  onDelete: () => void;
  // An archived wine: put its bottles back in the cellar (undo the archive).
  onReturn: () => void;
}) {
  const [noteEntry, setNoteEntry] = useState<{ id: string; label: string; note: string } | null>(null);
  const isArchived = !!wine.archived_at;
  const live = canEdit && !isArchived;
  const size = `${bottleSizeCl(wine.bottle_size_ml ?? 750)}cl`;
  const cellaredOn = wine.date_received ?? wine.created_at;
  const { entries, unplaced } = data;

  return (
    <>
      {cellaredOn ? <Text style={wc.Cellared}>Cellared {new Date(cellaredOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text> : null}
      <CellarNoteField wine={wine} canEdit={canEdit} />

      {/* Long-term storage: the same steady 12–13°C suits every wine (serving
          temperature, on the Serve tab, is per wine). */}
      <View style={wc.VsBar}>
        <Text style={wc.Label}>Recommended Cellar Temperature</Text>
        <Text style={wc.VsValue}>12–13°C <Text style={wc.VsDiff}>(54–55°F)</Text></Text>
      </View>

      <View style={wc.Card}>
        <Text style={wc.Label}>Bottles in My Cellar</Text>
        <Text style={wc.Value}>{data.inCellar.label}</Text>
        {entries.length > 0 || unplaced > 0 ? (
          <View style={wc.List}>
            {entries.map((e, i) => {
              const last = i === entries.length - 1 && unplaced === 0;
              const body = (
                <>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={wc.RowText} numberOfLines={1}>{e.label}{e.isExternal ? ' (external)' : ''}</Text>
                    {e.caseName ? <Text style={wc.Small}>in {e.caseName}</Text> : null}
                  </View>
                  <View style={wc.RowRight}>
                    <Text style={wc.RowScore}>{e.quantity}×{size}</Text>
                    {e.href ? <Text style={wc.Chevron}>›</Text> : null}
                  </View>
                </>
              );
              return e.href ? (
                <TouchableOpacity key={e.key} style={[wc.Row, last && wc.RowLast]} onPress={() => router.push(e.href!)} activeOpacity={0.7}>{body}</TouchableOpacity>
              ) : (
                <View key={e.key} style={[wc.Row, last && wc.RowLast]}>{body}</View>
              );
            })}
            {unplaced > 0 ? (
              <TouchableOpacity style={[wc.Row, wc.RowLast]} onPress={onPlace} disabled={!live} activeOpacity={0.7} accessibilityLabel="Place these bottles">
                <Text style={wc.RowText}>Your Cellar List (not yet placed)</Text>
                <View style={wc.RowRight}>
                  <Text style={wc.RowScore}>{unplaced}×{size}</Text>
                  {live ? <Text style={wc.Chevron}>›</Text> : null}
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
        {live ? (
          <>
            {/* Rule between the storage locations (white) and the commands (gold). */}
            <View style={s.cellarCommandRule} />
            {entries.length === 0 ? (
              <TouchableOpacity onPress={onAddToLocation}><Text style={[s.statAction, s.cellarCommand]}>Add to Location →</Text></TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={onAdd} activeOpacity={0.7}><Text style={[s.statAction, s.cellarCommand]}>Add Bottles →</Text></TouchableOpacity>
            {data.inCellar.total > 0 ? (
              <>
                <TouchableOpacity onPress={onMove} disabled={moving} activeOpacity={0.7}><Text style={[s.statAction, s.cellarCommand]}>{moving ? 'Moving…' : 'Move Bottles →'}</Text></TouchableOpacity>
                <TouchableOpacity onPress={onArchive} activeOpacity={0.7}><Text style={[s.statAction, s.cellarCommand]}>Archive Bottles →</Text></TouchableOpacity>
              </>
            ) : null}
            <TouchableOpacity onPress={onDelete} activeOpacity={0.7}><Text style={[s.statAction, s.cellarCommand]}>Delete Wine →</Text></TouchableOpacity>
          </>
        ) : null}
      </View>

      <View style={wc.Card}>
        <Text style={wc.Label}>Bottles in My Archive</Text>
        {data.inArchive.total === 0
          ? <Text style={[wc.Value, s.statValueMuted]}>{bottlesLabel(0)}</Text>
          : <Text style={wc.Value}>{data.inArchive.label}</Text>}
        {data.archiveEntries.length > 0 ? (
          <View style={wc.List}>
            {data.archiveEntries.map((a, i) => {
              const label = `${fmtDay(a.archived_at)} · ${bottlesLabel(a.quantity ?? 0)}`;
              const note = a.archive_note?.trim() ?? '';
              return (
                <View key={a.id} style={[wc.Row, i === data.archiveEntries.length - 1 && wc.RowLast]}>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={wc.RowText}>{label}</Text>
                    {note ? <Text style={wc.SmallItalic}>{note}</Text> : null}
                  </View>
                  {canEdit ? (
                    <TouchableOpacity onPress={() => setNoteEntry({ id: a.id, label, note })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                      <Text style={wc.Link}>{note ? 'Edit Note' : 'Add Note'}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}
        {canEdit && isArchived ? (
          <>
            <View style={s.cellarCommandRule} />
            <TouchableOpacity onPress={onReturn} disabled={returning} activeOpacity={0.7}>
              <Text style={[s.statAction, s.cellarCommand]}>{returning ? 'Returning…' : 'Return to Cellar →'}</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      <ArchiveEntryNoteModal entry={noteEntry} onClose={() => setNoteEntry(null)} />
    </>
  );
}
