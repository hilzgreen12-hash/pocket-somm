import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { TabFooter } from '../../src/components/TabFooter';
import * as ImagePicker from 'expo-image-picker';
import { useLabelStore } from '../../src/stores/labelStore';
import { useFoodPairingStore } from '../../src/stores/foodPairingStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { colors, spacing } from '../../src/constants/theme';

export default function ChefTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.13);
  const { setImage, setWineDetails, setError, setWineDetailsConfirmed, setPairings, pairings, wineDetailsConfirmed } = useLabelStore();
  const { generalResult, cellarResult, setDish, setMode, setCellarResult, setGeneralResult } = useFoodPairingStore();
  const [hasStoredPairing, setHasStoredPairing] = useState(false);
  const [hasLastLabelSearch, setHasLastLabelSearch] = useState(false);

  const hasLastPairing = !!(generalResult || cellarResult || hasStoredPairing);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('vinster_last_pairing').then((raw) => setHasStoredPairing(!!raw));
    AsyncStorage.getItem('vinster_chef_history').then((raw) => {
      try { setHasLastLabelSearch(!!(raw && JSON.parse(raw).length)); } catch { /* ignore */ }
    });
  }, []));

  async function handleViewLastPairing() {
    if (generalResult || cellarResult) {
      router.push('/chef/pairing-results');
      return;
    }
    try {
      const raw = await AsyncStorage.getItem('vinster_last_pairing');
      if (!raw) return;
      const saved = JSON.parse(raw);
      setDish(saved.dish);
      setMode(saved.mode);
      if (saved.mode === 'cellar') setCellarResult(saved.cellarResult);
      else setGeneralResult(saved.generalResult, saved.generalSummary);
      router.push('/chef/pairing-results');
    } catch { /* nothing to restore */ }
  }

  async function handleViewLastLabelSearch() {
    if (wineDetailsConfirmed && pairings.length) {
      router.push('/chef/results');
      return;
    }
    try {
      const raw = await AsyncStorage.getItem('vinster_chef_history');
      if (!raw) return;
      const history = JSON.parse(raw);
      if (!history.length) return;
      const last = history[0];
      setWineDetailsConfirmed(last.wine);
      setPairings(last.pairings);
      router.push('/chef/results');
    } catch { /* nothing to restore */ }
  }

  async function handleUpload() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
      router.push('/chef/confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
      router.push('/chef/confirm');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60, paddingTop }}>

      <Text style={styles.appName}>Chef</Text>

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>
          Whether you've got a recipe in mind and aren't sure what to drink, or you have chosen your bottle first, let us recommend your pairing.
        </Text>
        <Text style={styles.sectionDesc}>
          Set your food preferences in your profile to ensure Vinster's recommendations are tailored to your tastes and dietary concerns.
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>
          Tell Vinster what you're cooking and we'll help guide a new purchase or pull a bottle from your cellar.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/chef/find-pairing')}>
            <Text style={styles.buttonText}>Find a Wine Pairing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonHalf, !hasLastPairing && styles.buttonHalfDim]}
            onPress={handleViewLastPairing}
            disabled={!hasLastPairing}
          >
            <Text style={styles.buttonText}>View Last Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>
          Choose a bottle then scan or upload a photo of the label to receive deep AI generated, top chef inspired recipe suggestions.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/chef/camera')}>
            <Text style={styles.buttonText}>Scan Wine Label</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={handleUpload}>
            <Text style={styles.buttonText}>Upload Screenshot / Photo</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/chef/label-archive')}>
            <Text style={styles.buttonText}>View Archive</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonHalf, !hasLastLabelSearch && styles.buttonHalfDim]}
            onPress={handleViewLastLabelSearch}
            disabled={!hasLastLabelSearch}
          >
            <Text style={styles.buttonText}>View Last Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TabFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  appName: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.sm },
  profileNote: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, lineHeight: 24, marginBottom: spacing.xs },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  sectionDesc: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 24, marginBottom: spacing.xs },
  buttonRow: { flexDirection: 'row', gap: spacing.xs },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonHalf: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center' },
  buttonHalfDim: { opacity: 0.35 },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
});
