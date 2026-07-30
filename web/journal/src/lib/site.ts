// Single source of truth for brand + install links on the web Journal.
// The store URLs mirror src/constants/share.ts in the mobile app.
export const SITE = {
  name: 'The Vinster Journal',
  shortName: 'Vinster Journal',
  tagline: 'Wine notes, stories and finds from Vinster.',
  url: 'https://journal.vinsterapp.com',
  appName: 'Vinster',
  appTagline: 'Your AI sommelier — wine, food, restaurants.',
  appStoreUrl: 'https://apps.apple.com/app/id6763607127',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.vinster.app',
  appleAppId: '6763607127',
} as const;
