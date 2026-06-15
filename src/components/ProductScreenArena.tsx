"use client";

import { Fragment, useRef } from "react";
import type { ProductScreen } from "@/lib/types";

export type ArenaMode = "mark" | "play" | "result" | "rematch" | "preview";

interface Props {
  screen: ProductScreen;
  mode: ArenaMode;
  intendedTargetId?: string | null;
  selectedTargetId?: string | null;
  promotedTargetId?: string | null;
  actualTargetId?: string | null;
  clickPoint?: { nx: number; ny: number } | null;
  busy?: boolean;
  compact?: boolean;
  onSelectTarget?: (id: string) => void;
  onPlayClick?: (nx: number, ny: number) => void;
}

export function ProductScreenArena({
  screen,
  mode,
  intendedTargetId,
  selectedTargetId,
  promotedTargetId,
  actualTargetId,
  clickPoint,
  busy = false,
  compact = false,
  onSelectTarget,
  onPlayClick,
}: Props) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  function handleSurfaceClick(e: React.MouseEvent<HTMLDivElement>) {
    if (mode !== "play" || busy) return;
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 100;
    const ny = ((e.clientY - rect.top) / rect.height) * 100;
    onPlayClick?.(nx, ny);
  }

  function handleSurfaceKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (mode !== "play" || busy) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // Keyboard fallback registers a click at the center of the screen.
      onPlayClick?.(50, 50);
    }
  }

  const interactiveSurface = mode === "play";

  return (
    <div
      className={`screen ${compact ? "screen--compact" : ""} screen--${mode}`}
      data-testid="product-screen"
      data-screen-id={screen.id}
    >
      <div className="screen-chrome" aria-hidden="true">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="screen-url">app.shipfast.dev/{screen.kind}</span>
      </div>

      <div
        ref={surfaceRef}
        className={`screen-surface ${interactiveSurface ? "screen-surface--play" : ""}`}
        onClick={handleSurfaceClick}
        onKeyDown={handleSurfaceKey}
        role={interactiveSurface ? "button" : undefined}
        tabIndex={interactiveSurface ? 0 : undefined}
        aria-label={interactiveSurface ? "Click where you would start on this screen" : undefined}
        data-testid={interactiveSurface ? "judge-click-surface" : "screen-surface"}
      >
        <div className="screen-copy" aria-hidden="true">
          <p className="screen-eyebrow">{screen.eyebrow}</p>
          <h3 className="screen-headline">{screen.headline}</h3>
          <p className="screen-subcopy">{screen.subcopy}</p>
        </div>

        {screen.targets.map((t) => {
          const isIntended = t.id === intendedTargetId;
          const isSelected = t.id === selectedTargetId;
          const isActual = t.id === actualTargetId;
          const isPromoted = t.id === promotedTargetId;
          const classes = [
            "screen-target",
            `screen-target--${t.kind}`,
            isSelected ? "is-selected" : "",
            (mode === "result" || mode === "preview") && isIntended ? "is-intended" : "",
            mode === "result" && isActual ? "is-actual" : "",
            mode === "rematch" && isPromoted ? "is-promoted" : "",
            mode === "rematch" && !isPromoted ? "is-dimmed" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const clickable = mode === "mark";
          const style = {
            left: `${t.x}%`,
            top: `${t.y}%`,
            width: `${t.w}%`,
            minHeight: `${t.h}%`,
          };

          // Verdict tags are rendered on the surface (not inside the ring) so a
          // badge sitting just below a target never reads as spilling out of the
          // ring "card". Positioned centered just under the ring's bottom edge.
          let tag: { label: string; variant: string } | null = null;
          if ((mode === "result" || mode === "preview") && isIntended) {
            tag = { label: "intended", variant: "" };
          } else if (mode === "result" && isActual && !isIntended) {
            tag = { label: "first click", variant: "screen-tag--ko" };
          } else if (mode === "rematch" && isPromoted) {
            tag = { label: "now first", variant: "screen-tag--now" };
          } else if (mode === "mark" && isSelected) {
            tag = { label: "intended", variant: "" };
          }
          const tagEl = tag ? (
            <span
              className={`screen-tag ${tag.variant}`}
              style={{ left: `${t.x}%`, top: `${t.y + t.h / 2}%` }}
              aria-hidden="true"
            >
              {tag.label}
            </span>
          ) : null;

          // Only the builder's "mark" mode exposes real, focusable buttons.
          // Every other mode renders decorative, aria-hidden labels so the
          // play surface owns the click and no inert controls leak to a11y.
          // Targets are positions on a scaled product-screen mock, not full-size
          // controls; the mobile hero action is the full-surface judge tap, so
          // ring size is allowed to follow the mock's proportions.
          const targetEl = !clickable ? (
            <div
              className={classes}
              style={style}
              data-testid={`target-${t.id}`}
              data-target-kind={t.kind}
              data-allow-small-target="true"
              aria-hidden="true"
            >
              {t.label}
            </div>
          ) : (
            <button
              type="button"
              className={classes}
              style={style}
              data-testid={`target-${t.id}`}
              data-target-kind={t.kind}
              data-allow-small-target="true"
              aria-pressed={isSelected}
              aria-label={`Mark "${t.label}" as the intended first action`}
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTarget?.(t.id);
              }}
            >
              {t.label}
            </button>
          );

          return (
            <Fragment key={t.id}>
              {targetEl}
              {tagEl}
            </Fragment>
          );
        })}

        {clickPoint && (mode === "result" || mode === "play") && (
          <span
            className="click-dot"
            data-testid="click-dot"
            style={{ left: `${clickPoint.nx}%`, top: `${clickPoint.ny}%` }}
            aria-hidden="true"
          />
        )}

        {mode === "play" && (
          <span className="play-hint" aria-hidden="true">
            Click where you would start
          </span>
        )}
      </div>
    </div>
  );
}
