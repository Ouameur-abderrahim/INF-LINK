import { getCurrentUser } from "@/lib/auth";
import { readDB } from "@/lib/db";

const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const orders = (await readDB()).orders.filter((o) => o.userId === user.id);
  const rows = [["date", "name", "email", "product", "amount_usd"].join(",")];
  for (const o of orders) {
    rows.push([o.createdAt, o.buyerName, o.buyerEmail, o.productTitle, (o.amount / 100).toFixed(2)].map(esc).join(","));
  }
  return new Response(rows.join("\n"), {
    headers: { "content-type": "text/csv", "content-disposition": `attachment; filename="customers.csv"` },
  });
}
