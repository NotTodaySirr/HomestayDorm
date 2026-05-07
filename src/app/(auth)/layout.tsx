export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-secondary)] text-[var(--color-on-surface)]">
      <header className="flex h-[var(--topbar-height)] shrink-0 items-center bg-[var(--color-primary)] px-4 text-white sm:px-5">
        <div className="truncate font-serif text-[22px] font-bold leading-none sm:text-[26px]">
          HomestayDorm
        </div>
      </header>
      <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:px-6">
        <div className="w-full max-w-[430px]">{children}</div>
      </main>
    </div>
  );
}
