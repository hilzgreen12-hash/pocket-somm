import { Redirect } from 'expo-router';

// The Home Wine Storage page is retired — its content now lives inline on the
// Cellar tab as the "Your Wines At Home" section (HomeStorageSection). Any
// lingering navigation to /cellar/racks lands back on the Cellar tab.
export default function RacksRedirect() {
  return <Redirect href="/(tabs)/cellar" />;
}
