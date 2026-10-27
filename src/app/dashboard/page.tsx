import Link from "next/link";
import { ArrowRight, CalendarCheck, Eye, Percent, Plus, ShoppingBag, Wallet } from "lucide-react";
import { BarChart } from "@/components/BarChart";
import { ProductIconTile } from "@/components/icons";
import { Stat } from "@/components/Stat";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { money, shortDate } from "@/lib/format";
import { daily, pctChange, previous, since, summary } from "@/lib/stats";

export default async function DashboardHome() {
  const user = await requireUser();
  const db = await readDB();
  const orders = db.orders.filter((o) => o.userId === user.id);
  const events = db.events.filter((e) => e.userId === user.id);
  const products = db.products.filter((p) => p.userId === user.id);
  const s = summary(since(orders, 30), since(events, 30));
  const p = summary(previous(orders, 30), previous(events, 30));
  const recent = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const upcoming = orders
    .filter((o) => o.booking && o.booking.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => `${a.booking!.date}${a.booking!.time}`.localeCompare(`${b.booking!.date}${b.booking!.time}`))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted">Your store over the last 30 days.</p>
        </div>
        <Link href="/dashboard/store/products/new" className="btn-primary"><Plus size={16} /> New product</Link>
      </div>

      {products.length === 0 && (
        <div className="card flex flex-col items-start gap-3 border-brand-200 bg-brand-50 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Add your first product</h2>
            <p className="text-sm text-muted">Your store is live but empty. Add a product to start earning.</p>
          </div>
          <Link href="/dashboard/store/products/new" className="btn-primary"><Plus size={16} /> Add product</Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue" value={money(s.revenue)} icon={Wallet} delta={pctChange(s.revenue, p.revenue)} />
        <Stat label="Orders" value={String(s.sales)} icon={ShoppingBag} delta={pctChange(s.sales, p.sales)} />
        <Stat label="Store visits" value={s.views.toLocaleString()} icon={Eye} delta={pctChange(s.views, p.views)} />
        <Stat label="Conversion" value={`${s.conversion.toFixed(1)}%`} icon={Percent} delta={pctChange(s.conversion, p.conversion)} />
      </div>

      <div className="card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Revenue</h2>
            <p className="text-xs text-muted">Daily, last 30 days</p>
          </div>
          <Link href="/dashboard/income" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            View income <ArrowRight size={14} />
          </Link>
        </div>
        <BarChart data={daily(orders, 30, (o) => o.amount / 100)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card">
          <h2 className="mb-2 font-semibold">Latest orders</h2>
          {recent.length === 0 ? (
            <p className="py-6 text-sm text-muted">No orders yet. Share your link to get your first sale.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-3 text-sm">
                  <ProductIconTile type={o.type} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{o.productTitle}</p>
                    <p className="truncate text-muted">{o.buyerName} · {shortDate(o.createdAt)}</p>
                  </div>
                  <span className="tabular font-semibold">{o.amount ? money(o.amount) : <span className="text-muted">Free</span>}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="mb-2 font-semibold">Upcoming calls</h2>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted">
              <CalendarCheck size={28} strokeWidth={1.5} className="text-neutral-300" />
              No upcoming bookings
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((o) => {
                const d = new Date(o.booking!.date + "T00:00:00");
                return (
                  <li key={o.id} className="flex items-center gap-3 py-3 text-sm">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-line leading-none">
                      <span className="text-[10px] font-semibold uppercase text-signal">{d.toLocaleDateString("en-US", { month: "short" })}</span>
                      <span className="font-display text-base font-semibold">{d.getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{o.buyerName}</p>
                      <p className="truncate text-muted">{o.productTitle}</p>
                    </div>
                    <span className="tabular rounded-md bg-paper px-2 py-1 text-xs font-semibold">{o.booking!.time}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
