# Vinster — Business Plan

## Executive Summary

Vinster is an AI-powered sommelier app for iOS and Android that solves one of the most common anxieties in dining and entertaining: choosing the right wine. Using Claude's vision and language models, Vinster reads restaurant wine lists in real time, matches wines to the user's taste profile and budget, explains its reasoning like a knowledgeable friend, and helps users manage their home cellar and pair wines with food.

The app is built, polished, and ready for launch. The core technology — real-time wine list OCR, preference-aware AI recommendations, label intelligence, and chef-inspired recipe pairings — is differentiated, functional, and sophisticated. This plan works backwards from what has been built to define the market opportunity, monetisation strategy, and go-to-market path.

---

## 1. The Problem

Wine is one of the last genuinely intimidating experiences in dining. A typical restaurant wine list contains 40–300 bottles. Diners lack the knowledge to navigate it confidently, and asking for help feels exposing. The result: people default to price anchoring (second cheapest), stick to familiar names, or defer to whoever looks most confident at the table. None of these produce satisfaction.

The same problem extends to home: a growing cellar with no visibility into what to drink now versus what to keep, and no guidance on what pairs with tonight's dinner.

Existing apps solve fragments of this problem. None solve it end to end with AI.

---

## 2. The Product (What Has Been Built)

### Core Features

**Wine List Scanner**
The flagship feature. The user photographs a restaurant wine list (single image or multi-image batch). Vinster uses Claude Haiku for OCR to extract every wine, then Claude Sonnet 4.6 to apply a multi-criteria ranking engine:
- Hard constraints: colour preference, budget ceiling, disliked regions/grapes
- Diversity rules: 3 recommendations must span different grape varieties and regions
- Soft ranking: critic score estimate → vintage quality → drinking window status → rarity → value → preference fit
- Output: 3 ranked recommendations with rationale, vintage assessment, drinking window, and rarity — explained in plain English

A "Top Scoring Mode" strips all preferences and returns the three highest critic-score wines for users who want objective quality over personal taste.

**Wine Label Scanner & Intelligence**
Users photograph a label to get: estimated critic score, drinking window (with status — Too Young / Approaching Peak / Peak / Fading), grape variety, and sommelier-style tasting notes. From there they can generate chef-inspired recipes paired to that wine, respecting dietary preferences and allergens.

**Food-Wine Pairing**
Two modes: "From My Cellar" (recommends what to open tonight based on the dish) and "Suggest a Style" (recommends a wine type to buy). The cellar mode uses the user's actual bottle inventory; the shopping mode returns region, grape, characteristics, and a price guide.

**Cellar Management**
Full CRUD cellar with virtual rack visualisation, drinking window status tracking across the collection, cellar sharing (read-only, by email), and bulk import via document/spreadsheet photo.

**User Preference Profile**
Six-dimension preference model: wine type, style, regions, grapes, exclusions, budget. Set once at onboarding, adjustable anytime, applied automatically to every recommendation with per-search overrides.

**Scan History & Chosen Wines**
Authenticated users build a record of every restaurant scan and every wine they ordered, with optional personal tasting notes and scores out of 5. This is the foundation of a long-term taste profile.

**Community (Defined, Not Yet Built)**
Architecture is in place. Planned: recipe ratings, wine ratings, restaurant reviews, user connections.

---

## 3. Target Market

### Primary: The Curious Diner
**Who**: Adults 28–55 who drink wine regularly in restaurants, spend £30–100+ per bottle when dining out, and feel uncertain navigating wine lists. They want to make good choices without looking like they don't know what they're doing.

**Size**: Wine consumption in UK restaurants alone represents a £3.2bn annual market. The US dining wine market exceeds $20bn. The addressable user base (smartphone-owning, restaurant-going wine drinkers) numbers in the hundreds of millions globally.

**Behaviour**: They already photograph menus, use apps at the table, and trust AI recommendations (Spotify, Netflix). They will trust Vinster.

### Secondary: The Home Cellar Builder
**Who**: Wine enthusiasts with 20–500+ bottles at home, growing their collection but lacking visibility into when to drink what.

**Behaviour**: Currently using spreadsheets, CellarTracker (web only), or nothing. Willing to pay for a well-designed mobile alternative with AI drinking window guidance.

### Tertiary: The Home Cook Who Entertains
**Who**: Confident in the kitchen, less confident with wine matching. Wants to impress at dinner parties without becoming a wine expert.

**Behaviour**: Cooking from recipes, buying wine at the supermarket or online, open to AI pairing guidance that feels like advice from a knowledgeable friend.

---

## 4. Competitive Landscape

