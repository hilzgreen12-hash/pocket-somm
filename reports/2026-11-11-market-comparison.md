# Vinster — Market Comparison: Wine, Food & Combined Wine+Food Apps

**Date:** 2026-11-11
**Prepared by:** Automated Market Research Agent
**Branch analysed:** `main` @ `5747cc6` (app.json version `1.6.0`)
**Prior report:** `reports/2026-11-04-market-comparison.md`

**A note on objectivity:** This is internal competitive intelligence, not marketing copy. Vinster's strengths are not inflated and competitors' advantages are not softened. Where a competitor is materially better than Vinster — in scale, data depth, funding, ratings, community, or polish — that is stated directly. Where Vinster is a late, small, or undifferentiated entrant, that is stated directly too. Every Vinster feature cited below as "built" is grounded in the actual code on `main` (file paths cited throughout, re-verified this cycle); anything not found in the code is marked **PROPOSED**, not built.

**What changed in the code since 2026-11-04:** Nothing. `git log 106850b..HEAD -- . ':!reports'` is empty against last cycle's starting commit — the only commit in that range added last week's report file. App version remains `1.6.0`. `COMMUNITY_ENABLED` is still `false` (`src/constants/features.ts:6`). `SOCIAL_SIGN_IN_ENABLED` is `true`. A repo-wide search again found no RevenueCat/Stripe/`react-native-iap`/in-app-purchase code anywhere and no test files (`*.test.*`, `*.spec.*`, `__tests__`) anywhere. `generate-pairings/index.ts` — Vinster's recipe-generation function — was re-checked line-by-line for any reference to the user's cellar inventory; there is none, confirming again that recipe generation is tied to a scanned/selected wine, not to the user's own cellar. The last application-code commit of any kind was `3d7cb5f` on **2026-09-22** (bumping to `1.6.0` for a build). **This is now the seventh consecutive weekly report in this series with zero shipped application-code change — seven weeks, zero commits, while the competitive landscape keeps moving.**

**What changed in the market this cycle:** No single event matches last week's CellarTracker launch in magnitude, but several findings refine and harden that picture and the standing risk list. First, CellarTracker's own support documentation explicitly labels the new restaurant wine-list scanner **"Scanning a Wine List [BETA]"** — last week's framing ("launched") is accurate (it is live in the shipping app, not a roadmap item) but this cycle's deeper check confirms it is formally a beta feature, not a finished, stable one, and its subscription/paywall status remains unconfirmed one cycle later (a CellarTracker founder message describes a shift toward a subscription model for time-saving and "simplify choosing a bottle" features generally, but does not name the scanner specifically). Second, a notable precedent from the *food* side, outside this series' usual wine-app focus: **The New York Times Cooking app** — a large, well-resourced, subscription-funded incumbent — rolled out an AI recipe-modification tool (ingredient substitutions, building on earlier AI unit-conversion/scaling features) in late October 2026, and drew visible subscriber backlash over trust-in-AI and lack-of-opt-out concerns (Nieman Lab, Oct 2026). This is directly relevant to Vinster's own generative-recipe feature as a cautionary data point: AI-generated/modified food content from a trusted-expert-branded incumbent can produce user backlash even when technically functional, independent of feature quality. Third, a deeper funding search surfaced several previously-untracked-in-this-series wine-tech raises (WineView, VinoBuzz, a Cru World Wine equity-crowdfunding stake sale) that, while dated earlier in 2026, confirm continued investor interest in wine-adjacent commerce/community platforms specifically, not AI-sommelier consumer apps — consistent with, and reinforcing, this series' standing finding that consumer wine-recommendation apps are not where venture money in this space is flowing. Fourth, a first concrete (if narrow) wine-touching feature was found on a major restaurant-reservation platform: OpenTable is beta-testing an AI tool, for restaurants on its paid "Pro" plan, that normalizes staff-entered drink descriptions (e.g., "glass of cabernet") into consistent categories — a back-of-house operations feature, not a diner-facing pairing tool, but the first time this series has found OpenTable or Resy touching wine data at all.

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

Seven weeks into this report series, Vinster's code has still not moved — zero application commits since 2026-09-22 — while the market has continued to tighten around exactly the claim Vinster rests on. This cycle does not add a single dramatic incursion the way last cycle's CellarTracker launch did, but it sharpens the picture in several smaller ways that, together, do not favor Vinster. CellarTracker's new restaurant-wine-list-scan-plus-food-pairing feature is confirmed as a live, shipping beta inside the largest cellar-tracking incumbent's app — not a rumor, not a mockup — with its monetization status still an open question rather than a resolved one in Vinster's favor. The small AI-sommelier wave keeps widening: this cycle's search alone surfaced a further half-dozen previously-untracked scan-and-recommend entrants (Vinea, WineValueAI, VinoLens, SommelierX, Wine-Oh!, and others), each adding to an already-commoditized pattern rather than differentiating within it. On the food side, a much larger and better-funded incumbent than any wine app in this report — The New York Times Cooking — just shipped AI recipe modification to real subscriber backlash, a direct, relevant signal about the risk profile of exactly the kind of generative-recipe feature Vinster has already built (`supabase/functions/generate-pairings`) but has not yet attached to a user's actual cellar, which remains this series' single most defensible, least-contested differentiation candidate. Vinster's own App Store presence could again not be independently re-verified for a star rating or review count this cycle (search-indexed snippets surfaced the listing's descriptive copy but not its numeric rating; direct fetches to apps.apple.com and chrome-stats.com remain unavailable from this environment, as in every prior cycle). The standing conclusion of this series holds without need for revision: the product, where it has been built, is genuinely substantive — but seven weeks of zero code movement against a market that keeps adding entrants, keeps blurring Vinster's "nobody else does both wine and food" claim, and now offers a live cautionary tale from a much bigger incumbent about how AI-recipe features can misfire with users, is not a trajectory that resolves in Vinster's favor on its own.

