import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

const secret = "fake-private-key";

function request(body: string) {
  return new NextRequest("http://localhost/api/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("POST /api/email", () => {
  let POST: typeof import("@/app/api/email/route").POST;
  let loggedErrors: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_RESEND_API_KEY", secret);
    loggedErrors = vi.spyOn(console, "error").mockImplementation(() => {});
    ({ POST } = await import("@/app/api/email/route"));
  });

  afterEach(() => {
    loggedErrors.mockRestore();
    vi.unstubAllEnvs();
  });

  const valid = { email: "cook@example.com", subject: "Hello", message: "Hi team" };

  it.each(["{", JSON.stringify({ ...valid, email: "invalid" }), JSON.stringify({ ...valid, message: "" })])(
    "returns 400 for malformed input %s",
    async (body) => {
      const response = await POST(request(body));
      expect(response.status).toBe(400);
      expect(send).not.toHaveBeenCalled();
    }
  );

  it("returns a generic 502 when the provider returns an error", async () => {
    send.mockResolvedValueOnce({ data: null, error: { message: secret } });
    const response = await POST(request(JSON.stringify(valid)));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain(secret);
    expect(JSON.stringify(loggedErrors.mock.calls)).not.toContain(secret);
  });

  it("returns a generic 502 when the provider throws", async () => {
    send.mockRejectedValueOnce(new Error(secret));
    const response = await POST(request(JSON.stringify(valid)));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain(secret);
    expect(JSON.stringify(loggedErrors.mock.calls)).not.toContain(secret);
  });

  it("keeps the successful response", async () => {
    const data = { id: "fake-message-id" };
    send.mockResolvedValueOnce({ data, error: null });
    const response = await POST(request(JSON.stringify(valid)));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(data);
  });
});