### Vivino
**What it does**: Barcode/label scanning, crowd-sourced ratings, wine marketplace.  
**Strengths**: Largest wine database (15M+ labels), strong brand recognition, in-app purchasing.  
**Weaknesses**: Ratings are crowd-sourced and unreliable for restaurant wine lists; no real-time wine list scanning; recommendations are database lookups, not AI reasoning; cellar management is basic; no food pairing.  
**Verdict**: A database product, not an intelligence product. Vinster's AI reasoning layer is fundamentally different.

### Delectable
**What it does**: Social wine network, label scanning, expert notes.  
**Strengths**: Editorial quality, sommelier community, elegant UX.  
**Weaknesses**: Effectively dormant after acquisition by Wine.com; no active development; no restaurant wine list feature; no cellar management.  
**Verdict**: Not a current competitive threat.

### CellarTracker
**What it does**: Community-driven cellar management and tasting notes, primarily web-based.  
**Strengths**: Enormous community database, trusted by serious collectors, free.  
**Weaknesses**: Desktop-first and visually dated; no AI; no restaurant scanning; mobile app is a thin wrapper; no pairing guidance.  
**Verdict**: Owns the serious collector segment but leaves the casual and mid-tier market entirely unserved. Vinster's cellar feature targets exactly this gap.

### Hello Vino
**What it does**: Basic wine recommendations by occasion, food, or price.  
**Strengths**: Simple, accessible.  
**Weaknesses**: Rule-based, not AI; no scanning; no cellar; no personalisation depth.  
**Verdict**: Solves a surface-level problem. Not a serious threat.

### Wine Ring
**What it does**: AI wine recommendations via chat interface.  
**Strengths**: AI-native approach, conversational UX.  
**Weaknesses**: No camera/OCR; requires manual input; no cellar; no recipe pairing; US-focused.  
**Verdict**: Closest conceptual competitor on AI positioning, but lacks the real-world scanning capability that makes Vinster useful at the restaurant table.

### Somm (by WineryHunt)
**What it does**: AI sommelier questions and recommendations.  
**Strengths**: Sommelier knowledge base, subscription model proven.  
**Weaknesses**: No camera integration; no cellar; no real-time restaurant use.  
**Verdict**: Educational positioning, not situational. Different use case.

### Wine Spectator
**What it does**: Critic scores, editorial content, subscription access to reviews.  
**Strengths**: Brand authority, 400,000+ reviews.  
**Weaknesses**: Content product, not a tool; requires manual search; expensive subscription; no AI; no scanning.  
**Verdict**: A reference source, not a recommendation engine. Vinster could integrate Wine Spectator scores rather than compete.

### Competitive Summary

| Capability | Vinster | Vivino | CellarTracker | Wine Ring | Delectable |
|---|---|---|---|---|---|
| Restaurant wine list scanning | ✓ | — | — | — | — |
| AI reasoning (not rules/database) | ✓ | — | — | Partial | — |
| Cellar management | ✓ | Basic | ✓ | — | — |
| Food pairing + recipes | ✓ | — | — | — | — |
| Drinking window tracking | ✓ | — | ✓ | — | — |
| Preference profiling | ✓ | Basic | — | — | — |
| Mobile-first | ✓ | ✓ | — | ✓ | ✓ |

**Vinster is the only product that combines real-time wine list scanning, AI-powered personalised recommendations, cellar management, and food pairing in a single mobile-first app.**

---

## 5. Differentiation

### Why Vinster Wins at the Table
No competitor scans a restaurant wine list and returns a personalised, reasoned recommendation in under 30 seconds. This is the defining use case — the moment of highest intent, highest anxiety, and highest willingness to pay.

### Why the AI Layer Matters
Vivino returns a database match. Vinster returns reasoning. A user who avoids Merlot from over-warm appellations but loves structured reds gets a different recommendation than one who wants the most crowd-pleasing bottle under £60. The recommendation adapts to the person, the list, and the context.

### Why the Preference Engine Is a Moat
Every scan, every "I ordered this," every tasting note makes Vinster smarter about that user. The data model captures: preferred styles, regions, grapes, price sensitivity, dining context, and personal scores. This is a compounding advantage — the longer someone uses Vinster, the better it gets for them, and the harder it is to leave.

---

## 6. Revenue Model

### Freemium + Subscription

**Free tier**:
- 5 wine list scans per month
- Basic cellar (up to 25 wines)
- Label scanning (unlimited)
- Food pairing (3 per month)

**Vinster Plus — £7.99/month or £59.99/year**:
- Unlimited wine list scans
- Full cellar (unlimited wines, virtual racks, sharing)
- Unlimited food pairing + recipes
- Scan history and chosen wines tracking
- Priority AI (faster response)

**Vinster Pro — £14.99/month** *(future)*:
- Everything in Plus
- Community features (ratings, reviews, connections)
- Cellar valuation insights
- Investment/drinking window alerts

