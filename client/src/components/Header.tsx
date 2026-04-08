import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { Link } from "wouter";
import { GhistLogoFull } from "./GhostLogo";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-50 overflow-visible"
      style={{
        background: theme === "dark"
          ? "rgba(14,14,14,0.72)"
          : "rgba(249,249,251,0.80)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: theme === "dark"
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4 overflow-visible">
        {/* Animated ghost + wordmark — left on desktop, will be part of centred hero on mobile */}
        <Link href="/" className="flex items-center no-underline" data-testid="text-brand">
          <GhistLogoFull size={28} animated={true} />
        </Link>

        {/* Nav right */}
        <div className="flex items-center gap-0.5">
          <Link href="/privacy">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs font-body hidden sm:flex"
              data-testid="link-privacy"
            >
              Privacy
            </Button>
          </Link>
          <Link href="/terms">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs font-body hidden sm:flex"
              data-testid="link-terms"
            >
              Terms
            </Button>
          </Link>

          <div className="w-px h-4 bg-border/60 mx-1 hidden sm:block" />

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            data-testid="button-theme-toggle"
            className="w-8 h-8 rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
