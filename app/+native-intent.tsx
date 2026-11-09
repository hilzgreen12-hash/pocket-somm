// A share into Vinster arrives as a deep link (vinster://dataUrl=vinsterShareKey).
// It isn't a screen — send it to the tabs, where Home picks up the shared image
// (expo-share-intent) and opens its Wine Intel. Every other link passes through.
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    if (path.includes('dataUrl=')) return '/(tabs)';
  } catch { /* fall through */ }
  return path;
}
