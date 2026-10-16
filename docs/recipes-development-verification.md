# Development CMS integration verification

Verified October 15, 2026 (America/Vancouver). This record covers development integration, not production cutover.

## Environment

- GitHub PR: https://github.com/sushiroll123/UBC-Cooking-Club-Website/pull/2, targeting `sanity-db-cms-pg`.
- Tested application commit: `bcc813490d03fd0a46fdc6fe1ef993a0b4d99ceb`.
- Passing CI: https://github.com/sushiroll123/UBC-Cooking-Club-Website/actions/runs/38843454862.
- Vercel Preview: https://vercel.com/cooking-clubs-projects/ubc-cooking-club-website/CrspgHh8TPz3Pa2QbM4JYBo4WNb8.
- Stable website: https://ubc-cooking-club-website-git-feat-ecbeee-cooking-clubs-projects.vercel.app/menu.
- Sanity project `ucc-website` / `1m7uu6hy`, dataset `development` only.
- Production still tracks `main`; the `production` dataset and production deployment were not changed.
- Four configuration variables and one user-saved signing secret are scoped only to `feat/recipes-cms` Preview. No migration token was added to Vercel.

## Webhook connection

The development document webhook is `Development recipe publication refresh` (`zpxfPOuYy76XP0WZ`). It targets the stable Preview `/api/sanity/revalidate` endpoint, includes published recipe/tag create/update/delete events, and excludes drafts and versions. Its project/dataset filter and payload projection match the application handler. The webhook uses GROQ API version `v2025-02-19`, the latest version offered by the management UI; the reader API version remains `2026-10-11`.

Vercel Standard Protection remains enabled. The user manually created its automation bypass credential and stored it in the webhook's `x-vercel-protection-bypass` HTTP header. This bypass applies across the project's protected deployments. It is separate from the signing secret, which the user saved in both services. Neither value belongs in Git, a webhook URL, public variables, screenshots, or shared webhook links.

Sanity's attempt-log browser tab was blocked by Chrome. Delivery was verified with the authenticated official Sanity CLI and the matching Vercel request log instead. The Vercel log identified the correct Preview deployment and a successful runtime-cache invalidation request.

## Cache defect found during acceptance

The original reader used Sanity's CDN in addition to Next's tagged cache. A successful signed notification could invalidate Next's cache, after which a refill still produced another cached 404. The direct reader later found the published record, while the original CDN-backed build still listed only the prior recipe.

The server reader now uses `useCdn: false`, retaining its anonymous published perspective and Next's five-minute tagged cache. Images continue using Sanity's image CDN. This follows Sanity's recommendation for webhook-based ISR: https://www.sanity.io/docs/nextjs/configure-sanity-client-nextjs. It increases direct API reads on Next cache misses, not on every cached page view.

The existing client contract check failed against the previous CDN configuration and passed after the change. Local root typecheck, lint, 36 unit tests, production build, and 2 Studio tests passed. Hosted CI also passed both package builds/typechecks and the baseline browser suite; the optional automated CMS-preview test remains skipped because CI has no protected-preview access configuration.

## Live acceptance results

Tests used a dedicated temporary development recipe and tag, without editing original recipes or tags. Recipe content mutations used the authenticated Sanity API; browser checks exercised the deployed website. These tests do not claim a new Studio editorial review of every imported recipe.

| Action | Hosted browser result | Signed delivery, UTC |
| --- | --- | --- |
| Draft only | No card; direct URL shows 404 | No published-recipe event expected |
| Publish from a previously cached 404 | Card and direct page appear | 2026-10-16 03:04:16, HTTP 200 |
| Change title, slug, and image | Updated card, new page, and loaded replacement image; old URL shows 404 | 03:04:51, HTTP 200 |
| Withdraw approval of the dedicated tag | Card disappears; detail shows 404 | 03:05:28, HTTP 200 |
| Restore tag approval | Card and detail return | 03:05:53, HTTP 200 |
| Unpublish | Card disappears; updated direct URL shows 404 | 03:06:11, HTTP 200 |

The first temporary recipe, its draft, and dedicated tag were removed after testing. The original published Chicken Piccata recipe remains available. Desktop and 390x844 mobile listing/navigation checks passed, including menu open/close and image loading. No navigation or visual design changes were made by this cache correction.

## Missed-notification recovery

Passed. With the development webhook temporarily disabled, a draft 404 was cached and the test record was published at approximately 2026-10-16 03:08:08 UTC. An immediate read remained a 404. After the five-minute interval (03:13:13–03:13:40 UTC), the first checked detail request and listing both showed the published recipe without any webhook or redeployment. This verifies recovery for the observed cache interval; it is not a promise of immediate freshness during an outage. The development webhook was re-enabled, and deleting the published fixture then removed its card again. The temporary recipe and draft were deleted, leaving the original content intact.

## Remaining release work

- The team still needs the planned editorial/visual comparison of all 11 imported recipes and images, with tag approval and publication decisions. Only selected published development content has been browser-checked.
- Invalid-signature, wrong-project/dataset, malformed/oversized payload, and provider-error handling have automated coverage; additional live negative webhook/outage injection was not performed.
- The optional protected-preview CI browser check is not enabled. The hosted publication lifecycle above was checked interactively instead.
- Existing deferred findings remain: server-only import guards, dependency maintenance, and CI build duplication. No blanket dependency upgrade was made.
- Keep the PR in draft pending team review and remaining acceptance work. Production import, production Studio deployment, production environment setup, merge, and Release 2 are separate authorized steps and were not started.
