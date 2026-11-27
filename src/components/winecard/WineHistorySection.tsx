import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useWc } from './wcStyles';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// One row of "Your History With This Wine". A row either opens something
// (onPress), or opens a list of dated rows in a pop-up (sheet), or is a plain
// statement.
export interface HistoryRowItem { key: string; text: string; onPress?: () => void }
export interface HistoryLine {
  key: string;
  text: string;
  link?: string;
  onPress?: () => void;
  sheet?: { title: string; rows: HistoryRowItem[] };
}

// "Your History With This Wine", shared by the cellar wine card and the Wine
// Intel card. Always shown: with no history it says so.
export function WineHistorySection({ lines }: { lines: HistoryLine[] }) {
  const wc = useWc();
  const [open, setOpen] = useState<HistoryLine['sheet'] | null>(null);
  return (
    <View style={wc.History}>
      <Text style={wc.HistoryTitle}>Your History With This Wine</Text>
      {lines.length === 0 ? (
        <View style={[wc.HistoryRow, wc.RowLast]}>
          <Text style={wc.HistoryText}>You do not yet have any history with this wine</Text>
        </View>
      ) : lines.map((l, i) => {
        const press = l.sheet ? () => setOpen(l.sheet) : l.onPress;
        const link = l.link ?? (l.sheet ? 'View' : undefined);
        return (
          <TouchableOpacity key={l.key} style={[wc.HistoryRow, i === lines.length - 1 && wc.RowLast]} onPress={press} disabled={!press} activeOpacity={0.7}>
            <Text style={wc.HistoryText}>{l.text}</Text>
            {link ? <Text style={wc.Link}>{link} ›</Text> : null}
          </TouchableOpacity>
        );
      })}

      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.title}>{open?.title}</Text>
            <ScrollView style={styles.list}>
              {(open?.rows ?? []).map((r, i, all) => (
                <TouchableOpacity
                  key={r.key}
                  style={[wc.HistoryRow, i === all.length - 1 && wc.RowLast]}
                  onPress={r.onPress ? () => { setOpen(null); r.onPress!(); } : undefined}
                  disabled={!r.onPress}
                  activeOpacity={0.7}
                >
                  <Text style={wc.HistoryText}>{r.text}</Text>
                  {r.onPress ? <Text style={wc.Link}>View ›</Text> : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.close} onPress={() => setOpen(null)} activeOpacity={0.7}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%', maxWidth: 420, maxHeight: '75%' },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  list: { flexGrow: 0 },
  close: { alignItems: 'center', paddingTop: spacing.md },
  closeText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.gold },
});
