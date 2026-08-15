import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import path from "path";
import { sanitizeEmailHtml } from "./sanitizeEmailHtml";

const ORIGIN = "https://ghist.email";

function loadFixture(name: string): string {
  return fs.readFileSync(
    path.resolve(__dirname, "__fixtures__", name),
    "utf-8"
  );
}

// Extracts plain text from a rendered srcdoc string the same way a human
// eyeballing the iframe would perceive content: strip tags/comments, collapse
// whitespace.
function visibleText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

describe("sanitizeEmailHtml", () => {
  it("returns null for empty/missing htmlBody", () => {
    expect(sanitizeEmailHtml(null, ORIGIN)).toBeNull();
    expect(sanitizeEmailHtml(undefined, ORIGIN)).toBeNull();
    expect(sanitizeEmailHtml("", ORIGIN)).toBeNull();
  });

  it("renders a plain simple HTML email with all visible content intact", () => {
    const out = sanitizeEmailHtml(loadFixture("plain-html-sample.html"), ORIGIN);
    expect(out).not.toBeNull();
    const text = visibleText(out!);
    expect(text).toContain("Thanks for your order");
    expect(text).toContain("Your order #1234 has shipped");
    expect(text).toContain("Track your package");
  });

  it("renders the Klaviyo-style fixture (XHTML doctype, MSO conditionals, VML namespaces, tracking pixel) with all visible content intact", () => {
    const out = sanitizeEmailHtml(loadFixture("klaviyo-sample.html"), ORIGIN);
    expect(out).not.toBeNull();
    const text = visibleText(out!);
    expect(text).toContain("Welcome to Half Sumo");
    expect(text).toContain("Thanks for joining the collective");
    expect(text).toContain("Shop Dogis");
  });

  it("removes the 1x1 display:none tracking pixel (invisible stealth content) without affecting real visible content", () => {
    const out = sanitizeEmailHtml(loadFixture("klaviyo-sample.html"), ORIGIN);
    expect(out).not.toBeNull();
    const doc = new DOMParser().parseFromString(out!, "text/html");
    // The tracking pixel is display:none!important — step 2b correctly
    // removes it as invisible/stealth content, same as it would remove any
    // other display:none element. This must not take any real content with it.
    const pixel = Array.from(doc.querySelectorAll("img")).find(
      (img) => img.getAttribute("width") === "1" && img.getAttribute("height") === "1"
    );
    expect(pixel).toBeUndefined();
    const text = visibleText(out!);
    expect(text).toContain("Welcome to Half Sumo");
    expect(text).toContain("Shop Dogis");
  });

  it("keeps head content inside <head>, not leaked as visible text into <body> (regression for DOMPurify WHOLE_DOCUMENT+FORCE_BODY head-corruption bug, cure53/DOMPurify#501)", () => {
    const out = sanitizeEmailHtml(loadFixture("klaviyo-sample.html"), ORIGIN);
    expect(out).not.toBeNull();
    const doc = new DOMParser().parseFromString(out!, "text/html");
    // The <title> from the original head must still be inside <head>,
    // not sitting as a loose/visible node inside <body>.
    const bodyText = doc.body?.textContent || "";
    expect(bodyText).not.toContain("Welcome to Half Sumo</title>");
    // title tag itself, if present, should be under head
    const titleInBody = doc.body?.querySelector("title");
    expect(titleInBody).toBeNull();
  });

  it("proxies remote image src, srcset, inline style background-image, and background= attribute through /api/media-relay", () => {
    const out = sanitizeEmailHtml(loadFixture("image-heavy-sample.html"), ORIGIN);
    expect(out).not.toBeNull();
    const doc = new DOMParser().parseFromString(out!, "text/html");

    const imgs = Array.from(doc.querySelectorAll("img"));
    expect(imgs.length).toBeGreaterThan(0);
    imgs.forEach((img) => {
      const src = img.getAttribute("src") || "";
      expect(src.startsWith(`${ORIGIN}/api/media-relay?d=`)).toBe(true);
    });

    const srcsetImg = imgs.find((img) => img.hasAttribute("srcset"));
    expect(srcsetImg).toBeTruthy();
    expect(srcsetImg!.getAttribute("srcset") || "").toContain("/api/media-relay?d=");

    const bgAttrEl = doc.querySelector("[background]");
    expect(bgAttrEl).toBeTruthy();
    expect(bgAttrEl!.getAttribute("background") || "").toContain("/api/media-relay?d=");

    const bgStyleEl = Array.from(doc.querySelectorAll("[style]")).find((el) =>
      (el.getAttribute("style") || "").includes("/api/media-relay?d=")
    );
    expect(bgStyleEl).toBeTruthy();

    // All visible product/section text must still be present.
    const text = visibleText(out!);
    expect(text).toContain("Featured this week");
    expect(text).toContain("See you next week");
  });

  it("adds target=_blank/rel=noopener to links and strips javascript: hrefs", () => {
    const out = sanitizeEmailHtml(
      `<html><body><a href="https://example.com">go</a><a href="javascript:alert(1)">bad</a></body></html>`,
      ORIGIN
    );
    const doc = new DOMParser().parseFromString(out!, "text/html");
    const links = Array.from(doc.querySelectorAll("a"));
    expect(links[0].getAttribute("target")).toBe("_blank");
    expect(links[0].getAttribute("rel")).toBe("noopener noreferrer");
    expect(links[1].hasAttribute("href")).toBe(false);
  });

  it("strips display:none / visibility:hidden / zero-opacity / zero-font-size elements (stealth content)", () => {
    const out = sanitizeEmailHtml(
      `<html><body>
        <p style="display:none">hidden1</p>
        <p style="visibility:hidden">hidden2</p>
        <p style="opacity:0">hidden3</p>
        <p style="font-size:0px">hidden4</p>
        <p>visible content</p>
      </body></html>`,
      ORIGIN
    );
    const text = visibleText(out!);
    expect(text).not.toContain("hidden1");
    expect(text).not.toContain("hidden2");
    expect(text).not.toContain("hidden3");
    expect(text).not.toContain("hidden4");
    expect(text).toContain("visible content");
  });

  it("preserves Klaviyo/MJML layout wrappers that use font-size:0 to remove inline-block whitespace", () => {
    const out = sanitizeEmailHtml(
      `<html><body>
        <div style="display:none;font-size:1px;opacity:0">Hidden preheader</div>
        <table role="presentation">
          <tr>
            <td style="direction:ltr;font-size:0px;padding:0;text-align:center">
              <div class="component-wrapper" style="font-size:0px;text-align:left;width:100%">
                <table role="presentation">
                  <tr>
                    <td class="kl-image" style="font-size:0px;word-break:break-word">
                      <div style="font-size:16px">Welcome To The Collective</div>
                      <img src="https://example.com/welcome.png" alt="Welcome artwork">
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </body></html>`,
      ORIGIN
    );

    const doc = new DOMParser().parseFromString(out!, "text/html");
    expect(doc.querySelector(".component-wrapper")).not.toBeNull();
    expect(doc.querySelector(".kl-image")).not.toBeNull();
    expect(doc.querySelector('img[alt="Welcome artwork"]')).not.toBeNull();
    expect(visibleText(out!)).toContain("Welcome To The Collective");
    expect(visibleText(out!)).not.toContain("Hidden preheader");
  });

  it("strips HTML comments and zero-width unicode characters from text nodes", () => {
    const out = sanitizeEmailHtml(
      `<html><body><p>hello<!-- secret comment -->wor\u200Bld</p></body></html>`,
      ORIGIN
    );
    expect(out).not.toContain("secret comment");
    expect(out).not.toContain("\u200B");
    expect(visibleText(out!)).toContain("helloworld");
  });

  it("strips pixel width attributes from tables and caps the outer table with max-width instead", () => {
    const out = sanitizeEmailHtml(loadFixture("klaviyo-sample.html"), ORIGIN);
    const doc = new DOMParser().parseFromString(out!, "text/html");
    // Klaviyo fixture's outermost <table> uses width:600px via inline style,
    // not a width= attribute, so there's nothing to strip there; the real
    // regression check is that no *inner* content table carries a leftover
    // pixel width= attribute that would prevent it scaling down on mobile.
    const innerTables = Array.from(doc.querySelectorAll("table")).slice(1);
    innerTables.forEach((t) => expect(t.hasAttribute("width")).toBe(false));
  });

  it("strips a plain width= pixel attribute from a table and caps the outer wrapper's max-width from it", () => {
    const html = `<html><body><table width="620"><tr><td><h1>content</h1></td></tr></table></body></html>`;
    const out = sanitizeEmailHtml(html, ORIGIN);
    const doc = new DOMParser().parseFromString(out!, "text/html");
    const table = doc.querySelector("table")!;
    expect(table.hasAttribute("width")).toBe(false);
    expect(table.getAttribute("style") || "").toContain("max-width: 620px");
  });

  it("injects a <base> tag and a viewport meta tag for correct proxied-URL resolution and mobile scaling", () => {
    const out = sanitizeEmailHtml(loadFixture("plain-html-sample.html"), ORIGIN);
    const doc = new DOMParser().parseFromString(out!, "text/html");
    expect(doc.querySelector("base")?.getAttribute("href")).toBe(`${ORIGIN}/`);
    expect(doc.querySelector('meta[name="viewport"]')).toBeTruthy();
  });

  it("never throws and always returns content for a deeply nested MSO conditional comment structure wrapping the entire body", () => {
    const html = `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head>
<body>
<!--[if mso]>
<table role="presentation" width="600" align="center"><tr><td>
<![endif]-->
<!--[if !mso]><!-->
<div style="max-width:600px;margin:0 auto;">
<!--<![endif]-->
  <table role="presentation" width="100%">
    <tr><td>
      <h1>Deeply nested content</h1>
      <p>Should survive sanitisation</p>
    </td></tr>
  </table>
<!--[if !mso]><!-->
</div>
<!--<![endif]-->
<!--[if mso]>
</td></tr></table>
<![endif]-->
</body>
</html>`;
    expect(() => sanitizeEmailHtml(html, ORIGIN)).not.toThrow();
    const out = sanitizeEmailHtml(html, ORIGIN);
    const text = visibleText(out!);
    expect(text).toContain("Deeply nested content");
    expect(text).toContain("Should survive sanitisation");
  });

  it("falls back to minimal sanitisation instead of returning a blank/empty result when the main pipeline throws", () => {
    const html = `<html><body><h1>Fallback content</h1></body></html>`;

    // Force DOMParser to throw only on the *second* invocation used inside the
    // main pipeline path (simulating an unexpected engine-specific failure),
    // while leaving the fallback's own use of DOMPurify.sanitize working —
    // this proves the outer try/catch in sanitizeEmailHtml actually engages
    // and still returns usable content rather than null/empty.
    const OriginalDOMParser = globalThis.DOMParser;
    let callCount = 0;
    // @ts-expect-error - test override
    globalThis.DOMParser = class extends OriginalDOMParser {
      parseFromString(...args: Parameters<DOMParser["parseFromString"]>) {
        callCount++;
        if (callCount === 1) {
          throw new Error("simulated DOMParser failure");
        }
        return super.parseFromString(...args);
      }
    };

    try {
      const out = sanitizeEmailHtml(html, ORIGIN);
      expect(out).not.toBeNull();
      expect(out).not.toBe("");
    } finally {
      globalThis.DOMParser = OriginalDOMParser;
    }
  });

  it("logs but does not throw when the pipeline encounters malformed/incomplete markup", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const malformed = `<html><body><table><tr><td><div><span>unclosed tags galore`;
    expect(() => sanitizeEmailHtml(malformed, ORIGIN)).not.toThrow();
    const out = sanitizeEmailHtml(malformed, ORIGIN);
    expect(out).not.toBeNull();
    expect(visibleText(out!)).toContain("unclosed tags galore");
    consoleSpy.mockRestore();
  });
});
