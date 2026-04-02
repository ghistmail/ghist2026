import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw, Trash2 } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { useToast } from "@/hooks/use-toast";

interface EmailAddressProps {
  address: string;
  expiresAt: string;
  onGenerate: () => void;
  onDelete: () => void;
  isGenerating: boolean;
  onExpired: () => void;
}

// Extract handle (local part before @) for editorial display
function parseAddress(address: string) {
  const atIdx = address.lastIndexOf("@");
  if (atIdx === -1) return { handle: address };
  return {
    handle: address.slice(0, atIdx),
  };
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
  const { toast } = useToast();
  const { handle } = parseAddress(address);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for sandbox
      const textarea = document.createElement("textarea");
      textarea.value = address;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        toast({ title: "Copied to clipboard" });
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast({ title: "Copy failed", description: "Please select and copy manually", variant: "destructive" });
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="space-y-5">
      {/* ACTIVE SESSION label */}
      <p className="text-[11px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground">
        Active Session
      </p>

      {/* Large editorial handle display */}
      <div className="space-y-3">
        <h1
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-none break-all"
          data-testid="text-hero"
        >
          {handle}
          <span className="text-primary">.</span>
        </h1>

        {/* Email chip row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Full address chip */}
          <div className="flex items-center gap-0 bg-secondary rounded-lg overflow-hidden">
            <span
              className="px-3 py-1.5 font-mono text-xs sm:text-sm text-foreground select-all"
              data-testid="text-email-address"
            >
              {address}
            </span>
            <button
              onClick={handleCopy}
              aria-label="Copy email address"
              data-testid="button-copy"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-l border-border/40"
            >
              {copied ? (
                <Check className="w-3 h-3 text-primary" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Countdown chip */}
          <CountdownTimer expiresAt={expiresAt} onExpired={onExpired} />
        </div>
      </div>

      {/* Action buttons — inline, subtle */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onGenerate}
          disabled={isGenerating}
          className="gap-1.5 text-xs h-8 px-3"
          data-testid="button-generate"
        >
          <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
          New address
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive text-xs gap-1.5 h-8 px-3"
          data-testid="button-delete"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </Button>
      </div>
    </div>
  );
}
