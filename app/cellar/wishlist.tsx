import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { router } from 'expo-router';
import { useWishList } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { colors, spacing } from '../../src/constants/theme';
import type { CellarWine } from '../../src/types/wine';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function WishListCard({ wine, onMoveToCellar, onDelete, onUpdateNote, onUpdateLocation }: {
  wine: CellarWine;
  onMoveToCellar: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onUpdateLocation: (id: string, location: string) => void;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(wine.tasting_notes ?? '');
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationText, setLocationText] = useState(wine.user_notes ?? '');

  function handleSaveNote() {
    onUpdateNote(wine.id, noteText);
    setEditingNote(false);
  }

  function handleSaveLocation() {
    onUpdateLocation(wine.id, locationText);
    setEditingLocation(false);
  }

  const dateLabel = wine.date_received
    ? formatDate(wine.date_received)
    : formatDate(wine.created_at);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.wineName}>
            {wineHeaderLine(wine.producer, wine.wine_name, wine.vintage)}
          </Text>
          {wine.region || wine.grape_variety ? (
            <Text style={styles.wineDetail}>
              {[wine.region, wine.grape_variety].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
      </View>

      {editingLocation ? (
        <View style={styles.noteEditBlock}>
          <TextInput
            style={[styles.noteInput, { minHeight: 44 }]}
            value={locationText}
            onChangeText={setLocationText}
            placeholder="Restaurant, city…"
            placeholderTextColor={colors.textMuted}
            autoFocus
            onSubmitEditing={handleSaveLocation}
            returnKeyType="done"
          />
          <View style={styles.noteEditActions}>
            <TouchableOpacity onPress={() => { setEditingLocation(false); setLocationText(wine.user_notes ?? ''); }}>
              <Text style={styles.noteCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.noteSaveBtn} onPress={handleSaveLocation}>
              <Text style={styles.noteSaveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.metaRow} onPress={() => setEditingLocation(true)}>
          <Text style={styles.metaLabel}>Discovered at</Text>
          <Text style={[styles.metaValue, !wine.user_notes && { color: colors.textMuted, fontStyle: 'italic' }]}>
            {wine.user_notes || 'Tap to add location'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Date</Text>
        <Text style={styles.metaValue}>{dateLabel}</Text>
      </View>

      {editingNote ? (
        <View style={styles.noteEditBlock}>
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
          <View style={styles.noteEditActions}>
            <TouchableOpacity onPress={() => { setEditingNote(false); setNoteText(wine.tasting_notes ?? ''); }}>
              <Text style={styles.noteCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.noteSaveBtn} onPress={handleSaveNote}>
              <Text style={styles.noteSaveBtnText}>Save Note</Text>
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
          <TouchableOpacity onPress={() => setEditingNote(true)}>
            <Text style={styles.editNoteLink}>{wine.tasting_notes ? 'Edit Note' : 'Add Note'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.moveBtn} onPress={() => onMoveToCellar(wine.id)}>
          <Text style={styles.moveBtnText}>Add to Cellar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(wine.id)}>
          <Text style={styles.deleteText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type ConfirmAction =
  | { kind: 'move'; id: string }
  | { kind: 'delete'; id: string }
  | null;

export default function WishListScreen() {
  const { session } = useAuth();
  const { wines, isLoading, updateWine, moveTocellar, deleteWine } = useWishList();
  const [confirm, setConfirm] = useState<ConfirmAction>(null);

  function handleMoveToCellar(id: string) {
    setConfirm({ kind: 'move', id });
  }

  function handleDelete(id: string) {
    setConfirm({ kind: 'delete', id });
  }

  function handleConfirm() {
    if (!confirm) return;
    if (confirm.kind === 'move') moveTocellar.mutate(confirm.id);
    if (confirm.kind === 'delete') deleteWine.mutate(confirm.id);
    setConfirm(null);
  }

  function handleUpdateNote(id: string, note: string) {
    updateWine.mutate({ id, updates: { tasting_notes: note.trim() || null } });
  }

  function handleUpdateLocation(id: string, location: string) {
    updateWine.mutate({ id, updates: { user_notes: location.trim() || null } });
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
        <Text style={styles.title}>Wish List</Text>
        <TouchableOpacity onPress={() => router.push('/cellar/add-to-wishlist')}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your wish list"
          body="Save wines you'd like to seek out — sign in to keep your wish list."
        />
      ) : wines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your wish list is empty</Text>
          <Text style={styles.emptyBody}>When you review a wine recommendation, tap "Add to Cellar Wish List" to save wines you'd like to seek out.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {wines.map((wine) => (
            <WishListCard
              key={wine.id}
              wine={wine}
              onMoveToCellar={handleMoveToCellar}
              onDelete={handleDelete}
              onUpdateNote={handleUpdateNote}
              onUpdateLocation={handleUpdateLocation}
            />
          ))}
        </ScrollView>
      )}

      <Modal visible={!!confirm} transparent animationType="fade" onRequestClose={() => setConfirm(null)}>
        <TouchableOpacity style={styles.confirmOverlay} activeOpacity={1} onPress={() => setConfirm(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.confirmSheet} onPress={() => {}}>
            <Text style={styles.confirmTitle}>
              {confirm?.kind === 'move' ? 'Move to cellar?' : 'Remove from wish list?'}
            </Text>
            <Text style={styles.confirmBody}>
              {confirm?.kind === 'move'
                ? 'Add this wine to your cellar.'
                : 'This will remove the wine from your wish list. You can add it again any time.'}
            </Text>
            <TouchableOpacity
              style={[styles.confirmButton, confirm?.kind === 'delete' && styles.confirmButtonDanger]}
              onPress={handleConfirm}
            >
              <Text style={[styles.confirmButtonText, confirm?.kind === 'delete' && styles.confirmButtonTextDanger]}>
                {confirm?.kind === 'move' ? 'Add to Cellar' : 'Remove'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirm(null)} style={styles.confirmCancel}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 60 },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  addText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, width: 60, textAlign: 'right' },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  wineName: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: 2 },
  wineDetail: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginBottom: 4 },
  metaLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 80 },
  metaValue: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, flex: 1 },
  noteBlock: { marginTop: spacing.sm, borderLeftWidth: 2, borderLeftColor: colors.border, paddingLeft: spacing.sm },
  noteText: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 22, marginBottom: 4 },
  notePlaceholder: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: 4 },
  editNoteLink: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  noteEditBlock: { marginTop: spacing.sm },
  noteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minHeight: 90, textAlignVertical: 'top', marginBottom: spacing.sm },
  noteEditActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md },
  noteCancelText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  noteSaveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md },
  noteSaveBtnText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  moveBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md },
  moveBtnText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13 },
  deleteText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.error },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  confirmSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  confirmTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  confirmBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  confirmButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  confirmButtonDanger: { borderColor: colors.error },
  confirmButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  confirmButtonTextDanger: { color: colors.error },
  confirmCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  confirmCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
});
