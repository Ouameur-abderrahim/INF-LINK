import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/ProductEditor";
import { requireUser } from "@/lib/auth";
import { readDB, toPublicUser } from "@/lib/db";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const product = (await readDB()).products.find((p) => p.id === id && p.userId === user.id);
  if (!product) notFound();
  return <ProductEditor user={toPublicUser(user)} product={product} />;
}
