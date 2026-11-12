import { invokeResilient } from './invokeResilient';

// Find Online — search the web for a restaurant's wine list (find-wine-list
// edge function). Reading the chosen result happens inside the scan job
// (startScanJob with a sourceUrl), not here.

export interface OnlineListResult {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  isPdf: boolean;
}

export async function searchWineListsOnline(restaurant: string, city: string): Promise<OnlineListResult[]> {
  const data = await invokeResilient('find-wine-list', { action: 'search', restaurant, city }, { timeoutMs: 30000, retries: 1 }) as { results?: OnlineListResult[]; error?: string };
  if (data?.error && !data.results?.length) throw new Error(data.error);
  return Array.isArray(data?.results) ? data.results : [];
}
