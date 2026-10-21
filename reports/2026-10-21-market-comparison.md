# Vinster — Market Comparison: Wine, Food & Combined Wine+Food Apps

**Date:** 2026-10-21
**Prepared by:** Automated Market Research Agent
**Branch analysed:** `main` @ `81e8ef1` (app.json version `1.6.0`)
**Prior report:** `reports/2026-10-14-market-comparison.md`

**A note on objectivity:** This is internal competitive intelligence, not marketing copy. Vinster's strengths are not inflated and competitors' advantages are not softened. Where a competitor is materially better than Vinster — in scale, data depth, funding, ratings, community, or polish — that is stated directly. Where Vinster is a late, small, or undifferentiated entrant, that is stated directly too. Every Vinster feature cited below as "built" was independently re-verified against the actual code on `main` this cycle (file paths cited throughout); anything not found in the code is marked **PROPOSED**, not built.

**What changed in the code since 2026-10-14:** Nothing. `git log 81e8ef1..HEAD -- . ':!reports'` shows zero application-code commits — the only commit in range is last week's report file itself (confirmed by `git rev-list --count` = 1). App version remains `1.6.0`. `COMMUNITY_ENABLED = false` is still set (`src/constants/features.ts:6`). A repo-wide search again found no RevenueCat/Stripe/`react-native-iap`/in-app-purchase code anywhere, and no test files (`*.test.*`, `*.spec.*`, `__tests__`) anywhere. This is now the **fourth consecutive report in this series with zero shipped application-code change** — the code picture is fully static while the market keeps moving.

**What changed in the market this cycle:** Two things worth flagging. First, a direct re-check of Vinster's own App Store/Google Play listings (tracked since last cycle) finds the **published Android build is on version `1.3.0`, while the `main` branch's `app.json` is at `1.6.0`** — a real version-lag between what's on `main` and what users can actually install, worth noting as its own small risk rather than assuming the two are in sync. The Google Play package is tracked by a third-party aggregator at **12 total downloads**, and no star rating or review count is visible on either storefront — the listing is live but has essentially zero public traction four months after that Android build (per its 2026-07-27 last-update timestamp) went out. Second, this cycle's research pass on the wine-scanner / "AI sommelier" sub-category surfaced a noticeably longer list of small, similarly-scoped apps than any prior cycle searched for directly — **WineScore, VinoLens, Winary, DiVino, WineWise, SommSnap, Somm AI, Ask Sommelier AI, AiSommelier, Pinpointed AI Sommelier (Shopify), and Grapevine/The Wine Engine** all surfaced as live or recently-updated 2025–2026 listings doing some version of "scan a label or wine list, get an AI recommendation." This reinforces, more concretely than before, that the exact capability Vinster leads with — camera-based wine-list scanning plus an AI recommendation — is now a crowded, low-differentiation category at the app-store level, not a feature Vinster originated or has to itself.

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

Four weeks into this report series, the code has not moved at all — zero application commits since the 2026-09-30 report, confirmed again this cycle by a direct `git log` check — while Vinster's public footprint has. The app has a live App Store listing and a Google Play package, but the numbers behind that listing are stark: a third-party aggregator puts total Android downloads at **12**, with no visible star rating on either store, and the published Android build (`1.3.0`) trails the `main` branch's `app.json` version (`1.6.0`) by several minor versions. Read plainly: Vinster is a real, working, feature-rich app with almost no users yet, and the gap between what is built and what has shipped to the store is itself worth tracking.

