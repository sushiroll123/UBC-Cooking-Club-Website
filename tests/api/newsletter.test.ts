import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("axios", () => ({ default: { post } }));

const secret = "fake-private-key";

function request(body: string) {
  return new NextRequest("http://localhost/api/newsletter", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("POST /api/newsletter", () => {
  let POST: typeof import("@/app/api/newsletter/route").POST;
  let loggedErrors: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubEnv("MAILCHIMP_API_SERVER", "example");
    vi.stubEnv("MAILCHIMP_AUDIENCE_ID", "fake-audience");
    vi.stubEnv("MAILCHIMP_API_KEY", secret);
    loggedErrors = vi.spyOn(console, "error").mockImplementation(() => {});
    ({ POST } = await import("@/app/api/newsletter/route"));
  });

  afterEach(() => {
    loggedErrors.mockRestore();
    vi.unstubAllEnvs();
  });

  it.each(["{", JSON.stringify({ email: "invalid" }), JSON.stringify({})])(
    "returns 400 for malformed input %s",
    async (body) => {
      const response = await POST(request(body));
      expect(response.status).toBe(400);
      expect(post).not.toHaveBeenCalled();
    }
  );

  it("returns a generic 502 without exposing provider credentials", async () => {
    post.mockRejectedValueOnce({
      message: "Mailchimp failed",
      config: { headers: { Authorization: `apikey ${secret}` } },
    });

    const response = await POST(request(JSON.stringify({ email: "cook@example.com" })));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain(secret);
    expect(JSON.stringify(loggedErrors.mock.calls)).not.toContain(secret);
  });

  it("treats a non-success provider response as an upstream failure", async () => {
    post.mockResolvedValueOnce({ status: 429 });
    const response = await POST(request(JSON.stringify({ email: "cook@example.com" })));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain(secret);
  });

  it("keeps the successful response", async () => {
    post.mockResolvedValueOnce({ status: 200 });
    const response = await POST(request(JSON.stringify({ email: "cook@example.com" })));
    expect(response.status).toBe(200);
    expect(await response.json()).toBe("Subscribed");
  });
});
