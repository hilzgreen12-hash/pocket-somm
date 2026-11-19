import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { wc } from '../wcStyles';
import { s } from './styles';
import { fmtDay, bottlesLabel } from './format';
import { showAlert } from '../../AppAlert';
import { useCellar } from '../../../hooks/useCellar';
import { colors } from '../../../constants/theme';
import { ARCHIVE_NOTE_MAX } from '../../../services/archiveNight';
import type { WineCardData } from './useWineCardData';

type NoteEntry = { id: string; label: string; note: string };

// An archived entry's note (its archive_note), from the list below.
function ArchiveEntryNoteModal({ entry, onClose }: { entry: NoteEntry | null; onClose: () => void }) {
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

// "Bottles in My Archive": every archived entry of this wine with its note.
// On a live wine's Cellar tab it's the wine's archive history; on an archived
// wine's card it also offers Return to Cellar (when `onReturn` is given).
export function ArchiveBottlesCard({ data, canEdit, returning = false, onReturn }: {
  data: WineCardData;
  canEdit: boolean;
  returning?: boolean;
  onReturn?: () => void;
}) {
  const [noteEntry, setNoteEntry] = useState<NoteEntry | null>(null);

  return (
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
      {canEdit && onReturn ? (
        <>
          <View style={s.cellarCommandRule} />
          <TouchableOpacity onPress={onReturn} disabled={returning} activeOpacity={0.7}>
            <Text style={[s.statAction, s.cellarCommand]}>{returning ? 'Returning…' : 'Return to Cellar →'}</Text>
          </TouchableOpacity>
        </>
      ) : null}

      <ArchiveEntryNoteModal entry={noteEntry} onClose={() => setNoteEntry(null)} />
    </View>
  );
}
