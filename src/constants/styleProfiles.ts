export const STYLE_PROFILES = [
  { id: 'bold-red', label: 'Bold Reds', description: 'Full-bodied, tannic, structured' },
  { id: 'elegant-red', label: 'Elegant Reds', description: 'Light to medium body, earthy, complex' },
  { id: 'crisp-white', label: 'Crisp Whites', description: 'High acidity, mineral, refreshing' },
  { id: 'rich-white', label: 'Rich Whites', description: 'Full-bodied, oaked, textured' },
  { id: 'aromatic-white', label: 'Aromatic Whites', description: 'Floral, off-dry, expressive' },
  { id: 'natural', label: 'Natural / Low-intervention', description: 'Minimal sulphites, funky, alive' },
  { id: 'champagne', label: 'Champagne & Sparkling', description: 'Traditional method, classic styles' },
  { id: 'pet-nat', label: 'Pét-Nat & Sparkling', description: 'Pétillant naturel, fun, casual' },
  { id: 'rose', label: 'Rosé', description: 'Dry to off-dry, Provence style or beyond' },
  { id: 'orange', label: 'Orange Wine', description: 'Skin-contact whites, texture, tannin' },
  { id: 'sweet', label: 'Sweet & Dessert', description: 'Botrytis, late harvest, fortified dessert' },
  { id: 'sherry', label: 'Sherry & Fortified', description: 'Fino, manzanilla, amontillado, oloroso' },
] as const;

export type StyleProfileId = (typeof STYLE_PROFILES)[number]['id'];
