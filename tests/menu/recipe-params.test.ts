import { expect, it } from "vitest";
import { menuData } from "@/data";
import { generateStaticParams } from "@/app/menu/[id]/page";

it("prebuilds every legacy recipe under the id route parameter", async () => {
  expect(await generateStaticParams()).toEqual(
    menuData.map((recipe) => ({ id: recipe.id }))
  );
});
