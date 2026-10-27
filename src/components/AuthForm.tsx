"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions";

export function AuthForm({ mode, defaultUsername = "" }: { mode: "login" | "signup"; defaultUsername?: string }) {
  const [state, action, pending] = useActionState(mode === "login" ? login : signup, undefined);
  return (
    <form action={action} className="space-y-4">
      {mode === "signup" && (
        <>
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" name="name" className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="username">Your store link</label>
            <div className="flex items-center rounded-lg border border-line focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
              <span className="pl-3.5 text-sm text-neutral-500">inf.link/</span>
              <input id="username" name="username" defaultValue={defaultUsername} className="w-full bg-transparent px-1 py-2.5 text-sm outline-none" required />
            </div>
          </div>
        </>
      )}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="input" required minLength={mode === "signup" ? 8 : undefined} />
      </div>
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Please wait…" : mode === "login" ? "Log in" : "Create my store"}
      </button>
      <p className="text-center text-sm text-neutral-600">
        {mode === "login" ? (
          <>No account? <Link href="/signup" className="font-semibold text-brand-700">Sign up</Link></>
        ) : (
          <>Already have an account? <Link href="/login" className="font-semibold text-brand-700">Log in</Link></>
        )}
      </p>
    </form>
  );
}
