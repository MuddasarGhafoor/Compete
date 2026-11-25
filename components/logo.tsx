import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 self-start">
      <span className="grid size-8 place-items-center rounded-lg bg-emerald-600 text-sm font-black text-white">
        C
      </span>
      <span className="text-lg font-bold tracking-tight">Compete</span>
    </Link>
  );
}
