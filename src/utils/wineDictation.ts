// Speech-to-text routinely mishears wine vocabulary ("seller" for "cellar",
// "Shadow" for "Château"). This nudges the common mis-hearings back to the right
// term. Applied to the MIC's dictated output ONLY — manual typing in the input
// field is left exactly as the user types it. Patterns are kept tight
// (distinctive tokens or multi-word phrases) so ordinary words aren't mangled.
const FIXES: Array<[RegExp, string]> = [
  // Cellar / storage
  [/\bsell?ers?\b/gi, 'cellar'],
  [/\bsell?ars?\b/gi, 'cellar'],
  [/\bcella\b/gi, 'cellar'],
  [/\bwould store\b/gi, 'wood store'],
  [/\bwood stall\b/gi, 'wood store'],
  // Château — "shadow" is the classic mis-hear; also shato / shatto variants.
  [/\bshadows?\b/gi, 'Château'],
  [/\bshat+o(?:w|e)?\b/gi, 'Château'],
  [/\bchateau\b/gi, 'Château'],
  // Grapes
  [/\bcab(?:ernet)?\s+sa(?:v|uv)\b/gi, 'Cabernet Sauvignon'],
  [/\bsee[\s-]?rah\b/gi, 'Syrah'],
  [/\bsah[\s-]?rah\b/gi, 'Syrah'],
  [/\bsirah\b/gi, 'Syrah'],
  [/\bgren(?:a|ai)sh\b/gi, 'Grenache'],
  [/\bshard[\s-]?on[\s-]?nay\b/gi, 'Chardonnay'],
  [/\bchar[\s-]?don[\s-]?nay\b/gi, 'Chardonnay'],
  [/\bmer[\s-]?low\b/gi, 'Merlot'],
  [/\bmare[\s-]?low\b/gi, 'Merlot'],
  [/\breese?[\s-]?ling\b/gi, 'Riesling'],
  [/\bsauv(?:ignon)?\s+blonk\b/gi, 'Sauvignon Blanc'],
  // Regions & appellations
  [/\bshably\b/gi, 'Chablis'],
  [/\bshab[\s-]?lee\b/gi, 'Chablis'],
  [/\bbo(?:a|o)?r[\s-]?doe?\b/gi, 'Bordeaux'],
  [/\bbordo\b/gi, 'Bordeaux'],
  [/\bbo[o]?[\s-]?jo[\s-]?lay\b/gi, 'Beaujolais'],
  [/\bkee?[\s-]?anti\b/gi, 'Chianti'],
  [/\bree[\s-]?oh?[\s-]?ha\b/gi, 'Rioja'],
  [/\bree[\s-]?oja\b/gi, 'Rioja'],
  [/\bsan[\s-]?sair\b/gi, 'Sancerre'],
  [/\b(?:sham|champ)[\s-]?pain\b/gi, 'Champagne'],
  [/\bbar[\s-]?rolo\b/gi, 'Barolo'],
  // Formats
  [/\bmag[\s-]?num\b/gi, 'magnum'],
];

export function correctWineTerms(text: string): string {
  return FIXES.reduce((s, [re, rep]) => s.replace(re, rep), text);
}
