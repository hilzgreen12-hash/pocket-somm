import { create } from 'zustand';

// Holds the latest "sommelier consult" answer (Discover voice intent 2) so the
// /discover/consult screen can render it — mirrors moodPicksStore. Populate
// before navigating; the screen reads from here (nothing via params).
interface ConsultState {
  question: string;
  advice: string;
  set: (question: string, advice: string) => void;
  clear: () => void;
}

export const useConsultStore = create<ConsultState>((set) => ({
  question: '',
  advice: '',
  set: (question, advice) => set({ question, advice }),
  clear: () => set({ question: '', advice: '' }),
}));
