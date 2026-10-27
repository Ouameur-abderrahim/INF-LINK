import { randomUUID } from "crypto";
import { mutate } from "@/lib/db";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { userId?: string; productId?: string; kind?: string } | null;
  if (!body?.userId || (body.kind !== "view" && body.kind !== "click")) return new Response(null, { status: 400 });
  const kind = body.kind;
  await mutate((db) => {
    if (!db.users.some((u) => u.id === body.userId)) return;
    db.events.push({ id: randomUUID(), userId: body.userId!, kind, productId: body.productId, createdAt: new Date().toISOString() });
  });
  return new Response(null, { status: 204 });
}
