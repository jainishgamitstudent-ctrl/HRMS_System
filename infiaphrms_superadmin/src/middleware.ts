import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/session-timeout", "/blocked"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all API routes to handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Authenticated user visiting login → send to dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated user on protected route → send to login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icons\\.svg|logo\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
