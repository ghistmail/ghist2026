import { GhistLogoFull } from "./GhostLogo";

export function Footer() {
  return (
    <footer className="mt-auto bg-muted/30">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-8">
          {/* Brand block */}
          <div className="flex flex-col gap-3">
            <GhistLogoFull size={22} animated={false} className="opacity-60" />
            <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-[280px]">
              Communication without the digital footprint. Ephemeral by design.
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground/70 font-body">
            All data auto-deleted after 24 hours. No signup, no tracking.
          </p>
          <p className="text-[11px] text-muted-foreground/60 font-body">
            Created by Alex Wain
          </p>
        </div>
      </div>
    </footer>
  );
}
