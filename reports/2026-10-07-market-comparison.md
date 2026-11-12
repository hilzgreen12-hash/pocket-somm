# Vinster — Market Comparison: Wine, Food & Combined Wine+Food Apps

**Date:** 2026-10-07
**Prepared by:** Automated Market Research Agent
**Branch analysed:** `main` @ `1ca4c7a` (app.json version `1.6.0`)
**Prior report:** `reports/2026-09-30-market-comparison.md`

**A note on objectivity:** This is internal competitive intelligence, not marketing copy. Vinster's strengths are not inflated and competitors' advantages are not softened. Where a competitor is materially better than Vinster — in scale, data depth, funding, ratings, community, or polish — that is stated directly. Every Vinster feature cited below as "built" was independently re-verified against the actual code on `main` this cycle (file paths cited throughout); anything not found in the code is marked **PROPOSED**, not built.

**What changed in the code since 2026-09-30:** Nothing. The only commit on `main` since the prior cycle is the addition of last week's report itself (`1ca4c7a`) — zero application code changed, app version remains `1.6.0`, `COMMUNITY_ENABLED = false` is still set in `src/constants/features.ts`, and a repo-wide search again found no RevenueCat/Stripe/IAP library, no paywall code, and no test files (`*.test.*`, `*.spec.*`, `__tests__`) anywhere.

**A correction/refinement from this cycle's deeper code read:** Prior reports described Vinster's cellar-aware capability only in terms of `generate-pairings` (the chef-recipe generator) not yet reading cellar state, and framed "cellar-aware recipe generation" as the single clearest white space. A closer read this cycle of `supabase/functions/food-wine-pairing/index.ts` (via `src/api/label.ts:findFoodWinePairing`) shows that function already has a dedicated **`mode: 'cellar'`** path: given a dish, it is sent the user's actual cellar wines — including `drinking_window_status` and `purchase_price` — and is explicitly instructed to "prioritise wines at 'peak' or 'approaching' drinking window" when choosing 1–3 bottles to recommend. **This means cellar-aware wine *pairing* (dish → which bottle in your cellar to open) is already built**, not merely proposed — functionally comparable to CellarTracker's CellarChat and InVintory's "Vincent." The gap that remains genuinely open is narrower than previously stated: it is specifically **cellar-aware *recipe generation*** — `generate-pairings` still takes only a single wine object (producer/region/vintage/style) and has no path that reads cellar/drinking-window data to design a recipe around a specific aging bottle. This narrows, but does not eliminate, Vinster's most-cited potential differentiator — see Market Gaps and Recommended Differentiators below, both updated accordingly this cycle.

**What changed in the market this cycle:** Three parallel research passes (wine apps, food/recipe apps, combined wine+food space) covering the week since 2026-09-30 found the market overwhelmingly static — the large majority of "new" hits surfaced by search tools turned out to predate the window or to be marketing-blog restatements of old news. The one well-sourced, genuinely new development is **Santé's $15M Series A** (announced 2026-10-06, see below). Mealime's scheduled October 21, 2026 shutdown remains on track per secondary sources (no primary Albertsons statement independently confirmed this cycle). A seed-funded new entrant, **Clove** (Canva-alumni-founded AI cooking platform, pre-launch), surfaced as a minor adjacent signal. Everything else — ratings, pricing, feature sets for Vivino, Delectable, CellarTracker, Hello Vino, Sommo, InVintory, Vinomat, Samsung Food, SideChef, Kitchen Stories — is unchanged from last cycle within the noise of conflicting third-party aggregator snapshots.

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

Vinster remains a genuinely functional, feature-deep pre-launch app, and this cycle's deeper code read strengthens that picture in one specific respect while narrowing it in another. It strengthens it because cellar-aware wine *pairing* — not just generic food pairing — turns out to already be built: `food-wine-pairing`'s `cellar` mode sends a user's actual bottles (with drinking-window status and purchase price) to Claude and asks it to pick the best match, prioritising wines approaching their peak. That is a real, working instance of the exact "AI sommelier that knows your cellar" capability that CellarTracker (CellarChat), Sommo, and InVintory ("Vincent") already ship. It narrows the picture because that same discovery makes clear this capability is not unique to Vinster — at least three to four competitors already do a version of it, some at vastly larger scale (CellarTracker: 200M+ bottles tracked). The genuinely rare, still-unbuilt piece is narrower than previously framed: tying *recipe generation* specifically (not pairing) to real cellar/drinking-window state — e.g., designing a dish around the three bottles in a user's cellar that are past their peak. No competitor identified across four research cycles does that well, including Vinomat (recipes tied to one bottle, not a cellar) and InVintory/Sommo (cellar-aware pairing, no recipe generation).

The rest of this cycle's findings are a story of stasis, not change. A full repo audit found zero application-code changes since the prior cycle: no monetization code, no test coverage, and the social/community layer remains built but switched off (`COMMUNITY_ENABLED = false`). On the market side, three parallel research passes covering the week since 2026-09-30 found the landscape almost entirely unchanged — most "new" results search tools surfaced were stale items re-surfacing under misleading "recent" framing. The one well-sourced genuine update is **Santé's $15M Series A** (Oct 6, 2026, FINTOP-led, ~1,000 retailers, $2B GMV claimed) — further confirmation that capital in this space is still flowing to B2B wine/liquor-retail infrastructure, not consumer pairing apps. Mealime's October 21 shutdown (folding into Albertsons' "Meals Hub") remains on schedule. A late-2026 third-party wine-app roundup's blunt verdict from prior cycles still holds and was not contradicted by anything found this week: "No single app does all of this well, and any product that tells you otherwise is selling you something." The founder should continue to read this plainly: the individual engineering is real and the exact combined wine+food+cellar bundle is not replicated end-to-end by any single incumbent today — but that gap persists because the full bundle is hard to execute well, not because nobody has tried pieces of it, and the narrowest genuinely defensible slice (cellar-aware recipe generation specifically) remains unbuilt and unshipped by anyone, Vinster included.

