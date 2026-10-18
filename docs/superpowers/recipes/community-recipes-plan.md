# Community recipes and Sanity migration

Design accepted for implementation planning · October 11, 2026 · UBC Cooking Club website

## Recommendation

Use **Sanity Studio as the editing interface and Sanity Content Lake as the recipe database**. Keep the existing Next.js website and recipe-card design. Deliver this in two releases: migrate the existing recipes first, then introduce community submissions and discovery.

This is practical for the project’s size. The migration is fairly small; reliable anonymous submissions require more work than the data transfer itself. There is no need for an additional SQL database or an AI service for this feature.

This document describes the proposed product, architecture, migration, and release checks. It is for review before coding, not a claim that the feature or external services have been configured.

## 1. What we are building

Visitors can submit a recipe without creating an account, including a required photo. Their unfinished work is saved on their device. Submission sends the recipe to a private review queue. The team reviews it, and a trusted administrator edits and publishes it through Sanity. Published community recipes appear on the website and can be found using search and approved tags.

Confirmed requirements:

- Keep the current website and existing recipe links working.
- Move recipes out of manually maintained source files into Sanity.
- Allow one or a few trusted administrators; contributors need no account.
- Save unfinished submissions locally, including the selected photo.
- Require a photo; allow administrators to replace it and adjust its crop.
- Require a valid image and approved tags before publishing through the CMS.
- Protect the public submission endpoint against spam and excessive storage use.
- Keep unpublished recipe text private. Uploaded photos may be accessible through their direct image URL before publication; this trade-off has been accepted.
- Allow an optional private email so the team can request changes; no contributor account is required.

Proposed first-version defaults, open to revision:

- One unfinished recipe per browser, restored when the visitor returns.
- An optional public display name, plus a separate optional private email. Team follow-up is manual; no automated notification system initially.
- After submission, show a receipt and explain that the team will review it. Contributors cannot edit the hosted submission themselves.
- One required photo per recipe.
- Search recipe titles and filter by approved tags and recipe source: All, Club, Community.
- No accounts, ratings, comments, voice assistant, automatic AI moderation, or recipe recommendation engine in this release.

## 2. Why this stack

| Component | Purpose | Recommendation |
|---|---|---|
| Existing Next.js, React, TypeScript | Website and server endpoints | Keep |
| Existing Chakra UI | Forms, recipe cards, visual consistency | Reuse |
| Existing React Hook Form and Zod | Form handling and validation | Reuse; validate again on the server |
| Sanity Studio | Admin editing and review | Add as a separately deployed editor |
| Sanity Content Lake and image assets | Store recipes, tags, and photos | Use as the content backend |
| Browser IndexedDB | Save draft text and photo on the visitor’s device | Add |
| Existing hCaptcha package | Challenge suspicious submissions | Activate and verify on the server |
| Upstash Redis | Shared submission counters and retry protection | Add for the public-submission release |
| Server image processing | Decode, resize, normalize orientation, remove photo metadata | Use a compatible image library, such as sharp |

The current project uses Next.js 15 and React 18. Check integration package requirements before installation. A standalone Studio lets the editor have its own dependencies without forcing an unrelated website upgrade.

The alternatives are keeping file-based recipes and asking developers to merge every submission, or using a database such as Supabase and building our own admin interface. The first retains the manual bottleneck; the second adds admin-interface work that Sanity already addresses. Sanity fits the team’s current editorial workflow.

