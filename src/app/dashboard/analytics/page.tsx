import { BarChart } from "@/components/BarChart";
import { Stat } from "@/components/Stat";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { money } from "@/lib/format";
import { PRODUCT_TYPES } from "@/lib/types";
import { daily, since, summary } from "@/lib/stats";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const db = await readDB();
  const events = since(db.events.filter((e) => e.userId === user.id), 30);
  const orders = since(db.orders.filter((o) => o.userId === user.id), 30);
  const products = db.products.filter((p) => p.userId === user.id).sort((a, b) => a.position - b.position);
  const s = summary(orders, events);

  const rows = products.map((p) => {
    const clicks = events.filter((e) => e.kind === "click" && e.productId === p.id).length;
    const po = orders.filter((o) => o.productId === p.id);
    return { p, clicks, sales: po.length, revenue: po.reduce((x, o) => x + o.amount, 0) };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-neutral-500">Last 30 days</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Store visits" value={String(s.views)} />
        <Stat label="Product clicks" value={String(s.clicks)} />
        <Stat label="Click-through rate" value={`${s.views ? ((s.clicks / s.views) * 100).toFixed(1) : "0.0"}%`} />
        <Stat label="Visit → sale" value={`${s.conversion.toFixed(1)}%`} />
      </div>
      <div className="card">
        <h2 className="mb-6 font-semibold">Store visits</h2>
        <BarChart data={daily(events.filter((e) => e.kind === "view"), 30, () => 1)} unit="visits" color="#0ea5e9" />
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 text-left text-neutral-500">
            <tr>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 text-right font-medium">Clicks</th>
              <th className="px-6 py-3 text-right font-medium">Sales</th>
              <th className="px-6 py-3 text-right font-medium">Conversion</th>
              <th className="px-6 py-3 text-right font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map(({ p, clicks, sales, revenue }) => (
              <tr key={p.id}>
                <td className="px-6 py-3 font-medium">{PRODUCT_TYPES[p.type].icon} {p.title}</td>
                <td className="px-6 py-3 text-right">{clicks}</td>
                <td className="px-6 py-3 text-right">{p.type === "link" ? "—" : sales}</td>
                <td className="px-6 py-3 text-right">{p.type === "link" || !clicks ? "—" : `${((sales / clicks) * 100).toFixed(0)}%`}</td>
                <td className="px-6 py-3 text-right font-semibold">{p.type === "link" ? "—" : money(revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
