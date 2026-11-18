# Vinster — Market Comparison: Wine, Food & Combined Wine+Food Apps

**Date:** 2026-11-18
**Prepared by:** Automated Market Research Agent
**Branch analysed:** `main` @ `58a3d9a` (app.json version `1.7.30`)
**Prior report:** `reports/2026-11-11-market-comparison.md`

**A note on objectivity:** This is internal competitive intelligence, not marketing copy. Vinster's strengths are not inflated and competitors' advantages are not softened. Where a competitor is materially better than Vinster — in scale, data depth, funding, ratings, community, or polish — that is stated directly. Where Vinster is a late, small, or undifferentiated entrant, or where it has its own unresolved weaknesses, that is stated directly too. Every Vinster feature cited below as "built" is grounded in the actual code on `main` (file paths and commit hashes cited throughout, re-verified this cycle); anything not found in the code is marked **PROPOSED**, not built.

**What changed in the code since 2026-11-11 — the headline finding of this cycle:** The seven-consecutive-week streak of zero application-code commits, tracked and restated in every report from 2026-09-30 through 2026-11-11, **ended the day after last week's report was filed**. Starting 2026-11-12 and running through today, 2026-11-18, the repository received **50 commits** — easily the most active single week this report series has observed. The app version moved from `1.6.0` to `1.7.30` (commit messages reference `1.7.31` as the next build). This is a large, substantive week of work, not a cosmetic bump, and it changes the "Vinster isn't shipping" narrative this series has carried for two months. In descending order of scope:
- **A full "owner-led" review of the entire Cellar section, in nine numbered parts (§1–§9)**, across two commits (`74484af`, `58a3d9a`) touching 208 files and roughly 16,300 line-changes combined: Quick Command AI actions scoped to a shortlist rather than the whole cellar; bottle-size-as-identity fixes; a rewritten Your Cellar List (hooks + components, bulk select, accurate location counts); a wine-card crash fix; a unified `archiveBottles` path replacing several ad-hoc archive flows; racks, bins and alt-cellar screens split into components with safer move/placement RPCs (migration `138`); a guarded bulk-value-refresh service that never overwrites a user's own price; a virtualised/memoised stats page; hardened cellar import/export (rate-limited, size-capped, chunked, CellarTracker/Vivino profile support); and five new migrations (`135`–`139`), bringing the total to **139**.
- **A dead-code sweep (`2516c93`)**: 173 files changed, **497 insertions / 6,499 deletions** — unused imports/variables/functions/types, ~920 unused style entries, 30 unused files, dead UI paths (unreachable share-card renders, a lineup photo viewer that never opened, an old tag system superseded by Folders). The commit message explicitly states community-sharing groundwork (`useCommunity`, `communityPublish`) was **left in place on purpose** as "a planned phase" — i.e., the team is still building toward the disabled community feature, not abandoning it.
- **The Wish List feature was fully retired** (`38e5c4f`, `a1898ff`): every `is_wishlist` flag, UI entry point, and sync branch removed across 33 files; a migration resolves old wish-list data into normal reviews or deletes empty placeholders. This is a feature that existed and was then removed — a reduction in scope, not an addition — and the kind of concrete evidence (a shipped feature killed outright) this series has not had to report on Vinster's own product before.
- **New and reworked AI-facing features**, all confirmed in the actual edge functions on `main`: a natural-language/voice **cellar command** function (`supabase/functions/cellar-command`, scoped to a ≤300-wine shortlist, not the full cellar); a **cellar-aware recommend** function (`cellar-recommend`); a **Compare Wines / Compare Vintages** side-by-side AI comparison tool (`supabase/functions/compare-wines`, new this cycle — critic score, drinking window, value, an "Inside Line" on nuance between 2–4 user-picked wines); and a **Find Online** feature (`supabase/functions/find-wine-list`, 636 lines) that searches for a restaurant's own wine-list page/PDF, de-duplicates by address, and prefers the newest dated edition.
- **Label-scan and wine-list-scan reliability work across multiple batches** (`60e9888`, `a584eb6`, `8bafd76`, `722a596`, `4d6f79e`, `7b518e0`, and others): cost controls on Wine-Searcher lookups, fixes so picks are never discarded for missing appellation/grape/critic-score data, and a rewritten error/retry flow. The recommendation engine's hard-rule/soft-rank architecture (absolute budget/colour/region exclusions; soft style/food/country preferences that only affect ranking) — described in every prior cycle's matrix — is unchanged in substance, just hardened.
- **Wine-database provenance**: each stored critic score now records how it was arrived at (this vintage's actual critic score, an average across vintages, or Vinster's own estimate) — a transparency feature with a direct external parallel found this cycle (see VinSavant, Combined Wine + Food section below).

