import { useSyncExternalStore } from 'react';
import { getCellarContext, subscribeCellarContext } from '../api/cellarContext';

// The live cellar context (which cellar is selected, the user's role in it).
// Re-renders on switch / join / leave / role change.
export function useCellarContext() {
  return useSyncExternalStore(subscribeCellarContext, getCellarContext, getCellarContext);
}
