import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { createClient } from "@sanity/client";
import { loadEnvConfig } from "@next/env";
import { readLegacyRecipes, legacyTagId } from "./legacy";
import type { SanityRecipeDocument } from "../../src/lib/recipes/types";

export interface ImportAsset { _id: string; sha1hash: string; mimeType: string }
export interface ImportClient {
  getDocument(id: string): Promise<Record<string, unknown> | null>;
  createIfNotExists(doc: Record<string, unknown> & { _id: string }): Promise<unknown>;
  findAssetBySha1(hash: string): Promise<ImportAsset | null>;
  uploadAsset(bytes: Buffer, filename: string, hash: string): Promise<ImportAsset>;
  getAsset(id: string): Promise<ImportAsset | null>;
  listImportedRecipes(): Promise<Record<string, unknown>[]>;
  getTags(ids: string[]): Promise<Record<string, unknown>[]>;
}

export interface ImportOptions { dataset: string; dryRun: boolean; confirmProduction?: boolean; client?: ImportClient }
export interface ImportReport { dataset: string; dryRun: boolean; recipeCount: number; plannedRecipes: number; createdRecipes: number; skippedRecipes: number; createdTags: number; uploadedImages: number }

export function makeImportClient(dataset: string): ImportClient {
  loadEnvConfig(process.cwd());
  const projectId = process.env.SANITY_PROJECT_ID;
  const studioProjectId = process.env.SANITY_STUDIO_PROJECT_ID;
  const token = process.env.SANITY_IMPORT_TOKEN;
  if (projectId !== "1m7uu6hy" || studioProjectId !== "1m7uu6hy" || !token) {
    throw new Error("Matching Sanity project identity and a dedicated import token are required");
  }
  const client = createClient({ projectId, dataset, apiVersion: "2026-10-11", token, useCdn: false, perspective: "raw" });
  return {
    getDocument: async id => client.getDocument(id) as Promise<Record<string, unknown> | null>,
    createIfNotExists: async doc => { await client.createIfNotExists(doc as Parameters<typeof client.createIfNotExists>[0]); },
    findAssetBySha1: async hash => client.fetch<ImportAsset | null>('*[_type == "sanity.imageAsset" && sha1hash == $hash][0]{_id,sha1hash,mimeType}', { hash }),
    uploadAsset: async (bytes, filename) => {
      const asset = await client.assets.upload("image", bytes, { filename });
      return { _id: asset._id, sha1hash: asset.sha1hash, mimeType: asset.mimeType };
    },
    getAsset: async id => client.getDocument(id) as Promise<ImportAsset | null>,
    listImportedRecipes: async () => client.fetch<Record<string, unknown>[]>('*[_type == "recipe" && source == "club"]'),
    getTags: async ids => client.fetch<Record<string, unknown>[]>('*[_id in $ids]{_id,label,category,approved,availableForSubmissions}', { ids }),
  };
}

export async function importRecipes(options: ImportOptions): Promise<ImportReport> {
  if (!options.dataset) throw new Error("Dataset is required");
  if (!options.dryRun && options.dataset === "production" && !options.confirmProduction) throw new Error("Production import requires explicit confirmation");
  const legacy = readLegacyRecipes();
  const client = options.client ?? (options.dryRun ? undefined : makeImportClient(options.dataset));
  const report: ImportReport = { dataset: options.dataset, dryRun: options.dryRun, recipeCount: legacy.length, plannedRecipes: 0, createdRecipes: 0, skippedRecipes: 0, createdTags: 0, uploadedImages: 0 };
  const labels = [...new Set(legacy.flatMap(recipe => recipe.tags))];
  for (const label of labels) {
    const id = legacyTagId(label);
    if (!client || !(await client.getDocument(id))) {
      if (!options.dryRun) {
        await client!.createIfNotExists({ _id: id, _type: "tag", label, category: "Legacy", approved: false, availableForSubmissions: false });
        report.createdTags++;
      }
    }
  }
  for (const recipe of legacy) {
    const id = `recipe-${recipe.id}`;
    const exists = client && ((await client.getDocument(`drafts.${id}`)) || (await client.getDocument(id)));
    if (exists) { report.skippedRecipes++; continue; }
    report.plannedRecipes++;
    if (options.dryRun) continue;
    let asset = await client!.findAssetBySha1(recipe.imageSha1);
    if (!asset) {
      asset = await client!.uploadAsset(readFileSync(recipe.imagePath), `${recipe.id}.webp`, recipe.imageSha1);
      report.uploadedImages++;
    }
    const document: SanityRecipeDocument = {
      _id: `drafts.${id}`,
      _type: "recipe",
      slug: { current: recipe.id },
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients.map((text, index) => ({ _key: `ingredient-${index}`, text })),
      steps: recipe.steps.map((text, index) => ({ _key: `step-${index}`, text })),
      image: { asset: { _ref: asset._id }, alt: recipe.title },
      tags: recipe.tags.map((label, index) => ({ _key: `tag-${index}`, _ref: legacyTagId(label) })),
      source: "club",
      sortOrder: recipe.sortOrder,
    };
    await client!.createIfNotExists(document as unknown as Record<string, unknown> & { _id: string });
    report.createdRecipes++;
  }
  return report;
}

function argumentValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dryRun = !process.argv.includes("--apply");
  const dataset = argumentValue("--dataset") || (dryRun ? "development" : "");
  if (!dryRun && dataset !== "development" && dataset !== "production") throw new Error("Use --dataset development or production with --apply");
  importRecipes({ dataset, dryRun, confirmProduction: process.argv.includes("--confirm-production") })
    .then(report => { process.stdout.write(`${JSON.stringify(report, null, 2)}\n`); })
    .catch(error => { process.stderr.write(`Import failed: ${error instanceof Error ? error.message : "unknown error"}\n`); process.exitCode = 1; });
}
