import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { colors, spacing } from '../../src/constants/theme';
import type { CellarWine } from '../../src/types/wine';

function NoteCard({ wine, onSaveNote }: {
  wine: CellarWine;
  onSaveNote: (id: string, note: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState(wine.tasting_notes ?? '');

  function handleSave() {
    onSaveNote(wine.id, noteText);
    setEditing(false);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.wineName}>
        {wine.vintage ? `${wine.vintage} ` : ''}{wine.wine_name}
      </Text>
      <Text style={styles.wineDetail}>
        {[wine.producer, wine.region].filter(Boolean).join(' · ')}
      </Text>

      {editing ? (
        <View style={styles.editBlock}>
          <TextInput
            style={styles.noteInput}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Your tasting note…"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />
          <View style={styles.editActions}>
            <TouchableOpacity onPress={() => { setEditing(false); setNoteText(wine.tasting_notes ?? ''); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.noteBlock}>
          {wine.tasting_notes ? (
            <Text style={styles.noteText}>{wine.tasting_notes}</Text>
          ) : (
            <Text style={styles.notePlaceholder}>No tasting note yet</Text>
          )}
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={styles.editLink}>{wine.tasting_notes ? 'Edit Note' : 'Add Note'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function CellarNotesScreen() {
  const { wines, isLoading, updateWine } = useCellar();

  function handleSaveNote(id: string, note: string) {
    updateWine.mutate({ id, updates: { tasting_notes: note.trim() || null } });
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cellar Wine Notes</Text>
        <View style={{ width: 40 }} />
      </View>

      {wines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No wines in your cellar</Text>
          <Text style={styles.emptyBody}>Add wines to your cellar and your tasting notes will appear here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {wines.map((wine) => (
            <NoteCard key={wine.id} wine={wine} onSaveNote={handleSaveNote} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 40 },
  title: { fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg },
  wineName: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: 2 },
  wineDetail: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginBottom: spacing.sm },
  noteBlock: { borderLeftWidth: 2, borderLeftColor: colors.border, paddingLeft: spacing.sm },
  noteText: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 22, marginBottom: 4 },
  notePlaceholder: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: 4 },
  editLink: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  editBlock: {},
  noteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minHeight: 90, textAlignVertical: 'top', marginBottom: spacing.sm },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md },
  cancelText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md },
  saveBtnText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
