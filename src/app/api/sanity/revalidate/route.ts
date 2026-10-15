import { isValidSignature } from "@sanity/webhook";
import { revalidatePath, revalidateTag } from "next/cache";

export const runtime = "nodejs";
const maxBodyBytes = 64 * 1024;
const validSlug = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 128 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

type Event = { type: "recipe" | "tag"; beforeSlug: string | null; afterSlug: string | null };

function parseEvent(value: unknown): Event | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (input.projectId !== "1m7uu6hy" || input.dataset !== "development") return null;
  if (input.type !== "recipe" && input.type !== "tag") return null;
  const beforeSlug = input.beforeSlug ?? null;
  const afterSlug = input.afterSlug ?? null;
  if ((beforeSlug !== null && !validSlug(beforeSlug)) || (afterSlug !== null && !validSlug(afterSlug))) return null;
  if (input.type === "recipe" && beforeSlug === null && afterSlug === null) return null;
  return { type: input.type, beforeSlug, afterSlug };
}

async function readBoundedBody(request: Request): Promise<string | null> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBodyBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: "Webhook is not configured" }, { status: 503 });

  let body: string | null;
  try { body = await readBoundedBody(request); }
  catch { return Response.json({ error: "Invalid request body" }, { status: 400 }); }
  if (body === null) return Response.json({ error: "Request body too large" }, { status: 413 });

  const signature = request.headers.get("sanity-webhook-signature") || "";
  if (!(await isValidSignature(body, signature, secret))) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: Event | null;
  try { event = parseEvent(JSON.parse(body)); }
  catch { event = null; }
  if (!event) return Response.json({ error: "Invalid webhook payload" }, { status: 400 });

  revalidateTag("recipes");
  revalidatePath("/menu");
  if (event.type === "tag") revalidatePath("/menu/[id]", "page");
  else for (const slug of new Set([event.beforeSlug, event.afterSlug])) {
    if (slug) revalidatePath(`/menu/${slug}`);
  }
  return Response.json({ revalidated: true });
}
