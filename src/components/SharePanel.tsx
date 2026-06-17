"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { trackNovus } from "@/lib/novus";

export function SharePanel({
  url,
  label = "Share this fight",
  hint = "Send it to a stranger, or scan to play on your phone.",
  fightId,
  cardSlug,
  shareContext,
}: {
  url: string;
  label?: string;
  hint?: string;
  fightId?: string;
  cardSlug?: string;
  shareContext?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackNovus("fcf_link_shared", { url, shareContext, fightId, cardSlug });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="share-panel" data-testid="share-panel">
      <div>
        <strong style={{ fontSize: 18 }}>{label}</strong>
        <p className="muted" style={{ margin: "6px 0 0", fontSize: 14 }}>
          {hint}
        </p>
        <div className="copy-field">
          <input value={url} readOnly aria-label="Fight link" data-testid="share-url" />
          <button type="button" className="btn" onClick={copy} data-testid="copy-link">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div className="qr-ticket" aria-label="QR code to open on a phone">
        <QRCodeSVG value={url} size={128} />
        <span className="mono">scan to play</span>
      </div>
    </div>
  );
}
