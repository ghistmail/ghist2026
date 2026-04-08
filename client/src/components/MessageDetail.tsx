import { type Message } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import DOMPurify from "dompurify";
import { useState, useMemo, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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

// ── Sandboxed iframe email renderer ─────────────────────────────────────────
// Renders the email HTML in a fully isolated iframe so the sender's styles,
// fonts, images and table layouts are preserved exactly as intended.
// Uses postMessage to auto-resize height without needing allow-same-origin.
function EmailIframe({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);

  // Inject a tiny resize script into the email HTML before rendering
  const srcDoc = useMemo(() => {
    const resizeScript = `<script>
(function(){
  function send(){
    window.parent.postMessage({type:'ghist-iframe-height',h:document.body.scrollHeight},'*');
  }
  document.addEventListener('DOMContentLoaded', send);
  window.addEventListener('load', send);
  // Re-check after images load
  setTimeout(send, 500);
  setTimeout(send, 1500);
})();
<\/script>`;
    // Insert before </body> or append
    if (html.includes('</body>')) {
      return html.replace('</body>', resizeScript + '</body>');
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
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      title="Email content"
      style={{ width: "100%", height, border: "none", display: "block", background: "white", borderRadius: "8px" }}
      scrolling="no"
    />
  );
}

export function MessageDetail({ message, onBack }: MessageDetailProps) {
  const [otpCopied, setOtpCopied] = useState(false);
  const { toast } = useToast();

  const otp = useMemo(
    () => extractOTP(message.subject + " " + message.textBody),
    [message]
  );

  const sanitizedHtml = useMemo(() => {
    if (!message.htmlBody) return null;

    // ── Step 1: stash all http image URLs before DOMPurify can touch them ──
    // DOMPurify v3 sanitises URI attributes and rewrites http src to "#".
    // We swap them for data-ghist-src placeholders first, sanitise, then
    // restore + proxy-rewrite afterwards.
    const raw = message.htmlBody
      .replace(/(<img[^>]*?)\ssrc=(")(https?:[^"]*?)("|)/gi, '$1 data-ghist-src=$2$3$4')
      .replace(/(<img[^>]*?)\ssrc=(')(https?:[^']*?)('|)/gi, "$1 data-ghist-src=$2$3$4")
      .replace(/(<source[^>]*?)\ssrc=(")(https?:[^"]*?)("|)/gi, '$1 data-ghist-src=$2$3$4');

    // ── Step 2: sanitise — scripts/iframes out, everything structural kept ──
    const clean = DOMPurify.sanitize(raw, {
      WHOLE_DOCUMENT: true,
      FORCE_BODY: true,
      ADD_TAGS: [
        "html", "head", "body", "meta", "title", "style", "link",
        "center", "font", "small", "sup", "sub", "img", "picture", "source",
        "table", "thead", "tbody", "tfoot", "tr", "td", "th",
      ],
      ADD_ATTR: [
        "data-ghist-src", "srcset",
        "alt", "width", "height", "border",
        "align", "valign", "cellpadding", "cellspacing", "colspan", "rowspan",
        "bgcolor", "color", "size", "face",
        "charset", "name", "content", "http-equiv",
        "rel", "type", "media", "background",
      ],
      FORBID_TAGS: ["script", "noscript", "iframe", "object", "embed", "form", "input", "button", "textarea"],
      FORBID_ATTR: ["onclick", "ondblclick", "onerror", "onmouseover", "onmouseout", "onkeyup", "onkeydown", "onsubmit"],
    });

    const doc = new DOMParser().parseFromString(clean, "text/html");
    const proxyBase = `${window.location.origin}/api/imgproxy?url=`;

    const toProxy = (url: string) =>
      url.startsWith("http") ? proxyBase + encodeURIComponent(url) : url;

    // ── Step 3: restore stashed src values and proxy them ──
    doc.querySelectorAll("img[data-ghist-src], source[data-ghist-src]").forEach((el) => {
      const original = el.getAttribute("data-ghist-src") || "";
      el.setAttribute("src", toProxy(original));
      el.removeAttribute("data-ghist-src");
    });

    // ── Step 4: proxy srcset ──
    doc.querySelectorAll("[srcset]").forEach((el) => {
      const rewritten = (el.getAttribute("srcset") || "")
        .split(",")
        .map(part => {
          const [u, ...rest] = part.trim().split(/\s+/);
          return u.startsWith("http") ? [toProxy(u), ...rest].join(" ") : part;
        })
        .join(", ");
      el.setAttribute("srcset", rewritten);
    });

    // ── Step 5: proxy inline style background-image on elements ──
    doc.querySelectorAll("[style]").forEach((el) => {
      const s = el.getAttribute("style") || "";
      const patched = s.replace(
        /url\(['"]?(https?:[^'")]+)['"]?\)/gi,
        (_, u) => `url(${toProxy(u)})`
      );
      if (patched !== s) el.setAttribute("style", patched);
    });

    // ── Step 6: proxy background= attribute (old-school HTML emails) ──
    doc.querySelectorAll("[background]").forEach((el) => {
      const bg = el.getAttribute("background") || "";
      if (bg.startsWith("http")) el.setAttribute("background", toProxy(bg));
    });

    // ── Step 7: proxy URLs inside <style> blocks ──
    doc.querySelectorAll("style").forEach((style) => {
      style.textContent = (style.textContent || "").replace(
        /url\(['"]?(https?:[^'")]+)['"]?\)/gi,
        (_, u) => `url(${toProxy(u)})`
      );
    });

    // ── Step 8: links open in new tab, scrub javascript: hrefs ──
    doc.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href.toLowerCase().startsWith("javascript")) {
        a.removeAttribute("href");
      } else {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });

    // ── Step 9: <base> so any remaining relative paths resolve to origin ──
    const base = doc.createElement("base");
    base.setAttribute("target", "_blank");
    (doc.head || doc.documentElement).insertBefore(base, doc.head?.firstChild ?? null);

    return doc.documentElement.outerHTML;
  }, [message.htmlBody]);

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
        {/* Header: subject + meta */}
        <div className="space-y-2">
          <h2
            className="font-display text-xl sm:text-2xl font-bold text-foreground leading-snug"
            data-testid="text-subject"
          >
            {message.subject}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 text-xs text-muted-foreground font-body">
            <span>
              From:{" "}
              <span className="text-foreground font-medium">
                {message.fromName ? `${message.fromName} <${message.from}>` : message.from}
              </span>
            </span>
            <span className="hidden sm:inline text-border">·</span>
            <span className="tabular-nums">
              {format(new Date(message.receivedAt), "MMM d, yyyy 'at' h:mm a")}
              {" · "}
              {formatDistanceToNow(new Date(message.receivedAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* OTP highlight — editorial card with tonal bg */}
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

        {/* Action links */}
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

        {/* Email body — rendered in isolated iframe so sender styles/images are preserved */}
        <div className="pt-4" data-testid="text-email-body">
          {sanitizedHtml ? (
            <EmailIframe html={sanitizedHtml} />
          ) : (
            <pre
              className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed"
            >
              {message.textBody}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
