import { GhistLogoFull } from "./GhostLogo";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="mt-auto bg-muted/30">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-8 mb-8 text-center sm:text-left">
          {/* Brand block */}
          <div className="flex flex-col gap-3">
            <Link href="/" aria-label="Ghist Homepage" className="no-underline">
              <GhistLogoFull size={22} className="opacity-80" />
            </Link>
            <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-[280px]">
              Communication without the digital footprint. Ephemeral by design.
            </p>
          </div>

          {/* Navigation links — desktop: row, mobile: column */}
          <nav
            className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-x-6 sm:gap-y-2"
            aria-label="Footer navigation"
          >
            <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center sm:min-h-0" data-testid="footer-link-about">About</Link>
            <Link href="/blog" className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center sm:min-h-0" data-testid="footer-link-blog">Blog</Link>
            <Link href="/faq" className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center sm:min-h-0" data-testid="footer-link-faq">FAQ</Link>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center sm:min-h-0" data-testid="footer-link-contact">Contact</Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center sm:min-h-0" data-testid="footer-link-privacy">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center sm:min-h-0" data-testid="footer-link-terms">Terms</Link>
          </nav>
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
