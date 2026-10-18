import { describe, expect, it } from "vitest";
import { readLegacyRecipes } from "../../scripts/recipes/legacy";
import { importRecipes } from "../../scripts/recipes/import";
import { verifyImport } from "../../scripts/recipes/verify";
import { fakeClient } from "../helpers/import-client";

describe("legacy recipe migration", () => {
  it("reads the 11 source records and matching local images", () => {
    const recipes = readLegacyRecipes();
    expect(recipes).toHaveLength(11);
    expect(recipes[0].id).toBe("onigiriworkshop");
    expect(recipes.every(recipe => recipe.imageSha1.length === 40)).toBe(true);
  });

  it("dry runs without changing documents or assets", async () => {
    const fake = fakeClient();
    const report = await importRecipes({ dataset: "development", dryRun: true, client: fake.client });
    expect(report.recipeCount).toBe(11);
    expect(fake.writeCalls).toEqual([]);
  });

  it("creates deterministic drafts once and preserves later editor changes", async () => {
    const fake = fakeClient();
    const first = await importRecipes({ dataset: "development", dryRun: false, client: fake.client });
    expect(first.createdRecipes).toBe(11);
    const legacy = readLegacyRecipes()[0];
    const document = fake.documents.get(`drafts.recipe-${legacy.id}`)!;
    expect((document.slug as { _type?: string })._type).toBe("slug");
    for (const field of ["ingredients", "steps"] as const) {
      const memberType = field === "ingredients" ? "ingredientsItem" : "stepsItem";
      expect((document[field] as { _type?: string }[]).every(item => item._type === memberType)).toBe(true);
    }
    expect((document.image as { _type?: string; asset: { _type?: string } })._type).toBe("image");
    expect((document.image as { asset: { _type?: string } }).asset._type).toBe("reference");
    expect((document.tags as { _type?: string }[]).every(tag => tag._type === "reference")).toBe(true);
    expect((document.slug as { current: string }).current).toBe(legacy.id);
    expect((document.steps as { text: string }[]).map(step => step.text)).toEqual(legacy.steps);
    expect(document).not.toHaveProperty("servings");
    expect(document).not.toHaveProperty("prepMinutes");
    document.title = "Editor changed title";
    const second = await importRecipes({ dataset: "development", dryRun: false, client: fake.client });
    expect(second.createdRecipes).toBe(0);
    expect(second.uploadedImages).toBe(0);
    expect(fake.documents.get(`drafts.recipe-${legacy.id}`)?.title).toBe("Editor changed title");
  });

  it("detects text and image hash differences", async () => {
    const fake = fakeClient();
    await importRecipes({ dataset: "development", dryRun: false, client: fake.client });
    expect((await verifyImport({ dataset: "development", client: fake.client })).differences).toEqual([]);
    const legacy = readLegacyRecipes()[0];
    fake.documents.get(`drafts.recipe-${legacy.id}`)!.description = "changed";
    expect((await verifyImport({ dataset: "development", client: fake.client })).differences).toContain(`${legacy.id}: description differs`);
    fake.documents.get(`drafts.recipe-${legacy.id}`)!.description = legacy.description;
    fake.assets.get(legacy.imageSha1)!.sha1hash = "wrong";
    expect((await verifyImport({ dataset: "development", client: fake.client })).differences).toContain(`${legacy.id}: image hash differs`);
    fake.assets.get(legacy.imageSha1)!.sha1hash = legacy.imageSha1;
    const document = fake.documents.get(`drafts.recipe-${legacy.id}`)!;
    (document.ingredients as { _type?: string }[])[0]._type = undefined;
    expect((await verifyImport({ dataset: "development", client: fake.client })).differences).toEqual(expect.arrayContaining([`${legacy.id}: ingredients types differs`]));
  });
});
