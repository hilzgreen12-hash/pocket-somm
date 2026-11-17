import type { ChosenWine, CellarWine, ReviewEntry, VintageAssessment, RarityAssessment } from '../types/wine';
import { entriesOf, drinkingDateTime } from './cellarReview';
import { wineNameKey } from './wineIdentity';

// Your Wine Reviews shows ONE card per wine. A card gathers that wine's
// reviews from both places they are stored, without copying between them:
//   • chosen_wines rows sharing a review_group_id (restaurant / other reviews,
//     one row per dated entry), and
//   • the review_entries list on the user's cellar bottle(s) of the same wine.
// Every entry keeps a reference to the row it lives in, so editing or deleting
// it only ever touches that row.

// A chosen_wines row is a review once it carries content. A bare row (a
// restaurant bottle pick, or a wine saved to "review later") is awaiting one.
export function chosenHasReview(w: ChosenWine): boolean {
  return !!(w.tasting_note?.trim() || w.other_observations?.trim() || w.user_score != null);
}

// Rows that share this id are the entries of one review (migration 079).
export function chosenGroupId(w: ChosenWine): string {
  return w.review_group_id ?? w.id;
}

// Card key for the review a chosen row belongs to — lets a deep link to a row
// open its card without first building every card.
export function cardKeyForChosen(w: ChosenWine): string {
  return `group:${chosenGroupId(w)}`;
}

// Same wine, same vintage: accent/word-order tolerant producer + name, plus vintage.
export function reviewIdentityKey(w: { producer?: string | null; wine_name?: string | null; vintage?: string | number | null }): string {
  return `${wineNameKey(w.producer, w.wine_name)}|${String(w.vintage ?? '').trim()}`;
}

// Where an entry is stored.
export type EntryRef =
  | { kind: 'chosen'; row: ChosenWine }
  | { kind: 'cellar'; wine: CellarWine; entryId: string };

export interface UnifiedEntry {
  id: string; // chosen row id, or the cellar entry id
  ref: EntryRef;
  // Identical copies of this tasting in the other store, left behind by the
  // retired two-way review sync. Hidden so a wine never lists a tasting twice;
  // removed alongside this entry when it is edited or deleted.
  twins: EntryRef[];
  savedAt: string | null;
  dateIso: string | null; // drinking date, for the entry heading
  location: string | null;
  score: number | null;
  favourite: boolean;
  note: string | null; // "Your Review"
  personalNotes: string | null;
  drinkingWindow: string | null;
  // Price paid for the bottle on that occasion (restaurant / other reviews).
  pricePaid?: number | null;
  priceCurrency?: string | null;
}

// Vinster's own take on the wine, shown collapsed under "View Vinster's Note".
// The sommelier note (rationale) is fetched on demand when none is saved.
interface VinsterIntel {
  criticScore: number | null;
  vintageAssessment: VintageAssessment | null;
  rarityAssessment: RarityAssessment | null;
  rationale: string | null;
}

export interface UnifiedReview {
  key: string; // stable across new entries
  folderId: string; // the id Your Folders store for this card
  // The collection the review was started in. A card with any chosen rows keeps
  // its original row's source, so adding an entry never re-files it.
  source: 'restaurant' | 'other' | 'cellar';
  identityKey: string;
  title: string;
  producer: string | null;
  wineName: string | null;
  vintage: string | number | null;
  region: string | null;
  grape: string | null;
  photoPath: string | null;
  chosenRows: ChosenWine[]; // every row of the review group, newest first
  cellarWines: CellarWine[]; // bottles whose entries are on this card
  entries: UnifiedEntry[]; // newest first
  count: number;
  averageScore: number | null; // mean across entries that carry a score
  latestDate: string | null; // newest entry's drinking date
  vinsterIntel: VinsterIntel;
}

const byChosenAtDesc = (a: ChosenWine, b: ChosenWine) => new Date(b.chosen_at).getTime() - new Date(a.chosen_at).getTime();

function firstNonNull<T, R>(items: T[], pick: (item: T) => R | null | undefined): R | null {
  for (const item of items) {
    const v = pick(item);
    if (v != null && v !== '') return v;
  }
  return null;
}