On the competitive side, this cycle's research sharpens a conclusion this series has been circling for weeks: the specific thing Vinster leads with — point your phone at a restaurant wine list or label and get an AI-reasoned pick — is not a moat. A direct search for this exact capability surfaced at least ten live or recently-updated apps doing some version of it (Sommo, Waine, WineScore, VinoLens, Winary, DiVino, WineWise, SommSnap, Somm AI, Ask Sommelier AI, AiSommelier), on top of Vivino's own "Vivino Sommelier" scanner under its Premium tier. Most of these are small, single-developer or micro-team products with few or no public reviews — so none individually threatens Vinster on scale — but their sheer number is itself the finding: wine-list/label scanning plus an AI verdict is now a commodity pattern at the app-store level, reproducible by a solo developer in a way that undercuts any claim that scanning-plus-recommendation alone is a durable differentiator. The genuinely scarcer capability remains what it has been for several cycles: a *persistent, personal cellar* wired into both pairing and recipe generation, which only a handful of apps (CellarTracker's CellarChat, Sommo, InVintory's Vincent, and Vinster's own cellar-mode pairing) attempt, and which no one — Vinster included — has fully wired end-to-end into recipe generation specifically.

The underlying structural read is unchanged from last cycle: the combined wine+food+cellar bundle is not replicated end-to-end by any single incumbent, cellar-aware *pairing* is now a multi-vendor pattern rather than a Vinster-only idea, and cellar-aware *recipe generation* remains the one concrete gap nobody has closed. What is new and should weigh on priorities going forward is the scale mismatch this cycle makes concrete for the first time: Vinster is competing for attention against a growing swarm of lookalike scanner apps while its own listing sits at single-digit-to-low-double-digit downloads, with no monetization and no automated tests shipped. The product is differentiated on paper; it is not yet differentiated in the market, because almost no one has seen it.

---

## Wine Apps

### Vivino
**What it does:** The category's largest crowdsourced wine database and social ratings feed, camera label scanning, a personalized "Match for You" score, an integrated wine marketplace, cellar tracking, and — under Premium — "Vivino Sommelier," an AI chat feature and a wine-list scanner.
**Scale:** The unambiguous category leader; tens of millions of users; Vivino's own marketing claims 70M+ users of its scanner/ratings/community (not independently audited).
**Ratings:** Figures continue to conflict across aggregators. This cycle's direct check: Google Play 4.7★ (~227.6K reviews) and Apple 4.8★ (~126.7K reviews) per two storefront trackers; a third aggregator cites 4.8★ from 357K reviews and explicitly calls the current reception "polarized," citing "aggressive monetization" as a recurring 2026 complaint theme. A separate German trade-press piece (Meininger, 2026) reports that Vivino's shop and marketing emails lean on crossed-out "was/now" discount pricing and foreground critic scores over average user ratings in promotional material — a marketing-practice detail, not a rating, but relevant color on how the company monetizes its scale.
**Pricing:** Freemium. Apple's listing shows IAPs from $4.99 up to $47.90; one listing cites an annual Premium price of $49.99/year with a 6-month trial (likely regional/promotional), while an older figure of $4.99/month persists in some secondary sources — pricing data is genuinely inconsistent across sources and should be verified at point of use.
**Recent developments:** The most recent dated update found (July 27, 2026) describes a facelift to "your personal AI Sommelier" and a redesigned Shop screen with faster browsing and better search for buyable wines — a continued investment in exactly the AI-scan/recommendation space Vinster is built around, at a scale Vinster cannot match.
**Assessment:** Unchanged — the scale and data leader by a wide margin, continuing to out-invest any pre-launch entrant on exactly the AI-scan capability Vinster is built around, and now with sharper evidence that its monetization is a live point of user friction, not just a theoretical risk.

### Delectable
**What it does:** Camera-first label recognition built around a social feed of verified sommeliers, winemakers, and critics rather than crowd averages; a personal wine journal; also covers beer and spirits; integrated Vinous critic reviews under Premium. Owned by Antonio Galloni's Vinous since 2016.
**Ratings:** ~4.7★ App Store (~26K ratings); ~3.9★ Google Play (~6K reviews) — carried forward, unchanged this cycle.
**Pricing:** Free, with Premium confirmed this cycle at **$5.99/month** (Vinous reviews, priority transcription for hard-to-match labels, ad-free, profile badge) and a separate **$1.99/month** ads-off-only tier. Purchasing routes through a sister app, Banquet, covering 22,000+ wines from boutique and independent dealers.
**Recent developments:** No dated 2025/2026 news found this cycle beyond the pricing detail above; App Store reviewers continue to single out label-recognition accuracy as the app's strongest point ("the best I've seen out there for these types of apps").
**Assessment:** Unchanged — a smaller, curated alternative whose critic-credibility differentiator is durable but whose own food-pairing feature remains weak by reviewer consensus.

### CellarTracker
**What it does:** The dominant cellar-inventory and tasting-note platform for serious collectors — bottle tracking, valuation, drinking-window guidance, and a tasting-note corpus in the tens of millions. Shipped "CellarChat" (AI pairing chat, beta) in July 2025.
**Scale:** Over 13M total reviews cited on the current store listing (11M community tasting notes + 2M professional reviews); passed 200M bottles tracked / 100M bottles opened per an April 2026 milestone.
**Ratings:** The store's own marketing claims 4.9★, but third-party tracker data this cycle tells a materially different story: one listing shows **3.8★ from 175 reviews** (last updated November 2024) for the current app, and a legacy version shows **3.3★ from 12 reviews** — a reminder that a brand's self-reported rating and an independently tracked rating can diverge sharply, and that CellarTracker's real user sentiment may be weaker than its own listing suggests.
**Pricing:** Sources conflict and should be treated with caution: the current App Store listing shows free-with-IAP (account required for cellar management/consumption tracking); older coverage cites a $40–$160/year "suggested donation"; a third source describes a one-time perpetual-license purchase of $5–$45. No single authoritative 2025/2026 price was found this cycle.
**Recent developments:** No new funding or feature launch dated to this window; the vendor itself notes the "classic" legacy app will receive no further feature updates.
**Assessment:** Largely unchanged, but this cycle's rating discrepancy is worth carrying forward: CellarTracker's data moat (200M+ bottles) is real and vastly larger than anything Vinster can offer, but its actual user satisfaction, per independent tracking, may be only middling — a useful reminder that scale and satisfaction are not the same thing, for any app in this report, Vinster included.

### Hello Vino / Wine Ring
**What they do:** Hello Vino is one of the earliest guided (non-scan) wine-recommendation apps; Wine Ring is an older recommendation-engine app that required extensive user rating history to improve.
**Ratings:** Hello Vino ~4.6★ App Store (~6.7K) / ~3.3★ Google Play (~930) — much weaker on Android, carried forward. No fresh Wine Ring rating data found; a 2016 Bloomberg review (Elin McCoy) found it could identify only 4 of 10 test bottles and needed many rated wines before recommendations improved, calling it "not ready for prime time" — the only substantive review of Wine Ring found across any cycle of this report, and it is a decade old.
**Pricing:** Hello Vino: free with ads, small one-time IAPs.
**Recent developments:** No update or news found for either app this cycle — both remain essentially dormant in search coverage.
**Assessment:** Unchanged — limited relevance as a direct threat; useful mainly as a historical cautionary tale (Wine Ring) that AI-style wine recommendation is easy to promise and hard to make reliable without substantial rated-data volume per user.

### Sommo
**What it does:** An "all-in-one" pocket sommelier — AI label and restaurant wine-list/shelf scanning (including value-pick scoring on shelves), virtual cellar management with named racks, AI-suggested pairings sourced from the user's own cellar, a tasting journal with a "Taste DNA" six-axis palate profile, and a WSET exam-prep module (flashcards, quizzes, mock exams). Single-founder product, launched late 2025.
**Ratings:** Still statistically negligible — this cycle's data shows ~4.8★ across 38 ratings per one aggregator, and a separate analysis of 11 written US App Store reviews found roughly 73% positive, 27% neutral, none negative. One WSET Level 3 student's review, examined in detail this cycle, praised the interface and typed-answer grading but flagged at least one factually wrong study-content claim (an incorrect statement about Merlot ripening) — the developer responded directly to that feedback.
**Pricing:** Free tier (label scans, fundamentals course, basic journaling); Premium ~$3–5/month with a 3-day free trial.
**Recent developments:** Its own marketing site (sommo.app) continues to push the scanning/menu-scoring angle hard in 2026 blog content, positioning the "Menu Scoring" feature (scores wines by quality, value, and cuisine-fit from a photographed wine list) as a headline capability.
**Assessment:** Unchanged — still the closest single pure-wine-app match to Vinster's scope, still a non-threat by scale (sub-50 total ratings), but still live proof that a solo developer can ship the full feature set, including WSET content Vinster does not have, at commodity pricing.

### Wine Spectator (WineRatings+)
**What it does:** Access to Wine Spectator's professional critic database (400,000+ expert ratings and tasting notes per the app's own help center) and editors' "Picks," with price/score filtering, wine-list building/sharing, and voice-to-text search.
**Ratings:** ~4.6–4.65★ (~900 ratings, iOS-focused) — carried forward, unchanged.
**Pricing:** 30-day free trial, then $2.99/month, sold separately from a Wine Spectator magazine/website subscription.
**Recent developments:** No news dated to this window found.
**Assessment:** Unchanged — a stable editorial-authority reference tool, not an AI feature competitor, but a reminder that a large professionally-curated ratings database (400K+ entries) is a credibility asset Vinster does not have and is not positioned to build.

