import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { router } from 'expo-router';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ChipPicker } from '../../src/components/preferences/ChipPicker';
import { StylePicker } from '../../src/components/preferences/StylePicker';
import { BudgetSlider } from '../../src/components/preferences/BudgetSlider';
import { WineTypePicker, WineType } from '../../src/components/preferences/WineTypePicker';
import { Ionicons } from '@expo/vector-icons';
import { WINE_REGIONS } from '../../src/constants/wineRegions';
import { GRAPE_VARIETIES } from '../../src/constants/grapeVarieties';
import { STYLE_PROFILES } from '../../src/constants/styleProfiles';
import { colors, spacing, typography } from '../../src/constants/theme';

const WINE_TYPE_LABELS: Record<string, string> = {
  red: 'Red', white: 'White', rose: 'Rosé', sparkling: 'Sparkling',
};

export default function WineProfileScreen() {
  const { preferences, updatePreferences } = usePreferences();
  const [wineStyleOpen, setWineStyleOpen] = useState(false);
  const [regionalOpen, setRegionalOpen] = useState(false);
  const [varietalOpen, setVarietalOpen] = useState(false);
  const [regionalDislikesOpen, setRegionalDislikesOpen] = useState(false);
  const [varietalDislikesOpen, setVarietalDislikesOpen] = useState(false);
  const [characteristicsOpen, setCharacteristicsOpen] = useState(false);
  const [customRegion, setCustomRegion] = useState('');
  const [customGrape, setCustomGrape] = useState('');
  const [customDislikedRegion, setCustomDislikedRegion] = useState('');
  const [customDislikedGrape, setCustomDislikedGrape] = useState('');
  const [saved, setSaved] = useState(false);

  function toggle(setter: React.Dispatch<React.SetStateAction<boolean>>) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter((v) => !v);
  }

  function handleAddCustomRegion() {
    const trimmed = customRegion.trim();
    const current = preferences?.favouriteRegions ?? [];
    if (!trimmed || current.includes(trimmed) || current.length >= 5) return;
    updatePreferences({ favouriteRegions: [...current, trimmed] });
    setCustomRegion('');
  }

  function handleAddCustomGrape() {
    const trimmed = customGrape.trim();
    const current = preferences?.favouriteGrapes ?? [];
    if (!trimmed || current.includes(trimmed) || current.length >= 5) return;
    updatePreferences({ favouriteGrapes: [...current, trimmed] });
    setCustomGrape('');
  }

  function handleAddCustomDislikedRegion() {
    const trimmed = customDislikedRegion.trim();
    const current = preferences?.dislikedRegions ?? [];
    if (!trimmed || current.includes(trimmed)) return;
    updatePreferences({ dislikedRegions: [...current, trimmed] });
    setCustomDislikedRegion('');
  }

  function handleAddCustomDislikedGrape() {
    const trimmed = customDislikedGrape.trim();
    const current = preferences?.dislikedGrapes ?? [];
    if (!trimmed || current.includes(trimmed)) return;
    updatePreferences({ dislikedGrapes: [...current, trimmed] });
    setCustomDislikedGrape('');
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>

        <View style={styles.profileIntro}>
          <Text style={styles.profileHeading}>Wine Profile</Text>
          <Text style={styles.profileBody}>Set your wine preferences so Vinster can make the best recommendations for you.</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setWineStyleOpen)} activeOpacity={0.7} style={styles.questionRow}>
            <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>Colour Preference <Text style={styles.questionMuted}>(select up to 4)</Text></Text>
          </TouchableOpacity>
          {!wineStyleOpen && (
            <Text style={styles.selectionSummary}>
              {(preferences?.wineTypes ?? []).length > 0
                ? (preferences?.wineTypes ?? []).map((t) => WINE_TYPE_LABELS[t]).join(', ')
                : 'I like them all'}
            </Text>
          )}
          {wineStyleOpen && (
            <View style={styles.pickerWrap}>
              <WineTypePicker
                selected={(preferences?.wineTypes ?? []) as WineType[]}
                onChange={(v) => updatePreferences({ wineTypes: v })}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setRegionalOpen)} activeOpacity={0.7} style={styles.questionRow}>
            <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>Regional Preference <Text style={styles.questionMuted}>(select up to 5)</Text></Text>
          </TouchableOpacity>
          {!regionalOpen && (
            <Text style={styles.selectionSummary}>
              {(preferences?.favouriteRegions ?? []).length > 0
                ? (preferences?.favouriteRegions ?? []).join(', ')
                : 'I like them all'}
            </Text>
          )}
          {regionalOpen && (
            <View style={styles.pickerWrap}>
              <ChipPicker
                options={WINE_REGIONS}
                selected={preferences?.favouriteRegions ?? []}
                onChange={(v) => updatePreferences({ favouriteRegions: v })}
                max={5}
                listMode
                allOptionLabel="I like them all"
              />
              <View style={styles.customRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Other — type a region"
                  placeholderTextColor="rgba(255,255,255,0.30)"
                  value={customRegion}
                  onChangeText={setCustomRegion}
                  onSubmitEditing={handleAddCustomRegion}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.customAdd, (!customRegion.trim() || (preferences?.favouriteRegions ?? []).length >= 5) && { opacity: 0.35 }]}
                  onPress={handleAddCustomRegion}
                  disabled={!customRegion.trim() || (preferences?.favouriteRegions ?? []).length >= 5}
                >
                  <Text style={styles.customAddText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setVarietalOpen)} activeOpacity={0.7} style={styles.questionRow}>
            <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>Varietal Preferences <Text style={styles.questionMuted}>(select up to 5)</Text></Text>
          </TouchableOpacity>
          {!varietalOpen && (
            <Text style={styles.selectionSummary}>
              {(preferences?.favouriteGrapes ?? []).length > 0
                ? (preferences?.favouriteGrapes ?? []).join(', ')
                : 'I like them all'}
            </Text>
          )}
          {varietalOpen && (
            <View style={styles.pickerWrap}>
              <ChipPicker
                options={GRAPE_VARIETIES}
                selected={preferences?.favouriteGrapes ?? []}
                onChange={(v) => updatePreferences({ favouriteGrapes: v })}
                max={5}
                listMode
                allOptionLabel="I like them all"
              />
              <View style={styles.customRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Other — type a variety"
                  placeholderTextColor="rgba(255,255,255,0.30)"
                  value={customGrape}
                  onChangeText={setCustomGrape}
                  onSubmitEditing={handleAddCustomGrape}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.customAdd, (!customGrape.trim() || (preferences?.favouriteGrapes ?? []).length >= 5) && { opacity: 0.35 }]}
                  onPress={handleAddCustomGrape}
                  disabled={!customGrape.trim() || (preferences?.favouriteGrapes ?? []).length >= 5}
                >
                  <Text style={styles.customAddText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setCharacteristicsOpen)} activeOpacity={0.7} style={styles.questionRow}>
            <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>Style Preference <Text style={styles.questionMuted}>(select up to 5)</Text></Text>
          </TouchableOpacity>
          {!characteristicsOpen && (
            <Text style={styles.selectionSummary}>
              {(preferences?.styleProfiles ?? []).length > 0
                ? (preferences?.styleProfiles ?? [])
                    .map((id) => STYLE_PROFILES.find((s) => s.id === id)?.label ?? id)
                    .join(', ')
                : 'I like them all'}
            </Text>
          )}
          {characteristicsOpen && (
            <View style={styles.pickerWrap}>
              <StylePicker
                selected={preferences?.styleProfiles ?? []}
                onChange={(profiles) => updatePreferences({ styleProfiles: profiles })}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setRegionalDislikesOpen)} activeOpacity={0.7} style={styles.questionRow}>
            <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>Regional Dislikes <Text style={styles.questionMuted}>(select up to 5)</Text></Text>
          </TouchableOpacity>
          {!regionalDislikesOpen && (
            <Text style={styles.selectionSummary}>
              {(preferences?.dislikedRegions ?? []).length > 0
                ? (preferences?.dislikedRegions ?? []).join(', ')
                : 'None'}
            </Text>
          )}
          {regionalDislikesOpen && (
            <View style={styles.pickerWrap}>
              <ChipPicker
                options={WINE_REGIONS}
                selected={preferences?.dislikedRegions ?? []}
                onChange={(v) => updatePreferences({ dislikedRegions: v })}
                listMode
                max={5}
                allOptionLabel="None"
              />
              <View style={styles.customRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Other — type a region"
                  placeholderTextColor="rgba(255,255,255,0.30)"
                  value={customDislikedRegion}
                  onChangeText={setCustomDislikedRegion}
                  onSubmitEditing={handleAddCustomDislikedRegion}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.customAdd, !customDislikedRegion.trim() && { opacity: 0.35 }]}
                  onPress={handleAddCustomDislikedRegion}
                  disabled={!customDislikedRegion.trim()}
                >
                  <Text style={styles.customAddText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setVarietalDislikesOpen)} activeOpacity={0.7} style={styles.questionRow}>
            <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>Varietal Dislikes <Text style={styles.questionMuted}>(select up to 5)</Text></Text>
          </TouchableOpacity>
          {!varietalDislikesOpen && (
            <Text style={styles.selectionSummary}>
              {(preferences?.dislikedGrapes ?? []).length > 0
                ? (preferences?.dislikedGrapes ?? []).join(', ')
                : 'None'}
            </Text>
          )}
          {varietalDislikesOpen && (
            <View style={styles.pickerWrap}>
              <ChipPicker
                options={GRAPE_VARIETIES}
                selected={preferences?.dislikedGrapes ?? []}
                onChange={(v) => updatePreferences({ dislikedGrapes: v })}
                listMode
                max={5}
                allOptionLabel="None"
              />
              <View style={styles.customRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Other — type a variety"
                  placeholderTextColor="rgba(255,255,255,0.30)"
                  value={customDislikedGrape}
                  onChangeText={setCustomDislikedGrape}
                  onSubmitEditing={handleAddCustomDislikedGrape}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.customAdd, !customDislikedGrape.trim() && { opacity: 0.35 }]}
                  onPress={handleAddCustomDislikedGrape}
                  disabled={!customDislikedGrape.trim()}
                >
                  <Text style={styles.customAddText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.questionRow}>
            <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>Default Budget</Text>
          </View>
          <BudgetSlider
            value={preferences?.defaultBudget ?? 100}
            onChange={(budget) => updatePreferences({ defaultBudget: budget })}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Wine Profile</Text>
        </TouchableOpacity>
        {saved && <Text style={styles.savedMessage}>Your profile has been saved</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  backRow: { paddingTop: 70, paddingBottom: spacing.md },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  profileIntro: { marginBottom: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  profileHeading: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 32, color: colors.text, letterSpacing: 1.5, marginBottom: spacing.xs, textAlign: 'center' },
  profileBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.textMuted, lineHeight: 22, textAlign: 'center' },
  section: { marginBottom: spacing.sm },
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 2 },
  question: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.text },
  questionMuted: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.textMuted },
  selectionSummary: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 12, color: 'rgba(255,255,255,0.40)', marginBottom: spacing.xs },
  pickerWrap: { marginTop: spacing.sm },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  customInput: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, color: colors.text, fontFamily: 'CormorantGaramond_400Regular', fontSize: 15 },
  customAdd: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  customAddText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: colors.text },
  saveButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  saveButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  savedMessage: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.gold, textAlign: 'center', marginBottom: spacing.lg },
});
