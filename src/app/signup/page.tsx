import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ username?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { username = "" } = await searchParams;
  return (
    <AuthShell title="Create your store" subtitle="Start your free trial. It takes less than a minute.">
      <AuthForm mode="signup" defaultUsername={username.toLowerCase()} />
    </AuthShell>
  );
}
