"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { ProductIconTile } from "./icons";
import { useState, useTransition } from "react";
import { saveProduct, type ProductInput } from "@/app/actions";
import type { Product, PublicUser } from "@/lib/types";
import { PRODUCT_TYPES } from "@/lib/types";
import { getTheme } from "@/lib/themes";
import { ImageInput } from "./ImageInput";
import { PhoneFrame, ProductCard } from "./StoreView";
import { ProductDetail } from "./ProductDetail";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ProductEditor({ product, user }: { product: Product; user: PublicUser }) {
  const isNew = !product.title;
  const [p, setP] = useState<ProductInput>({
    id: isNew ? undefined : product.id,
    type: product.type,
    title: product.title,
    subtitle: product.subtitle,
    description: product.description,
    price: product.price,
    image: product.image,
    buttonLabel: product.buttonLabel || PRODUCT_TYPES[product.type].defaultButton,
    url: product.url,
    duration: product.duration,
    availability: product.availability,
    lessons: product.lessons,
    published: product.published,
  });
  const [priceText, setPriceText] = useState(product.price ? (product.price / 100).toFixed(2) : "");
  const [error, setError] = useState("");
  const [view, setView] = useState<"card" | "page">("card");
  const [pending, start] = useTransition();
  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setP((x) => ({ ...x, [k]: v }));
  const meta = PRODUCT_TYPES[p.type];
  const theme = getTheme(user.theme);
  const preview: Product = { ...product, ...p, id: product.id };
  const paid = p.type !== "lead" && p.type !== "link";

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_340px]">
      <form
        className="min-w-0 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          start(async () => {
            const r = await saveProduct(p);
            if (r?.error) setError(r.error);
          });
        }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard/store" className="rounded-lg p-1.5 text-neutral-400 hover:bg-white hover:text-ink"><ArrowLeft size={20} /></Link>
          <ProductIconTile type={p.type} size={36} />
          <h1 className="font-display text-2xl font-semibold tracking-tight">{isNew ? "New" : "Edit"} {meta.label}</h1>
        </div>

        <section className="card space-y-5">
          <h2 className="font-semibold">Store card</h2>
          <div>
            <span className="label">Thumbnail</span>
            <ImageInput value={p.image} onChange={(v) => set("image", v)} />
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" value={p.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. My Ultimate Guide" required />
          </div>
          {p.type !== "link" && (
            <div>
              <label className="label">Subtitle</label>
              <input className="input" value={p.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="One line that sells it" />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {paid && (
              <div>
                <label className="label">Price (USD){p.type === "membership" && " / month"}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm text-neutral-500">$</span>
                  <input
                    className="input pl-7"
                    inputMode="decimal"
                    value={priceText}
                    placeholder="0.00"
                    onChange={(e) => {
                      setPriceText(e.target.value);
                      set("price", Math.round((parseFloat(e.target.value) || 0) * 100));
                    }}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="label">Button label</label>
              <input className="input" value={p.buttonLabel} onChange={(e) => set("buttonLabel", e.target.value)} />
            </div>
          </div>
        </section>

        {p.type !== "link" && (
          <section className="card space-y-5">
            <h2 className="font-semibold">Checkout page</h2>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-32" value={p.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell buyers what they get, who it's for and why it's worth it." />
            </div>
          </section>
        )}

        <section className="card space-y-5">
          <h2 className="font-semibold">{p.type === "link" ? "Destination" : "Delivery"}</h2>
          {(p.type === "link" || p.type === "digital" || p.type === "lead" || p.type === "membership") && (
            <div>
              <label className="label">
                {p.type === "link" ? "URL" : p.type === "membership" ? "Community / content link (shown after purchase)" : "File or download link (shown after purchase)"}
              </label>
              <input className="input" type="url" value={p.url} onChange={(e) => set("url", e.target.value)} placeholder="https://" required={p.type === "link"} />
            </div>
          )}

          {p.type === "coaching" && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Call length (min)</label>
                  <select className="input" value={p.duration} onChange={(e) => set("duration", Number(e.target.value))}>
                    {[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} minutes</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Available from</label>
                  <input type="time" className="input" value={p.availability.start} onChange={(e) => set("availability", { ...p.availability, start: e.target.value })} />
                </div>
                <div>
                  <label className="label">Until</label>
                  <input type="time" className="input" value={p.availability.end} onChange={(e) => set("availability", { ...p.availability, end: e.target.value })} />
                </div>
              </div>
              <div>
                <span className="label">Available days</span>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d, i) => {
                    const on = p.availability.days.includes(i);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() =>
                          set("availability", {
                            ...p.availability,
                            days: on ? p.availability.days.filter((x) => x !== i) : [...p.availability.days, i].sort(),
                          })
                        }
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${on ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-600"}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {p.type === "course" && (
            <div className="space-y-3">
              {p.lessons.map((l, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-neutral-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-neutral-400">Lesson {i + 1}</span>
                    <button type="button" className="text-xs text-neutral-400 hover:text-red-600" onClick={() => set("lessons", p.lessons.filter((_, j) => j !== i))}>Remove</button>
                  </div>
                  <input className="input" placeholder="Lesson title" value={l.title} onChange={(e) => set("lessons", p.lessons.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                  <input className="input" placeholder="Video URL (YouTube, Vimeo or .mp4), optional" value={l.videoUrl} onChange={(e) => set("lessons", p.lessons.map((x, j) => (j === i ? { ...x, videoUrl: e.target.value } : x)))} />
                  <textarea className="input min-h-20" placeholder="Lesson notes" value={l.content} onChange={(e) => set("lessons", p.lessons.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))} />
                </div>
              ))}
              <button type="button" className="btn-ghost" onClick={() => set("lessons", [...p.lessons, { title: "", content: "", videoUrl: "" }])}><Plus size={16} /> Add lesson</button>
            </div>
          )}
        </section>

        <label className="flex items-center gap-3 text-sm font-medium">
          <input type="checkbox" checked={p.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-brand-600" />
          Show on my store
        </label>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex gap-3">
          <button disabled={pending} className="btn-primary">{pending ? "Saving…" : isNew ? "Publish product" : "Save changes"}</button>
          <Link href="/dashboard/store" className="btn-ghost">Cancel</Link>
        </div>
      </form>

      <div className="hidden lg:block">
        <div className="sticky top-8">
          {p.type !== "link" && (
            <div className="mb-3 flex justify-center gap-1 text-xs font-medium">
              {(["card", "page"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`rounded-lg px-3 py-1 ${view === v ? "bg-neutral-900 text-white" : "text-neutral-500"}`}>
                  {v === "card" ? "Store card" : "Checkout page"}
                </button>
              ))}
            </div>
          )}
          <PhoneFrame>
            {view === "page" && p.type !== "link" ? (
              <ProductDetail product={preview} user={user} />
            ) : (
              <div className="min-h-full p-5 pt-12" style={{ background: theme.bg }}>
                <ProductCard product={preview} theme={theme} />
              </div>
            )}
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}
