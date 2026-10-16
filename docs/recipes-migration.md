# Recipe CMS migration (development)

The standalone Studio and importer are pinned to the verified Sanity project `ucc-website` (`1m7uu6hy`) in organization `oz4jjetza`. The website stays on `RECIPE_SOURCE=static` until Release 1 production cutover. Local and preview testing use only the public `development` dataset.

## Local setup

1. Run `npm ci` in the website root and `npm --prefix studio ci` for the editor.
2. Keep `.env.local` and `studio/.env.local` outside Git. Copy the values from `.env.example`; set both project IDs to `1m7uu6hy`, both datasets to `development`, and keep `RECIPE_SOURCE=static` until the development import is verified.
3. Start the website with `npm run dev` and the Studio with `npm --prefix studio run dev`. Sign into Studio with a member account. Do not run `studio`'s deploy script during this development phase.

## Dedicated import token

`SANITY_IMPORT_TOKEN` is deliberately blank in the ignored root `.env.local`. In the verified project's [API token page](https://www.sanity.io/organizations/oz4jjetza/project/1m7uu6hy/api), select **Add API token**, name it `Development recipe migration`, set a short expiration such as 30 days, and select **Editor** only. Copy the secret once into the `SANITY_IMPORT_TOKEN=` line in the root `.env.local`; do not paste it into chat, a command, Git, or a public environment variable. The current token dialog offers Editor read/write access to **all datasets** in this project. The less privileged Contributor role writes drafts only and does not cover the published tag documents this importer creates. The available built-in roles therefore cannot restrict this token to development; keep it local, use it only with `--dataset development`, and revoke it after verification. Sanity [documents project robot tokens and one-time display](https://www.sanity.io/docs/content-lake/http-auth).

## Import and verification

Run `npm run recipes:import` first. It defaults to a local dry run and reports 11 source recipes and planned writes without contacting Sanity. The source is `src/data/menu.ts`; image paths are `public/menu/workshops/<legacy-id>.webp`.

When the token is available, run `npm run recipes:import -- --apply --dataset development`, then `npm run recipes:verify -- --dataset development`, then rerun the import and verify that `createdRecipes` and `uploadedImages` are both zero. Never put the token on the command line. The importer checks the verified project ID, uses deterministic recipe and tag IDs, uploads an image only when its SHA-1 is absent, and uses `createIfNotExists` so a rerun does not replace editor changes. Verification compares recipe text, quantities, list order and Sanity type markers, slugs, tags, image alternative text, and the uploaded asset SHA-1 against the source file.

Imported recipes are **drafts** and legacy tags start unapproved. An administrator must review tag labels and approve them before publishing recipes. This keeps unchecked legacy tags from bypassing Studio's publication validation. After approval, use the local Studio to review all 11 images, links, and copy, then publish in development for reader tests. There is no production import in Tasks 2–5.

The nonsecret local dry-run report is in `docs/recipes-import-dry-run.json`. A real development parity report must replace or accompany it only after a successful authenticated import and verify run.

## Development publication refresh

The website's `/api/sanity/revalidate` route accepts signed notifications from this project's `development` dataset. The route checks the signature over the raw request body, limits the body to 64 KiB, checks the project and dataset, and refreshes the recipe query tag, `/menu`, and affected detail paths. A tag change also refreshes all detail routes. Public reads use the anonymous published perspective against Sanity's direct API (`useCdn: false`), with a five-minute Next.js revalidation interval. Next.js owns the content cache so a webhook-triggered refill cannot recache an old Sanity CDN response. Images still use Sanity's image CDN. A missed webhook is recovered by a later read after that interval; a stale response can still be served once while Next.js refreshes it. Do not promise immediate removal during an outage.

Once a development preview website exists, create a **document webhook** in the verified project's API settings with these values:

- Name: `Development recipe publication refresh`.
- Dataset: `development` only. URL: the preview origin followed by `/api/sanity/revalidate`, with no secret in the URL.
- Method: `POST`; trigger on Create, Update, and Delete. Leave draft and version triggers off. Webhook GROQ API version: `v2025-02-19`, the latest option currently offered by the management UI. This is independent of the website reader API version.
- Filter: `(before()._type in ["recipe", "tag"] || after()._type in ["recipe", "tag"]) && sanity::projectId() == "1m7uu6hy" && sanity::dataset() == "development"`
- Projection: `{ "projectId": sanity::projectId(), "dataset": sanity::dataset(), "type": coalesce(after()._type, before()._type), "beforeSlug": before().slug.current, "afterSlug": after().slug.current }`
- Set a unique signing secret in the webhook's **Secret** field and set the same value as the preview website's server-only `SANITY_REVALIDATE_SECRET`. Never add it to a URL, Git, a public environment variable, or a command argument.

When Vercel Standard Protection is enabled, the owner must separately approve and create a Protection Bypass for Automation credential and place it in the Sanity webhook's `x-vercel-protection-bypass` HTTP header. This credential grants access across the project's protected deployments; it is distinct from the signing secret and must never appear in the webhook URL or repository. Retain Vercel login protection and the endpoint's signature verification. The development webhook is configured only after its preview target and secret exist. Hosted integration status and delivery evidence are recorded in the progress ledger. Sanity's [webhook documentation](https://www.sanity.io/docs/content-lake/webhooks) describes published-only triggers and signed delivery; its [GROQ filter documentation](https://www.sanity.io/docs/developer-guides/filters-in-groq-powered-webhooks) describes `before()`, `after()`, and the project/dataset functions.

For preview acceptance, set `RECIPE_SOURCE=sanity`, `SANITY_PROJECT_ID=1m7uu6hy`, `SANITY_DATASET=development`, and `SANITY_REVALIDATE_SECRET` only in the preview configuration. Publish a reviewed development recipe and confirm its card and direct URL. Edit its title or slug; confirm both the old and new paths. Unpublish it; confirm its card disappears and the old URL returns 404. Repeat with the webhook temporarily disabled to observe the five-minute recovery behavior. A tag approval change should also refresh cards and details. The optional browser check `CMS_PREVIEW_URL=https://... CMS_PUBLISHED_SLUG=... CMS_UNPUBLISHED_SLUG=... npm run test:e2e` verifies published and unpublished URLs after those editorial actions; it skips without those variables. Preview setup and these live checks are pending.
