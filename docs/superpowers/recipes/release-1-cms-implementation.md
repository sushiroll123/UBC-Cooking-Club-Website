# Release 1: CMS migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task, according to the user's chosen execution method. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let administrators manage the existing 11 recipes in Sanity while preserving the website's design, content, and URLs.

**Architecture:** Keep Next.js and Chakra UI. Put published-content access behind a server-only adapter and deploy Sanity Studio independently. Import into the development dataset first, then production; switch public reads only after verifying the import.

**Tech Stack:** Existing Next.js 15, React 18, TypeScript, Chakra UI, Zod; compatible Sanity client/image/webhook packages; standalone Sanity Studio; Vitest, Playwright, and tsx for testing/import commands.

**Spec:** [Accepted design](community-recipes-plan.md). Read the [worktree/version-control guide](implementation-guide.md) before executing.

## Global Constraints

- Keep the current website and existing recipe links working.
- Move recipes out of manually maintained source files into Sanity.
- Require a valid image and approved tags before publishing through the CMS.
- Vercel is the confirmed host; keep test and production data separate.
- Preserve all 11 existing recipe slugs, content ordering, and quantities. Do not invent missing servings or times.
- Preserve React 18 compatibility in the website. Select and lock compatible packages; do not automatically install every dependency's latest major.
- Retain the static data for deliberate rollback; do not silently return old static recipes on every CMS error.
- Work on the prerequisite branch first, then `feat/recipes-cms` from updated `origin/main`. Nothing here has been executed yet.
- File paths below are relative to the active website worktree, not this planning folder.

## Review Focus

- Provider errors may contain authorization headers: task 1 verifies no secret is returned or logged.
- An unknown recipe differs from a CMS outage: tasks 1 and 4 test 404 versus service failure.
- Re-running an import must not overwrite an administrator's edit: task 3 tests edited records and duplicate IDs.
- Empty image objects and retired tags can look valid to superficial checks: task 2 tests actual asset references and approval separately from availability for new submissions.
- A removed recipe can linger in several caches: task 5 verifies detail, list, and direct URL invalidation, with a five-minute fallback.

## File boundaries

| Files | Responsibility |
|---|---|
| Existing API routes and recipe detail page | Targeted baseline fixes |
| `src/lib/recipes/types.ts`, `static.ts`, `sanity.ts`, `repository.ts` | Shared display types and interchangeable server-only readers |
| `src/lib/sanity/client.ts`, `image.ts` | Environment validation, published client, image URLs |
| `studio/package.json`, `studio/sanity.config.ts`, `studio/sanity.cli.ts`, `studio/schemaTypes/{recipe,tag,index}.ts` | Independently installed/built CMS editor |
| `scripts/recipes/{import,verify}.ts` | Explicit import and parity verification |
| Existing menu pages and cards | Render the reader's results |
| `src/app/api/sanity/revalidate/route.ts` | Verified publish/update/unpublish notifications |
| `tests/recipes/`, `tests/api/`, `tests/e2e/` | Boundary and behavior checks |

## Task 1 — Prerequisite fixes and repeatable checks

**Branch:** `fix/recipe-foundation`; separate PR before the CMS feature.

**Files:** Modify `src/app/api/newsletter/route.ts`, `src/app/api/email/route.ts`, `src/app/menu/[id]/page.tsx`, `package.json`, `package-lock.json`, `.eslintrc.json`, `.gitignore`. Create `vitest.config.ts`, `playwright.config.ts`, 
`tests/api/newsletter.test.ts`, `tests/api/email.test.ts`, `tests/e2e/recipe-routes.spec.ts`, `.github/workflows/ci.yml`.

**Interfaces:** Existing POST routes keep their successful response behavior; malformed JSON/fields return 400, upstream failures return a generic 502. Recipe route retains `/menu/[id]` and returns 404 only for absent IDs.

- [ ] Record current build/lint results, runtime, dependency versions, and the known route/error failures before edits. Inspect inherited repository instructions in the actual worktree.
- [ ] Add compatible Vitest/Playwright tooling and scripts: `test` = `vitest run`, `typecheck` = `tsc --noEmit`, `test:e2e` = `playwright test`. Ensure Vitest excludes browser tests. Use a production build/start for the browser suite.
- [ ] Add failing assertions, using mocked providers with fake credentials only:

