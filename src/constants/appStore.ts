import { Platform } from 'react-native';

// Vinster's live store identity (confirmed via the App Store lookup).
export const APP_STORE_ID = '6763607127';
export const ANDROID_PACKAGE = 'com.vinster.app';
export const IOS_BUNDLE_ID = 'com.vinster.app';

export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

// The store page for the current platform (for the "Update" button).
export function storeUrl(): string {
  return Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
}

// Apple's public lookup returns the version currently live on the App Store.
// We use it as the "latest available" version. Because each release bumps one
// app.json version and ships to BOTH stores together, this doubles as the
// latest-available signal for Android too (which has no equivalent public API).
export const ITUNES_LOOKUP_URL = `https://itunes.apple.com/lookup?bundleId=${IOS_BUNDLE_ID}`;
