import { createClient } from "@sanity/client";

export interface SanityConnection {
  projectId: string;
  dataset: string;
  apiVersion?: string;
}

export function sanityConnection(): SanityConnection {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  if (projectId !== "1m7uu6hy" || !dataset) throw new Error("Verified Sanity project and dataset must be configured");
  return { projectId, dataset, apiVersion: process.env.SANITY_API_VERSION || "2026-10-11" };
}

export function makePublishedClient(connection: SanityConnection = sanityConnection()) {
  return createClient({
    projectId: connection.projectId,
    dataset: connection.dataset,
    apiVersion: connection.apiVersion || "2026-10-11",
    useCdn: true,
    perspective: "published",
  });
}
