import Script from "next/script";

/**
 * Novus by Pendo is a GitHub-connected product agent: it reads the repo and opens
 * a pull request that installs the Pendo Web SDK. This component is that same
 * instrumentation, loaded when NEXT_PUBLIC_NOVUS_APP_ID (the Pendo public app id)
 * is set, so the deployed site reports real usage to the Novus dashboard.
 *
 * The visitor id is the first-party guest session cookie (fcf_session, set in
 * middleware.ts), so Novus and the D1 usage_events loop key usage to the same
 * anonymous visitor. When the app id is unset, this renders nothing and the
 * first-party loop is the sole "learning from usage" backbone. See docs/NOVUS.md.
 */
export function NovusScript() {
  const snippet = `(function(apiKey){
  (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
  v=['initialize','identify','updateOptions','pageLoad','track','trackAgent'];
  for(w=0,x=v.length;w<x;++w)(function(m){o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
  y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
  z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
  var sid=(document.cookie.match(/(?:^|; )fcf_session=([^;]*)/)||[])[1];
  window.pendo.initialize({visitor:{id:sid?decodeURIComponent(sid):'anonymous'},account:{id:'first-click-fight'}});
})('f14be201-daaa-4821-8a45-f25326b16233');`;
  return (
    <Script id="pendo-novus" strategy="afterInteractive">
      {snippet}
    </Script>
  );
}
