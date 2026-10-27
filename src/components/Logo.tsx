import Link from "next/link";

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#2a44f0" />
      <path d="M8 10.5h3.4L16 20.6l4.6-10.1H24L17.6 24h-3.2z" fill="#fff" />
      <circle cx="24" cy="8" r="2.4" fill="#ff6a3d" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-display text-xl font-bold tracking-tight ${className}`}>
      <LogoMark />
      Vitrine
    </Link>
  );
}