---

## Wine Apps

### Vivino
**What it does:** The category's largest crowdsourced wine database and social ratings feed, camera label scanning, a personalized "Match for You" score, an integrated wine marketplace, cellar tracking, and — under Premium — "Vivino Sommelier," an AI chat feature and a wine-list scanner.
**Scale:** The unambiguous category leader; tens of millions of users.
**Ratings:** Reported figures continue to conflict across aggregators this cycle — Google Play is consistently ~4.7★ (~227–231K reviews), but Apple figures range from 4.7–4.8★ with review counts cited anywhere from ~127K to ~548K depending on source. Treat the Play figure as the more reliable of the two; the Apple figure as directionally "high 4s," not a precise number.
**Pricing:** Freemium; Premium ≈ $4.99/month or $47.90/year (varies by region).
**Recent developments:** No new funding/M&A found. Vivino's most recent substantive product update (mid-2026, predates this report's window) added a Cellar redesign, an "AI Sommelier" facelift, and Apple Visual Intelligence integration (scanning wines via Apple's own tool against Vivino's database) — a reminder that Vivino is actively investing in exactly the AI-scan capability Vinster is built around, from a position of much greater data scale.
**Assessment:** Unchanged from last cycle: the scale and data leader by a wide margin, now integrating its AI sommelier even more tightly with platform-level tools (Apple Visual Intelligence) in a way a pre-launch entrant cannot match.

### Delectable
**What it does:** Camera-first label recognition built around a social feed of verified sommeliers, winemakers, and critics rather than crowd averages; a personal wine journal; also covers beer and spirits; integrated Vinous critic reviews under Premium. Owned by Antonio Galloni's Vinous since 2016.
**Ratings:** ~4.7★ App Store (~26K ratings); ~3.9★ Google Play (~6K reviews).
**Pricing:** Free, with a Premium tier for Vinous reviews, priority transcription, and no ads.
**Recent developments:** No news found in 2026 beyond stable version metadata; this remains the quietest app in this report on the news front.
**Assessment:** Unchanged — a smaller, curated alternative whose critic-credibility differentiator is durable but whose own food-pairing feature remains weak by reviewer consensus.

### CellarTracker
**What it does:** The dominant cellar-inventory and tasting-note platform for serious collectors — bottle tracking, valuation, drinking-window guidance, and a tasting-note corpus in the tens of millions. Shipped **"CellarChat"** (AI pairing chat, beta) in July 2025, letting users ask for dish pairings sourced from their own logged cellar.
**Scale:** Passed 200M bottles tracked / 100M bottles opened per an April 2026 milestone release. Founder Eric LeVine told press in May 2026 the company is profitable and self-sustaining.
**Ratings:** ~4.8–4.9★ across most storefronts, with one EU listing showing a materially lower 4.7★/738 reviews — a reminder that regional storefront ratings can diverge meaningfully and headline figures shouldn't be taken as universal.
**Pricing:** Freemium; paid tiers from ~$40/year to ~$500/year unlocking valuation, drinking windows, and CellarChat.
**Recent developments:** No new funding or feature launch found this cycle; the April milestone and May interview both predate the report window.
**Assessment:** Unchanged, and this cycle's deeper Vinster code read makes the comparison sharper, not softer: CellarChat's core mechanic — ask for a pairing, get a recommendation sourced from your own logged cellar, weighted toward drinking-window status — is functionally the same pattern Vinster's `food-wine-pairing` cellar mode implements. CellarTracker just does it against a dramatically larger, more mature data corpus (200M+ tracked bottles vs. Vinster's as-yet-unlaunched user base).

### Hello Vino
**What it does:** One of the earliest wine-recommendation apps — a simple, jargon-free guided flow rather than scan-first discovery.
**Ratings:** ~4.6★ App Store (~6.7K); ~3.3★ Google Play (~930) — much weaker on Android.
**Pricing:** Free with ads; small one-time IAPs rather than a subscription.
**Recent developments:** No 2026 update or news found at all this cycle — the quietest, least-maintained app profiled in this report.
**Assessment:** Unchanged — limited current relevance as a direct threat, mainly useful as a reminder that food-first recommendation framing predates AI by over a decade.

### Sommo
**What it does:** An "all-in-one" pocket sommelier — AI label and restaurant wine-list scanning, virtual cellar management, a personal tasting journal, a WSET-aligned education module, and AI food pairing reasoning over the user's own cellar. Single-founder product, launched late 2025.
**Ratings:** 4.9★ App Store (~17 ratings — still statistically negligible); 4.5 Trustpilot (~18 reviews).
**Pricing:** Free tier (5 lifetime scans); Premium ~$4.99/month or ~$2.50/month effective annually.
**Recent developments:** An App Store Japan listing references a "2.0" redesign (3D wine wall, "Open Tonight" ranking feature) and a HarmonyOS build, but no independently dated release note confirms this happened within the report window — flagged as thin/unconfirmed, not a verified recent launch.
**Assessment:** Unchanged — still the closest single pure-wine-app match to Vinster's scope, still a non-threat by scale, still proof that a solo developer can ship the full feature set.

