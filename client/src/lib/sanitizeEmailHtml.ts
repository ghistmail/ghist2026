import DOMPurify from "dompurify";

// ── sanitizeEmailHtml ──────────────────────────────────────────────────────
// Extracted from MessageDetail.tsx so the full sanitisation/proxy-rewriting
// pipeline can be exercised directly by regression tests, independent of
// React rendering. Behaviour is unchanged except for the two defects fixed
// below (see inline notes marked FIX).
//
// Returns the final srcdoc-ready HTML string, or null if htmlBody is empty.
// Never throws: any unexpected error during DOM manipulation is caught and
// logged, and the function falls back to a minimal-but-safe rendering of the
// original sanitised markup rather than surfacing a blank iframe.
export function sanitizeEmailHtml(htmlBody: string | null | undefined, origin: string): string | null {
  if (!htmlBody) return null;

  try {
    return runPipeline(htmlBody, origin);
  } catch (err) {
    // FIX: previously any exception thrown anywhere in this pipeline (e.g. an
    // unsupported :scope selector, a null doc.body, or a malformed structure
    // produced by a real-world ESP template) propagated straight out of the
    // sanitizedHtml useMemo with no try/catch, no error boundary anywhere in
    // the app, and no fallback — so the message body silently rendered as a
    // blank iframe with no visible error. Falling back here guarantees the
    // Original tab always shows *something* on first load.
    console.error("[sanitizeEmailHtml] pipeline failed, falling back to minimal sanitisation:", err);
    try {
      return DOMPurify.sanitize(htmlBody, { WHOLE_DOCUMENT: false });
    } catch (fallbackErr) {
      console.error("[sanitizeEmailHtml] fallback sanitisation also failed:", fallbackErr);
      return null;
    }
  }
}

