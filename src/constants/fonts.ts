// Semantic font mapping for the app.
//
// Vinster uses two type families:
//
//   • Cormorant Garamond — editorial display serif. Used for
//     headers, tab-screen blurbs (the italic intro under each tab
//     name), buttons, pop-up titles, the About Vinster screen, and
//     the headers + blurbs on every tab. Carries the brand voice.
//
//   • Inter — neutral readability sans. Used for everything else:
//     body copy, form labels, form inputs, card content, pop-up
//     bodies, hints, captions, meta lines. Switched from Cormorant
//     in 2026-05 after user feedback that the all-serif treatment
//     was hard to read at small sizes.
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

// REVERTED 2026-05-21: the body tokens now point back at Cormorant
// Garamond. The semantic split (heading / body) is preserved in the
// codebase so we can rethink the body face more carefully — but right
// now every token resolves to Cormorant, restoring the pre-migration
// look in one file rather than rewriting 86 sites again. Inter is
// still loaded in _layout.tsx so the next iteration can re-point
// body tokens at it (or a different sans) without another build cycle.
export const fonts = {
  // -------- Display / editorial — Cormorant Garamond --------
  headingRegular: 'CormorantGaramond_400Regular',
  headingItalic:  'CormorantGaramond_400Regular_Italic',
  headingSemibold: 'CormorantGaramond_600SemiBold',
  headingBold:    'CormorantGaramond_700Bold',

  // -------- Body — reverted to Cormorant Garamond --------
  // Tokens kept distinct from heading* so we can re-point body to
  // Inter (or another sans) per-token without touching call sites.
  // Inter mapping preserved below in a comment for the next attempt:
  //   bodyRegular  -> 'Inter_400Regular'
  //   bodyItalic   -> 'Inter_400Regular_Italic'
  //   bodyMedium   -> 'Inter_500Medium'
  //   bodySemibold -> 'Inter_600SemiBold'
  //   bodyBold     -> 'Inter_700Bold'
  bodyRegular:  'CormorantGaramond_400Regular',
  bodyItalic:   'CormorantGaramond_400Regular_Italic',
  bodyMedium:   'CormorantGaramond_600SemiBold',
  bodySemibold: 'CormorantGaramond_600SemiBold',
  bodyBold:     'CormorantGaramond_700Bold',
} as const;

// (Old Cormorant ↔ Inter pairing table removed — no longer needed
// now that body tokens point back at Cormorant. Re-add per token
// in the `fonts` object above if/when we re-attempt a body face.)
