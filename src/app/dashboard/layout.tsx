import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { headers } from "next/headers";
import { logout } from "@/app/actions";
import { Logo } from "@/components/Logo";
import { CopyLink, DashboardNav } from "@/components/DashboardNav";
import { Avatar } from "@/components/StoreView";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const host = (await headers()).get("host") ?? "localhost:3000";
  const storeUrl = `${host.startsWith("localhost") ? "http" : "https"}://${host}/${user.username}`;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-paper md:flex-row">
      <aside className="flex flex-col gap-4 border-b border-line bg-white p-4 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r md:p-5">
        <Logo className="mb-4 px-2" />
        <DashboardNav />
        <div className="mt-auto hidden items-center gap-3 rounded-xl border border-line p-2.5 md:flex">
          <Avatar name={user.name} src={user.avatar} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">@{user.username}</p>
          </div>
          <form action={logout}>
            <button title="Log out" aria-label="Log out" className="rounded-md p-1.5 text-neutral-400 hover:bg-paper hover:text-ink"><LogOut size={16} /></button>
          </form>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
            <span className="text-muted">Live at</span>
            <Link href={`/${user.username}`} target="_blank" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
              {storeUrl.replace(/^https?:\/\//, "")} <ExternalLink size={13} />
            </Link>
          </div>
          <CopyLink url={storeUrl} />
        </div>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
