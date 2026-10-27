import Link from "next/link";
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
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50 md:flex-row">
      <aside className="flex flex-col gap-4 border-b border-neutral-200 bg-white p-4 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
        <Logo className="px-2" />
        <DashboardNav />
        <div className="mt-auto hidden items-center gap-3 rounded-xl p-2 md:flex">
          <Avatar name={user.name} src={user.avatar} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <form action={logout}>
              <button className="text-xs text-neutral-500 hover:text-neutral-900">Log out</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">Your store:</span>
            <Link href={`/${user.username}`} target="_blank" className="font-medium text-violet-700 hover:underline">
              {storeUrl.replace(/^https?:\/\//, "")}
            </Link>
          </div>
          <CopyLink url={storeUrl} />
        </div>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
