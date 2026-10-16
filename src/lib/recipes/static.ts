import { menuData } from "@/data/menu";
import type { Recipe } from "./types";

const recipes: Recipe[] = menuData.map((item, sortOrder) => ({
  id: item.id,
  slug: item.id,
  title: item.title,
  description: item.description,
  ingredients: item.ingredients,
  steps: item.steps,
  image: { url: `/menu/workshops/${item.id}.webp`, alt: item.title },
  tags: item.tags.map(label => ({ id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label })),
  source: "club",
  sortOrder,
}));

export const staticRecipeReader = {
  async list(): Promise<Recipe[]> { return recipes; },
  async get(slug: string): Promise<Recipe | null> { return recipes.find(recipe => recipe.slug === slug) ?? null; },
};
