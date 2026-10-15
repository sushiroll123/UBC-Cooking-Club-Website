import { defineCliConfig } from "sanity/cli";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const localEnv = fileURLToPath(new URL(".env.local", import.meta.url));
if (existsSync(localEnv)) process.loadEnvFile(localEnv);

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "development";
if (projectId !== "1m7uu6hy") throw new Error("The verified Sanity project ID is required");
if (dataset !== "development") throw new Error("This Studio configuration is limited to the development dataset");

export default defineCliConfig({ api: { projectId, dataset } });
