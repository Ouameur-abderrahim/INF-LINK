import { StoreEditor } from "@/components/StoreEditor";
import { requireUser } from "@/lib/auth";
import { readDB, toPublicUser } from "@/lib/db";

export default async function StorePage() {
  const user = await requireUser();
  const db = await readDB();
  const products = db.products.filter((p) => p.userId === user.id);
  return <StoreEditor user={toPublicUser(user)} products={products} />;
}
