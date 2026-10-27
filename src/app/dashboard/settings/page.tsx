import { logout } from "@/app/actions";
import { PasswordForm } from "@/components/PasswordForm";
import { requireUser } from "@/lib/auth";
import { shortDate } from "@/lib/format";

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <section className="card space-y-2 text-sm">
        <h2 className="mb-2 text-base font-semibold">Account</h2>
        <p><span className="text-neutral-500">Email:</span> {user.email}</p>
        <p><span className="text-neutral-500">Username:</span> @{user.username}</p>
        <p><span className="text-neutral-500">Member since:</span> {shortDate(user.createdAt)}</p>
      </section>
      <section className="card">
        <h2 className="mb-4 font-semibold">Payments</h2>
        <p className="text-sm text-neutral-600">
          Checkout is running in <b>test mode</b>. Connect Stripe to accept real payments and receive payouts.
        </p>
        <button disabled className="btn-ghost mt-4">Connect Stripe (coming soon)</button>
      </section>
      <section className="card">
        <h2 className="mb-4 font-semibold">Change password</h2>
        <PasswordForm />
      </section>
      <form action={logout}>
        <button className="btn-ghost">Log out</button>
      </form>
    </div>
  );
}