### The wider "AI sommelier / wine-scanner" wave
This cycle's dedicated search for new AI-sommelier entrants surfaced a notably longer list than prior cycles' passes: **WineScore: AI Scan Menu & Pair**, **VinoLens: AI Wine Scanner**, **Winary** (claims 9M+ wines in its database, with fair-market pricing and pairings from either a label or a wine list), **DiVino** (one camera mode for both labels and restaurant wine lists; explicitly claims to "learn from your ratings and notes" and to show *why* a recommendation was made — an explainability framing none of the other apps in this report, Vinster included, were found to advertise), **WineWise: AI Wine Scanner App**, **SommSnap Wine AI**, **Somm AI: Wine Menu Scanner**, **Ask Sommelier AI: Wine Scanner** (ranks wines by match and flags whether a result is catalog-verified, web-researched, or uncertain — its own version of a confidence/trust signal), and **AiSommelier** (B2B-leaning, aimed at hotels/restaurants/wine farms, now adding in-app ordering). On the retail-infrastructure side, **Pinpointed AI Sommelier** launched January 2026 as a one-click Shopify app letting independent wine/spirits retailers add an AI sommelier recommending from their own live inventory, and **Grapevine**, from a new venture called **The Wine Engine**, launched mid-2026 as a subscription AI-sommelier service built on OpenAI's models, initially covering a curated set of 400 wines — a narrower, curated-catalog business model distinct from the open-scan approach everyone else in this cluster uses.
None of these individually has independent press coverage or a meaningful review base beyond app-store listings and aggregator pages — most show single-digit-to-low-double-digit rating counts, exactly like Vinster's own listing. **Assessment:** the finding is the aggregate pattern, not any one competitor: wine-list/label scanning plus an AI verdict is now reproducible by small teams at commodity cost, and the category keeps adding entrants rather than consolidating. DiVino's explainability framing and Ask Sommelier AI's confidence-labeling are worth tracking specifically, since they address a trust gap (does the AI know what it doesn't know?) that applies equally to Vinster's own OCR/recommendation pipeline.

