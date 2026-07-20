# Archived reports from the `master` branch

**These reports do not describe the shipped Vinster app. Do not act on their findings.**

## What these are

72 automated code-review and market-research reports generated between
2026-05-15 and 2026-07-20. They were committed to the `master` branch and
existed nowhere else, so they are preserved here rather than lost when
`master` was retired.

## Why they are wrong

The two scheduled review agents cloned the repository without specifying a
branch. Git resolved that to the repository's default branch, `master` — a
snapshot frozen at 2026-04-16, three months before the newest of these
reports. The live app has been developed on `main` throughout.

Every finding in these files therefore describes code that has not run in
production since April 2026. Concretely, they assert:

- An invalid Claude model ID (`claude-opus-4-6`) breaking every scan. The
  live edge functions on `main` use valid IDs and have throughout.
- A permanently empty History tab with no write path. `main` writes scan
  history and has a `scan_sessions` schema that evolved well past this.
- A missing `app/auth/callback.tsx` route. It exists on `main`.
- No root error boundary. One exists on `main` at `app/_layout.tsx:148`.
- Features described as unbuilt (cellar management, chef recipes) that are
  in fact shipped on `main`.

The reports also compounded their own errors: each run carried findings
forward from the previous report without re-verifying them, so a single
early mistake persisted across roughly 60 daily reports unchallenged.

## What was done about it

On 2026-07-20 both routines were repointed at `main`, with a mandatory
branch checkout and verification step, and instructions to re-verify every
finding against current code rather than carrying it forward. The
repository default branch should also be changed from `master` to `main`
so that anything else cloning this repo lands on the live code.

## Value

Kept as a record of what the automation produced and as a caution about
unpinned branch assumptions in scheduled agents. They have no value as a
description of the codebase.
