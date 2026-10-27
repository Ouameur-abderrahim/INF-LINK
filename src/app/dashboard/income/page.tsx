import { BarChart } from "@/components/BarChart";
import { Stat } from "@/components/Stat";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { money, shortDate } from "@/lib/format";
import { PRODUCT_TYPES } from "@/lib/types";
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
      <h1 className="text-2xl font-bold">Income</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="All-time revenue" value={money(total)} />
        <Stat label="Last 30 days" value={money(last30)} />
        <Stat label="Paid orders" value={String(paid.length)} />
        <Stat label="Avg. order value" value={money(paid.length ? total / paid.length : 0)} />
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
                  {PRODUCT_TYPES[o.type].icon} {o.productTitle}
                  {o.booking && <span className="ml-2 text-xs text-violet-700">{o.booking.date} {o.booking.time}</span>}
                </td>
                <td className="px-6 py-3 text-right font-semibold">{o.amount ? money(o.amount) : "Free"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