---

## Wine Apps

### Vivino
**What it does:** The category's largest crowdsourced wine database and social ratings feed, camera label scanning, a personalized "Match for You" score, an integrated wine marketplace, cellar tracking, and — under Premium — "Vivino Sommelier," an AI chat feature, plus a wine-list scanner.
**What's new this cycle:** No November 2026 update was found. The most recent dated release located is version `2026.30.0` (App Store aggregator, dated July 27, 2026), which the listing itself describes as a revamped digital Cellar and an updated AI Sommelier page ("Meet your personal AI Sommelier"); the app also lists support for Apple Visual Intelligence scanning (added in `2026.15.0`) and Liquid Glass. No new feature beyond what prior cycles already tracked.
**Ratings:** Figures remain disputed across sources, as in every prior cycle. One tracker (AppPricingLab) puts Google Play at ≈4.7★ (227.6K reviews, ~10M installs); Vivino's own marketing page cites 4.5★/194K reviews on Google Play and 4.8★/548K ratings on the App Store — a materially different Google Play figure from the independent tracker, and a much larger App Store count than last cycle's carried-forward ≈126.7–129K. This gap is wide enough, and sourced closely enough to Vivino's own promotional page versus independent trackers, that it should be read as "disputed, likely inflated in the self-reported figure" rather than resolved upward.
**Pricing:** Unchanged — free with in-app purchases; Premium unlocks unlimited Sommelier chat and the list scanner (per a 2026 third-party guide); specific price points remain unverified.
**Assessment:** Unchanged — still the unambiguous scale and data leader, now with its AI Sommelier evidently promoted as a headline feature on its own product page rather than a secondary chat add-on.

### Delectable
**What it does:** Camera-first label recognition built around a social feed of verified sommeliers, winemakers, and critics rather than crowd averages; a personal wine journal; integrated Vinous critic reviews under Premium.
**What's new this cycle:** Multiple independent trackers (chrome-stats.com snapshot dated late July 2026; appfollow.io) still show the iOS app's last substantive update as version `5.9.5`, dated **September 14, 2021** — over five years with no confirmed update, a materially different and more concerning maintenance picture than this series has previously stated plainly. A Jancis Robinson piece (undated in search results) reports that Delectable's parent has shifted product focus to a companion app called "Banquet," and that Delectable itself was sold, drawing criticism over a possible conflict of interest for the critic-review content it hosts.
**Ratings:** ≈4.7★ App Store (~25.7K reviews, carried forward); one Android listing shows a materially lower ≈4.2★, not previously highlighted in this series.
**Pricing:** Unchanged — free with IAP; Delectable Premium at $5.99, a separate Ad-Free tier at $1.99.
**Assessment — sharpened this cycle:** Previously framed as "a smaller, curated alternative to Vivino." This cycle's finding (five-plus years with no confirmed update, reported sale, and reported strategic pivot away from the app itself) reframes Delectable as a legacy property on borrowed maintenance, not an actively competing product — a different kind of risk lesson for Vinster than an active competitor, closer to the Hello Vino cautionary tale than to Vivino or CellarTracker.

### CellarTracker
**What it does:** The dominant cellar-inventory and tasting-note platform for serious collectors — bottle tracking, valuation, drinking-window guidance, bin/rack assignment by manual bin number (no visual diagram), a huge tasting-note corpus, and, since October 15, 2026, a restaurant wine-list-scanning feature with AI food-pairing chat ("CellarChat").
**What's new this cycle:** CellarTracker's own support article is explicitly titled **"Scanning a Wine List [BETA]"** — confirming the feature's beta status in the company's own documentation, a detail last cycle's report did not have direct confirmation of. The article describes the scanner as returning ratings, average value, food pairing, and personalized recommendations from a photographed list, and separately advises photographing only the section of a long/dense list the diner cares about for best OCR results. A founder message describes a general shift toward a subscription model for time-saving, insight, and "simplify choosing a bottle" features, but does not name the scanner or CellarChat specifically, so the paywall question first raised last cycle remains open rather than resolved.
**Scale:** Unchanged — marketing cites 4.4–5M+ unique wines and ~12M tasting notes.
**Ratings:** Unchanged — self-reported 4.9★ vs. independent trackers showing materially lower figures (3.8★ US iOS; 4.3★ one German listing).
**Pricing:** Unchanged — free with bottle-count-tiered IAP, $7.99–$69.99.
**Assessment:** Unchanged from last cycle's materially-revised view — CellarTracker remains a direct, better-resourced competitor on Vinster's own flagship wine-list-scan-plus-food-pairing combination, now with the added nuance that the feature is explicitly beta, not a finished product, which narrows but does not eliminate the competitive overlap this cycle.

