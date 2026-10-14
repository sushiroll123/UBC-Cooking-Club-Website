import { defineArrayMember, defineField, defineType } from "sanity";
import { validatePublishable, type ResolvedReferences } from "../../src/lib/recipes/validation";

type ValidationClient = { fetch: (query: string, params: { ids: string[] }) => Promise<Array<{ _id: string; mimeType?: string; approved?: boolean; availableForSubmissions?: boolean }>> };

export async function validateStudioRecipe(value: unknown, client: ValidationClient): Promise<true | string> {
  const item = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const image = item.image && typeof item.image === "object" ? item.image as Record<string, unknown> : {};
  const asset = image.asset && typeof image.asset === "object" ? image.asset as Record<string, unknown> : {};
  const ids = [asset._ref, ...(Array.isArray(item.tags) ? item.tags.map(tag => tag?._ref) : [])].filter((id): id is string => typeof id === "string");
  const refs: ResolvedReferences = { assets: {}, tags: {} };
  if (ids.length) {
    const documents = await client.fetch('*[_id in $ids]{_id, mimeType, approved, availableForSubmissions}', { ids });
    for (const doc of documents) {
      if (doc._id.startsWith("image-")) refs.assets[doc._id] = { mimeType: doc.mimeType };
      else refs.tags[doc._id] = { approved: doc.approved === true, availableForSubmissions: doc.availableForSubmissions === true };
    }
  }
  const result = validatePublishable(item, refs);
  return result.ok ? true : result.errors.join("; ");
}

const orderedText = (name: string, title: string) => defineField({
  name,
  title,
  type: "array",
  of: [defineArrayMember({ type: "object", name: `${name}Item`, fields: [defineField({ name: "text", type: "text", validation: Rule => Rule.required() })] })],
  validation: Rule => Rule.required().min(1),
});

export const recipe = defineType({
  name: "recipe",
  title: "Recipe",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: Rule => Rule.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title", maxLength: 200 }, validation: Rule => Rule.required() }),
    defineField({ name: "description", type: "text", validation: Rule => Rule.required() }),
    orderedText("ingredients", "Ingredients"),
    orderedText("steps", "Steps"),
    defineField({ name: "image", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alternative text", type: "string", validation: Rule => Rule.required() })], validation: Rule => Rule.required() }),
    defineField({ name: "tags", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "tag" }] })], validation: Rule => Rule.required().min(1) }),
    defineField({ name: "source", type: "string", options: { list: [{ title: "Club", value: "club" }, { title: "Community", value: "community" }] }, validation: Rule => Rule.required() }),
    defineField({ name: "authorName", title: "Public author name", type: "string" }),
    defineField({ name: "servings", type: "number", validation: Rule => Rule.integer().positive() }),
    defineField({ name: "prepMinutes", type: "number", validation: Rule => Rule.integer().positive() }),
    defineField({ name: "cookMinutes", type: "number", validation: Rule => Rule.integer().positive() }),
    defineField({ name: "sortOrder", type: "number", validation: Rule => Rule.required().integer().min(0) }),
  ],
  validation: Rule => Rule.custom(async (value, context) => validateStudioRecipe(value, context.getClient({ apiVersion: "2026-10-11" }).withConfig({ perspective: "published" }) as ValidationClient)),
});
