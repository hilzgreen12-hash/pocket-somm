import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { s } from './styles';
import { DateInput } from '../../DateInput';
import { showAlert } from '../../AppAlert';
import { todayYmd } from '../../../utils/reviewDate';
import { ARCHIVE_NOTE_MAX } from '../../../services/archiveNight';
import { colors } from '../../../constants/theme';
import type { CellarWine } from '../../../types/wine';

// "Archive Bottles": how many, when they were drunk and a short note, then
// Archive — or Delete them from your records instead. The wine card's Cellar
// tab, a bin and an alt cellar all use it; `wine.quantity` is the most that can
// be archived from where the sheet was opened.
export function ArchiveBottlesSheet({ visible, wine, initialCount, working, onArchive, onDelete, onClose }: {
  visible: boolean;
  wine: CellarWine;
  initialCount: number;
  working: boolean;
  onArchive: (input: { count: number; date: string; note: string }) => void;
  onDelete: (count: number) => void;
  onClose: () => void;
}) {
  const [count, setCount] = useState(String(initialCount));
  const [date, setDate] = useState(todayYmd());
  // Where or with whom it was drunk; becomes the archived bottles' Archive Note.
  const [note, setNote] = useState('');
  useEffect(() => {
    if (!visible) return;
    setCount(String(initialCount));
    setDate(todayYmd());
    setNote('');
  }, [visible, initialCount]);

  // The count entered, checked against the bottles held (null after an alert).
  function checkedCount(): number | null {
    const n = wine.quantity > 1 ? parseInt(count, 10) || 0 : 1;
    if (n < 1) { showAlert({ title: 'Invalid', body: 'Enter at least 1 bottle.' }); return null; }
    if (n > wine.quantity) { showAlert({ title: 'Invalid', body: `You only have ${wine.quantity} bottle${wine.quantity === 1 ? '' : 's'}.` }); return null; }
    return n;
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => !working && onClose()}>
      <KeyboardAvoidingView behavior="padding" style={s.modalOverlay}>
        <View style={s.bottomSheet}>
          <Text style={s.bottomSheetTitle}>Archive or Delete Wine</Text>
          <Text style={s.bottomSheetWine}>{wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''}</Text>

          {wine.quantity > 1 ? (
            <>
              <Text style={s.fieldLabel}>How many of your {wine.quantity} bottles?</Text>
              <TextInput style={s.input} value={count} onChangeText={setCount} keyboardType="number-pad" placeholder="1" placeholderTextColor={colors.textMuted} />
            </>
          ) : null}

          <Text style={s.fieldLabel}>Date removed</Text>
          <DateInput style={s.input} valueIso={date} onChangeIso={setDate} placeholderTextColor={colors.textMuted} />

          <Text style={s.fieldLabel}>Note (optional)</Text>
          <TextInput
            style={s.input}
            value={note}
            onChangeText={(t) => setNote(t.slice(0, ARCHIVE_NOTE_MAX))}
            placeholder="e.g. dinner with the Smiths"
            placeholderTextColor={colors.textMuted}
            maxLength={ARCHIVE_NOTE_MAX}
          />
          <Text style={s.noteHint}>{note.length}/{ARCHIVE_NOTE_MAX} — where or with whom you drank it.</Text>

          <TouchableOpacity style={[s.sheetBtn, working && s.buttonDisabled]} onPress={() => { const n = checkedCount(); if (n) onArchive({ count: n, date, note: note.trim() }); }} disabled={working}>
            <Text style={s.sheetBtnText}>{working ? 'Working…' : 'Archive Wine'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.sheetBtn, s.sheetBtnSecond, working && s.buttonDisabled]} onPress={() => { const n = checkedCount(); if (n) onDelete(n); }} disabled={working}>
            <Text style={s.sheetBtnText}>Delete Wine From Your Records</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={s.sheetCancel} disabled={working}>
            <Text style={s.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
