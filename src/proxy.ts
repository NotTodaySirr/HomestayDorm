import { NextRequest, NextResponse } from "next/server";
import { decrypt, isAuthBypassEnabled } from "@/lib/session-token";

const protectedRoutes = ["/dashboard", "/profile"];
const publicRoutes = ["/login", "/signup", "/"];
const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard";

function isRouteMatch(path: string, routes: string[]) {
  return routes.some((route) => path === route || path.startsWith(`${route}/`));
}

function redirectToLogin(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", req.nextUrl));
  response.cookies.delete("session");
  return response;
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (isAuthBypassEnabled()) {
    return NextResponse.next();
  }

  const isPublicRoute = isRouteMatch(path, publicRoutes);
  const isProtectedRoute = !isPublicRoute || isRouteMatch(path, protectedRoutes);

  const sessionCookie = req.cookies.get("session")?.value;
  const session = await decrypt(sessionCookie);
  const hasValidSession = Boolean(session?.userId);

  if (path === "/" && !hasValidSession) {
    return redirectToLogin(req);
  }

  if (isProtectedRoute && !hasValidSession) {
    return redirectToLogin(req);
  }

  if (isPublicRoute && hasValidSession && !path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL(DEFAULT_AUTHENTICATED_ROUTE, req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
