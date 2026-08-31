import { NextResponse, type NextRequest } from "next/server";

const username = process.env.BASIC_AUTH_USERNAME;
const password = process.env.BASIC_AUTH_PASSWORD;

function isAuthorized(request: NextRequest) {
  if (!username || !password) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return false;
  }

  const decoded = atob(authHeader.slice("Basic ".length));
  const separator = decoded.indexOf(":");

  if (separator === -1) {
    return false;
  }

  return decoded.slice(0, separator) === username && decoded.slice(separator + 1) === password;
}

export function middleware(request: NextRequest) {
  if (isAuthorized(request)) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Wedding Planner"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
