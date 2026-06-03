# Vinster — Launch Guide (iOS + Android)

_Last updated: 2026-06-03. App: **Vinster** · bundle id / package: `com.vinster.app` · version `1.0.0` · EAS owner `hilary_cwc`._

This is the end-to-end path from "build works on my phone" to "live in the App Store and Google Play". Read the **two timing gotchas** in section 0 first — they decide whether a public Friday launch is realistic.

---

## 0. Read this first — the two things that can block a Friday launch

1. **Apple Developer enrolment takes time.** The Apple Developer Program ($99/year) requires identity verification that can take **24–48 hours or more**. If you haven't enrolled yet, do it **today** — nothing else iOS can happen until it's approved.

2. **Google Play's "new personal account" rule.** If your Play developer account is a **personal/individual** account created after ~Nov 2023, Google requires you to run a **closed test with at least 12 testers, opted-in for 14 continuous days**, *before* you can apply for production (public) access. **Organisation** accounts are exempt. → A *public* Play launch on Friday is likely **not possible** under this rule, but **internal/closed testing is**.

**Realistic read:** by Friday you can very plausibly have **TestFlight (iOS beta)** live and an **internal Play test** live — i.e. shareable, installable, "launched" to real testers. Full *public* store listings (especially Google) may land a bit later. Worth confirming which Play account type you have.

---

## 1. Accounts & costs (prerequisites)

| Store | Account | Cost | Notes |
|---|---|---|---|
| Apple | Apple Developer Program | $99 / year | Identity verification; needs an Apple ID with 2FA. |
| Google | Google Play Developer | $25 one-time | New personal accounts → 14-day/12-tester closed test before production. |

You'll also need, for both:
- A **publicly hosted Privacy Policy URL** (you have the policy text in-app at `legal/privacy`, but the stores need a public web link — host it somewhere, e.g. a simple page on a domain or a Notion/GitHub Pages page).
- A **support contact** (you have `tellme@vinsterapp.com`) and ideally a support/marketing URL.

---

## 2. One-time pre-flight on the app itself (mostly done)

- ✅ `production` EAS profile exists (`eas.json`) — Android `app-bundle`, iOS ready, prod Supabase env set.
- ✅ Age gate present (required — Vinster is an alcohol-related app).
- ✅ App icon + splash branded.
- **Check:** Supabase **auth redirect URLs** include the production scheme (`vinster://auth/callback`) so email-confirm deep links work on store builds.
- **Bump nothing manually** — `appVersionSource: remote` + `autoIncrement` means EAS handles build numbers. Keep `version` at `1.0.0` for the first release.

---

## 3. Build the production binaries

These are different from the `preview` APKs you've been testing.

```
# iOS — produces an .ipa, signed with a distribution cert (EAS manages credentials)
npx eas-cli build --platform ios --profile production

# Android — produces an .aab (app bundle) for Google Play
npx eas-cli build --platform android --profile production
```

- First iOS build will prompt to create/let EAS manage the **distribution certificate** and **provisioning profile** — say yes to EAS-managed.
- Android already has your upload keystore (`Build Credentials 1DdnTiro_m`); Play App Signing will manage the final release key.

---

## 4. Create the store records + submit

### iOS — App Store Connect
1. In **App Store Connect**, create a new app: name **Vinster**, bundle id `com.vinster.app`, SKU (any unique string), primary language.
2. Submit the build:
   ```
   npx eas-cli submit --platform ios --profile production
   ```
   (EAS will ask for an **App Store Connect API key** — generate one in App Store Connect → Users and Access → Integrations. Easiest long-term option.)
3. The build appears in App Store Connect → assign it to **TestFlight** (beta) and/or the **App Store** version.

### Android — Google Play Console
1. In **Play Console**, create the app: **Vinster**, default language, app/game = App, free.
2. Set up a **service account** JSON (Play Console → Setup → API access) so EAS can upload, then:
   ```
   npx eas-cli submit --platform android --profile production
   ```
   *(First time, you may instead upload the `.aab` by hand in Play Console → Testing → Internal testing → Create release.)*
3. Roll out to **Internal testing** first (instant, no review wait), then closed → production per the rule in section 0.

---

## 5. Store listing assets you'll need (have these ready)

Same content broadly serves both stores:

- **App name:** Vinster (Play title ≤ 30 chars).
- **Short description / subtitle** (Play short ≤ 80 chars; Apple subtitle ≤ 30 chars).
- **Full description** — what Vinster does (your AI sommelier: List / Chef / Cellar / You).
- **Keywords** (Apple, ≤ 100 chars).
- **Screenshots** — capture from the app:
  - Apple: at least one **6.7"** iPhone set (1290×2796); iPad if you support it (you do — `supportsTablet: true`).
  - Google: **2–8 phone screenshots**, plus a **Feature graphic 1024×500**.
- **App icon:** Apple wants a **1024×1024** (no transparency/alpha) — your cream tile icon works but must be flattened opaque. Google uses **512×512**.
- **Privacy Policy URL** (public).
- **Age rating / content rating:**
  - Apple: complete the questionnaire → expect **17+** (alcohol references).
  - Google: complete the **IARC content rating** questionnaire (declare alcohol references) + set **target audience** to adults.
- **Data safety (Google) / App Privacy (Apple):** declare what you collect (account email, preferences, scan images processed-not-stored, etc.) — be accurate; your About copy already says label images are processed and discarded.

---

## 6. Review & going live

- **TestFlight (iOS):** internal testers are instant; external testers need a quick "beta app review" (usually fast).
- **App Store review:** typically **~1–3 days**. They're stricter on alcohol apps — the age gate + correct 17+ rating + accurate privacy answers matter.
- **Google internal testing:** live in minutes, no review. **Closed/production** for new personal accounts: the 14-day/12-tester requirement, then a production review (hours–days).
- Once approved, you control the **release** (manual or automatic, phased rollout available on both).

---

## 7. Suggested plan toward Friday

1. **Today:** enrol in Apple Developer + Google Play (so verification clocks start). Confirm your Play account type (personal vs org).
2. **Tomorrow (06-04):** fix the Cellar bugs → one production-candidate build. Host the privacy policy; capture screenshots; draft the listing text.
3. **Thu/Fri:** `eas build --profile production` for both platforms → submit. Push to **TestFlight** + **Play internal testing** so Vinster is genuinely in testers' hands for "launch", with public store listings following as review/closed-testing windows allow.

---

## 8. What Claude can do for you (just ask)
- Wire up `eas submit` config + walk each command through with you.
- Draft the **store listing copy** (name, descriptions, keywords) in Vinster's voice.
- Flatten/produce the **1024² opaque App Store icon** + resize screenshots.
- Prep the **privacy policy as a hostable web page**.
- A pre-submission checklist pass (age rating answers, data-safety mapping, deep-link/auth config).

_You should suggest commands like `gcloud`/store logins be run by you directly (e.g. via `! <command>`) since they're interactive._
