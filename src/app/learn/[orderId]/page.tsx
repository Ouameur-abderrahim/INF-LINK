import Link from "next/link";
import { notFound } from "next/navigation";
import { CoursePlayer } from "@/components/CoursePlayer";
import { Avatar } from "@/components/StoreView";
import { readDB } from "@/lib/db";
import { getTheme } from "@/lib/themes";

export default async function LearnPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const db = await readDB();
  const order = db.orders.find((o) => o.id === orderId && o.type === "course");
  const product = db.products.find((p) => p.id === order?.productId);
  const creator = db.users.find((u) => u.id === order?.userId);
  if (!order || !product || !creator) notFound();
  const theme = getTheme(creator.theme);

  return (
    <div className="flex-1 bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href={`/${creator.username}`} className="flex items-center gap-2 text-sm font-medium">
            <Avatar name={creator.name} src={creator.avatar} size={28} /> {creator.name}
          </Link>
          <span className="text-sm text-neutral-500">Signed in as {order.buyerEmail}</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-6 text-3xl font-bold">{product.title}</h1>
        <CoursePlayer orderId={order.id} lessons={product.lessons} accent={theme.accent} />
      </main>
    </div>
  );
}
