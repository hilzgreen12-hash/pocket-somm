// Semantic font mapping for the app.
//
// Vinster uses two type families:
//
//   • Cormorant Garamond (heading*) — editorial display serif. Used for
//     page titles, section headings, pop-up titles, tab-screen blurbs,
//     and buttons. Carries the brand voice.
//
//   • Spectral (body*) — readable serif for everything else: body copy,
//     form labels and inputs, card content, pop-up bodies, hints,
//     captions, meta lines. Adopted app-wide on 2026-06-01, replacing the
//     all-Cormorant body which was hard to read at small sizes.
//
// Style declarations should reference these names rather than the
// raw font-family strings so the next font swap is a one-line
// change here, not a hunt across 80+ files.
//
// USAGE
//   import { fonts } from '../constants/fonts';
//   const styles = StyleSheet.create({
//     heading: { fontFamily: fonts.headingBold, fontSize: 22 },
//     body:    { fontFamily: fonts.bodyRegular, fontSize: 15 },
//   });

// 2026-06-01: Spectral is now the app-wide body face (see body tokens
// below); Cormorant stays on headings, titles, pop-up titles, blurbs and
// buttons. Cormorant, Inter and Spectral are all loaded in _layout.tsx,
// so the body face can be re-pointed here in one place if we revisit it.
export const fonts = {
  // -------- Display / editorial — Cormorant Garamond --------
  headingRegular: 'CormorantGaramond_400Regular',
  headingItalic:  'CormorantGaramond_400Regular_Italic',
  headingSemibold: 'CormorantGaramond_600SemiBold',
  headingBold:    'CormorantGaramond_700Bold',

  // -------- Body — Spectral (app-wide body face) --------
  // Everything tagged body* — reading copy, captions, form text, card
  // content, pop-up bodies — renders in Spectral. Kept distinct from
  // heading* so the body face can be re-pointed here in one place.
  bodyRegular:  'Spectral_400Regular',
  bodyItalic:   'Spectral_400Regular_Italic',
  bodyMedium:   'Spectral_500Medium',
  bodySemibold: 'Spectral_600SemiBold',
  bodyBold:     'Spectral_700Bold',
} as const;

// Deprecated alias — `fonts` now carries the Spectral body face app-wide,
// so this simply re-exports it. Screens that still import
// `fontsSpectral as fonts` keep working unchanged; new code should import
// `fonts` directly. Safe to collapse those imports and remove this later.
export const fontsSpectral = fonts;
