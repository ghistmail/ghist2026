import { type Message } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Component, type ReactNode, useState, useMemo, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeEmailHtml } from "@/lib/sanitizeEmailHtml";

// --- pickRenderablePart ---
// Returns { mode: "html", content } if htmlBody is non-empty, else plain-text fallback.
function pickRenderablePart(message: Message): { mode: "html" | "text"; content: string } {
  if (message.htmlBody && message.htmlBody.trim().length > 0) {
    return { mode: "html", content: message.htmlBody };
  }
  return { mode: "text", content: message.textBody ?? "" };
}

interface MessageDetailProps {
  message: Message;
  onBack: () => void;
}

function isLikelyOTP(code: string): boolean {
  if (/^(\d)\1+$/.test(code)) return false;
  const digits = code.split("").map(Number);
  const diffs = digits.slice(1).map((d, i) => d - digits[i]);
  if (diffs.every((d) => d === 1) || diffs.every((d) => d === -1)) return false;
  // Reject years — copyright footers, dates
  const num = parseInt(code, 10);
  if (code.length === 4 && num >= 1900 && num <= 2099) return false;
  return true;
}

function extractOTP(text: string): string | null {
  // Strip any HTML before scanning
  const plain = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  // Labelled patterns first — highest confidence
  const labelledPatterns = [
    /(?:code|OTP|otp|verification|passcode|one.?time)[\s:=]+(\d{4,8})/i,
    /\b(\d{4,8})\s+(?:is your|as your)\s+(?:code|OTP|verification)/i,
  ];
  for (const pattern of labelledPatterns) {
    const match = plain.match(pattern);
    if (match && isLikelyOTP(match[1])) return match[1];
  }

  // Unlabelled: only 6 or 8 digits (4-digit too ambiguous — years, prices)
  for (const pattern of [/\b(\d{6})\b/, /\b(\d{8})\b/]) {
    const match = plain.match(pattern);
    if (match && isLikelyOTP(match[1])) return match[1];
  }

  return null;
}

function extractLinks(html: string): { href: string; text: string }[] {
  const div = document.createElement("div");
  div.innerHTML = html;
  const links: { href: string; text: string }[] = [];
  div.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (href && href.startsWith("http")) {
      links.push({ href, text: a.textContent?.trim() || href });
    }
  });
  return links;
}

