import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  GraduationCap,
  Mail,
  Magnet,
  Palette,
  Share2,
  Store,
  Wallet,
  X as XMark,
} from "lucide-react";
import { ClaimForm } from "@/components/ClaimForm";
import { ProductIconTile, SOCIAL_ICONS } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { Pricing } from "@/components/Pricing";
import { PhoneFrame, StoreView } from "@/components/StoreView";
import { getCurrentUser } from "@/lib/auth";
import { readDB, toPublicUser } from "@/lib/db";
import { money } from "@/lib/format";
import { daily, since } from "@/lib/stats";
import { THEMES } from "@/lib/themes";
import { PRODUCT_TYPES, type ProductType } from "@/lib/types";

const FAQ = [
  { q: "Do I need a website?", a: "No. Your Vitrine page is your website. Paste the link in your Instagram, TikTok or YouTube bio and start selling the same day." },
  { q: "How do I get paid?", a: "Buyers pay at checkout and the order lands in your dashboard instantly. This build runs payments in test mode; connect Stripe to accept real cards." },
  { q: "Does Vitrine take a cut of my sales?", a: "No. Vitrine charges 0% transaction fees on every plan. Your payment processor's standard card fees still apply." },
  { q: "Can I sell coaching and courses on the same page?", a: "Yes. Mix any of the six product types on one store: downloads, bookings, courses, memberships, lead magnets and links." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel from your settings in one click. Your store stays live until the end of your billing period." },
];

const PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "x", label: "X" },
  { key: "website", label: "Your website" },
];

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const w = 260;
  const h = 72;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - (v / max) * (h - 8) - 4] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1]!;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2a44f0" stopOpacity="0.22" />
          <stop offset="1" stopColor="#2a44f0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#spark)" />
      <path d={line} fill="none" stroke="#2a44f0" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#2a44f0" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

