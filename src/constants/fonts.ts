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

export const fonts = {
  // -------- Display / editorial — Cormorant Garamond --------
  // Use these on: page titles, section headers, tab blurbs (the
  // italic intro under a tab name), button labels, pop-up titles,
  // anything inside About Vinster, anything inside the headers /
  // blurbs at the top of a tab screen.
  headingRegular: 'CormorantGaramond_400Regular',
  headingItalic:  'CormorantGaramond_400Regular_Italic',
  headingSemibold: 'CormorantGaramond_600SemiBold',
  headingBold:    'CormorantGaramond_700Bold',

  // -------- Body / readability — Inter --------
  // Use these on: body text, form fields & labels, card content,
  // captions, hints, pop-up bodies, anything that isn't a "header"
  // in the editorial sense.
  bodyRegular:  'Inter_400Regular',
  bodyItalic:   'Inter_400Regular_Italic',
  bodyMedium:   'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold:     'Inter_700Bold',
} as const;

// Common Cormorant ↔ Inter weight pairings used during the
// per-screen migration. When swapping a body-context style from
// Cormorant to Inter, the corresponding Inter weight is the right
// drop-in 90%+ of the time. Italics are also weight-paired so
// 'CormorantGaramond_400Regular_Italic' becomes 'Inter_400Regular_Italic'.
//
// (Not used at runtime — kept here as a reference for the migration.)
export const FONT_BODY_FALLBACK: Record<string, string> = {
  CormorantGaramond_400Regular:         fonts.bodyRegular,
  CormorantGaramond_400Regular_Italic:  fonts.bodyItalic,
  CormorantGaramond_600SemiBold:        fonts.bodySemibold,
  CormorantGaramond_700Bold:            fonts.bodyBold,
};