### Wine Spectator (WineRatings+)
**What it does:** Access to Wine Spectator's professional critic database and editors' picks.
**Ratings:** ~4.6–4.65★ (~900 ratings, iOS-focused).
**Pricing:** 30-day trial, then $2.99/month.
**Recent developments:** No news found this cycle; third-party aggregators disagree on the app's last-updated date (May vs. February 2026) with no substantive story behind either.
**Assessment:** Unchanged — a stable editorial-authority reference tool, not an AI feature competitor.

### The wider "Somm AI"-branded and B2B wave
The fragmented cluster of similarly-named small apps (Somm AI: Wine Menu Scanner, Somm AI – Wine Expert, sommai.io, aisomm.io) is unchanged this cycle. This cycle's research surfaced several additional AI label-scanning/sommelier apps not previously catalogued — **CorkAI, WineDiscovery, Wine Scanner, SOMM DIGI AI, Wineries.AI** — all launched earlier in 2026 (March–July), not within this report's window; they are noted here for completeness, not as new activity, and none has independent press coverage beyond app-intelligence aggregator listings (mwm.ai). Their existence reinforces the prior finding that the consumer AI-sommelier sub-category is crowded and low-differentiation at the branding level.

On the B2B side, **Santé** is this cycle's one confirmed genuine update: it closed a **$15M Series A on October 6, 2026**, led by FINTOP Capital with returning investors Bonfire Ventures, Operator Collective, and Y Combinator, six months after its $7.6M seed (February 2026). Santé now claims roughly 1,000 retailer customers and $2B in annualized GMV processed, with reported 500% growth. **Scotch**'s $20M Series A (VMG Partners-led) and **VinoBuzz**'s ~$10M valuation angel round both remain as previously reported — both predate this window by several months despite initially surfacing in "recent funding" searches; this is a useful caution that search recency signals for funding news can mislead. **Vinolin** and **Sommelier.bot**, both cited in prior reports, could not be independently corroborated this cycle under those exact names/spellings — flagged as a sourcing gap carried over, not resolved. **Wine Ring**'s reported shutdown remains entirely unverified either way — no reporting of any kind (shutdown or continued operation) was found post-2016; this should be treated as an open question, not a settled fact, until someone checks the live app stores or winering.com directly.
**Assessment:** Santé's rapid six-month seed-to-Series-A progression (and its 500% growth claim) is the clearest signal in this entire report that capital conviction in wine-tech is accelerating specifically on the B2B retail-infrastructure side, not the consumer pairing-app side — a trend that has now been reconfirmed, not just stated once, across two consecutive report cycles.

---

## Food / Recipe / Pairing Apps

### Samsung Food (formerly Whisk)
**What it does:** Samsung's flagship AI food/recipe platform — recipe import, "Smart Cook" guided cooking, AI-personalized meal plans, Vision AI food-photo calorie estimation, SmartThings appliance integration.
**Scale:** 6M+ users, 4.5M-member recipe community.
**Ratings:** Aggregator snapshots conflict (4.6–4.8★ iOS depending on source/date; ~4.6★ Play, ~22K reviews) — consistent with, not materially different from, prior figures.
**Pricing:** Free tier; Samsung Food+ at $6.99/month or $59.99/year.
**Recent developments:** No new feature launch, funding, or acquisition found this cycle; most recent substantive update (Recipe Builder autocomplete) predates the window (Oct 2025). Notably, Samsung's wine-AI investment remains confined to its **physical smart fridges** (Bespoke "Sommelier At Home," a ~$4,280 "AI Wine Manager" fridge with SmartThings-based bottle recognition) — hardware, not the Samsung Food app itself. This is a real, if narrow, confirmation that Samsung has wine-AI capability in its ecosystem but has still not brought it into its mainstream recipe app.
**Assessment:** Unchanged from last cycle — the best-resourced, most hardware-integrated food app researched, still with no wine pairing inside the app itself, still the most likely single competitor to add one quickly if it ever prioritized it.

### Yummly — discontinued December 20, 2024
No change this cycle. Still shut down, still no relaunch, still a cautionary precedent for well-funded corporate-owned food/AI apps.

### SideChef
**What it does:** 16,000+ recipes, voice-guided cook mode, **RecipeGen AI** (photo-of-dish → recipe), barcode pantry scanning.
**Ratings:** ~4.7★ App Store; Play Store figures now show closer to 4.3★ in some aggregator snapshots versus last cycle's 4.4★ — within normal cross-aggregator noise, not treated as a material change.
**Pricing:** Free app; Premium $4.99/month or $49.99/year.
**Recent developments:** No funding or feature news found this cycle; last confirmed funding remains a $6M Series B from March 2023, with no acquisition since.
**Assessment:** Unchanged — RecipeGen AI remains the clearest live evidence that photo-to-recipe AI is real but still immature, a relevant caution for Vinster's own vision-AI pipeline.

