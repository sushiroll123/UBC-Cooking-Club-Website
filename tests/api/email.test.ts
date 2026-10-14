import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/email/route";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

describe("POST /api/email", () => {
  it("stays unavailable without contacting the mail provider", async () => {
    const response = await POST();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ message: "Contact form is temporarily unavailable" });
    expect(send).not.toHaveBeenCalled();
  });
});
