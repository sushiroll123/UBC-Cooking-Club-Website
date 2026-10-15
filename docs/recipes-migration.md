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

When the token is available, run `npm run recipes:import -- --apply --dataset development`, then `npm run recipes:verify -- --dataset development`, then rerun the import and verify that `createdRecipes` and `uploadedImages` are both zero. Never put the token on the command line. The importer checks the verified project ID, uses deterministic recipe and tag IDs, uploads an image only when its SHA-1 is absent, and uses `createIfNotExists` so a rerun does not replace editor changes. Verification compares recipe text, quantities, list order and keys, slugs, tags, image alternative text, and the uploaded asset SHA-1 against the source file.

Imported recipes are **drafts** and legacy tags start unapproved. An administrator must review tag labels and approve them before publishing recipes. This keeps unchecked legacy tags from bypassing Studio's publication validation. After approval, use the local Studio to review all 11 images, links, and copy, then publish in development for reader tests. There is no production import in Tasks 2–5.

The nonsecret local dry-run report is in `docs/recipes-import-dry-run.json`. A real development parity report must replace or accompany it only after a successful authenticated import and verify run.
