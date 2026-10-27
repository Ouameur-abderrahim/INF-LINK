import type { Order, TrackEvent } from "./types";

export function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Buckets values into the last `days` calendar days (oldest first). */
export function daily<T extends { createdAt: string }>(items: T[], days: number, value: (x: T) => number) {
  const out: { day: string; value: number }[] = [];
  const index = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const k = dayKey(new Date(Date.now() - i * 86400000));
    index.set(k, out.length);
    out.push({ day: k, value: 0 });
  }
  for (const it of items) {
    const i = index.get(it.createdAt.slice(0, 10));
    if (i !== undefined) out[i]!.value += value(it);
  }
  return out;
}

export function since<T extends { createdAt: string }>(items: T[], days: number) {
  const cutoff = Date.now() - days * 86400000;
  return items.filter((x) => new Date(x.createdAt).getTime() >= cutoff);
}

export function summary(orders: Order[], events: TrackEvent[]) {
  const revenue = orders.reduce((s, o) => s + o.amount, 0);
  const views = events.filter((e) => e.kind === "view").length;
  const clicks = events.filter((e) => e.kind === "click").length;
  return { revenue, sales: orders.length, views, clicks, conversion: views ? (orders.length / views) * 100 : 0 };
}

/** Items in the window [days*2, days) ago — the period before `since(items, days)`. */
export function previous<T extends { createdAt: string }>(items: T[], days: number) {
  const end = Date.now() - days * 86400000;
  const start = end - days * 86400000;
  return items.filter((x) => {
    const t = new Date(x.createdAt).getTime();
    return t >= start && t < end;
  });
}

export function pctChange(now: number, before: number) {
  return before ? ((now - before) / before) * 100 : null;
}
