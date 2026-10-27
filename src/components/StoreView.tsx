import Link from "next/link";
import type { Product, PublicUser } from "@/lib/types";
import { PRODUCT_TYPES } from "@/lib/types";
import { ProductIcon, SOCIAL_ICONS } from "./icons";
import { getTheme } from "@/lib/themes";
import { initials, priceLabel } from "@/lib/format";

type StoreUser = Pick<PublicUser, "name" | "username" | "bio" | "avatar" | "theme" | "socials">;

const SOCIAL_URLS: Record<string, (h: string) => string> = {
  instagram: (h) => `https://instagram.com/${h}`,
  tiktok: (h) => `https://tiktok.com/@${h}`,
  youtube: (h) => `https://youtube.com/@${h}`,
  x: (h) => `https://x.com/${h}`,
  website: (h) => (h.startsWith("http") ? h : `https://${h}`),
};

export function Avatar({ name, src, size = 96, ring }: { name: string; src: string; size?: number; ring?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size, boxShadow: ring ? `0 0 0 4px ${ring}` : undefined }} />
  ) : (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-bold text-white"
      style={{ width: size, height: size, fontSize: size / 2.6, boxShadow: ring ? `0 0 0 4px ${ring}` : undefined }}
    >
      {initials(name) || "?"}
    </div>
  );
}

export function ProductThumb({ product, size = 64 }: { product: Pick<Product, "image" | "type" | "title">; size?: number }) {
  return product.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={product.image} alt={product.title} className="shrink-0 rounded-xl object-cover" style={{ width: size, height: size }} />
  ) : (
    <div className="flex shrink-0 items-center justify-center rounded-xl bg-black/5" style={{ width: size, height: size }}>
      <ProductIcon type={product.type} size={size * 0.42} />
    </div>
  );
}

export function ProductCard({ product, href, theme }: { product: Product; href?: string; theme: ReturnType<typeof getTheme> }) {
  const label = product.buttonLabel || PRODUCT_TYPES[product.type].defaultButton;
  const price = priceLabel(product.price, product.type);
  const body = (
    <div className="rounded-2xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ background: theme.card, color: theme.text }}>
      <div className="flex gap-4">
        <ProductThumb product={product} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug">{product.title || "Untitled product"}</h3>
          {product.subtitle && <p className="mt-0.5 text-sm" style={{ color: theme.muted }}>{product.subtitle}</p>}
          {price && <p className="mt-1 text-sm font-bold" style={{ color: theme.accent }}>{price}</p>}
        </div>
      </div>
      <div className="mt-4 rounded-xl py-2.5 text-center text-sm font-semibold" style={{ background: theme.accent, color: theme.accentText }}>
        {label}
      </div>
    </div>
  );
  if (!href) return body;
  const external = product.type === "link";
  return (
    <Link href={href} prefetch={false} target={external ? "_blank" : undefined} className="block">
      {body}
    </Link>
  );
}

export function StoreView({ user, products, live = false }: { user: StoreUser; products: Product[]; live?: boolean }) {
  const theme = getTheme(user.theme);
  const visible = products.filter((p) => p.published).sort((a, b) => a.position - b.position);
  const socials = Object.entries(user.socials).filter(([, v]) => v);

  return (
    <div className="min-h-full px-5 pb-10 pt-10" style={{ background: theme.bg, color: theme.text }}>
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <Avatar name={user.name} src={user.avatar} ring={theme.card} />
        <h1 className="mt-4 font-display text-2xl font-bold">{user.name || "Your Name"}</h1>
        <p className="text-sm" style={{ color: theme.muted }}>@{user.username}</p>
        {user.bio && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{user.bio}</p>}
        {socials.length > 0 && (
          <div className="mt-4 flex gap-2">
            {socials.map(([k, v]) => {
              const Icon = SOCIAL_ICONS[k]!;
              return (
              <a
                key={k}
                href={live ? SOCIAL_URLS[k]!(v) : undefined}
                target="_blank"
                rel="noreferrer"
                aria-label={k}
                className="flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition hover:scale-105"
                style={{ background: theme.card, color: theme.text }}
              >
                <Icon size={16} />
              </a>
              );
            })}
          </div>
        )}
      </div>

      <div className="mx-auto mt-8 flex max-w-md flex-col gap-4">
        {visible.length === 0 && (
          <p className="rounded-2xl border border-dashed p-6 text-center text-sm" style={{ borderColor: theme.muted, color: theme.muted }}>
            No products yet.
          </p>
        )}
        {visible.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            theme={theme}
            href={live ? (p.type === "link" ? `/go/${p.id}` : `/${user.username}/p/${p.id}`) : undefined}
          />
        ))}
      </div>

      {live && (
        <p className="mt-10 text-center text-xs" style={{ color: theme.muted }}>
          <Link href="/" className="hover:underline">Made with Vitrine</Link>
        </p>
      )}
    </div>
  );
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto h-[640px] w-[320px] rounded-[44px] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl">
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
      <div className="h-full w-full overflow-y-auto rounded-[34px] bg-white [scrollbar-width:none]">{children}</div>
    </div>
  );
}
