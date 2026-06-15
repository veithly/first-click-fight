/**
 * Novus.ai (by Pendo) is a GitHub-connected product agent: it scans the repo and
 * opens a pull request to auto-install instrumentation, rather than shipping a
 * client snippet. This component is a clean, honest hook: if a future Novus build
 * does provide a client tag id via NEXT_PUBLIC_NOVUS_APP_ID, it loads here; until
 * then it renders nothing and the first-party usage_events loop is the real
 * "learning from usage" backbone. See README "Connect Novus".
 */
export function NovusScript() {
  const appId = process.env.NEXT_PUBLIC_NOVUS_APP_ID;
  if (!appId) return null;
  return (
    <script
      async
      data-novus-app-id={appId}
      src={`https://cdn.novus.ai/agent/${appId}.js`}
    />
  );
}
