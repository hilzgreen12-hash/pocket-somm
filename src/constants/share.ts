// Single source of truth for the install URL + Get Vinster CTA wording.
// Used by every share surface (image share cards and plain-text shares)
// so all outbound content carries an identical call-to-action.
//
// If the domain ever changes, this is the one place to update.

export const VINSTER_INSTALL_URL = 'https://vinsterapp.com';
export const VINSTER_GET_LABEL = 'GET VINSTER';
export const VINSTER_TAGLINE = 'Your AI sommelier — wine, food, restaurants.';

// Plain-text footer block appended to outgoing text shares (wine reviews,
// restaurant reviews, etc.). Blank line at the top so it sits visually
// apart from the user content above it.
export const VINSTER_TEXT_SHARE_FOOTER =
  `\n\n${VINSTER_TAGLINE}\nGet Vinster: ${VINSTER_INSTALL_URL}`;
