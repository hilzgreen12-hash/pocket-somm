# Vinster — Market Comparison: Wine, Food & Combined Wine+Food Apps

**Date:** 2026-10-14
**Prepared by:** Automated Market Research Agent
**Branch analysed:** `main` @ `81e8ef1` (app.json version `1.6.0`)
**Prior report:** `reports/2026-10-07-market-comparison.md`

**A note on objectivity:** This is internal competitive intelligence, not marketing copy. Vinster's strengths are not inflated and competitors' advantages are not softened. Where a competitor is materially better than Vinster — in scale, data depth, funding, ratings, community, or polish — that is stated directly. Where Vinster is a late, small, or undifferentiated entrant, that is stated directly too. Every Vinster feature cited below as "built" was independently re-verified against the actual code on `main` this cycle (file paths cited throughout); anything not found in the code is marked **PROPOSED**, not built.

**What changed in the code since 2026-10-07:** Nothing. `git log 1ca4c7a..HEAD` on the prior report's commit range shows only one commit (`81e8ef1`, the addition of last week's report itself). No application code changed. App version remains `1.6.0`. `COMMUNITY_ENABLED = false` is still set (`src/constants/features.ts:6`). A repo-wide search again found no RevenueCat/Stripe/`react-native-iap`/in-app-purchase library anywhere, and no test files (`*.test.*`, `*.spec.*`, `__tests__`) anywhere. `supabase/functions/generate-pairings/index.ts` still takes no cellar or `drinking_window` parameter — confirmed again by direct grep this cycle — while `supabase/functions/food-wine-pairing/index.ts`'s `mode: 'cellar'` path still builds its prompt directly from the user's cellar wines, including `drinking_window_status` and purchase price, instructing the model to "Prioritise wines at 'peak' or 'approaching' drinking window." The code-side picture is therefore identical to last cycle's: cellar-aware wine *pairing* is built; cellar-aware *recipe generation* is not.

**What changed in the market this cycle — one genuinely material finding:** Three research passes (wine apps, food/recipe apps, combined wine+food space) covering the week since 2026-10-07 again found the landscape mostly static — Vivino, CellarTracker, and Samsung Food each turned up no news dated to this window at all, only their own stable historical record. The one concrete, independently verifiable change is about **Vinster itself, not a competitor**: a live App Store listing now exists (`apps.apple.com/app/id6763607127`, "Vinster — Your AI Sommelier," free, designed for iPad) and a Google Play package (`com.vinster.app`) is tracked by a third-party aggregator (chrome-stats.com). This reverses prior cycles' repeated finding of "no public listing found." No star rating or review count is visible yet on either listing — consistent with a brand-new or soft-launched listing with negligible volume, not yet a public reputation signal either way. Separately, this cycle's research resolves a sourcing flag carried since 2026-09-30: "Clove" 's seed round, previously disputed at a likely-erroneous "$415M" headline figure, is confirmed by consistent, independent Australian business press (mi-3.com.au, Business News Australia, Forbes Australia) to be **$4.15 million**, raised in **December 2023** — not a new 2026 raise at all. This correction should be carried forward and the prior "low-confidence new signal" framing retired.

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

The headline development this cycle is about Vinster's own market presence, not a competitor's: for the first time across this report series, Vinster has a live, findable App Store listing (`id6763607127`, "Vinster — Your AI Sommelier," free, iPad-designed) and a Google Play package being tracked by at least one third-party app-intelligence aggregator. The listing's own description — wine-list scanning with top-three picks reasoned by taste and budget, home-cellar tracking with AI "intel" cards (value, critic scores, drinking window), and a "Chef" food-pairing feature — matches the codebase closely and should be read as a genuine soft-launch signal, not a placeholder. It carries no visible star rating or review count yet, which is unsurprising for a brand-new listing and should not be read either way as a reputation signal. This matters because it changes one of this report series' most-repeated risk lines ("no public App Store/Play listing found") from true to false, and it means the next research cycle should start tracking Vinster's own ratings and reviews the same way it tracks every competitor — the yardstick this report insists on applying evenly now has real data to apply it to.

Everything else is close to stasis, continuing a pattern now running two consecutive cycles. A full repo audit again found zero application-code changes since last week: no monetization code, no test coverage, and the social/community layer remains built but switched off (`COMMUNITY_ENABLED = false`). On the market side, dedicated searches on Vivino, CellarTracker, and Samsung Food each surfaced no news dated to this window — only their stable historical record, already catalogued in prior cycles. Santé's October 6 Series A (reported last cycle) has no follow-up news this week. The one other concrete finding is a correction, not a change: "Clove" 's reported seed round, flagged in two prior cycles as a disputed, possibly-erroneous "$415M" figure, is now confirmed by consistent independent press to be $4.15M from December 2023 — a minor, already-old item, not a fresh 2026 signal, and the prior report's hedge on it should be retired rather than repeated. The underlying structural picture — the combined wine+food+cellar bundle is not replicated end-to-end by any single incumbent, but the exact cellar-aware-pairing slice of it is now a multi-vendor pattern (CellarTracker, Sommo, InVintory, MaiCellar, and Vinster's own `food-wine-pairing` cellar mode), while cellar-aware *recipe generation* specifically remains unbuilt by everyone, Vinster included — is unchanged from last cycle and should be read as the stable baseline this report keeps returning to, not as evidence the opportunity has grown or shrunk.

