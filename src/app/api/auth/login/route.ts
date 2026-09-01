import { NextResponse, type NextRequest } from "next/server";
import { authCookie, createSessionToken, verifyLogin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const username = String(data.get("username") ?? "").trim().toLowerCase();
  const password = String(data.get("password") ?? "");
  if (!(await verifyLogin(username, password))) return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
  const token = await createSessionToken(username);
  if (!token) return new NextResponse("Authentication is not configured", { status: 503 });
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(authCookie.name, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: authCookie.maxAge });
  return response;
}
