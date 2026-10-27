"use client";

import { useState } from "react";
import { money } from "@/lib/format";

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((x) => x >= v)!;
}

/** Dependency-free daily bar chart: faint grid, labelled y-axis, hover tooltip, emphasised latest bar. */
export function BarChart({ data, unit = "money", color = "#2a44f0" }: { data: { day: string; value: number }[]; unit?: "money" | "visits"; color?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const format = (n: number) => (unit === "money" ? money(n * 100) : `${n} visits`);
  const axis = (n: number) => (unit === "money" ? `$${n >= 1000 ? `${n / 1000}k` : n}` : String(n));
  const fmtDay = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const ticks = [max, max / 2, 0];

  return (
    <div className="relative flex gap-3">
      <div className="tabular flex h-48 flex-col justify-between text-right text-[11px] text-neutral-400">
        {ticks.map((t) => <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{axis(t)}</span>)}
      </div>
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48">
          {ticks.map((t, i) => (
            <div key={t} className="absolute inset-x-0 border-t border-dashed border-line" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }} />
          ))}
        </div>
        <div className="relative flex h-48 items-end gap-[3px]" onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => (
            <div key={d.day} className="flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)}>
              <div
                className="w-full rounded-t-[4px] transition-opacity"
                style={{
                  height: `${Math.max((d.value / max) * 100, d.value ? 2 : 0.6)}%`,
                  background: color,
                  opacity: hover === null ? (i === data.length - 1 ? 1 : 0.55) : hover === i ? 1 : 0.25,
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-neutral-400">
          <span>{fmtDay(data[0]!.day)}</span>
          <span>{fmtDay(data[data.length - 1]!.day)}</span>
        </div>
        {hover !== null && (
          <div className="pointer-events-none absolute -top-3 rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white shadow-lg" style={{ left: `${(hover / data.length) * 100}%`, transform: "translateX(-40%)" }}>
            <div className="tabular font-semibold">{format(data[hover]!.value)}</div>
            <div className="text-neutral-400">{fmtDay(data[hover]!.day)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
