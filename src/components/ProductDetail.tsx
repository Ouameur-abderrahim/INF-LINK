"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Lock } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { checkout } from "@/app/actions";
import type { Product, PublicUser } from "@/lib/types";
import { PRODUCT_TYPES } from "@/lib/types";
import { getTheme } from "@/lib/themes";
import { priceLabel } from "@/lib/format";
import { Avatar } from "./StoreView";
import { ProductIcon } from "./icons";

type Props = {
  product: Product;
  user: Pick<PublicUser, "name" | "username" | "avatar" | "theme">;
  live?: boolean;
  booked?: string[]; // "YYYY-MM-DD HH:MM"
};

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h! * 60 + m!;
}
function fromMin(n: number) {
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}
function localDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function useSlots(product: Product, booked: string[]) {
  return useMemo(() => {
    const days: { date: string; label: string; times: string[] }[] = [];
    const { start, end, days: weekdays } = product.availability;
    const now = new Date();
    for (let i = 0; i < 21 && days.length < 10; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      if (!weekdays.includes(d.getDay())) continue;
      const date = localDay(d);
      const times: string[] = [];
      for (let m = toMin(start); m + product.duration <= toMin(end); m += product.duration) {
        const t = fromMin(m);
        const slotTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(m / 60), m % 60);
        if (slotTime > now && !booked.includes(`${date} ${t}`)) times.push(t);
      }
      if (times.length) days.push({ date, label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }), times });
    }
    return days;
  }, [product, booked]);
}

export function ProductDetail({ product, user, live = false, booked = [] }: Props) {
  const theme = getTheme(user.theme);
  const [state, action, pending] = useActionState(checkout, undefined);
  const slots = useSlots(product, booked);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const free = product.price === 0;
  const label = product.buttonLabel || PRODUCT_TYPES[product.type].defaultButton;
  const inputStyle = { background: theme.card, color: theme.text, borderColor: `${theme.muted}55` };
  const inputCls = "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none";
  const activeDate = date || slots[0]?.date || "";

  return (
    <div className="min-h-full pb-10" style={{ background: theme.bg, color: theme.text }}>
      <div className="mx-auto max-w-md px-5 pt-6">
        {live ? (
          <Link href={`/${user.username}`} className="flex items-center gap-2 text-sm" style={{ color: theme.muted }}>
            <ArrowLeft size={16} /> <Avatar name={user.name} src={user.avatar} size={24} /> {user.name}
          </Link>
        ) : (
          <div className="flex items-center gap-2 pt-4 text-sm" style={{ color: theme.muted }}>
            <ArrowLeft size={16} /> <Avatar name={user.name} src={user.avatar} size={24} /> {user.name}
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-2xl" style={{ background: theme.card }}>
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.title} className="aspect-video w-full object-cover" />
          ) : (
            <div className="flex aspect-video items-center justify-center" style={{ background: `${theme.accent}18`, color: theme.accent }}>
              <ProductIcon type={product.type} size={56} strokeWidth={1.25} />
            </div>
          )}
          <div className="p-5">
            <h1 className="text-xl font-bold">{product.title || "Untitled product"}</h1>
            {product.subtitle && <p className="mt-1 text-sm" style={{ color: theme.muted }}>{product.subtitle}</p>}
            <p className="mt-3 text-2xl font-extrabold" style={{ color: theme.accent }}>{priceLabel(product.price, product.type)}</p>
            {product.type === "coaching" && <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: theme.muted }}><Clock size={13} /> {product.duration}-minute video call</p>}
            {product.type === "course" && product.lessons.length > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: theme.muted }}><BookOpen size={13} /> {product.lessons.length} lessons · lifetime access</p>
            )}
            {product.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{product.description}</p>}
            {product.type === "course" && product.lessons.length > 0 && (
              <ol className="mt-4 space-y-1.5 text-sm">
                {product.lessons.map((l, i) => (
                  <li key={i} className="flex gap-2"><span style={{ color: theme.accent }}>{i + 1}.</span>{l.title}</li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <form action={live ? action : undefined} onSubmit={live ? undefined : (e) => e.preventDefault()} className="mt-5 space-y-3 rounded-2xl p-5" style={{ background: theme.card }}>
          <input type="hidden" name="productId" value={product.id} />

          {product.type === "coaching" && (
            <div>
              <p className="mb-2 text-sm font-semibold">Pick a time</p>
              {slots.length === 0 ? (
                <p className="text-sm" style={{ color: theme.muted }}>No availability in the next few weeks.</p>
              ) : (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {slots.map((s) => (
                      <button
                        type="button"
                        key={s.date}
                        onClick={() => { setDate(s.date); setTime(""); }}
                        className="shrink-0 rounded-xl border px-3 py-2 text-xs font-medium"
                        style={activeDate === s.date ? { background: theme.accent, color: theme.accentText, borderColor: theme.accent } : inputStyle}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {slots.find((s) => s.date === activeDate)?.times.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTime(t)}
                        className="rounded-lg border py-2 text-xs font-medium"
                        style={time === t ? { background: theme.accent, color: theme.accentText, borderColor: theme.accent } : inputStyle}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <input type="hidden" name="date" value={time ? activeDate : ""} />
              <input type="hidden" name="time" value={time} />
            </div>
          )}

          <input name="name" placeholder="Full name" className={inputCls} style={inputStyle} required={live} />
          <input name="email" type="email" placeholder="Email address" className={inputCls} style={inputStyle} required={live} />
          {!free && (
            <div className="space-y-1">
              <input name="card" inputMode="numeric" placeholder="Card number  4242 4242 4242 4242" className={inputCls} style={inputStyle} required={live} />
              <p className="flex items-center gap-1 text-[11px]" style={{ color: theme.muted }}><Lock size={11} /> Test mode: no real charge is made.</p>
            </div>
          )}
          {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
          <button disabled={pending} className="w-full rounded-xl py-3 text-sm font-bold disabled:opacity-60" style={{ background: theme.accent, color: theme.accentText }}>
            {pending ? "Processing…" : free ? label : `${label} · ${priceLabel(product.price, product.type)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
