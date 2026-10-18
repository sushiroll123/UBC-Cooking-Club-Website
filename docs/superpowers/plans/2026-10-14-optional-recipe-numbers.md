# Optional recipe numbers implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task.

**Goal:** Keep valid published recipes visible when Sanity projects unset optional numbers as `null`.

**Architecture:** Accept `null` and `undefined` only for the three optional numeric fields at the publication boundary. Normalize those empty values to `undefined` in the public reader; keep supplied numbers under the existing positive integer rule.

**Tech Stack:** TypeScript, Vitest, Next.js, Sanity GROQ.

**Spec:** User's confirmed bug report, 2026-10-14.

## Constraints

- Preserve image, approved-tag, and required-field validation.
- Do not alter recipe content, push, merge, or deploy.

## Task 1: Reproduce and fix published optional numbers

**Files:** `tests/recipes/contracts.test.ts`, `tests/recipes/repository.test.ts`, `src/lib/recipes/validation.ts`, `src/lib/recipes/sanity.ts`.

- [x] Add a complete GROQ-shaped fixture with `null` optional numbers and failing assertions for listing and detail readers.
- [x] Add positive and invalid numeric cases for each optional field, plus the direct publication contract.
- [x] Run focused tests and confirm the new missing-value cases fail for the reported reason.
- [x] Accept `null` and `undefined` in validation and normalize them to `undefined` in the projected `Recipe`.
- [x] Run focused tests, full tests, typecheck, lint, build, and local HTTP checks for Chicken Piccata listing and detail.
- [x] Record outcomes in `docs/superpowers/recipes/progress.md` and commit locally.
