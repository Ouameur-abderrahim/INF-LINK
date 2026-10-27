import {
  CalendarCheck,
  Crown,
  GraduationCap,
  Link2,
  Magnet,
  Package,
  Music2,
  Globe,
  type LucideProps,
} from "lucide-react";
import type { ProductType } from "@/lib/types";

export const PRODUCT_ICONS: Record<ProductType, React.ComponentType<LucideProps>> = {
  digital: Package,
  coaching: CalendarCheck,
  course: GraduationCap,
  lead: Magnet,
  membership: Crown,
  link: Link2,
};

/** Accent tint per product type, used for icon tiles in the dashboard. */
export const PRODUCT_TINTS: Record<ProductType, string> = {
  digital: "bg-brand-50 text-brand-700",
  coaching: "bg-emerald-50 text-emerald-700",
  course: "bg-amber-50 text-amber-700",
  lead: "bg-rose-50 text-rose-700",
  membership: "bg-sky-50 text-sky-700",
  link: "bg-neutral-100 text-neutral-700",
};

export function ProductIcon({ type, ...props }: { type: ProductType } & LucideProps) {
  const Icon = PRODUCT_ICONS[type];
  return <Icon strokeWidth={1.75} {...props} />;
}

export function ProductIconTile({ type, size = 40 }: { type: ProductType; size?: number }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-xl ${PRODUCT_TINTS[type]}`} style={{ width: size, height: size }}>
      <ProductIcon type={type} size={size * 0.5} />
    </span>
  );
}

type SvgProps = React.SVGProps<SVGSVGElement> & { size?: number };
const svg = ({ size = 16, ...p }: SvgProps) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...p });

function InstagramIcon(p: SvgProps) {
  return (
    <svg {...svg(p)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}
function YoutubeIcon(p: SvgProps) {
  return (
    <svg {...svg(p)}>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
    </svg>
  );
}
function XIcon(p: SvgProps) {
  return (
    <svg {...svg(p)}>
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  );
}

export const SOCIAL_ICONS: Record<string, React.ComponentType<SvgProps & LucideProps>> = {
  instagram: InstagramIcon,
  tiktok: Music2,
  youtube: YoutubeIcon,
  x: XIcon,
  website: Globe,
};
