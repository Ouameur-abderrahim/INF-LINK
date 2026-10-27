import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/StoreView";
import { readDB } from "@/lib/db";
import { getTheme } from "@/lib/themes";
import { money } from "@/lib/format";

export default async function OrderPage({ params }: { params: Promise<{ username: string; orderId: string }> }) {
  const { username, orderId } = await params;
  const db = await readDB();
  const order = db.orders.find((o) => o.id === orderId);
  const creator = db.users.find((u) => u.id === order?.userId && u.username === username);
  if (!order || !creator) notFound();
  const product = db.products.find((p) => p.id === order.productId);
  const theme = getTheme(creator.theme);

  const headline = {
    digital: "Your download is ready",
    lead: "It's on its way!",
    coaching: "Your call is booked",
    course: "You're enrolled!",
    membership: "Welcome to the club",
    link: "Thanks!",
  }[order.type];

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-12" style={{ background: theme.bg, color: theme.text }}>
      <div className="w-full max-w-md rounded-3xl p-8 text-center shadow-xl" style={{ background: theme.card }}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ background: `${theme.accent}22` }}>✓</div>
        <h1 className="mt-4 text-2xl font-bold">{headline}</h1>
        <p className="mt-2 text-sm" style={{ color: theme.muted }}>
          Thanks {order.buyerName.split(" ")[0]}! A receipt for <b>{order.productTitle}</b>
          {order.amount ? ` (${money(order.amount)})` : ""} has been sent to {order.buyerEmail}.
        </p>

        {order.booking && (
          <div className="mt-6 rounded-2xl p-4 text-sm" style={{ background: theme.bg }}>
            <p className="font-semibold">
              {new Date(order.booking.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <p style={{ color: theme.muted }}>{order.booking.time} · {product?.duration ?? 30} minutes with {creator.name}</p>
          </div>
        )}

        {product?.url && (order.type === "digital" || order.type === "lead" || order.type === "membership") && (
          <a href={product.url} target="_blank" rel="noreferrer" className="mt-6 block rounded-xl py-3 text-sm font-bold" style={{ background: theme.accent, color: theme.accentText }}>
            {order.type === "membership" ? "Access the community" : "Download now"}
          </a>
        )}
        {order.type === "course" && (
          <Link href={`/learn/${order.id}`} className="mt-6 block rounded-xl py-3 text-sm font-bold" style={{ background: theme.accent, color: theme.accentText }}>
            Start the course →
          </Link>
        )}

        <Link href={`/${creator.username}`} className="mt-6 inline-flex items-center gap-2 text-sm" style={{ color: theme.muted }}>
          <Avatar name={creator.name} src={creator.avatar} size={24} /> Back to {creator.name}&apos;s store
        </Link>
      </div>
    </div>
  );
}
