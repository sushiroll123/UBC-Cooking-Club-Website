# SDD ledger — plan: docs/superpowers/recipes/release-1-cms-implementation.md

Scope: Release 1 Tasks 2–5. Task 1 is merged in origin/main through PR #1 (merge 9505ad7); the route and API fixes are present in the merged tree. Task 6 and Release 2 are excluded.
Workspace: /private/tmp/ubc-recipes-cms-r1 on feat/recipes-cms, based on origin/main a5d47d4. Existing fix/recipe-foundation worktree has an unrelated modified Landing.tsx and was left untouched.
Pre-flight: Task 2 Recipe contract and validation feed Task 3 importer and verifier; keep ID, slug, array ordering, tags, and image references consistent.
Pre-flight: Task 2 Sanity configuration and image helper feed Task 4's published reader; published perspective and crop/hotspot must agree.
Pre-flight: Task 3's deterministic IDs and parity report feed Task 4's slug lookup; preserve every legacy ID and sortOrder.
Pre-flight: Task 4's query/cache paths feed Task 5's webhook invalidation; ensure listing, detail, and old slug paths are refreshed.
Baseline: npm ci exit 0. Node 20.12.2, npm 10.5.0, Next 15.5.25, React 18.3.1. Lint and build exit 0; build generated all 11 recipe routes. Typecheck fails in 8 stale endpoint test calls. Unit tests 12/13 fail because main subsequently disabled both contact and newsletter endpoints with 503, while Task 1 tests still assert their earlier active behavior.
Ruling: Align the baseline tests to the now-disabled endpoint behavior without redoing Task 1 or re-enabling external services — the merged main code is authoritative for this branch — cost if wrong: tests will not cover the dormant provider branches until those services are restored.
Access: No existing Sanity project identity or development import credential is present in tracked project files; requested a secure access method before any external writes. Local implementation and mock-based checks continue meanwhile.
