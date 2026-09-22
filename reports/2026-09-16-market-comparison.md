# Vinster — Market Comparison: Wine, Food & Combined Wine+Food Apps

**Date:** 2026-09-16
**Prepared by:** Automated Market Research Agent
**Branch analysed:** `main` @ `95db5b3` (last substantive feature/fix commit remains `c15d3c4`, 2026-08-09)
**Prior report:** `reports/2026-09-09-market-comparison.md` — read in full. As with prior cycles, this report re-verifies code-side claims independently rather than carrying them forward on trust, and runs an independent web-research pass rather than re-quoting the prior cycle's sources.

**A note on objectivity:** This is internal competitive intelligence, not marketing copy. Vinster's strengths are not inflated and competitors' advantages are not softened. Where a competitor is materially better than Vinster — in scale, data depth, funding, ratings, or polish — that is stated directly. Every Vinster feature cited below as "built" was independently re-verified by reading the code on `main` this cycle (file paths and, where useful, line numbers cited throughout); anything not found in the code is marked **PROPOSED**, not built.

**What changed in the code since 2026-09-09:** Nothing feature-related. `git log --oneline c15d3c4..HEAD -- . ':!reports'` returns zero commits; the unfiltered log over the same range shows only the weekly report-file commits (08-12 through 09-09). Working tree is clean. **Development has now been stalled for 38 days across six consecutive weekly report cycles** (08-12, 08-19, 08-26, 09-02, 09-09, 09-16), with the last substantive commit still `c15d3c4` ("Pricing: never show no price — harden Wine-Searcher path"), dated 2026-08-09. `app.json` remains at version 1.3.4. Re-confirmed this cycle: zero repo-wide matches for `revenuecat|stripe|in-app-purchase|react-native-iap|purchases-react-native`, and zero matches for `wine_library|wine_catalog|wine_encyclopedia` in `supabase/migrations/`. `COMMUNITY_ENABLED = false` in `src/constants/features.ts` remains unchanged, still gating the built community/review-sharing UI off with "coming soon" copy. One nuance not previously called out: a `054_wine_knowledge.sql` migration and a `wine-knowledge` edge function exist — this is a per-wine, AI-generated notes feature, **not** a persistent cross-user wine catalog/database; the structural gap identified in prior cycles stands.

This cycle's code review also pinned down the exact mechanics of the price-hallucination guard flagged in prior reports. `src/services/recommender.ts:46-49` states in a schema comment: *"price + currency are deliberately NOT read from the model. Vinster does not accept a model-supplied price — the list price is real data, set from the scanned menu (OCR) in recommendWines() below. Any price the model returns is ignored here."* The server-side prompt in `supabase/functions/recommend/index.ts:88` reinforces this: *"You must NOT output, restate, alter, or invent any price or currency... the price is real data and is never authored by you."* If no unambiguous OCR match exists, `menuPrice` is set to `null` (`recommender.ts:117`) rather than a guessed figure. Wine-Searcher is used only as a fallback **market-value estimate**, not the displayed list price — confirmed via a real proxy edge function (`supabase/functions/wine-searcher-proxy/index.ts`) that calls `api.wine-searcher.com` and caches results to a `pricing_cache` table.