### Hello Vino
No new information found this cycle. Carried forward unchanged: ≈4.6★ (~6.5K ratings) on a listing last substantively updated in 2017; a dated review reports the app non-functional beyond localization on iOS 26.

### Wine Ring
No new information found this cycle. Carried forward unchanged: no evidence of continued activity; a historical cautionary tale.

### Wine Spectator (WineRatings+)
No new information found this cycle. Carried forward unchanged: a stable editorial-authority reference tool, not a direct AI-feature competitor.

### Sommo
**What it does:** An all-in-one pocket sommelier — label/list/shelf scanning with value-pick scoring, virtual cellar with named racks, AI pairing from the user's own cellar, a "Taste DNA" tasting journal, and a WSET exam-prep module.
**What's new this cycle:** This cycle's search corroborates and adds detail to last cycle's "2.0 redesign" finding rather than surfacing anything newer: the redesign reorganizes the app around five tabs (Today, Cellar, Scan, Journal, Explore); a premium family-sharing option for up to five members has been added; a Chinese-language option now appears alongside the app's other supported languages (per the Italian store listing); and the `1.7.7` release (per store listing, dated June 25, 2026) added a feature that highlights a bottle's physical slot on the user's virtual wine rack — a direct, shipped precedent for exactly the kind of rack-location UX Vinster's own diamond-bin system is built around. No release dated after June 25, 2026 was found this cycle; the "2.0" redesign's own ship date remains unconfirmed by a primary dated source.
**Assessment:** Unchanged — still the closest single pure-wine-app match to Vinster's scope, now with a shipped precedent for rack-slot-highlighting UX that overlaps directly with Vinster's cellar-visualization claims.

### The wider "AI sommelier / wine-scanner" wave — further expanded this cycle
Beyond the names already tracked across prior cycles (Nobli, Eno, Wine Pairing Cellar, My Cellar: AI Wine Scanner, Wine Lab AI Scanner & Tracker, VinoCellar, Life with Wines 2, Sommelier's Window), this cycle's search surfaced a further batch of small, largely review-less entrants following the identical scan-and-recommend pattern: **Vinea AI Wine Sommelier**, **WineValueAI: AI Sommelier**, **VinoLens: AI Wine Scanner**, **Wine Pairing – AI Sommelier**, **SommelierX**, **Wine-Oh! AI Ratings Scanner**, **VinoMatch: AI Wine Finder** (a Product Hunt listing), **SommSnap Wine AI**, and **AI Wine Scanner**. None of these surfaced with meaningful independent review traction in this cycle's search. **Assessment:** unchanged and further reinforced — this remains a reproducible, commoditized pattern at the solo-developer level with a steady stream of new entrants and little evidence that any has achieved meaningful usage.

### Funding signals this cycle
This cycle's deeper funding search surfaced several wine-tech raises not previously itemized by name in this series (though consistent with the series' standing finding about where the money goes):
- **Santé** — a wine-and-spirits fintech/retail-AI platform, not a consumer recommendation app — raised a **$15M Series A** in October 2026 (led by FINTOP, with returning investors including Bonfire Ventures and Y Combinator), on top of a **$7.6M seed** round in February 2026; the company states 500% growth and nearly 1,000 retailer customers.
- **WineView** — a wine-club software startup — raised ≈**$765K** (May 2026) and relocated to Richmond, Virginia; total funding to date ≈$1M.
- **VinoBuzz** — a Hong Kong-based "AI agent marketplace for wine" — announced an angel round at a **$10M valuation** (April 2026).
- **Cru World Wine** — raised **$1.43M** via an equity-crowdfunding stake sale (7% stake, 227 investors, August 2026) to fund trading, storage, and wine-backed loans.
All four confirm, rather than change, this series' standing conclusion: confirmed venture/crowdfunding interest in this space continues to flow to B2B fintech, retail infrastructure, club/commerce platforms, and asset-backed lending — not to consumer AI-sommelier recommendation apps, the category Vinster's wine-side features sit in.

---

## Food / Recipe / Pairing Apps

### Samsung Food (formerly Whisk)
**What it does:** Samsung's flagship AI food platform — recipe import, AI weekly meal plans, shoppable grocery lists, SmartThings integration, AI photo-based ingredient scanning.
**What's new this cycle:** No November 2026 update was confirmed. The App Store listing shows a "last update" stamp of September 4, 2026, but its own release notes reference a version number (`5.56.0`) that does not match the Android numbering series (`2.5x`), so the currency of that note is uncertain; the most recent clearly-dated release remains `2.55.0` (July 29, 2026, per a French download-tracker site).
**Ratings:** Unchanged — Apple App Store ≈4.6–4.8★ (varies by tracker), Google Play ≈4.6★ (~22.3K reviews).
**Pricing:** Unchanged — freemium; Food+ at $6.99/month or $59.99/year.
**Assessment:** Unchanged — the best-resourced, most hardware-integrated food app in this report, still with no wine-pairing feature of its own.