Redis is a small supporting service for abuse control, not a second recipe database. Its counters work across server instances; ordinary in-memory counters would reset or disagree between instances. [Upstash rate-limit features](https://upstash.com/docs/redis/sdks/ratelimit-ts/features)

## 3. Contributor experience

1. Open **Submit a Recipe** from the recipes page.
2. Enter a title, description, ingredients, and ordered instructions; choose approved tags and add a photo. Servings and preparation/cooking times are optional. Separately offer an optional public display name and optional private contact email, clearly explaining which one can appear publicly.
3. See the photo preview and a clear local-save indicator. Leaving and returning to the same browser restores the unfinished recipe.
4. Preview the recipe and confirm permission to share the supplied content/photo.
5. Submit. The website performs spam, content, and image checks, then creates a pending draft.
6. Receive a confirmation reference. Preserve the local copy for recovery, mark it submitted, and offer an explicit action to start another recipe.

Local saving is a convenience, not a backup guarantee: clearing browser storage, private browsing, or moving to another device can lose the draft. Use IndexedDB for photo blobs rather than putting images in localStorage. If local saving fails, keep the form usable, show that failure, and do not display a false “Saved” message. [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), [browser storage limits](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

On a failed submission, retain the draft and give a specific message: fix a field, choose another image, complete a new captcha, or retry later. A retry after a network interruption must return the original receipt if the submission already succeeded, rather than creating another recipe.

## 4. Photo handling

Support JPEG, PNG, and WebP initially. Resize/compress the photo on the device before sending it, then independently inspect and normalize it on the server. Validate the actual decoded image, not just its filename or the browser’s reported file type. Apply byte and pixel-count limits, strip embedded location metadata, and reject animation or unsupported content.

Proposed limits: one processed photo up to 2 MiB and a complete submission request up to 3 MiB. Bound incoming text and request size before expensive decoding. The implementation must enforce limits while reading the request, not after loading an arbitrarily large body.

Hosting is confirmed as Vercel. Vercel Functions currently have a 4.5 MB request-body limit, so use the bounded, compressed-photo upload described above rather than sending an unrestricted original phone photo through a function. Confirm the project's runtime and processing limits during setup. [Vercel limits](https://vercel.com/docs/functions/limitations)

Test real iPhone and Android photo selection. HEIC support is a compatibility checkpoint: either verified conversion works in the selected pipeline, or the form clearly asks for JPEG/PNG/WebP and preserves the rest of the draft. Do not advertise support that has only been tested with desktop sample images.

Admins use Sanity’s native image field to replace photos and select crop/hotspot. “Edit photo” in this version means replacement and crop/focal-point adjustment, not a full photo editor. Include editable alternative text. [Sanity image fields](https://www.sanity.io/docs/studio/image-type)

## 5. Content and moderation model

| Record | Information |
|---|---|
| Recipe | Stable ID, URL slug, title, description, ingredients, ordered steps, image and alternative text, approved tag references, Club/Community source, optional public credit, optional servings/times |
| Tag | Stable ID, label, category, whether offered for new submissions |
| Private review metadata | Submission reference/time, pending or rejected status, optional contact email, internal notes, and retention information |

Use plain structured ingredient and step lists initially, matching the existing data. Preserve list ordering and stable item keys. This also leaves a sensible foundation for a later step-by-step voice feature.

Store submitted recipes as Sanity drafts, not ordinary public documents with only a `pending` flag. Production queries use the published perspective. Review metadata belongs in authenticated-only documents and must never be copied into published recipes. Hiding a field in the website’s query is not privacy protection for a public dataset. [Sanity drafts](https://www.sanity.io/docs/content-lake/drafts-and-versions), [document-ID access rules](https://www.sanity.io/docs/content-lake/ids)

Studio should provide simple views for **Pending**, **Published Club Recipes**, **Published Community Recipes**, **Rejected**, and **Tags**. The administrator can preview, edit, replace the image, select approved tags, publish, reject, or unpublish. Team discussion can happen through the team’s existing communication process.

If an email was supplied, the administrator can manually request corrections and apply them in Studio. Email is for this submission only, never automatic newsletter enrollment. Validate its format but do not treat an unverified address as proof of identity. Do not automatically email every submitted address. Proposed retention: remove contact email and correspondence notes 30 days after a decision, or 90 days after submission, whichever comes first. Public recipe content and optional public credit remain. Mention this use and retention beside the field.

Publishing through Studio must be blocked unless required text is present, the image reference resolves to a valid supported asset, and all selected tags are approved. Only trusted administrators create or approve new tags. Retiring a tag from new submissions should not silently break already published recipes; changing existing assignments is an explicit editorial action.

Studio validation does not enforce rules on API writes. Therefore the submission endpoint and migration importer also validate their inputs independently. The public endpoint always creates drafts and ignores any caller-supplied publish status, document type, or privileged identifier. Trusted administrator credentials remain powerful; this design protects the public contribution path rather than claiming that an administrator cannot bypass their own CMS. [Sanity validation](https://www.sanity.io/docs/studio/validation)

## 6. Spam protection and cost controls

Use several layers; a captcha alone cannot guarantee protection:

- Verify hCaptcha tokens on the server, including the expected site configuration. Browser success alone is insufficient. [hCaptcha documentation](https://docs.hcaptcha.com/)
- Apply shared rate limits to trusted network identifiers and an anonymous browser identifier. A browser cookie can be reset, so it is only an additional signal. Allow for multiple students sharing a campus network.
- Enforce a site-wide daily upload-attempt budget and a maximum review backlog. Count work that consumes resources, including failed upload attempts.
- Reserve quotas atomically so simultaneous requests cannot all pass a count-then-write check.
- Reject oversized bodies, excessively long fields, unsupported images, and unapproved tag IDs before storing content.
- Keep Sanity write credentials on the server. Never place them in client bundles or public environment variables.
- If the shared limiter or captcha verification is unavailable, pause new writes and let the visitor keep their draft and retry.
- Give administrators a switch to temporarily close submissions without disabling recipe browsing.
- Track aggregate submission counts, failures, storage use, and queue size. Avoid logging recipe bodies, secrets, or unnecessary personal data.

Suggested pilot settings: 3 successful submissions per browser per day, 30 attempts per network address per hour, 100 upload attempts across the site per day, and at most 200 pending recipes. These are adjustable operational defaults, not identity guarantees or traffic estimates. Review false positives during the club pilot.

Use an expiring, durable submission receipt/lock so double-clicks and retries cannot create duplicate drafts or recreate a draft after it has been published. A reused receipt with changed content must be rejected rather than overwriting an earlier submission. A retry must not bypass abuse limits.

Proposed retention: delete rejected submissions after 30 days. Clean up abandoned uploads after a safe grace period, checking that no document references the asset and that no upload is still active. Photos may be deduplicated or shared, so never delete an asset solely because one recipe was rejected. Start with a documented admin-run cleanup task; automate after hosting is confirmed. [Sanity asset management](https://www.sanity.io/docs/content-lake/manage-assets)

These measures bound normal abuse and storage growth. They do not promise protection from every distributed attack; hosting-level traffic controls and usage monitoring remain part of operation.

## 7. Public browsing and search

Keep existing recipe cards and `/menu/<existing-id>` URLs. Add a clearly labeled **Recipes by the Community** area and a source filter for All, Club, and Community.

First-version search matches recipe titles without case sensitivity. Selecting multiple tags requires a recipe to contain all selected tags; combine that with the text query and source filter. Display active filters, a Clear action, and a useful empty state. Store filters in the URL so links can be shared.

Query published content only, return a bounded page of results, and use a stable sort. A proposed page size is 24. No separate search service is necessary at this stage; Sanity queries can support these filters. [Sanity queries](https://www.sanity.io/docs/content-lake/how-queries-work)

Cache public recipe data and refresh it after publishing, editing, or unpublishing through a verified webhook. Include a bounded freshness fallback if delivery fails. Draft previews require administrator authentication and must not enter the public cache. Verify that unpublished recipes disappear from cards, search, and direct recipe URLs. [Next.js caching with Sanity](https://www.sanity.io/docs/nextjs/caching-and-revalidation-in-nextjs)

## 8. Migration and delivery sequence

### Phase 0 — Establish a safe baseline

- Confirm the Vercel project owner, production branch, and preview environment settings.
- Work on a feature branch in an isolated checkout; use a pull request and preview deployment for review.
- Record current build/lint behavior and representative desktop/mobile pages.
- Address the known newsletter error-response credential leak before introducing more secret-backed endpoints. Correct malformed-request handling without copying the existing error pattern into submissions.
- Correct recipe-route handling: unknown IDs should return 404, and generated static parameters must use the route’s `id` parameter.
- Establish focused build and feature checks in CI; avoid bundling unrelated redesigns or upgrades.

### Phase 1 — Define Sanity and import into a test dataset

- Configure recipe/tag schemas and the editor, with separate test and production environments.
- Add a small recipe-access layer so pages do not depend directly on Sanity response shapes.
- Create an importer for the 11 recipes in `src/data/menu.ts` and their matching images in `public/menu/workshops/`.
- Preserve existing IDs as URL slugs, ingredient wording, step ordering, and workshop-scale quantities. Leave missing servings/times empty.
- Import tags for review; do not invent dietary claims or silently relabel existing recipes.
- Use deterministic IDs and a recorded image mapping. A rerun must skip or safely reconcile imported records without duplicating recipes or overwriting subsequent editor changes.
- Provide a dry run and verify counts, content, links, photos, and tag mappings against the source files.

### Phase 2 — Release CMS-managed club recipes

- Connect listing/detail pages to published Sanity data through the access layer.
- Configure remote images, caching, refresh hooks, and graceful loading/error states.
- Have the team review all 11 recipes in preview, including existing links and mobile appearance.
- Export a backup, repeat the verified migration into production, then release the reader change.
- Keep the original data and a known working release available for rollback until the migration is accepted.

**Release 1 is complete when administrators can edit recipes in Sanity and the existing website reliably reflects publication changes without a code change.**

### Phase 3 — Add community contributions

- Build the mobile-friendly form, preview, local draft recovery, and required-photo flow.
- Add the protected upload/submission endpoint, shared limits, retry protection, and private draft creation.
- Configure the review queue and publishing checks.
- Add community browsing, title search, approved-tag filters, and pagination.
- Document moderation, cleanup, exports, quota settings, and the submission-off switch.

### Phase 4 — Pilot, then public launch

- Enable submissions for a small club pilot first.
- Test real phone photos and weak-network retries; tune limits for shared campus networks.
- Have an administrator run the complete review/edit/publish/reject/unpublish workflow.
- Confirm the launch checks below, monitor initial usage, then expose submission links publicly.

**Release 2 is complete when a visitor can submit without an account, the team can safely review it, and only approved content appears publicly.**

## 9. Required launch checks

| Area | Evidence needed |
|---|---|
| Migration | All 11 recipes, images, ingredient/step ordering, and existing URLs match; a second import produces no duplicates |
| Visibility | Anonymous readers cannot retrieve draft text, private email, or review notes; public queries and caches exclude pending/rejected recipes, and publishing never copies private fields into public records |
| Publishing | Missing/broken image or unapproved tags blocks Studio publishing; direct submission requests cannot publish |
| Uploads | Oversized, forged-type, malformed, and excessive-pixel images are rejected; supported phone images retain correct orientation and lose embedded location metadata |
| Abuse controls | Concurrent requests respect shared caps; service failures stop writes; secret values do not appear in responses or browser code |
| Reliability | Double-submit and interrupted-response retries produce one recipe; partial upload failures are recoverable and cleanable |
| Local drafts | Text and photo survive reload in the same browser; unavailable storage is clearly reported |
| Browsing | Search/filter combinations, Clear, empty results, pagination, direct links, keyboard use, and mobile layouts work |
| CMS updates | Publish/edit/unpublish correctly refreshes listings and detail pages without exposing draft previews |
| Operations | An administrator can pause submissions, review usage, export content, and perform cleanup |

Prioritize integration tests for the submission and moderation boundaries, plus a small browser test covering the complete visitor-to-admin workflow. Add manual real-device checks for photo and storage behavior.

## 10. Rollback, effort, and future growth

Roll out the content migration separately from public submissions. If submissions misbehave, disable them while keeping published recipes available. If the CMS reader needs rollback, restore the earlier site release and its original recipes; retain exports of any newly published community recipes, which that older static release will not display.

The existing 11-recipe migration is the low-complexity portion. The anonymous submission endpoint, photo handling, and moderation checks are the medium-complexity portion and deserve most testing. Estimate delivery after a working local baseline and verification of Vercel settings rather than promising a weekend implementation now.

Start with the smallest suitable service plans and verify current quotas before launch. Do not assume the whole system remains free as usage increases. The main growth controls are resized images, cached/paginated reads, bounded writes, and cleanup. Review Sanity, hosting, and Redis usage together. [Sanity pricing](https://www.sanity.io/pricing)

Later improvements can add automated contributor notifications, status links, ingredient search, more images, or the voice cooking assistant. Keep ordered recipe steps now, but do not add AI infrastructure to this release.

## Review points

The user accepted the design for implementation planning and confirmed Vercel hosting. Remaining setup and editorial details:

1. **Hosting:** Vercel confirmed; verify the actual production branch, preview settings, and project ownership.
2. **Contributor contact:** optional private email is confirmed. Review the proposed deletion period and manual follow-up workflow.
3. **Editorial setup:** the team approves the initial tag list and names the primary administrator and backup owner.
4. **Pilot defaults:** review the proposed limits, retention, and one-draft-per-browser behavior in this document.

Implementation guidance is provided in the accompanying workflow guide and Release 1/Release 2 plans. No repository files, Sanity settings, or live content have been changed while preparing these documents.
