import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useArchive } from '../../src/hooks/useCellar';
import { colors, spacing } from '../../src/constants/theme';
import type { CellarWine } from '../../src/types/wine';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ArchiveCard({ wine, onSaveNote }: {
  wine: CellarWine;
  onSaveNote: (id: string, note: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState(wine.user_notes ?? '');

  function handleSave() {
    onSaveNote(wine.id, noteText);
    setEditing(false);
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.wineName}>
            {wine.vintage ? `${wine.vintage} ` : ''}{wine.wine_name}
          </Text>
          <Text style={styles.wineDetail}>
            {[wine.producer, wine.region, wine.grape_variety].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <View style={styles.qtyBadge}>
          <Text style={styles.qtyText}>{wine.quantity} btl</Text>
        </View>
      </View>

      <View style={styles.stampRow}>
        <Text style={styles.stampLabel}>Removed</Text>
        <Text style={styles.stampDate}>{formatDate(wine.archived_at!)}</Text>
      </View>

      {editing ? (
        <View style={styles.editBlock}>
          <TextInput
            style={styles.noteInput}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Add a note — occasion, reason for removal…"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            autoFocus
          />
          <View style={styles.editActions}>
            <TouchableOpacity onPress={() => { setEditing(false); setNoteText(wine.user_notes ?? ''); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.noteBlock}>
          {wine.user_notes ? (
            <Text style={styles.noteText}>{wine.user_notes}</Text>
          ) : null}
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={styles.editLink}>{wine.user_notes ? 'Edit Note' : 'Add Note'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function CellarArchiveScreen() {
  const { wines, isLoading, updateNote } = useArchive();

  function handleSaveNote(id: string, note: string) {
    updateNote.mutate({ id, note: note.trim() });
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
        <Text style={styles.title}>Cellar Archive</Text>
        <View style={{ width: 40 }} />
      </View>

      {wines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No archived wines</Text>
          <Text style={styles.emptyBody}>Wines you remove from your cellar will appear here with the date they were removed.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {wines.map((wine) => (
            <ArchiveCard key={wine.id} wine={wine} onSaveNote={handleSaveNote} />
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
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  wineName: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: 2 },
  wineDetail: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  qtyBadge: { marginLeft: spacing.sm, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 6, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  qtyText: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  stampRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  stampLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  stampDate: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  noteBlock: { paddingTop: spacing.xs },
  noteText: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 22, marginBottom: 6 },
  editLink: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  editBlock: { paddingTop: spacing.xs },
  noteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minHeight: 76, textAlignVertical: 'top', marginBottom: spacing.sm },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md },
  cancelText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md },
  saveBtnText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
