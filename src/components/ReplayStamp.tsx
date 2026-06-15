"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CardResult } from "@/lib/types";

export function ReplayStamp({
  result,
  fightId,
  cardSlug,
}: {
  result: CardResult;
  fightId: string;
  cardSlug: string;
}) {
  const reduce = useReducedMotion();
  const [replayKey, setReplayKey] = useState(0);
  const ko = result === "CTA_KNOCKED_OUT";

  function replay() {
    setReplayKey((k) => k + 1);
    fetch("/api/usage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "fcf_card_replayed", fightId, cardSlug }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <div>
      <motion.div
        key={replayKey}
        className={`stamp ${ko ? "stamp--ko" : "stamp--defended"}`}
        data-testid="result-stamp"
        data-result={result}
        initial={reduce ? false : { scale: 0.55, rotate: -7, opacity: 0 }}
        animate={reduce ? undefined : { scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 440, damping: 15 }}
      >
        {ko ? "CTA KNOCKED OUT" : "CTA DEFENDED"}
      </motion.div>
      <button type="button" className="btn" onClick={replay} data-testid="replay" style={{ marginTop: 12 }}>
        Replay
      </button>
    </div>
  );
}
