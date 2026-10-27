import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

export function Stat({ label, value, icon: Icon, delta }: { label: string; value: string; icon?: LucideIcon; delta?: number | null }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper text-neutral-500">
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="tabular mt-2 font-display text-[28px] font-semibold leading-none tracking-tight">{value}</p>
      {delta != null && Number.isFinite(delta) && (
        <p className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${delta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(delta).toFixed(0)}% vs previous 30 days
        </p>
      )}
    </div>
  );
}
