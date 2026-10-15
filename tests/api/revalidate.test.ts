import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { encodeSignatureHeader } from "@sanity/webhook";
import { POST } from "@/app/api/sanity/revalidate/route";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(), revalidateTag: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }));

const secret = "local-test-secret";
async function request(payload: unknown, signed = true) {
  const body = JSON.stringify({ projectId: "1m7uu6hy", dataset: "development", ...(payload as object) });
  const signature = signed ? await encodeSignatureHeader(body, Date.now(), secret) : "invalid";
  return new Request("http://localhost/api/sanity/revalidate", {
    method: "POST", body,
    headers: { "sanity-webhook-signature": signature, "content-type": "application/json" },
  });
}

describe("Sanity publication webhook", () => {
  beforeEach(() => { vi.stubEnv("SANITY_REVALIDATE_SECRET", secret); vi.clearAllMocks(); });
  afterEach(() => vi.unstubAllEnvs());

  it("rejects invalid signatures before changing any cache", async () => {
    const response = await POST(await request({ type: "recipe", afterSlug: "onigiriworkshop" }, false));
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("refreshes the list and both paths when a recipe slug changes", async () => {
    const response = await POST(await request({ type: "recipe", beforeSlug: "old-recipe", afterSlug: "new-recipe" }));
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("recipes");
    expect(revalidatePath).toHaveBeenCalledWith("/menu");
    expect(revalidatePath).toHaveBeenCalledWith("/menu/old-recipe");
    expect(revalidatePath).toHaveBeenCalledWith("/menu/new-recipe");
  });

  it("refreshes a deleted or unpublished recipe and accepts duplicate notifications", async () => {
    const event = await request({ type: "recipe", beforeSlug: "onigiriworkshop", afterSlug: null });
    expect((await POST(event)).status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/menu/onigiriworkshop");
    expect((await POST(await request({ type: "recipe", beforeSlug: "onigiriworkshop", afterSlug: null }))).status).toBe(200);
  });

  it("refreshes every detail when a tag changes", async () => {
    expect((await POST(await request({ type: "tag", beforeSlug: null, afterSlug: null }))).status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/menu/[id]", "page");
  });

  it("rejects malformed and oversized signed payloads", async () => {
    expect((await POST(await request({ type: "recipe", afterSlug: "../bad" }))).status).toBe(400);
    expect((await POST(await request({ type: "tag", dataset: "production" }))).status).toBe(400);
    expect((await POST(await request({ type: "tag", projectId: "awbpvwle" }))).status).toBe(400);
    expect((await POST(await request({ type: "recipe", beforeSlug: "a".repeat(70_000) }))).status).toBe(413);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("fails closed without a configured secret", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "");
    expect((await POST(await request({ type: "tag" }))).status).toBe(503);
  });
});
