import Link from "next/link";

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#2a44f0" />
      <g fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
        <path d="M14.2 17.8a4.2 4.2 0 0 0 5.9 0l3.2-3.2a4.2 4.2 0 0 0-5.9-5.9l-1 1" />
        <path d="M17.8 14.2a4.2 4.2 0 0 0-5.9 0l-3.2 3.2a4.2 4.2 0 0 0 5.9 5.9l1-1" />
      </g>
      <circle cx="25" cy="7" r="2.4" fill="#ff6a3d" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-display text-xl font-bold tracking-tight ${className}`}>
      <LogoMark />
      INF-LINK
    </Link>
  );
}
