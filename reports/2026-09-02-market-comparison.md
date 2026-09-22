# Vinster — Market Comparison: Wine, Food & Combined Wine+Food Apps

**Date:** 2026-09-02
**Prepared by:** Automated Market Research Agent
**Branch analysed:** `main` @ `888413f` (last substantive feature/fix commit: `c15d3c4`, 2026-08-09 — see note below)
**Prior report:** `reports/2026-08-26-market-comparison.md` — read in full; this report re-verifies rather than carries forward on trust, and states plainly where nothing has changed.

**A note on objectivity:** This is internal competitive intelligence, not marketing copy. Vinster's strengths are not inflated and competitors' advantages are not softened. Where a competitor is materially better than Vinster — in scale, data depth, funding, ratings, or polish — that is stated directly. Every Vinster feature cited below as "built" was independently re-verified by reading the code on `main` this cycle (file paths cited throughout); anything not found in the code is marked **PROPOSED**, not built.

**What changed in the code since 2026-08-26:** Nothing, again. `git log --oneline --since=2026-08-26` on `main` returns only the 2026-08-26 report file's own commit (`888413f`) — zero feature work, zero bug fixes, zero monetization code. The last substantive commit remains `c15d3c4` ("Pricing: never show no price — harden Wine-Searcher path"), dated **2026-08-09**. That is now **four consecutive weekly report cycles (08-12, 08-19, 08-26, 09-02) — 24 days — with no feature work, bug fix, or monetization code landing on `main`**, only the weekly report files themselves. `app.json` is unchanged at version **1.3.4**. A direct grep this cycle (`revenuecat|stripe|in-app-purchase|react-native-iap|purchases-react-native` across `src/`, `app/`, `supabase/`, `package.json`) again returned **zero matches**. A grep for `wine_library|wine_catalog|wine_encyclopedia` across `supabase/migrations/` again returned zero matches — no browsable global wine reference database exists.

**One new code-grounded observation this cycle:** `eas.json`'s `submit.production` block specifies a real Apple App Store Connect app ID (`ascAppId: "6763607127"`) and a Google Play service-account path with `track: "internal"`. This means basic app-store *submission infrastructure* has been configured at some point — but it is not evidence of a live public listing, a released build, or any user-facing rating; `eas.json`'s `build` profiles remain limited to `development`/`preview`/`production` with `distribution: "internal"` throughout, and no App Store/Play Store URL for Vinster could be found in this cycle's research (see below). Treat this as "submission plumbing exists," not "the app is live."

