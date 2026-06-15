import { cookies } from "next/headers";
import { newSessionId } from "./ids";

export const SESSION_COOKIE = "fcf_session";

/**
 * Reads the guest session id, creating and persisting one when possible.
 * In Server Components during render the cookie store is read-only, so a
 * transient id is returned and middleware persists the real cookie on the
 * response. All state-changing routes call this where `set` is allowed.
 */
export async function getOrCreateSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sid = newSessionId();
  try {
    store.set(SESSION_COOKIE, sid, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } catch {
    // read-only context; middleware will persist the cookie on this response
  }
  return sid;
}

export async function readSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
