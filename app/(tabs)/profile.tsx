import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ChipPicker } from '../../src/components/preferences/ChipPicker';
import { StylePicker } from '../../src/components/preferences/StylePicker';
import { BudgetSlider } from '../../src/components/preferences/BudgetSlider';
import { WineTypePicker, WineType } from '../../src/components/preferences/WineTypePicker';
import { WINE_REGIONS } from '../../src/constants/wineRegions';
import { GRAPE_VARIETIES } from '../../src/constants/grapeVarieties';
import { supabase } from '../../src/api/supabase';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function ProfileTab() {
  const { session } = useAuth();
  const { preferences, updatePreferences, isSaving } = usePreferences();

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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Profile</Text>
          <Text style={styles.email}>{session.user.email}</Text>
        </View>
        {isSaving && <ActivityIndicator color={colors.burgundy} />}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Wine Type</Text>
        <Text style={styles.sectionBody}>Pre-fills your wine type when you start a scan</Text>
        <WineTypePicker
          selected={(preferences?.wineType ?? 'any') as WineType}
          onChange={(v) => updatePreferences({ wineType: v })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favourite Regions</Text>
        <Text style={styles.sectionBody}>Wines from these regions get prioritised</Text>
        <ChipPicker
          options={WINE_REGIONS}
          selected={preferences?.favouriteRegions ?? []}
          onChange={(v) => updatePreferences({ favouriteRegions: v })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favourite Grapes</Text>
        <Text style={styles.sectionBody}>Wines from these varieties get prioritised</Text>
        <ChipPicker
          options={GRAPE_VARIETIES}
          selected={preferences?.favouriteGrapes ?? []}
          onChange={(v) => updatePreferences({ favouriteGrapes: v })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Regions to Avoid</Text>
        <Text style={styles.sectionBody}>These are filtered out before recommendations</Text>
        <ChipPicker
          options={WINE_REGIONS}
          selected={preferences?.dislikedRegions ?? []}
          onChange={(v) => updatePreferences({ dislikedRegions: v })}
          activeColor={colors.error}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grapes to Avoid</Text>
        <Text style={styles.sectionBody}>These are filtered out before recommendations</Text>
        <ChipPicker
          options={GRAPE_VARIETIES}
          selected={preferences?.dislikedGrapes ?? []}
          onChange={(v) => updatePreferences({ dislikedGrapes: v })}
          activeColor={colors.error}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Style Preferences</Text>
        <Text style={styles.sectionBody}>These pre-fill each scan</Text>
        <StylePicker
          selected={preferences?.styleProfiles ?? []}
          onChange={(profiles) => updatePreferences({ styleProfiles: profiles })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Budget</Text>
        <Text style={styles.sectionBody}>Wines above this price are filtered out</Text>
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
    paddingTop: 60,
    paddingHorizontal: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
  },
  section: {
    marginBottom: spacing.xl,
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
