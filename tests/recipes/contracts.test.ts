import { describe, expect, it } from "vitest";
import { validatePublishable } from "@/lib/recipes/validation";
import { makePublishedClient } from "@/lib/sanity/client";
import { recipeImageUrl } from "@/lib/sanity/image";
import { validateStudioRecipe } from "../../studio/schemaTypes/recipe";

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
const references = {
  assets: { "image-good-100x100-webp": { mimeType: "image/webp" } },
  tags: { "tag-japanese": { approved: true, availableForSubmissions: false } },
};

describe("publishable recipe contract", () => {
  it("rejects a missing or unresolved image asset", () => {
    expect(validatePublishable({ ...base, image: { alt: "Onigiri" } }, references).ok).toBe(false);
    expect(validatePublishable(base, { ...references, assets: {} }).ok).toBe(false);
  });

  it("rejects unsupported assets and unapproved tags", () => {
    expect(validatePublishable(base, { ...references, assets: { "image-good-100x100-webp": { mimeType: "image/svg+xml" } } }).ok).toBe(false);
    expect(validatePublishable(base, { ...references, tags: { "tag-japanese": { approved: false, availableForSubmissions: true } } }).ok).toBe(false);
  });

  it("allows approved tags retired from new submissions", () => {
    expect(validatePublishable(base, references)).toEqual({ ok: true });
  });

  it("accepts unset optional numbers as omitted fields or GROQ nulls", () => {
    expect(validatePublishable(base, references)).toEqual({ ok: true });
    expect(validatePublishable({ ...base, servings: null, prepMinutes: null, cookMinutes: null }, references)).toEqual({ ok: true });
  });

  it("accepts positive integer optional numbers", () => {
    expect(validatePublishable({ ...base, servings: 1, prepMinutes: 20, cookMinutes: 45 }, references)).toEqual({ ok: true });
  });

  it.each(["servings", "prepMinutes", "cookMinutes"] as const)("rejects invalid %s values", field => {
    for (const value of [0, -1, 1.5, "2"]) {
      expect(validatePublishable({ ...base, [field]: value }, references).ok).toBe(false);
    }
  });

  it("requires nonempty ordered content and meaningful image alt text", () => {
    expect(validatePublishable({ ...base, ingredients: [] }, references).ok).toBe(false);
    expect(validatePublishable({ ...base, steps: [{ _key: "s1", text: " " }] }, references).ok).toBe(false);
    expect(validatePublishable({ ...base, image: { ...base.image, alt: " " } }, references).ok).toBe(false);
  });

  it("rejects slugs the publication webhook cannot refresh", () => {
    expect(validatePublishable({ ...base, slug: { current: "Bad Slug" } }, references).ok).toBe(false);
    expect(validatePublishable({ ...base, slug: { current: "a".repeat(129) } }, references).ok).toBe(false);
    expect(validatePublishable({ ...base, slug: { current: "a".repeat(128) } }, references).ok).toBe(true);
  });
});

describe("public Sanity access", () => {
  it("uses an anonymous published reader", () => {
    const client = makePublishedClient({ projectId: "abc12345", dataset: "development" });
    expect(client.config()).toMatchObject({ projectId: "abc12345", dataset: "development", perspective: "published", useCdn: true });
    expect(client.config().token).toBeUndefined();
  });

  it("builds a sized image URL from a cropped image", () => {
    const url = recipeImageUrl({ asset: { _ref: "image-good-100x100-webp" }, crop: { top: 0.1, bottom: 0, left: 0.2, right: 0 }, hotspot: { x: 0.5, y: 0.5, width: 0.2, height: 0.2 } }, 400, 200, { projectId: "abc12345", dataset: "development" });
    expect(url).toContain("/images/abc12345/development/good-100x100.webp");
    expect(url).toContain("w=400");
    expect(url).toContain("h=200");
    expect(url).toContain("rect=");
  });
});

describe("Studio publication validation", () => {
  it("resolves assets and tags before accepting a recipe", async () => {
    const client = { fetch: async () => [
      { _id: "image-good-100x100-webp", mimeType: "image/webp" },
      { _id: "tag-japanese", approved: true, availableForSubmissions: false },
    ] };
    expect(await validateStudioRecipe(base, client)).toBe(true);
    expect(await validateStudioRecipe({ ...base, image: { alt: "Onigiri" } }, client)).not.toBe(true);
    expect(await validateStudioRecipe(base, { fetch: async () => [{ _id: "tag-japanese", approved: true }] })).not.toBe(true);
    expect(await validateStudioRecipe(base, { fetch: async () => [{ _id: "image-good-100x100-webp", mimeType: "image/webp" }, { _id: "tag-japanese", approved: false }] })).not.toBe(true);
  });
});