```ts
expect(malformedResponse.status).toBe(400);
expect(providerFailure.status).toBe(502);
expect(await providerFailure.text()).not.toContain("fake-private-key");
expect(serializedCapturedLogs).not.toContain("fake-private-key");
expect(unknownRecipeResponse.status()).toBe(404);
```

- [ ] Run `npm test -- tests/api` and the route browser test; confirm failures demonstrate the current bugs.
- [ ] Move JSON parsing/validation into controlled error handling; stop serializing provider error objects. Generate static parameters with `{ id: post.id }` and use Next.js `notFound()` for absent recipes. Do not broaden this into a contact-page redesign.
- [ ] Resolve the existing Next.js/ESLint configuration mismatch with versions compatible with the installed framework. Add CI for install, typecheck, lint, unit tests, build, and the focused browser suite. Providers must be mocked in tests; builds receive no production credentials.
- [ ] Verify all checks pass; commit coherent fixes separately from setup where review benefits. Push, obtain review, merge, and verify the prerequisite deployment. If earlier deployed responses may have exposed a real key, have its owner rotate it and redeploy the corrected route.

## Task 2 — CMS schemas and the public recipe contract

**Files:** Create `src/lib/recipes/types.ts`, `src/lib/recipes/validation.ts`, `src/lib/sanity/client.ts`, `src/lib/sanity/image.ts`, `.env.example`, `studio/package.json`, `studio/package-lock.json`, `studio/tsconfig.json`, `studio/sanity.config.ts`, `studio/sanity.cli.ts`, `studio/schemaTypes/recipe.ts`, `studio/schemaTypes/tag.ts`, `studio/schemaTypes/index.ts`, `tests/recipes/contracts.test.ts`. Modify root `tsconfig.json`, `.gitignore`, CI.

**Interfaces:** `Recipe` has `id`, `slug`, `title`, `description`, `ingredients: string[]`, `steps: string[]`, `image: {url: string; alt: string}`, `tags: {id: string; label: string}[]`, `source: 'club'|'community'`, optional `authorName`, `servings`, `prepMinutes`, `cookMinutes`, and internal `sortOrder: number`. `makePublishedClient()` creates a tokenless published-perspective reader. `recipeImageUrl(image, width, height): string` respects crop/hotspot.

Studio recipe fields mirror the content contract, with an image asset reference, tag references, unique slug, and ordered string lists. Tag fields are `label`, `category`, `approved: boolean`, and `availableForSubmissions: boolean`. Approval and availability are distinct; hiding an approved tag from new submissions must not invalidate an older recipe.

- [ ] Add fixture tests for the public contract and Studio validation behavior:

```ts
expect(validatePublishable(noAssetRecipe, resolvedReferences).ok).toBe(false);
expect(validatePublishable(unapprovedTagRecipe, resolvedReferences).ok).toBe(false);
expect(validatePublishable(approvedButRetiredTagRecipe, resolvedReferences).ok).toBe(true);
```

Implement `validatePublishable(recipe: unknown, resolvedAssetsAndTags: ResolvedReferences): ValidationResult` in `src/lib/recipes/validation.ts`; define `ResolvedReferences` and `ValidationResult = {ok: true} | {ok: false; errors: string[]}` there. Resolve references explicitly for server/import validation; wire equivalent asynchronous Studio errors with fixture parity checks. No unresolved asset counts as valid.

- [ ] Run `npm test -- tests/recipes/contracts.test.ts` to establish the failing behavior.
- [ ] Implement schemas and contract. Preserve imported text lengths initially; strict new-submission limits belong to Release 2. Require meaningful alt text before final editorial sign-off.
- [ ] Keep Studio's dependencies and lockfile separate. Define Studio scripts `typecheck` = `tsc --noEmit`, `build` = `sanity build`, and `deploy` = `sanity deploy`. Exclude `studio` from root TypeScript compilation and lint traversal; ignore `studio/node_modules`, Studio build output, secret environment files, and test artifacts. Build/check Studio separately in CI.
- [ ] Configure a development dataset and editor using the existing Sanity organization/project once project access is available. Do not modify production content in this task.
- [ ] Run contract tests, root typecheck/build, `npm --prefix studio run typecheck`, and `npm --prefix studio run build`. Verify missing image/tags block publication in the development Studio. Commit `feat: define recipe CMS schemas and content contract`.

