import { NextRequest, NextResponse } from "next/server";
import { decrypt, isAuthBypassEnabled } from "@/lib/session";

const protectedRoutes = ["/dashboard", "/profile"];
const publicRoutes = ["/login", "/signup", "/"];

function isRouteMatch(path: string, routes: string[]) {
  return routes.some((route) => path === route || path.startsWith(`${route}/`));
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (isAuthBypassEnabled()) {
    return NextResponse.next();
  }

  const isProtectedRoute = isRouteMatch(path, protectedRoutes);
  const isPublicRoute = isRouteMatch(path, publicRoutes);

  const sessionCookie = req.cookies.get("session")?.value;
  const session = await decrypt(sessionCookie);

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session?.userId && !path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
