import Link from "next/link";
import { BarChart } from "@/components/BarChart";
import { Stat } from "@/components/Stat";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { money, shortDate } from "@/lib/format";
import { daily, since, summary } from "@/lib/stats";

export default async function DashboardHome() {
  const user = await requireUser();
  const db = await readDB();
  const orders = db.orders.filter((o) => o.userId === user.id);
  const events = db.events.filter((e) => e.userId === user.id);
  const products = db.products.filter((p) => p.userId === user.id);
  const s = summary(since(orders, 30), since(events, 30));
  const recent = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const upcoming = orders
    .filter((o) => o.booking && o.booking.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => `${a.booking!.date}${a.booking!.time}`.localeCompare(`${b.booking!.date}${b.booking!.time}`))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hey {user.name.split(" ")[0]} 👋</h1>
        <p className="text-sm text-neutral-500">Here&apos;s how your store did over the last 30 days.</p>
      </div>

      {products.length === 0 && (
        <div className="card flex flex-col items-start gap-3 border-violet-200 bg-violet-50 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Add your first product</h2>
            <p className="text-sm text-neutral-600">Your store is live but empty. Add a product to start earning.</p>
          </div>
          <Link href="/dashboard/store/products/new" className="btn-primary">+ Add product</Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue" value={money(s.revenue)} />
        <Stat label="Sales" value={String(s.sales)} />
        <Stat label="Store visits" value={String(s.views)} />
        <Stat label="Conversion" value={`${s.conversion.toFixed(1)}%`} />
      </div>

      <div className="card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold">Revenue</h2>
          <Link href="/dashboard/income" className="text-sm font-medium text-violet-700">View all →</Link>
        </div>
        <BarChart data={daily(orders, 30, (o) => o.amount / 100)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold">Latest orders</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-neutral-500">No orders yet. Share your link to get your first sale!</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{o.buyerName}</p>
                    <p className="text-neutral-500">{o.productTitle} · {shortDate(o.createdAt)}</p>
                  </div>
                  <span className="font-semibold">{o.amount ? money(o.amount) : "Free"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="mb-4 font-semibold">Upcoming calls</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-neutral-500">No upcoming bookings.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {upcoming.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{o.buyerName}</p>
                    <p className="text-neutral-500">{o.productTitle}</p>
                  </div>
                  <span className="rounded-lg bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">
                    {shortDate(o.booking!.date + "T00:00:00")} · {o.booking!.time}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
