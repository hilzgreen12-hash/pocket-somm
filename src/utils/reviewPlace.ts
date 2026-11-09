// How a review's location reads in "Your History With This Wine":
// "home, kersey" → "Home in Kersey"; "home" → "Home"; anything else as entered.
export function reviewPlaceLabel(location: string | null | undefined): string | null {
  const loc = (location ?? '').trim();
  if (!loc) return null;
  const m = loc.match(/^(?:at\s+)?home\b[\s,–-]*(?:in\s+)?(.*)$/i);
  if (!m) return loc;
  const town = m[1].trim().split(/\s+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return town ? `Home in ${town}` : 'Home';
}
