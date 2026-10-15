import type { ImportClient } from "../../scripts/recipes/import";

export function fakeClient() {
  const documents = new Map<string, Record<string, unknown>>();
  const assets = new Map<string, { _id: string; sha1hash: string; mimeType: string }>();
  const writeCalls: string[] = [];
  const client: ImportClient = {
    async getDocument(id) { return documents.get(id) ?? null; },
    async createIfNotExists(doc) {
      writeCalls.push(doc._id);
      if (!documents.has(doc._id)) documents.set(doc._id, structuredClone(doc));
    },
    async findAssetBySha1(hash) { return assets.get(hash) ?? null; },
    async uploadAsset(bytes, filename, hash) {
      writeCalls.push(`asset:${filename}`);
      const asset = { _id: `image-${hash}-100x100-webp`, sha1hash: hash, mimeType: "image/webp" };
      assets.set(hash, asset);
      return asset;
    },
    async getAsset(id) { return [...assets.values()].find(asset => asset._id === id) ?? null; },
    async listImportedRecipes() { return [...documents.values()].filter(doc => doc._type === "recipe"); },
    async getTags(ids) {
      return ids.map(id => documents.get(id)).filter((tag): tag is Record<string, unknown> => Boolean(tag));
    },
  };
  return { client, documents, assets, writeCalls };
}
