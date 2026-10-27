"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChartColumn, Check, Copy, House, Settings, Store, Users, Wallet } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/dashboard/store", label: "My Store", icon: Store },
  { href: "/dashboard/income", label: "Income", icon: Wallet },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartColumn },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`group flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-paper hover:text-ink"
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.25 : 1.75} className={active ? "text-brand-600" : "text-neutral-400 group-hover:text-ink"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="btn-ghost py-1.5 text-xs"
    >
      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