---

## Wine Apps

### Vivino
**What it does:** The category's largest crowdsourced wine database and social ratings feed, camera label scanning, a personalized "Match for You" score, an integrated wine marketplace, cellar tracking, and — under Premium — "Vivino Sommelier," an AI chat feature and a wine-list scanner.
**Scale:** The unambiguous category leader; tens of millions of users; one current Vivino-owned page claims 70M+ users of its scanner/ratings/community (an on-platform marketing claim, not independently audited).
**Ratings:** Figures continue to conflict across aggregators — Google Play is consistently cited around ~4.7★ (~227–231K reviews); Apple figures range 4.7–4.8★ with review counts cited anywhere from ~127K to ~548K depending on source. Treat the Play figure as the more reliable of the two; the Apple figure as directionally "high 4s," not a precise number.
**Pricing:** Freemium; Premium ≈ $4.99/month or $47.90/year (varies by region).
**Recent developments:** No news dated to this report's window (Oct 7–14, 2026) was found. Vivino's most recent substantive product news (the Apple Visual Intelligence integration and Cellar/AI-sommelier facelift) predates this window by months, as previously reported. Search results this cycle otherwise returned only historical funding coverage (2016 seed, 2021 $155M Series D) with no current-year news attached.
**Assessment:** Unchanged — the scale and data leader by a wide margin, continuing to out-invest any pre-launch entrant on exactly the AI-scan capability Vinster is built around.

### Delectable
**What it does:** Camera-first label recognition built around a social feed of verified sommeliers, winemakers, and critics rather than crowd averages; a personal wine journal; also covers beer and spirits; integrated Vinous critic reviews under Premium. Owned by Antonio Galloni's Vinous since 2016.
**Ratings:** ~4.7★ App Store (~26K ratings); ~3.9★ Google Play (~6K reviews) — carried forward, unchanged.
**Pricing:** Free, with a Premium tier for Vinous reviews, priority transcription, and no ads.
**Recent developments:** No news found this cycle, continuing its pattern as the quietest app in this report on the news front.
**Assessment:** Unchanged — a smaller, curated alternative whose critic-credibility differentiator is durable but whose own food-pairing feature remains weak by reviewer consensus.

### CellarTracker
**What it does:** The dominant cellar-inventory and tasting-note platform for serious collectors — bottle tracking, valuation, drinking-window guidance, and a tasting-note corpus in the tens of millions. Shipped "CellarChat" (AI pairing chat, beta) in July 2025, letting users ask for dish pairings sourced from their own logged cellar.
**Scale:** Passed 200M bottles tracked / 100M bottles opened per an April 2026 milestone release.
**Ratings:** ~4.8–4.9★ across most storefronts, with at least one regional listing showing a materially lower figure (~4.7★) — a reminder that regional storefront ratings diverge.
**Pricing:** Freemium; paid tiers from ~$40/year to ~$500/year unlocking valuation, drinking windows, and CellarChat.
**Recent developments:** No new funding or feature launch dated to this window. A dedicated search this cycle for CellarTracker funding/news turned up only historical rounds (a disputed ~$510K–$2M total across 2021–2025 raises, per conflicting third-party aggregators) and a March 2026 article on shifting member wine-buying trends — not new this week, and not a funding event.
**Assessment:** Unchanged. CellarChat's core mechanic — ask for a pairing, get a recommendation sourced from your own logged cellar, weighted toward drinking-window status — remains functionally the same pattern Vinster's `food-wine-pairing` cellar mode implements, at a vastly larger and more mature data scale.

### Hello Vino
**What it does:** One of the earliest wine-recommendation apps — a simple, jargon-free guided flow rather than scan-first discovery.
**Ratings:** ~4.6★ App Store (~6.7K); ~3.3★ Google Play (~930) — much weaker on Android.
**Pricing:** Free with ads; small one-time IAPs rather than a subscription.
**Recent developments:** No update or news found at all this cycle — remains the quietest, least-maintained app profiled in this report.
**Assessment:** Unchanged — limited relevance as a direct threat.

