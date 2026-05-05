import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { colors, spacing } from '../../src/constants/theme';
import type { CellarWine } from '../../src/types/wine';

const STATUS_COLORS: Record<string, string> = {
  too_young: colors.gold,
  approaching: colors.gold,
  peak: colors.gold,
  declining: colors.gold,
  unknown: colors.gold,
};

const STATUS_LABELS: Record<string, string> = {
  too_young: 'Too Young',
  approaching: 'Approaching',
  peak: 'Peak',
  declining: 'Declining',
  unknown: '—',
};

function WineRow({ wine }: { wine: CellarWine }) {
  return (
    <TouchableOpacity style={styles.row} onPress={() => router.push(`/cellar/${wine.id}`)}>
      <View style={styles.rowMain}>
        <Text style={styles.rowName} numberOfLines={1}>{wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''}</Text>
        <Text style={styles.rowDetail} numberOfLines={1}>{wine.producer} · {wine.region}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowStatus, { color: STATUS_COLORS[wine.drinking_window_status] ?? colors.textMuted }]}>
          {STATUS_LABELS[wine.drinking_window_status] ?? '—'}
        </Text>
        <Text style={styles.rowQty}>{wine.quantity} btl</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CellarListScreen() {
  const { wines, isLoading, shares, share, removeShare } = useCellar();
  const [sharingOpen, setSharingOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (!shareEmail.trim()) return;
    setSharing(true);
    try {
      await share.mutateAsync(shareEmail.trim());
      setShareEmail('');
      Alert.alert('Shared', `Your cellar has been shared with ${shareEmail.trim()}.`);
    } catch {
      Alert.alert('Error', 'Could not share cellar. Check the email address and try again.');
    } finally {
      setSharing(false);
    }
  }

  const totalBottles = wines.reduce((sum, w) => sum + w.quantity, 0);
  const peakNow = wines.filter((w) => w.drinking_window_status === 'peak').length;

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Cellar</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/cellar/add')}>
            <Text style={styles.headerLink}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/cellar/racks')}>
            <Text style={styles.headerLink}>Racks</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSharingOpen(true)}>
            <Text style={styles.shareLink}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {wines.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalBottles}</Text>
            <Text style={styles.statLabel}>Bottles</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{peakNow}</Text>
            <Text style={styles.statLabel}>Peak Now</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{wines.length}</Text>
            <Text style={styles.statLabel}>Wines</Text>
          </View>
        </View>
      )}

      {wines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your cellar is empty</Text>
          <Text style={styles.emptyBody}>Go back and scan a wine label to start tracking your collection.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.back()}>
            <Text style={styles.emptyButtonText}>Add a Wine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wines}
          keyExtractor={(w) => w.id}
          renderItem={({ item }) => <WineRow wine={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <Modal visible={sharingOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Cellar</Text>
            <Text style={styles.modalBody}>Enter the email address of the person you want to share your cellar with. They will be able to view (but not edit) your collection.</Text>

            <TextInput
              style={styles.modalInput}
              value={shareEmail}
              onChangeText={setShareEmail}
              placeholder="Email address"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={[styles.button, sharing && styles.buttonDisabled]} onPress={handleShare} disabled={sharing}>
              <Text style={styles.buttonText}>{sharing ? 'Sharing…' : 'Share'}</Text>
            </TouchableOpacity>

            {shares.length > 0 && (
              <View style={styles.shareList}>
                <Text style={styles.shareListTitle}>Shared with</Text>
                {shares.map((s) => (
                  <View key={s.shared_with_email} style={styles.shareItem}>
                    <Text style={styles.shareEmail}>{s.shared_with_email}</Text>
                    <TouchableOpacity onPress={() => removeShare.mutate(s.shared_with_email)}>
                      <Text style={styles.removeShare}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => setSharingOpen(false)}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {},
  backText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerLink: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF' },
  shareLink: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF' },
  statsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  stat: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statValue: { fontSize: 24, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  statLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  rowMain: { flex: 1, marginRight: spacing.md },
  rowName: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  rowDetail: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  rowVintage: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textSubtle, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowStatus: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold' },
  rowQty: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.xl },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  emptyButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center', width: '100%' },
  emptyButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48 },
  modalTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.xs },
  modalBody: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, lineHeight: 20, marginBottom: spacing.lg },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.background },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  shareList: { marginTop: spacing.lg },
  shareListTitle: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  shareItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  shareEmail: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.text },
  removeShare: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.error },
  cancelButton: { alignItems: 'center', marginTop: spacing.lg },
  cancelText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14 },
});
