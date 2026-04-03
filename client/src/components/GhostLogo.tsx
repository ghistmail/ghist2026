const ghostImgPath = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUwAAAFvCAYAAAAhVvLH";

/**
 * Animated floating ghost using the real ghost PNG.
 * Ghost floats up/down, ellipse shadow pulses in sync below.
 * Uses dark:invert so ghost appears white on dark backgrounds.
 * Shadow uses a solid oval (dark in light mode, white in dark mode).
 */

interface ShadowEllipseProps {
  size: number;
  animated: boolean;
}

function ShadowEllipse({ size, animated }: ShadowEllipseProps) {
  const shadowW = Math.round(size * 0.55);
  const shadowH = Math.round(size * 0.09);
  return (
    <div
      style={{
        width: shadowW,
        height: shadowH,
        borderRadius: "50%",
        marginTop: Math.round(size * 0.04),
        animation: animated ? "shadow-pulse 3s ease-in-out infinite" : undefined,
        willChange: "transform, opacity",
      }}
      className="bg-foreground opacity-30"
    />
  );
}

interface GhostIconProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export function GhostIcon({ size = 32, animated = true, className = "" }: GhostIconProps) {
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
      <ShadowEllipse size={size} animated={animated} />
    </div>
  );
}

/**
 * Full Ghist lockup — ghost icon (with shadow ellipse) + "Ghist" wordmark.
 * The ghost+shadow block is vertically centred with the text.
 */
interface GhistLogoFullProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export function GhistLogoFull({ size = 28, animated = true, className = "" }: GhistLogoFullProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Ghost + shadow ellipse stacked */}
      <div className="inline-flex flex-col items-center" style={{ width: size }}>
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
        <ShadowEllipse size={size} animated={animated} />
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
