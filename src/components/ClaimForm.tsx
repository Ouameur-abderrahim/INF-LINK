import { ArrowRight } from "lucide-react";

export function ClaimForm({ dark = false }: { dark?: boolean }) {
  return (
    <form action="/signup" className={`flex w-full max-w-md items-center rounded-xl border p-1.5 shadow-sm ${dark ? "border-white/15 bg-white/5" : "border-line bg-white"}`}>
      <label htmlFor={dark ? "claim-dark" : "claim"} className={`pl-3 text-sm ${dark ? "text-neutral-400" : "text-muted"}`}>vitrine.app/</label>
      <input
        id={dark ? "claim-dark" : "claim"}
        name="username"
        placeholder="yourname"
        autoComplete="off"
        className={`min-w-0 flex-1 bg-transparent py-2 text-sm outline-none ${dark ? "text-white placeholder:text-neutral-500" : "placeholder:text-neutral-400"}`}
      />
      <button className={dark ? "btn bg-white text-ink hover:bg-neutral-100" : "btn-primary"}>
        Claim my store <ArrowRight size={16} />
      </button>
    </form>
  );
}
