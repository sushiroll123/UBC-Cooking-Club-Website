import { makePublishedClient, sanityConnection, type SanityConnection } from "@/lib/sanity/client";
import { recipeImageUrl } from "@/lib/sanity/image";
import { validatePublishable } from "./validation";
import type { Recipe, SanityRecipeDocument } from "./types";

type PublicDocument = SanityRecipeDocument & {
  asset?: { _id: string; mimeType: string };
  tagsResolved?: ({ _id: string; label: string; approved: boolean; availableForSubmissions: boolean } | null)[];
};
type Fetcher = { fetch(query: string, params?: Record<string, unknown>, options?: { next: { revalidate: number; tags: string[] } }): Promise<unknown> };

const fields = `
  _id, _type, slug, title, description, ingredients, steps, image, tags,
  source, authorName, servings, prepMinutes, cookMinutes, sortOrder,
  "asset": image.asset->{_id, mimeType},
  "tagsResolved": tags[]->{_id, label, approved, availableForSubmissions}
`;
const published = `_type == "recipe" && !(_id in path("drafts.**"))`;
const listQuery = `*[${published}] | order(sortOrder asc, _id asc) {${fields}}`;
const detailQuery = `*[${published} && slug.current == $slug][0] {${fields}}`;

function project(doc: PublicDocument, connection: SanityConnection): Recipe | null {
  if (doc._id.startsWith("drafts.")) return null;
  if (!doc.tagsResolved || doc.tagsResolved.some(tag => !tag || typeof tag._id !== "string")) return null;
  const tagsResolved = doc.tagsResolved.filter((tag): tag is NonNullable<typeof tag> => tag !== null);
  const refs = {
    assets: doc.asset ? { [doc.asset._id]: doc.asset } : {},
    tags: Object.fromEntries(tagsResolved.map(tag => [tag._id, tag])),
  };
  if (!validatePublishable(doc, refs).ok || !doc.asset) return null;
  const labels = new Map(tagsResolved.map(tag => [tag._id, tag.label]));
  if (doc.tags.some(tag => !labels.get(tag._ref))) return null;
  return {
    id: doc._id,
    slug: doc.slug.current,
    title: doc.title,
    description: doc.description,
    ingredients: doc.ingredients.map(item => item.text),
    steps: doc.steps.map(item => item.text),
    image: { url: recipeImageUrl(doc.image, 800, 600, connection), alt: doc.image.alt },
    tags: doc.tags.map(tag => ({ id: tag._ref, label: labels.get(tag._ref)! })),
    source: doc.source,
    authorName: doc.authorName,
    servings: doc.servings,
    prepMinutes: doc.prepMinutes,
    cookMinutes: doc.cookMinutes,
    sortOrder: doc.sortOrder,
  };
}

export function createSanityRecipeReader(client: Fetcher, connection: SanityConnection) {
  const options = { next: { revalidate: 300, tags: ["recipes"] } };
  return {
    async list(): Promise<Recipe[]> {
      const docs = await client.fetch(listQuery, {}, options) as PublicDocument[];
      if (!Array.isArray(docs)) throw new Error("Invalid recipe response from Sanity");
      return docs.map(doc => project(doc, connection)).filter((recipe): recipe is Recipe => recipe !== null);
    },
    async get(slug: string): Promise<Recipe | null> {
      const doc = await client.fetch(detailQuery, { slug }, options) as PublicDocument | null;
      return doc ? project(doc, connection) : null;
    },
  };
}

export function publishedSanityRecipeReader() {
  const connection = sanityConnection();
  const client = makePublishedClient(connection);
  return createSanityRecipeReader({ fetch: (query, params, options) => client.fetch(query, params, options) }, connection);
}
