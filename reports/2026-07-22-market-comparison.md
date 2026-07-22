# Vinster — Market Comparison: Wine, Food & Combined Wine+Food Apps

**Date:** 2026-07-22
**Prepared by:** Automated Market Research Agent
**Branch analysed:** `main` @ `ed96d1978` (2026-07-22)

**A note on objectivity:** This report is written as competitive intelligence for internal
decision-making, not marketing copy. It does not inflate Vinster's strengths or soften
competitors' advantages. Where a competitor is materially better than Vinster — in scale,
data depth, ratings, funding, or polish — that is stated plainly. Every Vinster feature cited
as "built" was verified by reading the code on `main`; anything not found in the code is
marked **PROPOSED**, not built. Vinster itself has **no public App Store / Google Play
listing and no user reviews** — app.json shows version 1.2.0, bundle ID `com.vinster.app`,
and no in-app-purchase/RevenueCat/Stripe integration exists anywhere in the codebase. It is
judged here as a pre-launch product against live, revenue-generating, and in some cases
multi-million-user incumbents. That asymmetry is real and material to every conclusion below.

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

The wine-tech and AI-food-app markets are both mature enough to have clear incumbents, real
user backlash cycles, and a documented history of shutdowns — this is not a green field.
**Vivino** (~65M users, ~$224M raised) dominates wine by scale but is currently absorbing
serious user backlash over its 2026 "Vivino 7" redesign and an aggressive paywall/marketplace
push. **CellarTracker** is the credibility leader for serious collectors and, notably, is the
incumbent moving fastest into AI (its CellarChat feature beat most AI-native challengers to
market by nearly a year). **Delectable** and **Hello Vino** look stagnant. **Wine Ring**
could not sustain a standalone consumer business and pivoted to a B2B recommendation engine
(now Preferabli) — a directly relevant cautionary precedent. On the AI-sommelier front, 2024–
2026 produced a long tail of small, often single-developer apps (Sommo, VinoVoss,
CellarMate.ai, half a dozen apps literally named "Somm...") — fragmented, pre-consolidation,
none at meaningful scale.

On the food side, **Yummly was shut down entirely in December 2024** by Whirlpool — a stark
reminder that even a well-funded, acquired ($100M) recipe app can be discontinued outright.
**Samsung Food** leads on AI personalization but gates its best features behind Samsung
hardware. **SideChef** just raised a $6M Series B from LG and is pushing hard into
generative "photo → recipe" AI and B2B shoppable-recipe licensing. **Mealime** deliberately
avoids AI/feature creep and is stable and well-rated. None of the five mainstream recipe apps
researched has any wine or drink-pairing feature at all — that gap is real, but it is being
filled by others, not left open.

The "combined wine + food" space Vinster claims as its core positioning is **not a green
field either**. At least 8–10 small apps already do AI wine-and-recipe pairing in some form
(Vinomat/Gastrona, Combivino, Vinnie, Pocket Sommelier, Vinotag, Sommo, Oeni), and B2B pairing
infrastructure (PairAnything, Preferabli) is a moderately mature niche. What genuinely looks
open is scale and distribution: none of these combined apps has achieved Vivino-level reach,
and none of the major reservation platforms (OpenTable, Resy, Tock) — despite real AI
investment elsewhere — has built a wine-recommendation or sommelier feature. Vinster's actual
built feature set (verified in code) is unusually broad for a pre-launch app — wine-list
scanning, label scanning with real Wine-Searcher price/critic-score grounding, cellar/rack/
diamond-bin management with photo-based rack detection, bulk "Archive a Night" drink-logging,
AI chef-inspired recipe generation, food→wine pairing from a user's actual cellar, wine
personality profiling, multi-axis restaurant reviews, and a broad shareable-card social layer
— but breadth of features is not the same as market validation, and Vinster has none of the
distribution, brand trust, review corpus, or monetization proof that every competitor above
already has.

---

## Wine Apps

### Vivino
**What it does:** Label/wine-list scanning, crowd-sourced ratings (~65M users), personalized
"Match for You" scores, cellar tracking, integrated wine marketplace with aggregated
merchant shipping.
**Ratings:** iOS ~4.7–4.8★ (figures range from ~17K to ~104K reviews depending on region/
source); Google Play ~4.70★ (~230K ratings); Trustpilot (marketplace/service, distinct from
app rating) only ~3.9–4.1★ from ~9K reviews.
**Pricing:** Freemium + marketplace commission. Free core scan/rate/track with ads; Premium
~$4.99/mo (~$47.90/yr) for free shipping, gift bottles, early sale access, exact match
scores, ad-free.
**Praise:** Database scale, ease of scan-to-buy, breadth of merchant selection.
**Complaints (2025–2026):** The "Vivino 7" redesign is drawing significant backlash — buried
personal notes, broken vintage-history access, bugs/data loss/crashes reported as "way worse
than 6 months ago." Marketplace complaints: wrong wines shipped, split baskets/delivery
charges across merchants, slow support, ads interfering with the scan flow.
**Recent news:** No new funding since the $155M Series D (Feb 2021); ~298 employees as of
May 2026; no acquisitions found.

### Delectable
**What it does:** Curated scan-and-rate app leaning on verified sommelier/critic reviews
(now ~250,000 Vinous expert reviews integrated) rather than pure crowd-sourcing, plus social
feed and price-check.
**Ratings:** Could not be confirmed via search (App/Play listing pages blocked automated
fetch) — recommend a direct in-store pull before citing externally.
**Pricing:** Free core; Premium $5.99/mo (Vinous integration, priority transcription,
ad-free) or $1.99/mo ad-removal-only tier.
**Praise:** Curated-expert positioning vs. crowd noise; accurate label recognition; clean UI.
**Complaints:** Long-running WineBerserkers-forum sentiment that the app has become
increasingly irrelevant/stagnant since its 2016 Vinous acquisition — declining recognition
accuracy, dated database, "pay to play" paywall reducing engagement. Smaller database, no
structured learning content vs. competitors.
**Recent news:** Acquired by Vinous in December 2016 (mature, not a recent event) — still
live and updated but reads as a low-growth asset.

