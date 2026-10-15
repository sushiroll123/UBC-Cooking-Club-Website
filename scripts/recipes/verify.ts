import { pathToFileURL } from "node:url";
import { readLegacyRecipes, legacyTagId } from "./legacy";
import { makeImportClient, type ImportClient } from "./import";

export interface VerifyOptions { dataset: string; client?: ImportClient }
export interface ParityReport { dataset: string; expectedCount: number; foundCount: number; differences: string[] }

function same(a: unknown, b: unknown): boolean { return JSON.stringify(a) === JSON.stringify(b); }
const field = (record: Record<string, unknown>, key: string) => record[key];

export async function verifyImport(options: VerifyOptions): Promise<ParityReport> {
  const client = options.client ?? makeImportClient(options.dataset);
  const source = readLegacyRecipes();
  const differences: string[] = [];
  const tags = await client.getTags([...new Set(source.flatMap(recipe => recipe.tags.map(legacyTagId)))]);
  const tagById = new Map(tags.map(tag => [tag._id, tag]));
  let foundCount = 0;
  for (const recipe of source) {
    const id = `recipe-${recipe.id}`;
    const document = (await client.getDocument(`drafts.${id}`)) || (await client.getDocument(id));
    if (!document) { differences.push(`${recipe.id}: missing recipe`); continue; }
    foundCount++;
    const compare = (name: string, actual: unknown, expected: unknown) => { if (!same(actual, expected)) differences.push(`${recipe.id}: ${name} differs`); };
    compare("slug", (field(document, "slug") as { current?: string } | undefined)?.current, recipe.id);
    compare("title", field(document, "title"), recipe.title);
    compare("description", field(document, "description"), recipe.description);
    compare("source", field(document, "source"), "club");
    compare("sortOrder", field(document, "sortOrder"), recipe.sortOrder);
    for (const name of ["ingredients", "steps"] as const) {
      const items = field(document, name) as { _key?: string; text?: string }[] | undefined;
      compare(name, items?.map(item => item.text), recipe[name]);
      compare(`${name} keys`, items?.map(item => item._key), recipe[name].map((_, index) => `${name === "steps" ? "step" : "ingredient"}-${index}`));
    }
    for (const name of ["servings", "prepMinutes", "cookMinutes"] as const) compare(name, field(document, name), undefined);
    const image = field(document, "image") as { asset?: { _ref?: string }; alt?: string } | undefined;
    compare("image alt", image?.alt, recipe.title);
    const asset = image?.asset?._ref ? await client.getAsset(image.asset._ref) : null;
    if (!asset || asset.sha1hash !== recipe.imageSha1) differences.push(`${recipe.id}: image hash differs`);
    const tagRefs = (field(document, "tags") as { _ref?: string }[] | undefined)?.map(tag => tag._ref);
    compare("tag references", tagRefs, recipe.tags.map(legacyTagId));
    for (const label of recipe.tags) {
      if (tagById.get(legacyTagId(label))?.label !== label) differences.push(`${recipe.id}: tag label differs (${label})`);
    }
  }
  const all = await client.listImportedRecipes();
  const ids = new Set(all.map(doc => String(doc._id).replace(/^drafts\./, "")).filter(id => id.startsWith("recipe-")));
  if (ids.size !== source.length) differences.push(`recipe count differs: expected ${source.length}, found ${ids.size}`);
  return { dataset: options.dataset, expectedCount: source.length, foundCount, differences };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const position = process.argv.indexOf("--dataset");
  const dataset = position < 0 ? "" : process.argv[position + 1];
  if (!dataset) throw new Error("Use --dataset <name>");
  verifyImport({ dataset })
    .then(report => { process.stdout.write(`${JSON.stringify(report, null, 2)}\n`); if (report.differences.length) process.exitCode = 1; })
    .catch(error => { process.stderr.write(`Verification failed: ${error instanceof Error ? error.message : "unknown error"}\n`); process.exitCode = 1; });
}
