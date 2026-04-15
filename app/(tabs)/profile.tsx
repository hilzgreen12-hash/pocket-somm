import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator, LayoutAnimation, Platform, UIManager } from 'react-native';
import * as Linking from 'expo-linking';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ChipPicker } from '../../src/components/preferences/ChipPicker';
import { StylePicker } from '../../src/components/preferences/StylePicker';
import { BudgetSlider } from '../../src/components/preferences/BudgetSlider';
import { WineTypePicker, WineType } from '../../src/components/preferences/WineTypePicker';
import { Ionicons } from '@expo/vector-icons';
import { WINE_REGIONS } from '../../src/constants/wineRegions';
import { GRAPE_VARIETIES } from '../../src/constants/grapeVarieties';
import { supabase } from '../../src/api/supabase';
import { colors, spacing, typography } from '../../src/constants/theme';

const WINE_TYPE_LABELS: Record<string, string> = {
  red: 'Red', white: 'White', rose: 'Rosé', sparkling: 'Sparkling',
};

export default function ProfileTab() {
  const { session } = useAuth();
  const { preferences, updatePreferences, isSaving } = usePreferences();
  const [wineStyleOpen, setWineStyleOpen] = useState(false);
  const [regionalOpen, setRegionalOpen] = useState(false);
  const [customRegion, setCustomRegion] = useState('');
  const [customGrape, setCustomGrape] = useState('');
  const [customDislikedRegion, setCustomDislikedRegion] = useState('');
  const [customDislikedGrape, setCustomDislikedGrape] = useState('');
  const [varietalOpen, setVarietalOpen] = useState(false);
  const [regionalDislikesOpen, setRegionalDislikesOpen] = useState(false);
  const [varietalDislikesOpen, setVarietalDislikesOpen] = useState(false);
  const [characteristicsOpen, setCharacteristicsOpen] = useState(false);
  const [emailChangeOpen, setEmailChangeOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  function toggleWineStyle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setWineStyleOpen((v) => !v);
  }

  function toggleRegional() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRegionalOpen((v) => !v);
  }

  function toggleVarietal() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVarietalOpen((v) => !v);
  }

  function toggleRegionalDislikes() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRegionalDislikesOpen((v) => !v);
  }

  function toggleVarietalDislikes() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVarietalDislikesOpen((v) => !v);
  }

  function toggleCharacteristics() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCharacteristicsOpen((v) => !v);
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

  function toggleEmailChange() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEmailChangeOpen((v) => !v);
    setNewEmail('');
  }

  async function handleEmailChange() {
    if (!newEmail.trim()) return;
    setEmailSaving(true);
    const redirectTo = Linking.createURL('auth/callback');
    const { error } = await supabase.auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: redirectTo },
    );
    setEmailSaving(false);
    if (error) {
      Alert.alert('Unable to update email', error.message);
    } else {
      toggleEmailChange();
      Alert.alert(
        'Check both inboxes',
        'Confirmation links have been sent to your current and new email address. Tap both links to complete the change.',
      );
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  }

  if (!session) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestTitle}>Your Profile</Text>
        <Text style={styles.guestBody}>Sign in to save your taste preferences and scan history.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Your Account</Text>
          <TouchableOpacity onPress={toggleEmailChange}>
            <Text style={styles.emailLabel}>Change your subscription email account</Text>
          </TouchableOpacity>
          <Text style={styles.email}>{session.user.email}</Text>
          {emailChangeOpen && (
            <View style={styles.emailChangeWrap}>
              <TextInput
                style={styles.emailInput}
                placeholder="New email address"
                placeholderTextColor="rgba(255,255,255,0.30)"
                value={newEmail}
                onChangeText={setNewEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoFocus
              />
              <View style={styles.emailChangeRow}>
                <TouchableOpacity onPress={toggleEmailChange}>
                  <Text style={styles.emailCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.emailConfirmButton} onPress={handleEmailChange} disabled={emailSaving}>
                  {emailSaving
                    ? <ActivityIndicator color={colors.background} size="small" />
                    : <Text style={styles.emailConfirmText}>Confirm</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileIntro}>
        <Text style={styles.profileHeading}>Your Profile</Text>
        <Text style={styles.profileBody}>
          These are your default settings that Pocket Somm uses to guide its recommendations for you. Create, view, and manage your default settings below.
        </Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity onPress={toggleWineStyle} activeOpacity={0.7} style={styles.questionRow}>
          <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
          <Text style={styles.question}>Colour Preference <Text style={styles.questionMuted}>(select up to 4)</Text></Text>
        </TouchableOpacity>
        {!wineStyleOpen && (
          <Text style={styles.selectionSummary}>
            {(preferences?.wineTypes ?? []).length > 0
              ? (preferences?.wineTypes ?? []).map((t) => WINE_TYPE_LABELS[t]).join(', ')
              : 'No preference'}
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
        <TouchableOpacity onPress={toggleRegional} activeOpacity={0.7} style={styles.questionRow}>
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
            <View style={styles.customRegionRow}>
              <TextInput
                style={styles.customRegionInput}
                placeholder="Other — type a region"
                placeholderTextColor="rgba(255,255,255,0.30)"
                value={customRegion}
                onChangeText={setCustomRegion}
                onSubmitEditing={handleAddCustomRegion}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.customRegionAdd, (!customRegion.trim() || (preferences?.favouriteRegions ?? []).length >= 5) && { opacity: 0.35 }]}
                onPress={handleAddCustomRegion}
                disabled={!customRegion.trim() || (preferences?.favouriteRegions ?? []).length >= 5}
              >
                <Text style={styles.customRegionAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity onPress={toggleVarietal} activeOpacity={0.7} style={styles.questionRow}>
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
            <View style={styles.customRegionRow}>
              <TextInput
                style={styles.customRegionInput}
                placeholder="Other — type a variety"
                placeholderTextColor="rgba(255,255,255,0.30)"
                value={customGrape}
                onChangeText={setCustomGrape}
                onSubmitEditing={handleAddCustomGrape}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.customRegionAdd, (!customGrape.trim() || (preferences?.favouriteGrapes ?? []).length >= 5) && { opacity: 0.35 }]}
                onPress={handleAddCustomGrape}
                disabled={!customGrape.trim() || (preferences?.favouriteGrapes ?? []).length >= 5}
              >
                <Text style={styles.customRegionAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity onPress={toggleCharacteristics} activeOpacity={0.7} style={styles.questionRow}>
          <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
          <Text style={styles.question}>Style Preference <Text style={styles.questionMuted}>(select up to 5)</Text></Text>
        </TouchableOpacity>
        {!characteristicsOpen && (
          <Text style={styles.selectionSummary}>
            {(preferences?.styleProfiles ?? []).length > 0
              ? (preferences?.styleProfiles ?? []).length === 1
                ? (preferences?.styleProfiles ?? [])[0].replace(/-/g, ' ')
                : `${(preferences?.styleProfiles ?? []).length} selected`
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
        <TouchableOpacity onPress={toggleRegionalDislikes} activeOpacity={0.7} style={styles.questionRow}>
          <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
          <Text style={styles.question}>Regional Dislikes <Text style={styles.questionMuted}>(select up to 5)</Text></Text>
        </TouchableOpacity>
        {!regionalDislikesOpen && (
          <Text style={styles.selectionSummary}>
            {(preferences?.dislikedRegions ?? []).length > 0
              ? (preferences?.dislikedRegions ?? []).join(', ')
              : 'I like them all'}
          </Text>
        )}
        {regionalDislikesOpen && (
          <View style={styles.pickerWrap}>
            <ChipPicker
              options={WINE_REGIONS}
              selected={preferences?.dislikedRegions ?? []}
              onChange={(v) => updatePreferences({ dislikedRegions: v })}
              activeColor={colors.error}
              listMode
              max={5}
              allOptionLabel="I like them all"
            />
            <View style={styles.customRegionRow}>
              <TextInput
                style={styles.customRegionInput}
                placeholder="Other — type a region"
                placeholderTextColor="rgba(255,255,255,0.30)"
                value={customDislikedRegion}
                onChangeText={setCustomDislikedRegion}
                onSubmitEditing={handleAddCustomDislikedRegion}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.customRegionAdd, !customDislikedRegion.trim() && { opacity: 0.35 }]}
                onPress={handleAddCustomDislikedRegion}
                disabled={!customDislikedRegion.trim()}
              >
                <Text style={styles.customRegionAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity onPress={toggleVarietalDislikes} activeOpacity={0.7} style={styles.questionRow}>
          <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
          <Text style={styles.question}>Varietal Dislikes <Text style={styles.questionMuted}>(select up to 5)</Text></Text>
        </TouchableOpacity>
        {!varietalDislikesOpen && (
          <Text style={styles.selectionSummary}>
            {(preferences?.dislikedGrapes ?? []).length > 0
              ? (preferences?.dislikedGrapes ?? []).join(', ')
              : 'I like them all'}
          </Text>
        )}
        {varietalDislikesOpen && (
          <View style={styles.pickerWrap}>
            <ChipPicker
              options={GRAPE_VARIETIES}
              selected={preferences?.dislikedGrapes ?? []}
              onChange={(v) => updatePreferences({ dislikedGrapes: v })}
              activeColor={colors.error}
              listMode
              max={5}
              allOptionLabel="I like them all"
            />
            <View style={styles.customRegionRow}>
              <TextInput
                style={styles.customRegionInput}
                placeholder="Other — type a variety"
                placeholderTextColor="rgba(255,255,255,0.30)"
                value={customDislikedGrape}
                onChangeText={setCustomDislikedGrape}
                onSubmitEditing={handleAddCustomDislikedGrape}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.customRegionAdd, !customDislikedGrape.trim() && { opacity: 0.35 }]}
                onPress={handleAddCustomDislikedGrape}
                disabled={!customDislikedGrape.trim()}
              >
                <Text style={styles.customRegionAddText}>Add</Text>
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

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() =>
          Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: handleSignOut },
          ])
        }
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 96,
    paddingHorizontal: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emailLabel: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 13,
    color: colors.burgundy,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textDecorationLine: 'underline',
  },
  emailChangeWrap: {
    marginTop: spacing.sm,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  emailChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  emailCancelText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 14,
    color: colors.textMuted,
  },
  emailConfirmButton: {
    backgroundColor: colors.burgundy,
    borderRadius: 8,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minWidth: 80,
    alignItems: 'center',
  },
  emailConfirmText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 14,
    color: colors.background,
  },
  email: {
    ...typography.body,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.text,
  },
  profileIntro: {
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  profileHeading: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  profileBody: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.md,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  question: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,
    color: colors.text,
  },
  questionMuted: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,
    color: colors.textMuted,
  },
  selectionSummary: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.40)',
    marginBottom: spacing.sm,
  },
  pickerWrap: {
    marginTop: spacing.sm,
  },
  customRegionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  customRegionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.text,
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 15,
  },
  customRegionAdd: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  customRegionAddText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionBody: {
    ...typography.body,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  signOutButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.error,
    fontSize: 16,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  guestTitle: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  guestBody: {
    ...typography.body,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.burgundy,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
  },
});
