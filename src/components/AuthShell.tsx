import { Check } from "lucide-react";
import { Logo } from "./Logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mb-8 mt-2 text-sm text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <div aria-hidden className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl" />
        <div aria-hidden className="absolute bottom-40 left-10 h-64 w-64 rounded-full bg-signal/20 blur-3xl" />
        <div className="relative max-w-md">
          <p className="font-display text-3xl font-semibold leading-tight tracking-tight">Everything you sell, behind one link.</p>
          <ul className="mt-8 space-y-3 text-neutral-300">
            {["Digital downloads delivered automatically", "Paid 1:1 calls booked straight into your calendar", "Courses, memberships and lead magnets", "0% Vitrine transaction fees"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10"><Check size={14} /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
