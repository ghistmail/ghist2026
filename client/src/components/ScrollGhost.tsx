import { useEffect, useRef, useState } from "react";

/**
 * ScrollGhost — fixed bottom-right ghost that rises into view as the user scrolls.
 *
 * Behaviour (matches mockup):
 * - Hidden at top of page (translateY: fully below viewport)
 * - Slides up smoothly as user scrolls down
 * - Fully visible when near the footer
 * - Reverses when user scrolls back up
 *
 * The ghost is cropped into the corner: only the top-left portion is visible,
 * as shown in the mockup where the ghost bleeds off the right and bottom edges.
 */
export function ScrollGhost() {
  const [progress, setProgress] = useState(0); // 0 = hidden, 1 = fully visible
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;

      if (docH <= winH) {
        // Page doesn't scroll — always show ghost
        setProgress(1);
        return;
      }

      // Start appearing after first 15% of page scroll
      // Fully visible after 60% of page scroll
      const scrollable = docH - winH;
      const scrollFraction = scrollY / scrollable;
      const START = 0.15;
      const END = 0.60;

      const p = Math.min(1, Math.max(0, (scrollFraction - START) / (END - START)));
      setProgress(p);
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // run once on mount

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Ghost size: large enough to feel dramatic, cropped into the corner
  const GHOST_SIZE = 320; // px — the image dimensions
  // How far it slides up/down. At progress=0 the ghost is fully below + right, at 1 it's peeking in.
  // We translate Y by (1 - progress) * peekAmount so it slides up.
  const PEEK_Y = 80; // px visible at full progress (top of ghost head visible)
  const translateY = (1 - progress) * (GHOST_SIZE - PEEK_Y) + (GHOST_SIZE - PEEK_Y) * 0;
  // At progress=0: translateY = full ghost height below (hidden)
  // At progress=1: translateY = 0 (ghost peeking up by PEEK_Y)
  const finalTranslateY = (1 - progress) * GHOST_SIZE;
  const opacity = progress > 0.05 ? 1 : 0;

  return (
    <div
      aria-hidden="true"
      data-testid="scroll-ghost"
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        width: `${GHOST_SIZE}px`,
        height: `${GHOST_SIZE}px`,
        pointerEvents: "none",
        zIndex: 40,
        overflow: "hidden",
        transform: `translateY(${finalTranslateY}px)`,
        opacity,
        transition: "transform 0.05s linear, opacity 0.2s ease",
        // Only show on wider screens — hide on very small phones to avoid overlap
      }}
      className="hidden sm:block"
    >
      <img
        src="/ghost-footer.jpg"
        alt=""
        draggable={false}
        className="w-full h-full object-contain object-bottom select-none"
        style={{
          // Dark mode: slightly more transparent
          filter: "var(--scroll-ghost-filter, none)",
        }}
      />
    </div>
  );
}
