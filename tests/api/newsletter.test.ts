import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/newsletter/route";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("axios", () => ({ default: { post } }));

describe("POST /api/newsletter", () => {
  it("stays unavailable without contacting the newsletter provider", async () => {
    const response = await POST();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ message: "Contact form is temporarily unavailable" });
    expect(post).not.toHaveBeenCalled();
  });
});
