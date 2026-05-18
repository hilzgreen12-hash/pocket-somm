// Style profiles cover the nuanced shape of a wine within reds, whites and
// natural-style — wine *type* (Sparkling, Rosé, Orange, Sweet & Fortified)
// is selected separately on the "What are you drinking?" picker, so we no
// longer duplicate those categories here.
export const STYLE_PROFILES = [
  { id: 'bold-red', label: 'Bold Reds', description: 'Full-bodied, tannic, structured' },
  { id: 'elegant-red', label: 'Elegant Reds', description: 'Light to medium body, earthy, complex' },
  { id: 'light-red', label: 'Light Reds', description: 'Light body with fresh acidity and fruit' },
  { id: 'crisp-white', label: 'Crisp Whites', description: 'High acidity, mineral, refreshing' },
  { id: 'rich-white', label: 'Rich Whites', description: 'Full-bodied, oaked, textured' },
  { id: 'aromatic-white', label: 'Aromatic Whites', description: 'Floral, off-dry, expressive' },
  { id: 'natural', label: 'Natural / Low-intervention', description: 'Minimal sulphites, funky, alive' },
] as const;

export type StyleProfileId = (typeof STYLE_PROFILES)[number]['id'];
