import { useState, useEffect, useRef } from "react";
import { Copy, Check, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailAddressProps {
  address: string;
  expiresAt: string;
  onGenerate: () => void;
  onDelete: () => void;
  isGenerating: boolean;
  onExpired: () => void;
}

/** Inline countdown — "23:59:39" or "59m 12s" when urgent */
function InlineCountdown({
  expiresAt,
  onExpired,
}: {
  expiresAt: string;
  onExpired: () => void;
}) {
  const [display, setDisplay] = useState("");
  const [urgent, setUrgent] = useState(false);
  const firedRef = useRef(false);
  // Keep latest onExpired in a ref so it never re-triggers the effect
  const onExpiredRef = useRef(onExpired);
  useEffect(() => { onExpiredRef.current = onExpired; }, [onExpired]);

  useEffect(() => {
    firedRef.current = false; // reset when expiresAt changes (new inbox)
    function tick() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setDisplay("Expired");
        setUrgent(true);
        if (!firedRef.current) {
          firedRef.current = true;
          onExpiredRef.current();
        }
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setUrgent(diff < 3600000);
      setDisplay(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]); // onExpired intentionally excluded — accessed via ref

  return (
    <span
      className={`font-mono font-bold tabular-nums ${
        urgent ? "text-destructive urgent-pulse" : "text-foreground"
      }`}
      style={{ fontFamily: "'Geist Mono', 'JetBrains Mono', monospace" }}
      data-testid="text-countdown"
    >
      {display}
    </span>
  );
}

/** Character-by-character typing reveal */
function TypingReveal({ text, revealKey }: { text: string; revealKey: number }) {
  return (
    <span className="address-reveal" aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={`${revealKey}-${i}`}
          style={{ animationDelay: `${i * (120 / Math.max(text.length, 1))}ms` }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

export function EmailAddress({
  address,
  expiresAt,
  onGenerate,
  onDelete,
  isGenerating,
  onExpired,
}: EmailAddressProps) {
  const [copied, setCopied] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [revealKey, setRevealKey] = useState(0);
  const prevAddress = useRef(address);
  const { toast } = useToast();

  useEffect(() => {
    if (address !== prevAddress.current) {
      prevAddress.current = address;
      setRevealKey((k) => k + 1);
    }
  }, [address]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = address;
      ta.style.cssText = "position:fixed;left:-9999px;top:-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setFlashKey((k) => k + 1);
    toast({ title: "Address copied" });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col items-center text-center gap-8 w-full">
      {/* Hero copy */}
      <div className="space-y-4">
        <h1 className="font-display font-bold tracking-tight text-foreground leading-tight text-4xl sm:text-5xl md:text-6xl">
          Free temporary email that<br className="hidden sm:block" /> <span style={{ fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.02em" }}>vanishes</span> in 24 hours.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground font-body">
          No account, no history.
        </p>
      </div>

      {/* Address pill + copy button */}
      <div className="w-full max-w-2xl space-y-3">
        {/* Main pill row */}
        <div
          key={flashKey}
          className={`flex items-stretch w-full rounded-2xl overflow-hidden border border-border bg-card ${flashKey > 0 ? "copy-flash" : ""}`}
        >
          {/* Address side */}
          <div className="flex-1 flex items-center px-5 py-4 min-w-0">
            <span
              className="font-mono text-lg sm:text-xl font-semibold text-foreground truncate"
              style={{ fontFamily: "'Geist Mono', 'JetBrains Mono', monospace" }}
              data-testid="text-email-address"
              data-hero-address
            >
              <TypingReveal text={address} revealKey={revealKey} />
            </span>
          </div>

          {/* Copy button side */}
          <button
            onClick={handleCopy}
            data-testid="button-copy"
            aria-label="Copy email address"
            className={`
              flex items-center gap-2.5
              px-6 py-4
              font-body font-semibold text-base
              shrink-0
              transition-all duration-150
              ${copied
                ? "bg-green-500/20 text-green-500"
                : "bg-secondary hover:bg-secondary/80 text-foreground"
              }
            `}
          >
            {copied ? (
              <Check className="w-5 h-5 shrink-0" />
            ) : (
              <Copy className="w-5 h-5 shrink-0" />
            )}
            <span>{copied ? "Copied!" : "Copy address"}</span>
          </button>
        </div>

        {/* Expiry + Generate new row */}
        <div className="flex items-center justify-between px-1">
          {/* Expiry — left */}
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-muted-foreground shrink-0" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground font-body">
              Expires in{" "}
              <InlineCountdown expiresAt={expiresAt} onExpired={onExpired} />
            </span>
          </div>

          {/* Generate new — right */}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            data-testid="button-generate"
            aria-label="Generate new email address"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
          >
            <RefreshCw className={`w-5 h-5 shrink-0 ${isGenerating ? "animate-spin" : ""}`} strokeWidth={1.5} />
            <span>Generate new</span>
          </button>
        </div>
      </div>
    </div>
  );
}
