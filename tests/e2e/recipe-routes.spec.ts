import { expect, test } from "@playwright/test";

test("a published legacy recipe keeps its direct URL", async ({ page }) => {
  const response = await page.goto("/menu/onigiriworkshop");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Onigiri Workshop" })).toBeVisible();
});

test("an unknown recipe returns 404", async ({ page }) => {
  const response = await page.goto("/menu/recipe-that-does-not-exist");
  expect(response?.status()).toBe(404);
});