**What did not change — the standing gaps hold, now into an eighth cycle:**
- `generate-pairings` (Vinster's recipe-generation function) was re-checked and still contains **zero references to the user's cellar inventory** — recipes are generated for a scanned/selected wine, not from what a user actually owns. This remains the single most-repeated finding of this entire report series and is still not built.
- `COMMUNITY_ENABLED` is still `false` (`src/constants/features.ts:6`) — now explicitly confirmed (via the dead-code-sweep commit message) to be a deliberate "planned phase" rather than an abandoned idea, but still off today.
- No RevenueCat/Stripe/`react-native-iap`/in-app-purchase code exists anywhere in the repository (re-checked this cycle). **Vinster still has no monetization model of any kind**, even after a week that added substantial new paid-feature-shaped functionality (Compare Wines, Find Online, voice cellar commands) that competitors gate behind subscriptions (see CellarTracker below).
- No test files (`*.test.*`, `*.spec.*`, `__tests__`) exist anywhere in the repository (re-checked this cycle). This is now a sharper risk than in prior "nothing changed" cycles: a week that shipped a 6,500-line deletion sweep and a from-scratch rewrite of nine cellar sub-sections, entirely without an automated test suite to catch regressions, is exactly the kind of week a test suite exists to protect — and Vinster has none.

**What changed in the market this cycle:** Four findings matter more than routine churn. First, **CellarTracker's long-open paywall question is resolved**: its own support documentation confirms CellarChat (the AI pairing/value-flagging feature) requires a paid subscription, priced from $40/year or $4.99/month and scaled to cellar size, with only a 14-day free trial on iOS — meaning Vinster's closest combined-space competitor has a live, monetized version of the AI-chat-plus-cellar pattern Vinster has not monetized at all. Second, **InVintory (Vincent) now ships an MCP server** (`api.invintory.com/mcp`, paid plans, OAuth) that connects a user's wine collection directly to Claude, ChatGPT, or Gemini for cellar search, insights, and pairing suggestions without opening the InVintory app at all — a materially sharper version of this series' standing "free general-purpose AI is a structural substitute" risk, because a direct competitor is now routing *through* general AI rather than racing against it. Third, a new combined-space entrant, **"Wine Matcher: Scan & Pairing,"** does the same wine-to-recipe direction as Vinster's own `generate-pairings` (scan a label, get a full course menu built around that bottle) plus occasion-based wine+menu pairing with no bottle on hand — another independent confirmation that generative wine-to-food content is not a novel idea, while cellar-aware generation (from what a user actually owns) remains untouched. Fourth, on the food side, **Ollie** — a privacy-focused AI assistant that included AI meal-planning — shut down on 2026-11-06, weeks after closing a $7.5M Khosla Ventures seed round, with its founder citing an inability to differentiate; this is now the second concrete AI-food-app shutdown this series has tracked (after Yummly) despite real institutional funding, and a direct cautionary data point for any AI-food feature, Vinster's included.

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

After seven straight weekly reports documenting zero shipped code, this cycle has the opposite problem to report: a 50-commit week spanning a genuine, substantive rewrite of the entire Cellar section, a 6,500-line dead-code removal, full retirement of a built-and-abandoned Wish List feature, three new AI-facing tools (voice cellar commands, wine comparison, online wine-list discovery), and a transparency feature (score provenance) that a competitor independently shipped the same week. This is real engineering velocity, and it should be read as such — not undersold the way flat stagnation should not have been oversold in the other direction across the prior seven cycles. But velocity on the product does not change the two structural facts this series keeps finding: Vinster still has no monetization model of any kind, even as the feature surface it would need to monetize keeps growing (Compare Wines, Find Online, and voice cellar commands are all exactly the kind of feature CellarTracker, Sommo, and InVintory charge for), and the single most defensible differentiation candidate this series has ever identified — generative recipes tied to a user's actual cellar inventory, not just a scanned bottle — is still not built, for the eighth cycle running, while a new competitor (Wine Matcher) just shipped the cellar-unaware version of the same idea. The market itself tightened in ways unfavorable to Vinster regardless of its own code: CellarTracker's AI chat is now confirmed to be a paid product competing directly against Vinster's free equivalent, and InVintory's new MCP integration gives users of a rival cellar app a way to point general-purpose AI directly at their own wine data — a more dangerous articulation of the "ChatGPT is a free substitute" risk than anything found in prior cycles. Vinster's own App Store presence was, for the first time in this series, described by a search snippet in terms unambiguous enough to treat as resolved rather than merely "not found": the listing "hasn't received enough ratings or reviews to display an overview" — i.e., negligible public traction, confirmed more directly than any prior cycle managed. A genuinely productive week of building does not, on its own, close that gap.

---

## Wine Apps

### Vivino
**What it does:** The category's largest crowdsourced wine database and social ratings feed, camera label scanning, a personalized "Match for You" score, an integrated wine marketplace, cellar tracking, and — under Premium — "Vivino Sommelier," an AI chat feature, plus a wine-list scanner.
**What's new this cycle:** No November 2026 update confirmed. One App Store reviewer complaint surfaced this cycle: a recent redesign reportedly moved or removed features the reviewer had relied on — a minor but concrete data point that Vivino's own UI churn is not friction-free for existing users, unlike the clean "still the scale leader" framing of prior cycles.
**Ratings:** Carried forward unchanged — figures remain disputed across sources (≈4.5–4.7★ Play, 194–230K reviews; ≈4.8★ Apple, 127K–548K ratings depending on source).
**Pricing:** Unchanged — free with IAP; Premium unlocks unlimited Sommelier chat and the list scanner.
**Assessment:** Unchanged — still the unambiguous scale and data leader.

### Delectable
**What it does:** Camera-first label recognition built around a social feed of verified sommeliers, winemakers, and critics rather than crowd averages; a personal wine journal; integrated Vinous critic reviews under Premium.
**What's new this cycle:** No independent 2026 corroboration of a sale or strategic pivot to "Banquet" was found beyond the same Jancis Robinson piece this series has cited for several cycles — a deeper check this cycle could only confirm the 2016 Vinous acquisition of both Delectable and Banquet, not a distinct, dated 2026 sale event. This softens, slightly, last cycle's confident "reported sale" framing: treat it as the best-sourced version available, not as independently reconfirmed this cycle.
**Ratings:** Unchanged — ≈4.7★ App Store (~25.7K reviews); ≈4.2★ on one Android listing.
**Pricing:** Unchanged — free with IAP; Delectable Premium at $5.99, a separate Ad-Free tier at $1.99.
**Assessment:** Unchanged from last cycle — a legacy property on borrowed maintenance (5+ years without a confirmed substantive update), not an actively competing product.

### CellarTracker
**What it does:** The dominant cellar-inventory and tasting-note platform for serious collectors — bottle tracking, valuation, drinking-window guidance, bin/rack assignment by manual bin number (no visual diagram), a huge tasting-note corpus, and, since October 15, 2026, a restaurant wine-list-scanning feature with AI food-pairing chat ("CellarChat").
**What's new this cycle — the paywall question is resolved:** CellarTracker's own support article confirms **CellarChat requires a paid subscription** on the current mobile app; non-subscribers get only a 14-day free trial on iOS, while basic features like tasting-note summarization stay free. A secondary source cites subscription pricing starting at **$40/year or $4.99/month**, scaled to cellar size. A separate source dates CellarChat's original beta launch to **July 2025** — earlier than this series had previously placed it, meaning the feature has had over a year of live iteration before this October's restaurant-wine-list-scan expansion, not a few months.
**Scale:** Unchanged — marketing cites 4.4–5M+ unique wines and ~12M tasting notes.
**Ratings:** Unchanged — self-reported 4.9★ vs. independent trackers showing materially lower figures (3.8★ US iOS; 4.3★ one German listing).
**Pricing:** Now confirmed more precisely — free cellar tracking with bottle-count-tiered IAP ($7.99–$69.99) plus a separate CellarChat subscription ($40/yr or $4.99/mo, scaled to cellar size).
**Assessment — sharpened this cycle:** CellarTracker is not just a direct, better-resourced competitor on Vinster's flagship wine-list-scan-plus-food-pairing combination — it is now confirmed to be a **monetized** one, charging specifically for the AI-chat layer Vinster offers for free with no revenue model behind it at all.

### Hello Vino
No new information found this cycle. Carried forward unchanged: ≈4.6★ (~6.5K ratings) on a listing last substantively updated in 2017; a dated review reports the app non-functional beyond localization on iOS 26.

### Wine Ring
No new information found this cycle. Carried forward unchanged: no evidence of continued activity; a historical cautionary tale.

### Wine Spectator (WineRatings+)
No new information found this cycle. Carried forward unchanged: a stable editorial-authority reference tool, not a direct AI-feature competitor.

### Sommo
**What it does:** An all-in-one pocket sommelier — label/list/shelf scanning with value-pick scoring, virtual cellar with named racks, AI pairing from the user's own cellar, a "Taste DNA" tasting journal, and a WSET exam-prep module.
**What's new this cycle:** No update found beyond what prior cycles already tracked (the "2.0" five-tab redesign, family sharing up to five members, and v1.7.7's rack-slot-highlighting feature).
**Assessment:** Unchanged — still the closest single pure-wine-app match to Vinster's scope, and still the app with a shipped precedent for rack-slot-highlighting UX that overlaps Vinster's own diamond-bin visualization.

