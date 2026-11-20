// Find Online — choosing which web-search results to offer.
//
// Kept apart from index.ts (no Deno / network imports) so the ranking can be
// tested offline against made-up search results.

// Sites that never hold a readable list (reviews, bookings, social).
export const SKIP_DOMAINS = /(^|\.)(tripadvisor\.[a-z.]+|opentable\.[a-z.]+|thefork\.[a-z.]+|yelp\.[a-z.]+|facebook\.com|instagram\.com|tiktok\.com|x\.com|twitter\.com|google\.[a-z.]+|youtube\.com|squaremeal\.co\.uk|timeout\.com|resy\.com|sevenrooms\.com|designmynight\.com|michelin\.com|guide\.michelin\.com|ubereats\.com|deliveroo\.[a-z.]+|just-eat\.[a-z.]+|reddit\.com|podcasts\.apple\.com|spotify\.com|ft\.com|nytimes\.com|theguardian\.com|telegraph\.co\.uk|standard\.co\.uk|thetimes\.co\.uk|bbc\.co\.uk|eater\.com|hot-dinners\.com|wine-pages\.com|decanter\.com|jancisrobinson\.com|wikipedia\.org|linkedin\.com)$/i;

// Website builders' file stores, where restaurants' PDFs usually live.
export const FILE_HOSTS = /(^|\.)(squarespace\.com|squarespace-cdn\.com|wixstatic\.com|shopify\.com|amazonaws\.com|cloudfront\.net|ctfassets\.net|prismic\.io|website-files\.com|webflow\.com|wp\.com|storage\.googleapis\.com|godaddysites\.com|img1\.wsimg\.com)$/i;

// ---- Safety: only fetch public web addresses --------------------------------

