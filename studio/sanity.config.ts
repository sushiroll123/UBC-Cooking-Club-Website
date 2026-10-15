import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { schemaTypes } from "./schemaTypes";

const localEnv = fileURLToPath(new URL(".env.local", import.meta.url));
if (existsSync(localEnv)) process.loadEnvFile(localEnv);

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "development";
if (projectId !== "1m7uu6hy") throw new Error("The verified Sanity project ID is required");
if (dataset !== "development") throw new Error("This Studio configuration is limited to the development dataset");

export default defineConfig({
  name: "ubc-cooking-club-development",
  title: "UBC Cooking Club — Development",
  projectId,
  dataset,
  plugins: [structureTool({ structure: (S) => S.list().title("Content").items([
    S.listItem().title("Pending recipes").child(S.documentList().title("Pending recipes").filter('_type == "recipe" && _id in path("drafts.**")')),
    S.listItem().title("Published club recipes").child(S.documentList().title("Published club recipes").filter('_type == "recipe" && source == "club" && !(_id in path("drafts.**"))')),
    S.listItem().title("Published community recipes").child(S.documentList().title("Published community recipes").filter('_type == "recipe" && source == "community" && !(_id in path("drafts.**"))')),
    S.documentTypeListItem("tag").title("Tags"),
  ]) })],
  schema: { types: schemaTypes },
});