### The wider "AI sommelier / wine-scanner" wave — further expanded this cycle
Beyond the roughly dozen-plus names already tracked across prior cycles (Nobli, Eno, Vinea, WineValueAI, VinoLens, SommelierX, Wine-Oh!, VinoMatch, SommSnap, Wine Pairing – AI Sommelier, AI Wine Scanner, and others), this cycle's search surfaced a further batch of small entrants: **SOMM DIGI AI**, **Vino - Wine Scanner**, **Vino AI: Wine Scanner**, **Wineries.AI**, and **InvOak**. None showed meaningful independent review traction this cycle. A related but distinct signal: a Punch Drink piece (Nov 5, 2026) explicitly advises readers to **skip AI for Thanksgiving wine picks** and use a human-expert advice service instead ("Somm Intelligence") — not a new app competitor, but the first concrete editorial pushback against AI-sommelier tools this series has found, timed to the holiday wine-shopping moment that would otherwise favor scan-and-recommend apps like Vinster's.
**Assessment:** Unchanged and further reinforced — a reproducible, commoditized pattern at the solo-developer level, now with at least one piece of mainstream wine-media commentary actively steering readers away from AI wine advice toward human experts.

### Funding signals this cycle
No wine-tech funding event was confirmed as dated specifically within the Nov 11–18, 2026 window. Two previously-untracked items surfaced with unclear or likely-earlier dates: **Bright Cellars** (a Milwaukee wine-subscription startup) raised an **$11.2M Series B** led by Cleveland Avenue; **Vinequery** is listed with a **$30M "A round"** on a startup-tracking site, undated. Both are consistent with this series' standing finding — wine-tech money continues to flow to subscription/commerce platforms, not consumer AI-sommelier recommendation apps.

---

## Food / Recipe / Pairing Apps

### Samsung Food (formerly Whisk)
**What it does:** Samsung's flagship AI food platform — recipe import, AI weekly meal plans, shoppable grocery lists, SmartThings integration, AI photo-based ingredient scanning.
**What's new this cycle:** No direct Samsung Food update confirmed. Adjacently, **Samsung Health** (a separate app) is reported testing a Galaxy AI "Meal Scan" feature (photo → food identification + calorie estimate) as of mid-November 2026 — not an update to Samsung Food itself, but a sign of continued Samsung-ecosystem investment in AI food-photo recognition that could feed into Samsung Food later.
**Ratings/Pricing:** Unchanged — Apple ≈4.6–4.8★, Google Play ≈4.6★ (~22.3K reviews); freemium, Food+ at $6.99/month or $59.99/year.
**Assessment:** Unchanged — the best-resourced, most hardware-integrated food app in this report, still with no wine-pairing feature of its own.

### The New York Times Cooking
**What's new:** No resolution to the late-October AI recipe-modification backlash found this cycle. The opt-out question remains explicitly unresolved (one source claims a hide/opt-out setting exists; a critical commentary piece says there is no way to fully revert to pre-AI behavior; no primary NYT statement settles it). One secondary aggregator cites a 77% reader-pushback figure — unconfirmed and from a source of uncertain reliability, so treat with real skepticism rather than as a settled statistic.
**Assessment:** Unchanged — not a wine or combined-space competitor, but still the most directly relevant cross-category risk precedent for Vinster's own generative-recipe feature: a trusted, well-resourced incumbent shipped a technically functional AI feature to real, still-unresolved user pushback.

