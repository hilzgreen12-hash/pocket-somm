import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { showAlert } from './AppAlert';
import { parseRecipeNotes, serializeRecipeNotes, newNoteId, formatNoteDate, type RecipeNote } from '../utils/recipeNotes';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// A saved recipe's notes, kept like review entries: each saved note shows as
// text with its date and an Edit link (edit it, or delete it); "Add Note"
// writes another, and so on.
export function RecipeNotesModal({ visible, title, rawNotes, notesUpdatedAt, onSave, onClose }: {
  visible: boolean;
  title?: string | null;            // the recipe's name
  rawNotes: string | null | undefined;
  notesUpdatedAt?: string | null;   // dates a note saved before notes were dated
  onSave: (serialized: string | null) => Promise<void>;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState<RecipeNote[]>([]);
  // The note being written: an existing note's id, 'new', or null (none).
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const list = parseRecipeNotes(rawNotes, notesUpdatedAt);
    setNotes(list);
    // No notes yet: open straight onto a new one.
    setEditing(list.length ? null : 'new');
    setDraft('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  async function commit(next: RecipeNote[]) {
    setSaving(true);
    try {
      await onSave(serializeRecipeNotes(next));
      setNotes([...next].sort((a, b) => b.at.localeCompare(a.at)));
      setEditing(null);
      setDraft('');
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function saveDraft() {
    Keyboard.dismiss();
    const text = draft.trim();
    if (!text || !editing) return;
    if (editing === 'new') void commit([{ id: newNoteId(), text, at: new Date().toISOString() }, ...notes]);
    // An edited note keeps its own date.
    else void commit(notes.map((n) => (n.id === editing ? { ...n, text } : n)));
  }

  function confirmDelete(n: RecipeNote) {
    showAlert({
      title: 'Delete this note?',
      body: 'This action cannot be undone.',
      buttons: [
        { text: 'Delete Note', style: 'destructive', onPress: () => void commit(notes.filter((x) => x.id !== n.id)) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  const input = (
    <>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        placeholder="How did the pairing go? Tweaks, occasion, who you cooked it for…"
        placeholderTextColor={colors.textMuted}
        multiline
        autoFocus
        textAlignVertical="top"
      />
      <TouchableOpacity style={[styles.btn, (!draft.trim() || saving) && styles.btnOff]} onPress={saveDraft} disabled={!draft.trim() || saving} activeOpacity={0.85}>
        <Text style={styles.btnText}>{saving ? 'Saving…' : 'Save Note'}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <TouchableOpacity style={styles.close} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Close">
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Your Recipe Notes</Text>
            {title ? <Text style={styles.recipe} numberOfLines={2}>{title}</Text> : null}

            <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
              {editing === 'new' ? <View style={styles.entry}>{input}</View> : null}
              {notes.map((n) => (
                <View key={n.id} style={styles.entry}>
                  <View style={styles.entryHead}>
                    <Text style={styles.date}>{formatNoteDate(n.at)}</Text>
                    {editing === n.id ? (
                      <TouchableOpacity onPress={() => confirmDelete(n)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={styles.deleteLink}>Delete</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => { setEditing(n.id); setDraft(n.text); }} disabled={saving} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={styles.editLink}>Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {editing === n.id ? input : <Text style={styles.noteText}>{n.text}</Text>}
                </View>
              ))}
            </ScrollView>

            {editing === null ? (
              <TouchableOpacity style={[styles.btn, { marginTop: spacing.md }]} onPress={() => { setEditing('new'); setDraft(''); }} activeOpacity={0.85}>
                <Text style={styles.btnText}>Add Note</Text>
              </TouchableOpacity>
            ) : notes.length ? (
              <TouchableOpacity onPress={() => { setEditing(null); setDraft(''); }} style={styles.cancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.lg },
  close: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 10, padding: 6 },
  closeText: { fontFamily: fonts.bodyRegular, fontSize: 18, color: colors.textMuted, lineHeight: 20 },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.5 },
  recipe: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, textAlign: 'center', marginTop: 4, marginBottom: spacing.sm, paddingHorizontal: spacing.lg },
  entry: { paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  entryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  date: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  editLink: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },
  deleteLink: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
  noteText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 23 },
  input: { minHeight: 110, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm },
  btn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  btnOff: { opacity: 0.5 },
  btnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancel: { alignItems: 'center', paddingTop: spacing.md },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
});
