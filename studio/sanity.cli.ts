import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "development";
if (!projectId) throw new Error("SANITY_STUDIO_PROJECT_ID is required");
if (dataset !== "development") throw new Error("This Studio configuration is limited to the development dataset");

export default defineCliConfig({ api: { projectId, dataset } });
