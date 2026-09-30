# Vinster — Market Comparison: Wine, Food & Combined Wine+Food Apps

**Date:** 2026-09-30
**Prepared by:** Automated Market Research Agent
**Branch analysed:** `main` @ `e7327ec` (app.json version `1.6.0`)
**Prior report:** `reports/2026-09-23-market-comparison.md`

**A note on objectivity:** This is internal competitive intelligence, not marketing copy. Vinster's strengths are not inflated and competitors' advantages are not softened. Where a competitor is materially better than Vinster — in scale, data depth, funding, ratings, community, or polish — that is stated directly. Every Vinster feature cited below as "built" was independently re-verified against the actual code on `main` this cycle (file paths cited throughout); anything not found in the code is marked **PROPOSED**, not built.

**What changed in the code since 2026-09-23:** Nothing. The only commit on `main` since the prior cycle (`80867b1` → `e7327ec`) is the addition of the 2026-09-23 report itself — zero application code changed. App version remains `1.6.0`. Both structural findings from the last two cycles are re-confirmed unchanged this cycle: `COMMUNITY_ENABLED = false` in `src/constants/features.ts` still gates the built social/sharing layer off behind "Arriving Soon" copy, and a repo-wide search again found no RevenueCat/Stripe/IAP library or paywall code anywhere. A full independent codebase audit was re-run this cycle (see Sources) and reconfirms every "BUILT" claim below against current file paths.

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

Vinster remains a genuinely functional, feature-deep pre-launch app. This cycle's codebase audit (83 route files under `app/`, 100+ Supabase migrations, 26 edge functions, zero TODO-only screens found) reconfirms real, production-grade implementations of: camera-based wine-list and label scanning via Claude-vision OCR with streaming and rate-limiting (`supabase/functions/ocr`, `scan-label`); an AI sommelier engine that consumes real stored user taste data — favourite/disliked regions and grapes, style profiles, budget, food-pairing intent — as hard/soft constraints rather than décor (`supabase/functions/recommend`); a cellar data model with literal diamond/triangle-tessellated bins, racks, fridges, and cases (`src/api/bins.ts`, `src/api/racks.ts`); a substantial, DB-backed restaurant-reviews screen; a real food-and-wine pairing engine and a chef-attributed AI recipe generator saved to a "Cookbook" (`supabase/functions/food-wine-pairing`, `generate-pairings`). Every AI surface in the app — OCR, recommendations, pairing, recipes, and catalog search — runs on Anthropic's Claude, not a generic LLM wrapper cobbled from multiple vendors. None of this is scaffolding.

