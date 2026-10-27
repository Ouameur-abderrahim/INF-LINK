import { Download } from "lucide-react";
import { Avatar } from "@/components/StoreView";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { money, shortDate } from "@/lib/format";

export default async function CustomersPage() {
  const user = await requireUser();
  const orders = (await readDB()).orders.filter((o) => o.userId === user.id);
  const map = new Map<string, { name: string; email: string; spent: number; orders: number; last: string; lead: boolean }>();
  for (const o of orders) {
    const c = map.get(o.buyerEmail) ?? { name: o.buyerName, email: o.buyerEmail, spent: 0, orders: 0, last: o.createdAt, lead: true };
    c.spent += o.amount;
    c.orders += 1;
    if (o.amount > 0) c.lead = false;
    if (o.createdAt > c.last) c.last = o.createdAt;
    map.set(o.buyerEmail, c);
  }
  const customers = [...map.values()].sort((a, b) => b.last.localeCompare(a.last));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-neutral-500">{customers.length} contacts, including email subscribers from lead magnets.</p>
        </div>
        <a href="/api/customers.csv" className="btn-ghost"><Download size={16} /> Export CSV</a>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 text-left text-neutral-500">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Orders</th>
              <th className="px-6 py-3 font-medium">Last activity</th>
              <th className="px-6 py-3 text-right font-medium">Total spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {customers.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-500">No customers yet.</td></tr>
            )}
            {customers.map((c) => (
              <tr key={c.email} className="hover:bg-neutral-50">
                <td className="px-6 py-3 font-medium"><div className="flex items-center gap-3"><Avatar name={c.name} src="" size={32} />{c.name}</div></td>
                <td className="px-6 py-3 text-neutral-600">{c.email}</td>
                <td className="px-6 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.lead ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                    {c.lead ? "Subscriber" : "Customer"}
                  </span>
                </td>
                <td className="px-6 py-3">{c.orders}</td>
                <td className="px-6 py-3 text-neutral-500">{shortDate(c.last)}</td>
                <td className="px-6 py-3 text-right font-semibold">{money(c.spent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
