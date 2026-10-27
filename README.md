# INF-LINK

A link-in-bio storefront for creators and coaches. Sell digital downloads, paid 1:1 coaching calls, online courses, memberships and email lead magnets from one mobile page.

Built with Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS v4 and lucide-react.

## Features

- **Public store** at `/<username>` with themes, avatar, bio and social links
- **Six product types:** digital product, coaching call (availability + slot booking), online course (video lessons + progress), lead magnet, membership, external link
- **Checkout** with booking conflict protection and post-purchase delivery (download, booking confirmation, course player)
- **Creator dashboard:** store editor with live phone preview, product editor, income, customers (CSV export), analytics, settings
- **Auth** with scrypt-hashed passwords and HTTP-only session cookies

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. On first run a demo account is seeded with sample products and 30 days of activity:

- Store: http://localhost:3000/demo
- Login: `demo@inf.link` / `demo1234`

## Project structure

```
src/
  app/                 routes (landing, auth, dashboard, public store, checkout, API)
  app/actions.ts       server actions (auth, profile, products, checkout)
  components/          UI components (StoreView, editors, charts, icons)
  lib/                 data layer, auth, themes, stats helpers
data/db.json           local JSON database (git-ignored, created on first run)
```

## Limitations / next steps

- Payments run in **test mode** (any 16-digit card, e.g. `4242 4242 4242 4242`). Integrate Stripe Checkout / Connect for real payments.
- Data is stored in a local JSON file; move to Postgres (e.g. with Prisma or Drizzle) before deploying.
- No transactional emails yet (receipts, booking reminders).
- Booking times are not timezone-aware; memberships do not auto-renew.
