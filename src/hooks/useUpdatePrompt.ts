import { useEffect, useState } from 'react';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { compareVersions } from '../utils/semver';
import { ITUNES_LOOKUP_URL } from '../constants/appStore';

// Remembers the version a user tapped "Later" on, so the soft prompt doesn't
// nag on every launch — it reappears only once a NEWER version ships.
const DISMISS_KEY = 'update-prompt-dismissed-version';

// Soft update check: on launch, compare the installed version to the latest one
// live on the store. Returns whether to show the prompt. Fails silently on any
// error (offline, lookup unavailable) so it can NEVER block or slow the app.
export function useUpdatePrompt(): { show: boolean; latest: string | null; dismiss: () => void } {
  const [latest, setLatest] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const installed = Application.nativeApplicationVersion;
        if (!installed) return;
        const res = await fetch(ITUNES_LOOKUP_URL);
        const data = await res.json();
        const latestVer: string | undefined = data?.results?.[0]?.version;
        if (!latestVer || cancelled) return;
        setLatest(latestVer);
        // Only prompt when the store genuinely has a newer version...
        if (compareVersions(installed, latestVer) >= 0) return;
        // ...and the user hasn't already said "Later" to THIS version.
        const dismissed = await AsyncStorage.getItem(DISMISS_KEY);
        if (dismissed === latestVer || cancelled) return;
        setShow(true);
      } catch { /* offline / lookup down — never block the app */ }
    })();
    return () => { cancelled = true; };
  }, []);

  function dismiss() {
    setShow(false);
    if (latest) { AsyncStorage.setItem(DISMISS_KEY, latest).catch(() => {}); }
  }

  return { show, latest, dismiss };
}
