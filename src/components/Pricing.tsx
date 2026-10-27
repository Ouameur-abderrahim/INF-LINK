"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Creator",
    monthly: 19,
    blurb: "Everything you need to start selling from your bio.",
    items: ["Unlimited products", "1:1 coaching bookings", "Digital downloads", "Email lead magnets", "Store analytics", "0% Vitrine transaction fees"],
  },
  {
    name: "Creator Pro",
    monthly: 49,
    blurb: "For creators running courses and recurring revenue.",
    items: ["Everything in Creator", "Online courses with video", "Monthly memberships", "Customer CSV export", "Custom store themes", "Priority support"],
    featured: true,
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <div>
      <div className="inline-flex rounded-full border border-line bg-white p-1 text-sm font-medium">
        {[false, true].map((y) => (
          <button
            key={String(y)}
            onClick={() => setYearly(y)}
            className={`rounded-full px-4 py-1.5 transition ${yearly === y ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
          >
            {y ? "Yearly · 2 months free" : "Monthly"}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {PLANS.map((p) => {
          const price = yearly ? Math.round((p.monthly * 10) / 12) : p.monthly;
          return (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${p.featured ? "border-ink bg-ink text-white" : "border-line bg-white"}`}
            >
              {p.featured && (
                <span className="absolute right-6 top-6 rounded-full bg-signal px-2.5 py-1 text-xs font-semibold text-white">Most popular</span>
              )}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className={`mt-1 text-sm ${p.featured ? "text-neutral-400" : "text-muted"}`}>{p.blurb}</p>
              <p className="tabular mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-semibold tracking-tight">${price}</span>
                <span className={p.featured ? "text-neutral-400" : "text-muted"}>/month</span>
              </p>
              <p className={`mt-1 h-5 text-xs ${p.featured ? "text-neutral-400" : "text-muted"}`}>{yearly ? `Billed $${p.monthly * 10} yearly` : "Billed monthly"}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.items.map((i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check size={16} className={`mt-0.5 shrink-0 ${p.featured ? "text-signal" : "text-brand-600"}`} />
                    {i}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`mt-8 w-full ${p.featured ? "btn bg-white text-ink hover:bg-neutral-100" : "btn-dark"}`}>
                Start 14-day free trial
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
