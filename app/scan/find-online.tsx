import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Keyboard, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as IntentLauncher from 'expo-intent-launcher';
import { File, Paths } from 'expo-file-system';
import { useScanStore } from '../../src/stores/scanStore';
import { searchWineListsOnline, type OnlineListResult } from '../../src/api/findWineList';
import { isNetworkError } from '../../src/api/invokeResilient';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

const VIEW_DOWNLOAD_TIMEOUT_MS = 20000;

// Whether a downloaded file is really a PDF (it begins "%PDF").
function startsWithPdfMarker(file: File): boolean {
  try {
    const handle = file.open();
    try { return String.fromCharCode(...handle.readBytes(4)) === '%PDF'; }
    finally { handle.close(); }
  } catch { return false; }
}

// Find Online: search the web for a restaurant's wine list, let the user pick
// the right result, then read it through the same pipeline as a photographed
// list (extracting → results). Reached from Home's "Read A Wine List" pop-up;
// picking a list opens the Scan a List form to set preferences before reading.
export default function FindOnlineScreen() {
  const setOnlineSource = useScanStore((s) => s.setOnlineSource);

  // Show the list before choosing it. Android's in-app browser downloads a PDF
  // rather than showing it, so there the PDF is downloaded and opened in the
  // phone's own PDF viewer. (Google's online viewer, used before, now asks the
  // user to pick a Google account first.) Anything else opens in the in-app
  // browser; if all else fails, the system browser.
  const [opening, setOpening] = useState<string | null>(null);
  async function viewList(r: OnlineListResult) {
    if (opening) return;
    const openInBrowser = () => WebBrowser.openBrowserAsync(r.url).catch(() => Linking.openURL(r.url).catch(() => {}));
    if (Platform.OS !== 'android' || !r.isPdf) { void openInBrowser(); return; }
    setOpening(r.url);
    try {
      // A fresh name each time: a download abandoned after the timeout below
      // may still be writing to the last one.
      const dest = new File(Paths.cache, `wine-list-preview-${Date.now()}.pdf`);
      // A slow site mustn't leave "Opening…" up for ever: after 20 s the
      // browser takes over (the download can't be cancelled, so it's ignored).
      let timer: ReturnType<typeof setTimeout> | undefined;
      const file = await Promise.race([
        File.downloadFileAsync(r.url, dest),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('download timed out')), VIEW_DOWNLOAD_TIMEOUT_MS); }),
      ]).finally(() => clearTimeout(timer));
      // A ".pdf" link can answer with a web page (a cookie wall, a login, a
      // "file moved" notice) — the PDF viewer can't show that, the browser can.
      if (!startsWithPdfMarker(dest)) throw new Error('not a PDF');
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: file.contentUri,
        type: 'application/pdf',
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION — lets the viewer read our cached file
      });
    } catch {
      // No PDF viewer on the phone, or the download failed, was slow or wasn't
      // a PDF — the browser copes.
      void openInBrowser();
    } finally {
      setOpening(null);
    }
  }
  const [restaurant, setRestaurant] = useState('');
  const [city, setCity] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<OnlineListResult[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isLink = /^https?:\/\//i.test(restaurant.trim());

  async function handleSearch() {
    const name = restaurant.trim();
    if (!name || searching) return;
    Keyboard.dismiss();
    // A pasted link skips the search and reads that page directly.
    if (isLink) { read(name, ''); return; }
    setSearching(true);
    setMessage(null);
    setResults(null);
    try {
      const found = await searchWineListsOnline(name, city.trim());
      setResults(found);
      if (!found.length) {
        setMessage("Vinster couldn't find a wine list online for that restaurant. Try adding the town, or use Scan a List or Upload a List instead.");
      }
    } catch (err) {
      setMessage(isNetworkError(err)
        ? "Vinster couldn't reach the internet. Find better reception and try again."
        : err instanceof Error ? err.message : 'Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  // The chosen list is held in the scan store; the user then sets their
  // preferences on the Wine List Preferences form, which reads it with "Read Wine List".
  function read(url: string, titleFallback: string, domain?: string) {
    const name = isLink ? '' : restaurant.trim();
    let site = domain;
    if (!site) { try { site = new URL(url).hostname.replace(/^www\./, ''); } catch { site = undefined; } }
    // The town box is hidden while it holds a link, so a town typed earlier
    // mustn't ride along with the link.
    setOnlineSource({ url, restaurant: name, city: isLink ? null : city.trim() || null, title: titleFallback || site, domain: site });
    router.push('/scan/wine-list?online=1');
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text accessibilityLabel="Back" style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Find Online</Text>
          <Text style={styles.subtitle}>Vinster searches the web for the restaurant's wine list and reads it for its top three picks.</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Restaurant</Text>
          <TextInput
            style={styles.input}
            value={restaurant}
            onChangeText={setRestaurant}
            placeholder="Restaurant name, or paste a link"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {!isLink && (
            <>
              <Text style={styles.label}>Town or City</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="e.g. London"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.button, (!restaurant.trim() || searching) && { opacity: 0.5 }]}
            onPress={handleSearch}
            disabled={!restaurant.trim() || searching}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{isLink ? 'Read This List' : 'Search'}</Text>
          </TouchableOpacity>

          {searching && <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xl }} />}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          {results && results.length > 0 && (
            <>
              <Text style={styles.resultsHint}>Choose the restaurant's wine list</Text>
              {results.map((r) => (
                <View key={r.url} style={styles.result}>
                  <Text style={styles.resultTitle} numberOfLines={2}>{r.title}</Text>
                  <Text style={styles.resultDomain} numberOfLines={1}>{r.isPdf ? `${r.domain} · PDF` : r.domain}</Text>
                  {r.snippet ? <Text style={styles.resultSnippet} numberOfLines={2}>{r.snippet}</Text> : null}
                  {/* View List opens the page in the in-app browser to check it;
                      Use List picks it and moves on to the preferences. */}
                  <View style={styles.resultBtns}>
                    <TouchableOpacity style={styles.resultBtn} onPress={() => { void viewList(r); }} disabled={!!opening} activeOpacity={0.8}>
                      <Text style={styles.resultBtnText}>{opening === r.url ? 'Opening…' : 'View List'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.resultBtn, styles.resultBtnGold]} onPress={() => read(r.url, r.title, r.domain)} activeOpacity={0.8}>
                      <Text style={[styles.resultBtnText, { color: colors.gold }]}>Use List</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <Text style={styles.note}>Online lists can be out of date, so check the vintages and prices at the table.</Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  backArrow: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md, alignItems: 'center' },
  title: { fontFamily: fonts.headingSemibold, fontSize: 42, color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
  body: { paddingHorizontal: spacing.xl },
  label: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: spacing.md, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  buttonText: { fontFamily: fonts.headingSemibold, color: '#FFFFFF', fontSize: 16 },
  message: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl, lineHeight: 21 },
  resultsHint: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', marginTop: spacing.xl, marginBottom: spacing.sm },
  result: { borderWidth: 1, borderColor: colors.borderWhite, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.surface },
  resultTitle: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  resultDomain: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 3 },
  resultBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  resultBtn: { flex: 1, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  resultBtnGold: { borderColor: colors.gold },
  resultBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: '#FFFFFF' },
  resultSnippet: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  note: { fontFamily: fonts.headingItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});
