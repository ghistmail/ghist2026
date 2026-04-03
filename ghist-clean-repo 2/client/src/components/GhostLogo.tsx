import ghostImgPath from "@assets/ghist-ghost-transparent.png";

/**
 * Animated floating ghost using the real ghost PNG.
 * Ghost floats up/down, shadow oval pulses in sync.
 * Uses dark:invert so it appears white on dark backgrounds.
 */

interface GhostIconProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export function GhostIcon({ size = 32, animated = true, className = "" }: GhostIconProps) {
  const shadowW = Math.round(size * 0.6);
  const shadowH = Math.round(size * 0.12);
  const gap = Math.round(size * 0.08);

  return (
    <div
      className={`inline-flex flex-col items-center ${className}`}
      style={{ width: size }}
      aria-hidden="true"
    >
      <div
        style={{
          animation: animated ? "ghost-float 3s ease-in-out infinite" : undefined,
          willChange: "transform",
          lineHeight: 0,
        }}
      >
        <img
          src={ghostImgPath}
          alt=""
          width={size}
          height={size}
          className="dark:invert"
          style={{ objectFit: "contain", display: "block" }}
        />
      </div>
      <div
        style={{
          width: shadowW,
          height: shadowH,
          borderRadius: "50%",
          background: "currentColor",
          opacity: 0.2,
          marginTop: gap,
          animation: animated ? "shadow-pulse 3s ease-in-out infinite" : undefined,
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}

/**
 * Full Ghist lockup — ghost icon + "Ghist" wordmark side by side.
 * Ghost stays grounded with the text baseline via items-center alignment.
 */
interface GhistLogoFullProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export function GhistLogoFull({ size = 28, animated = true, className = "" }: GhistLogoFullProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Ghost without shadow for inline logo use */}
      <div
        style={{
          animation: animated ? "ghost-float 3s ease-in-out infinite" : undefined,
          willChange: "transform",
          lineHeight: 0,
        }}
      >
        <img
          src={ghostImgPath}
          alt=""
          width={size}
          height={size}
          className="dark:invert"
          style={{ objectFit: "contain", display: "block" }}
        />
      </div>
      <span
        className="font-display font-bold text-foreground leading-none"
        style={{ fontSize: size * 0.9 }}
      >
        Ghist
      </span>
    </div>
  );
}