function fromChosenRow(row: ChosenWine): UnifiedEntry {
  return {
    id: row.id,
    ref: { kind: 'chosen', row },
    twins: [],
    savedAt: row.reviewed_at ?? row.chosen_at,
    dateIso: row.chosen_at,
    location: [row.restaurant_name, row.city].map((s) => (s ?? '').trim()).filter(Boolean).join(', ') || null,
    score: row.user_score,
    favourite: row.is_favourite,
    note: row.tasting_note,
    personalNotes: row.other_observations,
    drinkingWindow: row.user_drinking_window,
    pricePaid: row.menu_price ?? null,
    priceCurrency: row.currency ?? null,
  };
}

function fromCellarEntry(wine: CellarWine, e: ReviewEntry): UnifiedEntry {
  return {
    id: e.id,
    ref: { kind: 'cellar', wine, entryId: e.id },
    twins: [],
    savedAt: e.savedAt,
    dateIso: e.date,
    location: e.location,
    score: e.score,
    favourite: wine.is_favourite, // a cellar favourite is per bottle, not per entry
    note: e.note,
    personalNotes: e.personalNotes,
    drinkingWindow: e.drinkingWindow,
  };
}

// Two entries are the same tasting when they share a day, score and note. The
// day is the date's first ten characters: chosen_at comes back in UTC and the
// old sync copied that UTC day verbatim onto the cellar entry.
function tastingKey(e: UnifiedEntry): string | null {
  const note = (e.note ?? '').trim().toLowerCase();
  if (!note && e.score == null) return null; // nothing to recognise it by
  return `${(e.dateIso ?? '').slice(0, 10)}|${e.score ?? ''}|${note}`;
}

// Fold identical tastings into one entry. Earlier entries win, so callers list
// chosen entries first and the restaurant/other copy is the one shown.
function mergeTwins(entries: UnifiedEntry[]): UnifiedEntry[] {
  const kept: UnifiedEntry[] = [];
  const byKey = new Map<string, UnifiedEntry>();
  for (const e of entries) {
    const k = tastingKey(e);
    const original = k ? byKey.get(k) : undefined;
    if (original) { original.twins.push(e.ref); continue; }
    if (k) byKey.set(k, e);
    kept.push(e);
  }
  return kept;
}

function newestFirst(entries: UnifiedEntry[]): UnifiedEntry[] {
  return [...entries].sort((a, b) =>
    drinkingDateTime(b.dateIso) - drinkingDateTime(a.dateIso)
    || new Date(b.savedAt ?? 0).getTime() - new Date(a.savedAt ?? 0).getTime());
}

