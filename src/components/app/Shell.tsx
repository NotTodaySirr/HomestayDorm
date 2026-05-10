import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { Header } from "@/components/app/Header";
import { Sidebar } from "@/components/app/Sidebar";
import prisma from "@/lib/db";

type ShellProps = {
  children: React.ReactNode;
};

export async function Shell({ children }: ShellProps) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);
  const user = session?.userId
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          email: true,
          name: true,
          role: true,
        },
      })
    : null;
  const userRole = (user?.role || session?.role || "USER").toUpperCase();
  const userName = user?.name || user?.email || "Nguoi dung";

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-secondary)] text-[var(--color-on-surface)]">
      <Header />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar userName={userName} userRole={userRole} />
        <main className="min-w-0 flex-1 overflow-auto p-3 sm:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
