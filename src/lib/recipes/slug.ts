export function validRecipeSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 128 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
