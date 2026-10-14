export interface ResolvedReferences {
  assets: Record<string, { mimeType?: string }>;
  tags: Record<string, { approved: boolean; availableForSubmissions: boolean }>;
}

export type ValidationResult = { ok: true } | { ok: false; errors: string[] };

type Dict = Record<string, unknown>;
const record = (value: unknown): Dict => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Dict : {};
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

export function validatePublishable(recipe: unknown, resolved: ResolvedReferences): ValidationResult {
  const item = record(recipe);
  const errors: string[] = [];
  if (item._type !== "recipe") errors.push("Recipe type is required");
  if (!text(record(item.slug).current)) errors.push("Slug is required");
  if (!text(item.title)) errors.push("Title is required");
  if (!text(item.description)) errors.push("Description is required");
  if (item.source !== "club" && item.source !== "community") errors.push("Source is required");
  if (!Number.isFinite(item.sortOrder)) errors.push("Sort order is required");
  for (const field of ["ingredients", "steps"] as const) {
    const values = item[field];
    if (!Array.isArray(values) || values.length === 0 || values.some(value => !text(record(value)._key) || !text(record(value).text))) {
      errors.push(`${field} must contain ordered text`);
    }
  }
  const image = record(item.image);
  const assetRef = record(image.asset)._ref;
  if (!text(assetRef) || !resolved.assets[assetRef] || !["image/jpeg", "image/png", "image/webp"].includes(resolved.assets[assetRef].mimeType || "")) {
    errors.push("A resolved JPEG, PNG, or WebP image is required");
  }
  if (!text(image.alt)) errors.push("Image alternative text is required");
  if (!Array.isArray(item.tags) || item.tags.length === 0) {
    errors.push("At least one approved tag is required");
  } else {
    for (const tag of item.tags) {
      const ref = record(tag)._ref;
      if (!text(ref) || !resolved.tags[ref]?.approved) errors.push("An approved tag reference is required");
    }
  }
  for (const field of ["servings", "prepMinutes", "cookMinutes"] as const) {
    if (item[field] !== undefined && (!Number.isInteger(item[field]) || (item[field] as number) <= 0)) errors.push(`${field} must be positive`);
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}