### Sommo
**What it does:** An "all-in-one" pocket sommelier — AI label and restaurant wine-list scanning, virtual cellar management, a personal tasting journal, a WSET-aligned education module, and AI food pairing reasoning over the user's own cellar. Single-founder product, launched late 2025.
**Ratings:** Still statistically negligible (prior cycles: ~17–18 App Store ratings).
**Pricing:** Free tier (limited lifetime scans); Premium ~$2.50–4.99/month depending on term.
**Recent developments:** No newly dated update found this cycle. An unconfirmed App Store Japan listing referencing a "2.0" redesign (3D wine wall, "Open Tonight" feature) remains exactly as unverified as last cycle — no independent confirmation surfaced.
**Assessment:** Unchanged — still the closest single pure-wine-app match to Vinster's scope, still a non-threat by scale, still proof a solo developer can ship the full feature set.

### Wine Spectator (WineRatings+)
**What it does:** Access to Wine Spectator's professional critic database and editors' picks.
**Ratings:** ~4.6–4.65★ (~900 ratings, iOS-focused).
**Pricing:** 30-day trial, then $2.99/month.
**Recent developments:** No news found this cycle.
**Assessment:** Unchanged — a stable editorial-authority reference tool, not an AI feature competitor.

### The wider "Somm AI"-branded wave, and B2B infrastructure
The fragmented cluster of similarly named small apps continues to grow rather than consolidate. This cycle's research surfaced several more entrants not previously catalogued in this report series: **Wine AI – Scan & Track**, **My Cellar: AI Wine Scanner**, **Life with Wines 2**, and a Taiwan App Store listing for **AISommelier** — on top of the already-catalogued CorkAI, WineDiscovery, Wine Scanner, SOMM DIGI AI, and Wineries.AI. None of these has independent press coverage beyond app-store listings and app-intelligence aggregators (mwm.ai). Their continued accumulation, cycle over cycle, reinforces rather than contradicts the prior finding that the consumer AI-sommelier sub-category at the branding level is crowded and low-differentiation — a new similarly-scoped app surfaces in nearly every research pass.

On the B2B side, **Santé**'s $15M Series A (announced October 6, 2026, reported last cycle) has no follow-up news this week — a dedicated search for Santé-specific coverage this cycle returned only the same October 6 announcement, re-indexed across aggregator sites, with one source (AlleyWatch) citing a total funding figure of $22.6M and naming an investor (TipTop VC) not named in other coverage of the same round — a minor sourcing discrepancy worth flagging, not a new development. **Vine Ring**'s shutdown status remains entirely unverified either way, carried forward unresolved.
**Assessment:** Unchanged from last cycle's conclusion — capital conviction in wine-tech continues to look stronger on the B2B retail-infrastructure side than the consumer pairing-app side, and nothing this cycle moves that picture in either direction.

---

## Food / Recipe / Pairing Apps

### Samsung Food (formerly Whisk)
**What it does:** Samsung's flagship AI food/recipe platform — recipe import, "Smart Cook" guided cooking, AI-personalized meal plans, Vision AI food-photo recognition, SmartThings appliance integration.
**Scale:** 6M+ users, 4.5M-member recipe community (per prior-cycle figures, unchanged).
**Ratings:** ~4.6–4.8★ iOS (source-dependent); ~4.6★ Play, ~22K reviews — carried forward.
**Pricing:** Free tier; Samsung Food+ at $6.99/month or $59.99/year.
**Recent developments:** A dedicated search this cycle for Samsung Food news dated to October 2026 returned nothing newer than the app's original August 2023 global-launch coverage. No new feature, funding, or acquisition news found. Samsung's wine-AI investment remains confined to its physical smart fridges (the ~$4,280 "AI Wine Manager" Bespoke fridge), not the Samsung Food app itself — unchanged from prior cycles.
**Assessment:** Unchanged — the best-resourced, most hardware-integrated food app researched, still with no wine pairing inside the app itself.

### Yummly — discontinued December 20, 2024
No change this cycle. Still shut down, still no relaunch.

### SideChef
**What it does:** 16,000+ recipes, voice-guided cook mode, "RecipeGen AI" (photo-of-dish → recipe), barcode pantry scanning.
**Ratings:** ~4.7★ App Store; Play Store figures continue to show cross-aggregator spread (4.3–4.4★) — unchanged, within normal noise.
**Pricing:** Free app; Premium $4.99/month or $49.99/year.
**Recent developments:** No funding or feature news found this cycle; last confirmed funding remains a $6M Series B from March 2023.
**Assessment:** Unchanged — RecipeGen AI remains the clearest live evidence that photo-to-recipe AI is real but still immature, a relevant caution for Vinster's own vision-AI pipeline (OCR/label scanning).

