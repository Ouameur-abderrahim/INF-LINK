"use client";

import { useState } from "react";
import { money } from "@/lib/format";

/** Minimal dependency-free daily bar chart with hover tooltip. */
export function BarChart({ data, unit = "money", color = "#7c3aed" }: { data: { day: string; value: number }[]; unit?: "money" | "visits"; color?: string }) {
  const format = (n: number) => (unit === "money" ? money(n * 100) : `${n} visits`);
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const fmtDay = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="relative">
      <div className="flex h-48 items-end gap-[3px]" onMouseLeave={() => setHover(null)}>
        {data.map((d, i) => (
          <div key={d.day} className="flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)}>
            <div
              className="w-full rounded-t-[3px] transition-opacity"
              style={{ height: `${Math.max((d.value / max) * 100, d.value ? 2 : 0.5)}%`, background: color, opacity: hover === null || hover === i ? 1 : 0.35 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-neutral-400">
        <span>{fmtDay(data[0]!.day)}</span>
        <span>{fmtDay(data[data.length - 1]!.day)}</span>
      </div>
      {hover !== null && (
        <div className="pointer-events-none absolute -top-2 rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs text-white shadow" style={{ left: `${(hover / data.length) * 100}%`, transform: "translateX(-40%)" }}>
          <div className="font-semibold">{format(data[hover]!.value)}</div>
          <div className="text-neutral-400">{fmtDay(data[hover]!.day)}</div>
        </div>
      )}
    </div>
  );
}
