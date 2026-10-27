import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductIconTile } from "@/components/icons";
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
          <Link href="/dashboard/store" className="rounded-lg p-1.5 text-neutral-400 hover:bg-white hover:text-ink"><ArrowLeft size={20} /></Link>
          <h1 className="font-display text-3xl font-semibold tracking-tight">What do you want to sell?</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(PRODUCT_TYPES) as [ProductType, (typeof PRODUCT_TYPES)[ProductType]][]).map(([key, t]) => (
            <Link key={key} href={`/dashboard/store/products/new?type=${key}`} className="card group transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-600/5">
              <ProductIconTile type={key} size={44} />
              <h2 className="mt-4 flex items-center justify-between font-semibold">{t.label}<ArrowRight size={16} className="text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" /></h2>
              <p className="mt-1 text-sm text-muted">{t.description}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const t = type as ProductType;
  return <ProductEditor user={toPublicUser(user)} product={newProduct(user.id, { type: t })} />;
}
