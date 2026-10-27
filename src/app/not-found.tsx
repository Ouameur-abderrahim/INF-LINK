import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
      <p className="text-6xl">🛍️</p>
      <h1 className="text-2xl font-bold">This page doesn&apos;t exist</h1>
      <p className="text-neutral-500">The store or product may have moved or been removed.</p>
      <Link href="/" className="btn-primary">Go home</Link>
    </div>
  );
}
