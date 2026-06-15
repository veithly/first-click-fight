import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "fcf_session";

function makeSessionId(): string {
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `s_${rand}`;
}

// Next 16 renamed this convention to `proxy`, but proxy is locked to the
// Node.js runtime, which @opennextjs/cloudflare cannot run on Workers. The
// Edge `middleware` convention stays supported, so we keep it here.
// Ensures every visitor carries a stable guest session cookie.
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    response.cookies.set(SESSION_COOKIE, makeSessionId(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand|art|.*\\.svg|.*\\.png).*)"],
};