## Task 3 — Repeatable import with parity reporting

**Files:** Create `scripts/recipes/import.ts`, `scripts/recipes/verify.ts`, `scripts/recipes/legacy.ts`, `tests/recipes/import.test.ts`, `docs/recipes-migration.md`. Read `src/data/menu.ts` and `public/menu/workshops/`; modify package scripts only to expose commands.

**Interfaces:** `readLegacyRecipes(): LegacyRecipe[]` reads the 11 source recipes; define the legacy type in `scripts/recipes/legacy.ts`. `importRecipes({dataset, dryRun}: ImportOptions): Promise<ImportReport>` creates deterministic IDs `recipe-<legacy-id>` and slugs equal to legacy IDs. `verifyImport({dataset}): Promise<ParityReport>` compares every content field, order, slug, and image mapping; CLI exits nonzero for differences. Define these report/option types in their owning script modules and guard CLI execution on import.

- [ ] Write import tests against a fake asset/document client:

```ts
expect(report.recipeCount).toBe(11);
expect(secondRun.createdRecipes).toBe(0);
expect(afterRerun.editedTitle).toBe(beforeRerun.editedTitle);
expect(dryRunClient.writeCalls).toHaveLength(0);
expect(importedRecipe.slug).toBe(legacyRecipe.id);
expect(importedRecipe.steps).toEqual(legacyRecipe.steps);
```

- [ ] Run `npm test -- tests/recipes/import.test.ts` and confirm the failing cases.
- [ ] Implement stable recipe/tag IDs, repeat-safe image lookup/upload, dry run, and explicit reporting. Use create-if-absent rather than blindly replacing existing documents. Preserve existing ordering with `sortOrder`; review each legacy tag with the team before marking approved. Missing time/servings stays absent.
- [ ] Add commands `recipes:import` and `recipes:verify` using tsx. Default import to dry run; require `--apply --dataset <name>` to write. Production additionally requires `--confirm-production`. Read a dedicated `SANITY_IMPORT_TOKEN`; never echo it. Do not import during a Vercel build.
- [ ] Run the dry run, then apply to `development`, then verify, then rerun to prove zero duplicate recipe creation. The verifier must compare uploaded image mapping to the expected source hash, not only count assets.
- [ ] Run unit tests, save a nonsecret parity report, document the commands, and commit `feat: add repeatable recipe import and verification`.

## Task 4 — CMS reader and unchanged recipe presentation

**Files:** Create `src/lib/recipes/static.ts`, `sanity.ts`, `repository.ts`, `tests/recipes/repository.test.ts`, `src/app/menu/error.tsx`. Modify `src/components/menu/Recipes.tsx`, `src/app/menu/page.tsx`, `src/app/menu/[id]/page.tsx`, `src/components/Image.tsx` if required, and `next.config.mjs`.

**Interfaces:** `listPublishedRecipes(): Promise<Recipe[]>`, `getPublishedRecipe(slug: string): Promise<Recipe|null>` exported by `repository.ts`. Static and Sanity implementations return the same display contract. `Recipes({recipes}: {recipes: Recipe[]})` renders supplied data; pages load it on the server. Source selection comes from `RECIPE_SOURCE`, default `static` during migration; reject unknown configured values.

- [ ] Add tests:

```ts
expect(await getPublishedRecipe("missing")).toBeNull();
await expect(readWithUnavailableCms()).rejects.toThrow();
expect(publicResults.some(r => r.id.startsWith("drafts."))).toBe(false);
expect(publicRecipe).not.toHaveProperty("email");
expect(staticSlugs).toEqual(sanitySlugs);
```

