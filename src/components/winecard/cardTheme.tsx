import { createContext, useContext } from 'react';

// Archived wine cards wear their own colours (cream page, terracotta panels,
// espresso and gold accents) so they can't be mistaken for a Wine Intel or
// live cellar card. Set once by CellarWineCard; read by the card's sections.
const ArchivedCardContext = createContext(false);
export const ArchivedCardProvider = ArchivedCardContext.Provider;
export const useArchivedCard = () => useContext(ArchivedCardContext);

// Option D palette.
export const ARCHIVED = {
  page: '#E2D6C6',      // cream (colors.creamDim — #F4EBE0 read as white on a phone)
  panel: '#7F4F4C',     // terracotta panels (white text, gold figures on them)
  espresso: '#3E2120',  // tabs, badges, outline buttons
  ink: '#1A1A1A',       // text straight on the cream
  inkMuted: 'rgba(26,26,26,0.68)',
  accent: '#7F4F4C',    // terracotta words on the cream
  gold: '#E0B84A',
  deepGold: '#B5852A',  // gold that reads on cream
} as const;
