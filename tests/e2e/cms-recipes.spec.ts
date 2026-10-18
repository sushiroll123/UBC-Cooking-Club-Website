import { expect, test } from "@playwright/test";

const preview = process.env.CMS_PREVIEW_URL;
const publishedSlug = process.env.CMS_PUBLISHED_SLUG;
const unpublishedSlug = process.env.CMS_UNPUBLISHED_SLUG;

test("development preview serves a published recipe and omits an unpublished one", async ({ page }) => {
  test.skip(!preview || !publishedSlug || !unpublishedSlug, "Requires a development preview and an editorial publish/unpublish check");
  const base = new URL(preview!);
  expect(base.protocol).toBe("https:");
  const published = await page.goto(new URL(`/menu/${publishedSlug}`, base).toString());
  expect(published?.status()).toBe(200);
  const unpublished = await page.goto(new URL(`/menu/${unpublishedSlug}`, base).toString());
  expect(unpublished?.status()).toBe(404);
});
