import { randomUUID } from "crypto";
import { mutate } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = await mutate((db) => {
    const p = db.products.find((x) => x.id === id && x.type === "link" && x.published);
    if (!p) return null;
    db.events.push({ id: randomUUID(), userId: p.userId, kind: "click", productId: p.id, createdAt: new Date().toISOString() });
    return p.url;
  });
  return Response.redirect(url ?? new URL("/", req.url), 302);
}