// --- EmailErrorBoundary ---
// FIX: no error boundary existed anywhere in the app. Any exception thrown
// during EmailIframe's render or effects (e.g. an unexpected DOM shape from
// a real-world email that the sanitisation pipeline didn't already guard
// against) previously propagated up uncaught, silently leaving the Original
// tab blank with no visible error and no fallback. This boundary catches
// that class of failure and reports it via onError so the parent can fall
// through to the working Reader-equivalent markup instead.
class EmailErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[EmailErrorBoundary] caught render error, falling back to Reader view:", error);
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// --- HtmlEmailViewer ---
// Sanitizes rawHtml with DOMPurify (preserving tables, inline styles, layout attrs)
// and renders it in an isolated srcdoc iframe. Auto-resizes via postMessage.
function EmailIframe({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);

  // Inject a resize script — fires on load + after images settle
  const srcDoc = useMemo(() => {
    const resizeScript = `<script>
(function(){
  var blockedCount = 0;
  function send(){
    var h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    window.parent.postMessage({type:'ghist-iframe-height',h:h},'*');
  }
  // Swap a failed image for an inline placeholder so a fully image-based
  // email never collapses into one giant blank box (ad blockers / Brave
  // Shields commonly block proxied image requests client-side).
  function markFailed(img){
    if (img.dataset.ghistFailed) return;
    img.dataset.ghistFailed = '1';
    blockedCount++;
    var ph = document.createElement('span');
    ph.textContent = 'Image blocked';
    ph.style.cssText = 'display:inline-block;padding:6px 10px;margin:2px 0;background:#f1f1f1;color:#888;font:12px -apple-system,sans-serif;border-radius:6px;';
    img.style.display = 'none';
    if (img.parentNode) img.parentNode.insertBefore(ph, img);
    maybeShowBanner();
  }
  function maybeShowBanner(){
    if (blockedCount < 1 || document.getElementById('ghist-block-banner')) return;
    var b = document.createElement('div');
    b.id = 'ghist-block-banner';
    b.textContent = 'Some images in this email were blocked by your browser or an extension.';
    b.style.cssText = 'position:sticky;top:0;background:#fff3cd;color:#664d03;font:12px -apple-system,sans-serif;padding:8px 12px;border-bottom:1px solid #ffe69c;z-index:9999;';
    if (document.body.firstChild) document.body.insertBefore(b, document.body.firstChild);
    else document.body.appendChild(b);
    send();
  }
  document.addEventListener('DOMContentLoaded', send);
  window.addEventListener('load', send);
  // Re-fire after proxied images finish loading
  setTimeout(send, 800);
  setTimeout(send, 2000);
  setTimeout(send, 4000);
  // Watch for any late-loading (or blocked) images
  document.querySelectorAll('img').forEach(function(img){
    img.addEventListener('load', send);
    img.addEventListener('error', function(){ markFailed(img); send(); });
  });
})();
<\/script>`;
    // Case-insensitive replace for </body>
    const bodyClose = html.search(/<\/body>/i);
    if (bodyClose !== -1) {
      return html.slice(0, bodyClose) + resizeScript + html.slice(bodyClose);
    }
    return html + resizeScript;
  }, [html]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'ghist-iframe-height' && typeof e.data.h === 'number') {
        setHeight(e.data.h + 24);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div style={{ width: "100%", overflowX: "hidden", borderRadius: "8px" }}>
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        title="Email content"
        sandbox="allow-scripts allow-same-origin allow-popups"
        referrerPolicy="no-referrer"
        style={{ width: "100%", height, border: "none", display: "block", background: "white", borderRadius: "8px" }}
        scrolling="no"
      />
    </div>
  );
}