### CellarTracker
**What it does:** Cellar management + the category's largest crowd-sourced tasting-note
corpus (13M+ ratings, 5M+ unique wines, 193M+ bottles tracked, since 2003). Barcode/label
scan, receipt import, valuation via 15+ years of auction/market data plus Wine-Searcher price
integration across 37,000+ merchants.
**Ratings:** ~4.9★ cited across stores, but a comparatively modest iOS review count (~4,000+)
relative to Vivino — a smaller, more engaged/collector-skewed base.
**Pricing:** Free core (historically near pay-what-you-want); optional paid tier scaled to
cellar size (~$5–$45/yr) unlocking CellarChat AI and integrated pro critic scores.
**Praise:** Depth/credibility of the review corpus; trusted valuation data for serious
collectors.
**Complaints:** A recent interface change frustrated long-time power users (lost one-click
critic-score access); a long-standing "consumed bottles still show as active inventory" bug
reportedly unresolved for years.
**Recent news — important:** CellarTracker launched **CellarChat** in beta on **29 July
2025** — an AI chatbot grounded in the user's own cellar data that recommends pairings and
answers questions about their own collection. This is the single most direct precedent for
Vinster's approach (AI advice grounded in the user's actual inventory), and it shipped from
an entrenched incumbent with a 20+ year, 13M-review data moat roughly a year before this
report — i.e. the "AI + my own cellar" idea is not new or exclusive to Vinster.

### Hello Vino
**What it does:** Recommendation-quiz-driven wine assistant (taste/occasion/food pairing),
"human-powered" label scanner (not pure computer vision), geo-fenced retail/restaurant
recommendations (claimed 140,000+ locations, likely a legacy figure).
**Ratings:** Could not be confirmed via search.
**Pricing:** Free with ads; à la carte IAPs to remove ads (~$3) and unlock scanning (~$5) —
a dated monetization model vs. modern subscriptions.
**Complaints:** Full-page ads persisting after paying to remove them, high combined IAP cost,
scanner reliability issues. Multiple 2026 roundups mention users trying it but not sticking.
**Recent news:** Still maintained (recent update added seasonal wine/recipe pairings, Apple
Pay) but shows no funding/acquisition activity — reads as a legacy, low-growth product.

### Wine Ring → Preferabli (important cautionary case study)
Wine Ring (2012) was a consumer AI wine-recommendation app building a personal taste profile
from ratings. **It no longer exists as a standalone consumer app** — the company rebranded
to **Preferabli** in 2022 and pivoted entirely to a B2B2C white-label recommendation engine
("Sensorial AI") licensed into retailers and hospitality brands, not distributed directly to
consumers. Recent deployments: Albertsons' "Vine & Cellar Reserve" (Dec 2024), Marriott Napa
Valley AI concierge (2025), and a June 2026 partnership with UK's The Wine Society for a "My
Taste Match" tool. Reported cumulative funding ~$33M (exact recent-round figures are
inconsistent across trackers and should be independently verified). **Read for Vinster:** an
early, well-executed AI-personalization consumer wine app could not sustain a standalone
consumer business on its own and found its actual traction selling the tech B2B — a direct,
sobering precedent for any wine-AI product betting on a consumer-only model.

### "Somm" / AI-sommelier apps (fragmented, no dominant player)
A crowded, pre-consolidation long tail as of mid-2026, much of it too new for meaningful
review volume: **Sippd** (Wine.com-integrated Taste Match™ browser extension + app),
**Sommo** (label scan + journal + cellar + AI food pairing + a differentiated WSET
exam-prep module; free tier = 5 lifetime scans, then ~$5/mo or $29.99/yr), **VinoVoss**
("Smart Somm" conversational AI + multi-bottle scanning), **CellarMate.ai** (Feb 2025 launch,
GPT-4-based, 14 specialized cellar functions, shelf-photo bulk recognition), and half a dozen
literally-named "Somm..." apps (Somm, Somm AI: Wine Menu Scanner, Somm AI – Wine Expert,
SommLens, Somm Says). No single entrant has Vivino-scale traction; the category splits
between consumer-facing AI concierge/journal apps and B2B/white-label engines (Preferabli,
Sommify, Sommelier.bot, WINEST) that established players are also now entering.

### Wine Spectator (WineRatings+)
**What it does:** Searchable database of 320,000–400,000+ expert ratings/tasting notes by
winery, score, price, region, grape, type; 1,000+ new wines added monthly. A pure
content-subscription product — no marketplace, no scanning-to-buy.
**Pricing:** Free download, 30-day trial, then $2.99/mo IAP subscription.
**Ratings:** Aggregator sources cite ~4.8–4.9★ with a high concentration of 5-star reviews,
though this should be verified directly.
**Complaints:** Support-documented subscription/restore-purchase and Android auth errors.
**Relevance:** The only pure critic-subscription (no marketplace) model in this set — a
useful reference point since Vinster also has no marketplace/commerce layer.

### Newer AI-sommelier entrants (2024–2026)
**The Wine Engine ("Grapevine")** — launched 26 June 2026 (UK entrepreneur Matt Ovenden),
OpenAI-powered virtual sommelier layered on a wine-subscription commerce model (min. 3
bottles/month, up to 15% discount, ~400-wine catalog) — a full-stack commerce+AI play, not
just a recommendation app. **Vinolin** (Germany) — QR-code scanning at wineries/events for
real-time pairing suggestions, adopted by 15 wineries by early 2025, €200K pre-seed. Plus
Sommify, WINEST, Sommelier.bot, Aivin — mostly B2B/embedded plays. **Market read:** no new
entrant has demonstrated Vivino-scale consumer traction; most 2025–2026 launches are
pre-scale.

---

## Food / Recipe / Pairing Apps

### Samsung Food (formerly Whisk)
**What it does:** All-in-one recipe hub/meal planner/shopping list with deep Samsung
hardware integration. Vision AI photographs pantry/fridge contents to auto-identify ~40,000
ingredient types; AI-personalized weekly meal plans; a May 2026 update upgraded fridge Vision
AI using **Google Gemini** plus smarter Bixby voice control; "Smart Cook Mode" for
AI-guided cooking with direct smart-oven control (Samsung Food+ only); calorie/nutrition
tracking now free to all users.
**Wine/pairing:** None in the app itself. Samsung sells a separate $4,280 "Infinite AI Wine
Refrigerator" with camera-based bottle tracking, but it is not integrated with the food app's
recipe logic.
**Ratings:** Google Play ~4.2–4.6★ (~21.9K reviews, sources vary by snapshot date); iOS ~4.8★
(via secondary aggregator, not independently verified).
**Pricing:** Free tier (3-day plan) / Samsung Food+ $6.99/mo or $59.99/yr (7-day plan,
premium features), often bundled free with Samsung devices.
**Complaints:** Best features locked to Samsung hardware; edited instructions don't save;
serving-size changes don't propagate to shopping lists; Chrome extension reportedly broken
since the 2023 rebrand.

