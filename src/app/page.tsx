import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { getDefaultRouteForRole } from "@/lib/role-navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);

  redirect(session?.userId ? getDefaultRouteForRole(session.role) : "/login");
}
