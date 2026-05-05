import { Header } from "@/components/app/Header";
import { Sidebar } from "@/components/app/Sidebar";

type ShellProps = {
  children: React.ReactNode;
};

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-secondary)] text-[var(--color-on-surface)]">
      <Header />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-3 sm:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
