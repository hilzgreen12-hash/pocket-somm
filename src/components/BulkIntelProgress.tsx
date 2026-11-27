import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SearchProgress } from './SearchProgress';
import { colors, spacing } from '../constants/theme';
import { fontsSpectral as fonts } from '../constants/fonts';

// Full-screen progress for a bulk critic-score + value run (useBulkIntel), with
// the way out. Back is blocked so a stray dismiss can't strand the run.
export function BulkIntelProgress({ progress, title, body, onStop }: {
  progress: { done: number; total: number } | null;
  title: string;
  body?: string;
  onStop: () => void;
}) {
  return (
    <Modal visible={progress != null} animationType="fade" onRequestClose={() => {}}>
      <View style={styles.wrap}>
        <SearchProgress
          title={title}
          subtitle="Vinster needs a moment"
          body={body ?? 'Vinster is fetching critic scores and market values for your wines.'}
          durationMs={Math.max(15000, (progress?.total ?? 0) * 2500)}
        />
        <TouchableOpacity style={styles.exitBtn} onPress={onStop} activeOpacity={0.85}>
          <Text style={styles.exitText}>Save Progress and Exit Update</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  exitBtn: { position: 'absolute', bottom: 64, alignSelf: 'center', borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, backgroundColor: colors.background },
  exitText: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold },
});
