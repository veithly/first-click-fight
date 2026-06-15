"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TryDemoButton({
  screenId = "saas-landing",
  intendedTargetId = "t_start",
  className = "btn btn--lg",
  children = "Try a live demo",
}: {
  screenId?: string;
  intendedTargetId?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ screenId, intendedTargetId }),
      });
      const data = (await res.json()) as { fightId?: string; error?: string };
      if (!res.ok || !data.fightId) throw new Error(data.error ?? "Could not start demo");
      router.push(`/fight/${data.fightId}?demo=1`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={start}
        disabled={busy}
        data-testid="try-demo"
      >
        {busy ? "Preparing ring…" : children}
      </button>
      {error && (
        <span className="notice notice--error" role="alert" style={{ display: "block", marginTop: 10 }}>
          {error}
        </span>
      )}
    </>
  );
}