function runPipeline(htmlBody: string, origin: string): string {
  // ── Step 0: unwrap provider image proxy rewrites ──
  // Guerrilla Mail (and some other providers) rewrite every <img src="https://...">
  // to their own relative proxy path: /res.php?r=1&n=img&q=<encoded_original_url>
  // These relative URLs resolve against about:srcdoc in the iframe and never load.
  // Extract the original URL from the q= parameter and restore it.
  const unwrapped = htmlBody
    // Handle src="/res.php?...&q=<encoded>" on img/source elements
    .replace(
      /src=["']\/res\.php[^"']*?[?&](?:amp;)?q=([^&"'\s]+)[^"']*?["']/gi,
      (_m: string, encoded: string) => {
        try {
          const url = decodeURIComponent(encoded);
          if (/^https?:\/\//.test(url)) return `src="${url}"`;
        } catch { /* ignore */ }
        return _m;
      }
    )
    // Handle background-image:url(&quot;/res.php?...q=...&quot;) in style attrs
    .replace(
      /url\((?:&quot;|["']?)\/res\.php[^)]*?[?&](?:amp;)?q=([^&)"';\s]+)[^)]*?(?:&quot;|["']?)\)/gi,
      (_m: string, encoded: string) => {
        try {
          const url = decodeURIComponent(encoded);
          if (/^https?:\/\//.test(url)) return `url("${url}")`;
        } catch { /* ignore */ }
        return _m;
      }
    );

  // ── Step 1: stash all http image URLs before DOMPurify can touch them ──
  // DOMPurify v3 sanitises URI attributes and rewrites http src to "#".
  // We swap them for data-ghist-src placeholders first, sanitise, then
  // restore + proxy-rewrite afterwards.
  const raw = unwrapped
    .replace(/(<img[^>]*?)\ssrc=(")(https?:[^"]*?)("|)/gi, '$1 data-ghist-src=$2$3$4')
    .replace(/(<img[^>]*?)\ssrc=(')(https?:[^']*?)('|)/gi, "$1 data-ghist-src=$2$3$4")
    .replace(/(<source[^>]*?)\ssrc=(")(https?:[^"]*?)("|)/gi, '$1 data-ghist-src=$2$3$4');

  // ── Step 2: sanitise — scripts/iframes out, everything structural kept ──
  // FIX: DOMPurify's WHOLE_DOCUMENT + FORCE_BODY combination has a documented
  // defect (cure53/DOMPurify #501, #744) where <head> is dropped and its
  // children (meta/title/style) are dumped as loose nodes at the top of
  // <body> instead of staying inside <head>. On real-world templates this
  // caused a stray, now-unhidden <title> string to render as visible text,
  // and in some engines corrupted enough structure to break layout entirely.
  // FORCE_BODY is not actually needed alongside WHOLE_DOCUMENT — WHOLE_DOCUMENT
  // already parses/keeps a full <html><head><body> tree, so FORCE_BODY (which
  // exists to wrap body-less fragments) is redundant here and is what triggers
  // the head-corruption path. Dropping it keeps head content inside head.
  const clean = DOMPurify.sanitize(raw, {
    WHOLE_DOCUMENT: true,
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
  }) as string;

  const doc = new DOMParser().parseFromString(clean, "text/html");
  // Opaque base64 payload under a short, non-signature-matching path/param —
  // see the /api/media-relay note in server/routes.ts for why this changed
  // from /api/imgproxy?url=<raw-url> (ad-blocker/Brave Shields false positive).
  const proxyBase = `${origin}/api/media-relay?d=`;

  const toProxy = (url: string) =>
    url.startsWith("http")
      ? proxyBase + encodeURIComponent(btoa(encodeURIComponent(url)))
      : url;

  // ── Step 2b: strip stealth/anti-AI content ────────────────────────────
  // Remove nodes hidden via CSS tricks that could carry injected instructions
  // invisible to the user but readable by AI agents parsing the DOM.
  // 1. Inline display:none / visibility:hidden / zero-opacity / zero-font-size
  // NOTE: white color is NOT removed — legitimate emails use white text on
  // dark/coloured backgrounds. Only strip truly invisible elements.
  //
  // IMPORTANT: Klaviyo/MJML sets font-size:0 on structural td/div wrappers to
  // eliminate inline-block whitespace. Those wrappers contain child tables,
  // images, and explicitly sized text. Removing the whole wrapper therefore
  // deletes visible email sections. Treat zero-font *leaf* content as hidden,
  // but preserve zero-font containers and remove only their direct text nodes;
  // visible descendants establish their own font size.
  doc.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
    const s = (el.getAttribute("style") || "").toLowerCase();
    const fullyHidden =
      /display\s*:\s*none/.test(s) ||
      /visibility\s*:\s*hidden/.test(s) ||
      /opacity\s*:\s*0(?:[^.\d]|$)/.test(s);
    const zeroFont =
      /font-size\s*:\s*0(?:px|pt|em|rem|%)/.test(s) ||
      /font-size\s*:\s*0(?:[^.\d]|$)/.test(s);

    if (fullyHidden || (zeroFont && el.childElementCount === 0)) {
      el.remove();
    } else if (zeroFont) {
      Array.from(el.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim()) {
          node.parentNode?.removeChild(node);
        }
      });
    }
  });
  // 2. HTML comment nodes — can carry hidden instructions
  const commentWalker = document.createTreeWalker(doc.documentElement, NodeFilter.SHOW_COMMENT);
  const comments: Node[] = [];
  while (commentWalker.nextNode()) comments.push(commentWalker.currentNode);
  comments.forEach(c => c.parentNode?.removeChild(c));
  // 3. Zero-width / invisible Unicode characters in text nodes
  const textWalker = document.createTreeWalker(doc.documentElement, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (textWalker.nextNode()) textNodes.push(textWalker.currentNode as Text);
  textNodes.forEach(tn => {
    // Strip zero-width spaces, soft hyphens, invisible separators
    tn.nodeValue = (tn.nodeValue || "").replace(/[\u00AD\u200B-\u200D\u2060\uFEFF\u034F]/g, "");
  });

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

  // ── Step 9: <base href> so proxied absolute URLs resolve correctly ──
  // Also inject a viewport meta and responsive override CSS so wide email
  // tables scale down to fit mobile screens inside the iframe.
  // FIX: guard doc.head — WHOLE_DOCUMENT normally guarantees a <head>, but
  // fall back to documentElement defensively rather than assuming.
  const head = doc.head || doc.documentElement;

  const base = doc.createElement("base");
  base.setAttribute("href", origin + "/");
  base.setAttribute("target", "_blank");
  head.insertBefore(base, head.firstChild);

  // Viewport meta — required for mobile scaling inside srcdoc iframe
  const viewport = doc.createElement("meta");
  viewport.setAttribute("name", "viewport");
  viewport.setAttribute("content", "width=device-width, initial-scale=1.0");
  head.insertBefore(viewport, base.nextSibling);

  // ── Step 9b: strip pixel width attrs from ALL tables ──
  // Inline width="600"/"560" attributes override any CSS width rules.
  // The only safe way to make nested email tables fluid is to remove the
  // pixel width attribute from every table (td/th widths are left alone so
  // column proportion hints are preserved). We stash the largest value as
  // max-width on the outermost table so it still constrains on wide screens.
  let maxTablePx = 0;
  doc.querySelectorAll("table").forEach((el) => {
    const w = el.getAttribute("width");
    if (w && /^\d+$/.test(w.trim())) {
      const px = parseInt(w, 10);
      if (px > maxTablePx) maxTablePx = px;
      el.removeAttribute("width");
    }
  });
  // Apply max-width constraint to the outermost wrapper table only.
  // FIX: :scope-relative CSS selectors have had inconsistent support across
  // WebKit/older engines; wrap in try/catch so a selector-support gap can
  // never take down the whole pipeline (previously unguarded).
  let outerTable: HTMLElement | null = null;
  try {
    outerTable = doc.body?.querySelector(
      ":scope > table, :scope > center > table, :scope > div > table"
    ) as HTMLElement | null;
  } catch {
    outerTable = doc.body?.querySelector("table") as HTMLElement | null;
  }
  if (outerTable && maxTablePx > 0) {
    outerTable.style.maxWidth = maxTablePx + "px";
  }

  // Responsive override: scale email to viewport
  const style = doc.createElement("style");
  style.textContent = [
    // Root containment — srcdoc document must not exceed iframe width
    "html, body { width:100%!important; max-width:100%!important;"
      + " margin:0!important; padding:0!important; overflow-x:hidden!important; }",
    // All tables fluid — width attrs already stripped above
    "table { width:100%!important; max-width:100%!important; }",
    // Images scale down, never overflow
    "img { max-width:100%!important; height:auto!important; display:block; }",
    // Cells clip cleanly
    "td, th { word-break:break-word; box-sizing:border-box; }",
  ].join(" ");
  head.appendChild(style);

  return doc.documentElement.outerHTML;
}
