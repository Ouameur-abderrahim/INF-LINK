import { Receipt, TrendingUp, Wallet, ShoppingBag } from "lucide-react";
import { ProductIconTile } from "@/components/icons";
import { BarChart } from "@/components/BarChart";
import { Stat } from "@/components/Stat";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { money, shortDate } from "@/lib/format";
import { daily, since } from "@/lib/stats";

export default async function IncomePage() {
  const user = await requireUser();
  const orders = (await readDB()).orders
    .filter((o) => o.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const total = orders.reduce((s, o) => s + o.amount, 0);
  const last30 = since(orders, 30).reduce((s, o) => s + o.amount, 0);
  const paid = orders.filter((o) => o.amount > 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Income</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="All-time revenue" value={money(total)} icon={Wallet} />
        <Stat label="Last 30 days" value={money(last30)} icon={TrendingUp} />
        <Stat label="Paid orders" value={String(paid.length)} icon={ShoppingBag} />
        <Stat label="Avg. order value" value={money(paid.length ? total / paid.length : 0)} icon={Receipt} />
      </div>
      <div className="card">
        <h2 className="mb-6 font-semibold">Daily revenue (last 30 days)</h2>
        <BarChart data={daily(orders, 30, (o) => o.amount / 100)} />
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 text-left text-neutral-500">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-neutral-500">No orders yet.</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-neutral-50">
                <td className="whitespace-nowrap px-6 py-3 text-neutral-500">{shortDate(o.createdAt)}</td>
                <td className="px-6 py-3">
                  <p className="font-medium">{o.buyerName}</p>
                  <p className="text-neutral-500">{o.buyerEmail}</p>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <ProductIconTile type={o.type} size={32} />
                    <div>
                      <p className="font-medium">{o.productTitle}</p>
                      {o.booking && <p className="text-xs text-brand-700">{o.booking.date} · {o.booking.time}</p>}
                    </div>
                  </div>
                </td>
                <td className="tabular px-6 py-3 text-right font-semibold">{o.amount ? money(o.amount) : "Free"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
