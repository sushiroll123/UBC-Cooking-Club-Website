import type { Recipe } from "./types";
import { staticRecipeReader } from "./static";
import { publishedSanityRecipeReader } from "./sanity";

export interface RecipeReader {
  list(): Promise<Recipe[]>;
  get(slug: string): Promise<Recipe | null>;
}

export function createRecipeRepository(source: string, staticReader: RecipeReader, sanityReader: RecipeReader): RecipeReader {
  if (source === "static") return staticReader;
  if (source === "sanity") return sanityReader;
  throw new Error(`Unsupported RECIPE_SOURCE: ${source}`);
}

function repository(): RecipeReader {
  const source = process.env.RECIPE_SOURCE || "static";
  return createRecipeRepository(source, staticRecipeReader, source === "sanity" ? publishedSanityRecipeReader() : staticRecipeReader);
}

export async function listPublishedRecipes(): Promise<Recipe[]> { return repository().list(); }
export async function getPublishedRecipe(slug: string): Promise<Recipe | null> { return repository().get(slug); }
