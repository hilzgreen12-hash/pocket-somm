// Personalities returned from the personality edge function start with a
// markdown-style "# Title" line followed by a blank line and the body.
// Older cached entries stored before this format change won't have a title;
// in that case we return null for title and the whole string as the body so
// rendering still works.

export function splitPersonality(text: string | null | undefined): { title: string | null; body: string } {
  if (!text) return { title: null, body: '' };
  const trimmed = text.trim();
  const match = trimmed.match(/^#\s+(.+?)\r?\n\r?\n([\s\S]*)$/);
  if (match) {
    return { title: match[1].trim(), body: match[2].trim() };
  }
  // Fallback: a leading "# Title" line with no blank line after it.
  const singleLineMatch = trimmed.match(/^#\s+(.+?)\r?\n([\s\S]*)$/);
  if (singleLineMatch) {
    return { title: singleLineMatch[1].trim(), body: singleLineMatch[2].trim() };
  }
  return { title: null, body: trimmed };
}

// Explainer shown under "Your Wine/Foodie Personality" on the personality
// screen and on the shared card, so friends who receive a sketch understand
// what it is.
export function personalityBlurb(category: 'wine' | 'recipe'): string {
  if (category === 'recipe') {
    return "Vinster's take on who you really are in the kitchen, mandolin in hand. This character sketch is drawn up through the lens of your profile, the recipes you choose, what you cook, and your reviews. You've probably never taken the time to think of your foodie alter-ego — but Vinster has.";
  }
  return "Vinster's take on who you really are in the cellar, corkscrew in hand. This character sketch is drawn up through the lens of your profile, what bottles you choose, what's in your cellar, and your reviews. You've probably never taken the time to think of your vinous alter-ego — but Vinster has.";
}
