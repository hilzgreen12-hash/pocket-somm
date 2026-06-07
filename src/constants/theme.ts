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
  // Faded-gold content separators on the tab pages.
  divider: 'rgba(224,184,74,0.30)',

  success: '#6DBF8A',
  warning: '#D4923A',
  error: '#D44040',
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
