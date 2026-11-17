// A share into Vinster can arrive as a launch link that isn't a screen:
//  • iOS: the share extension opens vinster://dataUrl=vinsterShareKey
//  • Android: some apps (Adobe Acrobat, for one) put the shared file's own
//    address — content://… or file://… — in the launch intent as well.
// Send those to the tabs, where Home picks up the share (expo-share-intent) and
// opens the wine list or label. Vinster's own links pass straight through.

// Vinster's own scheme, plus Expo's development schemes.
const APP_SCHEMES = new Set(['vinster', 'exp', 'exps', 'exp+vinster']);

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    if (path.includes('dataUrl=')) return '/(tabs)';
    const scheme = /^([a-z][a-z0-9+.-]*):\/\//i.exec(path)?.[1]?.toLowerCase();
    if (scheme && !APP_SCHEMES.has(scheme)) return '/(tabs)';
  } catch { /* fall through */ }
  return path;
}