export default async function Home() {
  const [user, db] = await Promise.all([getCurrentUser(), readDB()]);
  const demo = db.users.find((u) => u.username === "demo");
  const demoProducts = demo ? db.products.filter((p) => p.userId === demo.id) : [];
  const demoOrders = demo ? db.orders.filter((o) => o.userId === demo.id) : [];
  const monthRevenue = since(demoOrders, 30).reduce((s, o) => s + o.amount, 0);
  const revenueSeries = daily(demoOrders, 30, (o) => o.amount).map((d) => d.value);
  const lastSale = [...demoOrders].filter((o) => o.amount > 0).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  return (
    <div className="flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
            <Link href="/demo" className="inline-flex items-center gap-1 hover:text-ink">Live demo <ArrowRight size={14} /></Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard" className="btn-dark">Open dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="btn px-3 text-muted hover:text-ink">Log in</Link>
                <Link href="/signup" className="btn-dark">Start free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,#e3e6ec_1px,transparent_1px),linear-gradient(to_bottom,#e3e6ec_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_70%_30%,#000_30%,transparent_75%)] opacity-60"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 md:grid-cols-[1.1fr_1fr] md:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-muted shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              The link-in-bio store for creators and coaches
            </span>
            <h1 className="mt-6 font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[64px]">
              Sell anything from your{" "}
              <span className="relative whitespace-nowrap">
                link in bio
                <svg aria-hidden viewBox="0 0 300 12" className="absolute -bottom-2 left-0 w-full" preserveAspectRatio="none">
                  <path d="M2 9 C 80 2, 220 2, 298 8" stroke="#ff6a3d" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted">
              Digital downloads, paid coaching calls, courses and memberships on one mobile page. Your followers tap, pay
              and get their product in under a minute.
            </p>
            <div className="mt-8">
              <ClaimForm />
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {["0% transaction fees", "Live in 5 minutes", "No code, no website"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check size={16} className="text-brand-600" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex justify-center py-6">
            {demo && (
              <PhoneFrame>
                <StoreView user={toPublicUser(demo)} products={demoProducts} />
              </PhoneFrame>
            )}
            {lastSale && (
              <div className="animate-float absolute left-0 top-0 z-10 hidden w-60 rounded-2xl border border-line bg-white p-3.5 shadow-xl shadow-ink/5 sm:block md:-left-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Wallet size={18} /></span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted">New sale</p>
                    <p className="truncate text-sm font-semibold">{lastSale.productTitle}</p>
                  </div>
                  <span className="tabular ml-auto text-sm font-semibold text-emerald-600">+{money(lastSale.amount)}</span>
                </div>
              </div>
            )}
            <div className="animate-float absolute bottom-0 right-0 z-10 hidden w-56 rounded-2xl border border-line bg-white p-3.5 shadow-xl shadow-ink/5 [animation-delay:1.5s] sm:block">
              <p className="text-xs text-muted">Revenue, last 30 days</p>
              <p className="tabular font-display text-2xl font-semibold">{money(monthRevenue)}</p>
              <div className="-mx-1 mt-1">
                <Sparkline values={revenueSeries} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="border-y border-line bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-5 py-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-muted">One link for every platform your audience uses</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {PLATFORMS.map(({ key, label }) => {
              const Icon = SOCIAL_ICONS[key]!;
              return (
                <li key={key} className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
                  <Icon size={18} /> {label}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Features bento */}
      <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand-600">Features</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">One page replaces your whole creator stack</h2>
          <p className="mt-4 text-lg text-muted">Booking calendar, checkout, course host and email form, built in and working together.</p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-6">
          <div className="card flex flex-col gap-6 md:col-span-4">
            <div>
              <Store size={22} className="text-brand-600" />
              <h3 className="mt-3 font-display text-xl font-semibold">Six ways to earn, one store</h3>
              <p className="mt-1 max-w-md text-sm text-muted">Mix and reorder products freely. Each type gets its own checkout, delivery and analytics.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(Object.keys(PRODUCT_TYPES) as ProductType[]).map((t) => (
                <div key={t} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <ProductIconTile type={t} size={34} />
                  <span className="text-sm font-medium">{PRODUCT_TYPES[t].label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card md:col-span-2">
            <CalendarCheck size={22} className="text-emerald-600" />
            <h3 className="mt-3 font-display text-xl font-semibold">Paid bookings</h3>
            <p className="mt-1 text-sm text-muted">Set your hours once. Clients pick a slot and pay upfront.</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-medium">
              {["09:00", "09:45", "10:30", "11:15", "14:00", "14:45"].map((t, i) => (
                <span key={t} className={`tabular rounded-lg border py-2 ${i === 2 ? "border-emerald-600 bg-emerald-600 text-white" : i === 1 ? "border-line text-neutral-300 line-through" : "border-line"}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="card md:col-span-2">
            <GraduationCap size={22} className="text-amber-600" />
            <h3 className="mt-3 font-display text-xl font-semibold">Courses</h3>
            <p className="mt-1 text-sm text-muted">Video lessons with progress tracking for every student.</p>
            <div className="mt-5 space-y-2 text-sm">
              {["Welcome & mindset", "The 5 movement patterns", "Building your weekly split"].map((l, i) => (
                <div key={l} className="flex items-center gap-2.5">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${i < 2 ? "bg-amber-500 text-white" : "border border-line text-muted"}`}>
                    {i < 2 ? <Check size={12} /> : i + 1}
                  </span>
                  <span className={i < 2 ? "text-muted" : ""}>{l}</span>
                </div>
              ))}
              <div className="mt-3 h-1.5 rounded-full bg-paper"><div className="h-1.5 w-2/3 rounded-full bg-amber-500" /></div>
            </div>
          </div>

          <div className="card md:col-span-2">
            <Magnet size={22} className="text-rose-600" />
            <h3 className="mt-3 font-display text-xl font-semibold">Lead magnets</h3>
            <p className="mt-1 text-sm text-muted">Trade a freebie for an email and grow a list you own.</p>
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-line p-1.5 pl-3 text-sm text-muted">
              <Mail size={15} /> <span className="flex-1">you@email.com</span>
              <span className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">Send it</span>
            </div>
            <p className="mt-3 text-xs font-medium text-rose-600">Every signup lands in Customers, ready to export as CSV</p>
          </div>

          <div className="card md:col-span-2">
            <BarChart3 size={22} className="text-brand-600" />
            <h3 className="mt-3 font-display text-xl font-semibold">Analytics</h3>
            <p className="mt-1 text-sm text-muted">Visits, clicks and conversion for every product.</p>
            <div className="mt-4">
              <Sparkline values={revenueSeries} />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-ink p-8 text-white md:col-span-6">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <Palette size={22} className="text-signal" />
                <h3 className="mt-3 font-display text-2xl font-semibold">Looks like you, not like a template</h3>
                <p className="mt-2 max-w-md text-neutral-400">
                  Pick a theme, upload your photo and product images, rename every button. Changes show up in a live phone
                  preview as you type.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {THEMES.map((t) => (
                  <div key={t.id} className="rounded-xl p-2" style={{ background: t.bg }}>
                    <div className="mx-auto h-6 w-6 rounded-full" style={{ background: t.accent }} />
                    <div className="mt-2 h-1.5 rounded" style={{ background: t.card }} />
                    <div className="mt-1 h-1.5 w-2/3 rounded" style={{ background: t.muted, opacity: 0.4 }} />
                    <p className="mt-2 text-center text-[10px] font-medium" style={{ color: t.text }}>{t.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-y border-line bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <p className="text-sm font-semibold text-brand-600">How it works</p>
          <h2 className="mt-2 max-w-xl font-display text-4xl font-semibold tracking-tight md:text-5xl">From sign-up to first sale in an afternoon</h2>
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { icon: Store, title: "Claim your link", text: "Choose your username, add a photo and a short bio. Your store is live immediately." },
              { icon: CreditCard, title: "Add a product", text: "Pick a product type, set a price, upload your file or set your hours. Publish in one click." },
              { icon: Share2, title: "Share and get paid", text: "Paste the link in your bio. Orders, bookings and new subscribers show up in your dashboard." },
            ].map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative rounded-2xl border border-line bg-white p-7">
                <span className="tabular font-display text-sm font-semibold text-neutral-300">0{i + 1}</span>
                <span className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={20} /></span>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto w-full max-w-6xl px-5 py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-brand-600">Simpler stack</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Stop paying for five tools that don&apos;t talk to each other</h2>
            <p className="mt-4 text-lg text-muted">
              Every extra tool is another login, another fee and another place a buyer can drop off. Vitrine keeps the
              whole journey on one page.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-line p-6">
              <p className="font-semibold text-muted">Without Vitrine</p>
              <ul className="mt-4 space-y-3">
                {["Link page", "Booking calendar", "Checkout tool", "Course platform", "Email form"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-muted"><XMark size={15} className="text-rose-500" /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-brand-600 bg-brand-50/50 p-6">
              <p className="font-semibold text-brand-700">With Vitrine</p>
              <ul className="mt-4 space-y-3">
                {["One link", "Built-in bookings", "Built-in checkout", "Built-in courses", "Built-in email list"].map((t) => (
                  <li key={t} className="flex items-center gap-2 font-medium"><Check size={15} className="text-brand-600" /> {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-y border-line bg-paper">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 md:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="text-sm font-semibold text-brand-600">Pricing</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">One flat price. Every sale is yours.</h2>
            <p className="mt-4 text-muted">Try any plan free for 14 days. No credit card needed to start.</p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2"><Clock size={15} /> Cancel anytime in one click</li>
              <li className="flex items-center gap-2"><Wallet size={15} /> 0% Vitrine fees on every plan</li>
            </ul>
          </div>
          <Pricing />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto grid w-full max-w-6xl scroll-mt-20 gap-12 px-5 py-24 md:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="text-sm font-semibold text-brand-600">FAQ</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Questions, answered</h2>
          <p className="mt-4 text-muted">
            Still unsure? <Link href="/demo" className="font-medium text-brand-700 underline underline-offset-4">Browse the live demo store</Link>.
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <ChevronDown size={18} className="shrink-0 text-neutral-400 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-ink px-8 py-16 text-white md:px-16">
          <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl" />
          <div aria-hidden className="absolute -bottom-32 right-40 h-64 w-64 rounded-full bg-signal/25 blur-3xl" />
          <div className="relative max-w-xl">
            <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Your followers are ready. Is your store?</h2>
            <p className="mt-4 text-neutral-400">Claim your link now and publish your first product before your next post goes out.</p>
            <div className="mt-8">
              <ClaimForm dark />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted">The link-in-bio store for creators, coaches and educators.</p>
          </div>
          {[
            { title: "Product", links: [["Features", "#features"], ["Pricing", "#pricing"], ["Live demo", "/demo"]] },
            { title: "Get started", links: [["Create a store", "/signup"], ["Log in", "/login"], ["FAQ", "#faq"]] },
            { title: "Sell", links: [["Digital products", "#features"], ["Coaching calls", "#features"], ["Online courses", "#features"]] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {col.links.map(([label, href]) => (
                  <li key={label}><Link href={href!} className="hover:text-ink">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-line">
          <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-muted">© {new Date().getFullYear()} Vitrine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
