"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="current">Current password</label>
        <input id="current" name="current" type="password" className="input" required />
      </div>
      <div>
        <label className="label" htmlFor="next">New password</label>
        <input id="next" name="next" type="password" className="input" minLength={8} required />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-600">Password updated.</p>}
      <button disabled={pending} className="btn-primary">Update password</button>
    </form>
  );
}
