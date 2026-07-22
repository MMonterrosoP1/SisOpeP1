import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  );

  const { pathname } = request.nextUrl;
  
  const isAuthRoute = pathname.startsWith("/sign-in") || pathname.startsWith("/api/auth");
  const isStaticRoute = pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname.startsWith("/public") || pathname.endsWith(".png");

  if (isStaticRoute) {
    return NextResponse.next();
  }

  if (!session) {
    if (!isAuthRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  } else {
    // Check if user is active and not banned
    const user = session.user as any;
    if (user.active === false || user.banned === true) {
      if (!isAuthRoute) {
         return NextResponse.redirect(new URL("/sign-in?error=inactive", request.url));
      }
    } else {
      // Redirect authenticated users away from sign-in
      if (pathname === "/sign-in") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
