import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Archive a Night — entry placeholder. The camera + Claude-vision lineup
// matching (photo → identify bottles → confirm → move cellar→archive) and the
// saved Lineups gallery are the next build (edge function + migration 051).
export default function ArchiveNightScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Archive a Night</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.body}>
        <Text style={styles.overlay}>Photograph a bottle lineup & Vinster will remove each from your cellar into your archive.</Text>
        <Text style={styles.note}>The camera + lineup matching is being built next.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.lg },
  overlay: { fontSize: 18, fontFamily: fonts.headingItalic, color: colors.text, textAlign: 'center', lineHeight: 26 },
  note: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
