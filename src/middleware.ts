import { NextResponse, type NextRequest } from "next/server";
import { authCookie, authIsConfigured, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login" || pathname === "/api/auth/login") return NextResponse.next();
  if (!authIsConfigured()) return new NextResponse("Private access is not configured. Add AUTH_USERS_JSON and AUTH_SESSION_SECRET.", { status: 503 });
  if (await verifySessionToken(request.cookies.get(authCookie.name)?.value)) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