### Rationale
The restaurant scanning use case creates high-frequency, high-intent interactions — exactly the behaviour that converts free users to paid. A user who scans a wine list at dinner twice a week will hit the free tier limit within two weeks. The upgrade moment is natural and the value proposition is immediate.

### Secondary Revenue (12–24 months)
- **Affiliate / wine merchant integration**: "Buy this wine" links to Vivino, Wine-Searcher, or Naked Wines. Revenue share on purchases.
- **Restaurant partnerships**: Featured placement or data insights for restaurant groups.
- **API / white label**: Sell the recommendation engine to hotel groups, wine bars, or e-commerce wine retailers.

---

## 7. Go-to-Market

### Phase 1: Launch & Validate (0–6 months)
**Target**: UK market, iOS first.

- Launch on App Store with free tier. Focus on the restaurant scanning use case as the hero feature.
- Distribution: food and wine creators on Instagram and TikTok (demo the "scan and get recommendation" flow — it's inherently visual and shareable).
- PR: pitch to food and lifestyle press as "the app that ends wine list anxiety."
- Onboarding: make the first scan frictionless (guest mode works, account optional).

**Success metric**: 10,000 active users, 15% free-to-paid conversion.

### Phase 2: Grow the Cellar Segment (6–18 months)
- Target wine enthusiasts and collectors through wine media, podcasts, and clubs.
- Cellar management is the stickiness feature — users who add their cellar churn at a fraction of the rate of scan-only users.
- Launch Android.
- Introduce annual subscription pricing to improve LTV.

**Success metric**: 50,000 active users, 100,000 cellar wines tracked.

### Phase 3: Community & Network Effects (18–36 months)
- Launch Community tab (architecture already defined in codebase).
- User-generated wine ratings, restaurant reviews, connections.
- Network effects begin: a larger community improves rating quality, drives organic acquisition.
- Explore B2B partnerships (restaurants, hotels, wine merchants).

### Phase 4: Identity & Personalisation (36+ months)
The Wine and Chef Personality sketches already give every user a distinctive AI-generated character. Phase 4 turns that personality into a tangible, earned identity object the user can wear inside and outside the app.

- **Milestone-unlocked AI avatar.** When a user hits a meaningful engagement milestone — e.g. their personality has evolved three or more times, or they've logged 25+ wine/recipe reviews — Vinster generates a branded portrait icon drawn from their latest personality sketch and unlocks it as their profile avatar. The avatar appears across the app (community feed, share cards, leaderboard rows, header) and is exportable for use outside Vinster (social profile pictures, group chats).
  - **Why:** Turns the personality from a static artefact into a visual identity. Adds a tangible reward for sustained engagement. Strengthens recognisability in the community feed (network-effect amplifier). Differentiates Vinster from database-driven competitors who can't generate this kind of bespoke output.
  - **How:** Supabase edge function calls an image model (FLUX via fal.ai at ~$0.01/image, or DALL-E 3 at ~$0.04/image) with the personality title plus a handful of archetype keywords from the sketch body, rendering in a fixed house style ("elegant minimalist line illustration, gold-on-dark, hand-drawn portrait icon"). Generated image lands in a Supabase Storage bucket; the user can request a re-roll once per evolution cycle.
  - **Tiered unlocks (later iterations):** first avatar at the initial milestone, second style at a higher tier, animated/seasonal variants at the highest tier — each becomes a status signal in the community feed.
- **Personality-driven personalisation.** Use the personality data to subtly tune recommendation copy, suggested cuisines, and discovery prompts so the app feels increasingly tailored as a user's archive grows.
- **Avatar-led B2B.** Restaurants partnering with Vinster could use guests' personality avatars in pre-arrival concierge flows ("Welcome back, *Card-Carrying Riesling Romantic*"). Adds a personal touch that's only possible with Vinster's data.

**Success metric**: 30%+ of community-active users opt to publish their avatar within 6 months of launch.

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Vivino copies wine list scanning | First-mover advantage + AI reasoning depth is not easily replicated from a database product |
| AI inference costs at scale | Claude Haiku for OCR (cheap), Sonnet only for recommendations; cost per scan is manageable |
| Low restaurant scan frequency (seasonal users) | Cellar and pairing features create daily/weekly touchpoints between restaurant visits |
| Community tab takes too long to build | Cellar and scanning features provide strong standalone retention |
| App Store discovery is hard | Creator/influencer marketing is well-suited to this use case — the scan demo is inherently watchable |

---

## 9. Summary

Vinster has built something no competitor offers: a complete, AI-native wine companion that works at the restaurant table, in the home cellar, and in the kitchen. The technology is sophisticated but the experience is simple. The market is large, the competition is fragmented, and the monetisation path is clear.

The product is ready. The opportunity is now.
