# Vinster — Phase Two Production (post-launch roadmap)

_Living doc for features deferred until after the v1 launch (target Fri 2026-06-05). Capture ideas here as they come; we'll scope + sequence them later._

---

## 1. Community
The social layer — already scaffolded in the schema (`community_posts`, `community_likes`, `community_comments`, `community_reviews`, `community_profiles`) and shown as **"Coming Soon"** in-app.
- Share wine reviews, restaurant finds and recipes with friends and the wider Vinster community.
- Share/post your **personality sketches**.
- Connect with like-minded wine & food lovers.
- **Pre-reqs:** public-content privacy section (see Data & Privacy Audit), moderation/reporting, profile visibility controls.

## 2. Upload external cellars & receipts
Let users bring an existing collection in, and keep it current as they shop.
- **Import an external cellar** — bulk import from a spreadsheet / another app's export.
- **Upload receipts** — photograph or upload purchase receipts so Vinster logs wines (and prices) as you buy them, keeping the cellar in sync with real purchases.
- Ties naturally to the existing purchase-price / estimated-value tracking.

## 3. Scan a retailer's shelves (in-store discovery)
Point the camera at a **wine retailer's shelf** and have Vinster read **multiple labels at once**, then recommend from what's actually in front of you.
- Multi-label OCR in a single shot.
- Rank the shelf against the user's preferences + Vinster's criteria (critic score, value, vintage, readiness) — like the List flow, but for a shop shelf rather than a restaurant list.

## 4. Bulk-scan multiple labels (cellar intake)
Scan **multiple labels at once from a wine rack or fridge** to add many bottles in one go ("multiples upload").
- Speeds up first-time cellar setup and large restocks.
- Shares the multi-label OCR engine with #3; difference is the destination (cellar intake vs shop recommendation).

## 5. "Baller" function — personalised premium Vinster
A **top-tier user experience** for premium/power users.
- Bespoke, individually **designed cellars** (custom visual layouts/themes).
- **Special management features** for serious collectors (advanced stats, valuation tracking, etc.).
- Likely the basis of a paid tier once the free "first 10,000 users" period ends.

---

## Parking lot (other deferred ideas, from project memory)
- **Order History & Learning** — record ordered wines and use the history to personalise future recommendations.
- **Personality Avatar** — milestone-unlocked AI avatar drawn from the personality sketch (FLUX/DALL·E via edge function).
- **Push notifications** — drinking-window alerts, personality-evolution nudges, community signals (expo-notifications).

_Add new Phase Two ideas under the relevant heading (or the parking lot) as they arise._