**What changed in the market since 2026-09-09:** A full independent research pass this cycle surfaced several developments material enough to change the picture, not just add data points:
- **Mealime, a named food-app competitor tracked in prior cycles, is reported shutting down October 21, 2026**, with its userbase being funneled into parent company Albertsons' "Meals Hub." This continues a pattern — Yummly (Dec 2024) and PlateJoy (mid-2025) have also shut down or been absorbed — of three notable independent meal-planning brands folding into a parent's ecosystem within roughly 22 months.
- **CellarTracker, previously profiled in this report as having "no OCR/camera scanning" and limited AI**, has since shipped **"CellarTracker Insights"** (AI-generated tasting-note summaries and food-pairing suggestions synced to the user's own cellar) and a beta chatbot, **"CellarChat."** This is a material correction to prior cycles' framing: the deepest-data incumbent in wine tracking is now also moving into Vinster's AI-pairing territory.
- **ChefGPT**, an AI recipe generator, ships a named, live feature called **"PairPerfect"** that generates wine/beer pairings for AI-generated meals — the clearest evidence yet of a mainstream recipe app (not a wine app) directly competing on beverage pairing, contradicting the "no recipe app pairs with wine" finding stated flatly in the two prior cycles' reports.
- **Samsung** is building an "AI Wine Manager" into its 2026 "Infinite AI Wine Refrigerator" (in-fridge camera label-scan + SmartThings logging + food-pairing recommendations) and a "Vision AI Companion" recommending food/wine pairings on Samsung TVs — hardware/ecosystem-level, not confirmed as a feature inside the Samsung Food app itself, but a real signal that Samsung, Vinster's largest adjacent competitor by user base, is investing in wine pairing.
- **Several new AI-sommelier entrants surfaced this cycle that were not tracked in any prior report**: Vinoperte (launched Feb 26, 2026, reporting rapid organic adoption "across 50+ cities" within a week), CellarMate (AI cellar+sommelier app, GPT-4-class NLP, 14 specialized functions), Sippd (privacy-focused wine journal with a taste-match score, plus a direct-to-consumer wine-club spinout), and Sommelio (currently in closed TestFlight beta). None had material traction confirmed, but their sheer number reinforces how saturated and fast-churning this segment is.
- **A correction to prior cycles:** last week's report profiled "Sommly" as a live B2B product; this cycle's independent research could not find it as a distinct, currently-live app under that name — it may be conflated with Sommo/Sommify, defunct, or never launched under that name. It is dropped from this cycle's active roster pending re-confirmation. Similarly, prior cycles described **Decanto** as an AI-driven pairing app with "1,000+ dish templates"; this cycle's research instead found Decanto priced at a flat $199 (iPad) and positioned as a sommelier-education tool built with AIS Salerno sommeliers (the "Mercadini method"), not an AI-recommendation app — the two characterizations are hard to reconcile and this report flags the discrepancy rather than picking one silently.
- **Wine Ring's status is now ambiguous.** One source says it was rebranded to "Preferabli" (still live, expanded into beer/spirits/cheese); a separate 2026 wine-app roundup states plainly that Wine Ring has "gone dark" alongside Tipple and The Wine Coach. This report flags it as unresolved rather than asserting either way.
- **Resy/Tock integration reached a new, dated milestone**: as of **September 15, 2026** (one day before this report), American Express expanded "Resy Credit" cardmember dining incentives to cover former-Tock restaurants — concrete evidence the wine-tourism/dining-platform convergence flagged in prior cycles is actively shipping, not just announced.
- **Preferabli** (the taste-matching engine, possibly = rebranded Wine Ring, see above) announced a partnership with **The Wine Society** in June 2026 and acquired **Libation Labs** — the most credible enterprise-grade AI taste-matching technology found in this cycle's research, and a plausible acquirer or white-label threat to any consumer-facing differentiation Vinster might claim.
- **Updated market sizing**: one estimate (Dataintelo) puts the AI wine-recommendation market at $1.8B in 2025, projected to $7.6B by 2034 (17.3% CAGR), with the direct-to-consumer segment as the fastest-growing sub-segment (20.8% CAGR). This differs from the $1.14B-as-of-2024 figure cited in the 09-09 report — both are third-party estimates using different methodologies; treat the category as "real, growing, contested," not attach weight to either figure's precision.

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

Vinster's codebase remains, on direct re-reading this cycle, a genuinely functional wine-plus-food product for a pre-launch app: real Claude-vision OCR for wine-list and label scanning plus multi-bottle "lineup" detection (`src/services/ocr.ts`; edge functions `ocr`, `scan-label`, `detect-lineup`, calling `claude-haiku-4-5-20251001` and, for lineup detection, `claude-sonnet-4-6`); a Claude-Sonnet recommendation engine (`src/services/recommender.ts` → `supabase/functions/recommend`) that explicitly and verifiably discards model-suggested prices in favor of OCR'd menu prices or a live Wine-Searcher fallback estimate; a deep, real cellar data model (racks, diamond/triangle bins, cases, multiple storage locations, RLS-backed CRUD); AI food-and-wine pairing and chef-attributed recipe generation (`food-wine-pairing`, `generate-pairings` — the latter drawing from a hardcoded pool of ~50 real named chefs); genuinely structured, four-axis restaurant reviews (food/service/wine-list/overall) tied to real scan sessions; and an AI "personality" sketch feature that explicitly gates on accumulated real usage before generating output. None of this is mocked — it is server-side, rate-limited code calling a real, paid Anthropic API across roughly 20 edge functions.

The less flattering half of the picture, now more pronounced than at any prior cycle: **development has stalled for 38 days and six straight weekly report cycles**, with no monetization code anywhere in the repository, no browsable/searchable wine reference database, a built community feature deliberately disabled in the UI, and no findable public App Store or Google Play listing under the name "Vinster." Meanwhile, this cycle's research makes Vinster's positioning problem sharper, not softer, than last week: it is not just that eight-to-ten wine-first apps already do "scan a list, get an AI pairing" — this cycle found the convergence is now bidirectional. **CellarTracker**, the deepest-data cellar incumbent, has shipped its own AI pairing chatbot. **ChefGPT**, a mainstream AI recipe app, now ships a named wine/beer pairing feature. **Samsung** is building wine-pairing AI into its smart-fridge hardware. And several brand-new, previously-untracked AI-sommelier apps (Vinoperte, CellarMate, Sippd) launched or gained traction this year without Vinster having shipped a single feature since early August. The space Vinster has staked its identity on is not just crowded — competitors on both sides of the wine/food divide are actively closing the gap toward the middle where Vinster sits, while Vinster itself stands still.

---

## Wine Apps

### Vivino
**What it does:** Camera-based label and full wine-list scanning against the largest crowdsourced wine database in the category, personalized "Match for You" scores, a cellar/wine tracker, and (Premium) restaurant wine-list scanning plus a "sommelier chat" AI feature.
**Scale:** Consistently reported as the largest wine app/community by a wide margin (tens of millions of users; precise current figures vary by source).
**Ratings:** Reported figures are inconsistent across sources this cycle — AppBrain cites ~4.69★ on Google Play (~230K ratings); Vivino's own Premium page cites 4.5★/194K reviews on Google Play; Trustpilot shows 4.0★/24,497 reviews. Treat as "very high, very large volume" rather than a single precise number.
**Pricing:** Freemium; Premium ≈ $4.99/month or ~$47.90/year (varies by market), unlocking wine-list scanning and sommelier chat.
**Recent review sentiment:** Praised for ease of use across skill levels and database depth; recent complaints center on previously-free features (viewing wine regions/types you've drunk) being moved behind the Premium paywall.
**Assessment:** The unambiguous scale leader, and now also shipping an AI "sommelier chat" feature that narrows Vinster's AI-differentiation claim even against the incumbent Vinster cannot match on data depth.

### Delectable
**What it does:** Camera-first label scan with a social feed built around verified sommeliers, winemakers, and critics; now owned by Antonio Galloni's Vinous.
**Ratings/pricing:** Could not be reliably confirmed this cycle — the app appears to have been pulled from Google Play (iOS-only now), and no verified current star rating or price was found. Treat prior-cycle figures ($5.99/month) as unconfirmed going forward.
**Assessment:** A smaller, curated alternative to Vivino whose differentiator — professional/critic credibility — remains something an AI-first entrant cannot replicate quickly.

### CellarTracker
**What it does:** The dominant cellar-inventory and tasting-note platform for serious collectors — unlimited bottle tracking, community and professional ratings — **now expanded with AI**: "CellarTracker Insights" (AI-generated tasting-note summaries and food-pairing suggestions synced to the user's own cellar) and a beta chatbot, "CellarChat."
**Scale:** ~13M+ ratings from ~7M users, ~$21B of wine tracked (as cited in recent third-party roundups).
**Ratings:** One source cites 4.9★ on the App Store — single-sourced this cycle, treat with some caution.
**Known weaknesses (per recent user reviews):** Described as slow ("insanely slow" multi-second lag in places), and buggy — a years-old unfixed issue with deleted bottles reappearing, user-created stores being deleted, text-entry UI getting stuck. Developers acknowledge issues via a dedicated feedback site.
**Assessment:** The trust/depth leader for collectors, and **this cycle's most important correction to prior reports**: it is no longer accurate to describe CellarTracker as lacking AI-pairing ambition. Its 13M+-review data moat, now paired with its own AI pairing layer, directly undercuts one of the two pillars (deep cellar + AI pairing) Vinster is betting on — from the side with by far the deeper data.

### Hello Vino
**What it does:** A beginner-friendly, occasion/food-first flow — describe the meal or occasion, get a wine style recommendation — plus a secondary label-scan feature.
**Scale:** Reported 2M+ community.
**Pricing:** Free, with in-app purchases (~$3 ad removal, ~$5 scanning unlock cited in reviews).
**Recent complaints:** Users report ads persisting even after paying to remove them, and the paid scanning feature frequently failing to recognize labels or becoming unresponsive.
**Assessment:** A legacy, low-friction app doing a simpler version of what Vinster's occasion/food flow does; low current threat given documented reliability complaints, but still proof this use case has existed as a free app for years.

### Wine Ring (status: unresolved this cycle)
Two contradictory signals surfaced. One source states Wine Ring was rebranded to **Preferabli** and expanded into beer, spirits, and food/cheese personalization, and remains live on both app stores. A separate, independent 2026 wine-app roundup states Wine Ring has "gone dark" alongside two other apps (Tipple, The Wine Coach). This report does not resolve the discrepancy; it is flagged as an open question for a future cycle to check directly against the current app-store listings rather than asserted either way. **If the Preferabli read is correct**, note that Preferabli/its underlying technology is separately reported this cycle to have partnered with The Wine Society (June 2026) and acquired Libation Labs — i.e., a materially more credible, funded operation than "Wine Ring" alone would suggest.

### Wine Spectator (WineRatings+)
**What it does:** Search/lookup app built on Wine Spectator's own expert ratings and tasting notes (figures cited between 270,000 and 400,000+ depending on source vintage), vintage charts, and voice-to-text search.
**Ratings:** 4.65★ from ~900 App Store ratings — a materially smaller review base than Vivino or CellarTracker, suggesting a much smaller active user base despite editorial pedigree.
**Pricing:** Free download; WineRatings+ subscription $2.99/month after a 30-day free trial.
**Assessment:** A different trust model (professional critics, not crowd or AI) competing for the same "which wine should I trust" moment as Vinster's AI recommendation engine, at a lower price point than most AI-sommelier apps.

### The AI-sommelier / scan-and-recommend cluster
This remains not a niche of one or two apps but a large, fast-churning field. Confirmed or partially confirmed this cycle:
- **Sommo** — scanning + cellar + journal + food pairing (from the user's own collection) + an interactive region map + WSET exam prep + a "Taste DNA" palate-profiling feature. Shipped a v2.0 "Sommelier's Notebook" redesign in August 2026 and continues to draw enthusiast-press praise. Free tier: 5 lifetime scans; Premium $5/month or $29.99/year, 3-day trial.
- **InVintory** — the best-corroborated rating in this entire cluster: **4.8★ / ~4,200 App Store reviews**. AI assistant "Vincent" recommends pairings from the user's own collection; "VinLocate" 3D cellar visualization; a sommelier-curated wine database (2M+ wines cited in prior cycles). Premium $149.99/year or $14.95/month.
- **Somm-AI (aisomm.io)**, **Somm (sommai.io)**, and a separately-listed **"SommAI - Wine Assistant"** — all live App Store entries scanning wine lists/menus for AI recommendations, but each shows "not enough ratings to display an overview" — i.e., pre-traction.
- **WineScore** ("AI Scan Menu & Pair") — similarly pre-traction, no confirmed rating.
- **Vinomat** — AI pairing score (0–10) from a dish photo, plus wine-to-recipe generation. Self-reported as "trusted by 1K+ users" (a small, unverified base). Possibly related to or rebranded as "Gastrona" (see Combined Space section) — could not fully confirm the relationship this cycle.
- **Decanto** — this cycle's research surfaced a materially different picture than prior reports: a $199 flat-price (iPad) sommelier-**education** app built with AIS Salerno sommeliers around the "Mercadini method," not an AI-recommendation/pairing app. This may reflect two different products under a similar name, or a correction to prior mischaracterization — flagged rather than resolved.
- **Pocket Sommelier** — photo-a-meal → 3 wine pairings, plus a wine-list scanner showing a "pairability %" and price range. Built by a 2-person bootstrapped team. 4.3★ (single source, review count unconfirmed).
- **"Sommly"** — could not be found this cycle as a distinct, currently-live product (see note above); dropped from the active roster pending re-confirmation.

**New entrants surfaced only this cycle** (none with material traction confirmed, but relevant to how saturated the space is):
- **Vinoperte** — launched Feb 26, 2026; scans restaurant wine lists/menus/retail shelves against a personal taste profile; press release claims adoption "across 50+ cities" within one week of launch via organic word of mouth.
- **CellarMate** (cellarmate.ai) — AI cellar+sommelier app using GPT-4-class NLP; 14 specialized functions including receipt scanning and bulk cellar operations; positioned as a CellarTracker/InVintory challenger.
- **Sippd** — a privacy-first wine journal (no social feed, no ad sales) with AI label recognition and a 1–100% "taste match" score; free tier (5 scans/day) plus Pro at €4.99/month; has also launched a direct-to-consumer wine-club subscription off a 7-question taste quiz.
- **Sommelio** — currently in closed TestFlight beta; on-device/local-only storage (no cloud upload of personal data) is its stated differentiator.

**Assessment:** Aggregator commentary this cycle explicitly notes that several older entrants in this exact cluster (Wine Ring, Tipple, The Wine Coach) have already "gone dark" — i.e., this is a high-mortality segment, not just a crowded one. InVintory and Sommo remain the most credible, validated analogs to Vinster's core loop; several brand-new entrants (Vinoperte, CellarMate, Sippd) show the field continuing to add competitors faster than any one of them is consolidating share.

---

## Food / Recipe / Pairing Apps

### Samsung Food (formerly Whisk)
**What it does:** All-in-one recipe manager, meal planner, and shopping-list app; 6M+ reported users.
**Ratings:** ~4.8★ on iOS (small sample, ~454 ratings per one source); ~4.49★ on Google Play (~22,000 ratings).
**Pricing:** Free core; paid premium tier exists (exact current price not independently reconfirmed this cycle).
**Known weaknesses:** Persistent, months-old complaints — dietary preferences not reflected in generated plans even on paid tiers, only one supported grocery store per list, no batch-cook/leftover tracking, manual drag-to-calendar meal planning.
**Wine/beverage pairing — material update:** Samsung is building an **"AI Wine Manager"** into its 2026 "Infinite AI Wine Refrigerator" (in-fridge camera label-scan, SmartThings logging, food-pairing recommendations) and a **"Vision AI Companion"** recommending food/wine pairings on Samsung TVs. This is Samsung-ecosystem/hardware-level, not confirmed as a feature inside the Samsung Food app itself — but it is the clearest evidence yet that Samsung, by far the largest player adjacent to Vinster's food side, is actively moving into wine pairing.
**Assessment:** Still the most feature-rich mainstream recipe/meal-planning app researched; the emerging wine angle (even if hardware-gated for now) is a new and material watch-item that did not exist in prior cycles' framing.

### Yummly — confirmed shut down, no revival
Permanently closed December 20, 2024. As of a mid-2026 check, yummly.com redirects to KitchenAid recipe pages with no accounts, saved recipes, or meal planner, and there is no Yummly app in the US App Store. No relaunch has been announced. Content appears folded into KitchenAid's site rather than deleted outright.

### SideChef
**What it does:** ~18,000 step-by-step recipes with photo/video guidance, one-tap grocery-ordering integration; also runs a separate B2B/generative-AI product line for restaurants and meal-kit companies.
**Ratings:** Google Play ~3.8★ (~8,200 reviews); iOS rating could not be independently reconfirmed this cycle.
**Pricing:** Free; Premium $4.99/month or $49.99/year.
**Known weaknesses:** Documented unresponsive customer support, a failed 2021 gift-card promo, poor iPad layout, and data-retention/privacy concerns raised by reviewers.
**Wine/beverage pairing:** None found.

### Kitchen Stories
**Ratings:** ~4.07★ from ~31,000 ratings (aggregated figure).
**Pricing:** "Kitchen Stories Plus" at €7.99/month or €79.99/year, 7-day free trial.
**Recent complaints:** A February 2026 review reported being charged despite the advertised free trial not activating; a January 2026 review complained recipes were altered without notice.
**Wine/beverage pairing:** None found.

### Mealime — reported shutting down October 21, 2026
**Material new finding this cycle.** Multiple independent sources (four separate blog domains, one dated this month) report Mealime is winding down, with Mealime Pro made free for all users as a "farewell" and users directed to "Meals Hub," a feature being consolidated into parent company Albertsons' grocery apps (Albertsons acquired Mealime in 2021). This could not be verified against Mealime's own first-party site or App Store copy directly (both were unreachable for direct fetch in this research pass) — flagged as highly likely but not first-party-confirmed. Pre-shutdown: Google Play ~4.7★ (~21,500 ratings); free tier + Pro at $2.99/month.
**Pattern:** This is the third notable independent meal-planning brand to shut down or be absorbed into a parent company's ecosystem in roughly 22 months, after Yummly (Dec 2024) and PlateJoy (mid-2025, folded into Healthline's "Wellos"). For a category Vinster's food side sits adjacent to, this is a real signal about the durability of standalone recipe/meal-planning apps versus platform consolidation.

### ChefGPT — material correction to prior reports
Prior cycles stated flatly that "no recipe app has a wine/alcohol pairing feature." This cycle found a direct exception: ChefGPT ships a named, live feature, **"PairPerfect,"** that generates wine or beer pairing recommendations for AI-generated meals — user selects beer or wine, describes the dish, and receives a pairing suggestion. ChefGPT's API also lists a dedicated "pairings" endpoint at $19.99/month. This is a simpler recommendation feature than Vinster's cellar-grounded sommelier approach, but it is real, live, and directly on-point — the flat "no recipe app does this" claim from prior cycles should be retired.

### DishGen
AI recipe generator (ingredient list → recipe ideas, dietary filtering, iterative chat refinement). Free tier: 15 credits/week. No evidence found of wine/beverage pairing.

### The AI recipe-generation trend, updated
The MCP (Model Context Protocol) integration trend flagged in prior cycles is accelerating: OpenAI's "Developer Mode" now also supports MCP servers (rolled out ~Sept 2025), meaning the same connector built for Claude works with ChatGPT too. Independent meal-planning tools (Plan to Eat, the open-source Mealie project, Mealift, Pantry Persona) now ship MCP servers letting an AI assistant read/write recipes, meal calendars, and shopping lists directly. None of the market leaders profiled here (Samsung Food, SideChef, Kitchen Stories) have shipped an MCP server as of this research — this trend so far is concentrated among smaller/independent tools, which is itself a notable white-space observation for a small, AI-native app like Vinster to consider (see Recommended Differentiators).

Separately, retail-side agentic AI is accelerating fast and adjacent to meal planning: Albertsons has an agentic AI shopping assistant rolling out across its banner apps (including Mealime's "Meals Hub" successor); Kroger and Wegmans use agentic cart-building tech from a startup called Cooklist; one industry survey (FMI) reports over two-thirds of surveyed food retailers now use agentic AI, up from 47% a year prior.

---

## Combined Wine + Food / Dining Space

**This remains the space Vinster stakes its identity on, and this cycle's research shows the convergence toward it is now happening from multiple directions at once, not just from wine-first apps.** Beyond the wine-cluster apps profiled above, a distinct set of newer combined-positioning apps surfaced this cycle: **Vine: Wine & Pairings** (App Store, ~Aug 4, 2026 — wine info + food pairing + step-by-step recipes in one flow, the most direct functional analog to Vinster's own scope found this cycle); **Gastrona** (formerly/related to Vinomat — an in-app AI assistant named "Sophia," a "Restaurant Mode" that photographs a menu and wine list together for pairing recommendations, and a **B2B arm selling white-label pairing software directly to restaurants and hotels** — a notable adjacent threat since it productizes the pairing engine for the trade, not just consumers); **Corkiby/Corki** (self-styled "world's first AI recipe generator and wine pairing maker," but with no App Store ratings yet — likely very early); **RecipeAI** (bundles recipe generation, meal planning, nutrition, pantry tracking, an AI sommelier, **and** restaurant discovery — the single closest scope match to Vinster's combined thesis found in this research, though with no evidence of cellar/inventory management or 3D visualization); and **My Head Chef / "My Head Somm"** (pantry-to-recipe AI chef with an embedded sommelier feature, independently unverified beyond its own site).

**Incumbent convergence toward the middle continues to compound.** As detailed above, **CellarTracker** — historically pure inventory/community-notes — has shipped "CellarTracker Insights" and a "CellarChat" beta explicitly doing AI food-pairing synced to a user's own cellar, and **InVintory**'s "Vincent" assistant does the same. Vivino already bundles restaurant wine-list scanning and food-pairing suggestions into its free-core, mass-scale product.

**Restaurant reservation platforms are now actively shipping wine-adjacent commerce, not just planning it.** The Resy/Tock merger (announced Feb 2026) is largely complete: the combined Resy lists 25,000+ venues, including 1,200+ wineries absorbed from Tock, and now supports the ticketed/prepaid winemaker-dinner and tasting-experience commerce Tock built specifically for wineries. **As of September 15, 2026 — one day before this report** — American Express expanded its "Resy Credit" cardmember dining incentive to cover former-Tock restaurants, a concrete, dated sign this integration is actively shipping rather than merely announced. Amex reports cardmembers spent over $250 million at U.S. wineries via Tock in 2025. Resy/Tock combined (25,000+ venues) still trails OpenTable (60,000+ restaurants); OpenTable's own wine-relevant feature remains its long-running "Notable Wine List" Diners' Choice award category (unchanged this cycle, not new), with no new wine-specific OpenTable feature found. This narrows, not widens, the room for a standalone app to independently own "the wine decision at a restaurant" as a moment — increasingly, the booking platform itself is investing directly in wine-related commerce and experiences.

**A credible enterprise-grade taste-matching player exists in the background.** Preferabli — a B2B2C "Sensorial AI" personalization engine covering wine, spirits, beer, sake, cocktails, RTDs, and food/cheese, founded 2012 and holding 15 patents — announced a partnership with The Wine Society (the world's oldest member-owned wine club) in June 2026 and acquired Libation Labs to deepen its consumer-market reach. Separately, **WineSpeak.ai** sells white-label conversational "virtual concierge & wine curator" AI agents directly to individual wineries for their own DTC websites (partnered with Thomas Fogarty Winery, Dec 2025). Neither is a consumer app competing head-on with Vinster today, but both show AI-driven wine-personalization technology proliferating at the infrastructure/B2B layer — a plausible path for an incumbent or well-funded platform to assemble Vinster's feature set quickly via partnership or acquisition rather than building it from scratch.

**No single all-in-one winner has emerged, and this cycle's research reinforces why.** Independent roundups continue to recommend stacking specialist apps (one roundup's explicit recommendation for "most people" is literally "Vivino plus one other app"). The apps that call themselves "all-in-one" (Sommo) are all-in-one only within wine — none add restaurant discovery or reservations. The apps combining food + wine + restaurant-finding (RecipeAI, My Head Chef) show no evidence of cellar/inventory management or restaurant-review depth. This is a genuine, still-open gap in scope terms — but it is being approached from several directions simultaneously, and a well-resourced player (a reservation platform, a taste-matching infrastructure vendor like Preferabli, or a hardware ecosystem like Samsung) could plausibly assemble the same combined scope faster than Vinster, which has shipped no new code in 38 days, can close it.

**Funding and shutdown activity this cycle:** **Santé** raised a $7.6M seed round (Feb 2026) building AI+fintech infrastructure for wine/liquor **retailers** (not a consumer app). **Vinolin** (Germany) raised a €200,000 pre-seed for an AI wine-recommendation engine aimed at online retailers. **VinoBuzz** (Hong Kong) raised an angel round at a ~$10M valuation (April 2026). On the shutdown side, **Vint** (a wine-investment/fractional-ownership platform, not a recommendation app) wound down operations in June 2026 after a ~$890K 2025 net loss, and **WineDirect Classic** (winery e-commerce software) is scheduled to retire Dec 31, 2026 following its acquisition by Commerce7 — a consolidation, not a failure, but one fewer independent winery-tech platform regardless. No wine-tech or AI-food-and-drink product appeared in TechCrunch's regularly updated "AI graveyard" tracker (last updated Sept 15, 2026) — the closest this research came to confirming a notable AI-sector shutdown specific to this space, and it found none.

---

## Feature Comparison Matrix

Vinster is scored strictly on what is verified in the codebase on `main` this cycle, judged on the same yardstick as every other row. "—" = not offered / not found in research. Ratings and pricing are as reported by third-party sources as of mid-September 2026 and should be spot-checked before external use; most could not be independently confirmed via a direct app-store fetch this cycle (network egress to app-store domains was blocked for the research agents) and are marked "unconfirmed" or given with their sourcing caveat noted in the profiles above.

| App | Label/Menu Scan | Cellar/Inventory Mgmt | AI Wine Reco | Food→Wine Pairing | Recipe Generation | Restaurant Reviews/Discovery | Community/Social | Rating | Price |
|---|---|---|---|---|---|---|---|---|---|
| **Vivino** | Yes (camera, incl. wine list on Premium) | Yes | Yes ("Match for You" + sommelier chat) | Yes | — | — | Yes (large crowd base) | ~4.0–4.7★ (source-inconsistent) | Free + Premium ~$4.99/mo |
| **Delectable** | Yes (camera) | Journal only | Curated expert scores | — | — | — | Yes (pros/critics feed) | Unconfirmed | Unconfirmed (possibly iOS-only now) |
| **CellarTracker** | No (barcode only; no OCR) | Yes (deep, ~$21B tracked) | Yes — new: "CellarChat" beta + "Insights" | Yes — new: AI pairing from own cellar | — | — | Yes (13M+ ratings) | ~4.9★ (single-source) | Free + ~$40/yr donation tier |
| **Hello Vino** | Yes (weak, reliability complaints) | — | Yes (learns from ratings) | Yes (occasion-based) | — | — | — | Unconfirmed | Free + IAP (~$3–$5) |
| **Wine Ring / Preferabli(?)** | Yes (status ambiguous — see note) | — | Yes (ML-based) | — (Preferabli variant covers food/cheese) | — | — | — | Unconfirmed | Free (if Preferabli) |
| **Wine Spectator (WineRatings+)** | — | — | Expert database only | — | — | — | — | 4.65★ (~900 ratings) | Free + $2.99/mo |
| **Sommo** | Yes (label + full menu) | Yes | Yes | Yes (from own cellar) | — | — | Journal only | Unconfirmed (v2.0 shipped Aug 2026, praised) | Free tier + $5/mo or $29.99/yr |
| **InVintory** | Partial (import-based) | Yes (3D "VinLocate," 2M-wine DB) | Yes ("Vincent") | Yes (from own cellar) | — | — | — | 4.8★ (~4,200 reviews) | Free + $149.99/yr or $14.95/mo |
| **Vinomat / Gastrona(?)** | Yes (menu photo) | — | Yes | Yes | Yes (wine-matched) | Yes ("Restaurant Mode") — Gastrona variant | — | Unconfirmed | Unconfirmed |
| **Pocket Sommelier** | Yes (menu + "pairability %") | — | — | Yes (photo of meal) | — | — | — | 4.3★ (single source) | Free + Premium (unconfirmed) |
| **wine.dine** | Yes (label/menu/PDF) | — | Yes | Yes | — | — | — | Unconfirmed | Free + Pro tier |
| **Vine: Wine & Pairings** | Unconfirmed | — | Unconfirmed | Yes | Yes (step-by-step) | — | — | Too new (Aug 2026) | Unconfirmed |
| **RecipeAI** | — | — | Yes | Yes | Yes | Yes (restaurant finder) | — | Unconfirmed | Unconfirmed |
| **Vinoperte / CellarMate / Sippd (new entrants)** | Yes (varies) | Partial (varies) | Yes | Varies | — | — | — | Too new / not found | Free tiers + small paid tiers |
| **Samsung Food** | — (food photo calorie AI, hardware-gated); wine-pairing emerging via fridge/TV hardware, not app | — | — | Emerging (hardware-level, not confirmed in-app) | Yes (curated + AI adaptation) | — | Yes (recipe sharing) | ~4.5–4.8★ (source-inconsistent) | Free + paid tier (price unconfirmed) |
| **Yummly** | — | — | — | — | Was yes | — | Was yes | **Shut down Dec 2024, no revival** | N/A |
| **SideChef** | — | Pantry tracking | — | — | Guided cooking | — | — | ~3.8★ Play (~8,200) | Free + $4.99/mo |
| **Kitchen Stories** | — | — | — | — | Yes (video-led) | — | — | ~4.07★ (~31,000) | Free + €7.99/mo |
| **Mealime** | — | — | — | — | — (curated) | — | — | ~4.7★ (pre-shutdown) | **Reportedly shutting down Oct 21, 2026** |
| **ChefGPT** | — | — | — | Yes ("PairPerfect" wine/beer pairing) | Yes | — | — | Unconfirmed | Pairings API $19.99/mo |
| **Vinster** (this app, pre-launch, no public listing found) | **Yes** — wine-list OCR, label scan, multi-bottle lineup detection; real Claude-vision calls (`src/services/ocr.ts`; edge functions `ocr`, `scan-label`, `detect-lineup`) | **Yes** — racks, diamond/triangle bins, cases, multi-location storage, RLS-backed CRUD (`src/api/{bins,racks,storageLocations,cellar}.ts`); **no browsable wine database** (a per-wine "wine-knowledge" AI-notes feature exists but is not a catalog) | **Yes** — Claude Sonnet sommelier logic; verified to discard model-suggested prices in favor of OCR/Wine-Searcher data (`supabase/functions/recommend`, `src/services/recommender.ts:46-49`) | **Yes** — from user's own cellar or general style (`supabase/functions/food-wine-pairing`) | **Yes** — chef-attributed (pool of ~50 real named chefs), dietary/allergen-aware (`supabase/functions/generate-pairings`) — raises unresolved chef-attribution/IP risk (see Risks) | **Yes** — genuinely multi-axis (food/service/wine-list/overall), tied to real scan sessions (`app/restaurants/reviews.tsx`, migration `018_restaurant_ratings.sql`) — rare among all rows above | **Built but disabled** — real schema/API (`src/api/community.ts`) gated off by `COMMUNITY_ENABLED = false` (`src/constants/features.ts`), UI copy says "coming soon" | **No public rating found** — no App Store/Play listing found under "Vinster" this cycle | **No monetisation implemented in code** — zero IAP/RevenueCat/Stripe matches in repo |

**Reading the matrix honestly:** Vinster's raw feature-checkbox count remains competitive against any single named competitor, and the underlying code is functional, not mocked. But the matrix now shows convergence pressure from both sides at once: CellarTracker (deepest cellar data) has added AI pairing; ChefGPT (mainstream recipe app) has added wine pairing; several brand-new dedicated apps (Vinoperte, RecipeAI, Vine) already combine more of Vinster's exact feature set than any competitor tracked in the two prior cycles. Vinster's one genuinely rare feature — structured, multi-axis restaurant reviews — remains a private, empty log with the underlying UI switched off, not a live product advantage.

---

## Market Gaps & Opportunities

1. **A browsable, persistent wine reference database remains a real, structural gap**, not a stylistic choice — confirmed absent from the schema again this cycle (no `wine_library`/`wine_catalog`/`wine_encyclopedia` tables; the existing `wine-knowledge` feature is per-wine AI-generated notes, not a canonical cross-user record). Vivino, CellarTracker, and InVintory (2M+ "sommelier-curated" wines) all have this; Vinster currently regenerates wine data per-scan via the LLM, risking inconsistent data for the same physical wine across different users' scans.
2. **Restaurant reviews through a wine-specific lens remain genuinely underserved** — no competitor researched this cycle (including CellarTracker's new AI-pairing features or OpenTable's long-standing Diners' Choice award) offers a comparable structured, multi-axis rating tied to an actual dining visit. Vinster's implementation is real and comparatively rare, but it is a private per-user log today, not an aggregated, discoverable dataset — its value is entirely latent until (a) the community feature is turned on and (b) it accumulates real content.
3. **The specific combination of cellar management + restaurant discovery/reviews + recipe generation + pairing, all in one product, still has no confirmed direct one-to-one competitor** — the closest analogs (RecipeAI, Vine, Gastrona) each cover a subset of this scope, not all of it. This is a real, if narrowing, opening.
4. **An MCP (Model Context Protocol) connector is an emerging, currently-open lane.** None of the major food-app incumbents (Samsung Food, SideChef, Kitchen Stories) have shipped one; only smaller independent tools (Plan to Eat, Mealie, Mealift) have. A Claude/ChatGPT-facing MCP connector exposing Vinster's cellar or pairing data would be a genuinely differentiated, currently-unclaimed feature among apps of Vinster's scale — though it requires the underlying app to exist and ship first.
5. **Reservation-platform wine integration remains largely untouched by any wine-focused app, Vinster included**, even as Resy/Tock actively invest in wine-adjacent ticketed experiences and Amex just (Sept 15, 2026) extended cardmember dining credit to cover former-Tock restaurants. Pursuing this would require restaurant/POS partnerships Vinster's code shows no evidence of building toward.

---

## Risks & Where Competitors Are Stronger

Stated plainly, without softening.

1. **No public presence found.** An independent search this cycle for "Vinster" wine app returned no App Store listing, no Google Play listing, and no press coverage under that name, across two independently-run research passes — consistent with all prior cycles.
2. **No monetization model exists in the code.** Re-confirmed this cycle. Nearly every named competitor with real traction already has a live, tested price point in the $2.99–$14.95/month range — the market has already anchored pricing expectations Vinster will have to meet or undercut from a standing start, and several apps (InVintory, Sommo) at pricing points well above the $5–$6 norm assumed in earlier cycles.
3. **Development has now stalled for 38 days across six consecutive weekly report cycles**, with only report files themselves landing on `main` since 2026-08-09. This remains the single most controllable and most urgent finding in this report, independent of any competitor's move — and it is now the longest stall recorded across the report series.
4. **Convergence is closing in on Vinster's positioning from both sides, not just from other wine apps.** CellarTracker (the deepest cellar-data incumbent) has shipped its own AI food-pairing chatbot; ChefGPT (a mainstream recipe app) has shipped a named wine-pairing feature; Samsung is building wine-pairing AI into its smart-fridge and TV hardware. Vinster's "combined wine+food" bet is no longer just competing with dedicated wine-sommelier apps — it is being approached from the cellar side and the recipe side simultaneously, by players with vastly more scale.
5. **Several brand-new AI-sommelier apps launched or gained traction this year without any corresponding activity from Vinster.** Vinoperte reports rapid organic adoption since its Feb 2026 launch; CellarMate and Sippd both launched with a comparable feature set to parts of Vinster's cellar/AI pairing pillars. None of this required Vinster to do anything wrong — it simply reflects that the market keeps moving while Vinster's repository has not, for 38 days.
6. **Vivino and CellarTracker's scale (tens of millions of users; 13M+ ratings respectively) remain moats Vinster cannot approach at launch**, and both now ship AI-assisted food-pairing as a bundled feature of their free-or-established product — undercutting Vinster's pairing pillar as a standalone reason to switch, more so than in prior cycles now that CellarTracker has joined Vivino on this front.
7. **InVintory and Sommo remain materially more polished on the exact "AI grounded in your own cellar" idea Vinster is betting on**, with InVintory's rating (4.8★/~4,200 reviews) the best-corroborated figure found in this cycle's entire wine-app research pass. Vinster has no equivalent public validation of any kind.
8. **Vinster's community/restaurant-review-sharing feature is real code but deliberately disabled** (`COMMUNITY_ENABLED = false`), with UI copy telling users content saved now is "not live yet." Every incumbent with a community angle (Vivino, CellarTracker, Delectable) has a live, growing, real dataset today; Vinster's equivalent has zero real users interacting with it.
9. **Chef-attributed recipe generation carries an unaddressed legal/IP risk, not just a copyability risk.** Re-confirmed this cycle: `supabase/functions/generate-pairings/index.ts` draws from a hardcoded `CHEF_POOL` of ~50 real, named chefs (e.g. Joël Robuchon, Massimo Bottura, Gordon Ramsay, Yotam Ottolenghi) and instructs the model to attribute each generated recipe to one of them by name, with a `chefInspiration` field in the output. No evidence was found in the repository of any licensing, permission, or legal review process for this. This should be treated as a risk to resolve before any public launch, independent of competitive considerations.
10. **The "just ask ChatGPT/Claude" commoditization risk applies specifically to Vinster's generative pairing text**, and this cycle's finding that ChefGPT now ships a named wine-pairing feature (PairPerfect) sharpens this risk rather than easing it — a mainstream, lower-cost recipe app now offers a version of the same core value proposition.
11. **`eas.json`'s submission plumbing** (a real Apple `ascAppId`, a Google Play "internal"-track service account) existing without a corresponding public listing remains a minor but real signal that a release process was configured at some point and not carried through — consistent with the ongoing development stall.

---

## Emerging Trends

- **The AI-wine-recommendation market is real and growing, though sizing estimates vary widely by source** (figures this cycle ranged from $1.8B in 2025 to $7.6B by 2034 per one estimate, versus a $1.14B-as-of-2024 figure cited in the prior report) — treat the category as validated in direction, not precise in magnitude.
- **Convergence is now the dominant dynamic, not fragmentation alone.** This cycle is the first to find concrete evidence of cellar apps adding AI pairing (CellarTracker), recipe apps adding wine pairing (ChefGPT), and hardware ecosystems adding wine pairing (Samsung) all in the same research window — three distinct classes of incumbent independently moving toward the exact overlap Vinster occupies.
- **Consolidation and shutdown activity in adjacent recipe/meal-planning apps continues at pace.** Mealime's reported Oct 21, 2026 shutdown would make it the third notable independent meal-planning brand to fold into a parent company's ecosystem in about 22 months (after Yummly and PlateJoy) — a reminder that even apps with real ratings and users can be discontinued by a parent company's strategic pivot, and relevant to how Vinster (currently with no parent company or acquirer) should think about durability.
- **Cellar visualization remains a genuine, ongoing feature arms race**, with InVintory's 3D "VinLocate" mapping and a competing "CellarView" 3D tool both more visually ambitious than Vinster's diamond/triangle-bin geometry, which has not visibly evolved in 38 days.
- **AI-driven "taste-matching" is professionalizing at the infrastructure layer.** Preferabli (15 patents, a June 2026 Wine Society partnership, an acquisition of Libation Labs) and WineSpeak.ai (winery-facing conversational AI, a Dec 2025 Thomas Fogarty Winery partnership) show credible B2B/enterprise plays emerging that could out-execute or acquire their way into Vinster's exact niche faster than Vinster can build it.
- **Agentic, action-taking AI and MCP-based connectors continue displacing pure-chat AI in the adjacent recipe space** — an area where smaller, independent tools are moving faster than market leaders, and a lane Vinster's single-shot generation architecture (recommend, pairing, recipe generation) does not yet occupy.
- **Dining-reservation platforms are actively monetizing wine-adjacent experiences at the booking layer**, now with a dated, concrete September 2026 milestone (Amex's Resy Credit expansion to former-Tock restaurants) rather than just an announced merger — narrowing the room for a standalone wine app to independently own "the wine decision at a restaurant."
- **The AI-sommelier segment shows real churn/mortality alongside its growth.** Independent aggregator commentary this cycle explicitly notes several older entrants (Wine Ring, Tipple, The Wine Coach) have "gone dark" even as new entrants (Vinoperte, CellarMate, Sippd, Sommelio) continue launching — a caution against assuming any single new entrant, Vinster included, will necessarily survive long enough to matter.

---

## Recommended Differentiators for Vinster

Each item is marked **BUILT** (verified in the `main` codebase this cycle) or **PROPOSED** (not found in code — an idea only), with an honest, unflattering-where-warranted note on how defensible it really is given everything above.

1. **BUILT — A real, working, multi-function Claude-backed AI pipeline spanning scan → recommend → cellar → pair → recipe → review**, end to end in one app, confirmed by direct code reading this cycle (`src/services/ocr.ts`, `src/services/recommender.ts`, `supabase/functions/{ocr,scan-label,detect-lineup,recommend,food-wine-pairing,generate-pairings}`). **Defensibility: low as a bare "we have AI" claim, and lower this cycle than last** — CellarTracker and ChefGPT both added AI pairing features this research window, narrowing even the breadth argument; Vinoperte, RecipeAI, and Vine now also combine several of these functions.
2. **BUILT — An explicit, code-verified guard against LLM price hallucination**, discarding any price the model itself suggests in favor of OCR'd menu text or a live Wine-Searcher fallback estimate (`supabase/functions/recommend/index.ts:88`, `src/services/recommender.ts:46-49,117`). **Defensibility: moderate.** A genuinely careful, now precisely-quoted design decision, invisible to end users, easily replicated once a competitor notices the failure mode, and dependent on a third-party Wine-Searcher data license Vinster does not own.
3. **BUILT — Diamond/triangle-bin, multi-location, case-level cellar modeling with lineup (multi-bottle) detection.** **Defensibility: low-to-moderate, and unchanged from prior cycles.** Genuine, non-trivial engineering, but InVintory's 3D visual mapping and a competing "CellarView" tool are more visually compelling executions of a similar underlying idea, and are already shipped and rated.
4. **BUILT — Multi-axis, wine-specific restaurant reviews tied to real scan sessions.** **Defensibility: moderate, conditional, unchanged.** Genuinely rare — no competitor researched this cycle, including CellarTracker's or OpenTable's newer features, offers a directly comparable structured wine-restaurant rating. Its value remains entirely latent while `COMMUNITY_ENABLED = false` and there is no real review corpus.
5. **BUILT — Chef-attributed AI recipe generation from a specific wine**, confirmed this cycle to draw from a hardcoded pool of ~50 real named chefs. **Defensibility: low, and carries active legal risk, more urgently than before.** Vinomat/Gastrona already ship the wine-to-recipe direction as a live product with a "Restaurant Mode" B2B arm; separately, attributing AI-generated content to named real chefs without documented licensing remains an unresolved legal exposure that should be addressed before any public launch.
6. **BUILT — An AI "personality"/taste-profile sketch that gates on having enough real user data before generating a read**, confirmed this cycle with exact gating thresholds (`src/utils/personalityReadiness.ts`: ≥8 cellar wines or ≥4 list-scan picks, ≥5 "foodie" signals with ≥2 "hard" signals, activity spread across ≥2 distinct days). **Defensibility: moderate, unchanged.** A careful, non-obvious design choice not observed in any competitor researched — a genuine point of product craft, though a UX nicety rather than a hard technical moat.
7. **BUILT-BUT-DISABLED — Community/review-sharing feed.** **Defensibility: not applicable while disabled, and the gap to incumbents' real communities widens every week it stays off.**
8. **PROPOSED / NOT PRESENT — A browsable, persistent wine reference database.** **Defensibility if built: low**, since Vivino, CellarTracker, and InVintory all already have multi-million-record wine databases with years of head start.
9. **PROPOSED — Any monetization model.** Nothing exists in code today. **Still the single most urgent item in this report, independent of competitive differentiation.** The pricing band competitors have validated is now wider than previously understood ($2.99 to $14.95+/month), giving Vinster more room to position than a narrower band would, but zero code exists to act on this.
10. **PROPOSED — An MCP (Model Context Protocol) connector exposing Vinster's cellar/pairing data to Claude or ChatGPT.** **New this cycle. Defensibility if built: genuinely higher than most other options in this report right now** — no major food-app incumbent (Samsung Food, SideChef, Kitchen Stories) has shipped one yet; only smaller independent tools have. This is a real, currently-open lane consistent with where agentic AI in this space is heading, though it is worth only as much as the underlying app it would expose, and Vinster has not shipped code in 38 days to build toward it.
11. **PROPOSED — Reservation-platform/point-of-booking wine integration.** **Defensibility if built: still comparatively high, but narrowing month over month** — the Sept 15, 2026 Amex/Resy/Tock credit expansion is a concrete sign the booking platforms themselves are moving faster into this exact space than any independent app has. Requires restaurant/POS partnerships Vinster shows no current evidence of pursuing.

**Bottom line for a neutral outside analyst:** Vinster's shipped code remains real, technically careful in places (the now precisely-quoted price-hallucination guard, the personality evidence-gate with exact thresholds), and unusually broad in scope for a pre-launch app. But this cycle's research found the competitive ground shifting in a direction that should concern the team more than prior cycles' findings did: it is no longer just that ten-odd dedicated wine-sommelier apps do a version of Vinster's core loop — the deepest cellar-data incumbent (CellarTracker) and a mainstream recipe app (ChefGPT) have each independently shipped features converging on the exact same "wine + food" overlap Vinster treats as its core identity, while several brand-new dedicated entrants (Vinoperte, CellarMate, Sippd) launched and gained traction without Vinster shipping a single feature. The finding that should weigh most heavily this cycle is, again, not about any competitor at all: **38 days and six consecutive weekly cycles of zero substantive commits, no monetization code, and an unaddressed real-chef-attribution legal question remain entirely within Vinster's own control and are not being addressed** — and every week that continues, the market gap this report identifies as still-open (a single product combining cellar management, restaurant discovery/reviews, recipe generation, and pairing) narrows a little further, from more directions than before.

---

## Sources

**Wine apps**
- Vivino: https://apps.apple.com/us/app/vivino-drink-the-right-wine/id414461255 , https://www.appbrain.com/app/vivino-drink-the-right-wine/vivino.web.app , https://www.vivino.com/en/premium , https://www.trustpilot.com/review/vivino.com , https://www.vivino.com/en/articles/premium-pricing-guide-en
- Delectable: https://apps.apple.com/us/app/delectable-scan-rate-wine/id512106648 , https://apps.apple.com/ca/app/vinous-wine-reviews-ratings/id1010711422 , https://sommo.app/blog/best-wine-apps/
- CellarTracker: https://apps.apple.com/us/app/cellartracker-1-wine-tracker/id6446102275 , https://mobileapp.cellartracker.com/insights , https://www.starkinsider.com/2025/07/ai-wine-pairing-cellartracker.html , https://support.cellartracker.com/article/74-beta-release-notes
- Hello Vino: https://apps.apple.com/us/app/hello-vino-wine-assistant/id318447346 , http://www.hellovino.com/
- Wine Ring / Preferabli: https://www.winebusiness.com/news/vendor/article/256470 , https://apps.apple.com/us/app/preferabli/id1210794652 , https://travellingcorkscrew.com.au/blog/best-wine-apps/ , https://wineindustryadvisor.com/2026/06/04/the-wine-society-announces-partnership-with-preferabli/ , https://www.prnewswire.com/news-releases/preferabli-the-leading-ai-driven-software-in-wine-spirits-and-food-announces-acquisition-of-libation-labs-302358257.html
- Wine Spectator (WineRatings+): https://apps.apple.com/us/app/wineratings-by-wine-spectator/id381341648 , https://help.winespectator.com/support/solutions/articles/28453-how-do-i-see-wine-reviews-and-ratings-with-this-app-
- Sommo: https://sommo.app/ , https://sommo.app/blog/sommo-2-0-launch/
- Somm-AI / Somm / SommAI: https://apps.apple.com/us/app/somm-ai-wine-menu-scanner/id6744361256 , https://www.sommai.io/ , https://apps.apple.com/ca/app/sommai-wine-assistant/id6748579107
- WineScore: https://apps.apple.com/us/app/winescore-ai-scan-menu-pair/id6751806003
- InVintory: https://apps.apple.com/us/app/invintory-wine-bottle-tracker/id1434754695 , https://invintory.com/pricing/ , https://invintory.com/blog/ai-wine-sommelier-vincent-update/
- Vinomat: https://vinomat.app/
- Decanto: https://apps.apple.com/ng/app/decanto-learn-wine-pairing/id1355636493
- Pocket Sommelier: https://www.pocketsommelier.app/ , https://apps.apple.com/us/app/pocket-sommelier-wine-pairing/id6503256584
- wine.dine: https://play.google.com/store/apps/details?id=com.friendlyrobots.winedine&hl=en_US
- Vinoperte: https://www.accessnewswire.com/newsroom/en/business-and-professional-services/vinoperte-sees-early-global-adoption-across-50-cities-just-one-w-1146308 , https://www.pr.com/press-release/962002 , https://apps.apple.com/us/app/vinoperte/id6758808124
- CellarMate: https://www.winebusiness.com/news/vendor/article/307402 , https://www.cellarmate.ai/
- Sippd: https://sippd.xyz/ , https://apps.apple.com/us/app/sippd-rate-share-wine/id6764694430
- Sommelio: https://sommelio.app/
- Santé (funding): https://pulse2.com/sante-wine-and-spirits-fintech-platform-raises-7-6-million/ , https://alleywatch.com/2026/02/sante-ai-powered-alcohol-liquor-store-pos-wine-retail-software-darren-fike/
- Vinolin (funding): https://www.startbase.com/news/vinolin-erhaelt-200-000-e-pre‐seed
- VinoBuzz (funding): https://www.manilatimes.net/2026/04/15/tmt-newswire/media-outreach-newswire/us10-million-tech-startup-vinobuzz-takes-the-traditional-wine-market-by-storm-as-hong-kongs-first-ai-agent-marketplace-for-wine/2320629
- Vint (shutdown): https://richmondbizsense.com/2026/06/22/local-wine-investing-startup-vint-winding-down-operations/ , https://www.winebusiness.com/news/link/319561
- WineDirect (consolidation): https://www.vinoshipper.com/craft-advocate/winedirect-alternatives-what-wineries-should-know-before-the-2026-shutdown
- AI wine market sizing: https://dataintelo.com/report/ai-wine-recommendation-market , https://www.thebusinessresearchcompany.com/report/wine-beer-and-spirits-software-global-market-report

**Food/recipe apps**
- Samsung Food: https://www.plantoeat.com/blog/2026/01/samsung-food-review-pros-and-cons/ , https://mealthinker.com/blog/samsung-food-alternative , https://play.google.com/store/apps/details?id=com.foodient.whisk&hl=en_US
- Samsung AI Wine Manager / Vision AI: https://www.trustedreviews.com/news/samsungs-latest-kitchen-gadget-uses-ai-to-identify-log-and-track-wine , https://www.gizmochina.com/2026/03/31/samsung-infinite-ai-wine-refrigerator-launched-specs-price/ , https://phandroid.com/2026/01/05/your-samsung-tv-now-recommends-food-pairings-with-vision-ai-companion/
- Yummly shutdown: https://en.wikipedia.org/wiki/Yummly , https://www.plantoeat.com/blog/2024/12/yummly-is-closing-discover-the-best-meal-planning-alternative/ , https://thespoon.tech/whirlpool-lays-off-entire-team-for-cooking-and-recipe-app-yummly/
- SideChef: https://appgrooves.com/app/sidechef-step-by-step-cooking-by-sidechef-holdings-limited-1/negative , https://theaitoolsbox.com/tool/sidechef-review/
- Kitchen Stories: https://www.kitchenstories.com/en/stories/kitchen-stories-plus-our-new-premium-subscription , https://justuseapp.com/en/app/771068291/kitchen-stories-recipes
- Mealime shutdown: https://www.plantoeat.com/blog/2026/09/mealime-is-moving-heres-your-best-meal-planning-alternative/ , https://mealthinker.com/blog/mealime-alternative , https://www.pann-app.com/blog/is-mealime-shutting-down , https://swoodie.app/blog/mealime-shutting-down
- PlateJoy shutdown context: https://tracxn.com/d/companies/platejoy/
- ChefGPT PairPerfect: https://www.chefgpt.xyz/features/pairPerfect , https://api.chefgpt.xyz/
- DishGen: https://topai.tools/t/dishgen
- MCP/agentic trend: https://peliqan.io/blog/chatgpt-mcp/ , https://glama.ai/mcp/servers/alex-zwingli/plan-to-eat-mcp , https://github.com/mealie-recipes/mealie/discussions/7630 , https://www.mealift.app/blog/how-to-meal-plan-with-ai
- Agentic retail AI: https://www.albertsonscompanies.com/newsroom/press-releases/news-details/2025/Albertsons-Companies-Accelerates-Digital-Transformation-with-the-Albertsons-AI-Shopping-Assistant-Redefining-the-Grocery-Shopping-Experience/default.aspx , https://www.grocerydive.com/news/cooklist-agentic-ai-grocery-shopping-supermarkets-kroger-wegmans/822950/ , https://www.fmi.org/blog/view/fmi-blog/2025/10/23/the-rise-of-ai-agents--grocery-shopping-gets-more-automated--more-personal

**Combined space, dining platforms, trends, funding**
- Vine: Wine & Pairings: https://apps.apple.com/gb/app/vine-wine-pairings/id6790819499
- Gastrona: https://gastrona.app/ , https://apps.apple.com/us/app/gastrona-wine-pairing/id6480037842
- Corkiby/Corki: https://www.corkiby.ai/ , https://apps.apple.com/us/app/corki-wine-pairing-intel/id6761977264
- RecipeAI: https://recipeaipro.com/
- My Head Chef: https://www.myheadchef.app/
- Resy/Tock merger: https://upgradedpoints.com/news/resy-merges-with-tock-adds-25k-venues/ , https://www.restaurantbusinessonline.com/technology/reservation-services-resy-tock-are-merging , https://blog.resy.com/newsroom/resy-welcomes-tock-restaurants-wineries-experiences/
- Amex Resy Credit / Tock expansion (Sept 15, 2026): https://onemileatatime.com/news/amex-resy-credits-tock-restaurants/
- OpenTable: https://www.opentable.com/s/dinerschoice?metroid=11&regionids=173&topic=NotableWineList , https://finance.yahoo.com/small-business/articles/square-opentable-deepen-strategic-partnership-130000439.html
- WineSpeak.ai: https://www.morningstar.com/news/pr-newswire/20251230sf54352/napa-valley-tech-meets-silicon-valley-wine
- Wine Tech Challenge / Dolia: https://www.vinetur.com/en/20260515100761/eight-startups-join-wine-tech-challenge.html
- TechCrunch AI graveyard tracker: https://techcrunch.com/2026/09/15/the-ai-graveyard-a-running-list-of-projects-and-startups-that-didnt-make-it/
- "Vinster" name/presence check: independent web search passes (two, run separately) for "Vinster" wine app returned no App Store/Play listing or press coverage under that name this cycle

**Vinster (this app) — code sources verified directly on `main`, 2026-09-16**
- `git log --oneline c15d3c4..HEAD -- . ':!reports'` — zero commits; unfiltered log over the same range shows only weekly report-file commits; `git status --short` clean
- Grep for `revenuecat|stripe|in-app-purchase|react-native-iap|purchases-react-native` across the repo — zero matches
- Grep for `wine_library|wine_catalog|wine_encyclopedia` across `supabase/migrations/` — zero matches (noted distinction: `054_wine_knowledge.sql` / `wine-knowledge` edge function is a per-wine AI-notes feature, not a catalog)
- `src/services/ocr.ts`, `supabase/functions/{ocr,scan-label,detect-lineup}/index.ts` — OCR/label/lineup scanning, models `claude-haiku-4-5-20251001` and `claude-sonnet-4-6`
- `src/services/recommender.ts:46-49,60-65,85,105-120`, `supabase/functions/recommend/index.ts:88,265` — price-hallucination guard, quoted directly; model `claude-sonnet-4-6`
- `supabase/functions/wine-searcher-proxy/index.ts` — real Wine-Searcher API proxy with `pricing_cache` table
- `src/api/{bins,racks,storageLocations,cellar}.ts`, `supabase/migrations/{007,041,064,069,072}_*.sql` — cellar/rack/bin/case/storage-location data model
- `supabase/functions/food-wine-pairing/index.ts` — food-wine pairing logic
- `supabase/functions/generate-pairings/index.ts` (lines 11-38 `CHEF_POOL`, 174-176, 196, 203) — chef-attributed recipe generation, quoted directly
- `app/restaurants/reviews.tsx`, `supabase/migrations/018_restaurant_ratings.sql:5-8`, `038_restaurant_ratings_repair.sql` — four-axis restaurant reviews on `scan_sessions`
- `src/api/community.ts`, `src/constants/features.ts` (`COMMUNITY_ENABLED = false`), `app/cellar/[wineId].tsx:1731-1737`, `src/components/RestaurantReviewModal.tsx`, `app/community/` — community feature built but disabled
- `supabase/functions/personality/index.ts`, `src/utils/personalityReadiness.ts:13-19,41` — personality sketch feature and its data-sufficiency gating thresholds, quoted directly
- `app.json` (version unchanged at 1.3.4), `eas.json` (`ascAppId: "6763607127"`, Google Play `track: "internal"`) — submission plumbing only
- `reports/2026-09-09-market-comparison.md` — prior report, read in full for continuity, not carried forward on trust
