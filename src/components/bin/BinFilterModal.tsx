import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { wineHeaderLine } from '../../utils/wineHeader';
import { colors } from '../../constants/theme';
import { binStyles as styles } from './styles';
import type { BinEntry, useBinFilters } from '../../hooks/useBinFilters';

// Build or edit a saved bin filter: name it, tick the wines it holds. Each wine
// is listed once, with the first cell it's in.
export function BinFilterModal({ filters, entries }: { filters: ReturnType<typeof useBinFilters>; entries: BinEntry[] }) {
  const { editor, setEditor, saving, toggleEditorWine, saveFilter } = filters;
  const wines = entries.filter((e, i) => entries.findIndex((x) => x.wine.id === e.wine.id) === i);
  return (
    <Modal visible={editor !== null} transparent animationType="fade" onRequestClose={() => setEditor(null)}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{editor?.id ? 'Edit Filter' : 'New Filter'}</Text>
          <TextInput
            style={styles.input}
            value={editor?.name ?? ''}
            onChangeText={(name) => setEditor((e) => e && { ...e, name })}
            placeholder="Filter name (e.g. Drink First)"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.sheetLabel}>Wines in this filter</Text>
          <ScrollView style={{ maxHeight: 280 }} nestedScrollEnabled>
            {wines.length === 0 ? (
              <Text style={styles.emptyList}>No wines in this bin yet.</Text>
            ) : wines.map(({ wine, label }) => {
              const on = !!editor?.wineIds.has(wine.id);
              return (
                <TouchableOpacity key={wine.id} style={styles.pickRow} onPress={() => toggleEditorWine(wine.id)} activeOpacity={0.7}>
                  <View style={[styles.checkbox, on && styles.checkboxOn]}>{on ? <Text style={styles.checkboxTick}>✓</Text> : null}</View>
                  <View style={styles.wineRowTop}>
                    {label ? <Text style={styles.cubbyTag}>{label}</Text> : null}
                    <Text style={styles.wineName} numberOfLines={1}>{wineHeaderLine(wine.producer, wine.wine_name, wine.vintage)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={saveFilter} disabled={saving} activeOpacity={0.85}>
            {saving ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.saveBtnText}>{editor?.id ? 'Save Filter' : 'Create Filter'}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditor(null)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
