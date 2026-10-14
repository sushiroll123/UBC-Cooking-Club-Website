export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  image: { url: string; alt: string };
  tags: { id: string; label: string }[];
  source: "club" | "community";
  authorName?: string;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  sortOrder: number;
}

export interface OrderedText {
  _key: string;
  text: string;
}

export interface SanityRecipeDocument {
  _id: string;
  _type: "recipe";
  slug: { current: string };
  title: string;
  description: string;
  ingredients: OrderedText[];
  steps: OrderedText[];
  image: {
    asset: { _ref: string };
    alt: string;
    crop?: { top: number; bottom: number; left: number; right: number };
    hotspot?: { x: number; y: number; height: number; width: number };
  };
  tags: { _ref: string; _key?: string }[];
  source: "club" | "community";
  authorName?: string;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  sortOrder: number;
}
