import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreView } from "@/components/StoreView";
import { Tracker } from "@/components/Tracker";
import { readDB, toPublicUser } from "@/lib/db";

async function load(username: string) {
  const db = await readDB();
  const user = db.users.find((u) => u.username === username.toLowerCase());
  if (!user) return null;
  return { user, products: db.products.filter((p) => p.userId === user.id && p.published) };
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const data = await load((await params).username);
  if (!data) return {};
  return { title: `${data.user.name} | Vitrine`, description: data.user.bio };
}

export default async function PublicStore({ params }: { params: Promise<{ username: string }> }) {
  const data = await load((await params).username);
  if (!data) notFound();
  return (
    <div className="flex flex-1 flex-col">
      <Tracker userId={data.user.id} />
      <StoreView user={toPublicUser(data.user)} products={data.products} live />
    </div>
  );
}
