import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PhoneFrame, StoreView } from "@/components/StoreView";
import { getCurrentUser } from "@/lib/auth";
import { readDB, toPublicUser } from "@/lib/db";

const FEATURES = [
  { icon: "📦", title: "Digital products", text: "E-books, templates, presets, PDFs. Upload once, deliver automatically after every sale." },
  { icon: "📅", title: "Coaching & bookings", text: "Set your availability and let clients book and pay for 1:1 calls in a few taps." },
  { icon: "🎓", title: "Online courses", text: "Bundle lessons and videos into a course your students can take at their own pace." },
  { icon: "🧲", title: "Lead magnets", text: "Grow your email list by trading a freebie for an address. Export contacts anytime." },
  { icon: "⭐", title: "Memberships", text: "Recurring income from your most loyal fans with a simple monthly subscription." },
  { icon: "📈", title: "Analytics", text: "See store views, clicks, conversion rate and revenue for every product." },
];

const FAQ = [
  { q: "Do I need a website?", a: "No. Your Vitrine page is your website. Paste the link in your Instagram, TikTok or YouTube bio and start selling." },
  { q: "How do I get paid?", a: "This build runs payments in test mode. Connect a Stripe account to accept real payments (see README)." },
  { q: "Can I use my own branding?", a: "Yes. Pick a theme, upload a profile photo and product images, and customise every button label." },
  { q: "Is there a fee per sale?", a: "No transaction fees from Vitrine. Your payment processor's standard fees still apply." },
];

export default async function Home() {
  const [user, db] = await Promise.all([getCurrentUser(), readDB()]);
  const demo = db.users.find((u) => u.username === "demo");
  const demoProducts = demo ? db.products.filter((p) => p.userId === demo.id) : [];

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 border-b border-neutral-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden gap-8 text-sm font-medium text-neutral-600 md:flex">
            <a href="#features" className="hover:text-neutral-900">Features</a>
            <a href="#pricing" className="hover:text-neutral-900">Pricing</a>
            <a href="#faq" className="hover:text-neutral-900">FAQ</a>
            <Link href="/demo" className="hover:text-neutral-900">Example store</Link>
          </nav>
          <div className="flex gap-2">
            {user ? (
              <Link href="/dashboard" className="btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">Log in</Link>
                <Link href="/signup" className="btn-primary">Start free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">For creators, coaches & educators</span>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Turn your link in bio into a <span className="text-violet-600">store</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-neutral-600">
              Sell digital products, book coaching calls, launch courses and grow your email list, all from one
              mobile-first page your followers will love.
            </p>
            <form action="/signup" className="mt-8 flex max-w-md items-center rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm">
              <span className="pl-3 text-sm text-neutral-500">vitrine.app/</span>
              <input name="username" placeholder="yourname" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" />
              <button className="btn-primary">Claim it</button>
            </form>
            <p className="mt-3 text-xs text-neutral-500">Free 14-day trial · No credit card required</p>
          </div>
          <div className="flex justify-center">
            {demo && (
              <PhoneFrame>
                <StoreView user={toPublicUser(demo)} products={demoProducts} />
              </PhoneFrame>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center text-4xl font-extrabold tracking-tight">Everything you need to earn online</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">One page, every way to monetise your audience. Set up in minutes, no code required.</p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card transition hover:shadow-lg">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-950 py-24 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-3">
          {[
            ["1", "Claim your link", "Pick a username and set up your profile in under a minute."],
            ["2", "Add your products", "Choose from six product types and customise each one."],
            ["3", "Share & get paid", "Drop the link in your bio. Sales and bookings land in your dashboard."],
          ].map(([n, t, d]) => (
            <div key={n}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 font-bold">{n}</div>
              <h3 className="mt-4 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-neutral-400">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center text-4xl font-extrabold tracking-tight">Simple pricing</h2>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          {[
            { name: "Creator", price: "$19", items: ["Unlimited products", "Coaching bookings", "Lead magnets", "Analytics", "0% transaction fees"] },
            { name: "Creator Pro", price: "$59", items: ["Everything in Creator", "Online courses", "Memberships", "Email export", "Priority support"], hot: true },
          ].map((p) => (
            <div key={p.name} className={`card relative ${p.hot ? "border-violet-500 ring-4 ring-violet-100" : ""}`}>
              {p.hot && <span className="absolute -top-3 right-6 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="mt-2 text-4xl font-extrabold">{p.price}<span className="text-base font-medium text-neutral-500">/month</span></p>
              <ul className="mt-6 space-y-2 text-sm">
                {p.items.map((i) => <li key={i}>✓ {i}</li>)}
              </ul>
              <Link href="/signup" className={`mt-8 w-full ${p.hot ? "btn-primary" : "btn-ghost"}`}>Start free trial</Link>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-3xl px-6 pb-24">
        <h2 className="text-center text-4xl font-extrabold tracking-tight">Questions?</h2>
        <div className="mt-10 divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
          {FAQ.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {f.q}
                <span className="text-neutral-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-neutral-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-100 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-neutral-500 md:flex-row">
          <Logo className="text-base text-neutral-900" />
          <p>© {new Date().getFullYear()} Vitrine. Built for creators.</p>
        </div>
      </footer>
    </div>
  );
}
