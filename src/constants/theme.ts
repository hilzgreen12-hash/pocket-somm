// Warm terracotta, a notch deeper than the previous #945e5c so the
// crisp white text and vivid gold pop more.
const BACKGROUND = '#7F4F4C';

export const colors = {
  background: BACKGROUND,
  surface: '#572F2B',
  surfaceElevated: '#4A2522',

  burgundy: '#E8A0A0',   // soft rose — readable against terracotta
  burgundyDim: '#B06060',

  // Brighter, more saturated gold so destructive/CTA buttons stand out
  // clearly against the warm background.
  gold: '#E0B84A',
  goldDim: '#9A7F40',

  // Brand cream — used as the "boxing" backdrop for the live rack gallery
  // and the frame around each label thumbnail, so the colourful labels pop
  // against a calm, light surface (distinct from the terracotta app bg).
  cream: '#F4EBE0',
  creamDim: '#E2D6C6',

  // White text system
  text: '#FFFFFF',
  textMuted: '#FFFFFF',
  textSubtle: 'rgba(255,255,255,0.55)',

  // Borders — white with low opacity
  border: 'rgba(255,255,255,0.10)',
  borderLight: 'rgba(255,255,255,0.18)',
  // Thin but clearly-visible white outline — framing the brown carousel cards.
  borderWhite: 'rgba(255,255,255,0.55)',
  // Faded-gold content separators on the tab pages.
  divider: 'rgba(224,184,74,0.30)',

  success: '#E0B84A', // gold — no green text anywhere in the app
  warning: '#D4923A',
  error: '#D44040',
};

// ---- Share-card palette --------------------------------------------------
// Shareable/exported artwork (all *ShareCard components + the PDF/HTML builders)
// uses ONE consistent template, distinct from the in-app terracotta theme:
// a CREAM background with TERRACOTTA branding (wordmark, rules, borders, labels)
// and BLACK body text. Change these in one place to restyle every share surface.
export const share = {
  bg: '#F4EBE0',                    // cream background
  brand: '#7F4F4C',                 // terracotta — wordmark, borders, subheads, accents
  brandDim: 'rgba(127,79,76,0.55)', // terracotta rule / faded label
  rule: 'rgba(127,79,76,0.45)',     // divider lines
  ink: '#1A1A1A',                   // near-black body text
  inkMuted: 'rgba(26,26,26,0.60)',  // secondary/caption text
  // Gold reserved for HIGHLIGHT FIGURES only (critic score, estimated value,
  // ratings) so key numbers pop. Deeper than the app gold (#E0B84A), which is
  // tuned for the dark app bg and would wash out on cream.
  gold: '#B5852A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
  },
};
