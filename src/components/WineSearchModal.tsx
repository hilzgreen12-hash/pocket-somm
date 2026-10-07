import { Modal, View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { WineSearchInput } from './WineSearchInput';
import type { WineSearchResult } from '../api/label';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Reusable "Search a Wine" popup — the single entry point that REPLACES free-text
// Manual Input across the app, so every wine the user adds resolves to a
// consistent catalog identity. WineSearchInput keeps its own quiet last-resort
// "Use '<typed>'" escape hatch for wines genuinely not in the catalog yet, so a
// rare bottle is never a dead end.
export function WineSearchModal({
  visible,
  onClose,
  onSelect,
  title = 'Search a Wine',
  subtitle = 'Start typing the producer and wine — pick the match so it’s recorded consistently.',
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (result: WineSearchResult) => void;
  title?: string;
  subtitle?: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <WineSearchInput onSelect={(r) => { onSelect(r); onClose(); }} />
          <TouchableOpacity style={styles.cancel} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-start', paddingTop: 110, paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center' },
  subtitle: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19, marginTop: spacing.xs, marginBottom: spacing.md },
  cancel: { alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
});