### Kitchen Stories
**What it does:** A large editorial recipe library (~7,500 recipes), a widely imitated "Cook Mode," deliberately non-AI.
**Ratings:** ~4.8★ App Store holds steady across trackers. **Google Play shows a wider spread than previously reported** — some aggregators now show 3.4–4.0★ rather than the 4.1★ figure cited last cycle, with review counts ranging 31K–34K depending on snapshot date. This may reflect a genuine recent softening on Android, or simply inconsistent tracker methodology (iOS/Android listing titles differ slightly, and it's unclear whether all trackers are measuring the identical product) — flagged as worth re-checking directly rather than treated as confirmed decline.
**Pricing:** Free base app; Kitchen Stories Plus at €7.99/month or €79.99/year.
**Recent developments:** Acquired by FUNKE Digital in October 2025 (predates this window); no new developments found since.
**Assessment:** Largely unchanged, with one open question flagged above on Android rating trend — worth monitoring in future cycles rather than treating as resolved either way.

### Mealime — shutting down October 21, 2026
**Status this cycle:** Remains on schedule, with no delay found. Secondary sources (meal-planning competitor blogs — swoodie.app, pann-app.com, cookbookmanager.com, ultimatemealplans.com, incheckfit.com) consistently describe: app discontinues Oct 21, 2026; Pro subscriptions made free and will not renew; no data-export tool provided; recipes/functionality folding into "Meals Hub" inside Albertsons-family grocery apps (Albertsons, Safeway, Vons, Jewel-Osco), reportedly built by the same core team. **Caveat carried over and sharpened this cycle:** no mainstream or trade press (TechCrunch, Supermarket News, Progressive Grocer) coverage was found at all — every source is a competing app's own blog with a direct commercial incentive to promote the shutdown narrative (they sell themselves as "Mealime alternatives"). Sources also disagree on whether Meals Hub requires proximity to a physical Albertsons-family store or works nationwide, and on the acquisition year (2021 vs. 2022 — Albertsons' own December 2021 press release on meal-planning integration is the more reliable anchor). Mealime's own closing page could not be independently fetched this cycle (blocked by network egress policy).
**Assessment:** The underlying conclusion from prior cycles holds and should not be softened: even the highest-rated, highest-review-volume standalone food app in this entire report is still being folded into a retailer's owned ecosystem rather than surviving independently — but readers of this report should know that the specific Oct 21 date and Meals Hub mechanics rest entirely on secondary, commercially-interested sourcing, not a primary company statement independently verified by this research.

### Other notable and emerging entrants
**PlateJoy** (shut down July 2025 into RVO Health's "Wellos") and **Plant Jammer** (€4M raised, 100,000+ households) are unchanged this cycle, with no new 2026 news found for either. One new signal worth flagging at low confidence: **"Clove,"** a pre-launch AI cooking platform founded by Canva alumni, reportedly closed a seed round — the only source found garbled the headline figure (one outlet's "$415M" figure for what is explicitly described as a seed round is almost certainly a parsing/reporting error and should not be repeated as fact without independent confirmation). Other 2026 entrants found (Snapshot Recipes, Kooking, Appetizer) show no funding or notable traction signal and are included only for completeness.
**Pattern across this whole category, reconfirmed:** the three-shutdown pattern (Yummly, PlateJoy, Mealime pending) stands unchanged, and still no food/recipe app researched across any cycle — including this one — has a native wine or beverage-pairing feature. This remains a clean, verifiable white space relative to mainstream recipe apps specifically.

---

## Combined Wine + Food / Dining Space

This remains the segment most directly relevant to Vinster's stated positioning, and this cycle's research — while finding almost nothing dated within the actual report window — surfaced enough additional detail to sharpen, not soften, the "not empty" conclusion of prior cycles.

**Direct combined competitors — status this cycle:**
- **Sommo** — unchanged; see Wine Apps above. An unconfirmed App Store Japan listing references an "Open Tonight" ranking feature in a possible "2.0" redesign, but timing is not verified.
- **InVintory** ("VinLocate" + "Vincent") — unchanged from last cycle's profile. One detail surfaced this cycle (per InVintory's own blog, dated June 2026 — i.e., not new this week, just not previously catalogued): Vincent can now add/edit/remove cellar bottles via natural-language conversation, not just recommend pairings from existing entries. Company-blog-only sourcing; no independent coverage.
- **Vinomat** — unchanged; still ~1,000 downloads, 4.4★, no funding news found at all.
- **Pocket Sommelier** — a naming-ambiguity risk surfaced this cycle: multiple similarly-named apps exist ("Pocket Sommelier: Wine Pairing," "Wine Find: Pocket Sommelier," "PocSomm," "Pocket Wine Pairing: Sommelier"). Prior reports' 4.3★ figure should be treated as approximate and tied to a specific listing that may not be the only one in circulation — a sourcing caution for anyone citing this app externally.
- **Newly catalogued (not newly launched):** this cycle's research surfaced several smaller combined-space apps not previously listed, all launched earlier in 2026 and sourced only from app-store aggregators (no independent press): **Wine Pairing Cellar** (dish pairing + "check wines you own" + shop finder, Jul 2026), **Cellared** (cellar + meal pairing + drinking-window calc + CellarTracker import, May 2026 — previously listed as a cellar app but its pairing feature wasn't previously noted), **MaiCellar** (photograph a dish, get a pairing from your own cellar, Apr 2026), **Saignée** (cellar + AI food pairing/recipes, undated), **Pour Decisions** and **Vinage** (simpler scan/pairing apps, undated). Also surfaced: **Sommify** (Helsinki, retail AI sommelier) and **WineCab** (hardware+AI cellar robot) — neither confirmed as recently launched.
**Verdict on direct overlap, reconfirmed and sharpened:** the "no single perfect superset match, but the combination is already assembled across several named competitors" conclusion from prior cycles holds, and if anything looks more crowded than previously documented now that MaiCellar and Saignée — both doing dish-photo-or-text → cellar-aware pairing — are catalogued. **MaiCellar in particular is now the closest single competitor match to Vinster's own `food-wine-pairing` cellar-mode mechanic** (photograph/describe a dish, get a recommendation from your actual cellar) found in any research cycle to date.

