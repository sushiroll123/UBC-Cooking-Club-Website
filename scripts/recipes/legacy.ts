import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { menuData, type MenuType } from "../../src/data/menu";

export interface LegacyRecipe extends MenuType {
  sortOrder: number;
  imagePath: string;
  imageSha1: string;
}

export function readLegacyRecipes(): LegacyRecipe[] {
  return menuData.map((recipe, sortOrder) => {
    const imagePath = fileURLToPath(new URL(`../../public/menu/workshops/${recipe.id}.webp`, import.meta.url));
    const imageSha1 = createHash("sha1").update(readFileSync(imagePath)).digest("hex");
    return { ...recipe, sortOrder, imagePath, imageSha1 };
  });
}

export function legacyTagId(label: string): string {
  return `tag-${label.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}
