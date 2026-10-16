# Implementation guide: worktrees, Git, and Vercel releases

October 11, 2026 · Read this first

This is a guide to execute later. The commands below have not been run. Your existing checkout is clean on `main`; no worktrees, branches, deployments, or external settings were created for this planning task.

## Documents and release boundaries

- [Accepted product design](community-recipes-plan.md): what the feature should do.
- [Release 1 implementation plan](release-1-cms-implementation.md): safe baseline, Sanity schemas, import, CMS-backed reading, and deployment.
- [Release 2 implementation plan](release-2-community-implementation.md): submissions, photos, local drafts, abuse protection, review, search, and launch.

**Finish and verify Release 1 before starting Release 2 from the updated main branch.** Release 1 is independently useful: the team can edit existing recipes without changing code.

Use one feature branch/worktree per release initially, with small commits inside it. Make the existing credential-leak fix a separate prerequisite pull request so it can ship without waiting for the feature. Split a release further only when a part can be reviewed and merged independently; do not start with a complicated network of dependent branches.

## What the Git terms mean here

| Term | Meaning in this project |
|---|---|
| Repository | The website files and their Git history |
| `main` branch | The shared integration branch; verify that Vercel uses it for production |
| Feature branch | A separate line of commits for one change, such as `feat/recipes-cms` |
| Worktree | A second local folder checked out on a different branch, sharing the same repository history |
| `git add` | Choose which changes go into the next commit |
| `git commit` | Save a named checkpoint locally |
| `git push` | Upload branch commits to GitHub; deployment effects depend on Vercel branch settings |
| Pull request (PR) | Ask the team to review and merge your branch |
| Merge | Combine branch histories |
| Rebase | Replay your branch's commits on a newer base; this changes their commit IDs |
| Git tag | Give a particular commit a lasting release name |

