import { useEffect, useRef, useState } from "react";

/**
 * ScrollGhost — emerges from the bottom-right corner as the user scrolls.
 *
 * Exact mockup spec:
 * - Ghost is ~420px wide × ~464px tall (RGBA transparent PNG)
 * - Fixed bottom:0, right:-80px (bleeds 80px off right edge)
 * - Rotated -10deg counter-clockwise (transform-origin: bottom right)
 * - Hidden state: translateY = GHOST_H + buffer (fully below viewport)
 * - Final state: translateY = +110px (ghost bottom bleeds ~110px below viewport,
 *   head visible at ~58% from viewport top — matches mockup)
 * - Scroll-linked: no CSS transition, direct RAF-driven position
 * - Reverse: exact mirror when scrolling up
 */
export function ScrollGhost() {
  const rafRef = useRef<number | null>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  // Ghost natural dimensions (preserves 332:367 aspect ratio)
  const GHOST_W = 420;
  const GHOST_H = Math.round(GHOST_W * (367 / 332)); // ≈ 464px

  // In the final/resting position, the ghost bottom bleeds this many px below the viewport.
  // Positive = pushed down past the bottom edge.
  // Mockup: ghost head visible at ~57% from top → bottom bleed ≈ 110px
  const FINAL_BLEED = 110; // px below viewport

  // Hidden state: ghost is this many px below the viewport (fully off screen)
  const HIDDEN_BLEED = GHOST_H + 60; // ≈ 524px below viewport

  // Scroll fraction at which ghost starts emerging
  const SCROLL_START = 0.12;
  // Scroll fraction at which ghost reaches full position
  const SCROLL_END = 0.72;

  useEffect(() => {
    const ghost = ghostRef.current;
    if (!ghost) return;

    // Set initial position directly (avoid React re-render on every frame)
    ghost.style.transform = `translateY(${HIDDEN_BLEED}px) rotate(-10deg)`;
    ghost.style.visibility = "hidden";

    const compute = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const scrollable = docH - winH;

      let ty: number;

      if (scrollable <= 0) {
        // Non-scrollable — fully show ghost
        ty = FINAL_BLEED;
      } else {
        const frac = scrollY / scrollable;
        const p = Math.min(1, Math.max(0, (frac - SCROLL_START) / (SCROLL_END - SCROLL_START)));
        // p=0 → HIDDEN_BLEED, p=1 → FINAL_BLEED
        ty = HIDDEN_BLEED + p * (FINAL_BLEED - HIDDEN_BLEED);
      }

      // Use direct DOM manipulation for zero-lag scroll following
      ghost.style.transform = `translateY(${ty}px) rotate(-10deg)`;
      ghost.style.visibility = ty < HIDDEN_BLEED - 2 ? "visible" : "hidden";
    };

    const onScroll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(compute);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    compute(); // initial render

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ghostRef}
      aria-hidden="true"
      data-testid="scroll-ghost"
      style={{
        // Anchor to bottom-right viewport corner
        position: "fixed",
        bottom: 0,
        right: "-80px",      // bleeds 80px off the right edge
        // Rotation pivot from the bottom-right corner of the element
        transformOrigin: "bottom right",
        // Initial transform applied by useEffect imperatively
        transform: `translateY(524px) rotate(-10deg)`,
        willChange: "transform",
        pointerEvents: "none",
        zIndex: 40,
        // No overflow:hidden — ghost bleeds freely off screen edges
        overflow: "visible",
        width: `${GHOST_W}px`,
        height: `${GHOST_H}px`,
        visibility: "hidden",
      }}
      className="hidden sm:block"
    >
      <img
        src="/ghost-scroll.png"
        alt=""
        draggable={false}
        width={GHOST_W}
        height={GHOST_H}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center center",
          userSelect: "none",
        }}
      />
    </div>
  );
}
