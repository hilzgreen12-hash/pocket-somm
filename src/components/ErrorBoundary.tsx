import { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

interface State {
  error: Error | null;
}

interface Props {
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>
          Vinster hit an unexpected error. You can try again — your saved data is safe.
        </Text>
        <Text style={styles.detail} numberOfLines={3}>{this.state.error.message}</Text>
        <TouchableOpacity style={styles.button} onPress={this.reset}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.background },
  title: { fontSize: 24, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.md, textAlign: 'center' },
  body: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  detail: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textSubtle, textAlign: 'center', marginBottom: spacing.xl },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
});