### The New York Times Cooking — new to this series
**What it does:** A long-running, subscription-funded recipe platform (part of the broader NYT News/Games/Cooking subscription bundle) with professionally edited recipes, not a scan-and-recommend app.
**What's new:** In late October 2026, NYT Cooking rolled out an AI recipe-modification tool — primarily ingredient substitutions — to all Cooking subscribers on iOS, building on earlier AI unit-conversion and recipe-scaling features. Nieman Lab (Oct 2026) reports real subscriber backlash: complaints centered on distrust of AI altering professionally-vetted recipes, and on an unclear or disputed ability to fully opt out of the feature (NYT Cooking's general manager has characterized the AI as supportive rather than a replacement for editorial expertise; one secondary source claims an opt-out exists, contradicting another source's claim that it does not — this specific point is unresolved from search alone).
**Assessment:** Not a wine or combined-space competitor, and NYT Cooking has no wine-pairing feature (consistent with this series' standing finding that no mainstream recipe app does). It is included here as a directly relevant risk signal: a large, well-funded, trusted-editorial-brand food app can ship a technically-functional AI recipe-modification feature and still generate visible user backlash. Vinster's own recipe-generation feature (`supabase/functions/generate-pairings`) is a comparable category of feature (AI-modified/generated food content presented to a user), and this is a concrete, dated precedent for the kind of trust/opt-out friction such features can create — a consideration for product design, not a competitive threat.

### Yummly — discontinued December 20, 2024
Carried forward unchanged. Still the clearest cautionary precedent for a large, well-funded AI-personalized recipe app folding entirely despite real scale.

### SideChef
No new information found this cycle. Carried forward unchanged: 15K+ recipes, "RecipeGen AI" photo-to-recipe tool, Premium at $4.99/month or $49.99/year, user reviews flagging a creeping paywall.

### Kitchen Stories
No new information found this cycle. Carried forward unchanged: large editorial recipe library, largely non-AI by design, Android/iOS rating-perception gap.

### Mealime — retired as a live flag
Per the 2026-10-28 cycle's explicit instruction, this unconfirmed shutdown claim remains closed and is not re-raised.

### The AI recipe-generator landscape
Carried forward: a crowded, vendor-self-promoted field (ChefGPT, HAiCook, MealWise, Bean, Recipe AI, Recipe Genius, AI Chef) continues to grow, joined this cycle by further small entrants surfaced in search (Chef AI: Fridge Recipes, Prompt en Place, Mise: AI Sous Chef & Meal Plan, Cookember, noms, CuliNova AI, AI Menu4You) with little independent review traction. No food/recipe app researched across any cycle of this report — including this one, and including NYT Cooking above — has a native wine-pairing feature; this remains a clean, verifiable white space relative to mainstream recipe apps specifically, though several combined-app competitors in the next section do pair wine with food.

---

## Combined Wine + Food / Dining Space

This remains the segment most directly relevant to Vinster's stated positioning.

**Direct combined competitors — status this cycle:** Sommo, InVintory ("Vincent"), Winary, DiVino, Vinomat, Pocket Sommelier, Pour Decisions, OENARI, Cru, and Vinocell are all carried forward from prior cycles' detailed profiles (see the 2026-10-21, 2026-10-28, and 2026-11-04 reports for full individual writeups); no material change to any individual profile was found this cycle beyond what is already noted above for Sommo and CellarTracker.

**Newly surfaced or sharpened this cycle:**
- **CellarTracker's restaurant wine-list-scan + CellarChat food-pairing feature** — confirmed this cycle as formally labeled **beta** in the company's own support documentation (see Wine Apps section above). Still the strongest single combined-space incursion by data-moat scale, though now understood more precisely as an unfinished feature rather than a fully-matured one.
- **OpenTable's beverage-tagging AI (beta, Pro plan)** — the first wine-touching feature this series has found on a major reservation platform. It is a back-of-house staff tool (normalizing free-text drink orders like "glass of cabernet" into structured categories for restaurant operations), explicitly not a diner-facing recommendation or pairing feature, and gated to restaurants on OpenTable's paid Pro tier. This narrows, slightly and indirectly, the prior framing that reservation platforms are entirely uninvolved with wine data — but it does not compete with Vinster's diner-facing use case.
- **Resy / American Express "Dining Companion"** — an Amex-branded generative-AI restaurant-discovery tool for Resy bookings, plus a reported (not yet confirmed shipped) Resy–Toast integration intended to help restaurant staff recall a regular guest's favorite wine. Both are adjacent to, not direct substitutes for, Vinster's diner-facing wine-list-scan-and-recommend use case.
- **NYT Cooking's AI recipe-modification backlash** (see Food section above) is not a combined-space competitor, but is the most directly relevant cross-category risk signal surfaced this cycle for Vinster's own generative-recipe feature.

**Vinster's own market presence — not independently re-verified this cycle; partially different result from the DNS-block pattern of the last several cycles.** This cycle's web search (rather than a direct page fetch) surfaced indexed descriptive text from Vinster's own App Store listing (id `6763607127`) — confirming it describes the app as a "personal AI sommelier" that reads a restaurant wine list and suggests top picks, tracks a digital cellar, keeps a gallery of scanned labels, lets reviews be kept private or shared with the community, is rated 18+, and lists iPad support — but the search did not surface a star rating or review count, which the indexed snippet appears to cut off before. Direct fetches to `apps.apple.com` and `chrome-stats.com` were not separately re-attempted this cycle beyond the standard search tool (prior cycles found both DNS-blocked from this environment); this cycle's finding should be read as "descriptive copy confirmed via search index; numeric rating/review count still not independently confirmed," continuing, not resolving, the open item from every prior cycle in this series.

**Objective verdict — is "wine + food + cellar in one app" a white space or crowded?** Unchanged from last cycle's revised "crowded" assessment, with this cycle adding texture rather than a new direction: the clearest differentiation claim this series has tracked (no major incumbent combines wine-list scanning with food-pairing AI) remains narrowed by CellarTracker specifically, now understood as a beta feature rather than a finished one; the narrowest sliver this series has identified as still genuinely underserved — **generative recipe creation tied to a persistent, personal cellar inventory** — remains untouched by anything found this cycle, on either the wine side (CellarTracker, OpenTable, Resy) or the food side (NYT Cooking). That sliver remains the most defensible position identified across this report series, and it is still the one feature Vinster's own code does not yet implement.

---

## Feature Comparison Matrix

| App | Category | Label/List Scan (camera) | AI Recommendations/Chat | Cellar / Rack-Location Mgmt | Food Pairing | Recipe Generation | Community/Social | Rating (approx.) | Price |
|---|---|---|---|---|---|---|---|---|---|
| **Vinster** | Combined | **BUILT** — Claude vision OCR for wine lists (`supabase/functions/ocr`) and labels (`supabase/functions/scan-label`); multi-bottle "lineup" scanning (`supabase/functions/detect-lineup`) | **BUILT** — Claude recommendation engine with hard budget/colour/region rules + soft-ranking rubric (`supabase/functions/recommend/index.ts`), plus per-wine "Wine Knowledge" AI pages (`supabase/functions/wine-knowledge`) | **BUILT, deep** — racks, fridges, true diamond-grid bins with per-cell capacity, OWC/mixed storage cases, spreadsheet + Vivino-CSV import (`src/types/wine.ts`, `src/api/bins.ts`, 107 SQL migrations) | **BUILT, cellar-aware** — dish → best bottle from actual cellar or a style to buy, weighted by dietary prefs/budget (`supabase/functions/food-wine-pairing`) | **BUILT, but not cellar-aware** — generates 3 chef-attributed recipes for a scanned wine, saved to a "Cookbook" with PDF/share-card export (`supabase/functions/generate-pairings`, re-confirmed this cycle to have zero references to cellar data) | **BUILT but disabled** — `COMMUNITY_ENABLED = false`; users can only view/manage their own posts (`src/constants/features.ts:6`) | No rating/review count independently confirmed this cycle (App Store descriptive copy only; apps.apple.com/chrome-stats.com remain unreachable for direct fetch from this environment) | Free (App Store listing); **no pricing/IAP code exists anywhere in the repo** |
| Vivino | Wine | Yes (label; list under Premium) | Yes ("Vivino Sommelier" chat, now promoted on own product page) | Yes | Yes (reported generic) | No | Yes (largest crowd DB) | ≈4.5–4.7★ Play (194–230K reviews, sources disputed) / ≈4.8★ Apple (127K–548K ratings, sources disputed) | Free + Premium (price disputed) |
| Delectable | Wine | Yes (label) | No | No | Yes (weak, per reviewers) | No | Yes (pro/critic network) | ≈4.7★ iOS (~25.7K) / ≈4.2★ Android | Free + $5.99/mo Premium, $1.99/mo ad-free |
| **CellarTracker** | Wine (cellar) → now Combined | **Yes, BETA** — restaurant wine-list photo scan (launched Oct 15, 2026; CellarTracker's own docs label it "[BETA]") | **Yes, BETA** — "CellarChat" conversational AI, value-vs-markup flagging | Yes, manual bin numbers (no visual diagram) | **Yes, BETA** — food-pairing guidance for dishes via CellarChat | No | Yes (12M tasting notes, huge corpus) | Self-reported 4.9★; independent trackers show 3.8–4.3★ | Free + bottle-tiered IAP ($7.99–$69.99); restaurant-feature paywall status still unconfirmed |
| Hello Vino | Wine | No | Weak (quiz-based) | Basic (manual log) | No | No | No | ≈4.6★ (~6.5K), reported non-functional on iOS 26 | Free + ads, one-time ad removal |
| Sommo | Combined | Yes (label/list/shelf) | Yes (value scoring, cellar-aware pairing) | Yes (named virtual racks, rack-slot highlighting since v1.7.7) | Yes (cellar-aware) | No | Journal only | No reliable rating found | Free + Premium, 3-day trial, family-sharing up to 5 |
| InVintory (Vincent) | Combined | No (manual entry + 3D map) | Yes ("Vincent" assistant, Premium) | Yes, 3D VinLocate map | Yes (Premium) | No | No | 4.5–4.8★ (28–4,200+ reviews, disputed) | Premium $12.99/mo, $149.99/yr |
| Vinomat | Combined | Yes (menu + wine list) | Yes (0–10 pairing score) | No | Yes (score-based) | Yes (recipe for a chosen bottle) | No | Insufficient ratings | Not confirmed |
| Eno | Combined | No (photo of dish, not label/list) | Yes (pairing from photo/text) | No | Yes (core feature) | No | No | Insufficient/zero ratings (AppGoblin, Jan 2026 snapshot) | Free + "grapes" credit IAP |
| Nobli | Wine (cellar) | Yes (label) | Yes (virtual sommelier chat) | Yes (iCloud sync, custom lists/tags) | Yes ("meal matches tailored to your bottle") | No | No | ≈4.67★ (36–46 ratings, disputed) | Free + Lifetime $9.99 / Annual $29.99 / Monthly $7.99 |
| OENARI | Wine (cellar) | No | No | Yes, incl. shipped diamond-rack module | No | No | No | Not found | Free tier + Premium Annual $39.99 / Monthly $4.99 |
| Samsung Food | Food | Yes (ingredient photo) | Yes (AI meal plans) | No | No | Yes (import/generate) | Yes (large) | ≈4.6–4.8★ (varies) | Freemium, Food+ $6.99/mo or $59.99/yr |
| NYT Cooking | Food | No | Yes (AI recipe substitutions, Oct 2026, subscriber backlash) | No | No | No (modifies existing recipes, doesn't generate new ones) | No (editorial, not social) | Not researched (bundled subscription product) | Part of NYT "All Access" bundle subscription |
| SideChef | Food | Yes (RecipeGen AI, photo-to-recipe) | Limited | No | No | Yes | Yes (community recipes) | ≈4.3–4.7★ (spread) | Free + Premium $4.99/mo, $49.99/yr |
| Kitchen Stories | Food | No | No | No | No | No (editorial only) | Limited | ≈3.4–3.99★ Play / ≈4.8★ Apple | Free + Plus $6.99/mo, $79.99/yr |

---

## Market Gaps & Opportunities

The standing list from prior cycles holds, unchanged in substance this cycle:

1. **Cellar-aware generative recipe creation** (recipes generated *from* a user's actual cellar inventory, not just a recipe tied to one scanned bottle) remains the one concrete gap this series has found that no competitor — Vinster included — has fully closed. Untouched by this cycle's CellarTracker, OpenTable, Resy, or NYT Cooking findings alike, it remains the most defensible candidate differentiator in the entire landscape.
2. **Wine-list-scan-plus-food-pairing-in-one-app** remains a claim Vinster can no longer make uncontested against major incumbents, specifically CellarTracker — now understood more precisely as beta, not finished, but still live and shipping.
3. **Visual, precise cellar storage modeling** (diamond-grid bins, per-cell capacity) remains a genuine strength but is not novel at the feature-description level — this cycle adds Sommo's rack-slot-highlighting feature as a further point of overlap, alongside OENARI, Cru, Vinocell, and Nobli.
4. **Chef-attributed, shareable recipe content** (PDF/share-card export) tied to a specific wine remains a relatively uncommon combination, though Vinomat does something adjacent.
5. **A new, cycle-specific caution rather than an opportunity:** the NYT Cooking backlash is a reminder that shipping AI-modified food content carries real user-trust risk even for a well-resourced incumbent; any future work hardening or marketing Vinster's own recipe-generation feature should design deliberately for user trust and control (clear opt-outs, clear sourcing/attribution), not treat "AI wrote it" as self-evidently a selling point.

---

## Risks & Where Competitors Are Stronger

Stated plainly, as this series requires:

- **CellarTracker is a direct, better-resourced competitor on Vinster's own flagship combination**, now confirmed to be in beta but still live and shipping, with ~12M tasting notes and a large existing user base Vinster cannot match by building a better app.
- **Vivino and CellarTracker both have data moats Vinster cannot replicate quickly** — Vivino's own marketing this cycle claims as many as 548K App Store ratings (even accounting for the dispute with independent trackers, the scale gap versus Vinster's unconfirmed-but-apparently-negligible rating count is enormous).
- **Free general-purpose AI (ChatGPT and similar) remains a structural substitute** for the core "what wine should I order" moment, per prior cycles' press findings; nothing this cycle changes that assessment.
- **The small-AI-sommelier wave is a commodity race Vinster is not ahead in**, and this cycle's search found roughly nine further small entrants (Vinea, WineValueAI, VinoLens, SommelierX, Wine-Oh!, VinoMatch, SommSnap, Wine Pairing – AI Sommelier, AI Wine Scanner) adding to an already crowded field with little independent review traction — a reminder that the barrier to entry for the pattern Vinster is partly built on is very low.
- **Vinster has no monetization model, no visible App Store rating, and (last checked) negligible downloads.** A well-built product with no revenue and no confirmed users is not positioned to defend against incumbent encroachment, let alone against dozens of free-to-build commodity clones.
- **Vinster's own recipe generation is not cellar-aware** — the one differentiator this series has repeatedly identified as the most defensible gap in the market is not yet built in Vinster's own code either.
- **No test suite exists in the codebase**, and seven weeks of zero commits means this has not been addressed even as a maintenance item, independent of market positioning — a long-maintenance risk this cycle's Delectable finding (five-plus years without an update, reported sale, reported strategic pivot away from the app) illustrates concretely.
- **NYT Cooking's AI-recipe backlash is a new, directly relevant risk precedent**: a much larger, better-funded, more trusted incumbent shipped a technically comparable category of feature (AI-modified food content) to real user pushback. Vinster's own recipe-generation feature carries an analogous trust/design risk that this cycle's findings surface for the first time in this series.

---

## Emerging Trends

- **Incumbent and platform encroachment on wine-adjacent data continues to broaden, not just deepen.** Beyond CellarTracker's cellar-platform-to-combined-app move (tracked since last cycle), this cycle finds a first, if narrow, wine-touching feature on a major reservation platform (OpenTable's beverage-tagging beta) and an adjacent Amex/Resy generative-AI dining tool — none diner-facing wine recommendation yet, but all evidence that wine/beverage data is becoming a feature surface for platforms with far larger existing user bases than any dedicated wine app.
- **AI-chat-as-feature remains table stakes, not a differentiator**, across wine (Vivino Sommelier, CellarChat, Vincent, Sommo) and now visibly in food as well (NYT Cooking's recipe modifier).
- **AI content modification carries real, demonstrated user-trust risk**, newly evidenced this cycle by NYT Cooking's subscriber backlash — a signal every AI-generated-content feature in this space, Vinster's recipe generation included, should take seriously in its design, not just its capability.
- **Continued, accelerating commoditization of camera-scan-to-recommendation** at the solo-developer level — this cycle's search alone surfaced roughly nine further small AI-wine-scanner entrants not previously named in this series.
- **Confirmed venture/crowdfunding interest in wine-tech keeps skewing toward B2B infrastructure, retail/fintech, and commerce**, not consumer AI-sommelier apps — this cycle's funding findings (Santé, WineView, VinoBuzz, Cru World Wine) are all commerce/fintech/asset plays, reinforcing rather than changing the pattern tracked since early in this series.
- **Negligible independent review traction for most new entrants persists** — Eno still shows zero/insufficient ratings many months after launch; most of the newly-surfaced small AI-sommelier apps this cycle show no visible rating at all, reinforcing the standing finding that user acquisition, not feature-building, remains the harder problem in this category.

---

## Recommended Differentiators for Vinster

Grounded in the actual code on `main`, with honest defensibility assessments given this cycle's findings:

1. **Cellar-aware recipe generation** — **PROPOSED** (not built; `generate-pairings` re-confirmed this cycle to generate recipes for a scanned wine, not from the user's own cellar inventory, with zero references to cellar data in the function). Remains the single most defensible opportunity identified across this entire series — untouched by any finding in this or the prior cycle. Recommended priority: highest. If pursued, this cycle's NYT Cooking finding argues for designing the feature with explicit, visible user control (clear labeling of AI-generated content, an easy way to see or revert to non-AI behavior) rather than treating generative output as a feature to simply ship and promote.
2. **Deepen and market the diamond-bin cellar visualization** — **BUILT** (`src/api/bins.ts`, 107 migrations). Defensibility: moderate and declining further this cycle — Sommo's newly-detailed rack-slot-highlighting feature adds one more point of functional overlap alongside OENARI, Cru, Vinocell, and Nobli.
3. **Chef-attributed recipe cards with PDF/share export** — **BUILT** (`supabase/functions/generate-pairings`). Defensibility: moderate; still a relatively uncommon combination, though a thinner moat than cellar-aware recipes would be.
4. **Wine-list-scan + food-pairing as a combined claim** — **BUILT**, but defensibility remains **materially weaker** than any pre-CellarTracker-launch cycle's assessment. This cycle's confirmation that CellarTracker's version is still formally beta is a minor, not a major, mitigating detail — the feature is live and shipping either way.
5. **Ship any monetization model at all** — **PROPOSED** (no IAP/payment code exists). Not a feature differentiator, but a precondition for the business, not the product, to survive a competitive landscape that keeps adding entrants on every side (wine incumbents, wine commodity clones, and now food incumbents) while Vinster's own code has not shipped a commit in seven weeks.
6. **Community feed** — **BUILT but disabled** (`COMMUNITY_ENABLED = false`). Defensibility: low on its own — Vivino and Delectable both have far larger (if, per this cycle's Delectable finding, not necessarily actively maintained) communities Vinster's disabled, personal-only feature cannot compete with even if enabled today.

---

## Sources

- [CellarTracker — Scanning a Wine List [BETA], support article](https://support.cellartracker.com/article/111-scanning-a-wine-menu-beta)
- [CellarTracker Helps Diners Choose with Confidence from Restaurant Wine Lists — Webull/press syndication](https://www.webull.com/news/15749774509941760)
- [CellarTracker — Using CellarTracker for Restaurants, support article](https://support.cellartracker.com/article/46-using-cellartracker-for-restaurants)
- [CellarTracker — New Chapter of CellarTracker: Message from the founder](https://Cellartracker.com/m/content/87)
- [CellarTracker — Restaurant Wine Lists product page](https://mobileapp.cellartracker.com/restaurant-wine-lists)
- [Vivino App Store listing](https://apps.apple.com/app/414461255)
- [Vivino — official app page (ratings claims)](https://www.vivino.com/uk/app)
- [Vivino rating/installs — AppPricingLab](https://apppricinglab.com/app/google_play/vivino.web.app)
- [Vivino — Marlvel.ai intelligence report, updated Apr 17, 2026](https://marlvel.ai/intel-report/food-drink/vivino-drink-the-right-wine)
- [Delectable — Scan & Rate Wine, AppFollow listing](https://apps.appfollow.io/ios/delectable-scan-rate-wine/512106648?country=us)
- [Delectable — Chrome-Stats tracker](https://chrome-stats.com/d/id512106648)
- [Delectable Wine — Android AppFollow listing](https://apps.appfollow.io/android/delectable-wine-scan-rate/com.delectable.mobile?country=vn)
- ["Wine App Wars Continue" — Jancis Robinson](https://www.jancisrobinson.com/ja/articles/wine-app-wars-continue)
- [Sommo: All-in-One AI Wine App, App Store listing](https://apps.apple.com/app/id6757319027)
- [Sommo changelog — Featurebase, Wineglass wine-list-scan feature (Apr 3, 2026)](https://sommyai.featurebase.app/changelog/wineglass-wine-list-scan-new-feature)
- [Sommo changelog — Featurebase, Apr 22 2026 entry](https://sommyai.featurebase.app/changelog/untitled-changelog-362)
- [Vinea AI Wine Sommelier, App Store listing](https://apps.apple.com/us/app/id6763097970)
- [Eno — wine and food pairing, App Store listing](https://apps.apple.com/app/id6755405362)
- [Eno — AppGoblin tracker](https://appgoblin.info/apps/6755405362)
- [Nobli — Cellar Management, App Store listing](https://apps.apple.com/us/app/id6745744828)
- [Nobli — AppGoblin tracker](https://appgoblin.info/apps/6745744828)
- [Santé Raises $15 Million Series A — Vinetur](https://www.vinetur.com/en/amp/20261007108549/sante-raises-$15-million-to-expand-ai-software-for-wine-and-spirits-retailers.html)
- [Santé Series A — Webull](https://www.webull.com/news/15702906719716353)
- [WineView raises $765K, relocates to Richmond — grpva.com](https://www.grpva.com/news/wine-club-app-startup-wineview-raises-765k-relocates-to-richmond/)
- [VinoBuzz $10M valuation angel round — Malay Mail](https://www.malaymail.com/news/money/mediaoutreach/2026/04/15/us10-million-tech-startup--vinobuzz-takes-the-traditional-wine-market-by-storm-as-hong-kongs-first-ai-agent-marketplace-for-wine/459894)
- [Cru World Wine raises $1.43M via stake sale — Vinetur](https://www.vinetur.com/en/20260818105795/cru-world-wine-raises-us$143-million-by-selling-7-stake.html)
- [The New York Times is adding more AI features to its Cooking app and users aren't thrilled — Nieman Lab](https://www.niemanlab.org/2026/10/the-new-york-times-is-adding-more-ai-features-to-its-cooking-app-and-users-arent-thrilled/)
- [NYT Cooking Expands AI Recipe Tools, Subscribers Push Back — AI Weekly](https://aiweekly.co/alerts/nyt-cooking-expands-ai-recipe-tools-subscribers-push-back)
- [Samsung Food 2.55.0 — download/changelog aggregator](https://www.presse-citron.net/telecharger/loisirs/cuisine_et_boisson/samsung-food.html)
- [Samsung Food, App Store listing](https://apps.apple.com/app/whisk-recipes-grocery-list/id1133637674)
- [OpenTable rolls out AI-powered product suite for restaurants](https://www.vermoegenszentrum.ch/en/stock-exchange-and-markets/news/opentable-rolls-out-ai-powered-product-suite-restaurants)
- [OpenTable expands its AI dining assistant Concierge — Restaurant Online](https://www.restaurantonline.co.uk/Article/2026/07/22/opentable-expands-its-ai-dining-assistant-concierge/)
- [American Express Dining Companion (Resy) — americanexpress.io](https://americanexpress.io/harnessing-gen-ai-to-power-restaurant-recommendations/)
- [Resy to integrate Tock venues, 25,000+ restaurants total — The Bulkhead Seat](https://thebulkheadseat.com/25000-restaurants-total-resy-to-integrate-tock-venues-this-summer/)
- [Vinster App Store listing](https://apps.apple.com/app/id6763607127) — descriptive copy confirmed via search index this cycle; numeric rating/review count not confirmed
- Prior reports in this series for carried-forward figures and full profiles: `reports/2026-11-04-market-comparison.md`, `reports/2026-10-28-market-comparison.md`, `reports/2026-10-21-market-comparison.md`, `reports/2026-10-14-market-comparison.md`, and earlier reports in `reports/`.
