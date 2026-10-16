import imageUrlBuilder from "@sanity/image-url";
import { sanityConnection, type SanityConnection } from "./client";

export function recipeImageUrl(image: Parameters<ReturnType<typeof imageUrlBuilder>["image"]>[0], width: number, height: number, connection: SanityConnection = sanityConnection()): string {
  return imageUrlBuilder({ projectId: connection.projectId, dataset: connection.dataset })
    .image(image)
    .width(width)
    .height(height)
    .fit("crop")
    .auto("format")
    .url();
}
