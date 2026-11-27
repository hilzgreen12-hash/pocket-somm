import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import { GATHER_LOCKED, GATHER_LOCKED_OPACITY } from '../constants/features';

// The one Share pop-up used by every Share button in the app: what's being
// shared ("Your Restaurant Review"), its name and its date · place, then
// Share to Community (where the item can go to the Community) and Share
// externally as gold buttons, and a white underlined Cancel.
export function ShareSheet({ visible, heading, name, detail, community, onShareExternally, onClose }: {
  visible: boolean;
  heading: string;
  name?: string | null;
  // e.g. "26 Nov 2026 · London"
  detail?: string | null;
  // Present only when the item can be shared to the Community.
  community?: { label: string; onPress: () => void } | null;
  onShareExternally: () => void;
  onClose: () => void;
}) {
  // Each choice closes the pop-up first, then acts a moment later — a share
  // sheet or screen opened while this pop-up is still up can hide behind it.
  const after = (fn: () => void) => () => { onClose(); setTimeout(fn, 300); };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
          <Text style={styles.heading}>{heading}</Text>
          {name ? <Text style={styles.name} numberOfLines={3}>{name}</Text> : null}
          {detail ? <Text style={styles.detail} numberOfLines={2}>{detail}</Text> : null}
          {community ? (
            <TouchableOpacity style={[styles.btn, styles.btnFirst, GATHER_LOCKED && { opacity: GATHER_LOCKED_OPACITY }]} onPress={after(community.onPress)} disabled={GATHER_LOCKED} activeOpacity={0.85}>
              <Text style={styles.btnText}>{community.label}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={[styles.btn, !community && styles.btnFirst]} onPress={after(onShareExternally)} activeOpacity={0.85}>
            <Text style={styles.btnText}>Share externally</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancel} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 420 },
  heading: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center' },
  name: { fontFamily: fonts.headingSemibold, fontSize: 17, color: colors.gold, textAlign: 'center', marginTop: spacing.sm },
  detail: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  btn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.sm, alignItems: 'center', width: '100%', marginTop: spacing.md },
  btnFirst: { marginTop: spacing.lg },
  btnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  cancel: { alignSelf: 'center', marginTop: spacing.md },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: '#FFFFFF', textDecorationLine: 'underline' },
});
