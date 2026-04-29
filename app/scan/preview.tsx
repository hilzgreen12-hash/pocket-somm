import { useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function PreviewScreen() {
  const { imageUri, reset } = useScanStore();

  useEffect(() => {
    if (!imageUri) router.replace('/(tabs)/scan');
  }, [imageUri]);

  if (!imageUri) return null;

  function handleRetake() {
    reset();
    router.replace('/(tabs)/scan');
  }

  function handleConfirm() {
    router.push('/scan/extracting');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Does this look clear?</Text>
      <Text style={styles.subheader}>Make sure the wine list text is readable</Text>

      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
          <Text style={styles.retakeText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Use This Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    paddingTop: 60,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subheader: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  retakeButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  retakeText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    flex: 2,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
