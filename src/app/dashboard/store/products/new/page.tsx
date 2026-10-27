import Link from "next/link";
import { ProductEditor } from "@/components/ProductEditor";
import { requireUser } from "@/lib/auth";
import { newProduct, toPublicUser } from "@/lib/db";
import { PRODUCT_TYPES, type ProductType } from "@/lib/types";

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const user = await requireUser();
  const { type } = await searchParams;

  if (!type || !(type in PRODUCT_TYPES)) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard/store" className="text-neutral-400 hover:text-neutral-900">←</Link>
          <h1 className="text-2xl font-bold">What do you want to add?</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(PRODUCT_TYPES) as [ProductType, (typeof PRODUCT_TYPES)[ProductType]][]).map(([key, t]) => (
            <Link key={key} href={`/dashboard/store/products/new?type=${key}`} className="card transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg">
              <div className="text-3xl">{t.icon}</div>
              <h2 className="mt-3 font-semibold">{t.label}</h2>
              <p className="mt-1 text-sm text-neutral-500">{t.description}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const t = type as ProductType;
  return <ProductEditor user={toPublicUser(user)} product={newProduct(user.id, { type: t })} />;
}
