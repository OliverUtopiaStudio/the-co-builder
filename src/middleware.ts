import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "co_build_site_auth";
const FELLOW_ID_COOKIE = "co_build_fellow_id";
const ADMIN_COOKIE_NAME = "co_build_admin_auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath =
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/slack/interact");

  if (isPublicPath) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1";
  const fellowId = request.cookies.get(FELLOW_ID_COOKIE)?.value;
  const isAdmin = request.cookies.get(ADMIN_COOKIE_NAME)?.value === "1";

  if (!hasSession && pathname !== "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && pathname === "/login") {
    const redirect = request.nextUrl.searchParams.get("redirect") || "/";
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  // Fellows with identity: redirect / and /library to dashboard (admins skip)
  if (fellowId && !isAdmin && (pathname === "/" || pathname === "/library")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/library/:path*", "/fellows/:path*", "/astrolabe/:path*", "/login"],
};