**Restaurant-discovery and reservation apps:** OpenTable, Resy, and Yelp are unchanged this cycle — still editorial-only on wine (OpenTable, Resy) or food-only on computer vision (Yelp's Menu Vision). No wine-specific AI feature found at any of the three, and none at DoorDash or Instacart either, reconfirming last cycle's finding rather than contradicting it.

**Funding, launches, shutdowns:** Santé's $15M Series A (Oct 6, 2026 — see Wine Apps above) is the one hard update. Vint's wind-down is now confirmed to be actively proceeding (G2 Capital and SimpleClosure engaged for asset sale/dissolution) rather than merely announced — a incremental but not qualitatively new data point.

**"Best wine app" roundups:** No new independently-authored, rigorous roundup was found this cycle. One single-author blog piece favoring Sommo disclosed receiving a free premium subscription from the app — a conflict of interest worth noting for anyone citing that source, and a reminder (consistent with prior cycles' caution about SEO-driven "best app" content) that enthusiasm in this space's own coverage should be read skeptically.

**Objective verdict — is "wine + food + cellar in one app" a white space or crowded?** Unchanged, and if anything reinforced: **closer to crowded and easily replicated than to white space.** This cycle adds two more named competitors (MaiCellar, Saignée) doing cellar-aware dish-to-wine pairing specifically, on top of the four to five already identified in prior cycles (CellarTracker/CellarChat, Sommo, InVintory/Vincent, Vivino/Vivino Sommelier). The narrowest genuinely underserved sliver remains, as in prior cycles, **generative recipe creation tied to a persistent, personal cellar inventory** specifically — not cellar-aware pairing, which multiple competitors (and, this cycle's code read confirms, Vinster itself) already do.

---

## Feature Comparison Matrix

| App | Category | Label/List Scan (camera) | AI Recommendations/Chat | Cellar / Rack-Location Mgmt | Food Pairing | Recipe Generation | Community/Social | Rating (approx.) | Price |
|---|---|---|---|---|---|---|---|---|---|
| **Vinster** | Combined | **BUILT** — Claude vision OCR, list + label (`supabase/functions/ocr`, `scan-label`) | **BUILT** — Claude sommelier engine using real profile data (`supabase/functions/recommend`) | **BUILT** — racks, diamond/triangle bins, fridges, cases (`src/api/bins.ts`, `src/api/racks.ts`) | **BUILT, cellar-aware** — dish → best bottle from actual cellar, weighted by drinking-window status (`supabase/functions/food-wine-pairing`, `mode: 'cellar'`) | **BUILT, but not cellar-aware** — single-wine-keyed, 50+ named chefs (`supabase/functions/generate-pairings`) | **BUILT but disabled** (`COMMUNITY_ENABLED = false`) | No public listing found | No pricing/IAP code exists |
| Vivino | Wine | Yes (label; list under Premium) | Yes ("Vivino Sommelier" chat) | Yes | Yes (reported generic) | No | Yes (largest crowd DB) | ~4.7★ Play (~230K); Apple figure disputed across sources (4.7–4.8★) | Free + $4.99/mo |
| Delectable | Wine | Yes (label) | No | No | Yes (weak, "brutally simplistic" per reviewers) | No | Yes (pro/critic network) | 4.7★ iOS (~26K) / 3.9★ Play (~6K) | Free + Premium |
| CellarTracker | Wine/Cellar | No | Yes ("CellarChat," 2025, cellar-aware pairing) | Yes (deepest data, 200M+ bottles tracked) | Yes (via CellarChat) | No | Yes (tasting-note corpus in the tens of millions) | ~4.8-4.9★ (varies by storefront) | Free + $40-$500/yr |
| Hello Vino | Wine | Yes (secondary) | Yes (guided, basic) | No | Basic | No | No | 4.6★ iOS / 3.3★ Play | Free + small IAPs |
| Sommo | Combined | Yes | Yes | Yes | Yes (against own cellar) | No | No | Too new to rate (~17-18 reviews) | Free tier + $2.50-4.99/mo |
| InVintory | Combined | Yes | Yes ("Vincent," now also edits cellar via chat) | Yes (VinLocate 3D rack/bin) | Yes | No | No | Not found | Not confirmed |
| Vinomat | Combined | Yes (menus) | Limited | No | Yes (score-based) | Yes (bottle-specific, not cellar-aware) | No | 4.4/5 | Not confirmed |
| MaiCellar | Combined | No (dish photo, not wine label) | Yes | Implied (cellar-based) | Yes (cellar-aware, dish photo → pairing) | No | No | Not found (sourcing thin) | Not confirmed |
| Wine Spectator (WineRatings+) | Wine | No | No | No | No | No | No | 4.6-4.65★ (~900) | Free + $2.99/mo |
| Samsung Food | Recipe | No (ingredient photo, not wine) | Yes (meal planning) | No | No | Yes (import + AI plans) | No | ~4.6-4.8★ iOS / ~4.6★ Play | Free + $6.99/mo |
| SideChef | Recipe | No (dish photo → recipe) | Limited | No | No | Yes (RecipeGen AI, inconsistent accuracy) | No | 4.7★ iOS / ~4.3-4.4★ Play | Free + $4.99/mo |
| Kitchen Stories | Recipe | No | No | No | No | No (editorial only) | No | 4.8★ iOS / 3.4-4.1★ Play (disputed) | Free + Plus tier |
| Yummly | Recipe | No (**shut down Dec 2024**) | — | — | — | — | — | 4.8★ (historical) | — |
| Mealime | Recipe | No (**shutting down Oct 21, 2026**) | Limited | No | No | No | No | 4.8★ iOS / 4.6-4.7★ Play | Free (Pro made free pre-shutdown) |

*Ratings/prices are the most precise figures found via web search as of October 2026; several figures (Vivino's Apple rating, Kitchen Stories' Play rating, Samsung Food/SideChef Play ratings) show meaningful cross-aggregator disagreement this cycle and should be treated as directional, not exact. Live App Store/Play figures could not be independently fetched from this environment (restricted network egress to apps.apple.com/play.google.com) and should be re-verified before external use.*

---

## Market Gaps & Opportunities

1. **Cellar-aware recipe generation specifically — narrower than previously framed, and still the clearest gap.** This cycle's code read confirms Vinster's `food-wine-pairing` cellar mode already does cellar-aware *pairing* (dish → best bottle from your cellar, weighted by drinking-window status) — a capability CellarTracker, Sommo, InVintory, and now MaiCellar also ship in some form. The genuinely open gap is narrower: no competitor identified across four research cycles — including Vinomat (recipes tied to one named bottle, not a persistent cellar) — generates a *recipe* designed around a user's actual aging cellar bottles. Vinster's `generate-pairings` engine and cellar data model both exist but are not wired to each other this way today. This remains the single most defensible, narrowly-scoped opportunity identified, now more precisely targeted than in prior cycles.
2. **Restaurant wine-list scanning + food pairing in one flow, at the table.** Unchanged from prior cycles — a real strength, not a unique one (Sommo, Pocket Sommelier, and now MaiCellar-style dish-photo flows all attempt versions of it).
3. **Wine pairing remains a clean white space relative to mainstream recipe apps specifically.** Reconfirmed this cycle — none of Samsung Food, SideChef, Kitchen Stories, Mealime, Yummly, or PlateJoy added a wine/beverage pairing feature in the research window, and Samsung's own wine-AI investment remains confined to hardware (smart fridges), not its recipe app.
4. **Editorial/no-AI polish still wins loyalty.** Unchanged — Kitchen Stories' continued following despite zero AI features remains a useful positioning reminder.
5. **Restaurant-discovery platforms still haven't built sommelier tooling, but the adjacent tech keeps advancing.** Unchanged — Yelp's Menu Vision remains food-only; no wine-specific extension found this cycle.

---

## Risks & Where Competitors Are Stronger

Stated plainly, without hedging:

- **Data moat.** Unchanged and, if anything, sharper: CellarTracker's 200M+ tracked bottles and Vivino's tens of millions of users dwarf anything Vinster can offer at launch.
- **Brand and distribution.** Unchanged — Vivino, Samsung Food, and CellarTracker all have distribution advantages Vinster currently has none of; still no public App Store/Play listing found for Vinster this cycle.
- **Cellar-aware AI pairing is confirmed, not just suspected, to no longer be Vinster's alone — and this cycle's own code read sharpens that risk rather than softening it.** Vinster's `food-wine-pairing` cellar mode is functionally the same pattern as CellarTracker's CellarChat, InVintory's Vincent, and (newly catalogued this cycle) MaiCellar's dish-photo-to-cellar-pairing flow. At least four to five competitors now do a version of this, several at vastly larger data scale.
- **Monetization remains completely unbuilt.** Unchanged — zero pricing/IAP code exists anywhere in the repository, reconfirmed again this cycle.
- **Community/social remains built but off.** Unchanged — `COMMUNITY_ENABLED = false`, zero live user-generated content, while Vivino, CellarTracker, and Delectable all run live social layers that drive retention.
- **Standalone recipe/meal apps continue to be absorbed into retailer/hardware ecosystems.** Unchanged, and Mealime's Oct 21 shutdown remains on track per secondary sourcing — the clearest structural headwind in this report for any independent food-adjacent app without a parent-company ecosystem to fall back into.
- **Consumer wine-tech capital remains thin relative to B2B infrastructure, and this gap widened rather than narrowed this cycle.** Santé's jump from a $7.6M seed to a $15M Series A in six months, with 500% reported growth, is a concrete acceleration signal on the B2B side; no comparable acceleration was found anywhere on the consumer wine+food app side this cycle.
- **Zero automated test coverage.** Unchanged — no test files found anywhere in the repository, still a real engineering-risk gap independent of market positioning.
- **Reliability remains a known unsolved problem industry-wide, not just for Vinster.** Unchanged — SideChef's RecipeGen AI hallucination/omission issues remain the clearest documented instance; Vinster's own Claude-vision pipeline has not been independently tested at scale.
- **New this cycle: a previously-cited differentiator is weaker than earlier reports implied.** Prior cycles' framing of "cellar-aware pairing" as something Vinster was building toward understated how far along it already is — which is good news for engineering progress, but bad news for differentiation, since it means Vinster has already arrived at a capability several well-funded competitors already ship at far larger scale, rather than being ahead of them.

---

## Emerging Trends

- **Generative AI in food/recipe apps remains mainstream, not novel.** Unchanged this cycle — no new large-scale AI feature launch found among the major players, consistent with a maturing rather than accelerating trend.
- **Recipe-app consolidation into retailer/hardware ecosystems continues on schedule.** Mealime's Oct 21 shutdown remains on track; no new consolidation events found this cycle, but no reversal either.
- **B2B "AI sommelier/retail infrastructure as a service" is accelerating, not just persisting.** Santé's six-month seed-to-$15M-Series-A progression (500% reported growth) is the clearest acceleration signal in this report. This reconfirms, with sharper evidence, the prior cycles' observation that investor conviction in wine-tech sits with B2B infrastructure, not consumer pairing apps.
- **Cellar-aware AI pairing is now a multi-vendor pattern, not a single-vendor innovation.** This cycle adds MaiCellar and Saignée to the previously identified CellarTracker/Sommo/InVintory/Vivino cluster, and confirms via code read that Vinster's own `food-wine-pairing` cellar mode belongs in this same cluster — a capability that has gone from "notable" to "table stakes among AI-forward wine apps" within the span of this report's research cycles.
- **Star ratings remain a weak, and this cycle an even more visibly inconsistent, signal.** Multiple apps (Vivino's Apple rating, Kitchen Stories' Play rating, SideChef's Play rating) show materially different figures across third-party aggregators within the same week of research — a methodological caution that should temper confidence in any single cited star rating throughout this report, this cycle's included.
- **New signal, low confidence: continued early-stage investor interest in adjacent AI-cooking platforms.** Clove's reported seed round (exact amount unverified) suggests investor interest in AI-native cooking products persists even as mid-market players (Yummly, PlateJoy, Mealime) shut down — a reminder that capital can still back new entrants in a category even while exiting incumbents, which cuts both ways for how investors might view a new wine+food entrant too.

---

## Recommended Differentiators for Vinster

Each item below is explicitly marked **BUILT** (verified in the code on `main` this cycle) or **PROPOSED** (not found in code), with an honest defensibility read informed by this cycle's competitive research.

1. **Cellar-aware recipe generation — PROPOSED (narrower and more precisely scoped than previously stated), the one remaining clear opportunity.** Cellar-aware wine *pairing* is now confirmed **BUILT** (`supabase/functions/food-wine-pairing`, `mode: 'cellar'`) and is no longer a unique claim — several competitors already ship versions of it, most recently joined by MaiCellar and Saignée in this cycle's research. What remains genuinely unbuilt and still rare across every competitor researched is wiring the *recipe generator* (`supabase/functions/generate-pairings`) to the same cellar/drinking-window data its pairing sibling already consumes — e.g., designing a dish specifically around a bottle nearing the end of its drinking window. **Defensibility: moderate.** This is a smaller, more precisely targeted lift than previously described (the pairing-side plumbing already exists and proves the pattern works), but it is correspondingly less novel as a headline claim, since the adjacent "cellar-aware AI" positioning is now visibly crowded.

2. **In-restaurant scan-to-pairing flow — BUILT.** Unchanged. **Defensibility: low-to-moderate**, unchanged from last cycle — the pattern itself is not unique.

3. **Diamond-bin/spatial cellar modeling — BUILT.** Unchanged. **Defensibility: low**, unchanged — InVintory's VinLocate remains a comparable, arguably more mature, visualization concept.

4. **Price-integrity discipline (never showing an AI-invented price) — BUILT.** Unchanged. **Defensibility: moderate**, unchanged — still a legitimate, quietly defensible trust claim no competitor in this research was found to advertise.

5. **Wine-library browsing UI — PROPOSED (backend exists, no user-facing browse screen).** Re-verified this cycle: `wines_catalog` is still used only for predictive search typeahead on the home screen (`app/(tabs)/index.tsx`), not a dedicated browse experience. **Defensibility: low technical lift, moderate value**, unchanged.

6. **Community/social layer — BUILT but disabled, not a current differentiator.** Unchanged. **Defensibility: none until launched**, unchanged, and the gap versus incumbents' live social layers has not narrowed.

7. **Monetization model — PROPOSED, entirely unbuilt.** Unchanged. Still a blocking gap, not a differentiator.

8. **Automated test coverage — PROPOSED, entirely unbuilt.** Unchanged. Still flagged as an engineering-risk gap that bears directly on how safely item 1 above can be built without regressions, since it would touch both the pairing and recipe-generation functions simultaneously.

9. **"AI sommelier that knows your cellar" as a headline pitch — now confirmed weaker than prior cycles suggested, not recommended as-is.** This cycle's code read confirms Vinster has actually arrived at this capability (via the pairing function), which is a genuine engineering win — but it also confirms the claim is now made, in some form, by at least five competitors (CellarTracker, Vivino, Sommo, InVintory, and newly, MaiCellar), one of them (CellarTracker) at a scale of 200M+ tracked bottles. Leading with this framing is now less, not more, defensible than it looked two cycles ago. The narrower, more genuinely rare pitch remains: **"the only app that designs a recipe around the specific bottles already aging in your cellar"** — once item 1 above is actually wired up — paired with the price-integrity guarantee (item 4) as a trust differentiator. Until item 1 is built, Vinster should avoid leading with the cellar-aware-pairing claim alone, since it is now a parity feature, not a differentiator.

---

## Sources

**Vinster codebase (internal, `main` @ `1ca4c7a`):** `package.json`; `app.json`; `app/(tabs)/index.tsx`; `src/constants/features.ts`; `src/api/label.ts` (`findFoodWinePairing`); `supabase/functions/food-wine-pairing/index.ts` (`buildCellarPrompt`, `mode: 'cellar'`); `supabase/functions/generate-pairings/index.ts` (`buildPrompt`, single-wine-keyed); `src/api/bins.ts`, `src/api/racks.ts`; repo-wide search for `revenuecat|stripe|react-native-iap|in-app-purchase` (no matches) and `*.test.*`/`*.spec.*`/`__tests__` (no matches); `git log` since `reports/2026-09-30-market-comparison.md` (one commit, report-only).

**Wine apps:**
- https://finsmes.com/2026/10/sante-raises-15m-in-series-a-funding.html
- https://www.prnewswire.com/news-releases/sante-raises-15m-series-a-to-expand-the-first-ai-operating-system-for-wine--spirits-retail-302900251.html
- https://tipranks.com/news/private-companies/sante-secures-15-million-series-a-to-scale-ai-driven-operating-system-for-wine-and-spirits-retailers
- https://appshunter.io/ios/app/vivino/id414461255
- https://oresundstartups.com/get-instant-overview-wine-lists-restaurants-vivino-realeases-new-feature/
- https://www.rutlandherald.com/news/business/cellartracker-tops-200-million-bottles-tracked-and-100-million-opened-shaping-how-people-choose-what/article_5c91b9d5-c273-5b96-baa5-c9ae87bd5877.html
- https://mwm.ai/apps/corkai/6756794700 (and sibling mwm.ai listings for WineDiscovery, Wine Scanner, SOMM DIGI AI, Wineries.AI)
- https://apps.apple.com/jp/app/id6757319027
- https://saascity.io/de/live/sommo-the-all-in-one-ai-wine-app
- Prior-cycle sources for Vivino, Delectable, CellarTracker, Hello Vino, Sommo, Wine Spectator, Santé/Scotch/VinoBuzz seed rounds, and Wine Ring carried forward unchanged from `reports/2026-09-30-market-comparison.md`.

**Food/recipe apps:**
- https://www.incheckfit.com/blog/mealime-alternative
- https://swoodie.app/blog/mealime-shutting-down
- https://ultimatemealplans.com/reviews/mealime
- https://www.pann-app.com/blog/is-mealime-shutting-down
- https://cookbookmanager.com/post/mealime-closing-alternatives
- https://turi2.de/?p=4079969
- https://www.cbinsights.com/company/kitchen-stories
- https://www.sidechef.com/press/series-b-funding/
- https://www.sammobile.com/news/samsung-food-update-editing-recipes-easier/
- https://the-gadgeteer.com/2026/03/31/a-4280-wine-fridge-that-knows-every-bottle-inside/
- https://www.toptenreviews.com/this-samsung-fridge-could-be-your-very-own-sommelier
- https://www.capitalbrief.com/briefing/canva-alumni-raise-415m-for-ai-powered-cooking-platform-clove (figure disputed/likely erroneous — see Food Apps section)
- https://www.accessnewswire.com/newsroom/en/healthcare-and-pharmaceutical/the-end-of-%22whats-for-dinner%22-mdce-launches-ai-app-that-thinks-li-1142167
- Prior-cycle sources for Samsung Food, Yummly, SideChef, Kitchen Stories, Mealime, PlateJoy, Plant Jammer carried forward unchanged from `reports/2026-09-30-market-comparison.md`.

**Combined space, funding, trends:**
- https://invintory.com/blog/ai-wine-assistant-vincent-updates/
- https://mwm.ai/apps/id/6480037842 (Vinomat)
- Wine Pairing Cellar, Cellared, MaiCellar, Saignée, Pour Decisions, Vinage, Sommify, WineCab — sourced via app-intelligence aggregators (mwm.ai, appfollow.io); no independent press found for any.
- https://travellingcorkscrew.com.au (Sommo favorite-app piece — discloses a free premium subscription; conflict of interest noted)
- Prior-cycle sources for OpenTable, Resy, Yelp Menu Vision, DoorDash, Instacart, Vint wind-down, and the broader wine-app market-sizing figures carried forward unchanged from `reports/2026-09-30-market-comparison.md`.

*Note: several ratings/figures above could not be independently cross-checked against live App Store/Google Play listings from this environment (network egress to apps.apple.com/play.google.com was restricted) and are drawn from third-party aggregators and search-result summaries citing those listings. Treat precise star ratings and review counts as directionally accurate, not exact. Wine Ring's shutdown status, the exact identity/rating of "Pocket Sommelier" given multiple similarly-named apps, Vinolin's and Sommelier.bot's independent existence, and the Clove funding figure are all flagged inline above as thin, unverified, or disputed and should be independently checked before being treated as settled fact.*
