function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return toHex(digest);
}

/** ownerKey = HMAC-SHA256(secret, "fcf:" + fightId). Only its sha256 hash is stored. */
export async function signOwnerKey(secret: string, fightId: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`fcf:${fightId}`));
  return toHex(sig);
}

export async function hashOwnerKey(ownerKey: string): Promise<string> {
  return sha256Hex(ownerKey);
}

/** Constant-time-ish comparison of the provided key's hash against the stored hash. */
export async function verifyOwnerKey(ownerKey: string, storedHash: string): Promise<boolean> {
  if (!ownerKey || !storedHash) return false;
  const provided = await sha256Hex(ownerKey);
  if (provided.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) diff |= provided.charCodeAt(i) ^ storedHash.charCodeAt(i);
  return diff === 0;
}
