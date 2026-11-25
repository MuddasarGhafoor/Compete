import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-10">
      <Logo />
      <div className="flex flex-1 items-center py-10">{children}</div>
    </main>
  );
}
