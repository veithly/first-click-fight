import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

/** Returns the Cloudflare env (bindings + vars), works in dev and production. */
export async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}

/** Returns the bound D1 database. */
export async function getDb(): Promise<D1Database> {
  const env = await getEnv();
  if (!env.DB) {
    throw new Error(
      "D1 binding 'DB' is not available. Run `wrangler d1 migrations apply first-click-fight --local` and ensure wrangler.jsonc binds DB.",
    );
  }
  return env.DB;
}
