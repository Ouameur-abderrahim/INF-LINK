"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteProduct, reorderProducts, saveProfile, togglePublished } from "@/app/actions";
import type { Product, PublicUser } from "@/lib/types";
import { PRODUCT_TYPES } from "@/lib/types";
import { THEMES } from "@/lib/themes";
import { priceLabel } from "@/lib/format";
import { ImageInput } from "./ImageInput";
import { PhoneFrame, ProductThumb, StoreView } from "./StoreView";

export function StoreEditor({ user, products: initial }: { user: PublicUser; products: Product[] }) {
  const [tab, setTab] = useState<"products" | "design">("products");
  const [profile, setProfile] = useState({
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
    theme: user.theme,
    socials: user.socials,
  });
  const [products, setProducts] = useState(() => [...initial].sort((a, b) => a.position - b.position));
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= products.length) return;
    const next = [...products];
    [next[i], next[j]] = [next[j]!, next[i]!];
    const withPos = next.map((p, idx) => ({ ...p, position: idx }));
    setProducts(withPos);
    start(() => reorderProducts(withPos.map((p) => p.id)));
  };

  const set = <K extends keyof typeof profile>(k: K, v: (typeof profile)[K]) => setProfile((p) => ({ ...p, [k]: v }));

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Store</h1>
          <div className="flex rounded-xl bg-neutral-200/60 p-1 text-sm font-medium">
            {(["products", "design"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-1.5 ${tab === t ? "bg-white shadow-sm" : "text-neutral-600"}`}>
                {t === "products" ? "Products" : "Profile & Design"}
              </button>
            ))}
          </div>
        </div>

        {tab === "products" ? (
          <div className="space-y-3">
            {products.map((p, i) => (
              <div key={p.id} className={`card flex items-center gap-4 p-4 ${p.published ? "" : "opacity-60"}`}>
                <div className="flex flex-col text-neutral-400">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="px-1 hover:text-neutral-900 disabled:opacity-30">▲</button>
                  <button onClick={() => move(i, 1)} disabled={i === products.length - 1} className="px-1 hover:text-neutral-900 disabled:opacity-30">▼</button>
                </div>
                <ProductThumb product={p} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.title}</p>
                  <p className="text-sm text-neutral-500">
                    {PRODUCT_TYPES[p.type].label}
                    {priceLabel(p.price, p.type) && ` · ${priceLabel(p.price, p.type)}`}
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-500">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={p.published}
                    onChange={() => {
                      setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, published: !x.published } : x)));
                      start(() => togglePublished(p.id));
                    }}
                  />
                  <span className="relative h-5 w-9 rounded-full bg-neutral-300 transition after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:bg-violet-600 peer-checked:after:translate-x-4" />
                </label>
                <Link href={`/dashboard/store/products/${p.id}`} className="btn-ghost py-1.5">Edit</Link>
                {confirmDelete === p.id ? (
                  <button
                    onClick={() => {
                      setProducts((ps) => ps.filter((x) => x.id !== p.id));
                      setConfirmDelete(null);
                      start(() => deleteProduct(p.id));
                    }}
                    className="btn py-1.5 bg-red-600 text-white hover:bg-red-700"
                  >
                    Confirm
                  </button>
                ) : (
                  <button onClick={() => setConfirmDelete(p.id)} className="px-2 text-neutral-400 hover:text-red-600" title="Delete">✕</button>
                )}
              </div>
            ))}
            <Link href="/dashboard/store/products/new" className="flex items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 p-6 font-semibold text-neutral-600 hover:border-violet-400 hover:text-violet-700">
              + Add product
            </Link>
          </div>
        ) : (
          <form
            className="card space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await saveProfile(profile);
                setMsg(r?.error ? { text: r.error } : { ok: true, text: "Saved!" });
              });
            }}
          >
            <div>
              <span className="label">Profile photo</span>
              <ImageInput value={profile.avatar} onChange={(v) => set("avatar", v)} round max={400} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Display name</label>
                <input className="input" value={profile.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <label className="label">Username</label>
                <input className="input" value={profile.username} onChange={(e) => set("username", e.target.value.toLowerCase())} />
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input min-h-24" maxLength={300} value={profile.bio} onChange={(e) => set("bio", e.target.value)} />
              <p className="mt-1 text-right text-xs text-neutral-400">{profile.bio.length}/300</p>
            </div>
            <div>
              <span className="label">Social handles</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(profile.socials) as (keyof typeof profile.socials)[]).map((k) => (
                  <input
                    key={k}
                    className="input"
                    placeholder={k === "website" ? "yourwebsite.com" : `${k} handle`}
                    value={profile.socials[k]}
                    onChange={(e) => set("socials", { ...profile.socials, [k]: e.target.value.replace(/^@/, "") })}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="label">Theme</span>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {THEMES.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => set("theme", t.id)}
                    className={`rounded-xl border-2 p-2 text-xs font-medium ${profile.theme === t.id ? "border-violet-600" : "border-transparent"}`}
                  >
                    <div className="flex h-12 flex-col items-center justify-center gap-1 rounded-lg" style={{ background: t.bg }}>
                      <div className="h-2 w-8 rounded" style={{ background: t.card }} />
                      <div className="h-2 w-8 rounded" style={{ background: t.accent }} />
                    </div>
                    <span className="mt-1 block">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save changes"}</button>
              {msg && <span className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</span>}
            </div>
          </form>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-8">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-neutral-400">Live preview</p>
          <PhoneFrame>
            <StoreView user={profile} products={products} />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}