The less flattering half of the picture is equally clear this cycle, and this cycle's research sharpens rather than softens it. **The specific bundle Vinster pitches — scan + AI recommend + cellar/rack-location tracking + food pairing + recipe generation + restaurant reviews — is not a blue-ocean idea.** It has already been decomposed and separately shipped: **Sommo** (label/menu scanning + cellar management + AI pairing against a user's own cellar), **InVintory** ("VinLocate," a 3D rack/bin/shelf location system directly analogous to Vinster's diamond bins, plus an AI pairing assistant), and **Vinomat** (menu scanning + AI recipe generation tuned to a specific bottle) together cover roughly 90% of Vinster's claimed surface area between them, while Vivino (the category giant, tens of millions of users) and CellarTracker (the cellar-data incumbent, which shipped its own AI pairing chatbot, "CellarChat," in mid-2025) already ship cellar management and AI pairing at far larger scale and with far deeper user bases than Vinster can offer at launch. A late-2026 third-party wine-app roundup put it bluntly: "No single app does all of this well, and any product that tells you otherwise is selling you something." Free ChatGPT-based sommelier GPTs and years-old Alexa skills already give away ad hoc food-wine pairing at zero marginal cost, which structurally caps what a paid pairing feature alone can charge for. Vinster also has zero monetization code, a built-but-disabled social layer, no findable public app-store presence or review base of its own, no wine-library browsing UI (despite a real backing catalog), and — new this cycle's emphasis — zero automated test coverage across the entire codebase. The founder should read this plainly: the individual pieces are well-engineered and the exact seven-feature combination is not replicated end-to-end by any single incumbent today, but that gap exists because doing all of it *well* is hard, not because competitors haven't tried pieces of it — several have, and capital in the surrounding wine-tech space is currently flowing toward B2B retail infrastructure (Santé, Scotch), not consumer wine+food apps, which is itself a signal worth taking seriously.

---

## Wine Apps

### Vivino
**What it does:** The category's largest crowdsourced wine database and social ratings feed, camera label scanning, a personalized "Match for You" score, an integrated wine marketplace, cellar tracking, and — under Premium — "Vivino Sommelier," an AI chat feature and a wine-list scanner.
**Scale:** The unambiguous category leader; tens of millions of users.
**Ratings:** ~4.7★ App Store; ~4.6–4.7★ Google Play (~229K–231K reviews).
**Pricing:** Freemium; Premium ≈ $4.99/month or $47.90/year (varies by region), unlocking AI Sommelier, wine-list scanning, full cellar, and ad removal.
**Recent review sentiment (2025–2026):** Praised for database breadth and social discovery. Recurring complaints: features that used to be free are now paywalled behind Premium, full-screen ads for non-payers, marketplace order/shipping problems, slow customer service, and label-scan misrecognition.
**Recent news:** No new funding round since the 2021 $155M Series D (total raised ~$224M); reported ~298 employees as of May 2026 — a mature, self-sustaining business rather than a growth-stage startup, now monetizing primarily via Premium/marketplace/ads.
**Assessment:** The scale and data leader by a wide margin. Its bolt-on AI pairing/chat capability directly narrows the "AI sommelier" gap a new entrant like Vinster is counting on, from the side with by far the largest data moat in the category.

### Delectable
**What it does:** Camera-first label recognition built around a social feed of verified sommeliers, winemakers, and critics rather than crowd averages; a personal wine journal; also covers beer and spirits; integrated Vinous critic reviews under Premium. Owned by Antonio Galloni's Vinous since 2016.
**Ratings:** ~4.7★ App Store (~26K ratings); ~3.9★ Google Play (~6.05K reviews) — a notable iOS/Android gap.
**Pricing:** Free, with a Premium tier for Vinous reviews, priority transcription, and no ads.
**Recent review sentiment:** Praised for clean design and trustworthy, expert-sourced reviews; its food-pairing section has separately been described by reviewers as "brutally simplistic and not useful" — a reminder that pairing is often a bolt-on afterthought in legacy wine-social apps. Android users report more friction than iOS users.
**Recent news:** Still operating independently under Vinous as of early 2026, with a small team (~12 employees) and modest historical funding (~$7M total) — a stable niche operation, not a growth story.
**Assessment:** A smaller, curated alternative whose differentiator — professional/critic credibility and a sommelier-facing social graph — is not something an AI-first entrant replicates quickly, but its actual food-pairing functionality is weak, which is a genuine Vinster opening if Vinster's own pairing engine holds up under scrutiny.

### CellarTracker
**What it does:** The dominant cellar-inventory and tasting-note platform for serious collectors — bottle tracking, valuation, drinking-window guidance, and a review corpus reported at 14M+ tasting notes across 5M+ unique wines and 200M+ bottles tracked (as of April 2026). Launched **"CellarChat"** (AI chat, beta) in **July 2025**, letting users ask for dish pairings sourced from their own logged cellar.
**Ratings:** ~4.8–4.9★ on its own store listings (~2.9K reviews) — a small but highly engaged review base relative to its stated 10M+ annual users.
**Pricing:** Freemium; paid tiers from ~$40/year (up to 100 bottles) to ~$500/year (2,500+ bottles) unlocking valuation, drinking windows, and CellarChat.
**Recent review sentiment:** Praise for being "phenomenal for managing a collection" and best-in-class for serious collectors. Complaints: a recent interface redesign is seen as less user-friendly, requiring more taps for basic rate/consume actions than before.
**Recent news:** Founder Eric LeVine discussed further AI roadmap items (label recognition, AI summaries) in a November 2025 interview; no acquisition found — still independently run.
**Assessment:** The single most important competitive fact for Vinster's cellar+pairing pitch: the deepest-data, most-trusted cellar incumbent already shipped AI food pairing tied to a real personal cellar. It still has no camera label/list scanning and no recipe generation, but it proves the "bolt AI pairing onto an existing cellar app" path is fast for an incumbent with an existing data moat.

### Hello Vino
**What it does:** One of the earliest wine-recommendation apps — a simple, jargon-free "tell me the occasion/food, get a style suggestion" guided flow rather than scan-first discovery, with scanning as a secondary feature.
**Ratings:** ~4.6★ App Store (~6.7K ratings); only ~3.3★ on Android (~930 ratings) — much weaker on Android.
**Pricing:** Free with ads; small one-time IAPs (~$3 to remove ads, ~$5 for unlimited scans) rather than a subscription.
**Recent review sentiment:** Praised for simplicity/approachability for beginners. Multiple review aggregators describe it as "basic" and "less updated"; users complain about full-page ads and paywalled scan limits despite an already-high headline rating.
**Recent news:** No funding, pivot, or shutdown news found — a legacy, lightly-maintained app coasting on an older rating base rather than actively competing on AI.
**Assessment:** Limited current relevance as a direct threat, but a reminder that Vinster's occasion/food-first recommendation framing is not new — a free app has offered a version of it for well over a decade.

### Sommo (notable 2025–2026 AI-sommelier entrant)
**What it does:** An "all-in-one" pocket sommelier — AI label and restaurant wine-list scanning, virtual cellar management, a personal tasting journal, a WSET-aligned wine-education module, and AI food pairing that reasons over the wines already in the user's own cellar. Builds a "Taste DNA" preference profile from user ratings. Built and marketed as a single-founder product (London-based engineer Gökhan Arkan, launched late 2025).
**Ratings:** 4.9★ App Store (~17 ratings — very early-stage, statistically negligible); 4.5 Trustpilot TrustScore (~18 reviews).
**Pricing:** Free tier (5 lifetime scans, fundamentals module, 30-day journal); Premium ~$4.99/month, or ~$2.50/month effective at $29.99/year with a 3-day trial — notably cheaper than Vivino Premium.
**Recent review sentiment:** Early reviews are strongly positive but the sample size (~17–18 reviews total) is too small to be meaningful yet.
**Recent news:** Featured in multiple "best wine apps 2026" roundups as a fast-rising new entrant; illustrates that a solo developer can now credibly ship a full AI-sommelier feature set, which lowers the competitive moat for feature parity generally.
**Assessment:** The closest single-app match to Vinster's stated feature scope among pure wine apps (scan + cellar + pairing + education), missing only recipe generation. Currently a non-threat by scale, but a proof-of-concept that Vinster's exact positioning is buildable by very small teams.

### Wine Spectator (WineRatings+)
**What it does:** Access to Wine Spectator's professional critic database (~300,000–400,000+ expert reviews, 1,000+ new reviews monthly) and editors' picks — positioned on editorial/critic authority rather than crowd or AI scoring.
**Ratings:** ~4.6–4.65★ (~869–900 ratings, iOS-focused).
**Pricing:** 30-day free trial, then $2.99/month for full critic-database access; separate smaller IAPs also exist.
**Recent review sentiment:** Limited fresh 2025–2026 commentary found; a stable, mature reference tool (published by M. Shanken Communications) rather than a rapidly iterating product.
**Recent news:** No AI-sommelier feature found — this remains a clear capability gap relative to AI-native competitors, but also not the value proposition this app is selling.
**Assessment:** Not a direct feature competitor (no scanning, no AI recommendations), but a reminder that "professional critic authority" is a distinct, trusted positioning that Vinster's AI-generated recommendations do not carry and cannot easily borrow.

### The wider "Somm AI"-branded and B2B wave
A fragmented cluster of similarly-named, small, mostly 2024–2026-launched apps (**Somm AI: Wine Menu Scanner**, **Somm AI – Wine Expert**, sommai.io, aisomm.io) does restaurant wine-*list* scanning with AI-generated pairing picks — a pattern distinct from Vivino/Delectable's single-label scan focus — but with insufficient public rating data to assess individually; brand confusion across near-identical names is itself notable. Separately, 2024–2026 has seen a wave of funded **B2B "AI sommelier as a service"** startups selling to restaurants/retailers/hotels rather than consumers directly: **Santé** ($7.6M seed, Bonfire Ventures/Y Combinator/Operator Collective, building AI+fintech back-office infrastructure for wine/liquor retail, reporting 400%+ YoY growth), **VinoBuzz** (Hong Kong, ~$10M valuation angel round, conversational AI sommelier + marketplace checkout), **Vinolin** (Germany, €200K pre-seed, B2B winery platform, 15 wineries onboarded by early 2025), **The Wine Engine/"Grapevine"** and **Sommelier.bot** (white-label AI sommelier chatbots for merchants/hotels). **Wine Ring**, an early taste-personalization pioneer, is reported by a September 2026 wine-app roundup as having "gone dark" — though sourcing on the exact shutdown date is thin and should be independently verified before being treated as settled fact.
**Assessment:** The consumer-facing sub-category is crowded and low-differentiation at the branding level; the more capital-intensive, faster-growing lane right now is B2B infrastructure for the wine trade, not consumer apps — a strategic signal for where investor conviction currently sits in this space.

---

## Food / Recipe / Pairing Apps

### Samsung Food (formerly Whisk)
**What it does:** Samsung's flagship AI food/recipe platform — recipe import from any website or screenshot, "Smart Cook" guided cooking, AI-personalized meal plans (Plus tier), Vision AI food-photo calorie estimation on Galaxy devices, and SmartThings appliance integration.
**Scale:** 6M+ users, a 4.5M-member recipe community.
**Ratings:** ~4.8★ App Store (~6.4K US ratings, ~1.8K UK); ~4.5★ Google Play (~22–23K reviews).
**Pricing:** Free tier; Samsung Food+ at $6.99/month or $59.99/year (7-day trial) for AI meal plans, advanced nutrition tracking, and ad removal.
**Recent review sentiment:** A high headline rating masks recurring, months-old unresolved bugs: edited recipe instructions and serving-size changes not saving or not propagating to the meal planner/shopping list, and paid-tier recommendations not reflecting set dietary preferences.
**Wine/beverage pairing:** None found.
**Assessment:** The best-resourced, most hardware-integrated food app in this research. No wine pairing today, but Samsung has the AI investment and device distribution to add it faster than almost any other competitor here, if it ever chose to prioritize it.

### Yummly — **discontinued December 20, 2024**
**What it did:** A large recipe database with camera-based ingredient/pantry recognition and a "Yum" taste-profile personalization engine; smart-thermometer hardware integration.
**What happened:** Owner Whirlpool laid off the entire Yummly team in April 2024 as a strategic pivot toward generative AI investment elsewhere in the business, then fully shut the app and website down in December 2024. Saved recipes and recipe boxes were lost with no bulk-export tool provided; the paired smart-thermometer hardware also lost app functionality, with owners offered roughly $30–$87 in reimbursement. As of this cycle, competitor blogs still market themselves explicitly as "Yummly alternatives," and there is no relaunch.
**Assessment:** A direct cautionary precedent for any well-funded, corporate-owned food/AI app: technical capability and prior scale do not guarantee survival when a parent company reprioritizes.

### SideChef
**What it does:** 16,000+ step-by-step recipes with voice-guided cook mode; **RecipeGen AI** (launched August 2024) turns a photo of any dish — restaurant plate, home-cooked meal, or social-media screenshot — into a full recipe plus a shoppable list of missing ingredients; a barcode scanner for pantry stocking.
**Ratings:** ~4.7★ App Store (~1.7K ratings); ~4.4★ Google Play (~8.25K reviews).
**Pricing:** Free app; Premium $4.99/month or $49.99/year for exclusive recipes and meal plans.
**Recent review sentiment:** Recipe variety and guided cook mode are praised; RecipeGen AI is seen as novel but "hit or miss" on accuracy — one review found it missed specific components (e.g., sourdough focaccia, strawberry butter) and hallucinated ingredients not actually present (e.g., added bell peppers).
**Wine/beverage pairing:** None found.
**Recent news:** Actively pivoting toward a B2B "SideChef AI" business unit licensing its Chefbot, RecipeGen, and meal-planning AI to retailers and appliance makers (announced August 2024, continuing through 2025–2026).
**Assessment:** The clearest evidence in this research that photo-to-recipe AI is a real, live capability but still an immature one — a relevant caution for Vinster's own vision-AI-dependent pipeline (label/list scanning), even though the underlying task (identify wines on a printed list) is arguably more constrained and tractable than "identify a finished dish from a photo."

### Kitchen Stories
**What it does:** A large, professionally shot editorial recipe library (~7,500 recipes) with a widely imitated distraction-free "Cook Mode"; Plus tier adds ingredient search and recipe-saving from the open web. Deliberately non-AI: no ingredient-camera or AI-recipe-generation feature.
**Ratings:** ~4.8★ App Store (~23K ratings); ~4.1★ Google Play (~34.4K reviews) — a notable App Store/Play Store gap.
**Pricing:** Free base app; Kitchen Stories Plus at €7.99/month or €79.99/year (7-day trial).
**Recent review sentiment:** Historically praised for high-quality, ad-free video content; more recent (2025–2026) reviews report a shift toward ads/IAPs, with some users describing a 7-day free trial that appeared to charge before ever activating, plus stability complaints (crashes, disappearing favorites, repeated forced profile creation).
**Wine/beverage pairing:** None found.
**Assessment:** Proof that a non-AI, editorially curated food app can still command a loyal following purely on content quality — a reminder that "we use AI" is not automatically a stronger pitch than "our content/UX is simply better," and that monetization-tightening (not AI investment) appears to be this app's current strategic focus.

### Mealime — **shutting down October 21, 2026**
**What it does (until shutdown):** A simple, curated weeknight-recipe library with diet-based weekly meal plans and a consolidated aisle-organized shopping list; deliberately small library rather than a huge searchable database.
**Ratings:** ~4.8★ App Store (35,000+ reviews); ~4.7★ Google Play — among the highest-rated apps in this entire report by volume and score. (One third-party NLP sentiment analysis of 53,000+ reviews claimed 66.7% were actually negative in tone despite the high star average — a useful caution about star-rating reliability generally, applicable across this whole report.)
**What's happening:** Owned by grocery giant Albertsons Companies since March 2022; Albertsons announced in September 2026 that Mealime will shut down October 21, 2026, folding its recipe catalogue into "Meals Hub," a native feature inside Albertsons' own grocery-banner apps (Safeway, Vons, Jewel-Osco, etc.). Pro subscriptions were made free for remaining users and will not renew; user accounts and data will be deleted and do not transfer.
**Wine/beverage pairing:** None found.
**Assessment:** The highest-rated, highest-review-volume app in this entire report — and it is still being shut down as a standalone product. This is the clearest possible signal that strong product-market fit alone does not protect a standalone food app from a parent company's decision to fold functionality into an owned retail ecosystem instead.

### Other notable and emerging entrants
**PlateJoy** (dietitian-informed personalization, $69–99/year) was acquired by RVO Health/Healthline Media in 2021 and **shut down July 1, 2025** (removed from Google Play in March 2025), with reasoning cited that a human-curated $12–16/month app could not compete economically against pure-AI planners charging $5–8/month for comparable personalization; its recipes/users are being folded into RVO Health's "Wellos" app. **Plant Jammer** (Danish AI plant-based recipe generator) raised €4M from Vækstfonden, Dr. Oetker, and Miele Ventures, with 100,000+ households using it across Germany/UK/Denmark/US. A wave of smaller, bootstrapped, pure-AI-generation tools (**ChefGPT, DishGen, FoodiePrep, RipePlate, FoodsGPT**) form a crowded, fragmented, largely SEO-content-driven "best AI recipe app" category rather than a market with a few dominant funded players — several of these run self-promotional "best AI recipe app" ranking blogs placing themselves first, a low-substance content-marketing pattern worth discounting when reading unaudited "best app" roundups elsewhere.

**Pattern across this whole category:** three of the eight apps researched (Yummly, PlateJoy, Mealime) have shut down or announced shutdown within roughly 24 months, each folded into a larger parent's owned ecosystem rather than continuing as an independent consumer destination — a structural headwind for any standalone recipe/meal app, Vinster's food side included. Across every food/recipe app researched this cycle, **none has a native wine or beverage-pairing feature** — this remains a clean, verifiable white space relative to mainstream recipe apps specifically (though not relative to the wine-app side of the market, where pairing already exists in several products — see below).

---

## Combined Wine + Food / Dining Space

This is the segment most directly relevant to Vinster's stated positioning, and this cycle's research makes clear it is **not empty**.

**Direct combined competitors (scan + cellar + pairing, in various combinations):**
- **Sommo** — see Wine Apps above; label/menu scanning + cellar management + AI pairing against the user's own cellar + education. No confirmed recipe generation.
- **InVintory** — "VinLocate," a 3D visual map of a user's *exact physical* storage (custom racks, bins, shelves, fridges) directly analogous to Vinster's diamond-bin system; label scanning; a 2M+ sommelier-curated wine database; "Vincent," an AI assistant recommending food pairings from the user's own collection. No recipe generation confirmed.
- **Vinomat** ("Pair Wine & Recipes") — scans restaurant menus/wine lists for instant pairings, and **generates full custom recipes tuned to a specific bottle** (simple/vegetarian/luxury tiers) plus an AI cooking-technique chat and a 0–10 pairing-score system. This is the closest found competitor to Vinster's recipe-generation pillar specifically. 4.4/5 rating. No cellar/rack inventory management found.
- Smaller overlapping entrants: **Ask Sommelier AI** (restaurant wine-list scanning ranked by palate/budget/dish), **Pocket Sommelier** (photo-of-meal → wine pairings with a pairability %, plus a list scanner, 4.3★ App Store), **AI Sommelier-Wine ID & Cellar** (label ID + cellar + drinking-window alerts + pairings), **WinePairingAI**, **Wine GPT**.

**Verdict on direct overlap:** No single app is a perfect superset match to Vinster's seven-feature claim, but **Sommo + InVintory + Vinomat together already cover roughly 90% of that surface area** between them. The specific combination Vinster pitches is an assembly of features each already shipped and marketed separately today — not a blue-ocean idea.

**Restaurant-discovery and reservation apps:** **OpenTable** and **Resy** engage with wine purely editorially — OpenTable's annual "100 Best Restaurants for Wine Lovers" diner-review-derived list, Resy's quarterly "Wine Hit List" city guides — with no in-app sommelier tool, wine-list scoring, or recommendation engine. **Yelp** has no dedicated wine feature at all, but is building relevant underlying technology: its **"Menu Vision"** feature (blogged August 2026) does real-time computer-vision dish recognition overlaid live on a scanned restaurant menu — food-only today, but architecturally the same OCR/CV stack a wine-list scanner needs. This is a real platform risk: any of these three could extend existing groundwork into wine-list scanning as a feature update, though none currently has a clear commercial incentive to do so (they monetize reservations, not wine engagement).

**Explicit food-and-wine pairing tools:** Beyond Delectable's widely-criticized pairing section (see above), **free ChatGPT-based custom GPTs** ("The Sommelier," "Wine GPT," "Perfect Pairing") already do ad hoc conversational food-wine pairing at zero marginal cost with no app install required. **Sommelier.bot** sells a white-label B2B AI sommelier chatbot to merchants/hotels analyzing 30+ wine attributes including pairings — evidence the pairing-AI layer is already being commoditized and sold as trade infrastructure, not just offered to consumers. **Amazon Alexa** has shipped multiple wine-pairing voice skills since roughly 2017 ("Perfect Wine," "Wine Sommelier," "MySomm") — voice-based sommelier assistance is a dated, low-engagement, but functionally solved category.

**Cellar/inventory apps beyond CellarTracker:** **InVintory** (VinLocate), **VinoCell** (graphical bottle-position mapping), **Vinotag** ("show in my cellar" locator), **Sommo**, **Cellared**, and **WineBanq** all compete on cellar tracking, several with rack/bin-level physical-location features similar in spirit to Vinster's diamond bins. A late-2026 comparison piece (12x75.com) explicitly concluded: **"No single app does all of this well, and any product that tells you otherwise is selling you something,"** recommending a *stack* of multiple apps rather than trusting any single all-in-one claim — directly relevant, skeptical third-party framing for this report's own "combined app" assessment.

**Funding, launches, shutdowns (2024–2026):** **Santé** ($7.6M seed, Feb 2026) and **Scotch** ($20M Series A after a $10M 2024 seed, backed by VMG Partners/First Round/Lerer Hippeau/Toba) are both B2B AI infrastructure for liquor/wine *retailers* (payments, inventory, back-office), not consumer pairing apps. **Vint**, a fractional wine-investing platform, is winding down in 2026 after a net loss and going-concern warning — a cautionary data point that not all wine-tech capital is finding product-market fit. Consumer wine apps **Wine Ring, Tipple, and The Wine Coach** are reported defunct/abandoned. The overall "digital wine app" market is sized at roughly $1.8B (2025), forecast to $4.6B by 2034. Notably, **the funding that is actually flowing is going to B2B retail/fintech infrastructure, not consumer AI-sommelier-plus-recipes apps** — a signal that investors currently see more differentiated value in the trade/back-office layer than in another consumer pairing app.

**Broader platform moves:** **DoorDash** launched "Ask DoorDash," a conversational AI shopping assistant for natural-language basket building; **Instacart** launched "Clementine" and "Smart Shop"/"Inspiration Pages" for dietary/taste personalization, built on 1.6B+ historical orders and a 2B+ item catalog — neither has a wine-specific AI feature yet, but both have the personalization infrastructure and (for Instacart) existing alcohol-delivery partnerships to point at wine/alcohol categories at relatively low incremental cost. No Google- or Amazon-branded AI wine-recommendation product was found beyond legacy Alexa skills — a real gap, but a low bar for a resourced incumbent to clear if it chose to.

**Objective verdict — is "wine + food + cellar in one app" a white space or crowded?** **Closer to crowded and easily replicated than to white space.** Every individual component — cellar tracking, AI food pairing, label/menu scanning, recipe generation — already exists, separately proven, and is actively being recombined by others right now: CellarTracker (the cellar incumbent) bolted on AI pairing; Sommo and InVintory already combine cellar tracking with AI pairing and scanning; Vinomat already combines menu scanning with bottle-specific recipe generation; Vivino (the category giant) already has cellar management and pairing, just at lower per-feature depth. No single dominant, venture-scaled winner has emerged for the *combined* proposition specifically, and funding into this exact niche is thin (mostly bootstrapped or sub-$10M) — which cuts both ways: it could mean an overlooked opportunity, or it could mean the segment does not yet support venture-scale unit economics, and the wave of consumer-wine-app failures (Wine Ring, Tipple, The Wine Coach) argues for the latter as much as the former. The narrowest, most genuinely underserved sliver identified across all four research streams remains **generative recipe creation tied to a persistent, personal cellar inventory** (e.g., a recipe designed specifically around the three bottles in a user's cellar that are past their peak) — no competitor found does this well today, including Vinomat and InVintory individually. That is a real, if narrow, opportunity; the broader "combined wine+food app" positioning, on its own, is not.

---

## Feature Comparison Matrix

| App | Category | Label/List Scan (camera) | AI Recommendations/Chat | Cellar / Rack-Location Mgmt | Food Pairing | Recipe Generation | Community/Social | Rating (approx.) | Price |
|---|---|---|---|---|---|---|---|---|---|
| **Vinster** | Combined | **BUILT** — Claude vision OCR, list + label (`supabase/functions/ocr`, `scan-label`) | **BUILT** — Claude sommelier engine using real profile data (`supabase/functions/recommend`) | **BUILT** — racks, diamond/triangle bins, fridges, cases (`src/api/bins.ts`, `src/api/racks.ts`) | **BUILT** — Claude pairing engine (`supabase/functions/food-wine-pairing`) | **BUILT** — AI, 50+ named chefs, constraint-engineered (`supabase/functions/generate-pairings`) | **BUILT but disabled** (`COMMUNITY_ENABLED = false`) | No public listing found | No pricing/IAP code exists |
| Vivino | Wine | Yes (label; list under Premium) | Yes ("Vivino Sommelier" chat) | Yes | Yes (reported generic) | No | Yes (largest crowd DB) | 4.7★ iOS / 4.6-4.7★ Play (~230K) | Free + $4.99/mo |
| Delectable | Wine | Yes (label) | No | No | Yes (weak, "brutally simplistic" per reviewers) | No | Yes (pro/critic network) | 4.7★ iOS (~26K) / 3.9★ Play (~6K) | Free + Premium |
| CellarTracker | Wine/Cellar | No | Yes ("CellarChat," 2025) | Yes (deepest data, 200M+ bottles tracked) | Yes (via CellarChat) | No | Yes (14M+ tasting notes) | ~4.8-4.9★ (small review base) | Free + $40-$500/yr |
| Hello Vino | Wine | Yes (secondary) | Yes (guided, basic) | No | Basic | No | No | 4.6★ iOS / 3.3★ Play | Free + small IAPs |
| Sommo | Combined | Yes | Yes | Yes | Yes (against own cellar) | No | No | Too new to rate (~17-18 reviews) | Free tier + $2.50-4.99/mo |
| InVintory | Combined | Yes | Yes ("Vincent" assistant) | Yes (VinLocate 3D rack/bin) | Yes | No | No | Not found | Not confirmed |
| Vinomat | Combined | Yes (menus) | Limited | No | Yes (score-based) | Yes (bottle-specific) | No | 4.4/5 | Not confirmed |
| Wine Spectator (WineRatings+) | Wine | No | No | No | No | No | No | 4.6-4.65★ (~900) | Free + $2.99/mo |
| Samsung Food | Recipe | No (ingredient photo, not wine) | Yes (meal planning) | No | No | Yes (import + AI plans) | No | 4.8★ iOS / 4.5★ Play | Free + $6.99/mo |
| SideChef | Recipe | No (dish photo → recipe) | Limited | No | No | Yes (RecipeGen AI, inconsistent accuracy) | No | 4.7★ iOS / 4.4★ Play | Free + $4.99/mo |
| Kitchen Stories | Recipe | No | No | No | No | No (editorial only) | No | 4.8★ iOS / 4.1★ Play | Free + Plus tier |
| Yummly | Recipe | No (**shut down Dec 2024**) | — | — | — | — | — | 4.8★ (historical) | — |
| Mealime | Recipe | No (**shutting down Oct 2026**) | Limited | No | No | No | No | 4.8★ iOS / 4.7★ Play | Free (Pro made free pre-shutdown) |

*Ratings/prices are the most precise figures found via web search as of September 2026; exact live App Store/Play figures could not be independently fetched from this environment (restricted network egress to apps.apple.com/play.google.com) and should be re-verified before external use.*

---

## Market Gaps & Opportunities

1. **Cellar-aware recipe generation.** No competitor found — including Vinomat (recipes tied to a bottle, but not a persistent cellar) or InVintory/Sommo (cellar-aware pairing, but no recipe generation) — combines all three: real cellar state, AI pairing, and full recipe generation in one loop. Vinster's `generate-pairings` engine is already built for constraint-driven generation, and the cellar data model already exists; wiring the two together (e.g., designing a recipe around a specific bottle nearing the end of its drinking window) is the single most defensible, narrowly-scoped opportunity identified across all four research streams this cycle.
2. **Restaurant wine-list scanning + food pairing in one flow, at the table.** Most competitors do either list-scanning (Vivino, Sommo, Ask Sommelier AI, WinePairingAI) or pairing-from-a-recipe (Vinomat, Decanto), but few combine "scan the list in front of you right now, order food, get a pairing" as a single in-restaurant session. Vinster's scan → recommend → pairing pipeline already supports this; it is a real strength, though not a unique one (Sommo and Pocket Sommelier attempt versions of it too).
3. **Wine pairing is a clean white space relative to mainstream recipe apps specifically.** None of Samsung Food, SideChef, Kitchen Stories, Mealime, Yummly, or PlateJoy has any wine/beverage pairing feature. If Vinster's food side is genuinely competitive on recipe quality/UX with those apps, wine pairing is a real differentiator *on that side of the market* — though this gap does not exist on the wine-app side, where pairing already ships in several products.
4. **Editorial/no-AI polish still wins loyalty (Kitchen Stories, Mealime's high ratings despite shutdown).** Not a feature gap, but a positioning reminder: users reward reliability and content quality, not AI novelty alone. Vinster's production-grade error handling in its AI paths (retries, streaming, rate limits) is a real asset worth foregrounding over "we use AI" messaging alone.
5. **Restaurant-discovery platforms have deliberately not built sommelier tooling — but are building the adjacent tech (Yelp's Menu Vision).** No current partnership inbound, but also a live platform risk if any of the big three extend existing menu-CV work to wine lists.

---

## Risks & Where Competitors Are Stronger

Stated plainly, without hedging:

- **Data moat.** Vivino's crowdsourced ratings base and CellarTracker's 14M+ tasting notes and 200M+ tracked bottles dwarf anything Vinster can offer at launch; Vinster's wine catalog is real but young (seeded and grown from scans/searches) and cannot compete on breadth for years, if ever.
- **Brand and distribution.** Vivino (tens of millions of users, marketplace revenue), Samsung Food (Samsung's hardware/TV/fridge ecosystem, 6M+ users), and CellarTracker (trusted by serious collectors, 10M+ annual users) all have distribution advantages Vinster currently has none of — no public App Store/Play listing or review base was found for Vinster this cycle either.
- **AI pairing and cellar-aware recommendations are no longer Vinster's alone.** CellarTracker shipped CellarChat; Vivino shipped Vivino Sommelier; Sommo and InVintory already combine cellar tracking with AI pairing and scanning; Vinomat already generates bottle-specific recipes. The "AI sommelier that knows your cellar" pitch is now made, in some form, by at least four to five other live products.
- **Monetization is completely unbuilt.** Every competitor profiled above — even the free ones — has a working pricing or subscription model. Vinster has zero code for this; it is not a matter of flipping a flag, it would need to be built from scratch.
- **Community/social is built but off.** Vivino, CellarTracker, and Delectable all have live, populated social/community layers that create network effects and stickiness. Vinster's equivalent code exists (`src/api/community.ts`) but remains switched off (`COMMUNITY_ENABLED = false`) with zero real user-generated content — a structural disadvantage versus every major wine-app competitor's core retention mechanism.
- **Standalone recipe/meal apps are being absorbed into retailer/hardware ecosystems.** Yummly (Whirlpool, shut down), Mealime (Albertsons, shutting down into "Meals Hub"), and PlateJoy (RVO Health, shut down into "Wellos") show that even well-rated standalone food apps have struggled to survive independently in 2024–2026. Vinster, as an independent standalone app spanning an adjacent category, faces the same structural pressure without a parent-company ecosystem to fall back into.
- **Consumer wine-tech capital and traction are thin and partly negative.** Investment in this exact niche is flowing to B2B infrastructure (Santé, Scotch), not consumer pairing apps; several consumer wine apps (Wine Ring, Tipple, The Wine Coach) are reported defunct; and free tools (ChatGPT-based sommelier GPTs, Alexa skills) already give away ad hoc pairing, structurally capping what any paid pairing feature can charge for on its own.
- **Zero automated test coverage.** This cycle's codebase audit found no test files (`*.test.*`, `*.spec.*`, `__tests__`) anywhere in the repository, despite 83 screens, 100+ migrations, and 26 production Claude-backed edge functions. This is a real engineering-risk gap independent of market positioning — a regression in a payment-adjacent or recommendation-adjacent path would currently be caught only by manual testing or in production.
- **Reliability is a known unsolved problem industry-wide, not just for Vinster.** SideChef's RecipeGen AI has documented hallucination/omission issues on photo-to-recipe generation; independent wine-label-scan testing elsewhere has shown accuracy dropping sharply on damaged or non-Latin labels. Vinster's Claude-vision approach has not been independently tested at scale; this is a fair open question for a pre-launch product, not a demonstrated failure, but it should not be assumed solved either.

---

## Emerging Trends

- **Generative AI in food/recipe apps is now mainstream, not novel.** Samsung Food's Vision AI, SideChef's RecipeGen AI, and a wave of small AI-native recipe generators (ChefGPT, DishGen, FoodiePrep, Plant Jammer) all launched or expanded in 2024–2026. Photo-to-recipe and camera-based ingredient recognition are becoming table stakes the way label scanning is table stakes in wine apps — but accuracy across all of them remains inconsistent, an open engineering problem rather than a solved one.
- **Recipe-app consolidation into retailer/hardware ecosystems.** Yummly (Whirlpool, shut down Dec 2024), PlateJoy (RVO Health, shut down July 2025), and Mealime (Albertsons, shutting down Oct 2026 into "Meals Hub") show three notable independent food-app brands exiting or being folded into a parent within about two years — a clear pattern, not an isolated event.
- **Conversational/agentic commerce assistants are extending into food and, adjacently, could extend into wine.** DoorDash's "Ask DoorDash" and Instacart's "Clementine"/"Smart Shop" both launched natural-language, personalization-driven shopping assistants in 2025–2026, built on large historical order datasets; neither currently targets wine/alcohol specifically, but the infrastructure and (for Instacart) existing alcohol-delivery partnerships make that a low-cost extension if either company chose to pursue it.
- **B2B "AI sommelier as a service" is attracting more capital than consumer wine+food apps right now.** Santé ($7.6M seed) and Scotch ($20M Series A) are both backend/retail-infrastructure plays for the wine and liquor trade; Vinolin, Sommelier.bot, and VinoBuzz all target merchants/hotels/wineries rather than consumers. This is where investor conviction currently sits in wine-tech, not in consumer-facing pairing apps.
- **Computer-vision menu/dish recognition is becoming mainstream platform infrastructure.** Yelp's "Menu Vision" (Aug 2026) does real-time dish recognition on scanned restaurant menus — the same underlying OCR/CV category Vinster's wine-list scanner depends on, now being built independently by a major incumbent for an adjacent (food) use case.
- **Star ratings are a weak signal on their own across this entire market.** Multiple apps in this report (Samsung Food, Mealime, Vivino) show high headline star ratings alongside substantive, specific, and recurring written complaints (bugs, billing, paywalling, limited personalization); one third-party sentiment analysis found 66.7% of Mealime's reviews were negative in tone despite a 4.7–4.8★ average. Any future comparison of Vinster's own ratings to competitors' should account for this gap between star average and actual sentiment.

---

## Recommended Differentiators for Vinster

Each item below is explicitly marked **BUILT** (verified in the code on `main` this cycle) or **PROPOSED** (not found in code), with an honest defensibility read informed by this cycle's competitive research.

1. **Cellar-aware, constraint-engineered recipe generation — PARTIALLY BUILT, extend for defensibility.** The recipe-generation engine (`supabase/functions/generate-pairings`) and cellar data model (`src/api/bins.ts`, `src/api/racks.ts`) both exist and are genuinely deep, but they are not yet wired together — recipe generation does not currently read the user's actual cellar contents to design around specific aging bottles. **Defensibility: moderate-to-high.** This remains the one three-way combination (AI recipe generation + real cellar state + pairing) that no competitor in this research — including Vinomat, InVintory, and Sommo individually — does well; it is an achievable near-term extension of existing code, not a rebuild.

2. **In-restaurant scan-to-pairing flow — BUILT.** Wine-list OCR (`supabase/functions/ocr`) → sommelier recommendation (`supabase/functions/recommend`) → food pairing (`supabase/functions/food-wine-pairing`), all in one session, is real and functional today. **Defensibility: low-to-moderate.** Sommo, Pocket Sommelier, Ask Sommelier AI, and WinePairingAI all do versions of this; the pattern itself is not unique, though Vinster's engineering (streaming OCR, retries, rate limiting) may be more production-hardened than some of the newer, smaller entrants based on available evidence.

3. **Diamond-bin/spatial cellar modeling — BUILT.** Genuinely detailed spatial modeling (`src/api/bins.ts`, diamond/triangle tessellated grids) exists in code. **Defensibility: low.** InVintory's "VinLocate" already ships a comparable (arguably more mature, 3D) rack/bin/shelf visualization concept; this is a UX/engineering investment worth having, but not a hard-to-replicate technical moat.

4. **Price-integrity discipline (never showing an AI-invented price) — BUILT.** The recommendation engine is architected to rely only on OCR'd menu prices or clearly-labeled market data rather than a model-guessed number (`supabase/functions/recommend`). **Defensibility: moderate.** This is a trust-building engineering discipline invisible from the outside — a legitimate, quietly defensible differentiator if explicitly surfaced to users as a trust claim ("we never guess a price"), something no competitor in this research was found to advertise.

5. **Wine-library browsing UI — PROPOSED (backend exists, no user-facing browse screen).** A real `wines_catalog` table and Claude-backed search/seed functions exist, but this cycle's audit found they are used only for manual-entry typeahead, not a dedicated "browse the library" screen. **Defensibility: low technical lift, moderate value** — this is table stakes functionality (Vivino, CellarTracker, and Wine Spectator all offer catalog browsing) that Vinster is currently missing on the front end despite having the backend to support it cheaply.

6. **Community/social layer — BUILT but disabled, not a current differentiator.** Real code exists (`src/api/community.ts`, blog/journal features live) but `COMMUNITY_ENABLED = false` means the core social feed (wine reviews, restaurant reviews, connections) shows "Arriving Soon" with zero live user-generated content today. **Defensibility: none until launched**, and even then it starts from zero against Vivino's and CellarTracker's massive existing user bases — this is a catch-up feature, not a differentiator, unless Vinster deliberately builds a different community mechanic (e.g., private/small-group sharing) as a contrast to the crowded public-rating model most incumbents run.

7. **Monetization model — PROPOSED, entirely unbuilt.** No pricing tiers, paywalls, or purchase code exist anywhere in the repository, confirmed again this cycle. This is not a differentiator; it is a blocking gap relative to every competitor profiled in this report, all of whom — even the free ones — have a working revenue model today.

8. **Automated test coverage — PROPOSED, entirely unbuilt.** Not a market differentiator, but flagged here because it directly affects how safely Vinster can ship the recommended feature work above (item 1 in particular touches recommendation, pairing, and recipe logic simultaneously) without regressions.

9. **"AI sommelier that knows your cellar" as a headline pitch — weak, not recommended as-is.** This exact framing is now also used, in some form, by CellarTracker, Vivino, Sommo, and InVintory. Leading with it risks sounding like a "me too" claim in a market where a third-party roundup already warns readers against trusting any single app's all-in-one claim. A more defensible, narrower pitch grounded in what's actually built and genuinely rarer is closer to: **"the only app that designs a recipe around the specific bottles already aging in your cellar"** — once item 1 above is wired up — paired with the price-integrity guarantee (item 4) as a trust differentiator.

---

## Sources

**Vinster codebase (internal, `main` @ `e7327ec`):** `package.json`; `app/` route tree (`app/scan/camera.tsx`, `app/label/camera.tsx`, `app/cellar/scan-lineup.tsx`, `app/cellar/racks.tsx`, `app/cellar/bin/[binId].tsx`, `app/cellar/bin/new.tsx`, `app/cellar/bin/resize.tsx`, `app/restaurants/reviews.tsx`, `app/chef/find-pairing.tsx`, `app/chef/pairing-results.tsx`, `app/(tabs)/community.tsx`, `app/community/blog/*`); `supabase/functions/ocr`, `scan-label`, `recommend`, `food-wine-pairing`, `generate-pairings`, `seed-catalog`, `wine-search`; `supabase/migrations/018_restaurant_ratings.sql`, `038`, `069_storage_cases.sql`, `073_case_packaging_types.sql`, `088_restaurant_photo.sql`; `src/api/racks.ts`, `src/api/bins.ts`, `src/api/restaurantSessions.ts`, `src/api/recipeCollections.ts`, `src/api/chosenRecipes.ts`, `src/api/community.ts`, `src/constants/features.ts`; `src/hooks/useAuth.tsx`; `src/services/appleAuth.ts`, `src/services/googleAuth.ts`; `src/api/ocrStream.ts`.

**Wine apps:**
- https://play.google.com/store/apps/details?id=vivino.web.app
- https://www.vivino.com/en/articles/premium-pricing-guide-en
- https://fourweekmba.com/how-does-vivino-make-money-vivino-business-model/
- https://justuseapp.com/en/app/414461255/vivino-buy-the-right-wine/reviews
- https://www.complaintsboard.com/vivino-b149632
- https://news.crunchbase.com/startups/investors-pour-20m-wine-curation-delivery-app-vivino/
- https://tracxn.com/d/companies/vivino
- https://apps.apple.com/us/app/delectable-scan-rate-wine/id512106648
- https://play.google.com/store/apps/details?id=com.delectable.mobile
- https://pitchbook.com/profiles/company/56312-92
- https://tracxn.com/d/companies/delectable
- https://punchdrink.com/articles/how-the-delectable-app-is-eliminating-wines-third-wall/
- https://www.tastingtable.com/689524/your-new-personal-sommelier-is-the-delectable-wine-app/
- https://www.sommwine.com/4-free-wine-apps-tasting-notes/
- https://play.google.com/store/apps/details?id=com.cellartracker.appV2
- https://www.starkinsider.com/2025/07/ai-wine-pairing-cellartracker.html
- https://sommo.app/blog/vivino-vs-cellartracker/
- https://www.letsdatascience.com/news/cellartracker-reveals-ai-driven-wine-recommendation-vision-99c60726
- https://apps.apple.com/us/app/hello-vino-wine-assistant/id318447346
- https://www.appbrain.com/app/hello-vino-wine-assistant/com.hellovino.android
- https://www.12x75.com/best-wine-apps/
- https://sommelierx.com/blog/best-wine-apps-2026
- https://sommo.app/, https://sommo.app/about/, https://sommo.app/pricing/
- https://apps.apple.com/us/app/sommo-all-in-one-ai-wine-app/id6757319027
- https://www.trustpilot.com/review/sommo.io
- https://txwinelover.com/2026/09/sommo-a-sommelier-in-your-pocket/
- https://www.winespectator.com/articles/wine-spectator-releases-revamped-wineratings-app-52449
- https://www.appbrain.com/appstore/wineratings-by-wine-spectator/ios-381341648
- https://adapty.io/paywall-library/wineratings/
- https://apps.apple.com/us/app/somm-ai-wine-menu-scanner/id6744361256
- https://apps.apple.com/za/app/somm-ai-wine-expert/id6759761132
- https://aisomm.io/, https://www.sommai.io/
- https://techstartups.com/2026/02/12/sante-raises-7-6m-seed-to-build-the-first-ai-and-fintech-infrastructure-for-the-wine-and-liquor-industry/
- https://alvinology.com/2026/04/15/us10-million-tech-startup-vinobuzz-takes-the-traditional-wine-market-by-storm-as-hong-kongs-first-ai-agent-marketplace-for-wine/
- https://www.vinetur.com/en/2025061988936/artificial-intelligence-sommelier-debuts-with-new-digital-wine-platform-in-the-united-states.html

**Food/recipe apps:**
- https://apps.apple.com/us/app/samsung-food-meal-planner/id1133637674
- https://play.google.com/store/apps/details?id=com.foodient.whisk
- https://mealthinker.com/blog/samsung-food-alternative
- https://www.savortheapp.com/blog/food-tracking-apps/samsung-food-app-review/
- https://www.androidauthority.com/samsung-food-3517054/
- https://milled.com/yummly.com/important-notice-yummly-discontinuation-sF5GpZgHP5VctzYY
- https://www.useladle.com/blog/yummly-alternative
- https://mealthinker.com/blog/yummly-alternative
- https://www.sidechef.com/business/sidechef-ai
- https://www.businesswire.com/news/home/20240806193505/en/SideChef-Announces-RecipeGen-AI
- https://play.google.com/store/apps/details?id=com.sidechef.sidechef
- https://apps.apple.com/us/app/side%D1%81hef-easy-cooking-recipes/id905229928
- https://apps.apple.com/us/app/kitchen-stories-easy-recipes/id771068291
- https://www.pann-app.com/blog/kitchen-stories-review
- https://justuseapp.com/en/app/771068291/kitchen-stories-recipes/reviews
- https://cookbookmanager.com/post/mealime-closing-alternatives
- https://mealthinker.com/blog/mealime-alternative
- https://www.pann-app.com/blog/is-mealime-shutting-down
- https://mealthinker.com/blog/platejoy-alternative
- https://swoodie.app/blog/mealime-vs-platejoy-vs-swoodie-2026
- https://thespoon.tech/plant-jammer-gets-e4m-investment-for-its-ai-powered-recipe-platform/
- https://tracxn.com/d/companies/chefgpt/
- https://fritz.ai/best-ai-recipe-generators/
- https://www.foodieprep.ai/blog/meal-planning-apps-in-2026-which-tools-actually-simplify-your-kitchen

**Combined space, funding, trends:**
- https://apps.apple.com/us/app/pocket-sommelier-wine-pairing/id6503256584
- https://play.google.com/store/apps/details?id=ai.asksommelier.app
- https://play.google.com/store/apps/details?id=com.kawaii.winescanner
- https://winepairingai.com/, https://thewinegptapp.com/
- https://vinomat.app/, https://apps.apple.com/app/id6480037842, https://mwm.ai/apps/id/6480037842
- https://invintory.com/blog/wine-and-food-pairings-what-an-ai-cellar-assistant-can-suggest/
- https://invintory.com/blog/best-wine-apps-top-tools-for-collectors-compared/
- https://press.opentable.com/news-releases/news-release-details/opentable-diner-reviews-reveal-top-100-wine-lists-0
- https://blog.resy.com/2026/03/nyc-wine-hit-list/
- https://engineeringblog.yelp.com/2026/08/building-menu-vision-real-time-dish-recognition.html
- https://theresanaiforthat.com/gpt/the-sommelier/
- https://www.yeschat.ai/gpts-9t563fO8JX6-Wine-GPT
- https://www.yeschat.ai/gpts-9t557WKVcjg-Perfect-Pairing
- https://sommelier.bot/, https://sommelier.bot/ai-wine-sommelier-chatbot-revenue-merchant-playbook/
- https://winenews.it/en/perfect-wine-when-alexa-amazons-voice-assistant-recommends-wine_446585/
- https://vinepair.com/articles/best-virtual-sommelier/
- https://www.decanter.com/wine-news/amazon-alexa-wine-pairing-400259/
- https://apps.vinocell.com/
- https://vinotag-app.com/index.php/en/vinotag-en/
- https://cellared.ai/guides/best-wine-cellar-apps
- https://news.crunchbase.com/venture/scotch-raises-ai-funding-liquor-retail-tech/
- https://angelinvestorsnetwork.com/alternative-investments/vint-wine-platform-winddown-2026
- https://foodondemand.com/05202026/doordash-trends-report-highlights-ais-growing-role-in-restaurant-discovery/
- https://www.grocerydive.com/news/doordash-grocery-tools-conversational-shopping-assistant-agentic-ai/822735/
- https://www.grocerydive.com/news/instacart-grocery-personalization-new-ai-tech/742731/
- https://aiagentsdirectory.com/blog/ai-in-food-and-beverage-personalized-dining-experiences-in-2026
- https://dataintelo.com/report/ai-taste-profile-generator-market

*Note: several ratings/figures above could not be independently cross-checked against live App Store/Google Play listings from this environment (network egress to apps.apple.com/play.google.com was restricted) and are drawn from third-party aggregators and search-result summaries citing those listings. Treat precise star ratings and review counts as directionally accurate, not exact, and re-verify before using externally. A small number of lower-confidence items (e.g., Wine Ring's exact shutdown status, precise ratings for several similarly-named "Somm AI"-branded apps) are flagged inline above and should be independently verified before being treated as settled fact.*