### Yummly — **discontinued December 20, 2024**
Whirlpool (which paid ~$100M for Yummly in 2017) laid off the entire team in April 2024 and
shut the app/site down by 20 December 2024, citing a pivot to internal GenAI initiatives
instead of continuing the standalone app. All user recipes/collections were lost; Whirlpool
offered $30–$87 partial reimbursements to Smart Thermometer owners. **This is the single most
important data point in this report on downside risk**: a recipe app with real scale, real
funding, and a corporate parent was still shut down outright within seven years of
acquisition. Its closure is now being actively marketed against by "Yummly alternative"
positioning from Samsung Food, Mealime, and various smaller entrants.

### SideChef
**What it does:** Step-by-step visual/video-guided cooking, strong B2B/white-label focus.
**RecipeGen AI** (announced Aug 2024, expanded June 2025) — photograph a dish, get a full
generated recipe. "My Pantry" tracking via manual entry, barcode, grocery-account sync, or
camera scan. 12,000+ one-click "shoppable recipes" pushing to grocery delivery/pickup via
retail partners; white-label platform licensed to retailers, CPG brands, publishers, and
appliance makers with in-recipe ad monetization.
**Wine/pairing:** None found — vision AI is scoped to dish/ingredient recognition and
shoppable-recipe generation, not beverage pairing.
**Ratings:** Google Play ~3.8★ (~8.2K reviews, 1M+ installs); another source cites 4.6★/8,127
reviews, platform unclear — treat the discrepancy as a snapshot-date/platform artifact.
**Pricing:** Free consumer app; revenue is B2B licensing + in-recipe advertising.
**Recent news:** Raised a **$6M Series B led by LG Electronics** (closed ~June 2025), total
funding $16M+ — the largest funding event found for any pure recipe app in this research, and
notably from a major appliance maker (an LG/Samsung-style hardware-tie-in pattern echoing
Samsung Food's strategy).

### Kitchen Stories
**What it does:** Video-tutorial-led digital cookbook (content/inspiration-first rather than
utilitarian planning). Kitchen Stories Plus: personalized "For You" feed, leftover-use
recipe suggestions, one-tap TikTok/Instagram recipe import, ~10,000+ recipe library (smaller
than several competitors).
**Wine/pairing:** None found.
**Ratings:** iOS ~4.8★ (unverified via direct fetch); Google Play ~4.07★ (~31K ratings, one
source) to ~58.6K combined reviews (another aggregation).
**Pricing:** Free base; Plus €7.99/mo or €79.99/yr, 7-day trial.
**Complaints:** Smaller library than competitors; many tutorial videos not in English; app
freezing; disappearing favorites.
**Recent news:** **Acquired by FUNKE Digital (German media group) in October 2025** — sources
were inconsistent on the acquirer (one older Crunchbase record ties to BSH Home Appliances),
so this should be verified directly against FUNKE press materials before being cited further.
Minimal prior funding (~$1.8M seed, last raised 2015) suggests this was a media-consolidation
exit rather than a growth-equity outcome. ~25M cumulative installs, ~2M active users.

### Mealime
**What it does:** Deliberately narrow, curated (human-edited, **not AI-generated**) weekly
meal planning — ~1,200 recipes with an unusually comprehensive allergy/diet filter system,
auto-generated aisle-organized grocery lists, family-size scaling (Pro).
**Wine/pairing:** None — no pantry scanning, no AI chat, no wine pairing; explicitly resists
feature creep.
**Ratings:** iOS ~4.8★ from 53,000+ reviews (~5M downloads); Android rating not confirmed.
**Pricing:** Free tier + Pro subscription; current pricing is inconsistently reported across
sources (~$5.99/mo cited as a 2026 price, up from $2.99/mo; another source cites $49.99/yr).
**Complaints:** Recipe pool feels repetitive under restrictive diets; slow content-update
cadence; unreliable recipe-import tool; a recent price increase drew negative reviews.
**Relevance:** No funding/acquisition news — a stable, mature, non-AI-hype product explicitly
positioned by some reviewers as the "sane alternative" to feature-bloated AI competitors.
Worth noting because it demonstrates a real market for restraint, not just AI breadth.

### Other notable AI recipe apps
**SuperCook** — ingredient-inventory-first matching ("I have X, Y, Z"), 2026 update added
AI fridge-photo scanning, free, ~4.65★ (~18K ratings), 3.8M downloads, actively updated.
**PlateJoy** — health/condition-focused personalization (diabetes, heart health, keto,
Mediterranean etc.), Instacart/Amazon Fresh integration; scored well on features but poorly
on community/social features in third-party reviews.

**Cross-cutting finding:** none of the five mainstream recipe/meal-planning apps researched
(Samsung Food, SideChef, Kitchen Stories, Mealime, SuperCook/PlateJoy) has any wine or
drink-pairing feature at all. Wine pairing is being built almost exclusively by standalone
"AI sommelier" apps (see Wine Apps and Combined sections), not by the food incumbents — a
real structural gap, but one several small combined apps are already racing to fill.

---

## Combined Wine + Food / Dining Space

This is the space Vinster claims as its core positioning. It is **populated but not yet
consolidated or scaled** — a long tail of small apps, not an open field, and not a space with
a well-funded winner either.

**Small combined wine+food apps already live:**
- **Vinomat** / **Gastrona** — appear to be the same or sibling product (identical App Store
  ID in search results): AI sommelier with pairing-compatibility scores (0–10), tailored
  recipes by diet, and a menu-photo scanner suggesting wines per dish at different price
  points; Gastrona also sells a B2B "digital menu wine pairing" product to restaurants. Too
  new for a meaningful rating.
- **Combivino** — launched ~2022, pairs ~900 wines and 76 beer styles with ~2,000 recipes
  plus a multi-course "tasting order" feature; little visible update activity since launch.
- **Vinnie** — dish/ingredient entry → AI wine matches that learn from user feedback.
- **Pocket Sommelier / Pocket Wine Pairing: Sommelier** — dedicated "Food" tab alongside
  pairing tools; photograph a meal or describe it for three AI pairings with a "pairability"
  percentage.
- **Vinotag** — primarily cellar management, with a "pick a bottle → get a recipe" pairing
  module.
- **Sommo** — the most fully-featured of this group: AI label scanning, cellar, journal,
  WSET exam prep, region map, and "describe what you're cooking → recommend a bottle from
  your own collection" AI food pairing. Free tier (5 lifetime scans) then $5/mo or
  $2.50/mo billed annually. Early reviews positive but very small review base.
- **Oeni** — cellar + aging tracking + food/wine pairing + personalized recommendations,
  per third-party roundups.
- **PairAnything** (Techstars-backed, Davis CA) — B2B only: a "Pairing Recommender" widget
  wineries/retailers embed in e-commerce sites (reports a 16.7% sales lift in one pilot). Not
  a consumer product.
- **InVintory** — cellar platform with an AI chat assistant ("Vincent") for pairing
  questions, 3D cellar visualization; raised a $2.3M seed to expand into enterprise/
  hospitality — funding is going toward inventory/enterprise tooling, not consumer pairing.
- **Vivino** added a personal **"AI Sommelier"** chat feature in 2025/2026 that can answer
  "what wine goes with tonight's dish" using scan/rating history, plus Apple Visual
  Intelligence integration — i.e. the market leader has bolted a pairing chat onto its
  existing wine-tracking core, though it has not built a recipe/cooking product.

**Objective read:** the *idea* of "wine + food pairing app" is not a gap — at least 8–10
apps already do it, several with AI chat, recipe databases, and menu scanning. What is
missing is scale: every entrant found is small, indie, bootstrapped, or pre-seed, with thin
App Store ratings and limited marketing footprint. None has achieved Vivino- or
CellarTracker-level distribution. The positioning is real but not close to defensible on
concept alone — it will have to be won on execution, distribution, and retention, not on
being first or unique.

**Restaurant-discovery/reservation platforms and wine:**
- **OpenTable** — no dedicated wine-list, sommelier, or pairing feature found. Its main AI
  investment is "Concierge," a general GenAI dining-discovery assistant (built on
  Perplexity/OpenAI, moved to the homepage mid-2026) — not wine-specific.
- **Resy** — maintains an active editorial "Wine on Resy" vertical (seasonal city wine-hit
  lists) and supports prepaid wine-pairing add-ons bundled with reservations/tasting menus —
  content curation and a booking/commerce feature, not a recommendation engine.
- **Tock** (acquired by Squarespace, $400M+) — supports bookable wine-pairing
  menus/events and a Wine Enthusiast partnership for discovering wine-forward restaurants; no
  AI sommelier or recommendation feature found.

None of the three major reservation platforms has built a wine-recommendation or
sommelier-AI feature as of mid-2026, despite real AI investment elsewhere. This is a
genuine, currently-unaddressed integration point — but it also may reflect a considered
choice (wine content is restaurant-owned, not a platform feature they see value in owning)
rather than an oversight a startup can easily exploit without their reach.

**Explicit pairing tools (chatbots/widgets, not full apps):** Sommelier.bot, WineSpeak.ai,
Conferbot's "Wine Pairing Advisor," and a long tail of hobbyist GPT-wrapper tools — skew B2B/
white-label; consumer-facing chatbot pairing tools found have limited traction. No evidence
of a Wine Folly or Decanter interactive AI pairing tool as of this research (Wine Folly's
pairing content remains a static paid PDF guide).

**Funding/shutdowns relevant to this space (2024–2026):** **Santé** raised a $7.6M seed
(Feb 2026, Bonfire Ventures/YC) for wine/liquor industry AI+fintech infrastructure — the
most notable wine-tech infrastructure raise found, though not consumer/pairing-focused.
**Vint** (fractional fine-wine investment) announced a wind-down in June 2026. **Underground
Cellar** went bankrupt in 2023 and was relaunched under new ownership in Nov 2024. **Winc**
(DTC wine subscription) filed Chapter 11 in 2022 — its failure still likely colors investor
caution around consumer DTC wine models. A 2022 retrospective piece ("Looking for Hope in the
Sea of Dying Wine iPhone Apps") documents a long-standing pattern of consumer wine apps
launching and quietly failing — directly relevant context for assessing survival odds of any
new entrant, Vinster included.

---

## Feature Comparison Matrix

Vinster is scored strictly on what is verified in the codebase on `main`, judged on the same
yardstick as every other row. "—" = not offered / not found in research. Ratings/pricing are
as reported by third-party sources in July 2026 and should be spot-checked before external
use; several could not be independently confirmed (marked "unconfirmed").

| App | Label/Menu Scan | Cellar/Inventory Mgmt | AI Wine Reco | Food→Wine Pairing | Recipe Generation | Community/Social | Marketplace/Buy | iOS Rating | Price |
|---|---|---|---|---|---|---|---|---|---|
| **Vivino** | Yes (camera) | Yes | Yes ("Match for You", AI Sommelier chat) | Yes (2025/26 chat feature) | — | Yes (large social feed) | Yes (major) | ~4.7–4.8★ | Free + Premium ~$4.99/mo |
| **Delectable** | Yes (camera) | Yes (journal) | Curated expert scores, not personalized AI | — | — | Yes (social feed) | Yes (shop) | Unconfirmed | Free + $1.99–5.99/mo |
| **CellarTracker** | Yes (barcode/label) | Yes (deep, since 2003) | Yes (CellarChat, Jul 2025) | Yes (CellarChat) | — | Yes (13M+ reviews) | No (price data only) | ~4.9★ (~4K ratings) | Free + ~$5–45/yr |
| **Hello Vino** | Yes (human-assisted) | — | Yes (quiz-based) | Yes | — | — | — | Unconfirmed | Free + à la carte IAP |
| **Wine Ring/Preferabli** | — | — | Yes (B2B engine) | — | — | — | — | N/A (B2B, no consumer app) | Licensed, not consumer-priced |
| **Sommo** | Yes | Yes | Yes | Yes (from own cellar) | — | Journal | — | New/thin | Free tier + ~$5/mo |
| **Wine Spectator (WineRatings+)** | — | — | Expert database only | — | — | — | — | ~4.8–4.9★ (unconfirmed) | Free + $2.99/mo |
| **Samsung Food** | — | — | — | — | Yes (AI, Gemini-powered) | Recipe sharing | Instacart (hardware-tied) | ~4.2–4.8★ | Free + $6.99/mo |
| **Yummly** | — | — | — | — | Was yes | Was yes | — | **Shut down Dec 2024** | N/A |
| **SideChef** | Barcode (pantry) | Pantry tracking | — | — | Yes (RecipeGen AI, photo→recipe) | — | Yes (shoppable, B2B) | ~3.8★ (~8K)/4.6★ mixed | Free (B2B monetized) |
| **Kitchen Stories** | — | — | — | — | — (curated) | Social import (TikTok/IG) | — | ~4.07–4.8★ | Free + €7.99/mo |
| **Mealime** | — | — | — | — | — (human-curated) | — | — | ~4.8★ (~53K) | Free + ~$5.99/mo |
| **Vinomat/Gastrona** | Yes (menu photo) | — | Yes | Yes (0–10 score) | Yes (by diet) | — | — | Too new to rate | Unconfirmed |
| **Combivino** | — | — | — | Yes (900 wines/76 beers × 2K recipes) | — | — | — | Unconfirmed | Unconfirmed |
| **Vinster** (this app, pre-launch) | **Yes** — wine-list OCR (app/scan) + single-label scan (app/label, supabase scan-label) | **Yes** — racks, diamond bins, cases, storage locations, bulk import, "Archive a Night" bulk-drink detection (app/cellar) | **Yes** — recommend function with hard rules (budget/colour/exclusions) + soft preferences (favourites), grounded critic score anchored to real Wine-Searcher data | **Yes** — food-wine-pairing function, pairs from user's own cellar or suggests a style to buy (app/chef/find-pairing.tsx) | **Yes** — generate-pairings function, dietary/allergen filters, rotating pool of ~35 real named chefs for inspiration | **Yes** — community feed across wine/restaurant/recipe reviews, auto-published from local reviews; extensive branded share-card system (10 card types) | **No** — no purchase/checkout flow; Wine-Searcher used only as a server-side pricing/score data source | **No public rating — pre-launch, zero App Store/Play Store presence** | **No monetisation implemented in code** — no IAP/RevenueCat/Stripe found anywhere in the repo |

**Reading the matrix honestly:** Vinster's checkbox count looks competitive or ahead on raw
feature breadth — it is one of very few products in this table with label scan + wine-list
scan + cellar/rack management + food→wine pairing + recipe generation + community all in one
app. But every other row has shipped, been rated by real users, and (except Yummly, which
still generated real revenue before shutting down) has a working monetization model. Vinster
has none of that validation yet. Feature breadth without usage data, retention numbers, or a
revenue model is a hypothesis, not a proven advantage — and the CellarTracker/Vivino
precedent shows the "AI grounded in your own cellar" idea specifically is already validated
and shipped by an incumbent with vastly more data.

---

## Market Gaps & Opportunities

1. **Reservation-platform wine gap.** OpenTable, Resy, and Tock have not built any wine
   recommendation or sommelier-AI feature despite real GenAI investment elsewhere on their
   platforms. A product that connects "what should I eat / where should I eat" with "what
   should I drink with it" at the point of dining is not being built by the platforms that
   actually own diner traffic — a genuine integration gap, though closing it likely requires
   a restaurant-side partnership Vinster does not currently have (no restaurant-facing
   product surface was found in the code).
2. **Recipe-app side is unexplored for wine.** None of Samsung Food, SideChef, Kitchen
   Stories, Mealime, or PlateJoy has any wine/drink pairing feature, despite AI personalization
   being the dominant investment theme in that category (one market estimate cites 47% of
   recipe-app funding activity going to AI personalization). This is real white space, but it
   is white space because building deep wine expertise is hard for a food-first company, not
   because no one has thought of it — Vinster's advantage here is genuine domain depth, not
   novelty.
3. **"AI grounded in your own cellar" is validated but not saturated.** CellarTracker's
   CellarChat (Jul 2025) and Sommo prove personalized pairing from a user's actual inventory
   is a real, wanted feature — but neither has consolidated the category. Vinster's
   food-wine-pairing function already does this (cellar-mode toggle in find-pairing.tsx).
   This is a real technical parity claim, not a novel idea.
4. **Combined-app category has no scaled winner.** Every wine+food combined app found is
   small/indie/pre-seed. If Vinster can out-execute on distribution, retention, and polish,
   there is room to become the first at-scale player in a validated-but-unconsolidated niche
   — but "no one has won yet" is different from "no one else is trying," and 8–10 competitors
   are already trying.
5. **Vivino's 2026 redesign backlash and Delectable's stagnation** are a live opening on
   trust/UX stability for any polished new entrant — but this is an opening in the pure-wine
   space, not evidence that the combined-app thesis specifically is well-timed.
6. **Non-scanning, non-AI-hype segment exists and is healthy (Mealime).** There is a real
   market for restraint and reliability, not just AI breadth — worth noting since Vinster's
   feature list is currently very broad; breadth carries its own execution and quality risk
   (see Risks below).

---

## Risks & Where Competitors Are Stronger

Stated plainly, without softening:

1. **Vinster has zero market validation.** No public listing, no ratings, no review corpus,
   no revenue. Every competitor profiled above — including the failing or shut-down ones —
   has more real-world usage data than Vinster does today. Any claim in this report about
   Vinster's competitiveness is a comparison of a hypothesis to shipped products.
2. **No monetization model exists in the code.** Every viable competitor in this report
   (except pre-scale newcomers) has a working subscription, marketplace-commission, or B2B
   licensing revenue model. Vinster has none implemented — no IAP, no RevenueCat, no Stripe,
   no paywall logic anywhere in the repository. This is a significant, concrete gap the code
   confirms, not a marketing-copy nitpick.
3. **CellarTracker has both data depth and an AI feature Vinster's own "pair from my cellar"
   idea directly resembles**, backed by 13M+ reviews and 20+ years of user trust — a moat
   Vinster cannot replicate quickly. If CellarTracker or Vivino (both far larger, both already
   AI-investing) decide to build out a recipe/food layer, they start from a vastly larger
   data and user base than Vinster ever will at launch.
4. **Vivino and Wine.com/Sippd have real marketplace and commerce integration**; Vinster's
   Wine-Searcher integration is read-only price/score grounding with no purchase flow. If
   monetization ultimately requires commerce (as it does for Vivino, Delectable, and The Wine
   Engine/Grapevine), Vinster would need to build an entire e-commerce/fulfillment capability
   from zero, an area none of the current code touches.
5. **Wine Ring's history is a direct warning.** A well-built, well-received consumer
   AI-personalization wine app could not sustain itself as a standalone consumer product and
   had to pivot to B2B licensing to survive. There is no evidence in this research that
   consumer wine-AI apps monetize well enough standalone at scale — Vivino's own Premium tier
   drives real complaints about paywalling formerly-free features, suggesting even the market
   leader struggles to charge consumers directly for wine AI.
6. **Yummly's outright shutdown despite a $100M acquisition** is the starkest data point in
   this entire report: recipe/food apps, even well-funded and well-used ones, get killed by
   corporate parents when strategic priorities shift. A combined wine+food app faces this risk
   on both the wine-app-failure axis (Palate Press's "sea of dying wine iPhone apps") and the
   food-app-failure axis simultaneously.
7. **Breadth-of-feature risk.** Vinster's codebase already spans wine-list scanning, label
   scanning, cellar/rack/bin management, bulk archive-night detection, recipe generation, food
   pairing, personality profiling, restaurant reviews, and a ten-card-type sharing system —
   before shipping publicly or proving any single feature retains users. Several focused
   competitors (Mealime, CellarTracker's original scope, Wine Spectator) succeed specifically
   by doing one thing well and are explicitly praised for resisting feature creep. A
   pre-launch app with this much surface area risks diluted polish versus a narrower, sharper
   wedge — this is a real, code-confirmed risk, not speculation.
8. **No community/data-network effects yet.** Vivino and CellarTracker's core moats are
   crowd-sourced data at massive scale (65M users / 13M reviews respectively). Vinster's
   community feed exists in code but starts from zero content — network-effect products are
   specifically hard to bootstrap against incumbents with a decade-plus head start.
9. **Regulatory/compliance parity, not advantage.** Vinster's age-gate (18+, DOB capture,
   App Store Guideline 1.4.3 compliant) is solid engineering but is table stakes every wine
   app in this report already satisfies — not a differentiator.

---

## Emerging Trends

- **AI label/menu scanning via computer vision is now table stakes** across wine apps
  (Vivino, Sommo, VinoLens, CellarMate.ai, and others all offer it); one industry estimate
  pegs the "wine scanning app" market at ~$500M in 2025, projected past $2B by 2033 (treat as
  a single unverified estimate, not consensus).
- **Personalized "taste profile"/AI sommelier assistants** are shifting the category from
  static ratings to individualized recommendation models learned from scan/rating history
  (Vivino's AI Sommelier chat, Preferabli's engine, Sommo's "AI palate analysis").
- **Platform-level camera AI is being leveraged rather than built from scratch** — Vivino
  integrated Apple's Visual Intelligence; Samsung Food's fridge AI now runs on Google Gemini.
- **AI cellar assistants with pairing chat layered on top of inventory management** (CellarChat,
  InVintory's "Vincent," Sommo, Vinotag) — cellar apps are the more common vehicle for adding
  pairing features, more so than purpose-built pairing apps.
- **Generative AI in restaurant/food-service operations more broadly** (OpenTable Concierge,
  industry 2026-trend pieces around dynamic menus and personalized recommendations) — largely
  restaurant-ops and food-delivery focused, not wine-specific, but signals where reservation
  platforms are investing their AI budget instead.
- **Recipe-app market growth with AI personalization as the dominant investment theme** —
  one estimate puts the recipe-app market at ~$794M (2025) growing to ~$2.27B by 2034 (12.4%
  CAGR), with AI personalization drawing a plurality of category funding activity.
- **Appliance-maker tie-ins are becoming a distribution strategy**, not just a nice-to-have —
  Samsung Food's Bespoke fridge integration and SideChef's LG-led Series B both show large
  appliance makers actively buying into the software layer of the kitchen.
- **No evidence of traction for voice-assistant wine products** (Alexa/Google Home wine
  skills) in this window — that sub-trend appears dormant.
- **Non-alcoholic/low-ABV growth** is a major 2026 wine-industry trend but orthogonal to app
  features researched here.
- **Consolidation and shutdowns continue to shape the category**: Yummly's Dec 2024 shutdown,
  Vint's June 2026 wind-down, Kitchen Stories' Oct 2025 acquisition by a media group, Wine
  Ring's 2022 pivot to B2B — the pattern across both wine and food apps is that even funded,
  branded products frequently fail to sustain a standalone consumer business, and either shut
  down or get folded into a larger parent's strategy.

---

## Recommended Differentiators for Vinster

Each item below is marked **BUILT** (verified in the `main` codebase) or **PROPOSED** (not
found in the code — an idea only), with an honest note on how defensible it actually is given
the research above.

1. **BUILT — Pairing grounded in the user's real cellar inventory, not a generic
   recommendation.** `supabase/functions/food-wine-pairing` + `app/chef/find-pairing.tsx`
   let a user pair a described dish against wines they actually own. **Defensibility: low.**
   CellarTracker's CellarChat shipped the same core idea in July 2025 with a 20+ year, 13M+
   review data moat behind it, and Sommo does something very similar. This is table-stakes
   parity with the current state of the art, not a novel differentiator — market it as
   quality-of-execution, not as unique.
2. **BUILT — Wine-Searcher-grounded critic scores instead of pure LLM hallucination.**
   `wine-intelligence` + `wine-searcher-proxy` anchor the "Vinster score" to a real
   aggregated market score when a match exists, and are explicit in the prompt about not
   inventing facts. **Defensibility: moderate.** This is a genuinely careful design choice
   (most "AI sommelier" apps in this research did not describe this level of grounding), but
   it depends entirely on a third-party data licence Vinster does not own, and CellarTracker
   already licenses Wine-Searcher data itself at far greater scale.
3. **BUILT — Combined cellar/rack/bin photo-detection UX** (`detect-rack`,
   `detect-lineup`, diamond-bin/case/rack data model). Auto-configuring a storage grid from a
   photo and bulk-identifying a lineup of empty bottles for "Archive a Night" is a genuinely
   distinctive, well-thought-out UX pattern not seen described in this research for any
   competitor. **Defensibility: moderate-to-high** — it's a real, specific piece of craft, but
   it is also a narrow feature that a determined incumbent (CellarTracker, InVintory) could
   copy relatively easily once seen.
4. **BUILT — Chef-inspired recipe generation with a curated, rotating pool of ~35 named
   real chefs**, explicitly designed to avoid repetitive defaults (`generate-pairings`).
   **Defensibility: low-moderate.** Pleasant editorial flourish, easily copied, and none of
   the mainstream recipe apps (Samsung Food, SideChef) currently compete on this axis, so it's
   differentiated from food apps — but it doesn't out-compete SideChef's shoppable-recipe
   B2B distribution or Samsung's hardware-tied AI investment on the recipe side itself.
5. **BUILT — Broad, near-universal shareable-card system** (ten distinct branded share-card
   components across wine, label, lineup, personality, recipe, restaurant review, wine
   review, wine intel, wine knowledge, wine list). **Defensibility: moderate.** No competitor
   in this research was described as having this breadth of native, branded social sharing.
   Genuinely could drive organic growth pre-launch — but virality mechanics only work once
   there's an actual user base to share from; it is a distribution tool, not a retention one.
6. **BUILT — Multi-axis restaurant reviews (food/service/wine list/overall), not just wine
   ratings.** No competitor profiled in either the wine or the combined-app section was found
   to review restaurants on this many axes. **Defensibility: moderate.** Closest analogue is
   Resy/OpenTable's general dining content, which doesn't rate wine lists specifically — a
   real gap Vinster fills, though restaurant review volume is a cold-start problem like any
   community feature.
7. **PROPOSED — Restaurant-platform integration (OpenTable/Resy/Tock-style booking + wine
   recommendation at point of reservation).** Not present anywhere in the code (no
   booking/reservation feature was found). This maps directly to the one gap this research
   identified where incumbents are demonstrably not investing (Section: Combined Wine + Food
   space). **Defensibility if built: potentially high**, precisely because no one else is
   doing it — but it would require partnerships/data access Vinster does not currently have,
   and is a materially larger undertaking than anything currently in the codebase.
8. **PROPOSED — A monetization model of any kind.** No subscription, marketplace, or
   commerce layer exists in code. Every sustainably-operating competitor in this report has
   one. This is not really a "differentiator" so much as a precondition for Vinster to exist
   as a business at all post-launch, and should be treated with more urgency than any feature
   idea above.
9. **PROPOSED — Recipe-side wine pairing distributed through a major recipe platform**
   (i.e., partnering with or being acquired into a Samsung Food/SideChef-scale product rather
   than competing head-on as an independent app). Not evidenced anywhere in the code or
   business docs reviewed, included here only because Wine Ring's history (pivoting to B2B
   after failing to sustain a standalone consumer business) suggests this is a realistic
   fallback path worth having a view on now rather than after a similar struggle.

**Bottom line for a neutral outside analyst:** Vinster's shipped feature set is real,
unusually broad for pre-launch, and technically careful (particularly the Wine-Searcher
score-grounding and the cellar-photo-detection UX). But almost every individual capability
has a shipped, funded, or scaled analogue already in market, several from incumbents with
data moats Vinster cannot match at launch. The strongest genuine gap this research surfaced —
reservation-platform integration — is not yet built. The most urgent problem this research
surfaced — no monetization model exists in the code at all, in a category with a well-
documented history of shutdowns even among funded, scaled players (Yummly, Winc, Wine Ring's
original consumer product) — is not a feature question and should be treated as the top
priority alongside or ahead of further feature development.

---

## Sources

**Wine apps**
- Vivino: https://www.vivino.com/en/app , https://apps.apple.com/us/app/vivino-drink-the-right-wine/id414461255 , https://play.google.com/store/apps/details?id=vivino.web.app , https://www.trustpilot.com/review/vivino.com , https://www.prnewswire.com/news-releases/vivino-worlds-1-wine-app-announces-complete-redesign-with-vivino-7-235079161.html , https://www.vivino.com/en/articles/premium-pricing-guide-en , https://www.complaintsboard.com/vivino-b149632 , https://www.appbrain.com/app/vivino-drink-the-right-wine/vivino.web.app , https://allreviews.ca/food-drinks/vivino-reviews , https://tracxn.com/d/companies/vivino/__MdOMXhQ1M_f2gvBi77N1VWsjZPNNvDkok67EfIIFPkE/funding-and-investors , https://www.streetinsider.com/PRNewswire/Vivino,+the+Worlds+Largest+Wine+App+and+Marketplace,+Raises+$155+Million+in+Series+D+Funding/17909561.html
- Delectable: https://apps.apple.com/us/app/delectable-scan-rate-wine/id512106648 , https://play.google.com/store/apps/details?id=com.delectable.mobile , https://www.jancisrobinson.com/articles/best-wine-labelscanning-apps , https://sommo.app/blog/best-wine-apps-2026-ranked/ , https://thefoodpeople.co.uk/blog/antonio-gallonis-delectable-wine-app-launches-new-premium-version , https://www.wineberserkers.com/t/how-irrelevant-has-the-delectable-wine-app-become/165052 , https://www.prnewswire.com/news-releases/vinous-acquires-delectable--banquet-apps-300375364.html
- CellarTracker: https://apps.apple.com/us/app/cellartracker-1-wine-tracker/id6446102275 , https://invintory.com/blog/best-wine-apps-top-tools-for-collectors-compared/ , https://enolisa.com/blog/best-wine-apps-2026/ , https://mwm.ai/apps/cellartracker-1-wine-tracker/6446102275 , https://support.cellartracker.com/article/80-cellartracker-subscription , https://invintory.com/blog/invintory-vs-cellartracker-which-app-fits-serious-collectors/ , https://support.cellartracker.com/article/108-cellarchat , https://mobileapp.cellartracker.com/post/chat-with-my-cellar , https://www.starkinsider.com/2025/07/ai-wine-pairing-cellartracker.html
- Hello Vino: http://www.hellovino.com/wine-mobile , https://www.prnewswire.com/news-releases/hello-vino-launches-wine-app-for-android-adds-140k-retail-and-restaurant-locations-264572251.html , https://apps.apple.com/us/app/hello-vino-wine-assistant/id318447346 , https://appstor.io/app/hello-vino-wine-shopping-guide-ratings-and-scanner , https://www.hellovino.com/update
- Wine Ring / Preferabli: https://www.entrepreneur.com/science-technology/wine-ring-app-lets-your-taste-shape-your-ordering/252290 , https://www.globenewswire.com/news-release/2022/03/03/2396532/0/en/Preferabli-Expands-Personalization-and-Recommendation-Platform-To-Encompass-Wine-Beer-Spirits.html , https://www.winebusiness.com/news/vendor/article/256470 , https://www.digitalcommerce360.com/2024/12/16/albertsons-ai-preferabli-wine-selection/ , https://wineindustryadvisor.com/2026/06/04/the-wine-society-announces-partnership-with-preferabli/ , https://www.prnewswire.com/news-releases/the-wine-society-announces-partnership-with-preferabli-302791698.html , https://www.crunchbase.com/organization/wine-ring
- Somm/AI-sommelier apps: https://sippd.com/app , https://blog.sippd.com/wine-recommendations-for-your-tastes-with-sippd/ , https://sommo.app/pricing/ , https://sommo.app/alternatives/ , https://appadvice.com/app/vinovoss/6505077910 , https://resident.com/tech-and-gear/2024/12/29/wine-of-the-times-ai-now-predicts-your-perfect-pour , https://www.winebusiness.com/news/vendor/article/307402 , https://www.cellarmate.ai/ , https://apps.apple.com/us/app/somm/id1540854487 , https://apps.apple.com/us/app/somm-ai-wine-menu-scanner/id6744361256
- Wine Spectator: https://apps.apple.com/us/app/vintagechart-by-wine-spectator/id381341648 , https://www.winespectator.com/articles/wine-spectator-releases-revamped-wineratings-app-52449 , https://adapty.io/paywall-library/wineratings/ , https://help.winespectator.com/support/solutions/articles/28453-how-do-i-see-wine-reviews-and-ratings-with-this-app-
- Newer entrants: https://drinksretailingnews.co.uk/the-wine-engine-launches-ai-sommelier/ , https://techinformed.com/the-wine-engine-qa-matt-ovenden/ , https://thewineengine.com/ , https://www.vinetur.com/en/2025061988936/artificial-intelligence-sommelier-debuts-with-new-digital-wine-platform-in-the-united-states.html , https://pitchbook.com/profiles/company/537348-97 , https://finder.startupnationcentral.org/company_page/winest , https://sommelier.bot/how-it-works/

**Food/recipe apps**
- Samsung Food: https://mealthinker.com/blog/samsung-food-alternative , https://news.samsung.com/uk/samsung-announces-global-launch-of-samsung-food-an-ai-powered-personalised-food-and-recipe-service , https://news.samsung.com/us/samsung-expands-ai-capabilities-bespoke-ai-family-hub-refrigerators-major-update , https://support.samsungfood.com/hc/en-us/articles/32709269852052 , https://www.sammobile.com/news/samsung-food-update-massive-gift-free-users/ , https://www.trustedreviews.com/news/samsungs-latest-kitchen-gadget-uses-ai-to-identify-log-and-track-wine , https://the-gadgeteer.com/2026/03/31/a-4280-wine-fridge-that-knows-every-bottle-inside/ , https://www.plantoeat.com/blog/2026/01/samsung-food-review-pros-and-cons/ , https://samsungfood.com/food-plus/
- Yummly: https://www.plantoeat.com/blog/2024/12/yummly-is-closing-discover-the-best-meal-planning-alternative/ , https://mealthinker.com/blog/yummly-alternative , https://techissuestoday.com/the-end-of-an-era-as-yummly-smart-thermometer-cooks-its-final-meal/
- SideChef: https://www.businesswire.com/news/home/20240806193505/en/SideChef-Announces-RecipeGen-AI , https://www.sidechef.com/business/recipe-ai/ai-in-home-cooking , https://www.sidechef.com/business/press-releases/sidechef-secures-6-million-in-series-b-funding-to-invest-in-the-future-of-shoppable-recipes , https://theaitoolsbox.com/tool/sidechef-review/ , https://apps.appfollow.io/android/sidechef-recipes-meal-plans/com.sidechef.sidechef
- Kitchen Stories: https://www.kitchenstories.com/en/stories/the-for-you-feed-in-kitchen-stories-plus , https://fueled.com/blog/recipe-app/ , https://appgrooves.com/app/kitchen-stories-recipes-baking-healthy-cooking-by-ajns-new-media-gmbh/negative , https://www.appbrain.com/app/kitchen-stories-recipes/com.ajnsnewmedia.kitchenstories , https://www.kitchenstories.com/en/stories/faq-all-your-kitchen-stories-plus-questions-answered , https://tracxn.com/d/companies/kitchen-stories/__rv6csX6P37BO8eg3LdV10VshbCX4osUq1KtwKGg1f34
- Mealime: https://thesunrisedigest.com/eat/mealime-review-2026/ , https://mealthinker.com/blog/mealthinker-vs-mealime , https://mealthinker.com/blog/mealime-alternative , https://ultimatemealplans.com/reviews/mealime
- Others: https://www.pann-app.com/blog/supercook-review , https://www.appbrain.com/app/supercook-recipe-generator/com.supercook.app , https://www.garagegymreviews.com/platejoy-review , https://www.consumersadvocate.org/diet-plans/c/plate-joy-diet-plans-review

**Combined space, restaurant platforms, trends, funding**
- Combined apps: https://apps.apple.com/us/app/vinomat-pair-wine-recipes/id6480037842 , https://vinomat.app/ , https://gastrona.app/ , https://gastrona.app/business/digital-menu-wine-pairing , https://wineindustryadvisor.com/2022/04/13/new-app-combivino-pairs-wine-with-recipes/ , https://combivino.com/ , https://play.google.com/store/apps/details?id=com.esteco.diwiner.app , https://www.pocketsommelier.app/ , https://vinotag-app.com/index.php/en/home/ , https://sommo.app/ , https://www.pairanything.com/ , https://wineindustryadvisor.com/2022/07/28/pairanything-elevates-where-food-meets-wine-with-foodom/ , https://invintory.com/blog/best-wine-apps-top-tools-for-collectors-compared/ , https://www.prnewswire.com/news-releases/wine-app-invintory-secures-2-3m-usd-in-seed-round-funding-to-expand-into-enterprise-302301801.html , https://invintory.com/blog/wine-and-food-pairings-what-an-ai-cellar-assistant-can-suggest/
- Reservation platforms: https://www.techtimes.com/articles/320769/20260716/best-hotel-restaurants-2026-opentable-list-goes-live-ai-concierge-moves-homepage.htm , https://www.opentable.com/blog/newsroom/ , https://blog.resy.com/wine/ , https://blog.resy.com/2026/03/nyc-wine-hit-list/ , https://resy.com/join/experiences/ , https://en.wikipedia.org/wiki/Tock_(company) , https://www.restaurant-hospitality.com/restaurant-operations/squarespace-acquires-nick-kokonas-reservations-platform-tock-for-more-than-400-million
- Funding/shutdowns: https://techstartups.com/2026/02/12/sante-raises-7-6m-seed-to-build-the-first-ai-and-fintech-infrastructure-for-the-wine-and-liquor-industry/ , https://angelinvestorsnetwork.com/alternative-investments/vint-wine-platform-winddown-2026 , https://www.prnewswire.com/news-releases/wine-e-commerce-pioneer-wine-country-connect-acquires-and-relaunches-underground-cellar-302313484.html , https://www.modernretail.co/operations/winc-files-for-bankruptcy-following-declining-sales/ , https://www.palatepress.com/looking-for-hope-in-the-sea-of-dying-wine-iphone-apps/
- Trends: https://sommo.app/blog/best-wine-scanner-apps-2026/ , https://nexgits.com/ai-powered-wine-app/ , https://tastewise.io/ai-forecast-food-service-trends-2026 , https://www.getcraver.com/blog/restaurant-ai-trends/ , https://greyb.com/resources/reports/wine-innovation-trends-2026/ , https://www.dimins.com/blog/2026/01/13/2026-wine-spirits-industry-trends/ , https://market.us/report/recipe-app-market/

**Vinster (this app) — code sources verified directly on `main`**
- app.json (version, bundle ID, no store listing config)
- package.json (no IAP/payment dependencies)
- supabase/functions/{ocr,scan-label,wine-intelligence,wine-searcher-proxy,wine-knowledge,recommend,food-wine-pairing,generate-pairings,personality,detect-lineup,detect-rack,import-cellar}/index.ts
- src/types/wine.ts (full data model: CellarWine, StorageLocation, StorageCase, WineRack, BinCell, RackSlot, CommunityPost, ChosenWine, etc.)
- src/services/{pricing,communityPublish,archiveNight}.ts
- app/{cellar,chef,scan,label,community,restaurants,wines,recipes,profile}/** (route-level feature inventory)
- src/components/MicButton.tsx (on-device dictation, not a voice assistant)
