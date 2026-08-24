import { Redirect } from 'expo-router';

// The Label Library is retired — scanned labels are no longer kept in a library.
// Wines are filed into Your Wine Reviews from the intel card instead, so any
// lingering navigation to /scan/archive lands there.
export default function LabelLibraryRedirect() {
  return <Redirect href="/wines/chosen" />;
}