On the B2B infrastructure side, **Santé** (AI/fintech infrastructure for wine and spirits retailers) is now confirmed to have raised a **$7.6M seed round** (February 2026, led by Bonfire Ventures, with Y Combinator participating) ahead of the $15M Series A reported in the prior cycle — two separate rounds in the same year, not a contradiction, and a sign of sustained investor interest in the B2B side specifically. Separately, **Tastry**, an AI platform for evaluating consumer taste preferences, is tracked as the best-funded company in its database category at $12.4M total raised, and a Hong Kong venture, **VinoBuzz**, is reported (via a press-release-style source, so treat with caution) as closing an angel round at a $10M valuation for an "AI agent and marketplace for wine." An Italy-based accelerator program (Eatable Adventures / UniCredit) selected eight startups in May 2026 for a "Wine Tech Challenge" focused on vineyard, cellar, and sales technology — an ecosystem-breadth signal, not a single funding event.
**Assessment:** Unchanged from last cycle's conclusion — capital conviction in wine-tech continues to look stronger on the B2B retail-infrastructure side than the consumer pairing-app side, and this cycle's additional B2B signals (Santé's seed, Tastry, VinoBuzz, the Italian accelerator cohort) reinforce rather than change that read.

---

## Food / Recipe / Pairing Apps

### Samsung Food (formerly Whisk)
**What it does:** Samsung's flagship AI food/recipe platform — recipe import from any website into a standardized format, "Smart Cook" guided cooking, AI-personalized weekly meal plans by dietary preference, Vision AI food-photo recognition (calorie estimation gated to Galaxy devices/certain regions), SmartThings appliance integration.
**Scale:** Rebrand of Whisk (Samsung-owned since 2019, renamed August 2023).
**Ratings:** This cycle's direct check shows 4.8★ on the Apple App Store from ~6.1K reviews per one tracker (captured early 2026) — notably lower in review count than a prior cycle's cited ~22K figure, which may reflect different snapshot dates or different counting methodology across trackers; treat the exact review count as uncertain. A secondary aggregator cites 4.86★ from 135 reviews, a figure too small and too divergent to reconcile with the above and best treated as a weak signal.
**Pricing:** Free tier; Samsung Food+ confirmed this cycle at $6.99/month or $59.99/year; the "Health Goals" feature, previously paid, has been made free for all users as of a recent update.
**Recent developments:** A 2025 release unified all recipe photos into one scrollable gallery on iPhone/iPad; version 2.50.0 added ingredient auto-complete in the Recipe Builder. The Verge is quoted praising the app for removing "the busywork of creating meal plans, building grocery lists, and even shopping." Samsung's wine-AI investment remains confined to its physical smart fridges (the "AI Wine Manager" Bespoke fridge line), not the Samsung Food app itself.
**Assessment:** Unchanged — the best-resourced, most hardware-integrated food app researched, continuing active feature investment, still with no wine-pairing feature inside the app itself.

### Yummly — discontinued December 20, 2024
No change this cycle. Whirlpool shut down the website, mobile apps, and smart-appliance integrations in late 2024, citing "adjusting its operating model"; pre-shutdown user complaints (per unitQ's feedback tracking) centered on crashes, lost saved collections, and no bulk recipe export. Still shut down, still no relaunch, still the clearest cautionary precedent in this report for a large, well-funded (Whirlpool-owned) food app folding entirely.

### SideChef
**What it does:** A large recipe collection with step-by-step instructions, diet filters, ingredient-based search, grocery-list creation with direct Walmart/Amazon Fresh shopping, voice commands, and built-in timers. "RecipeGen AI" converts a photo of a dish into a recipe.
**Ratings:** ~4.7★ App Store; a secondary aggregator cites an 8.93/10 score from 1K+ verified reviews across three platforms — broadly consistent with, but not identical to, prior cycles' 4.3–4.4★ Play figures.
**Pricing:** Free app (reviewers specifically note the free tier is not aggressively gated: "it doesn't block you from the good recipes if you don't pay for premium"); Premium $4.99/month or $49.99/year.
**Recent developments:** No new funding or feature news found this cycle; last confirmed funding remains a $6M Series B from March 2023.
**Assessment:** Unchanged — RecipeGen AI remains the clearest live evidence that photo-to-recipe AI is real but still imperfect, a relevant caution for Vinster's own vision-AI pipeline (OCR/label/wine-list scanning), and SideChef's non-aggressive free-tier framing is a useful contrast point against Vivino's user complaints about monetization pressure.

### Kitchen Stories
**What it does:** A large editorial recipe library (~7,500 recipes) and a widely imitated "Cook Mode," deliberately non-AI.
**Ratings/status this cycle:** A dedicated search this cycle returned essentially nothing new — consistent with the pattern across multiple prior cycles where Kitchen Stories surfaces no fresh coverage at all. Last confirmed figures (carried forward, unverified this cycle): ~4.8★ App Store; Google Play showing a wide cross-aggregator spread (3.4–4.1★).
**Pricing:** Free base app; Kitchen Stories Plus at €7.99/month or €79.99/year (carried forward).
**Assessment:** Unchanged — still a useful reminder that strong editorial curation without AI features can retain a loyal following; this app's coverage is now so consistently thin in search results across cycles that it should be treated as settled/stable rather than re-searched with the same generic terms each week.

### Mealime — reported shutdown October 21, 2026
**Status this cycle — today is the claimed shutdown date, and the picture is unchanged from last week's "cannot confirm" flag.** A fresh search this cycle again returned no primary-source confirmation of a shutdown, an Albertsons "Meals Hub," or any event tied to today's date specifically. This is now three consecutive cycles in which the originally-reported shutdown claim has failed to gain any independent or even secondary corroboration, on the exact day it was supposed to happen. **This should now be treated as a likely-erroneous or unverifiable claim rather than a pending event** — the appropriate posture going into next cycle is to drop the "reported shutdown" framing unless a primary source actually surfaces, rather than continuing to carry forward an unconfirmed date that has now passed with no evidence either way.
**Assessment:** The structural point from prior cycles — that standalone food apps can be absorbed into or discontinued by retailer ecosystems — stands as a general pattern (see Yummly), but this specific Mealime claim has not held up under three cycles of direct scrutiny and should be retired as a cited fact in future reports.

### The AI recipe-generator landscape
This cycle's broader search for "AI recipe generator" apps surfaced a crowded, fragmented field largely self-promoted by the vendors themselves: **DishGen**, **FoodiePrep**, **RipePlate**, **foodsGPT**, **ChefGPT**, **Supercook** (built around "cook from what's already at home"), **Eat This Much**, **Ollie AI**, and **Prepear** (a free tier covering recipe saving, weekly planning, grocery lists, and recipe nutrition) all appear in 2026 "best AI recipe generator" roundups — nearly all of which are written by a competing vendor ranking itself first, a pattern worth noting for how little independent, trustworthy comparison content exists in this specific sub-category. None of these tools was found to have a wine- or beverage-pairing feature.
**Pattern across this whole category, reconfirmed yet again this cycle:** no food/recipe app researched across any cycle of this report — including this one — has a native wine or beverage-pairing feature. This remains a clean, verifiable white space relative to mainstream recipe apps specifically, though it says nothing about the combined-app competitors covered in the next section, several of whom do pair wine with food.

### Other notable entrants
**PlateJoy** (folded into RVO Health's "Wellos") and **Plant Jammer** are unchanged this cycle, with no new news for either. **Clove** (the Canva-alumni AI recipe-marketplace startup) — its reported seed round remains confirmed, via consistent Australian business press, as $4.15M, closed in December 2023, not a recent 2026 raise and not $415M (resolved in the 2026-10-14 report; not re-litigated here). No evidence of a public Clove beta launch or further funding was found this cycle.

---

## Combined Wine + Food / Dining Space

This remains the segment most directly relevant to Vinster's stated positioning, and this cycle's research both reconfirms the prior read and adds several newly-surfaced competitors.

**Direct combined competitors — status this cycle:**
- **Sommo** — see Wine Apps above; unchanged assessment, still the closest single-app analogue to Vinster's full scope.
- **InVintory** ("VinLocate" 3D cellar visualization + "Vincent" AI sommelier) — no new detail surfaced this cycle beyond what prior cycles already captured (MCP server connecting a user's cellar to Claude/ChatGPT/Gemini; collection management via chat). Carried forward unchanged.
- **Winary** — newly catalogued this cycle. Claims a 9M+ wine database, scans a label or restaurant wine list, and returns ratings, "fair-market pricing," and pairings in one flow — functionally the closest single new competitor to Vinster's scan-to-recommendation-to-pairing loop found this cycle. No independent review data found; treat its database-size claim as a vendor assertion, unverified.
- **DiVino** — newly catalogued this cycle. One camera mode covers both bottle labels and restaurant wine lists; distinctively, its own marketing explicitly promises to explain *why* a recommendation was made and suggests testing scan accuracy under real restaurant lighting conditions — the only competitor found in this report series to proactively flag its own scan-accuracy limitations in its marketing.
- **Pocket Sommelier: Wine Pairing**, **Vinomat: Pair Wine & Recipes**, **Pour Decisions - Wine Pairing**, **Wine Pairing Cellar** — a cluster of small, 2025–2026-launched dedicated pairing apps newly surfaced this cycle via a direct "food and wine pairing app" search. Vinomat specifically generates recipes tailored to a chosen wine (the mirror image of Vinster's dish-to-wine flow) and gives AI pairing scores on a 0–10 scale; Pour Decisions adds a "Dinner Party Mode" picking one wine for a multi-course menu; Pocket Sommelier adds photo-based food recognition for pairing suggestions. All four show single-digit-to-negligible review counts (Pocket Sommelier: 7 ratings) — none is a scale threat, but their number reinforces that "AI pairs wine with a dish" is, like scanning, now a commodity pattern reproducible by small teams.
- **MaiCellar, Saignée, Cellared** — unchanged from prior cycles; no new coverage found for any this cycle.
- **CellarEye: Wine Tracker** — newly catalogued this cycle, worth noting as a contrast case: it focuses purely on physical-location tracking (sticker-tagged racks/shelves/bins you tap to open) rather than AI recommendations or pairing, positioning itself as "built by collectors for collectors." It is a useful reminder that not every cellar competitor is chasing AI — some are winning on simplicity and physical-location UX instead, a dimension Vinster's diamond-bin/rack modeling should be benchmarked against directly, not just against AI-forward competitors like InVintory.

**Vinster's own market presence — re-verified, not materially changed, this cycle:** The live App Store listing (`id6763607127`) and Google Play package (`com.vinster.app`) persist from last cycle. New this cycle: a third-party tracker puts total Android downloads at **12**, with the published build at version `1.3.0` against the `main` branch's `1.6.0` — a concrete, if small-sample, traction signal, and a concrete version-lag flag. No star rating or review count is visible on either storefront. This is consistent with last cycle's "too new to show public figures" read, now with slightly more granular (and sobering) detail behind it.

**Restaurant-discovery and reservation apps:** OpenTable, Resy, and Yelp remain largely wine-light. A closer look at Resy this cycle finds it has, following its Tock integration, added nearly 1,200 wineries to its bookable-venue inventory and is investing in a dedicated wine-tourism editorial hub (covering regions like Napa Valley and Sonoma) and chef/sommelier-curated restaurant lists (e.g., a beverage director's "Wine List" feature) — real wine-adjacent investment, but it is curatorial and discovery-oriented, not a per-bottle AI recommendation or pairing engine. No wine-scanning or AI-pairing feature was found at OpenTable, Resy, Yelp, DoorDash, or Instacart.

**Funding, launches, shutdowns this window:** See Wine Apps section above for Santé's seed round, Tastry, and VinoBuzz — all B2B/infrastructure-leaning rather than consumer combined-app news. No consumer combined-app funding event was found dated to this specific window.

**Objective verdict — is "wine + food + cellar in one app" a white space or crowded?** Unchanged in direction, sharper in evidence this cycle: **closer to crowded than to white space, and more crowded than last cycle's list suggested.** Beyond the already-tracked cluster (CellarTracker/CellarChat, Sommo, InVintory/Vincent, Vivino/Vivino Sommelier, MaiCellar, Saignée), this cycle adds Winary, DiVino, and a cluster of small dedicated pairing apps (Vinomat, Pocket Sommelier, Pour Decisions, Wine Pairing Cellar) all attempting some slice of the same combined pitch. The narrowest genuinely underserved sliver remains exactly what prior cycles identified: **generative recipe creation tied to a persistent, personal cellar inventory** specifically — not cellar-aware pairing (multiple competitors do that), and not dish-to-wine pairing alone (a dozen small apps do that too).

---

## Feature Comparison Matrix

| App | Category | Label/List Scan (camera) | AI Recommendations/Chat | Cellar / Rack-Location Mgmt | Food Pairing | Recipe Generation | Community/Social | Rating (approx.) | Price |
|---|---|---|---|---|---|---|---|---|---|
| **Vinster** | Combined | **BUILT** — Claude vision OCR, list + label (`supabase/functions/ocr`, `scan-label`) | **BUILT** — Claude sommelier engine using real profile data (`supabase/functions/recommend`) | **BUILT** — racks, diamond/triangle bins, fridges, cases (`src/api/bins.ts`, `src/api/racks.ts`) | **BUILT, cellar-aware** — dish → best bottle from actual cellar, weighted by drinking-window status (`supabase/functions/food-wine-pairing`, `mode: 'cellar'`) | **BUILT, but not cellar-aware** — single-wine-keyed (`supabase/functions/generate-pairings`) | **BUILT but disabled** (`COMMUNITY_ENABLED = false`) | **No rating/reviews visible** — live listings exist; Android tracked at ~12 total downloads, published build v1.3.0 vs. `main`'s v1.6.0 | Free (per App Store listing); no pricing/IAP code exists in the repo |
| Vivino | Wine | Yes (label; list under Premium) | Yes ("Vivino Sommelier" chat) | Yes | Yes (reported generic) | No | Yes (largest crowd DB) | 4.7★ Play (~228K) / 4.8★ Apple (~127K–357K, source-dependent); 2026 monetization complaints noted | Free + ~$4.99–$49.99/yr (disputed) |
| Delectable | Wine | Yes (label) | No | No | Yes (weak, per reviewers) | No | Yes (pro/critic network) | 4.7★ iOS (~26K) / 3.9★ Play (~6K) | Free + $5.99/mo (Premium), $1.99/mo (ad-free) |
| CellarTracker | Wine/Cellar | No | Yes ("CellarChat," cellar-aware pairing) | Yes (deepest data, 200M+ bottles tracked) | Yes (via CellarChat) | No | Yes (13M+ reviews/notes) | Store claims 4.9★; independent tracker shows 3.8★ (175 reviews) — materially lower | Free + $40–$160/yr donation or $5–$45 one-time (sources conflict) |
| Hello Vino / Wine Ring | Wine | Yes (secondary) / limited | Yes (guided, basic) / poor per 2016 review | No | Basic | No | No | 4.6★ iOS / 3.3★ Play (Hello Vino) | Free + small IAPs |
| Sommo | Combined | Yes (label, list, shelf) | Yes | Yes (named racks) | Yes (against own cellar) | No | No | ~4.8★ (38 ratings) | Free tier + $3–5/mo |
| InVintory | Combined | Yes | Yes ("Vincent"; MCP to Claude/ChatGPT/Gemini) | Yes (VinLocate 3D rack/bin) | Yes | No | No | Not found | Not confirmed |
| Winary | Combined | Yes (label + list) | Yes | Not primary focus | Yes | No | No | Not found | Not confirmed |
| DiVino | Combined | Yes (label + list) | Yes (explains "why") | Limited | Yes (learns from ratings) | No | No | Not found | Not confirmed |
| Vinomat / Pocket Sommelier / Pour Decisions | Combined (small) | Partial (photo-of-dish on some) | Yes (pairing scores) | No | Yes | Yes (Vinomat only, bottle-specific) | No | Negligible (single digits to ~1K downloads) | Free/freemium, unconfirmed |
| Wine Spectator (WineRatings+) | Wine | No | No | No | No | No | No | 4.6–4.65★ (~900) | $2.99/mo after 30-day trial |
| Samsung Food | Recipe | No (ingredient photo, not wine) | Yes (meal planning) | No | No | Yes (import + AI plans) | No | 4.8★ iOS (~6.1K, source-dependent) | Free + $6.99/mo or $59.99/yr |
| SideChef | Recipe | No (dish photo → recipe) | Limited | No | No | Yes (RecipeGen AI, inconsistent accuracy) | No | 4.7★ iOS / ~8.93/10 aggregator | Free + $4.99/mo or $49.99/yr |
| Kitchen Stories | Recipe | No | No | No | No | No (editorial only) | No | 4.8★ iOS / 3.4–4.1★ Play (disputed) | Free + Plus tier (€7.99/mo) |
| Yummly | Recipe | No (**shut down Dec 2024**) | — | — | — | — | — | 4.8★ (historical) | — |
| Mealime | Recipe | No | Limited | No | No | No | No | 4.8★ iOS / 4.6–4.7★ Play (status unverified; claimed shutdown date passed with no confirmation) | Free (reportedly) |

*Ratings/prices are the most precise figures found via web search as of October 2026; several figures show meaningful cross-aggregator disagreement and should be treated as directional, not exact. Live App Store/Google Play figures could not be independently fetched from this environment (network egress to apps.apple.com was blocked this cycle) and are drawn from search-tool results and third-party aggregators citing those listings.*

---

## Market Gaps & Opportunities

1. **Cellar-aware recipe generation specifically — unchanged, the clearest remaining gap.** No competitor identified across six research cycles — including Vinomat (recipes tied to one named bottle, not a persistent cellar) — generates a *recipe* designed around a user's actual aging cellar bottles. Vinster's `generate-pairings` engine and cellar data model both exist but are not wired to each other this way today, confirmed again by the zero-code-change finding this cycle.
2. **Restaurant wine-list scanning + food pairing in one flow, at the table.** No longer a rare combination — this cycle's research found at least ten apps attempting versions of it (see Wine Apps and Combined sections above). It remains table-stakes functionality Vinster has built well, not a differentiator on its own.
3. **Wine pairing remains a clean white space relative to mainstream recipe apps specifically.** Reconfirmed this cycle — Samsung Food, SideChef, Kitchen Stories, Mealime, Yummly, PlateJoy, and the broader AI-recipe-generator cluster (DishGen, FoodiePrep, Supercook, etc.) show no sign of adding a wine/beverage pairing feature. This gap is about the recipe-app side of the market, not the wine-app side, where pairing is now common.
4. **Explainability and confidence-signaling in AI wine recommendations is an emerging, still-rare differentiator.** DiVino's "explain why" framing and Ask Sommelier AI's catalog-verified/web-researched/uncertain labeling are the only two competitors found across this report series to proactively address whether users can trust a given AI pick. Vinster's own price-integrity discipline (never inventing a price/score) is philosophically adjacent but not framed the same way to users; making that trust mechanism visible and explicit in-product, rather than just enforced server-side, is a low-cost opportunity worth considering.
5. **Simplicity-first, non-AI cellar tracking (CellarEye) is a reminder that not every user wants an AI layer.** A pure physical-location tagging approach, with no AI recommendation at all, still finds an audience ("built by collectors for collectors"). This suggests Vinster's cellar/rack/bin UX should be evaluated on its own physical-organization merits, independent of the AI features layered on top, since some competitors win purely on that axis.

---

## Risks & Where Competitors Are Stronger

Stated plainly, without hedging:

- **Data moat.** Unchanged: CellarTracker's 200M+ tracked bottles and Vivino's tens of millions of users dwarf anything Vinster can offer. Vinster's live storefront presence, now quantified at ~12 Android downloads, is not remotely comparable to an established data/community moat — this cycle's granular download figure makes that gap concrete rather than merely assumed.
- **Brand and distribution.** Vivino, Samsung Food, and CellarTracker all have distribution advantages Vinster has none of. Vinster's App Store/Play listings change "no public presence" to "public presence with negligible traction" — a real but still very early-stage improvement, not parity.
- **Scanning and AI recommendation is a commodity capability, not a differentiator.** This cycle's finding that at least ten apps (Sommo, Waine, WineScore, VinoLens, Winary, DiVino, WineWise, SommSnap, Somm AI, Ask Sommelier AI) already do wine-list/label scanning plus an AI verdict means Vinster cannot lean on this capability alone as a pitch. It is necessary, well-executed, and not sufficient.
- **Cellar-aware AI pairing is confirmed, not just suspected, to no longer be Vinster's alone.** Unchanged: at least four to five competitors (CellarTracker, Sommo, InVintory, MaiCellar, and implicitly Vivino) now do a version of this, several at vastly larger data scale.
- **Monetization remains completely unbuilt.** Unchanged — zero pricing/IAP code exists anywhere in the repository, reconfirmed again this cycle, even though the live App Store listing itself is described as free with no visible IAP. This is now a four-week-old static gap, not a recent one.
- **Community/social remains built but off.** Unchanged — `COMMUNITY_ENABLED = false`, zero live user-generated content, while Vivino, CellarTracker, and Delectable all run live social layers that drive retention.
- **A version-lag between `main` and the published Android build is a new, concrete process risk.** The live Google Play build (v1.3.0) does not match `main`'s `app.json` (v1.6.0) — whatever has changed in the intervening versions (if anything beyond version-bumping, since application code itself has not changed per this cycle's `git log` check) is not reaching real users. This is worth investigating directly rather than assuming the published build is current.
- **CellarTracker's self-reported rating may materially overstate real user sentiment.** Its own listing claims 4.9★, while an independent tracker shows 3.8★ on a smaller but still meaningful sample — a reminder, applicable to how Vinster's own eventual reviews should be read too, that app-store self-reported figures and third-party-tracked figures can diverge significantly.
- **Standalone recipe/meal apps continue to be absorbed into or dropped by larger ecosystems — Yummly is the confirmed example; Mealime's claimed shutdown has now failed to be corroborated through its own claimed shutdown date and should be treated with real skepticism going forward**, not cited as settled.
- **Consumer wine-tech capital remains thin relative to B2B infrastructure.** Unchanged and reinforced this cycle — Santé's seed and Series A, Tastry's $12.4M, and VinoBuzz's reported $10M valuation are all B2B/infrastructure-leaning; no comparable acceleration was found on the consumer wine+food app side.
- **Zero automated test coverage.** Unchanged — a real engineering-risk gap independent of market positioning, now persisting across four consecutive cycles with no app update at all.
- **Reliability remains a known unsolved problem industry-wide, not just for Vinster.** Unchanged — SideChef's RecipeGen AI issues remain the clearest documented instance; DiVino's own marketing proactively cautions about scan accuracy under poor restaurant lighting, which is directly relevant to Vinster's own OCR pipeline.

---

## Emerging Trends

- **Generative AI in food/recipe apps remains mainstream, not novel.** Unchanged this cycle — no new large-scale AI feature launch found among the major players.
- **The consumer AI-sommelier/scanner branding cluster has grown sharply, not slowed, and this cycle's direct search made that concrete.** At least ten distinctly-branded apps doing scan-plus-recommend were found in one research pass — the largest single-cycle count in this report series — reinforcing that this exact sub-category is now low-differentiation at the feature level and winnable mainly on execution quality, trust signals, or distribution, not on having the feature at all.
- **Explainability/confidence-signaling is a nascent differentiation axis worth watching.** DiVino and Ask Sommelier AI are the first two competitors in this report series to build user-facing trust/confidence framing directly into their AI output, rather than just producing a recommendation and hoping it's trusted.
- **B2B "AI sommelier / retail infrastructure as a service" continues to attract more capital than consumer wine+food apps.** Reinforced this cycle by Santé's confirmed seed-then-Series-A sequence, Tastry's funding total, and VinoBuzz's reported raise — all in 2026, all B2B-leaning.
- **Cellar-aware AI pairing is now a multi-vendor pattern, not a single-vendor innovation.** Unchanged — reconfirmed rather than newly discovered this cycle.
- **Curated-catalog AI sommelier subscriptions are a distinct, narrower business model worth tracking.** Grapevine/The Wine Engine's approach — a paid subscription AI sommelier operating over a small curated set (400 wines) rather than an open scan-anything model — is a meaningfully different strategy from every other app profiled in this report and may prove easier to monetize precisely because it controls its own inventory and data quality.
- **Self-reported app-store ratings and independently tracked ratings can diverge sharply.** CellarTracker's 4.9★ store claim vs. 3.8★ independent tracker figure this cycle is the starkest instance found in this report series and is a caution for how any app's — including Vinster's own, once it accumulates reviews — headline rating should be read.
- **Star ratings remain a weak, inconsistent signal across aggregators generally.** Unchanged — Vivino's Apple rating, Kitchen Stories' Play rating, and this cycle's Samsung Food review-count discrepancy all continue to show material cross-aggregator disagreement.

---

## Recommended Differentiators for Vinster

Each item below is explicitly marked **BUILT** (verified in the code on `main` this cycle) or **PROPOSED** (not found in code), with an honest defensibility read informed by this cycle's competitive research.

1. **Cellar-aware recipe generation — PROPOSED, still the one remaining clear opportunity.** Cellar-aware wine *pairing* is **BUILT** (`supabase/functions/food-wine-pairing`, `mode: 'cellar'`) and is not a unique claim — several competitors already ship versions of it. What remains genuinely unbuilt is wiring the recipe generator (`supabase/functions/generate-pairings`) to the same cellar/drinking-window data its pairing sibling already consumes. **Defensibility: moderate**, unchanged from last cycle, and now the single sharpest claim available given how commodified scanning and pairing alone have become.
2. **In-restaurant scan-to-pairing flow — BUILT.** **Defensibility: low** — this cycle's research found at least ten competitors doing some version of this; it should be described internally as table-stakes execution, not a pitch.
3. **Diamond-bin/spatial cellar modeling — BUILT.** **Defensibility: low-to-moderate** — InVintory's VinLocate (3D visualization) and CellarEye (physical sticker-tag location tracking) are both comparable alternative approaches to the same underlying problem, each with its own loyal framing; Vinster's version should be benchmarked directly against both rather than assumed superior.
4. **Price-integrity discipline (never showing an AI-invented price/score) — BUILT.** Confirmed in `parse-cellar-import/index.ts` and `wine-intelligence/index.ts` ("never invent, guess, or approximate a plausible-looking number"). **Defensibility: moderate-to-good** — a legitimate, quietly defensible trust claim, and one that should be made more visible to users directly in-product, given that this cycle found exactly two competitors (DiVino, Ask Sommelier AI) explicitly building user-facing trust/confidence signaling, and neither frames it around price/score integrity specifically.
5. **Wine-library browsing UI — PROPOSED (backend exists, no user-facing browse screen).** `wines_catalog` is still used only for predictive search typeahead per prior cycles' code checks (no code changed this cycle to revisit). **Defensibility: low technical lift, moderate value**, unchanged.
6. **Community/social layer — BUILT but disabled, not a current differentiator.** Unchanged. **Defensibility: none until launched**, and arguably low priority relative to item 7 below given current download volume.
7. **Monetization model — PROPOSED, entirely unbuilt.** Unchanged, now a four-cycle-old gap. **Defensibility: not applicable — this is existential, not competitive.** With the app live on both storefronts and essentially unmonetized and untested in the market, this should rank above any feature differentiator on priority.
8. **Automated test coverage — PROPOSED, entirely unbuilt.** Unchanged. Now a slightly higher-stakes gap given the app has a live public listing and no safety net for future changes.
9. **"AI sommelier that knows your cellar" as a headline pitch — not recommended as a standalone claim.** This cycle's research makes this conclusion firmer, not softer: at least five to six competitors now claim some version of this, several at vastly larger scale (CellarTracker: 200M+ tracked bottles). The narrower, more genuinely rare pitch remains: **"the only app that designs a recipe around the specific bottles already aging in your cellar"** — once item 1 above is actually wired up — paired with the price-integrity guarantee (item 4) as an explicit, user-visible trust differentiator.
10. **The real priority right now is distribution and monetization, not more features.** This is a process/strategy recommendation, not a feature one: with ~12 tracked Android downloads, no visible reviews, no monetization, and a published build already lagging `main`, Vinster's most urgent gap is not a missing capability — it is that almost no one has used the app yet. Any further feature investment (including item 1) should be weighed against the more basic question of whether the app is reaching users at all.

---

## Sources

**Vinster codebase (internal, `main` @ `81e8ef1`):** `app.json`; `src/constants/features.ts`; `supabase/functions/food-wine-pairing/index.ts`; `supabase/functions/generate-pairings/index.ts`; `supabase/functions/parse-cellar-import/index.ts` and `supabase/functions/wine-intelligence/index.ts`; `src/api/bins.ts`, `src/api/racks.ts`; `supabase/functions/ocr/index.ts`, `supabase/functions/scan-label`, `supabase/functions/recommend/index.ts`, `supabase/functions/wine-search/index.ts` (Wine-Searcher integration), `supabase/functions/cellar-recommend`; `app/restaurants/reviews.tsx`, `RestaurantReviewModal`; `src/api/chosenRecipes.ts`; `src/types/wine.ts` (racks/fridges/diamond bins/cases); repo-wide search for `revenuecat|stripe|react-native-iap|in-app-purchase` (no matches) and `*.test.*`/`*.spec.*`/`__tests__` (no matches); `git log 81e8ef1..HEAD -- . ':!reports'` (zero application-code commits).

**Vinster's own public presence:**
- https://apps.apple.com/app/id6763607127
- https://chrome-stats.com/d/com.vinster.app (version 1.3.0, last update 2026-07-27, ~12 downloads tracked)

**Wine apps:**
- https://apppricinglab.com/app/google_play/vivino.web.app
- https://appshunter.io/ios/app/vivino/id414461255
- https://marlvel.ai/apps/vivino-drink-the-right-wine
- https://www.meininger.de/wein/handel/vivino-feiert-jubilaeum
- https://kimola.com/reports/uncover-user-insights-on-the-vivino-app-essential-analysis-google-play-nl-149668
- https://www.toquemag.com/apps-gadgets/food-app-review-of-the-week-delectable-wine
- https://appgoblin.info/apps/512106648
- https://appdevelopermagazine.com/vinous-acquires-delectable-and-banquet-wine-apps/
- https://mwm.ai/e/apps/cellartracker-1-wine-tracker/6446102275
- https://apps.appfollow.io/ios/cellartracker/893759800?country=us
- https://cio.de/a/pocket-vino-we-review-5-apps-for-managing-your-wine-cellar,3104837
- https://alternativeto.net/software/cellartracker/about
- https://www.wealthmanagement.com/high-net-worth/which-wine-apps-actually-help-you-choose-and-buy-the-best-wine-
- https://www.toquemag.com/eating-and-cooking/food-app-review-of-the-week-hello-vino-%e2%80%93-wine-recommendations
- https://apps.shopify.com/pinpointed-ai-sommelier
- https://play.google.com/store/apps/details?id=ai.sommelier.app&hl=en_US
- https://www.vinetur.com/en/2026031797682/miller-family-wine-company-launches-ai-sommelier-to-transform-customer-wine-selection.html
- https://play.google.com/store/apps/details?id=br.ia.sommelier&hl=en
- https://invintory.com/blog/ai-wine-sommelier-vincent-update/
- https://play.google.com/store/apps/details?id=com.kawaii.winescanner&hl=en_US
- https://play.google.com/store/apps/details?id=ai.asksommelier.app
- https://www.vinetur.com/en/2025061988936/artificial-intelligence-sommelier-debuts-with-new-digital-wine-platform-in-the-united-states.html
- https://cbherald.com/new-ai-sommelier-app-for-shopify-levels-the-field-for-independent-wine-spirits-retailers/
- https://apps.apple.com/app/id6757319027 (Sommo)
- https://appshunter.io/ios/app/sommo-all-in-one-ai-wine-app/id6757319027/reviews
- https://peerpush.com/p/sommo-your-pocket-sommelier
- https://mwm.ai/apps/waine-smart-wine-guide/6742569391
- https://apps.appfollow.io/ios/wine-ai-scan-track/6740096328?country=de
- https://apps.apple.com/lc/app/winescore-ai-scan-menu-pair/id6751806003
- https://apps.apple.com/us/app/-/id6758434418 (VinoLens)
- https://winary.app/
- https://appdivino.com/
- https://play.google.com/store/apps/details?id=ai.winewise&hl=en_US
- https://techstartups.com/2026/02/12/sante-raises-7-6m-seed-to-build-the-first-ai-and-fintech-infrastructure-for-the-wine-and-liquor-industry/
- https://tracxn.com/d/trending-business-models/startups-in-wine-producers/__e_LUQ29kc9estXE9KRJUtgPI61FJyAmCnGZfWjSI0uA
- https://www.thedrinksbusiness.com/2026/03/future-chateau-raises-0-7m-to-expand-lower-alcohol-wine-range/
- https://panafricanvisions.com/2026/04/us10-million-tech-startup-vinobuzz-takes-the-traditional-wine-market-by-storm-as-hong-kongs-first-ai-agent-marketplace-for-wine/
- https://www.vcbacked.co/directory/funding/seed/industry/wine-and-spirits/page/4
- https://www.vinetur.com/en/20260515100761/eight-startups-join-wine-tech-challenge.html
- Prior-cycle sources for Wine Spectator, Wine Ring carried forward unchanged.

**Food/recipe apps:**
- https://www.plantoeat.com/?p=9210 (Samsung Food)
- https://tooldirectory.ai/tools/samsung-food
- https://macaron.im/playbook/yummly-app
- https://www.plantoeat.com/blog/2024/12/yummly-is-closing-discover-the-best-meal-planning-alternative
- https://unitq.com/unitq-scorecards/yummly
- https://www.appbrain.com/app/sidechef-recipes-meal-plans/com.sidechef.sidechef
- https://tooliverse.ai/tools/sidechef
- https://fritz.ai/best-ai-recipe-generators/
- https://foodsgpt.com/blog/best-ai-recipe-generators-2026
- https://ripeplate.com/blog/best-ai-recipe-generators-2026
- https://www.dishgen.com/
- https://www.foodieprep.ai/blog/meal-planning-apps-in-2026-which-tools-actually-simplify-your-kitchen
- Prior-cycle sources for Kitchen Stories, Mealime, PlateJoy, Plant Jammer, Clove carried forward unchanged.

**Combined space, dining, trends:**
- https://apps.apple.com/app/id6788275467 (Wine Pairing Cellar)
- https://apps.apple.com/us/app/-/id6760296783 (Pour Decisions)
- https://apps.apple.com/us/app/-/id6503256584 (Pocket Sommelier)
- https://apps.apple.com/app/id6480037842 (Vinomat)
- https://apps.appfollow.io/ios/cellareye-wine-tracker/1581071593?country=nz
- https://apps.appfollow.io/ios/invintory-wine-cellar-manager/1434754695?country=no
- https://blog.resy.com/newsroom/resy-launches-shareable-lists/
- https://blog.resy.com/category/wine/one-great-list/
- https://thebulkheadseat.com/resy-offers-more-than-25000-venues-with-the-addition-of-tocks-restaurants-and-wineries/
- https://press.opentable.com/news-releases/news-release-details/opentable-diners-reveal-top-50-wine-lists-us
- https://dev.family/blog/article/restaurant-app-design-functionality-trends-2026
- https://www.mordorintelligence.com/industry-reports/artificial-intelligence-in-food-and-beverages-market
- https://www.globenewswire.com/news-release/2026/07/07/3322990/0/en/ai-in-food-and-beverages-market-report-2026.html
- Prior-cycle sources for InVintory, MaiCellar, Saignée, Cellared, OpenTable, Yelp Menu Vision, DoorDash, Instacart carried forward unchanged.

*Note: several ratings/figures above show meaningful cross-aggregator disagreement and should be treated as directional, not exact. Vinster's own App Store and Google Play figures (download count, version number) were found via search-tool results and a third-party aggregator, not a direct storefront fetch (network egress to apps.apple.com was blocked in this environment this cycle); they should be re-verified directly against the live stores before being relied upon externally. The Mealime shutdown claim has now failed to be corroborated through its own claimed shutdown date (today, per this report's date) and should be treated as unconfirmed/likely retired going forward rather than carried as a live flag.*
