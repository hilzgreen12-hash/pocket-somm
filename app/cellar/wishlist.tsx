import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useWishList } from '../../src/hooks/useCellar';
import { colors, spacing } from '../../src/constants/theme';
import type { CellarWine } from '../../src/types/wine';

function WishListRow({ wine, onMoveToCellar, onDelete }: {
  wine: CellarWine;
  onMoveToCellar: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.rowName} numberOfLines={1}>{wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''}</Text>
        <Text style={styles.rowDetail} numberOfLines={1}>{wine.producer} · {wine.region}</Text>
      </View>
      <View style={styles.rowActions}>
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

export default function WishListScreen() {
  const { wines, isLoading, moveTocellar, deleteWine } = useWishList();

  function handleMoveToCellar(id: string) {
    Alert.alert('Move to Cellar', 'Add this wine to your cellar?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Add to Cellar', onPress: () => moveTocellar.mutate(id) },
    ]);
  }

  function handleDelete(id: string) {
    Alert.alert('Remove', 'Remove this wine from your wish list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteWine.mutate(id) },
    ]);
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Wish List</Text>
        <TouchableOpacity onPress={() => router.push('/cellar/add-to-wishlist')} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add A Wine</Text>
        </TouchableOpacity>
      </View>

      {wines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your wish list is empty</Text>
          <Text style={styles.emptyBody}>Scan a wine label and choose "Add to Wish List" to start saving wines you'd like to buy.</Text>
        </View>
      ) : (
        <FlatList
          data={wines}
          keyExtractor={(w) => w.id}
          renderItem={({ item }) => (
            <WishListRow
              wine={item}
              onMoveToCellar={handleMoveToCellar}
              onDelete={handleDelete}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {},
  backText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  addButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: 6, paddingHorizontal: spacing.sm },
  addButtonText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  rowMain: { flex: 1, marginRight: spacing.md },
  rowName: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  rowDetail: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  rowVintage: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  rowActions: { alignItems: 'flex-end', gap: 6 },
  moveBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, paddingVertical: 4, paddingHorizontal: spacing.sm },
  moveBtnText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 12 },
  deleteText: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.error },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.xl },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
