import { describe, expect, it } from "vitest";
import { readLegacyRecipes } from "../../scripts/recipes/legacy";
import { importRecipes, type ImportClient } from "../../scripts/recipes/import";
import { verifyImport } from "../../scripts/recipes/verify";
import { recipe as recipeSchema } from "../../studio/schemaTypes/recipe";

function fakeClient() {
  const documents = new Map<string, Record<string, unknown>>();
  const assets = new Map<string, { _id: string; sha1hash: string; mimeType: string }>();
  const writeCalls: string[] = [];
  const client: ImportClient = {
    async getDocument(id) { return documents.get(id) ?? null; },
    async createIfNotExists(doc) { writeCalls.push(doc._id); if (!documents.has(doc._id)) documents.set(doc._id, structuredClone(doc)); },
    async findAssetBySha1(hash) { return assets.get(hash) ?? null; },
    async uploadAsset(bytes, filename, hash) {
      writeCalls.push(`asset:${filename}`);
      const asset = { _id: `image-${hash}-100x100-webp`, sha1hash: hash, mimeType: "image/webp" };
      assets.set(hash, asset);
      return asset;
    },
    async getAsset(id) { return [...assets.values()].find(asset => asset._id === id) ?? null; },
    async listImportedRecipes() { return [...documents.values()].filter(doc => doc._type === "recipe"); },
    async getTags(ids) { return ids.map(id => documents.get(id)).filter((tag): tag is Record<string, unknown> => Boolean(tag)); },
  };
  return { client, documents, assets, writeCalls };
}

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
    const fields = recipeSchema.fields as unknown as { name: string; of?: { name?: string; type: string }[] }[];
    expect((document.slug as { _type?: string })._type).toBe("slug");
    for (const field of ["ingredients", "steps"] as const) {
      const memberType = fields.find(item => item.name === field)?.of?.[0].name;
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
