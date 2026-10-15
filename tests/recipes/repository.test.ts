import { describe, expect, it } from "vitest";
import { createRecipeRepository } from "@/lib/recipes/repository";
import { staticRecipeReader } from "@/lib/recipes/static";
import { createSanityRecipeReader } from "@/lib/recipes/sanity";

const raw = {
  _id: "recipe-onigiriworkshop", _type: "recipe",
  slug: { current: "onigiriworkshop" }, title: "Onigiri Workshop", description: "Rice balls",
  ingredients: [{ _key: "i1", text: "1 kg rice" }], steps: [{ _key: "s1", text: "Cook rice" }],
  image: { asset: { _ref: "image-good-100x100-webp" }, alt: "Onigiri" },
  asset: { _id: "image-good-100x100-webp", mimeType: "image/webp" },
  tags: [{ _ref: "tag-japanese" }],
  tagsResolved: [{ _id: "tag-japanese", label: "Japanese", approved: true, availableForSubmissions: false }],
  source: "club", sortOrder: 0, email: "private@example.com",
};

describe("recipe repository", () => {
  it("retains all 11 legacy URLs with the static reader", async () => {
    const recipes = await staticRecipeReader.list();
    expect(recipes).toHaveLength(11);
    expect(recipes[0].slug).toBe("onigiriworkshop");
    expect(await staticRecipeReader.get("missing")).toBeNull();
  });

  it("keeps provider failure distinct from missing content", async () => {
    const cms = { list: async () => { throw new Error("provider unavailable"); }, get: async () => null };
    const repository = createRecipeRepository("sanity", staticRecipeReader, cms);
    await expect(repository.list()).rejects.toThrow("provider unavailable");
    expect(await repository.get("missing")).toBeNull();
  });

  it("projects public fields and excludes drafts and private metadata", async () => {
    const calls: string[] = [];
    const client = { fetch: async (query: string) => { calls.push(query); return [raw, { ...raw, _id: "drafts.recipe-hidden" }]; } };
    const cms = createSanityRecipeReader(client, { projectId: "1m7uu6hy", dataset: "development" });
    const recipes = await cms.list();
    expect(recipes).toHaveLength(1);
    expect(recipes[0].slug).toBe("onigiriworkshop");
    expect(recipes[0].ingredients).toEqual(["1 kg rice"]);
    expect(recipes[0]).not.toHaveProperty("email");
    expect(calls[0]).toContain('path("drafts.**")');
  });

  it("omits a recipe with a broken tag while retaining valid published recipes", async () => {
    const broken = { ...raw, _id: "recipe-broken", tagsResolved: [null] };
    const client = { fetch: async () => [broken, raw] };
    const cms = createSanityRecipeReader(client, { projectId: "1m7uu6hy", dataset: "development" });
    expect((await cms.list()).map(recipe => recipe.slug)).toEqual(["onigiriworkshop"]);
  });

  it("rejects unknown source configuration", () => {
    expect(() => createRecipeRepository("fallback", staticRecipeReader, staticRecipeReader)).toThrow();
  });
});