### Yummly — discontinued December 20, 2024
Carried forward unchanged. Still a cautionary precedent for a large, well-funded AI-personalized recipe app folding entirely despite real scale — now joined by a second, more recent example (Ollie — see Emerging Trends).

### SideChef
**What's new this cycle:** SideChef's own press materials date "RecipeGen AI" (its photo-to-recipe tool) to a beta launch in **August 2024** — earlier than this series had previously implied — and its business-facing page markets the tool to publishers, not directly to consumers, with no consumer pricing stated. This refines, rather than contradicts, prior cycles' "15K+ recipes, Premium at $4.99/mo" profile.
**Assessment:** Largely unchanged; RecipeGen AI is a more mature, longer-running feature than this series had previously characterized it as.

### Kitchen Stories
No new information found this cycle. Carried forward unchanged: large editorial recipe library, largely non-AI by design, Android/iOS rating-perception gap.

### Mealime — retired as a live flag
Per the 2026-10-28 cycle's explicit instruction, this unconfirmed shutdown claim remains closed and is not re-raised.

### The AI recipe-generator landscape
Carried forward: a crowded, vendor-self-promoted field (ChefGPT, HAiCook, MealWise, Bean, Recipe AI, Recipe Genius, AI Chef, and the further small entrants named in prior cycles) continues to grow. This cycle surfaced several funded newcomers not previously tracked by name in this series — **Clove** ($4.15M seed, Blackbird Ventures, Canva-alumni founders, freemium, not yet launched), **Flavrs** ($7M seed, a16z, a shoppable AI food-video app), **Linecook** ($2.3M pre-seed, social cooking app), and **Recime** ($15M seed, Even Capital) — none confirmed dated to this specific week, but all evidence that venture capital continues to fund AI-food-generation startups at seed stage despite Yummly's and (this cycle) Ollie's shutdowns. No food/recipe app researched across any cycle of this report, including this one, has a native wine-pairing feature; that remains a clean, verifiable white space relative to mainstream recipe apps specifically, though several combined-app competitors in the next section do pair wine with food.

---

## Combined Wine + Food / Dining Space

This remains the segment most directly relevant to Vinster's stated positioning.

**Direct combined competitors — status this cycle:** InVintory ("Vincent"), Winary, DiVino, Vinomat, Pocket Sommelier, Pour Decisions, OENARI, Cru, and Vinocell show no update since Nov 11 beyond what prior cycles' detailed profiles already cover (see the 2026-10-21 through 2026-11-11 reports for full individual writeups). Sommo and CellarTracker's updates are covered above.

**Newly surfaced or sharpened this cycle:**
- **InVintory ships an MCP server** (`api.invintory.com/mcp`, paid plans, OAuth setup) that connects a user's wine collection directly to Claude, ChatGPT, or Gemini for "smarter cellar search, insights, and pairing suggestions" without opening the InVintory app at all. This is a materially sharper version of the standing "free general AI is a structural substitute" risk this series has tracked since early cycles — a direct combined-space competitor is now explicitly routing *through* general-purpose AI as a feature, rather than treating it as something to compete against.
- **VinSavant** (new to this series) replaced its own generated wine scores, as of 2026-11-03, with attributed ratings sourced from Michelin Guide, Wine Spectator, James Suckling, Robert Parker, La Revue du vin de France, and Vivino — explicitly showing "no verified rating" rather than fabricating one when it lacks sourced data. This is a direct external parallel to Vinster's own score-provenance commit this same week (each stored critic score now records whether it's this vintage's real critic score, an average across vintages, or Vinster's own estimate) — independent confirmation that score-transparency is becoming a feature competitors are converging on at roughly the same time, not a Vinster-specific insight.
- **New entrant: "Wine Matcher: Scan & Pairing"** (iPhone-only, free + IAP) does the wine-to-food direction of Vinster's own `generate-pairings`: scan a wine label and get a full course menu with recipes built around that bottle, plus a six-dimension tasting profile (body/acidity/tannin/sweetness/style/color), or browse occasion-based wine+menu pairings with no bottle on hand. Nothing found suggests it is cellar-aware either — it is further, independent confirmation that generating food content from a single wine is not a novel idea, while generating it from a user's actual cellar inventory remains untouched by any competitor found across this entire report series.
- **OpenTable's beverage-tagging AI** (beta, Pro plan) — no follow-up found this cycle; status unchanged (back-of-house, staff-facing only).
- **Resy / Toast "Digital Chits" — confirmed shipped, not merely reported.** Resy's own blog confirms this staff-facing integration is live, surfacing guestbook information — explicitly including recalling "a regular's favorite wine" — directly on Toast POS/handheld devices. This upgrades last cycle's "reported, not yet confirmed shipped" framing to confirmed-shipped; it remains staff-facing, not diner-facing, so it still does not compete with Vinster's use case directly. Note: this cycle's research could not independently corroborate the name "Dining Companion" for any Amex/Resy product beyond last cycle's single source — treat that specific label with caution going forward.
- **CellarTracker** changelog surfaced a title, "New: Effortless Wine Tracking and a Beautiful, New Wine Details Experience" — content and date unconfirmed beyond the title itself this cycle; flagged for direct follow-up next cycle rather than asserted as fact now.

**Vinster's own market presence — closer to resolved this cycle than any prior cycle.** Search again could not retrieve the listing via direct fetch (`apps.apple.com` remains unreachable — DNS/`ENOTFOUND` — from this environment, as in every prior cycle), but a search-indexed snippet this cycle states, more directly than any previous cycle's finding, that the listing **"hasn't received enough ratings or reviews to display an overview."** That is a materially stronger and more specific signal than prior cycles' "rating not found" — it should be read as reasonably strong evidence of negligible App Store review volume, not merely an unresolved search limitation, while still stopping short of a verified numeric rating/count.

