// Single source of truth for the install URL + Get Vinster CTA wording.
// Used by every share surface (image share cards and plain-text shares)
// so all outbound content carries an identical call-to-action.
//
// If the domain ever changes, this is the one place to update.

// Direct App Store product-page link. Tapping it in a message opens the App
// Store straight onto Vinster, ready to install — a plain website link doesn't
// open the store. This is the single canonical install link every share uses.
export const VINSTER_APP_STORE_URL = 'https://apps.apple.com/app/id6763607127';
export const VINSTER_INSTALL_URL = VINSTER_APP_STORE_URL;
export const VINSTER_GET_LABEL = 'GET VINSTER';
export const VINSTER_TAGLINE = 'Your AI sommelier — wine, food, restaurants.';

// Plain-text footer block appended to outgoing text shares (wine reviews,
// restaurant reviews, etc.). Blank line at the top so it sits visually
// apart from the user content above it. The link is tappable and goes straight
// to the App Store.
export const VINSTER_TEXT_SHARE_FOOTER =
  `\n\n${VINSTER_TAGLINE}\nGet Vinster: ${VINSTER_APP_STORE_URL}`;
