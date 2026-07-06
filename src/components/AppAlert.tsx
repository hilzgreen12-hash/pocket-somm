import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

export type AppAlertButtonStyle = 'default' | 'cancel' | 'destructive' | 'gold';

export type AppAlertButton = {
  text: string;
  onPress?: () => void;
  style?: AppAlertButtonStyle;
};

export type AppAlertOptions = {
  title: string;
  body?: string;
  buttons?: AppAlertButton[];
  dismissable?: boolean;
  // Show a close "✕" in the top-right of the sheet (in addition to any buttons).
  showCloseX?: boolean;
};

let setAlertImpl: ((opts: AppAlertOptions | null) => void) | null = null;

export function showAlert(options: AppAlertOptions) {
  if (setAlertImpl) setAlertImpl(options);
  else if (__DEV__) console.warn('AppAlertHost not mounted; alert dropped:', options.title);
}

function isCancelStyle(s?: AppAlertButtonStyle) {
  return s === 'cancel';
}

export function AppAlertHost() {
  const [opts, setOpts] = useState<AppAlertOptions | null>(null);

  useEffect(() => {
    setAlertImpl = setOpts;
    return () => { setAlertImpl = null; };
  }, []);

  function close() {
    setOpts(null);
  }

  function handlePress(btn: AppAlertButton) {
    close();
    btn.onPress?.();
  }

  const visible = opts !== null;
  const dismissable = opts?.dismissable !== false;
  const rawButtons = opts?.buttons ?? [{ text: 'OK' }];
  // Render primary actions first, cancel as text link at the bottom
  const primary = rawButtons.filter((b) => !isCancelStyle(b.style));
  const cancels = rawButtons.filter((b) => isCancelStyle(b.style));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismissable ? close : undefined}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={dismissable ? close : undefined}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
          {opts?.showCloseX ? (
            <TouchableOpacity style={styles.closeX} onPress={close} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
          ) : null}
          {opts?.title ? <Text style={styles.title}>{opts.title}</Text> : null}
          {opts?.body ? <Text style={styles.body}>{opts.body}</Text> : null}

          <View style={styles.primaryStack}>
            {primary.map((btn, i) => {
              const isDestructive = btn.style === 'destructive';
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.primaryBtn, isDestructive && styles.primaryBtnDestructive]}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.primaryBtnText, isDestructive && styles.primaryBtnTextDestructive]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {cancels.map((btn, i) => (
            <TouchableOpacity key={i} onPress={() => handlePress(btn)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>{btn.text}</Text>
            </TouchableOpacity>
          ))}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
  },
  closeX: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 10, padding: 4 },
  closeXText: { fontFamily: fonts.bodyRegular, fontSize: 18, color: colors.textMuted },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  body: {
    // Modal body — Inter
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  primaryStack: { gap: spacing.sm },
  primaryBtn: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  // "Destructive" buttons (Delete confirms across the app) used to render
  // in red — that read poorly against the warm terracotta background. The
  // user-facing rule now is gold for every delete action.
  primaryBtnDestructive: {
    borderColor: colors.gold,
  },
  primaryBtnText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
    color: colors.gold,
  },
  primaryBtnTextDestructive: {
    color: colors.gold,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: 4,
  },
  cancelBtnText: {
    // Cancel link in modal — Inter
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
  },
});