### Kitchen Stories
**What it does:** A large editorial recipe library (~7,500 recipes), a widely imitated "Cook Mode," deliberately non-AI.
**Ratings:** ~4.8★ App Store holds steady; Google Play continues to show a wider cross-aggregator spread (3.4–4.1★) than other apps in this report — flagged again, still unresolved, still worth a direct storefront check in a future cycle rather than treated as settled.
**Pricing:** Free base app; Kitchen Stories Plus at €7.99/month or €79.99/year.
**Recent developments:** No new developments found since the October 2025 FUNKE Digital acquisition (predates this report's scope by a year).
**Assessment:** Unchanged.

### Mealime — reported shutdown October 21, 2026
**Status this cycle:** This is now one week before the claimed shutdown date, and a fresh, dedicated search this cycle (rather than a search for generic "meal planning app" news) returned **zero results mentioning Mealime, an Albertsons "Meals Hub," or any October 21, 2026 date at all** — notably thinner than even last cycle's secondary-source-only coverage. The only Albertsons-adjacent material surfaced was unrelated 2026 store-closure and Kroger-merger-collapse news, and historical (2019) coverage of Albertsons' separate "Plated" meal-kit brand. This is a meaningful gap, not a confirmation either way: it may simply reflect that generic search terms missed the same niche blogs (swoodie.app, pann-app.com, etc.) that carried the story last cycle, or it may reflect those sites' coverage aging out of freshly-indexed results. **This should be treated as an open flag for next cycle specifically:** if the October 21 shutdown is real, independent or even secondary confirmation should become easier to find, not harder, as the date approaches; its continued absence this close to the date is itself worth noting rather than silently re-asserting last cycle's unverified narrative.
**Assessment:** The structural point from prior cycles — even a well-rated, high-review-volume standalone food app folding into (or being absorbed by) a retailer ecosystem — stands as a pattern regardless of this specific app's exact fate, but the specific Mealime/Oct 21 claim should now be read with more, not less, skepticism than previously stated.

### Other notable and emerging entrants
**PlateJoy** (shut down into RVO Health's "Wellos") and **Plant Jammer** are unchanged this cycle, with no new news for either. **Clove** (the Canva-alumni AI recipe-marketplace startup) — see Executive Summary above: its reported seed round is now confirmed, via consistent Australian business press, as **$4.15M, closed in December 2023**, not a recent 2026 raise and not $415M. This resolves the sourcing flag carried in the two prior reports and should not be re-cited as a "new signal" going forward. No evidence of a public Clove beta launch or further funding was found this cycle.
**Pattern across this whole category, reconfirmed:** no food/recipe app researched across any cycle — including this one — has a native wine or beverage-pairing feature. This remains a clean, verifiable white space relative to mainstream recipe apps specifically.

---

## Combined Wine + Food / Dining Space

This remains the segment most directly relevant to Vinster's stated positioning. This cycle's research found no new entrants, funding events, or feature launches dated to the window, and existing profiles are carried forward with re-verification where searched.

**Direct combined competitors — status this cycle:**
- **Sommo** — unchanged; see Wine Apps above.
- **InVintory** ("VinLocate" + "Vincent") — a fresh search this cycle on Vincent surfaced detail not newly dated but worth sharpening in this report's record: InVintory has shipped an **MCP (Model Context Protocol) server**, letting users connect their wine collection to Claude, ChatGPT, or Gemini directly, so they can ask about their cellar from whatever general-purpose AI assistant they already use, without opening the InVintory app at all. This is a materially different integration strategy from Vinster's (and most competitors') approach of building a dedicated in-app chat UI — it is a notable, if narrow, technical differentiator worth tracking, since it sidesteps the "another app's AI chat" fatigue by meeting users where they already are. Collection-management-via-chat (add/edit/remove bottles through natural language) and web-app parity for Ask Vincent/Vincent Preferences, both reported previously, are reconfirmed, not new.
- **Vinomat** — unchanged; still ~1,000 downloads, 4.4★, no funding news found.
- **Pocket Sommelier** — the naming-ambiguity caveat from last cycle (multiple similarly-named apps) stands, unverified further this cycle.
- **MaiCellar, Saignée, Wine Pairing Cellar, Cellared** — unchanged from last cycle's profiles; no new coverage found for any.

**Vinster's own market presence — the material change this cycle:** as detailed in the Executive Summary, Vinster now has a live, free App Store listing and a tracked Google Play package. This is the single most consequential finding in this report for how future cycles should be scoped: Vinster is no longer purely a pre-launch internal product for the purposes of this competitive analysis — it has (or very recently has had) a public storefront presence, even without visible ratings or reviews yet. Future cycles should attempt to track Vinster's own review volume and rating the same way every competitor in this report is tracked, and should flag honestly if and when real user reviews start surfacing praise or complaints, exactly as this report does for every other app.

**Restaurant-discovery and reservation apps:** OpenTable, Resy, and Yelp are unchanged this cycle — still editorial-only on wine (OpenTable, Resy) or food-only on computer vision (Yelp's Menu Vision). No wine-specific AI feature found at any of the three, nor at DoorDash or Instacart.

**Funding, launches, shutdowns:** No new event dated to this window beyond Santé (already reported last cycle, no follow-up this week) and the Clove correction (resolves an old item, is not a new one).

**Objective verdict — is "wine + food + cellar in one app" a white space or crowded?** Unchanged from last cycle: **closer to crowded and easily replicated than to white space.** The same five-to-six-competitor cluster (CellarTracker/CellarChat, Sommo, InVintory/Vincent, Vivino/Vivino Sommelier, MaiCellar, Saignée) already does some version of cellar-aware pairing. The narrowest genuinely underserved sliver remains, as in prior cycles, **generative recipe creation tied to a persistent, personal cellar inventory** specifically — not cellar-aware pairing, which multiple competitors (and Vinster itself) already do.

---

## Feature Comparison Matrix

| App | Category | Label/List Scan (camera) | AI Recommendations/Chat | Cellar / Rack-Location Mgmt | Food Pairing | Recipe Generation | Community/Social | Rating (approx.) | Price |
|---|---|---|---|---|---|---|---|---|---|
| **Vinster** | Combined | **BUILT** — Claude vision OCR, list + label (`supabase/functions/ocr`, `scan-label`) | **BUILT** — Claude sommelier engine using real profile data (`supabase/functions/recommend`) | **BUILT** — racks, diamond/triangle bins, fridges, cases (`src/api/bins.ts`, `src/api/racks.ts`) | **BUILT, cellar-aware** — dish → best bottle from actual cellar, weighted by drinking-window status (`supabase/functions/food-wine-pairing`, `mode: 'cellar'`) | **BUILT, but not cellar-aware** — single-wine-keyed, 50+ named chefs (`supabase/functions/generate-pairings`) | **BUILT but disabled** (`COMMUNITY_ENABLED = false`) | **No rating/review count visible yet** — live App Store (`id6763607127`) and Google Play (`com.vinster.app`) listings now exist, both too new to show public figures | Free (per App Store listing); no pricing/IAP code exists in the repo |
| Vivino | Wine | Yes (label; list under Premium) | Yes ("Vivino Sommelier" chat) | Yes | Yes (reported generic) | No | Yes (largest crowd DB) | ~4.7★ Play (~230K); Apple figure disputed (4.7–4.8★) | Free + $4.99/mo |
| Delectable | Wine | Yes (label) | No | No | Yes (weak, per reviewers) | No | Yes (pro/critic network) | 4.7★ iOS (~26K) / 3.9★ Play (~6K) | Free + Premium |
| CellarTracker | Wine/Cellar | No | Yes ("CellarChat," cellar-aware pairing) | Yes (deepest data, 200M+ bottles tracked) | Yes (via CellarChat) | No | Yes (tasting-note corpus in the tens of millions) | ~4.8–4.9★ (varies by storefront) | Free + $40–$500/yr |
| Hello Vino | Wine | Yes (secondary) | Yes (guided, basic) | No | Basic | No | No | 4.6★ iOS / 3.3★ Play | Free + small IAPs |
| Sommo | Combined | Yes | Yes | Yes | Yes (against own cellar) | No | No | Too new to rate (~17–18 reviews) | Free tier + $2.50–4.99/mo |
| InVintory | Combined | Yes | Yes ("Vincent," now also edits cellar via chat; MCP to Claude/ChatGPT/Gemini) | Yes (VinLocate 3D rack/bin) | Yes | No | No | Not found | Not confirmed |
| Vinomat | Combined | Yes (menus) | Limited | No | Yes (score-based) | Yes (bottle-specific, not cellar-aware) | No | 4.4/5 | Not confirmed |
| MaiCellar | Combined | No (dish photo, not wine label) | Yes | Implied (cellar-based) | Yes (cellar-aware, dish photo → pairing) | No | No | Not found (sourcing thin) | Not confirmed |
| Wine Spectator (WineRatings+) | Wine | No | No | No | No | No | No | 4.6–4.65★ (~900) | Free + $2.99/mo |
| Samsung Food | Recipe | No (ingredient photo, not wine) | Yes (meal planning) | No | No | Yes (import + AI plans) | No | ~4.6–4.8★ iOS / ~4.6★ Play | Free + $6.99/mo |
| SideChef | Recipe | No (dish photo → recipe) | Limited | No | No | Yes (RecipeGen AI, inconsistent accuracy) | No | 4.7★ iOS / ~4.3–4.4★ Play | Free + $4.99/mo |
| Kitchen Stories | Recipe | No | No | No | No | No (editorial only) | No | 4.8★ iOS / 3.4–4.1★ Play (disputed) | Free + Plus tier |
| Yummly | Recipe | No (**shut down Dec 2024**) | — | — | — | — | — | 4.8★ (historical) | — |
| Mealime | Recipe | No (**reported shutdown Oct 21, 2026 — unconfirmed this cycle**) | Limited | No | No | No | No | 4.8★ iOS / 4.6–4.7★ Play | Free (Pro reportedly made free pre-shutdown, per unconfirmed secondary sources) |

*Ratings/prices are the most precise figures found via web search as of October 2026; several figures show meaningful cross-aggregator disagreement and should be treated as directional, not exact. Live App Store/Play figures could not be independently fetched from this environment (restricted network egress to apps.apple.com/play.google.com) and should be re-verified before external use.*

---

## Market Gaps & Opportunities

1. **Cellar-aware recipe generation specifically — unchanged, the clearest remaining gap.** No competitor identified across five research cycles — including Vinomat (recipes tied to one named bottle, not a persistent cellar) — generates a *recipe* designed around a user's actual aging cellar bottles. Vinster's `generate-pairings` engine and cellar data model both exist but are not wired to each other this way today, confirmed again by this cycle's direct code re-check.
2. **Restaurant wine-list scanning + food pairing in one flow, at the table.** Unchanged — a real strength, not a unique one (Sommo, Pocket Sommelier, MaiCellar-style dish-photo flows all attempt versions of it).
3. **Wine pairing remains a clean white space relative to mainstream recipe apps specifically.** Reconfirmed this cycle — Samsung Food, SideChef, Kitchen Stories, Mealime, Yummly, and PlateJoy show no sign of adding a wine/beverage pairing feature.
4. **Editorial/no-AI polish still wins loyalty.** Unchanged — Kitchen Stories' continued following despite zero AI features remains a useful positioning reminder.
5. **"Meet the user in their own AI assistant" is a newly salient pattern worth watching.** InVintory's MCP server (connecting a user's cellar to Claude/ChatGPT/Gemini rather than building a standalone chat UI) is a different integration model from what Vinster or most other competitors in this report do. It is not yet proven to drive retention or differentiation, but it is a genuinely distinct strategic bet worth tracking rather than ignoring.

---

## Risks & Where Competitors Are Stronger

Stated plainly, without hedging:

- **Data moat.** Unchanged: CellarTracker's 200M+ tracked bottles and Vivino's tens of millions of users dwarf anything Vinster can offer, even now that Vinster has a live storefront presence — a listing with zero visible reviews is not remotely comparable to an established data/community moat.
- **Brand and distribution.** Vivino, Samsung Food, and CellarTracker all have distribution advantages Vinster has none of. Vinster's new App Store/Play listings change "no public presence" to "public presence with no visible traction yet" — a real but still very early-stage improvement, not parity.
- **Cellar-aware AI pairing is confirmed, not just suspected, to no longer be Vinster's alone.** Unchanged: at least four to five competitors (CellarTracker, Sommo, InVintory, MaiCellar, and implicitly Vivino) now do a version of this, several at vastly larger data scale.
- **Monetization remains completely unbuilt.** Unchanged — zero pricing/IAP code exists anywhere in the repository, reconfirmed again this cycle, even though the live App Store listing itself is described as free with no visible IAP.
- **Community/social remains built but off.** Unchanged — `COMMUNITY_ENABLED = false`, zero live user-generated content, while Vivino, CellarTracker, and Delectable all run live social layers that drive retention.
- **Going public with no reviews yet is itself a small, specific risk.** A storefront listing with zero visible ratings, while a necessary step toward launch, also means Vinster is now exposed to the same public scrutiny every competitor in this report faces — and the first wave of real user reviews, whenever it arrives, will be the first genuinely external signal on whether the app's AI pipeline (OCR accuracy, recommendation quality, price-integrity discipline) holds up outside internal testing. This cuts both ways and should not be read as purely positive.
- **Standalone recipe/meal apps continue to be absorbed into retailer/hardware ecosystems, though this cycle's specific evidence for Mealime's claimed shutdown is thinner than before, not stronger.** The structural pattern (Yummly, PlateJoy) still holds regardless of Mealime's exact fate, but readers should not treat the Oct 21 date as confirmed.
- **Consumer wine-tech capital remains thin relative to B2B infrastructure.** Unchanged — no comparable acceleration was found anywhere on the consumer wine+food app side this cycle, while Santé's B2B round continues to be the sharpest funding signal in this report series.
- **Zero automated test coverage.** Unchanged — a real engineering-risk gap independent of market positioning, and now a slightly higher-stakes one given the app appears to have a live public listing.
- **Reliability remains a known unsolved problem industry-wide, not just for Vinster.** Unchanged — SideChef's RecipeGen AI hallucination/omission issues remain the clearest documented instance.

---

## Emerging Trends

- **Generative AI in food/recipe apps remains mainstream, not novel.** Unchanged this cycle — no new large-scale AI feature launch found among the major players.
- **The consumer AI-sommelier branding cluster keeps growing, cycle over cycle, without consolidating.** This cycle added Wine AI – Scan & Track, My Cellar: AI Wine Scanner, Life with Wines 2, and a Taiwan AISommelier listing to an already-long list — a trend, not a one-off, and a reminder that the branding-level crowding in this exact sub-category is not slowing down.
- **B2B "AI sommelier/retail infrastructure as a service" continues to look like where investor conviction sits, relative to consumer apps.** Unchanged — no new B2B funding event surfaced this cycle, but nothing contradicts last cycle's reading either.
- **Cellar-aware AI pairing is now a multi-vendor pattern, not a single-vendor innovation.** Unchanged — reconfirmed rather than newly discovered this cycle.
- **General-purpose-AI integration (MCP-style) is a new pattern worth watching in this exact category.** InVintory's Claude/ChatGPT/Gemini MCP connector is the first instance in this report series of a wine-cellar app explicitly building for "ask your own AI assistant about your data" rather than "use our AI chat inside our app" — a strategic choice distinct from what Vinster and most profiled competitors do, and one future cycles should watch for imitators.
- **Star ratings remain a weak, inconsistent signal across aggregators.** Unchanged — Vivino's Apple rating and Kitchen Stories' Play rating both continue to show material cross-aggregator disagreement.

---

## Recommended Differentiators for Vinster

Each item below is explicitly marked **BUILT** (verified in the code on `main` this cycle) or **PROPOSED** (not found in code), with an honest defensibility read informed by this cycle's competitive research.

1. **Cellar-aware recipe generation — PROPOSED, still the one remaining clear opportunity.** Cellar-aware wine *pairing* is **BUILT** (`supabase/functions/food-wine-pairing`, `mode: 'cellar'`) and is not a unique claim — several competitors already ship versions of it. What remains genuinely unbuilt is wiring the recipe generator (`supabase/functions/generate-pairings`) to the same cellar/drinking-window data its pairing sibling already consumes. **Defensibility: moderate**, unchanged from last cycle.
2. **In-restaurant scan-to-pairing flow — BUILT.** Unchanged. **Defensibility: low-to-moderate** — the pattern itself is not unique.
3. **Diamond-bin/spatial cellar modeling — BUILT.** Unchanged. **Defensibility: low** — InVintory's VinLocate remains a comparable, arguably more mature, visualization concept.
4. **Price-integrity discipline (never showing an AI-invented price/score) — BUILT.** Re-verified this cycle directly in `parse-cellar-import/index.ts` ("use null when unknown, never invent data") and `wine-intelligence/index.ts` ("never invent, guess, or approximate a plausible-looking number"). **Defensibility: moderate** — a legitimate, quietly defensible trust claim no competitor in this research was found to advertise.
5. **Wine-library browsing UI — PROPOSED (backend exists, no user-facing browse screen).** Re-verified this cycle: `wines_catalog` is still used only for predictive search typeahead (`app/(tabs)/index.tsx`), not a dedicated browse experience. **Defensibility: low technical lift, moderate value**, unchanged.
6. **Community/social layer — BUILT but disabled, not a current differentiator.** Unchanged. **Defensibility: none until launched.**
7. **Monetization model — PROPOSED, entirely unbuilt.** Unchanged. Still a blocking gap, not a differentiator, and now a more urgent one given the app appears to have a live public storefront presence already.
8. **Automated test coverage — PROPOSED, entirely unbuilt.** Unchanged. Now a slightly higher-stakes gap given item 7's urgency and the apparent live listing.
9. **"AI sommelier that knows your cellar" as a headline pitch — not recommended as a standalone claim.** Unchanged from last cycle's conclusion: this capability is now claimed, in some form, by at least five competitors, one of them (CellarTracker) at a scale of 200M+ tracked bottles. The narrower, more genuinely rare pitch remains: **"the only app that designs a recipe around the specific bottles already aging in your cellar"** — once item 1 above is actually wired up — paired with the price-integrity guarantee (item 4) as a trust differentiator.
10. **New this cycle: with a live storefront listing now apparently in place, the priority on monetization and review-monitoring rises.** This is a process recommendation, not a feature one: the next few cycles of this report should explicitly track Vinster's own App Store/Play rating and review content — exactly as every competitor profile in this report does — rather than continuing to default to "no public listing found."

---

## Sources

**Vinster codebase (internal, `main` @ `81e8ef1`):** `app.json`; `src/constants/features.ts`; `supabase/functions/food-wine-pairing/index.ts` (`buildCellarPrompt`, `mode: 'cellar'`, drinking-window prioritisation language); `supabase/functions/generate-pairings/index.ts` (confirmed no `cellar`/`drinking_window` reference); `supabase/functions/parse-cellar-import/index.ts` and `supabase/functions/wine-intelligence/index.ts` (price/score-integrity language); `src/api/bins.ts`, `src/api/racks.ts`; `app/(tabs)/index.tsx`, `src/api/label.ts` (`wines_catalog` typeahead-only usage); repo-wide search for `revenuecat|stripe|react-native-iap|in-app-purchase` (no matches) and `*.test.*`/`*.spec.*`/`__tests__` (no matches); `git log 1ca4c7a..HEAD` (one commit, report-only).

**Vinster's own public presence (new this cycle):**
- https://apps.apple.com/app/id6763607127
- https://chrome-stats.com/d/com.vinster.app

**Wine apps:**
- https://pulse2.com/sante-raises-15-million-series-a-to-expand-ai-operating-system-for-wine-and-spirits-retail/
- https://www.vinetur.com/en/20261007108549/sante-raises-%2415-million-to-expand-ai-software-for-wine-and-spirits-retailers.html
- https://alleywatch.com/?p=163626 (notes a disputed $22.6M total-funding figure and an investor-list discrepancy vs. other Santé coverage)
- https://globalventuring.com/university/vivino-pours-155m-into-series-d/
- https://www.vivino.com/it/app
- https://www.cbinsights.com/company/cellar-tracker/financials
- https://pulse2.com/cellartracker-profile-eric-levine-interview/
- https://mwm.ai/apps/winediscovery/6752752972 (and sibling mwm.ai listings for CorkAI, Wine Scanner, SOMM DIGI AI, Wineries.AI)
- https://peerpush.com/p/sommo-your-pocket-sommelier
- https://asiafoodjournal.com/vivant-launches-wine-app-to-enable-wine-lovers-with-ai-powered-sommelier-guidance/
- Prior-cycle sources for Delectable, Hello Vino, Wine Spectator carried forward unchanged from `reports/2026-10-07-market-comparison.md`.

**Food/recipe apps:**
- https://tech.yahoo.com/ai/articles/samsung-food-ai-driven-tailored-183400299.html
- https://news.samsung.com/global/samsung-announces-global-launch-of-samsung-food-an-ai-powered-personalized-food-and-recipe-service
- https://mi-3.com.au/index.php/11-12-2023/ai-powered-recipe-platform-clove-cooks-415m-seed-funding (headline figure is a typo for $4.15M — confirmed against two independent sources below)
- https://www.businessnewsaustralia.com/articles/ai-recipe-startup-clove-cooks-up--4-15m-seed-raise.html
- https://www.forbes.com.au/?p=65228
- https://www.theherdnow.com/content/2026-04-02-grocery-chain-closing-stores-across-the-country-after-merger-falls-apart (Albertsons 2026 context; no Mealime/Meals Hub mention found)
- Prior-cycle sources for Samsung Food, Yummly, SideChef, Kitchen Stories, Mealime (secondary-source caveats), PlateJoy, Plant Jammer carried forward from `reports/2026-10-07-market-comparison.md` and `reports/2026-09-30-market-comparison.md`.

**Combined space, funding, trends:**
- https://invintory.com/blog/ai-wine-assistant-vincent-updates/
- https://invintory.com/ai-sommelier/
- https://help.invintory.com/en/articles/16772681-how-to-use-siri-and-shortcuts (MCP/connect-to-Claude-ChatGPT-Gemini detail)
- https://invintory.com/blog/unexpected-ways-to-use-ai-sommelier-vincent/
- Prior-cycle sources for Sommo, Vinomat, MaiCellar, Saignée, Wine Pairing Cellar, Cellared, OpenTable, Resy, Yelp Menu Vision, DoorDash, Instacart carried forward unchanged from `reports/2026-10-07-market-comparison.md`.

*Note: several ratings/figures above could not be independently cross-checked against live App Store/Google Play listings from this environment (network egress to apps.apple.com/play.google.com was restricted for anything beyond what search-tool results surfaced) and are drawn from third-party aggregators and search-result summaries citing those listings. Treat precise star ratings and review counts as directionally accurate, not exact. Vinster's own App Store and Google Play listings were found via search-tool results, not a direct storefront fetch; their continued existence, exact copy, and any rating/review activity should be re-verified directly in the next cycle. The Mealime October 21, 2026 shutdown date remains unconfirmed by any primary source across all cycles of this report and was, this cycle, not even corroborated by the secondary sources that supported it previously — treat it as an open question, not a settled fact.*
