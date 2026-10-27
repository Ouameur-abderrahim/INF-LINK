import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { Tracker } from "@/components/Tracker";
import { readDB, toPublicUser } from "@/lib/db";

type Params = { params: Promise<{ username: string; id: string }> };

async function load({ params }: Params) {
  const { username, id } = await params;
  const db = await readDB();
  const user = db.users.find((u) => u.username === username.toLowerCase());
  const product = db.products.find((p) => p.id === id && p.userId === user?.id && p.published && p.type !== "link");
  if (!user || !product) return null;
  const booked = db.orders
    .filter((o) => o.productId === product.id && o.booking)
    .map((o) => `${o.booking!.date} ${o.booking!.time}`);
  return { user, product, booked };
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const data = await load(props);
  if (!data) return {};
  return { title: `${data.product.title} | ${data.user.name}`, description: data.product.subtitle };
}

export default async function ProductPage(props: Params) {
  const data = await load(props);
  if (!data) notFound();
  return (
    <div className="flex flex-1 flex-col">
      <Tracker userId={data.user.id} productId={data.product.id} />
      <ProductDetail product={data.product} user={toPublicUser(data.user)} booked={data.booked} live />
    </div>
  );
}