function average(entries: UnifiedEntry[]): number | null {
  const scores = entries.map((e) => e.score).filter((s): s is number => s != null);
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

interface CardDraft {
  key: string;
  chosenRows: ChosenWine[];
  cellarWines: CellarWine[];
}

function toCard(draft: CardDraft): UnifiedReview {
  const rows = [...draft.chosenRows].sort(byChosenAtDesc);
  const reviewed = rows.filter(chosenHasReview);
  const entries = newestFirst(mergeTwins([
    ...reviewed.map(fromChosenRow),
    ...draft.cellarWines.flatMap((w) => entriesOf(w).map((e) => fromCellarEntry(w, e))),
  ]));
  const original = rows[rows.length - 1];
  const head = reviewed[0] ?? draft.cellarWines[0];
  const producer = head.producer ?? null;
  const wineName = head.wine_name ?? null;
  const vintage = head.vintage ?? null;
  // The cellar-only folder id is the oldest bottle's, so it doesn't change as
  // bottles are added or archived.
  const oldestBottle = [...draft.cellarWines].sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
  return {
    key: draft.key,
    folderId: original ? chosenGroupId(original) : oldestBottle.id,
    source: original ? (original.source === 'other' ? 'other' : 'restaurant') : 'cellar',
    identityKey: reviewIdentityKey(head),
    title: [producer, wineName, vintage ? String(vintage) : null].filter(Boolean).join(', '),
    producer,
    wineName,
    vintage,
    region: firstNonNull<ChosenWine | CellarWine, string>([...reviewed, ...rows, ...draft.cellarWines], (w) => w.region),
    grape: firstNonNull(rows, (r) => r.grape) ?? firstNonNull(draft.cellarWines, (w) => w.grape_variety),
    // Any photo in the group, not just the newest entry's — an added entry
    // shouldn't blank the card's thumbnail.
    photoPath: firstNonNull<ChosenWine | CellarWine, string>([...reviewed, ...rows, ...draft.cellarWines], (w) => w.label_image_path),
    chosenRows: rows,
    cellarWines: draft.cellarWines,
    entries,
    count: entries.length,
    averageScore: average(entries),
    latestDate: entries[0]?.dateIso ?? null,
    vinsterIntel: {
      criticScore: firstNonNull(rows, (r) => r.critic_score) ?? firstNonNull(draft.cellarWines, (w) => w.critic_score),
      vintageAssessment: firstNonNull(rows, (r) => r.vintage_assessment),
      rarityAssessment: firstNonNull(rows, (r) => r.rarity_assessment),
      rationale: firstNonNull(rows, (r) => r.rationale),
    },
  };
}

// Build every review card. Chosen review groups each make a card; a cellar
// bottle's entries join the most recent card of the same wine, else bottles of
// the same wine share a card of their own. Bare picks (no review content
// anywhere in their group) are not cards — see awaitingPicks.
export function buildReviewCards(chosenWines: ChosenWine[], cellarWines: CellarWine[]): UnifiedReview[] {
  const groups = new Map<string, ChosenWine[]>();
  for (const row of chosenWines) {
    const gid = chosenGroupId(row);
    const rows = groups.get(gid);
    if (rows) rows.push(row); else groups.set(gid, [row]);
  }

  const chosenDrafts: CardDraft[] = [];
  for (const [gid, rows] of groups) {
    if (rows.some(chosenHasReview)) chosenDrafts.push({ key: `group:${gid}`, chosenRows: rows, cellarWines: [] });
  }
  // Most recently reviewed first, so a bottle joins the latest review of its wine.
  const latestReviewed = (d: CardDraft) => Math.max(...d.chosenRows.filter(chosenHasReview).map((r) => new Date(r.chosen_at).getTime()));
  chosenDrafts.sort((a, b) => latestReviewed(b) - latestReviewed(a));
  const byIdentity = new Map<string, CardDraft>();
  const byWsId = new Map<string, CardDraft>();
  for (const draft of chosenDrafts) {
    for (const row of draft.chosenRows.filter(chosenHasReview)) {
      const k = reviewIdentityKey(row);
      if (!byIdentity.has(k)) byIdentity.set(k, draft);
      if (row.ws_wine_id && !byWsId.has(row.ws_wine_id)) byWsId.set(row.ws_wine_id, draft);
    }
  }

  const cellarDrafts = new Map<string, CardDraft>();
  for (const wine of cellarWines) {
    if (entriesOf(wine).length === 0) continue;
    const k = reviewIdentityKey(wine);
    const target = (wine.ws_wine_id ? byWsId.get(wine.ws_wine_id) : undefined) ?? byIdentity.get(k);
    if (target) { target.cellarWines.push(wine); continue; }
    const own = cellarDrafts.get(k);
    if (own) own.cellarWines.push(wine);
    else cellarDrafts.set(k, { key: `cellar:${k}`, chosenRows: [], cellarWines: [wine] });
  }

  return [...chosenDrafts, ...cellarDrafts.values()].map(toCard);
}

// Bare chosen rows that should ask for a review: not dismissed, not part of a
// review group that already has content, and not a wine reviewed on any card
// (a leftover pick of a wine you've since reviewed elsewhere).
export function awaitingPicks(chosenWines: ChosenWine[], cards: UnifiedReview[]): ChosenWine[] {
  const cardGroups = new Set<string>();
  const reviewedIdentities = new Set<string>();
  for (const card of cards) {
    for (const row of card.chosenRows) {
      cardGroups.add(chosenGroupId(row));
      if (chosenHasReview(row)) reviewedIdentities.add(reviewIdentityKey(row));
    }
    for (const wine of card.cellarWines) reviewedIdentities.add(reviewIdentityKey(wine));
  }
  return chosenWines.filter((w) =>
    !chosenHasReview(w)
    && !w.review_dismissed
    && !cardGroups.has(chosenGroupId(w))
    && !reviewedIdentities.has(reviewIdentityKey(w)));
}

// Headline numbers shared by the list and the Review-tab carousel: distinct
// wines, and every dated entry across them.
export function reviewTotals(cards: UnifiedReview[]): { wines: number; reviews: number } {
  return {
    wines: new Set(cards.map((c) => c.identityKey)).size,
    reviews: cards.reduce((n, c) => n + c.count, 0),
  };
}

// Every ref an entry stands for — itself plus any hidden twins.
export function refsOf(entry: UnifiedEntry): EntryRef[] {
  return [entry.ref, ...entry.twins];
}