A worktree separates files. **It does not isolate Sanity, Redis, email services, or Vercel credentials.** Each worktree needs its own test configuration. Each has its own installed dependencies and untracked local environment files; these are not copied automatically. [Git worktree reference](https://git-scm.com/docs/git-worktree)

## 1. Prepare the project once

- [ ] Verify Vercel's linked GitHub repository, production branch, root directory, Node runtime, install/build commands, and team owner. Keep the website's root directory unchanged.
- [ ] Where the repository plan permits, require a PR review and passing CI on `main`, and block force pushes. Otherwise adopt those as team rules.
- [ ] Ensure non-production branches produce Preview deployments in this existing Vercel project.
- [ ] Set up a Sanity `development` dataset for test content; keep `production` for live content. Use synthetic private contact information in tests.
- [ ] Scope Development and Preview configuration to test services; scope Production to live services. Separate credentials by environment; use dataset-restricted permissions where supported, or separate projects where stronger isolation is needed.
- [ ] Keep all secret files ignored. Add only a documented `.env.example` with empty/example values to Git.

Vercel provides Development, Preview, and Production environments. In the normal Git integration, a non-production branch push creates a preview and merging into the production branch triggers a production deployment. Verify the project's settings rather than assuming these defaults. [Vercel environments](https://vercel.com/docs/deployments/environments)

### Environment matrix

| Setting | Local worktree | Vercel Preview | Vercel Production |
|---|---|---|---|
| Sanity dataset | `development` | `development` | `production` |
| Redis in Release 2 | Test instance/namespace | Test instance/namespace | Separate live instance/namespace |
| hCaptcha | Development setup | Preview-compatible sitekey | Live-domain sitekey |
| Public recipe source | Static, then Sanity for testing | Sanity after test import | Sanity after production import |
| Submissions | Test as needed | Team pilot | Disabled until launch checks pass |

Environment variable changes affect new deployments; redeploy when changing them. Never promote a preview built against test data straight to the live domain. Build the approved commit with Production settings. [Vercel environment variables](https://vercel.com/docs/environment-variables)

Names planned for the website:

| Variable | Purpose |
|---|---|
| `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_VERSION` | Server-side content configuration; pin API version to `2026-10-11` |
| `RECIPE_SOURCE` | `static` or `sanity`; temporary controlled migration switch |
| `SANITY_WRITE_TOKEN` | Server-only submissions/settings access; never `NEXT_PUBLIC_` |
| `SANITY_REVALIDATE_SECRET` | Server-only webhook signature secret |
| `NEXT_PUBLIC_HCAPTCHA_SITEKEY` | Public captcha sitekey |
| `HCAPTCHA_SECRET`, `HCAPTCHA_ALLOWED_HOSTNAMES` | Server verification secret and explicit hostname list |
| `APP_ALLOWED_ORIGINS` | Explicit allowed site origins for submission requests, scoped by environment |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Shared abuse-control store |
| `SUBMISSION_SIGNING_SECRET` | Sign anonymous browser identifiers and retry tickets |
| `SUBMISSIONS_ENABLED` | Server deployment gate; defaults to false |

Use a separately supplied import token for migration commands; it need not be present in Vercel. Studio has its own nonsecret project/dataset configuration and admin sign-in. Test-build secrets in CI must never be production write credentials. Contributors' fork PRs should run mock-based checks without being granted secrets.

## 2. Start an isolated release workspace

When working in a project-attached Codex session, first inspect existing worktrees and use its native managed worktree feature for the **website repository**. Do not create a worktree for this projectless planning folder. The following is the manual terminal workflow for when you are not using a managed worktree feature.

Recommended manual location: a dedicated folder under Documents, outside the website checkout. This avoids nested worktrees being included by the project's broad TypeScript file pattern.

First inspect the checkout and fetch remote changes:

```bash
cd /Users/matthewwang/UBC-Cooking-Club-Website
git status
git worktree list
git fetch origin
```

If uncommitted work appears, leave it intact and determine its owner before changing it. Fetch updates remote-tracking references; it does not overwrite working files.

After the prerequisite fix is merged, create Release 1 from the latest remote main:

```bash
mkdir -p /Users/matthewwang/Documents/Codex/worktrees
git worktree add -b feat/recipes-cms /Users/matthewwang/Documents/Codex/worktrees/ubc-recipes-r1 origin/main
cd /Users/matthewwang/Documents/Codex/worktrees/ubc-recipes-r1
npm ci
git status
npm run build
npm run lint
```

The first checkout has no test script yet. Record baseline build/lint failures; do not call them new regressions or silently bypass them. Release 1 adds focused tests. Configure ignored `.env.local` with Development settings. Do not reuse production secrets to make the baseline pass.

Use the same pattern for the prerequisite branch `fix/recipe-foundation` and folder `ubc-recipes-foundation` before Release 1. For Release 2, only after Release 1 merges and passes production checks:

```bash
cd /Users/matthewwang/UBC-Cooking-Club-Website
git fetch origin
git worktree add -b feat/community-recipes /Users/matthewwang/Documents/Codex/worktrees/ubc-recipes-r2 origin/main
cd /Users/matthewwang/Documents/Codex/worktrees/ubc-recipes-r2
npm ci
npm --prefix studio ci
```

Do not try to check out the same branch in two worktrees. Run the website on port 3000 for one active checkout; use another port, such as `npm run dev -- --port 3001`, if running two at once.

## 3. The daily implementation loop

1. Read the current task and its tests.
2. For behavior changes, write a test demonstrating the missing behavior and run it to see the intended failure.
3. Implement the smallest change needed; rerun the relevant tests.
4. Inspect the diff and commit the finished unit.
5. Push the feature branch to update its PR and Vercel preview.

Example for the first targeted fix; execute only once these files have actually been changed:

```bash
git status
git diff
git add src/app/api/newsletter/route.ts tests/api/newsletter.test.ts
git diff --cached
git commit -m "fix: keep newsletter credentials out of error responses"
git push -u origin fix/recipe-foundation
```

Select files intentionally instead of habitually staging everything. `git diff --cached` shows exactly what will enter the commit. The first `push -u` establishes the branch's upstream; later pushes can use `git push`.

Open a draft PR against `main` early. Its description should state the behavior change, test evidence, preview link, configuration/migration steps, and rollback. Keep it draft until the release checklist passes. Never put credentials or real contributor emails in screenshots, fixtures, logs, commits, or PR text.

## 4. Bring in teammates' changes

**Default for a pushed/shared feature branch: merge the latest main into it.** This preserves existing commit IDs:

```bash
git status
git fetch origin
git merge origin/main
```

Start with a clean working tree. If Git reports conflicts, inspect and resolve each file, stage the resolution, and complete the merge commit. Run the relevant tests and full release checks before pushing again. Use `git merge --abort` to abandon an in-progress merge if needed.

Rebase is optional for a branch only you own, preferably before pushing:

```bash
git fetch origin
git rebase origin/main
```

Resolve a conflict, stage that file, then `git rebase --continue`; use `git rebase --abort` to return to the pre-rebase state. Never rebase `main` or someone else's shared work. A previously pushed rebased branch requires a coordinated history rewrite; avoid that in this beginner workflow. [Git rebase reference](https://git-scm.com/docs/git-rebase)

## 5. Review, merge, and release

- [ ] Run the release's automated checks and complete its real-device/preview checks.
- [ ] Confirm the exact PR commit is what the reviewer tested.
- [ ] Confirm production dataset migration and environment configuration are ready **before** merging a change that requires them.
- [ ] Ask a teammate to review the PR and preview. Resolve the findings.
- [ ] Merge using the team's convention; squash merge is a reasonable default for one feature PR with many working commits.
- [ ] Watch the Production deployment and smoke-test the live website.
- [ ] Record the deployed commit and Vercel deployment URL. Add a release tag only after confirming success.

Suggested tag names: `recipes-cms-v1` and `community-recipes-v1`. Create a tag against the verified deployed commit, not an assumed latest commit. A Git tag records source history; Sanity content needs a separate export.

Vercel deployment rollback restores a previous application build; it does not restore Sanity records. Existing builds also retain their deployment environment configuration. Fix the branch afterward so a future deployment does not reintroduce the problem. [Vercel rollback](https://vercel.com/docs/instant-rollback)

## 6. Clean up after a release

For manually created worktrees, first verify the PR merged, the deployment passed, and the worktree has no uncommitted or needed untracked files. Preserve anything needed—including ignored files—outside the worktree before removal.

```bash
cd /Users/matthewwang/UBC-Cooking-Club-Website
git worktree remove /Users/matthewwang/Documents/Codex/worktrees/ubc-recipes-r1
git branch -d feat/recipes-cms
```

After a squash merge, `git branch -d` may refuse because Git cannot see the original feature commits in main. Leave the branch in place until you have verified the merged PR; do not blindly force-delete it. Remove the remote branch using the merged PR's delete-branch control if the team wants it removed.

For Codex-managed worktrees, use the app's archive/remove workflow so its records remain consistent.

## Suggested implementation handoff

Start with Release 1 only. Work through tasks sequentially, keeping the PR and preview current. For this connected set of changes, direct implementation in one session with an independent final review is the simpler execution option. Per-task subagents and reviewers are an alternative if you prefer additional review at each boundary and accept the extra overhead.

Before execution, review both release plans and select direct execution or per-task subagents. This guide itself does not merge, deploy, migrate production content, or authorize external account changes.