export function safeUrl(raw: string): URL | null {
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const h = u.hostname.toLowerCase();
  if (!h.includes('.') || h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return null;
  // Literal IPs (v4 or v6) are never a restaurant website.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.includes(':') || h.startsWith('[')) return null;
  if (u.port && u.port !== '80' && u.port !== '443') return null;
  return u;
}

// ---- Towns ---------------------------------------------------------------------

// Neighbourhoods that count as the town itself — the Islington pub's site
// says "Islington" or "N1", rarely "London".
const TOWN_ALIASES: Record<string, string[]> = {
  london: ['islington', 'soho', 'mayfair', 'shoreditch', 'hackney', 'clerkenwell', 'marylebone', 'fitzrovia', 'covent garden', 'chelsea', 'kensington', 'notting hill', 'camden', 'hampstead', 'highbury', 'barnsbury', 'angel', 'borough', 'bermondsey', 'southwark', 'brixton', 'peckham', 'clapham', 'battersea', 'fulham', 'hammersmith', 'chiswick', 'richmond', 'greenwich', 'dalston', 'stoke newington', 'bloomsbury', 'holborn', 'westminster', 'belgravia', 'pimlico', 'knightsbridge', 'king\'s cross', 'kings cross', 'canary wharf', 'the city', 'farringdon', 'spitalfields', 'whitechapel', 'bethnal green', 'deptford', 'walthamstow', 'hackney wick', 'primrose hill', 'st john\'s wood', 'wimbledon', 'putney', 'east dulwich', 'dulwich'],
  'new york': ['nyc', 'manhattan', 'brooklyn', 'queens', 'soho', 'tribeca', 'greenwich village', 'west village', 'east village', 'williamsburg', 'harlem'],
  paris: ['marais', 'montmartre', 'saint-germain', 'pigalle', 'belleville', 'bastille'],
};

// Other towns a namesake might be in ("drapersarmscanterbury.co.uk"). Not a
// gazetteer — just enough common UK / big-city names to catch the usual
// namesakes. Words that are also ordinary English (Bath, Reading, Wells,
// Sale…) are left out so they can't misfire.
const KNOWN_PLACES = [
  'london', 'canterbury', 'manchester', 'birmingham', 'liverpool', 'leeds', 'sheffield', 'bristol', 'newcastle', 'nottingham', 'leicester', 'oxford', 'cambridge', 'brighton', 'edinburgh', 'glasgow', 'cardiff', 'belfast', 'dublin', 'york', 'norwich', 'exeter', 'plymouth', 'southampton', 'portsmouth', 'bournemouth', 'cheltenham', 'harrogate', 'winchester', 'salisbury', 'chester', 'durham', 'lincoln', 'ipswich', 'colchester', 'guildford', 'aberdeen', 'dundee', 'inverness', 'swansea', 'whitstable', 'margate', 'folkestone', 'dover', 'maidstone', 'tunbridge', 'sevenoaks', 'rye', 'hastings', 'eastbourne', 'lewes', 'chichester', 'reigate', 'st albans', 'hertford', 'windsor', 'henley', 'marlow', 'stratford', 'warwick', 'coventry', 'derby', 'stockport', 'bolton', 'preston', 'lancaster', 'kendal', 'carlisle', 'hexham', 'whitby', 'scarborough', 'padstow', 'falmouth', 'truro', 'penzance', 'st ives', 'cornwall', 'devon', 'kent', 'sussex', 'surrey', 'yorkshire', 'norfolk', 'suffolk', 'cotswolds',
  'paris', 'lyon', 'bordeaux', 'marseille', 'nice', 'new york', 'brooklyn', 'chicago', 'boston', 'san francisco', 'los angeles', 'seattle', 'portland', 'sydney', 'melbourne', 'auckland', 'wellington', 'toronto', 'vancouver', 'montreal', 'berlin', 'munich', 'hamburg', 'vienna', 'zurich', 'geneva', 'amsterdam', 'brussels', 'copenhagen', 'stockholm', 'oslo', 'madrid', 'barcelona', 'lisbon', 'porto', 'rome', 'milan', 'florence', 'venice', 'naples', 'hong kong', 'singapore', 'tokyo', 'dubai',
];

// ---- Ranking -------------------------------------------------------------------

type Item = { title?: unknown; link?: unknown; snippet?: unknown };
export type Offered = { title: string; url: string; domain: string; snippet: string; isPdf: boolean };

// Turns raw Serper results into the few the app offers: the restaurant's own
// site / its list, in the town the user gave.
export function rankResults(items: Item[], restaurant: string, city: string): Offered[] {
  const fold = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  // "London, UK" → "london".
  const cityLc = fold(city.split(',')[0] ?? '').trim();
  // Words that identify THIS restaurant — generic words ("wine", "bar",
  // "kitchen"…) would let wine magazines and guides through.
  const GENERIC = new Set(['the', 'and', 'restaurant', 'restaurants', 'bar', 'wine', 'wines', 'kitchen', 'cafe', 'bistro', 'brasserie', 'pub', 'house', 'club', 'hotel', 'room', 'dining', 'grill', 'cellar', 'london', 'paris']);
  const allWords = fold(restaurant).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && w !== 'the' && w !== 'and');
  const specific = allWords.filter((w) => !GENERIC.has(w));
  // A name made only of generic words ("The Wine Bar") keeps them.
  const nameWords = specific.length ? specific : allWords;
  const restaurantLc = fold(restaurant);

  // The user's town and its neighbourhoods; every other known place (unless
  // it's part of the restaurant's own name — "The Canterbury Arms").
  const townWords = cityLc ? [cityLc, ...(TOWN_ALIASES[cityLc] ?? [])] : [];
  const otherPlaces = cityLc
    ? KNOWN_PLACES.filter((p) => !townWords.includes(p) && !restaurantLc.includes(p) && !p.includes(cityLc))
    : [];
  const wordRe = (w: string) => new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`);
  const townRes = townWords.map(wordRe);
  const otherRes = otherPlaces.map((p) => ({ p, re: wordRe(p) }));
  const squash = (t: string) => fold(t).replace(/[^a-z0-9]/g, '');

  // The restaurant's own site: its domain carries the name ("thedrapersarms.com",
  // "noblerot.co.uk", "bratrestaurant.co.uk"). Only those results are offered —
  // never guides, magazines or list aggregators. (A list PDF the restaurant
  // links to on another host is still found when its page is read.)
  // How many of the name's words the domain carries ("drapersarms" = 2 of 2,
  // "thedrapers" = 1 of 2). Results must match as many as the best one does,
  // so a namesake (Drapers' Hall) drops out when the real site is found.
  const nameHits = (text: string) => {
    const squashed = squash(text);
    return nameWords.filter((w) => squashed.includes(w)).length;
  };
  const ownSite = (domain: string) => nameWords.length > 0 && nameHits(domain) > 0
    && !/^(shop|store|boutique|giftcards?|vouchers?)\./.test(domain);
  // What the domain says besides the name: "thedrapersarms" → "",
  // "drapersarmscanterbury" → "canterbury". Taken from the domain label that
  // carries the most of the name.
  const domainExtra = (domain: string) => {
    const label = domain.split('.').map(squash).sort((a, b) => nameHits(b) - nameHits(a))[0] ?? '';
    let rest = label;
    for (const w of [...nameWords].sort((a, b) => b.length - a.length)) rest = rest.replace(w, '');
    return rest.replace(/^the/, '');
  };
  // A PDF on a website builder's file store (Squarespace, Wix, Shopify…) is
  // usually the restaurant's own list: its address isn't the restaurant's, so
  // the file name or title has to carry the name instead
  // ("static1.squarespace.com/…/BANCONE+WINE+LIST.pdf") — or the PDF's text
  // (the snippet) has to carry ALL of it ("…/Wine+List+Nov.pdf" whose first
  // page reads "The Drapers Arms").
  const hostedPdfHits = (domain: string, path: string, title: string, snippet: string) => {
    if (!FILE_HOSTS.test(domain)) return 0;
    const inSnippet = nameHits(snippet) === nameWords.length ? nameWords.length : 0;
    return Math.max(nameHits(`${path} ${title}`), inSnippet);
  };

  const scored = items
    .map((it) => {
      const url = typeof it.link === 'string' ? it.link : '';
      const u = safeUrl(url);
      if (!u) return null;
      const domain = u.hostname.replace(/^www\./, '');
      if (SKIP_DOMAINS.test(domain)) return null;
      const title = String(it.title ?? domain);
      const snippet = String(it.snippet ?? '');
      const isPdf = /\.pdf($|\?)/i.test(u.pathname + u.search) || /\[pdf\]/i.test(title);
      let path = u.pathname;
      try { path = decodeURIComponent(path); } catch { /* keep it encoded */ }
      const hosted = isPdf ? hostedPdfHits(domain, path, title, snippet) : 0;
      if (!ownSite(domain) && hosted === 0) return null;
      const hay = `${title} ${snippet} ${domain} ${u.pathname}`.toLowerCase();

      // Which town this result is in. The domain naming a town is the
      // strongest sign ("drapersarmscanterbury.co.uk" is the Canterbury pub
      // even if a page says "an hour from London"); then the words of the
      // title, snippet and address.
      const extra = hosted ? '' : domainExtra(domain);
      const textTown = fold(`${title} ${snippet} ${path.replace(/[_\-./+]+/g, ' ')}`);
      const domainTown = extra
        ? (cityLc && extra.includes(squash(cityLc)) ? 'match' : otherPlaces.some((p) => p.length >= 4 && extra.includes(squash(p))) ? 'other' : null)
        : null;
      const town: 'match' | 'other' | 'unknown' = domainTown
        ?? (townRes.some((re) => re.test(textTown)) ? 'match'
          : otherRes.some(({ re }) => re.test(textTown)) ? 'other' : 'unknown');

      let score = 0;
      if (nameWords.some((w) => hay.includes(w))) score += 5;
      // Every word of the name ("Drapers" AND "Arms"), not a namesake.
      if (nameWords.length > 1 && nameWords.every((w) => hay.includes(w))) score += 4;
      if (nameWords.some((w) => domain.includes(w))) score += 4;
      // The town the user gave, so the Islington pub beats the Canterbury one.
      if (town === 'match') score += 6;
      if (town === 'other') score -= 8;
      // The domain IS the name ("thedrapersarms") beats the name plus other
      // words ("drapersarmscanterbury", "drapersarmsevents").
      if (!hosted && ownSite(domain)) {
        const leftover = extra.replace(new RegExp(`(${[...GENERIC, cityLc && squash(cityLc)].filter(Boolean).join('|')})`, 'g'), '');
        score += leftover ? -2 : 3;
      }
      // A real list ("wine list", "drinks menu", "carte des vins") beats a page
      // that only mentions wine ("a guide to food and wine pairing").
      const tier = listTier(`${title} ${u.pathname}`);
      if (tier === 2) score += 6;
      else if (/wine/.test(hay)) score += 2;
      if (isPdf) score += 2;
      // A food or set menu is not the wine list.
      if (/food|lunch menu|set menu|dinner menu|dessert|allergen/.test(hay) && !/wine/.test(hay)) score -= 5;
      if (nameWords.length && !nameWords.some((w) => hay.includes(w))) score -= 6;
      // A web page on someone else's site is usually an article ABOUT the
      // restaurant, not its list (PDFs on other hosts are often the real list).
      if (!isPdf && nameWords.length && !nameWords.some((w) => domain.includes(w))) score -= 4;
      return { title: title.replace(/^\[pdf\]\s*/i, ''), url: u.toString(), domain, snippet, isPdf, score, tier, town, elsewhereSite: domainTown === 'other', hosted: hosted > 0, hits: Math.max(nameHits(domain), hosted) };
    })
    .filter((r): r is NonNullable<typeof r> => !!r && r.score >= 5);

  // A namesake in another town (the Canterbury Drapers Arms, Noble Rot in New
  // Zealand), checked BEFORE picking lists so a "strong" list from the wrong
  // town can't crowd out the right restaurant's own site:
  //  1. a site whose address names another town is that town's restaurant —
  //     always dropped (an honest "not found" beats the wrong pub's list);
  //  2. results whose words name another town (and never the user's) go
  //     whenever anything else is left — a passing mention can mislead;
  //  3. when some site's results name the user's town, sites whose results
  //     never do go too. A file-store PDF carrying the name is exempt from
  //     this one (a bare PDF rarely names the town).
  const ownTown = scored.filter((r) => !r.elsewhereSite);
  const notElsewhere = ownTown.some((r) => r.town !== 'other') ? ownTown.filter((r) => r.town !== 'other') : ownTown;
  const cityDomains = new Set(notElsewhere.filter((r) => r.town === 'match' && !r.hosted).map((r) => r.domain));
  const inTown = notElsewhere.filter((r) => r.hosted || cityDomains.size === 0 || cityDomains.has(r.domain));
  // Name-match strength is compared only among the survivors, so the other
  // town's site can't set the bar.
  const bestHits = Math.max(0, ...inTown.map((r) => r.hits));
  const seen = new Set<string>();
  const candidates = inTown
    .filter((r) => r.hits === bestHits)
    .sort((a, b) => b.score - a.score)
    .filter((r) => { const k = urlKey(r.url); return seen.has(k) ? false : (seen.add(k), true); });

  // Only actual wine lists: the title or address must say so. Homepages,
  // restaurant pages and private-dining brochures are dropped.
  // (Separators in addresses — "soho_wine.pdf", "wine-list" — count as spaces.)
  // Real lists first: when any result is clearly a list, pages that only
  // mention wine are left out.
  const looksListy = candidates.filter((r) => r.tier >= 1);
  const strong = looksListy.filter((r) => r.tier === 2);
  const lists = strong.length ? strong : looksListy;
  // Nothing that looks like a list → offer the restaurant's own site (at most
  // two pages, town matches first) so Vinster can look for the list there when
  // it reads it — locateList follows its wine-list / drinks links and PDFs.
  const sites = [...candidates].sort((a, b) => Number(b.town === 'match') - Number(a.town === 'match'));
  const chosen = lists.length ? latestEditions(lists) : sites.slice(0, 2);
  return chosen.slice(0, 6).map(({ title, url, domain, snippet, isPdf }) => ({ title, url, domain, snippet, isPdf }));
}

// How surely a title/address is a wine list: 2 = says so ("wine list",
// "drinks menu", "carte des vins", "by the bottle"…), 1 = only mentions wine
// or drinks, 0 = neither. Separators in addresses count as spaces.
const STRONG_LIST_SIGNAL = /\b(wine|wines|drinks?|beverages?)\s*(list|lists|menu|menus|card|book|selection|cellar)\b|\bwinelist\b|\bby the (bottle|glass)\b|\bcellar list\b|\bcarte des vins\b|\bcarte (de |des )?boissons\b|\bcarta (de |dei )?vin(o|i|os)\b|\bweinkarte\b|\bgetr[aä]nkekarte\b|\blista (dei )?vini\b/i;
export function listTier(text: string): 0 | 1 | 2 {
  const t = text.replace(/[_\-./+%]+|%20/g, ' ');
  if (STRONG_LIST_SIGNAL.test(t)) return 2;
  return WINE_LIST_SIGNAL.test(t) ? 1 : 0;
}

// Words that mark a result as a wine (or drinks) list, in the languages lists
// are usually written in.
const WINE_LIST_SIGNAL = /\b(wine|wines|vin|vins|vino|vinos|vini|wein|weine|drinks?|cellar|cave|carta|bevande|boissons|getr[aä]nke)\b|wine-?list|winelist|carte-des-vins|carta-de?-vinos/i;

// The same page under different addresses (http/https, www, trailing slash,
// tracking parameters) counts once.
function urlKey(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}`.toLowerCase();
  } catch { return url.toLowerCase(); }
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// A date in a list's address or title ("wine-list-9th-October-2024.pdf",
// "Wine-list-April-24th-2025", "/2024/10/"), as a sortable number + label.
function editionDate(r: { url: string; title: string }): { sort: number; label: string } | null {
  const t = decodeURIComponent(`${r.url} ${r.title}`).toLowerCase();
  const year = t.match(/\b(20[1-3]\d)\b/g)?.map(Number).pop();
  if (!year) return null;
  const named = t.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/g)?.pop();
  const mIdx = named ? MONTHS.indexOf(named.slice(0, 3)) : -1;
  const month = mIdx >= 0 ? mIdx + 1 : Number(t.match(new RegExp(`${year}[-/_.](\\d{1,2})\\b`))?.[1] ?? 0);
  return { sort: year * 100 + (month >= 1 && month <= 12 ? month : 0), label: month >= 1 && month <= 12 ? `${MONTH_NAMES[month - 1]} ${year}` : String(year) };
}

