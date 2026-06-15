// Augments the CloudflareEnv interface declared by @opennextjs/cloudflare with
// this project's bindings and vars.
import type { D1Database } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    OWNER_KEY_SECRET: string;
    NEXT_PUBLIC_BASE_URL: string;
    NEXT_PUBLIC_NOVUS_APP_ID: string;
  }
}

export {};
