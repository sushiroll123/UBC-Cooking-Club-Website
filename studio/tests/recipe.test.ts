import { describe, expect, it } from "vitest";
import { recipe, validateStudioRecipe } from "../schemaTypes/recipe";
import { importRecipes } from "../../scripts/recipes/import";
import { readLegacyRecipes } from "../../scripts/recipes/legacy";
import { fakeClient } from "../../tests/helpers/import-client";

const base = {
  _type: "recipe",
  slug: { current: "onigiriworkshop" },
  title: "Onigiri Workshop",
  description: "Rice balls",
  ingredients: [{ _key: "i1", text: "1 kg rice" }],
  steps: [{ _key: "s1", text: "Cook rice" }],
  image: { asset: { _ref: "image-good-100x100-webp" }, alt: "Onigiri on a plate" },
  tags: [{ _ref: "tag-japanese" }],
  source: "club",
  sortOrder: 0,
};

describe("Studio publication integration", () => {
  it("resolves assets and tags before accepting a recipe", async () => {
    const client = { fetch: async () => [
      { _id: "image-good-100x100-webp", mimeType: "image/webp" },
      { _id: "tag-japanese", approved: true, availableForSubmissions: false },
    ] };
    expect(await validateStudioRecipe(base, client)).toBe(true);
    expect(await validateStudioRecipe({ ...base, image: { alt: "Onigiri" } }, client)).not.toBe(true);
    expect(await validateStudioRecipe(base, { fetch: async () => [{ _id: "tag-japanese", approved: true }] })).not.toBe(true);
    expect(await validateStudioRecipe(base, { fetch: async () => [
      { _id: "image-good-100x100-webp", mimeType: "image/webp" },
      { _id: "tag-japanese", approved: false },
    ] })).not.toBe(true);
  });

  it("imports ordered content using the Studio's declared object types", async () => {
    const fake = fakeClient();
    await importRecipes({ dataset: "development", dryRun: false, client: fake.client });
    const legacy = readLegacyRecipes()[0];
    const document = fake.documents.get(`drafts.recipe-${legacy.id}`)!;
    const fields = recipe.fields as unknown as { name: string; of?: { name?: string; type: string }[] }[];
    for (const field of ["ingredients", "steps"] as const) {
      const memberType = fields.find(item => item.name === field)?.of?.[0].name;
      expect(memberType).toBeDefined();
      expect((document[field] as { _type?: string }[]).every(item => item._type === memberType)).toBe(true);
    }
  });
});