// A restaurant often has several dated copies of the same list online. Keep
// only the newest of each (same site + same title), and put its date in the
// title so the diner can see how current it is.
function latestEditions<T extends { url: string; title: string; domain: string }>(results: T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const r of results) {
    // Same site + same title once the site's own name ("… - quovadissoho.co.uk")
    // and the word "pdf" are taken out.
    const siteWords = new Set(r.domain.toLowerCase().split('.'));
    const titleWords = r.title.toLowerCase().replace(/[^a-z]+/g, ' ').trim().split(' ').filter((w) => w && w !== 'pdf' && !siteWords.has(w));
    const k = `${r.domain}|${titleWords.join(' ')}`;
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  const out: T[] = [];
  for (const g of groups.values()) {
    const dated = g.map((r) => ({ r, d: editionDate(r) }));
    const best = dated.filter((x) => x.d).sort((a, b) => b.d!.sort - a.d!.sort)[0] ?? dated[0];
    const title = best.d && !best.r.title.includes(best.d.label) ? `${best.r.title.replace(/\s*[-–|]\s*[a-z0-9.-]+\.[a-z]{2,}$/i, '')} — ${best.d.label}` : best.r.title;
    out.push({ ...best.r, title: title.charAt(0).toUpperCase() + title.slice(1) });
  }
  // Keep the original ranking order.
  return results.filter((r) => out.some((o) => o.url === r.url)).map((r) => out.find((o) => o.url === r.url)!);
}