export function MessageDetail({ message, onBack }: MessageDetailProps) {
  const [otpCopied, setOtpCopied] = useState(false);
  const { toast } = useToast();

  const otp = useMemo(
    () => extractOTP(message.subject + " " + message.textBody),
    [message]
  );

  const sanitizedHtml = useMemo(
    () => sanitizeEmailHtml(message.htmlBody, window.location.origin),
    [message.htmlBody]
  );

  // FIX: gate the Original tab on actually having renderable HTML. Previously
  // the Original branch always mounted EmailIframe with `sanitizedHtml ?? ""`,
  // so any pipeline failure or empty sanitisation result produced a live,
  // correctly-sized iframe with a completely empty document — exactly the
  // "blank box" symptom, indistinguishable from a real bug to the user, and
  // with the tab still reading "Original". Falling through to the same markup
  // used by the Reader tab guarantees the user always sees content on first
  // load, and only ever shows an empty Original view if there genuinely is no
  // content at all (in which case Reader would be equally empty).
  const hasRenderableOriginal = !!sanitizedHtml && sanitizedHtml.trim().length > 0;

  const [boundaryError, setBoundaryError] = useState(false);
  useEffect(() => setBoundaryError(false), [message.id]);

  const links = useMemo(
    () => (message.htmlBody ? extractLinks(message.htmlBody) : []),
    [message.htmlBody]
  );

  const handleCopyOTP = async () => {
    if (!otp) return;
    try {
      await navigator.clipboard.writeText(otp);
    } catch {
      const t = document.createElement("textarea");
      t.value = otp;
      t.style.position = "fixed";
      t.style.left = "-9999px";
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
    }
    setOtpCopied(true);
    toast({ title: "Code copied" });
    setTimeout(() => setOtpCopied(false), 2000);
  };

  // --- MessageView integration ---
  // pickRenderablePart selects html vs text; default view is "original" (HTML iframe).
  const renderable = useMemo(() => pickRenderablePart(message), [message]);
  const [view, setView] = useState<"original" | "reader">("original");
  // Reset to original view whenever the message changes
  useEffect(() => { setView("original"); }, [message.id]);

  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <div className="px-5 py-3 flex items-center gap-2 bg-secondary/40">
        <Button
          size="icon"
          variant="ghost"
          onClick={onBack}
          aria-label="Back to inbox"
          data-testid="button-back"
          className="w-7 h-7 rounded-full"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Button>
        <span className="text-xs text-muted-foreground font-body tracking-wide">Inbox</span>
      </div>

      {/* Message content */}
      <div className="p-5 sm:p-7 space-y-5">
        {/* Header stub: subject + meta */}
        <div className="space-y-2">
          <h2
            className="font-display text-xl sm:text-2xl font-bold text-foreground leading-snug"
            data-testid="text-subject"
          >
            {message.subject}
          </h2>
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground font-body">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="shrink-0">From:</span>
              <span className="text-foreground font-medium truncate">
                {message.fromName || message.from}
              </span>
              {message.fromName && (
                <span className="text-muted-foreground/60 truncate hidden sm:inline">
                  &lt;{message.from}&gt;
                </span>
              )}
            </div>
            <span className="tabular-nums text-muted-foreground/70">
              {format(new Date(message.receivedAt), "MMM d, yyyy 'at' h:mm a")}
              {" · "}
              {formatDistanceToNow(new Date(message.receivedAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* OTP highlight — shown in both views */}
        {otp && (
          <div className="bg-secondary rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
                Verification code detected
              </p>
              <p
                className="font-mono text-2xl sm:text-3xl font-bold tracking-[0.25em] text-foreground"
                data-testid="text-otp"
              >
                {otp}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleCopyOTP}
              className="gap-1.5 shrink-0 h-8 px-3 text-xs"
              data-testid="button-copy-otp"
            >
              {otpCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {otpCopied ? "Copied" : "Copy code"}
            </Button>
          </div>
        )}

        {/* Original / Reader toggle — only shown when HTML is available */}
        {renderable.mode === "html" && (
          <div className="flex items-center gap-1 p-0.5 bg-secondary/60 rounded-lg w-fit" data-testid="view-toggle">
            <button
              onClick={() => setView("original")}
              data-testid="toggle-original"
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                view === "original"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setView("reader")}
              data-testid="toggle-reader"
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                view === "reader"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reader
            </button>
          </div>
        )}

        {/* Email body */}
        <div className="pt-2" data-testid="text-email-body">
          {renderable.mode === "html" && view === "original" && hasRenderableOriginal && !boundaryError ? (
            // HtmlEmailViewer: original HTML in isolated iframe, no links block prepended.
            // FIX: previously rendered EmailIframe unconditionally with
            // `sanitizedHtml ?? ""`. If sanitisation produced null/empty output
            // (pipeline failure, or content that sanitised down to nothing) the
            // iframe silently got an empty srcdoc with no indication anything
            // went wrong — a blank box on first load. `hasRenderableOriginal`
            // guards that case; `boundaryError` (set by EmailErrorBoundary) also
            // catches any exception thrown during the iframe's own render/effect
            // phase and falls through to the same Reader markup below.
            <EmailErrorBoundary onError={() => setBoundaryError(true)}>
              <div data-trust-level="untrusted" aria-label="Email content from untrusted sender">
                <EmailIframe html={sanitizedHtml as string} />
              </div>
            </EmailErrorBoundary>
          ) : renderable.mode === "html" ? (
            // ReaderView: simplified text rendering (links block shown here only)
            <div className="space-y-4">
              {links.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                    Links in this message
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {links.slice(0, 5).map((link, i) => (
                      <a
                        key={i}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/8 px-2.5 py-1.5 rounded-lg no-underline hover:bg-primary/14 transition-colors font-body"
                        data-testid={`link-action-${i}`}
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {link.text.length > 40 ? link.text.slice(0, 40) + "..." : link.text}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {message.textBody}
              </pre>
            </div>
          ) : (
            // Plain-text fallback — no HTML part at all
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {message.textBody}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
