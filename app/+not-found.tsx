import { Redirect } from 'expo-router';

// Any address that isn't a Vinster screen (a stray deep link, a share that
// arrived as a link) goes Home rather than to Expo's blank "Unmatched Route" page.
export default function NotFound() {
  return <Redirect href="/(tabs)" />;
}
