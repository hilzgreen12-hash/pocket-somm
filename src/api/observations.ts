import { invokeResilient } from './invokeResilient';

// Client for the `observations` edge function — Vinster's Observations: what
// Vinster has learned about the user from their reviews, cellar and choices,
// plus what they've told it. Account-only.

export interface Observation {
  id: string;
  group: string;
  text: string;
  // The data behind it, e.g. "from 14 reviews".
  evidence: string;
}

export interface ToldStatement {
  id: string;
  text: string;
  created_at: string;
}

export interface ObservationsState {
  observations: Observation[];
  told: ToldStatement[];
  generatedAt: string | null;
  // null until the first refresh; false when Vinster found too little to go on.
  enoughData: boolean | null;
  // Last refreshed more than a week ago (or never).
  stale: boolean;
  // The user's data has changed since the last refresh.
  hasNewData: boolean;
}

export interface TellOutcome {
  // Saved as something the user has told Vinster.
  stored: boolean;
  // Observations it removed as a result (their text).
  removed: string[];
}

export function getObservations(): Promise<ObservationsState> {
  return invokeResilient('observations', { action: 'get' }) as Promise<ObservationsState>;
}

// One Claude call; the server rate-limits it.
export function refreshObservations(): Promise<ObservationsState> {
  return invokeResilient('observations', { action: 'refresh' }) as Promise<ObservationsState>;
}

export function tellVinster(text: string): Promise<ObservationsState & { outcome: TellOutcome }> {
  return invokeResilient('observations', { action: 'tell', text }) as Promise<ObservationsState & { outcome: TellOutcome }>;
}

export function removeObservation(id: string): Promise<ObservationsState> {
  return invokeResilient('observations', { action: 'remove', id }) as Promise<ObservationsState>;
}

export function removeToldStatement(toldId: string): Promise<ObservationsState> {
  return invokeResilient('observations', { action: 'remove', toldId }) as Promise<ObservationsState>;
}
