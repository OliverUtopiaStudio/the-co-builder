import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirect } from "@/lib/safe-redirect";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Intercept auth codes (password reset, email verification) on any page
  // Supabase sends reset links to Site URL with ?code=xxx — redirect to /callback
  const code = request.nextUrl.searchParams.get("code");
  if (code && request.nextUrl.pathname !== "/callback") {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/callback";
    // Preserve the code param, add next=/reset-password for recovery flows
    callbackUrl.searchParams.set("code", code);
    if (!callbackUrl.searchParams.has("next")) {
      callbackUrl.searchParams.set("next", "/reset-password");
    }
    return NextResponse.redirect(callbackUrl);
  }

  // Use getSession instead of getUser — reads from cookies, no network round-trip
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  // Redirect old /portfolio bookmarks to /report
  if (request.nextUrl.pathname.startsWith("/portfolio")) {
    const newPath = request.nextUrl.pathname.replace(/^\/portfolio/, "/report");
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.redirect(url, 308);
  }

  // Protect authenticated routes (Supabase auth)
  const protectedPaths = ["/dashboard", "/venture", "/profile", "/tools", "/admin", "/studio"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ["/login", "/signup"];
  const isAuthPage = authPaths.includes(request.nextUrl.pathname);

  if (user && isAuthPage) {
    const redirect = request.nextUrl.searchParams.get("redirect");
    const target = getSafeRedirect(redirect, "/dashboard");
    return NextResponse.redirect(new URL(target, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/venture/:path*",
    "/profile/:path*",
    "/tools/:path*",
    "/admin/:path*",
    "/studio/:path*",
    "/portfolio/:path*",
    "/report/:path*",
    "/login",
    "/signup",
  ],
};
