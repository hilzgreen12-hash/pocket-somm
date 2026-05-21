import type { WineType } from '../types/preferences';

// Style profiles are now strictly per-type — every style declares the
// one (or more) wine types it lives under, and the StylePicker on List
// filters to only those styles when a type is selected. Multi-type
// styles have been retired because the user wanted each wine type to
// have its own precise list (less confusion than cross-applicable
// styles like the old "Natural" modifier).
//
// Order within each type matters — STYLE_PROFILES iteration drives the
// on-screen order of bubbles, so the lists are sequenced to match how
// the user listed them in the brief.

export interface StyleProfile {
  id: string;
  label: string;
  description: string;
  applicableTypes: WineType[];
}

export const STYLE_PROFILES: readonly StyleProfile[] = [
  // ---------- Red ----------
  { id: 'light-red',      label: 'Light Reds',      description: 'Light body with fresh acidity and fruit',          applicableTypes: ['red'] },
  { id: 'elegant-red',    label: 'Elegant Reds',    description: 'Light to medium body, earthy, complex',            applicableTypes: ['red'] },
  { id: 'bold-red',       label: 'Bold Reds',       description: 'Full-bodied, tannic, structured',                  applicableTypes: ['red'] },

  // ---------- White ----------
  { id: 'crisp-white',    label: 'Crisp Whites',    description: 'High acidity, mineral, refreshing',                applicableTypes: ['white'] },
  { id: 'aromatic-white', label: 'Aromatic Whites', description: 'Floral, off-dry, expressive',                      applicableTypes: ['white'] },
  { id: 'rich-white',     label: 'Rich Whites',     description: 'Full-bodied, oaked, textured',                     applicableTypes: ['white'] },

  // ---------- Rosé ----------
  // "Serious Rosé" covers wine-led, structured rosés — e.g. Sylvain
  // Pataille's Marsannay rosé, which the user explicitly called out as
  // the prototype for this slot.
  { id: 'pale-dry-rose',  label: 'Pale and Dry',    description: 'Provençal-style — pale, crisp, mineral',           applicableTypes: ['rose'] },
  { id: 'semi-sweet-rose', label: 'Semi Sweet',     description: 'Off-dry, fruit-forward, gently sweet',             applicableTypes: ['rose'] },
  { id: 'serious-rose',   label: 'Serious Rosé',    description: 'Wine-led, structured — e.g. Sylvain Pataille',     applicableTypes: ['rose'] },

  // ---------- Sparkling ----------
  // "Champagne Style" = traditional-method bubbles from anywhere other
  // than the Champagne region (English sparkling, Crémant, Cava,
  // Franciacorta, US traditional-method). "Tank Fermented" = Charmat /
  // Martinotti method — Prosecco, Lambrusco, Pet Nat-adjacent frizzante.
  { id: 'champagne',       label: 'Champagne',       description: 'Méthode champenoise from Champagne, France',      applicableTypes: ['sparkling'] },
  { id: 'champagne-style', label: 'Champagne Style', description: 'Traditional-method bubbles from elsewhere',       applicableTypes: ['sparkling'] },
  { id: 'tank-fermented',  label: 'Tank Fermented',  description: 'Charmat method — Prosecco, Lambrusco, frizzante', applicableTypes: ['sparkling'] },

  // ---------- Natural / Low Intervention ----------
  // "Cat's wee" is intentionally provocative — the user wanted the
  // funky end of the spectrum named the way enthusiasts actually talk
  // about it. "Somerset Cider-like" picks up the hazy, brisk, apple-y
  // end. "The Good Kind" is the clean-natural slot — minimal sulphites,
  // no faults, the kind that sceptics enjoy.
  { id: 'natural-cider', label: 'Somerset Cider-like', description: 'Cloudy, brisk, apple-edged — wild and hazy',    applicableTypes: ['natural'] },
  { id: 'natural-funky', label: "Cat's wee",           description: 'Pungent, polarising, vibrantly alive',           applicableTypes: ['natural'] },
  { id: 'natural-clean', label: 'The Good Kind',       description: 'Clean naturals — minimal sulphites, no faults',  applicableTypes: ['natural'] },

  // ---------- Sweet & Fortified ----------
  // Distinct ids from the Rosé "Semi Sweet" so the two never collide.
  { id: 'sweet-dry',  label: 'Dry',         description: 'Fortified but dry — Fino sherry, dry Madeira',          applicableTypes: ['sweet-fortified'] },
  { id: 'sweet-semi', label: 'Semi Sweet',  description: 'Off-dry — Amontillado, semi-dry Madeira',               applicableTypes: ['sweet-fortified'] },
  { id: 'sweet-rich', label: 'Sweet',       description: 'Dessert wines — Sauternes, PX sherry, Tokaji',           applicableTypes: ['sweet-fortified'] },
];

export type StyleProfileId = string;