**What changed in the market since 2026-08-26:** Three parallel research passes (wine apps, food/recipe apps, combined space + trends/funding) covering 2026-08-20 through 2026-09-02 found **no material developments** — no new funding rounds, no shutdowns, no confirmed feature launches, no rating-moving events for any of the ~25 apps tracked across prior cycles. This is itself worth stating plainly rather than manufacturing false novelty: both Vinster's own repository and its competitive landscape were quiet this particular week. A handful of minor, previously-untracked entrants surfaced in searches (Gastrona, Decanto, Cookie, Fuudle) and are noted below with appropriately hedged sourcing, but none change any conclusion from the prior cycle.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Wine Apps](#wine-apps)
3. [Food / Recipe / Pairing Apps](#food--recipe--pairing-apps)
4. [Combined Wine + Food / Dining Space](#combined-wine--food--dining-space)
5. [Feature Comparison Matrix](#feature-comparison-matrix)
6. [Market Gaps & Opportunities](#market-gaps--opportunities)
7. [Risks & Where Competitors Are Stronger](#risks--where-competitors-are-stronger)
8. [Emerging Trends](#emerging-trends)
9. [Recommended Differentiators for Vinster](#recommended-differentiators-for-vinster)
10. [Sources](#sources)

---

## Executive Summary

Vinster's codebase, re-audited independently this cycle, remains genuinely substantial for a pre-launch app: real Claude-backed vision AI for wine-list OCR, single-label scanning, and multi-bottle lineup detection (`src/services/ocr.ts`, `supabase/functions/{ocr,scan-label,detect-lineup}`); a Claude Sonnet sommelier-recommendation engine (`supabase/functions/recommend`); real Wine-Searcher market-pricing integration with live FX conversion; a fully-built relational cellar/rack/diamond-bin/case/storage-location data model with row-level security; chef-attributed recipe generation and cellar-aware food-and-wine pairing (`supabase/functions/{generate-pairings,food-wine-pairing}`); multi-axis restaurant reviews tied to actual scan sessions (`app/restaurants/reviews.tsx`, migration `018_restaurant_ratings.sql`); and an evidence-gated AI "personality"/taste-profile sketch (`supabase/functions/personality`) that explicitly refuses to fabricate a read when there isn't enough real data to ground one — confirmed again this cycle by reading the prompt logic directly. None of this is mocked; it is server-side, rate-limited code calling a real, paid Anthropic API. That is the honest, positive half of the picture, unchanged from prior cycles.

The other half is now more concerning than at any prior checkpoint. **Development has stalled for a full four weeks — 24 days with zero substantive commits on `main`.** The only activity landing on the branch since 2026-08-09 has been four consecutive weekly report files, including this one. There is still no monetization code anywhere in the repository (re-confirmed by a clean grep this cycle), no public App Store or Google Play listing findable by search, and — newly noted this cycle — while `eas.json` shows basic app-store submission plumbing exists (a real Apple `ascAppId`, a Google Play service account targeting the "internal" track), nothing in the repository or in search results suggests that plumbing has actually been used to ship a build anyone outside the team can install. A search specifically for "Vinster wine app" this cycle returned no App Store listing, press coverage, or user-facing presence of any kind under that name.

The competitive field Vinster would be entering has not moved this week either, which is itself informative: **Sommo** remains the closest functional analog — camera-based label and full wine-list scanning, cellar tracking, AI food pairing from a user's own collection, a tasting journal, WSET exam-prep content, and a "3D cellar wall" cellar-visualization feature (shipped 2026-08-01, with what appears to be a minor app-store patch update on 2026-08-24) that remains more visually ambitious than Vinster's diamond-bin tessellation. At least five to eight other apps continue to make functionally overlapping "AI sommelier + food pairing (+ cellar)" claims (Vinomat, Pocket Sommelier, SommelierX, Vino AI, WinePairingAI, CellarMate.ai, Cellared, InVintory), and this cycle's research surfaced two more previously-untracked names worth a cautious mention — **Gastrona** and **Decanto** — both AI-sommelier-positioned apps referenced in a competitor's (SommelierX's) own "best wine apps 2026" blog post, an unverified, self-interested source that should not be treated as an independent confirmation of either app's quality or scale. Incumbents remain unmoved but undiminished: Vivino (70M+ users, $224M raised) still bundles food-pairing and AI-sommelier chat into its free core product, and CellarTracker's GPT-based CellarChat pairing assistant remains over a year ahead of anything Vinster has shipped publicly.

On the food side, the finding that no mainstream recipe/meal-planning app (Samsung Food, Yummly, SideChef, Kitchen Stories, Mealime, Ollie, ChefGPT, PlantJammer) has ever shipped a wine or alcohol pairing feature holds again this cycle, with one useful refinement: this cycle's research explicitly surfaced that when "wine pairing app" searches are run in the food-app space, what turns up are dedicated, separate wine-pairing apps (Gastrona, Vinomat, Decanto, SommelierX) — not a recipe app adding the feature. That reinforces, rather than weakens, last cycle's read: the intersection is being served from the wine-app side, not the food-app side, and Vinster's positioning sits inside an already-populated cluster of wine-first apps making the same combined pitch, not in genuinely open territory. RecipeScan, the closest thing to a food-side menu/label scanner, remains pre-launch (still targeting Spring 2026, unchanged, still in closed waitlist beta per its own site). Neither OpenTable nor Resy has added any wine feature this cycle either — the reservation-platform gap identified previously remains the single cleanest unclaimed opening in this report, and remains just as far from anything in Vinster's current codebase as it was a week ago.

Taken as a whole, this cycle changes no prior conclusion but sharpens one: a genuinely capable, unmocked codebase sitting idle for 24 days, with no monetization, no discoverable public presence, and only submission plumbing (not a shipped build) in `eas.json`, is now the single most urgent finding in this report — more urgent than any single competitor's feature, because it is entirely within Vinster's own control to fix and is not being fixed.

---

## Wine Apps

### Vivino
**What it does:** Photo/label and wine-list scanning against the industry's largest crowdsourced database, personalized "Match for You" recommendations, cellar tracking, an integrated wine marketplace with global merchant shipping, and a conversational AI-sommelier chat drawing on a user's own scan/rating history.
**Scale:** ~70–74 million registered users, 65–74 million downloads, 2.7–3.26 billion+ scanned labels, 19.6 million+ wines in database, 280M+ numerical ratings. Founded 2010; ~$224M total raised (2021 Series D of $155M), no new funding round reported since.
**Ratings (re-checked this cycle, unattributed aggregator snapshots — treat as approximate):** ~4.8–4.85★ App Store (~104K ratings per one source), ~4.77★ Google Play, and **3.9/5 "Great" on Trustpilot (24,126 reviews)** — unchanged from prior cycles; the marketplace/fulfillment-driven Trustpilot gap persists.
**Pricing:** Freemium; Premium ~$4.99/month (or ~$47.90/year), plus marketplace commission.
**Praise:** Scan speed/accuracy, database breadth, ease of scan-to-buy.
**Complaints:** Marketplace fulfillment issues dominate lower ratings; features increasingly paywalled; ratings not weighted by reviewer expertise; recurring unverified allegations of rating manipulation favoring wines Vivino sells directly.
**Assessment:** Unchanged — the unambiguous scale leader by an order of magnitude. Vinster cannot approach this database depth or user base at launch and is not exposed to Vivino's specific weak point (marketplace fulfillment), since Vinster has no commerce layer at all.

### Delectable
**What it does:** Camera-first label scan paired with a social, Instagram-style feed; its defining differentiator is a "follow the pros" model (named sommeliers, winemakers, critics) rather than an anonymous crowd-average.
**Ownership/scale:** Acquired December 2016 by Vinous; at acquisition 1M+ downloads, 120K+ MAU, later cited at 5M+ user reviews.
**Ratings:** No fresh dated figure found this cycle (aggregator sources still cite ~4.7★, unconfirmed by direct store fetch). A long-running WineBerserkers community thread continues to question the app's relevance trajectory relative to Vivino.
**Pricing:** Free core; Premium $5.99/month; ad-removal-only tier at $1.99/month.
**Assessment:** Unchanged this cycle — a smaller, curated, critic-integrated alternative to Vivino, showing visible signs of community-side stagnation relative to more actively-developed competitors.

### CellarTracker
**What it does:** The dominant cellar/inventory management platform for serious collectors, with the category's largest first-party tasting-note corpus.
**Scale:** Founded 2003. 8.8M+ users, 13.6M+ ratings/reviews, 5M+ unique wines, 193–200M+ bottles tracked (~$21B tracked value). Integrates with 20+ professional critic channels and Wine-Searcher pricing across 37,000+ merchants.
**CellarChat (beta, launched July 2025):** GPT-based conversational assistant trained on CellarTracker's own 14M+ tasting notes, answering natural-language cellar-aware pairing questions. Most recent identifiable change found this cycle is a **v2.13.0 update** (UI polish, a "What's Poppin'" quarterly report) — undated precisely in search results, but confirms the product is still actively iterating, unlike Vinster's own repository.
**Ratings:** ~4.9★ (approximate/aggregator-sourced, unconfirmed this cycle).
**Pricing:** Free core; subscription scaling with cellar size (~$5–45/year).
**Complaints:** Dated, utilitarian UI; loss of visibility into some critic feeds post-redesign; a long-standing bug where consumed bottles remain listed as in-cellar; no way to keep a rating fully private.
**Assessment:** Unchanged — the trust/depth leader for serious collectors, more than a year ahead of Vinster on the exact "AI grounded in your own cellar" idea, at a data scale Vinster cannot replicate for years.

### Hello Vino
**What it does:** A beginner-friendly, occasion/food-based guided recommendation flow with a secondary label-scan feature.
**Scale/status:** Long-running, very small operation (~1 employee, no funding ever raised). Still listed/downloadable, not shut down, but showing clear signs of neglect.
**Ratings:** Jancis Robinson's scan-accuracy test scored it just 4/10; when a label isn't recognized, the app offers no way to manually add the wine.
**Pricing:** Free base app with pay-per-scan IAP ($0.99 for 5 scans, $4.99 for unlimited).
**Assessment:** Unchanged — a legacy app coasting on inertia. Low competitive threat, but relevant as a cautionary example of what a stalled, under-resourced wine app looks like several years on — a comparison that applies with more force to Vinster this cycle, given four weeks of its own development inactivity.

### Wine Ring → Preferabli
Rebranded to Preferabli in 2022; now an AI-driven B2B2C recommendation platform spanning wine, beer, and spirits. Recent traction (2025–2026, unchanged this cycle, no new events found): partnership with Albertsons Companies; an AI concierge at Marriott Napa Valley; acquisition of Libation Labs (January 2025); a Series A of roughly $32.8M closed in 2026; a partnership with The Wine Society (UK, June 2026). No new funding, partnership, or product news was found for Preferabli in this cycle's window (2026-08-20 to 2026-09-02) — the most recent confirmed event remains the June 2026 Wine Society deal.
**Consumer app:** Still exists under "Preferabli," but the real business is B2B2C licensing.
**Assessment:** Unchanged — low consumer brand visibility, but a legitimate, well-capitalized, commercially validated AI-recommendation competitor whose underlying technology directly overlaps Vinster's recommendation engine, monetized differently (and successfully).

### Wine Spectator (WineRatings+)
A search/lookup-first app built around Wine Spectator's own 400,000+ expert ratings from its professional blind-tasting panel. Free download; $2.99/month subscription unlocks the full ratings database after a 30-day trial. This cycle's search found the app's Vintage Chart was last updated 2026-08-04 (before this cycle's window) and Wine Spectator published its 2026 Restaurant Awards on 2026-08-31 — editorial content, not an app feature change.
**Assessment:** Unchanged — stable and mature rather than actively innovating; no scan-based discovery, no AI/conversational feature found.

### Sommo — the closest direct functional analog to Vinster
Combines wine label and full wine-list/menu camera scanning, cellar tracking, AI food pairing sourced from a user's own tracked collection, a tasting journal, and WSET exam-prep content — built on a proprietary wine-tuned LLM by a small team. Priced at roughly $5/month or $29.99/year. The major "Sommo 2.0" redesign headlined by a "3D cellar wall" — an orbitable, drag-and-drop 3D rendering of a user's actual racks with drinking-window indicators — was published **2026-08-01**; app store metadata shows a further update on **2026-08-24**, most likely a minor patch rather than a distinct new feature, but confirming the product remains under active iteration into this cycle's window. No numeric App Store/Play rating could be pulled from search snippets this cycle.
**Assessment:** Unchanged and, if anything, reinforced — the single competitor whose feature set most closely mirrors Vinster's stated scope, actively shipping and iterating (even a minor patch is more activity than Vinster's repository has seen in four weeks) while Vinster's own `main` branch remains untouched.

### Other AI-sommelier / combined wine-tech entrants
- **CellarMate.ai** — GPT-4-class conversational cellar management, smart label recognition, receipt scanning, restaurant wine-list analysis. No confirmed fresh launch or update found this cycle; App Store listing/privacy-policy metadata trace to 2025.
- **The Wine Engine ("Grapevine")**, **Swirl**, **InVintory** (3D "VinLocate," sommelier-curated 2M+ wine database, 4.8★ self-reported), **Enolisa**, **Pocket Sommelier** (photo-based food-to-wine pairing, 4.3–4.6★, 100K+ downloads), **SommelierX** (deterministic 19×17-dimension pairing algorithm) — all unchanged this cycle, no new dated news found for any.
- **Newly surfaced this cycle, unverified:** **Gastrona** and **Decanto**, both AI-sommelier-positioned apps referenced only in a rival app's (SommelierX's) own promotional "best wine apps 2026" blog post — a self-interested source with no independent corroboration found. Listed here for completeness and future tracking, not as confirmed competitive threats; their scale, ratings, and even basic legitimacy could not be verified this cycle.
- **Vinomat, Vino AI, WinePairingAI, VinoVoss, Sommelier AI, Cellared, Sommelier.bot (B2B)** — unchanged, see Combined Space section.

**Market sizing:** The "digital wine app" market remains estimated at roughly $1.8B (2025) growing to $4.6B by 2034 (~11% CAGR); no updated figure found this cycle.

---

## Food / Recipe / Pairing Apps

### Samsung Food (formerly Whisk)
Spans 104 countries, 160,000+ recipes; "Food AI" recipe adaptation; Vision AI (Galaxy-only) calorie estimation; CES 2026 Bespoke AI appliance tie-ins. No news dated within this cycle's window — the most recent substantive items found (a Jamie Oliver/Bespoke AI recipe partnership, free calorie-tracking rolled out to all users) both predate 2026-08-20.
**Ratings:** ~4.4–4.8★ depending on source/region (unconfirmed).
**Pricing:** Freemium; Food+ premium $6.99/month or $59.99/year.
**Wine/beverage pairing:** None in the app itself, unchanged.

### Yummly — shut down December 20, 2024
Confirmed again this cycle as fully dead — no revival or relaunch announced by Whirlpool as of this cycle's search. Still cited across multiple current "best Yummly alternatives" content sites as a live demand signal for displaced users.

### SideChef
18,000+ recipes with photo/video steps; LG/AB Electrolux/V-ZUG-backed Series B; RecipeGen AI (photo-to-recipe, beta since Aug 2024). No news dated in this cycle's window beyond routine content marketing.
**Ratings:** Google Play ~4.4★ (~8,150 reviews), 1M+ downloads.
**Pricing:** Free with Premium $4.99/month or $49.99/year.
**Wine/beverage pairing:** None found, unchanged.

### Kitchen Stories
Acquired by Funke Mediengruppe (a large German publisher) on 2025-10-06, alongside Chefkoch, Brigitte, Gala, and Eltern. This cycle's research adds one piece of background context: German coverage indicates Funke separately acquired Chefkoch from RTL as part of the same food-media roll-up strategy — reinforcing, not changing, the prior read that Kitchen Stories is now an editorially-owned asset rather than a product-innovation-driven independent competitor.
**Pricing:** €7.99/month or €79.99/year, 7-day trial. **Ratings:** Inconsistent, ~4.0–4.8★ depending on source. **Wine pairing claim:** still unconfirmed/unverifiable, as in the prior report — treat as unverified.

### Mealime
~1,200 curated recipes, ≤30-minute prep focus, strong dietary filtering, automatic grocery lists. No news dated in this cycle's window; confirmed still to have **zero AI features**, still widely cited among the highest-rated apps in this set (Google Play 4.57★/~26,000 ratings; App Store 4.8★/53,000+ reviews).
**Pricing:** Established as $5.99/month Pro. One aggregator source found this cycle claims Pro was "previously $2.99/month" — this conflicts with the prior-cycle figure and should be treated as unconfirmed aggregator noise, not a verified price change.
**Wine/beverage pairing:** None, unchanged.

### Newer AI recipe/meal-planning entrants
- **Ollie** — best-funded in this niche (Khosla Ventures, Allen Institute for AI); 4.8★/887 reviews, ~90,000+ users. No dated news this cycle. Pricing remains inconsistent across sources ($7/month annual to $10–20/month cited); treat exact current figure as unconfirmed pending Ollie's own site.
- **ChefGPT** — App Store listing now formally titled "ChefGPT: AI Calories Tracker," consistent with the prior cycle's "pivot to calorie-tracking" read, though no fresh press specifically announcing a strategic pivot was found this cycle. Free tier 10 generations/month; Pro $2.99/month.
- **PlantJammer** — no news this cycle; most recent known version (10.6.9) traces to March 2026.
- **RecipeScan** — still **not publicly launched**. Confirmed this cycle still in closed beta, waitlist-only (~4,238 on waitlist per its own site), still targeting a Spring 2026 public launch, unchanged from prior cycles.
- **Newly surfaced this cycle, both outside the core tracked list and unconfirmed at scale:** **Cookie** (AI recipe app, reported launch January 2026) and **Fuudle** (UK entrant with HoloWorld UK, reported launch ~April 2026) — neither has a wine/beverage pairing feature per available sources; both sourced from aggregator/PR-style coverage only.
- **Market sizing:** AI-driven meal-planning app market still estimated at $0.83B (2025) → $1.03B (2026), ~24.6% CAGR; no updated figure found this cycle.

**Cross-cutting finding, reinforced this cycle:** No mainstream or newly-surfaced recipe/meal-planning app researched has ever shipped a confirmed wine or alcohol pairing feature. When this cycle's research specifically searched for "recipe app wine pairing," the results surfaced **separate, dedicated wine-pairing apps** (Gastrona, Vinomat, Decanto, SommelierX) rather than any recipe app adding the capability — a useful sharpening of the prior finding: this gap is being closed from the wine-app side of the market, not the food-app side, which matters directly for how open Vinster's positioning actually is (see Combined Space section).

---

## Combined Wine + Food / Dining Space

**This is the space Vinster claims as its core positioning, and it remains not open.** The same six-to-eight-plus apps identified in prior cycles continue to make functionally overlapping "AI sommelier + food pairing" pitches, several also bundling cellar tools: Vinomat (menu-scan pairing + wine-matched recipe generation), Pocket Sommelier (photo-of-a-meal pairing + menu scanning with a "pairability %" score), Sommo (closest overall analog), SommelierX (deterministic algorithmic pairing), Vino AI, WinePairingAI, VinoVoss, Sommelier AI, and Preferabli (B2B licensing). This cycle adds two more names to track with appropriate caution — **Gastrona** and **Decanto** — both AI-sommelier apps that surfaced only via a competitor's own promotional blog post, unverified by any independent source this cycle.

**Incumbent overlap compounds this, unchanged:** Vivino (70M+ users, $224M raised) already bundles food-pairing suggestions and a conversational AI-sommelier chat into its free core scanning flow.

**No clear category winner has emerged, still.** Independent "best wine apps" roundups continue to recommend stacking specialist apps rather than relying on one all-in-one tool — evidence both of a real opening for a genuinely excellent all-in-one product, and of the fact that nobody, including Sommo, has yet executed well enough to become the obvious default.

**Restaurant-discovery/reservation platforms — still the cleanest open gap found in this report, and still unmoved this cycle.** Neither OpenTable, Resy, nor Yelp added any wine-specific feature in this cycle's window. Yelp's own recent AI features (Menu Vision, Popular Drinks, Yelp Assistant — spring 2026 releases) are broader local-discovery tools, not wine-specific, and predate this cycle's window regardless. ChatGPT's ability to book reservations directly through OpenTable, Resy, and Yelp (reported August 2026, confirmed again this cycle via 9to5Mac and Yelp's own blog) continues to show these platforms are willing to integrate deeply with conversational AI for booking — reinforcing, not weakening, the read that omitting wine features is a deliberate scope choice (these platforms monetize covers/reservations, not wine), not a technology gap.

**The "why not just ask ChatGPT" risk deserves restating, since it bears directly on Vinster's food-pairing pillar.** A San Francisco Chronicle piece found this cycle (published 2026-04-28, predating this window but newly surfaced in this cycle's research) documents Bay Area diners explicitly using ChatGPT and Gemini instead of a sommelier or wine app for pairing advice — direct, on-the-record evidence of the commoditization risk previously discussed in the abstract. Generic pairing text remains the most easily commoditized part of any app in this category, including Vinster's; the defensible value continues to sit in stateful, structured features (an actual cellar inventory, menu-OCR accuracy, a persisted taste profile) rather than in the pairing suggestion itself.

**Funding and shutdowns:** No new wine-tech funding, acquisition, or shutdown news was found dated within this cycle's window. The most recent confirmed events remain Preferabli's ~$32.8M Series A (2026) and Vint's wind-down (June 2026, a fractional wine-investment platform, not a direct analog). A "Scotch" AI liquor-retail-tech startup's $20M Series A surfaced in search results this cycle but is undated and is liquor retail infrastructure, not a wine discovery/pairing/cellar app — noted for completeness, not treated as a direct comparable.

**"Vinster" name/presence check, repeated this cycle:** A direct web search for "Vinster wine app" returned **no App Store listing, no Google Play listing, no press coverage, and no user-facing presence under that name** — only unrelated near-name matches (Vintg, Vinovest, InVintory, Viniou). This is consistent with, and further confirms, the code-level finding that no public build has shipped; it does not on its own change the prior cycle's minor trademark-collision note (a small, apparently dormant "VINSTER" Microsoft Store listing referenced via LinkedIn, and the unrelated French/Spanish fashion brand "V de Vinster"), which was not re-checked this cycle.

**Bottom line for this section, unchanged:** the combined wine+food positioning remains a real, identifiable, and actively-contested segment, not a blank ocean — and a full week's dedicated search for new movement in this exact space turned up nothing besides two unverified new app names and one previously-undocumented piece of direct evidence (the SF Chronicle diner interviews) for a risk already identified.

---

## Feature Comparison Matrix

Vinster is scored strictly on what is verified in the codebase on `main` this cycle, judged on the same yardstick as every other row. "—" = not offered / not found in research. Ratings and pricing are as reported by third-party sources as of early September 2026 and should be spot-checked before external use; several could not be independently confirmed via direct app-store fetch (marked "unconfirmed").

| App | Label/Menu Scan | Cellar/Inventory Mgmt | AI Wine Reco | Food→Wine Pairing | Recipe Generation | Restaurant Reviews | Community/Social | Marketplace/Buy | Rating | Price |
|---|---|---|---|---|---|---|---|---|---|---|
| **Vivino** | Yes (camera) | Yes | Yes ("Match for You" + AI chat) | Yes (chat) | — | — | Yes (large feed) | Yes (major marketplace) | ~4.8★ App Store / ~4.77★ Play / 3.9★ Trustpilot | Free + Premium ~$4.99/mo |
| **Delectable** | Yes (camera) | Yes (journal) | Curated expert scores | — | — | — | Yes (social feed) | Yes (shop) | Unconfirmed (~4.7★ claimed) | Free + $5.99/mo |
| **CellarTracker** | Yes (barcode/label) | Yes (deep, 200M+ bottles) | Yes (CellarChat) | Yes (CellarChat) | — | — | Yes (13.6M+ ratings) | No (price data only) | ~4.9★ (unconfirmed) | Free + ~$5–45/yr |
| **Hello Vino** | Yes (weak, 4/10 test score) | — | Yes (quiz-based) | Yes | — | — | — | — | Unconfirmed | Free + pay-per-scan IAP |
| **Wine Ring / Preferabli** | — | — | Yes (B2B engine) | — | — | — | — | — | N/A (no consumer app rating) | Licensed (B2B2C) |
| **Sommo** | Yes (label + menu) | Yes (3D cellar wall) | Yes | Yes (from own cellar) | — | — | Journal | — | Unconfirmed | Free tier + ~$5/mo |
| **InVintory** | Partial (import) | Yes (3D "VinLocate," 2M-wine DB) | Yes ("Vincent") | Yes (from own cellar) | — | — | — | — | 4.8★ (self-reported) | Free + premium tier |
| **Vinomat** | Yes (menu photo) | — | Yes | Yes | Yes (wine-matched) | — | — | — | Too new to rate | Unconfirmed |
| **Wine Spectator (WineRatings+)** | — | — | Expert database only | — | — | — | — | — | Unconfirmed | Free + $2.99/mo |
| **Samsung Food** | — (food-only Vision AI) | — | — | — | Yes (AI, photo-to-recipe) | — | Recipe sharing | Instacart (hardware-tied) | ~4.4–4.8★ (unconfirmed) | Free + $6.99/mo |
| **Yummly** | — | — | — | — | Was yes | — | Was yes | — | **Shut down Dec 2024** | N/A |
| **SideChef** | Barcode (pantry) | Pantry tracking | — | — | Yes (RecipeGen AI, photo-to-recipe) | — | — | Yes (shoppable) | ~4.4★ (~8.1K, Play) | Free + $4.99/mo |
| **Kitchen Stories** | — | — | — | — (unverified wine-pairing claim) | — (curated) | — | Personal recipe library | — | ~4.0–4.8★ (inconsistent) | Free + €7.99/mo |
| **Mealime** | — | — | — | — | — (human-curated) | — | — | — | 4.57★ Play / 4.8★ App Store | Free + $5.99/mo |
| **Vinster** (this app, pre-launch) | **Yes** — wine-list OCR + label scan + multi-bottle lineup detection, real Claude vision calls (`src/services/ocr.ts`, `supabase/functions/{ocr,scan-label,detect-lineup}`) | **Yes** — racks, diamond bins, cases, storage locations, full CRUD with RLS (`src/api/{bins,racks,storageLocations,cellar}.ts`); **no browsable global wine database** — confirmed again this cycle | **Yes** — `supabase/functions/recommend`, real Claude Sonnet sommelier logic | **Yes** — `food-wine-pairing`, pairs from the user's own cellar or general style | **Yes** — `generate-pairings`, chef-attributed, dietary/allergen-aware | **Yes** — real, multi-axis (food/service/wine-list/overall/atmosphere/value) ratings tied to scan sessions (`app/restaurants/reviews.tsx`, migration `018_restaurant_ratings.sql`) — genuinely rare among all rows above | **Built but disabled** — real schema/API (`src/api/community.ts`) but feature-flagged off (`COMMUNITY_ENABLED = false`, `src/constants/features.ts`) | **No** — Wine-Searcher used read-only for pricing, no checkout flow | **No public rating — zero App Store/Play presence found by direct search this cycle**; `eas.json` shows submission plumbing (an Apple `ascAppId`, a Google Play "internal"-track service account) but no evidence of a shipped or listed build | **No monetisation implemented in code** — no IAP/RevenueCat/Stripe anywhere in the repo, re-confirmed by clean grep this cycle |

**Reading the matrix honestly:** Vinster's checkbox count looks competitive on raw feature breadth against any single competitor, and the underlying code is genuinely functional rather than mocked. But breadth is not maturity: Sommo, CellarTracker, and Vivino each have a materially more mature, actively-iterating version of Vinster's core "AI pairing" idea already shipped; CellarTracker and InVintory both have a browsable reference database Vinster lacks entirely; and the one row where Vinster is genuinely distinctive — structured, multi-axis restaurant reviews — remains a private log with zero real content, not an aggregated discovery product with any network effect.

---

## Market Gaps & Opportunities

1. **Reservation-platform wine gap — fully open, unmoved this cycle.** Neither OpenTable, Resy, nor Yelp has any wine-recommendation or sommelier-AI feature; their willingness to integrate ChatGPT for booking shows this is a deliberate scope choice, not a technology gap — meaning the gap is real but would require restaurant/POS partnerships Vinster has no current code or evidence of pursuing.
2. **The recipe-app side still has never shipped wine pairing**, and this cycle's research sharpens why: when a wine-pairing feature does appear, it appears as a separate, dedicated wine-first app (Gastrona, Vinomat, Decanto, SommelierX), not as a feature added to an existing recipe app. The gap on the food-app side is real; the wine-app side already serves the overlapping need, competitively.
3. **Restaurant reviews through a wine-quality lens remain genuinely underserved** — no reservation or wine app researched offers a comparable structured, multi-axis restaurant rating tied to an actual visit. Vinster's built feature here is real and comparatively rare, but it's a private log today, not a network-effect asset — unchanged this cycle.
4. **No single all-in-one winner has emerged yet**, still — a narrow real opening for a genuinely excellent combined product, contested most directly by Sommo, which continues shipping (even a minor patch update this cycle) while Vinster does not.
5. **Yummly's shutdown continues to leave a live, currently-active pool of displaced users** searching for a new default recipe/meal-planning app — a demand signal in the adjacent food space, not directly transferable to a wine-first pitch.
6. **Mealime's zero-AI stance, and its resulting top-tier ratings, remains a live counter-argument** to "more AI/feature breadth automatically wins" — confirmed unchanged this cycle.

---

## Risks & Where Competitors Are Stronger

Stated plainly, without softening.

1. **Zero market validation, confirmed harder this cycle.** A direct search for "Vinster wine app" returned no App Store listing, no Google Play listing, no press coverage, and no user-facing presence of any kind.
2. **No monetization model exists in the code — still, re-confirmed this cycle.** A clean grep for IAP/RevenueCat/Stripe/paywall logic across the entire repository returned nothing.
3. **Development has now stalled for a full four consecutive weekly cycles — 24 days with zero substantive commits.** Only the weekly report files themselves have landed on `main` since 2026-08-09. This has happened across the same window Sommo shipped a major redesign plus a further patch update, and while the field around Vinster continued, however incrementally, to move.
4. **Sommo is a near-total functional analog** — scan + cellar + pairing + journal + education — built on a proprietary wine-tuned model, with a more visually ambitious cellar-visualization feature than Vinster's diamond-bin geometry, and it is still shipping while Vinster is not.
5. **Vinster has no browsable/searchable global wine reference database**, confirmed again by a direct migration-schema grep this cycle. CellarTracker (5M+ wines), InVintory ("sommelier-curated" 2M+ wines), and Vivino (19.6M+ wines) all have this and treat it as a selling point.
6. **Vivino's scale (70M+ users, 3B+ scans, $224M raised) and CellarTracker's community depth (13.6M+ ratings, $21B tracked value) are moats Vinster cannot approach at launch**, regardless of feature parity.
7. **The "just ask ChatGPT" commoditization risk applies specifically and most directly to Vinster's food-pairing pillar** — and this cycle surfaced direct, on-the-record evidence (a San Francisco Chronicle piece documenting Bay Area diners doing exactly this) rather than only abstract framing.
8. **Vinster's community/social feature is real code but feature-flagged off**, with zero real user-generated content — while CellarTracker, Vivino, and Sommo all have live, growing corpora accumulating in real time.
9. **Recipe generation competes against a maturing, well-funded "agentic" recipe vertical** (SideChef backed by LG/AB Electrolux/V-ZUG; Ollie backed by Khosla Ventures/AI2) that already does materially more on meal-planning and grocery-integration depth than Vinster's one-off, chef-attributed recipe generation attempts to.
10. **Vinomat already ships wine-matched AI recipe generation** as a live, direct feature overlap; this cycle also surfaced two more unverified wine-first apps (Gastrona, Decanto) making similar combined claims.
11. **Wine Ring/Preferabli's history — a decade-plus pivot from consumer app to B2B licensing** — remains a live cautionary data point about the difficulty of monetizing a consumer-only wine-AI app, one Vinster has not yet begun to address in any form.
12. **`eas.json`'s submission plumbing (a real Apple `ascAppId`, a Google Play "internal"-track service account) existing without any corresponding public listing or press mention is itself a minor but notable risk signal** — it suggests submission was configured at some point but not carried through to an actual public release, consistent with the broader four-week stall.
13. **Recipe/food apps, even well-funded ones, keep showing signs of atrophy or shutdown** (Yummly's complete shutdown, Kitchen Stories' absorption into a publisher roll-up, now compounded by Funke's further Chefkoch acquisition) — a reminder that traction and funding do not guarantee survival in this broader category.

---

## Emerging Trends

- **Cellar visualization remains a genuine feature arms race**, and Sommo's continued iteration (a further patch after its 3D cellar wall launch) this cycle underscores that this is not a one-time feature drop but an area competitors keep investing in — one Vinster's diamond-bin geometry participates in but no longer leads on visual sophistication.
- **Computer-vision label/menu scanning remains table stakes, not a differentiator.** Unchanged this cycle.
- **B2B/enterprise AI-sommelier deployments continue to look like the more commercially validated path** relative to thin consumer-app-specific funding — no new evidence either way surfaced this cycle, but no consumer-wine-app funding event was found either, reinforcing the prior read.
- **Conversational-AI distribution continues expanding into adjacent booking/discovery surfaces** (ChatGPT-based OpenTable/Resy/Yelp reservations, confirmed still live this cycle) but still not into wine specifically.
- **Direct evidence of chatbot substitution for sommelier advice is now documented, not just inferred** — the SF Chronicle piece on Bay Area diners using ChatGPT/Gemini instead of a sommelier, surfaced this cycle, is a concrete instance of the "just ask ChatGPT" risk previously discussed only abstractly.
- **The mainstream recipe-app category continues consolidating.** Kitchen Stories' publisher-roll-up trajectory deepened this cycle with the additional detail that Funke also acquired Chefkoch — Vinster's food/recipe pillar is not just competing against stable incumbents, but against a category still actively consolidating around media/publisher ownership rather than product-led competition.
- **A quiet week is itself a data point.** Neither Vinster's own repository nor its ~25 tracked competitors produced material news in this specific 10-day window — useful context for calibrating how much weight to put on any single week-over-week report, including this one.

---

## Recommended Differentiators for Vinster

Each item is marked **BUILT** (verified in the `main` codebase this cycle) or **PROPOSED** (not found in the code — an idea only), with an honest note on defensibility given the research above.

1. **BUILT — A real, working, multi-function Claude-backed AI pipeline** (wine-list OCR, label scan, lineup detection, sommelier recommendation, food-wine pairing, chef-attributed recipe generation, evidence-gated personality sketch) — genuinely functional, not mocked, confirmed by direct code reading again this cycle. **Defensibility: low** as a bare "we have AI" claim (every competitor in this report does too); **moderate** as a breadth/execution claim, since few researched competitors combine this many distinct AI functions end-to-end in one app.
2. **BUILT — Wine-Searcher-grounded real market pricing with live FX conversion**, feeding AI value assessments instead of pure LLM invention (`src/api/wine-searcher.ts`, `supabase/functions/wine-searcher-proxy`). **Defensibility: moderate.** Dependent on a third-party data license Vinster does not own; SommelierX's deterministic-algorithm approach suggests "don't just trust the LLM" is not a uniquely Vinster idea.
3. **BUILT — Diamond-bin tessellation geometry** for physical cellar storage (`src/api/bins.ts`) — real, non-trivial capacity/cell math. **Defensibility: low-moderate.** Genuine craft, but Sommo's continually-iterating 3D cellar wall and InVintory's VinLocate are more visually ambitious executions of the same underlying idea, and are still actively shipping while this has not changed on Vinster's side in four weeks.
4. **BUILT — Multi-axis restaurant reviews** (food/service/wine-list/overall/atmosphere/value, tied to real scan sessions) — `app/restaurants/reviews.tsx`, migration `018_restaurant_ratings.sql`. **Defensibility: moderate-to-high.** Genuinely rare — no wine app or restaurant platform researched offers a comparable structured, wine-specific restaurant rating system. Still a private per-user log today with no network effect, so its competitive value remains latent rather than realized.
5. **BUILT — Chef-attributed recipe generation from a specific wine**, dietary/allergen-aware (`supabase/functions/generate-pairings`). **Defensibility: low.** Vinomat already ships wine-matched AI recipe generation as a live overlap, and this cycle surfaced two more unverified apps (Gastrona, Decanto) making similar claims.
6. **BUILT — An evidence-gated AI "personality"/taste-profile sketch** that refuses to fabricate a read without enough real user data (`supabase/functions/personality`, re-read directly this cycle). **Defensibility: moderate.** This sufficiency-gate design choice was not observed in any competitor researched — a genuinely careful piece of product design, though a UX nicety rather than a hard-to-replicate technical moat.
7. **BUILT-BUT-DISABLED — Community feed** (posts/likes/comments, `src/api/community.ts`, feature-flagged off via `COMMUNITY_ENABLED = false`). **Defensibility: not applicable while disabled** — worth nothing competitively today.
8. **NOT PRESENT / PROPOSED — A browsable global wine reference database or encyclopedia.** Confirmed absent from the schema again this cycle. **Defensibility if built: low**, since CellarTracker, InVintory, and Vivino all already have multi-million-wine reference databases with years of accumulated head start.
9. **PROPOSED — Restaurant-platform/reservation integration** (OpenTable/Resy/Tock-style wine recommendation at the point of booking). **Defensibility if built: potentially high** — still the one gap in this entire report where zero competitors, incumbent or startup, have moved, confirmed unmoved again this cycle. But it requires restaurant/POS partnerships Vinster shows no current evidence of pursuing.
10. **PROPOSED — Any monetization model.** Nothing exists in code today. **Now the single most urgent item in this report, independent of differentiation value**: every competitor profiled with real commercial traction (Vivino, CellarTracker, Sommo, Preferabli, SideChef) has a live pricing/subscription or B2B licensing model; Vinster currently has none, `eas.json` shows only unused submission plumbing, and four straight weeks of zero development activity have not moved this forward.
11. **PROPOSED — Deterministic/structured pairing logic as a complement to generative pairing text**, following SommelierX's explicit differentiation angle, to directly blunt the "just ask ChatGPT" commoditization risk — now backed by direct evidence (the SF Chronicle piece) rather than only inference, making this a somewhat more urgent, not merely theoretical, recommendation than in prior cycles.

**Bottom line for a neutral outside analyst:** Vinster's shipped feature set remains real, technically sound, and unusually broad for a pre-launch app — but nearly every individual capability already has a shipped, funded, or scaled analogue in market, several with a year or more of head start on the exact "AI grounded in your cellar" idea Vinster is betting on. The one clearly rare, code-confirmed feature — multi-axis, wine-specific restaurant reviews — is real but currently inert as a private log with no users. The one clean, unclaimed market gap identified across all research — wine recommendation integrated into restaurant reservation platforms — remains untouched by Vinster and by every competitor alike, and would require partnerships and infrastructure well beyond what currently exists in the codebase. But the finding that should carry the most weight this cycle is not competitive at all: four consecutive weeks — 24 days — of zero substantive commits on `main`, no monetization code, and `eas.json` submission plumbing that has apparently never been used to ship a public build, are entirely within Vinster's own control and are not being addressed, independent of how the external competitive landscape evolves.

---

## Sources

**Wine apps**
- Vivino: https://apps.apple.com/us/app/vivino-drink-the-right-wine/id414461255 , https://www.trustpilot.com/review/vivino.com , https://expandedramblings.com/index.php/vivino-facts-statistics/
- Delectable: https://www.wineberserkers.com/t/how-irrelevant-has-the-delectable-wine-app-become/165052 , https://www.12x75.com/best-wine-apps/
- CellarTracker: https://support.cellartracker.com/article/108-cellarchat , https://www.starkinsider.com/2025/07/ai-wine-pairing-cellartracker.html
- Wine Ring / Preferabli: https://preferabli.com/ , https://wineindustryadvisor.com/2026/06/04/the-wine-society-announces-partnership-with-preferabli/
- Wine Spectator (WineRatings+): https://www.winespectator.com/vintage-charts , https://app-help.winespectator.com/support/solutions/folders/58815
- Sommo: https://sommo.app/blog/sommo-2-0-launch/ , https://apps.apple.com/us/app/sommo-all-in-one-ai-wine-app/id6757319027
- Other AI-sommelier entrants: https://www.winebusiness.com/news/vendor/article/307402 , https://apps.apple.com/us/app/cellarmate-ai/id6747726916 , https://invintory.com/pricing/ , https://mwm.ai/apps/pocket-sommelier-wine-pairing/6503256584 , https://sommelierx.com/blog/best-wine-apps-2026 (source for the unverified Gastrona/Decanto mentions), https://vinomat.app/

**Food/recipe apps**
- Samsung Food: https://www.sammobile.com/news/samsung-food-update-massive-gift-free-users/ , https://news.samsung.com/uk/samsung-partners-with-jamie-oliver-to-create-new-recipe-range-on-bespoke-ai-appliances
- Yummly shutdown: https://mealthinker.com/blog/yummly-alternative , https://www.useladle.com/blog/yummly-alternative
- SideChef: https://www.sidechef.com/press/series-b-funding/ , https://www.businesswire.com/news/home/20240806193505/en/SideChef-Announces-RecipeGen-AI
- Kitchen Stories: https://www.momentum-partner.de/en/2025/10/24/momentum-has-advised-funke-mediengruppe-on-the-acquisition-of-the-international-cooking-platform-kitchen-stories/ , https://meedia.de/news/beitrag/20270-funke-digital-uebernimmt-kitchen-stories.html
- Mealime: https://mealthinker.com/blog/mealime-alternative (aggregator; pricing conflict flagged as unconfirmed)
- Newer entrants: https://article-factory.ai/news/ai-powered-meal-planning-app-ollie-aims-to-ease-family-cooking-stress , https://apps.apple.com/us/app/chefgpt-ai-calories-tracker/id6449961549 , https://recipescam.com/ , https://www.prolificnorth.co.uk/news/new-ai-recipe-app-promises-real-meals-from-kitchen-shrapnel/ (Cookie/Fuudle, unconfirmed)

**Combined space, restaurant platforms, trends, funding**
- Restaurant platforms: https://9to5mac.com/2026/08/10/chatgpt-users-can-now-book-tables-and-join-restaurant-waitlists-through-yelp/ , https://blog.yelp.com/news/yelp-chatgpt-integration/ , https://blog.yelp.com/news/spring-product-release-2026/ , https://explainx.ai/blog/chatgpt-restaurant-reservations-opentable-resy-yelp-august-2026
- Chatbot-substitution evidence: https://www.sfchronicle.com/food/wine/article/ai-sommeliers-bay-area-22081880.php
- Funding/shutdowns: https://richmondbizsense.com/2026/06/22/local-wine-investing-startup-vint-winding-down-operations/ , https://news.crunchbase.com/venture/scotch-raises-ai-funding-liquor-retail-tech/ (adjacent liquor-retail-tech, not a direct analog)
- Vinster name-check: web search for "Vinster wine app" returned no App Store/Play listing or press coverage under that name this cycle

**Vinster (this app) — code sources verified directly on `main`, 2026-09-02**
- `git log --oneline --since=2026-08-26` — only the 08-26 report file's own commit; last substantive commit remains `c15d3c4` (2026-08-09)
- `app.json` (version unchanged at 1.3.4, bundle ID `com.vinster.app`), `eas.json` (confirms `ascAppId: "6763607127"` and a Google Play `track: "internal"` service-account submit config exist, alongside `build` profiles still limited to internal `development`/`preview`/`production` distribution — submission plumbing, not evidence of a shipped public build)
- Grep for `revenuecat|stripe|in-app-purchase|react-native-iap|purchases-react-native` across `src/`, `app/`, `supabase/`, `package.json` — zero matches, re-confirmed this cycle
- Grep for `wine_library|wine_catalog|wine_encyclopedia` across `supabase/migrations/` — zero matches, re-confirmed this cycle
- Direct reading this cycle: `src/services/ocr.ts`, `supabase/functions/personality/index.ts` (Anthropic SDK client, evidence-gate prompt logic), `supabase/functions/recommend/index.ts`, `supabase/functions/wine-searcher-proxy/index.ts`, `src/constants/features.ts` (`COMMUNITY_ENABLED = false`), `src/api/community.ts`, `supabase/migrations/{018,038,085}_restaurant_ratings*.sql`
- `reports/2026-08-26-market-comparison.md` — prior report, read in full and used as the baseline for continuity in this report
