# Vinster Privacy Policy

*Version 1.0 · Last updated May 2026*

> Mirror of the in-app `/legal/privacy` screen. Keep this file and
> `app/legal/privacy.tsx` in sync — when one changes, update the other
> and bump the version line at the top.
>
> This is the text you publish at https://vinsterapp.com/privacy (or
> equivalent) for the App Store / Play Store privacy-policy URL field.

---

## Who we are

Vinster ("we", "us", "our") is an AI sommelier app that helps you choose better wine at restaurants, build a personal cellar, and discover recipes that pair with your bottles. This policy explains what data we collect when you use Vinster, why we collect it, and what your rights are.

Vinster is operated by **[Your Full Legal Name]**, a sole trader based in the United Kingdom. You can contact us at the email address listed under "Contact us" below.

## What we collect

**Account details:** your email address, password (hashed — we never see it in plain text), and any display name you choose.

**Profile preferences:** wine preferences, recipe requirements, dietary needs, and any optional fields you fill in.

**Content you create:** wines you add to your cellar, wish list and archive; tasting notes, restaurant reviews, scores, and photos you upload of wine lists or labels.

**AI-generated content:** wine recommendations, recipes, drinking-window assessments, and personality sketches Vinster generates from your activity. These are stored on your account so you can revisit them.

**Device and usage info:** anonymous app version, OS version, and crash diagnostics provided by Expo / React Native.

**Optional location:** when you write a wine review on Vinster, we may briefly use your device location (with your permission) to suggest a nearby city. We do not track or log your location otherwise.

## How we use your data

**To provide the service:** storing your cellar, surfacing past scans, generating recommendations, building your personality sketches.

**To personalise:** the more you use Vinster, the better its AI knows your taste. Personalisation is per-account — your data is not used to train any shared model.

**To communicate:** account-related emails (password reset, sign-up confirmation) and very occasional product updates. We do not send marketing emails without your explicit opt-in.

**To improve the app:** aggregate, anonymous metrics on which features are used.

## Third parties

We use a small number of carefully chosen third-party services to run Vinster.

**Supabase** (database, authentication, file storage, edge function compute): your account and content are stored on Supabase's managed infrastructure. Supabase is GDPR-compliant; data is hosted in EU regions where available.

**Anthropic** (Claude API): we send wine list photos, label photos, and short summaries of your profile and activity to Anthropic's Claude API to generate recommendations, recipes, and personality sketches. Anthropic does not retain this data for training under their API terms.

**Expo** (build and update infrastructure): Vinster is built on the Expo platform. Expo collects anonymous crash and performance data.

We do not sell your data, ever.

## AI and your data

Vinster uses Claude (an AI by Anthropic) to power its recommendations. When you scan a wine list, scan a wine label, or generate a recipe pairing, the photo and the relevant context (your preferences, the wine name, etc.) is sent to Claude's API for processing.

The responses Claude returns are stored on your account in our database.

Claude does not learn from your specific inputs — Anthropic's API terms ensure your data is not used to train shared models. Photos you upload are processed by Claude and then discarded by our edge functions — they are not retained on our servers.

## Age restriction

Vinster is intended for adults of legal drinking age (18 or older in the UK). On first launch we ask for your date of birth to confirm this. We do not knowingly collect data from anyone under 18. If you believe a minor has used Vinster, please contact us at the email below and we will delete the account.

## Your rights

Under UK GDPR and other privacy laws, you have the right to:

- Access the data we hold about you — request via email
- Delete your account and all associated data — via the app (About You → Delete Account) or by emailing us
- Export your data in a portable format — request via email
- Correct inaccurate data — edit your profile in the app, or contact us
- Withdraw consent for processing — by deleting your account
- Object to certain types of processing or lodge a complaint with the UK ICO

We respond to data requests within 30 days.

## Data retention

We keep your account data for as long as your account is active. When you delete your account, your data is removed from our primary database within 30 days. Encrypted backups may take up to 90 days to fully expire.

## Security

All network requests are made over HTTPS. Passwords are hashed by Supabase Auth and are never seen in plain text by Vinster or its developers. Database access is gated by Supabase Row Level Security so users can only see their own data. No system is perfectly secure — if you become aware of a security issue, please contact us so we can investigate.

## Changes to this policy

We may update this policy from time to time. Material changes will be flagged inside the app and through email where appropriate. The version number and "last updated" date at the top of this page will always reflect the current revision.

## Contact us

Questions, requests, or feedback — email us at **tellme@vinsterapp.com**. We read everything.