- [ ] Run `npm test -- tests/recipes/repository.test.ts` to verify failing behavior.
- [ ] Implement a server-only reader with published perspective and explicit field projections. Return null for missing content and throw controlled errors for provider failure; render a retry state for an outage. No fallback that resurrects unpublished recipes.
- [ ] Reuse the existing cards, styles, detail layout, and URLs; correct image alt text. Allow only Sanity's required CDN project/dataset image path in Next image configuration. Honor crop/hotspot in generated URLs.
- [ ] Run tests/build, compare all 11 detail pages and cards in a Vercel preview against the original, and check mobile sizing. Commit `feat: render published recipes from Sanity`.

## Task 5 — Publication refresh and bounded stale content

**Files:** Create `src/app/api/sanity/revalidate/route.ts`, `tests/api/revalidate.test.ts`, `tests/e2e/cms-recipes.spec.ts`; modify the Sanity reader caching and migration runbook.

**Interfaces:** POST webhook validates the raw body signature with `SANITY_REVALIDATE_SECRET`, then invalidates shared tag `recipes` and affected recipe/list paths. Reject invalid signatures with 401 and malformed bodies with 400. Public reads use the framework API supported by the installed Next.js version, with `revalidate: 300` and tag `recipes`.

- [ ] Add tests for invalid signatures, edited slugs, deleted/unpublished recipes, and duplicate notifications:

```ts
expect(invalidSignatureResponse.status).toBe(401);
expect(invalidSignatureInvalidations).toHaveLength(0);
expect(validNotificationInvalidations).toContain("recipes");
expect(oldSlugAfterRefresh.status()).toBe(404);
expect(unpublishedDetailAfterRefresh.status()).toBe(404);
```

- [ ] Run `npm test -- tests/api/revalidate.test.ts` to establish failure, then implement bounded-body signature verification and refresh. Configure published recipe/tag changes, including deletions, to notify the correct environment. Sanity webhook credentials must not appear in a public URL.
- [ ] Verify update/publish/unpublish in development: detail and cards refresh; missed notifications recover on the next read after the five-minute freshness interval. Framework revalidation may serve stale content while refreshing; document observed behavior rather than promising instant removal under an outage.
- [ ] Preview unpublished content inside authenticated Studio for this release. Do not build an unauthenticated draft-preview website route. If adding website preview later, it needs its own authenticated access design.
- [ ] Run tests/build and commit `feat: refresh recipe pages after CMS publication changes`.

## Task 6 — Release 1 acceptance and production cutover

**Files:** Update `docs/recipes-migration.md`, create `docs/recipes-operations.md`, update PR checklist. No separate product code should be needed unless acceptance uncovers a defect.

**Consumes:** Passing tasks 1–5, development parity report, production editor/environment access.
**Produces:** A verified production deployment, backup/export reference, release commit/tag, and admin runbook.

- [ ] Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, Studio typecheck/build. Confirm CI passed on the reviewed commit.
- [ ] Review every imported recipe and image, approve tag mappings, and confirm admins can edit/replace images. Verify unknown recipe 404 and controlled CMS outage behavior.
- [ ] Export production content before importing, run the production dry run, inspect its report, then execute the same importer with its explicit production confirmation. Verify all 11 recipes and assets before switching readers.
- [ ] Configure Production environment variables and its webhook. Build/deploy the standalone Studio with its production dataset configuration using `npm --prefix studio run deploy`; record its selected hosting name and URL in the operations guide. Keep the development Studio local or separately configured, visibly labeled Development. Set `RECIPE_SOURCE=sanity` only when production data is ready.
- [ ] Merge the reviewed PR; let Vercel build with Production configuration. Test live list/detail links and an approved edit/publish/unpublish cycle with a disposable test recipe, then remove the test content.
- [ ] Record the deployment and tag the verified deployed commit `recipes-cms-v1`. Give the primary admin and backup the editing/export/rollback instructions.
- [ ] Rollback if needed: restore the known working Vercel deployment and retain Sanity data/export. A build using the static source can show the original 11 recipes, but it will not show later CMS edits. Correct the forward branch before redeploying.

**Release 1 exit condition:** CMS edits work on the live site, the original recipes and links remain correct, and the team has demonstrated recovery. Start Release 2 from this merged state.
