"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/dashboard/store", label: "My Store", icon: "🛍️" },
  { href: "/dashboard/income", label: "Income", icon: "💰" },
  { href: "/dashboard/customers", label: "Customers", icon: "👥" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export function DashboardNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {NAV.map((n) => {
        const active = n.href === "/dashboard" ? path === n.href : path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-violet-100 text-violet-800" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <span>{n.icon}</span>
            {n.label}
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
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