**Objective verdict — is "wine + food + cellar in one app" a white space or crowded?** Unchanged in direction from last cycle's "crowded" assessment, and if anything further narrowed this cycle: CellarTracker's AI-chat layer is now confirmed monetized (a materially stronger competitive position than "live beta" alone), a second independent wine-to-recipe app (Wine Matcher) was found doing the cellar-unaware version of Vinster's own `generate-pairings`, and InVintory's MCP integration adds a new and sharper variant of the "general AI substitutes for a dedicated app" risk. The one sliver this series has consistently found still genuinely open — **generative recipe creation tied to a persistent, personal cellar inventory, not a single scanned bottle** — remains untouched by every competitor found this cycle too, and remains the one feature Vinster's own code still does not implement, for the eighth cycle running.

---

## Feature Comparison Matrix

| App | Category | Label/List Scan (camera) | AI Recommendations/Chat | Cellar / Rack-Location Mgmt | Food Pairing | Recipe Generation | Community/Social | Rating (approx.) | Price |
|---|---|---|---|---|---|---|---|---|---|
| **Vinster** | Combined | **BUILT** — Claude vision OCR for wine lists (`supabase/functions/ocr`) and labels (`supabase/functions/scan-label`); multi-bottle "lineup" scanning (`supabase/functions/detect-lineup`); plus a new **Find Online** feature that locates a restaurant's own wine-list page/PDF (`supabase/functions/find-wine-list`) | **BUILT** — Claude recommendation engine with hard budget/colour/region rules + soft-ranking rubric (`supabase/functions/recommend`), per-wine "Wine Knowledge" AI pages (`wine-knowledge`), a new natural-language **voice cellar-command** tool scoped to a ≤300-wine shortlist (`cellar-command`), cellar-aware recommend (`cellar-recommend`), and a new **Compare Wines/Vintages** side-by-side AI tool (`compare-wines`) | **BUILT, deep, and this cycle substantially reworked** — racks, fridges, true diamond-grid bins with per-cell capacity, OWC/mixed storage cases, spreadsheet + Vivino/CellarTracker-profile import, a 9-section owner-led rewrite this cycle (components split, safer placement RPCs, guarded bulk value-refresh, virtualised stats), 139 SQL migrations (`src/types/wine.ts`, `src/api/bins.ts`) | **BUILT, cellar-aware** — dish → best bottle from actual cellar or a style to buy, weighted by dietary prefs/budget (`supabase/functions/food-wine-pairing`) | **BUILT, but still not cellar-aware** — generates 3 chef-attributed recipes for a scanned wine, saved to a "Cookbook" with PDF/share-card export (`supabase/functions/generate-pairings`, re-confirmed this cycle to have zero references to cellar data) | **BUILT but disabled** — `COMMUNITY_ENABLED = false`; groundwork explicitly preserved this cycle as "a planned phase" (`src/constants/features.ts:6`) | Search-indexed App Store snippet this cycle states the listing "hasn't received enough ratings or reviews to display an overview" — the most direct confirmation of negligible traction this series has found | Free (App Store listing); **no pricing/IAP code exists anywhere in the repo**, even after a week adding several subscription-shaped features |
| Vivino | Wine | Yes (label; list under Premium) | Yes ("Vivino Sommelier" chat) | Yes | Yes (reported generic) | No | Yes (largest crowd DB) | ≈4.5–4.7★ Play (194–230K reviews, disputed) / ≈4.8★ Apple (127K–548K ratings, disputed) | Free + Premium (price disputed) |
| Delectable | Wine | Yes (label) | No | No | Yes (weak, per reviewers) | No | Yes (pro/critic network) | ≈4.7★ iOS (~25.7K) / ≈4.2★ Android | Free + $5.99/mo Premium, $1.99/mo ad-free |
| **CellarTracker** | Wine (cellar) → Combined | **Yes, BETA** — restaurant wine-list photo scan | **Yes, paid** — "CellarChat" AI, **confirmed this cycle to require a subscription** ($40/yr or $4.99/mo, scaled to cellar size; 14-day iOS trial) | Yes, manual bin numbers (no visual diagram) | **Yes, paid** — via CellarChat | No | Yes (12M tasting notes) | Self-reported 4.9★; independent trackers 3.8–4.3★ | Free cellar tracking + bottle-tiered IAP ($7.99–$69.99) + **paid CellarChat subscription** |
| Hello Vino | Wine | No | Weak (quiz-based) | Basic (manual log) | No | No | No | ≈4.6★ (~6.5K), reported non-functional on iOS 26 | Free + ads |
| Sommo | Combined | Yes (label/list/shelf) | Yes (value scoring, cellar-aware pairing) | Yes (named virtual racks, rack-slot highlighting) | Yes (cellar-aware) | No | Journal only | No reliable rating found | Free + Premium, family-sharing up to 5 |
| InVintory (Vincent) | Combined | No (manual entry + 3D map) | Yes ("Vincent" assistant; **new this cycle: an MCP server piping cellar data into Claude/ChatGPT/Gemini**) | Yes, 3D VinLocate map | Yes (Premium) | No | No | 4.5–4.8★ (28–4,200+ reviews, disputed) | Premium $12.99/mo, $149.99/yr |
| Vinomat | Combined | Yes (menu + wine list) | Yes (0–10 pairing score) | No | Yes (score-based) | Yes (recipe for a chosen bottle) | No | Insufficient ratings | Not confirmed |
| Wine Matcher (new) | Combined | Yes (label scan) | Yes (tasting profile, occasion pairing) | No | Yes (course-menu generation from a bottle) | Yes (full course menu + recipes from a scanned bottle; not cellar-aware) | No | Too new / insufficient ratings | Free + IAP |
| Eno | Combined | No (photo of dish, not label/list) | Yes (pairing from photo/text) | No | Yes (core feature) | No | No | Insufficient/zero ratings | Free + "grapes" credit IAP |
| Nobli | Wine (cellar) | Yes (label) | Yes (virtual sommelier chat) | Yes (iCloud sync, custom lists/tags) | Yes ("meal matches tailored to your bottle") | No | No | ≈4.67★ (36–46 ratings, disputed) | Free + Lifetime $9.99 / Annual $29.99 / Monthly $7.99 |
| OENARI | Wine (cellar) | No | No | Yes, incl. shipped diamond-rack module | No | No | No | Not found | Free tier + Premium Annual $39.99 / Monthly $4.99 |
| Samsung Food | Food | Yes (ingredient photo) | Yes (AI meal plans) | No | No | Yes (import/generate) | Yes (large) | ≈4.6–4.8★ (varies) | Freemium, Food+ $6.99/mo or $59.99/yr |
| NYT Cooking | Food | No | Yes (AI recipe substitutions, Oct 2026, subscriber backlash, still unresolved) | No | No | No (modifies, doesn't generate new recipes) | No (editorial) | Not researched (bundled subscription) | Part of NYT "All Access" bundle |
| SideChef | Food | Yes (RecipeGen AI, photo-to-recipe, since Aug 2024 beta) | Limited | No | No | Yes | Yes (community recipes) | ≈4.3–4.7★ (spread) | Free + Premium $4.99/mo, $49.99/yr |
| Kitchen Stories | Food | No | No | No | No | No (editorial only) | Limited | ≈3.4–3.99★ Play / ≈4.8★ Apple | Free + Plus $6.99/mo, $79.99/yr |

---

## Market Gaps & Opportunities

1. **Cellar-aware generative recipe creation** (recipes generated *from* a user's actual cellar inventory, not just a recipe tied to one scanned bottle) remains the one concrete gap this series has found that no competitor — Vinster included — has fully closed, now across eight consecutive cycles. This cycle adds a direct confirmation of the pattern's commercial viability from the *unaware* side: Wine Matcher independently shipped wine-to-recipe generation without cellar awareness, reinforcing that the market recognizes the wine→food direction is valuable while the cellar-aware version remains open to whoever builds it first.
2. **Wine-list-scan-plus-food-pairing-in-one-app** is a claim Vinster can no longer make uncontested against major incumbents — and this cycle sharpens that further: CellarTracker's version is not just live, it is now confirmed **paid**, meaning Vinster is giving away for free something a better-resourced, larger-scale competitor successfully monetizes.
3. **Visual, precise cellar storage modeling** (diamond-grid bins, per-cell capacity) remains a genuine, now-further-polished strength (this cycle's 9-section cellar rewrite deepens it materially) but is still not novel at the feature-description level against Sommo, OENARI, Cru, Vinocell, and Nobli.
4. **Score/rating provenance and transparency** is a newly-converged-upon feature this cycle: Vinster's own commit (labeling each score as real critic data, a cross-vintage average, or an estimate) landed the same week VinSavant shipped an almost identical idea (attributed ratings, explicit "no verified rating" states). This suggests transparency-about-AI-generated-or-estimated data is becoming an emerging table-stakes expectation across the category, not a Vinster-specific insight — worth tracking as a trend rather than claiming as a unique differentiator.
5. **A standing caution, reinforced rather than newly discovered this cycle:** both the NYT Cooking backlash (food) and Ollie's shutdown despite real funding (AI assistant with meal-planning) are reminders that shipping AI-generated/modified content, and building a business around an AI-food feature generally, both carry real, demonstrated risk independent of execution quality — directly relevant to any future work on Vinster's own recipe-generation feature or its business model.

---

## Risks & Where Competitors Are Stronger

Stated plainly, as this series requires:

- **CellarTracker's AI-chat layer is now a confirmed, paid product** directly competing with Vinster's free equivalent combination of wine-list scan plus AI food-pairing — a monetized incumbent beating an unmonetized challenger on the same feature set, not merely a larger one.
- **InVintory now routes general-purpose AI directly into its own product via an MCP server**, a sharper and more concrete version of the "ChatGPT is a free substitute" risk this series has tracked since early cycles — it is no longer a hypothetical users might improvise themselves; a rival has built the on-ramp for them.
- **Vivino and CellarTracker both have data moats Vinster cannot replicate quickly** — scale gaps in the hundreds of thousands to millions of ratings/reviews versus Vinster's own apparently negligible review count, now stated more directly this cycle via the "not enough ratings to display an overview" App Store snippet.
- **The small-AI-sommelier wave keeps adding entrants** (five more named this cycle alone: SOMM DIGI AI, Vino - Wine Scanner, Vino AI: Wine Scanner, Wineries.AI, InvOak) with little independent review traction — a reminder that the barrier to entry for the pattern much of Vinster's scanning/recommendation feature set is built on remains very low.
- **Wine Matcher independently shipped a close analogue of `generate-pairings`** (scan a bottle, get a menu/recipes built around it) — Vinster's recipe-generation feature is not a novel idea even in its currently-built, cellar-unaware form.
- **Vinster has no monetization model, and this cycle made that gap more conspicuous, not less** — a week that added Compare Wines, Find Online, and voice cellar commands (all feature types competitors charge for) landed with zero accompanying payment infrastructure. A well-built, actively-improving product with no revenue and apparently negligible App Store reviews is not well positioned against incumbents that are both larger and, in CellarTracker's case, now confirmed to be charging successfully for comparable functionality.
- **No test suite exists in the codebase, and this cycle is the sharpest illustration yet of why that matters**: a week that deleted ~6,500 lines of code and rewrote nine sections of the Cellar feature from the inside out, entirely without automated regression tests, is precisely the kind of change a test suite exists to de-risk. The absence was a low-visibility risk during seven weeks of no commits; it is now a live, undefended risk during the highest-velocity week this series has observed.
- **Vinster's own recipe generation is still not cellar-aware** — the single most-repeated finding in this entire report series — and a second independent competitor (Wine Matcher, after Vinomat) has now shipped the cellar-unaware version of the same idea, narrowing the time window in which "cellar-aware recipes" would still be a first-mover claim rather than a catch-up move.
- **An editorial voice in mainstream wine media is now actively steering readers away from AI wine advice** (Punch Drink's Thanksgiving piece recommending human experts over AI) — a small but real signal that at least part of the wine-enthusiast audience Vinster is built for is primed to distrust, not default to, AI-generated wine recommendations.

---

## Emerging Trends

- **AI-chat-as-feature is now visibly a monetized layer, not just table stakes.** CellarTracker's confirmed CellarChat paywall is the clearest evidence this series has found that the AI-chat pattern (Vivino Sommelier, CellarChat, Vincent, Sommo, Vinster's own recommend/wine-knowledge tools) has matured from "nice to have" to "a line item someone will pay for" — a business-model signal Vinster's own free-everywhere approach does not yet capture.
- **A rival is now routing general-purpose AI directly into its own product as a first-party feature (InVintory's MCP server)**, rather than treating ChatGPT/Claude/Gemini purely as an external substitute threat — a notable evolution of the "free general AI" risk category this series has tracked since early cycles, and a pattern Vinster itself (whose own backend already uses Claude) could in principle mirror or must at least account for competitively.
- **Score/data provenance and transparency is converging as a feature across independent teams simultaneously** — Vinster's own critic-score-provenance commit and VinSavant's attributed-ratings relaunch landed in the same week without any evident coordination, suggesting this is an emerging category norm, not a differentiator either company can claim as unique.
- **AI content modification and AI-food businesses both continue to carry real, demonstrated risk** — the NYT Cooking backlash (unresolved) and Ollie's shutdown this cycle (despite a real $7.5M raise) are now two separate, concrete cautionary precedents in as many months, reinforcing that neither "ship the AI feature" nor "raise money for an AI-food product" is self-evidently safe.
- **Continued, accelerating commoditization of camera-scan-to-recommendation** at the solo-developer level — five further small AI-wine-scanner entrants surfaced this cycle alone, on top of the roughly dozen already tracked.
- **Wine-tech venture interest keeps skewing toward subscription/commerce platforms over consumer AI-sommelier apps** — this cycle's Bright Cellars and Vinequery findings (both commerce/subscription plays, both with uncertain exact dates) are consistent with, not a departure from, the pattern tracked since early in this series.
- **At least one strand of mainstream wine media is now actively pushing back against AI-generated wine advice**, favoring human-expert alternatives — a new and directly relevant countertrend to the AI-sommelier wave this series has otherwise tracked as one-directional growth.

---

## Recommended Differentiators for Vinster

Grounded in the actual code on `main`, with honest defensibility assessments given this cycle's findings:

1. **Cellar-aware recipe generation** — **PROPOSED** (not built; `generate-pairings` re-confirmed this cycle to generate recipes for a scanned wine, not from the user's own cellar inventory, with zero references to cellar data in the function). Still the single most defensible opportunity identified across this entire series, but the window is narrowing: this cycle's Wine Matcher finding is the second independent competitor (after Vinomat) to ship the cellar-*unaware* version of this idea, meaning the cellar-aware version is increasingly a catch-up move against an emerging pattern rather than a wholly novel one. Recommended priority: highest, and increasingly time-sensitive. If pursued, this cycle's Ollie/NYT Cooking findings argue for shipping with explicit, visible user control over AI-generated content, not simply as a feature to promote on its capability alone.
2. **Ship any monetization model at all** — **PROPOSED** (no IAP/payment code exists, re-confirmed this cycle). This cycle sharpens the case: Vinster just shipped several feature types (Compare Wines, Find Online, voice cellar commands) that a direct competitor (CellarTracker) successfully charges for in a materially similar form. Not a feature differentiator, but an increasingly urgent precondition for the business — Vinster is now building subscription-shaped features for free while the clock on this series' repeated "no revenue" finding keeps running.
3. **The newly-reworked, deep cellar-visualization and management system** — **BUILT and materially strengthened this cycle** (9-section rewrite, `src/api/bins.ts`, 139 migrations). Defensibility: moderate, essentially unchanged from last cycle's assessment — a better-executed version of a pattern Sommo, OENARI, Cru, Vinocell, and Nobli all already offer in some form, so the improvement raises quality without raising uniqueness.
4. **Compare Wines / Vintages and voice cellar commands** — **newly BUILT this cycle** (`compare-wines`, `cellar-command`). These are genuinely new, well-scoped features (shortlist-capped prompts, explicit rate limits) not previously tracked as differentiators in this series. Defensibility: unproven — no competitor profile researched across this entire series offers a direct equivalent to either, which is a point in Vinster's favor, but neither has had time to be tested against user demand or competitive response yet.
5. **Score/critic-rating provenance labeling** — **newly BUILT this cycle**, but defensibility is **low**, not moderate: a competitor (VinSavant) shipped a close analogue the same week, independently. This is evidence the idea is sound, not evidence it is a Vinster-specific moat.
6. **Chef-attributed recipe cards with PDF/share export** — **BUILT** (`supabase/functions/generate-pairings`). Defensibility: moderate, slightly weaker than last cycle's assessment given Wine Matcher's similar course-menu-from-a-bottle feature found this cycle.
7. **Community feed** — **BUILT but disabled** (`COMMUNITY_ENABLED = false`), now explicitly confirmed this cycle to be a deliberate "planned phase" rather than an abandoned idea (per the dead-code-sweep commit's note that community groundwork was left in place on purpose). Defensibility: still low on its own even once shipped — Vivino and Delectable both have far larger communities a newly-launched, personal-only-today feature cannot compete with immediately.

---

## Sources

- [CellarChat support article — subscription required, 14-day iOS trial](https://support.cellartracker.com/article/108-cellarchat)
- [CellarTracker AI user growth — U.S. Chamber, CellarChat pricing from $40/yr or $4.99/mo](https://uschamber.com/co/good-company/the-leap/cellartracker-ai-user-growth)
- [CellarTracker AI wine pairing — Stark Insider, CellarChat beta dated July 2025](https://www.starkinsider.com/2025/07/ai-wine-pairing-cellartracker.html)
- [CellarTracker changelog — "Effortless Wine Tracking" announcement title (scope unconfirmed)](https://feedback.cellartracker.com/announcements/new-effortless-wine-tracking-and-a-beautiful-new-wine-details-experience)
- [Jancis Robinson — "Wine App Wars Continue" (Delectable/Banquet history)](https://www.jancisrobinson.com/de/articles/wine-app-wars-continue)
- [Vinous acquires Delectable and Banquet — App Developer Magazine (2016 acquisition)](https://appdevelopermagazine.com/vinous-acquires-delectable-and-banquet-wine-apps/)
- [Punch Drink — Thanksgiving wine advice, recommends human experts over AI, Nov 5, 2026](https://punchdrink.com/?p=170482)
- [SOMM DIGI AI — app listing](https://mwm.ai/apps/somm-digi-ai/6774844795)
- [Bright Cellars raises $11.2M Series B — BizTimes](https://biztimes.com/milwaukee-wine-subscription-startup-bright-cellars-raises-11-2-million)
- [Vinequery — startup listing, $30M A round (undated)](https://startupim.com/company/vinequery)
- [Samsung Health Galaxy AI "Meal Scan" — SamMobile](https://sammobile.com/news/samsung-health-galaxy-ai-scan-meal-feature-one-ui-9-5)
- [Samsung Health "Meal Scan" — Android Authority](https://www.androidauthority.com/samsung-health-meal-scan-3735422/)
- [NYT Cooking AI backlash — Nieman Lab (Oct 2026)](https://www.niemanlab.org/2026/10/the-new-york-times-is-adding-more-ai-features-to-its-cooking-app-and-users-arent-thrilled/)
- [NYT Cooking AI backlash, brand-risk framing — welcome.ai](https://welcome.ai/content/nyt-cookings-ai-recipe-modifiers-faces-user-backlash-and-brand-risks)
- [NYT Cooking reader-pushback figure (unconfirmed) — zeli.app](https://zeli.app/story/50282766)
- [SideChef RecipeGen AI beta announcement, Aug 2024 — SideChef business press release](https://business.sidechef.com/press-releases/sidechef-announces-recipegen-ai-beta-feature)
- [Clove — Canva-alumni AI cooking platform, $4.15M seed — Capital Brief](https://www.capitalbrief.com/briefing/canva-alumni-raise-415m-for-ai-powered-cooking-platform-clove-f126c533-cdad-4ba3-bd00-be6788297e6b/)
- [Flavrs — shoppable AI food-video app, $7M seed — TechCrunch](https://techcrunch.com/?p=2623225)
- [Linecook — social cooking app, $2.3M pre-seed — FITT Insider](https://insider.fitt.co/linecook-debuts-social-cooking-app/)
- [Recime — $15M seed led by Even Capital — Capital Brief](https://www.capitalbrief.com/briefing/cooking-app-recime-raises-15m-in-seed-round-led-by-even-capital-c46f07d0-5d14-4d13-b10c-817eae74cad6/)
- [Ollie AI assistant shutting down, Nov 2026, after $7.5M Khosla seed — TechCrunch](https://techcrunch.com/2026/10/30/ollie-a-privacy-focused-ai-assistant-is-shutting-down/)
- [TechCrunch "AI graveyard" running list, updated Nov 14, 2026](https://techcrunch.com/2026/11/14/the-ai-graveyard-a-running-list-of-projects-and-startups-that-didnt-make-it/)
- [Food tech funding reset — Pulse.bot](https://www.pulse.bot/entrepreneurship/news/food-tech-faces-funding-reset-as-investors-demand-profits-over-promises-6200e0c8-58a5-435b-acc9-0d531af6c113)
- [InVintory ("Vincent") MCP server for Claude/ChatGPT/Gemini — InVintory blog](https://invintory.com/blog/unexpected-ways-to-use-ai-sommelier-vincent/)
- [VinSavant replaces wine scores with attributed critic ratings, Nov 3, 2026 — Vinetur](https://www.vinetur.com/en/20261103110277/vinsavant-replaces-its-wine-scores-with-attributed-ratings-from-critics.html)
- [Wine Matcher: Scan & Pairing — Product Hunt](https://www.producthunt.com/products/wine-matcher-scan-pairing)
- [Wine Matcher — App Store listing](https://apps.apple.com/bf/app/id6779680579)
- [Resy–Toast "Digital Chits" integration, confirmed shipped — Resy newsroom](https://blog.resy.com/newsroom/resy-toast-integration-digital-chits/)
- [American Express and Toast strategic partnership — Resy newsroom](https://blog.resy.com/newsroom/american-express-and-toast-announce-strategic-partnership-to-help-elevate-hospitality-experiences/)
- [Vinster App Store listing](https://apps.apple.com/app/id6763607127) — direct fetch still unreachable (DNS-blocked) from this environment; this cycle's search-indexed snippet states the listing "hasn't received enough ratings or reviews to display an overview"
- Prior reports in this series for carried-forward figures and full profiles: `reports/2026-11-11-market-comparison.md`, `reports/2026-11-04-market-comparison.md`, `reports/2026-10-28-market-comparison.md`, `reports/2026-10-21-market-comparison.md`, and earlier reports in `reports/`.
