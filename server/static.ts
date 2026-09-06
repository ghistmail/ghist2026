import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

// Per-route meta — crawlers get the correct title/description for each marketing page.
// The app shell (/) and inbox (/inbox, /#/) keep the default index.html meta.
interface RouteMeta {
  title: string;
  description: string;
  canonical: string;
}

const BASE = "https://ghist.email";

const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "Free Temporary Email Address | Ghist — Instant & Anonymous",
    description: "Get a free disposable email address in seconds — no sign-up. Perfect for free trials, OTPs, and avoiding spam. Permanently deleted after 24 hours.",
    canonical: `${BASE}/`,
  },
  "/faq": {
    title: "FAQ — Ghist Disposable Email | Common Questions Answered",
    description: "Answers to common questions about Ghist: how temp email works, how long addresses last, privacy, security, and more.",
    canonical: `${BASE}/faq`,
  },
  "/about": {
    title: "About Ghist — Free Anonymous Temporary Email Service",
    description: "Learn about Ghist: why we built a privacy-first disposable email service and how it keeps your real inbox spam-free.",
    canonical: `${BASE}/about`,
  },
  "/blog": {
    title: "Ghist Blog — Privacy, Email Security & Disposable Inboxes",
    description: "Tips, guides, and insights on protecting your inbox, online privacy, and getting the most from disposable email addresses.",
    canonical: `${BASE}/blog`,
  },
  "/privacy": {
    title: "Privacy Policy — Ghist Temporary Email",
    description: "Ghist\'s privacy policy: what data we collect (almost none), how we handle emails, and your rights.",
    canonical: `${BASE}/privacy`,
  },
  "/terms": {
    title: "Terms of Service — Ghist Temporary Email",
    description: "Terms of service for Ghist: acceptable use, limitations, and service conditions for our disposable email platform.",
    canonical: `${BASE}/terms`,
  },
  "/contact": {
    title: "Contact Ghist — Get in Touch",
    description: "Have a question or need support? Contact the Ghist team.",
    canonical: `${BASE}/contact`,
  },
  // Locale variants — Spanish
  "/es": {
    title: "Correo Temporal Gratis | Ghist — Email Desechable Instantáneo",
    description: "Obtén una dirección de email temporal gratis en segundos — sin registro, sin rastreo. Se elimina automáticamente en 24 horas.",
    canonical: `${BASE}/es`,
  },
  "/es/faq": {
    title: "Preguntas Frecuentes — Ghist Email Desechable",
    description: "Respuestas a las preguntas más comunes sobre Ghist: cómo funciona, cuánto dura la dirección, privacidad y seguridad.",
    canonical: `${BASE}/es/faq`,
  },
  "/es/about": {
    title: "Sobre Ghist — Servicio de Email Temporal Anónimo",
    description: "Conoce Ghist: por qué creamos un servicio de email desechable orientado a la privacidad.",
    canonical: `${BASE}/es/about`,
  },
  "/es/blog": {
    title: "Blog de Ghist — Privacidad y Seguridad de Email",
    description: "Consejos y guías sobre protección de tu bandeja de entrada y privacidad en línea.",
    canonical: `${BASE}/es/blog`,
  },
  // English locale prefix (same content as root, different canonical)
  "/en": {
    title: "Free Temporary Email Address | Ghist — Instant & Anonymous",
    description: "Get a free disposable email address in seconds — no sign-up. Permanently deleted after 24 hours.",
    canonical: `${BASE}/en`,
  },
  "/en/faq": {
    title: "FAQ — Ghist Disposable Email | Common Questions Answered",
    description: "Answers to common questions about Ghist: how temp email works, privacy, security, and more.",
    canonical: `${BASE}/en/faq`,
  },
  "/en/about": {
    title: "About Ghist — Free Anonymous Temporary Email Service",
    description: "Learn about Ghist: why we built a privacy-first disposable email service.",
    canonical: `${BASE}/en/about`,
  },
  "/en/blog": {
    title: "Ghist Blog — Privacy, Email Security & Disposable Inboxes",
    description: "Tips, guides, and insights on protecting your inbox and online privacy.",
    canonical: `${BASE}/en/blog`,
  },
};

/** Resolve the closest meta entry for a given pathname.
 *  Strips trailing slash, then exact-matches; falls back to the root entry. */
function metaForPath(pathname: string): RouteMeta {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return ROUTE_META[clean] ?? ROUTE_META["/"];
}

/** Inject title, description, canonical, and OG/Twitter equivalents into raw HTML. */
function injectMeta(html: string, meta: RouteMeta): string {
  return html
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${meta.title}</title>`,
    )
    .replace(
      /(<meta name="description" content=")[^"]*("|')/,
      `$1${meta.description}"`,
    )
    .replace(
      /(<link rel="canonical" href=")[^"]*("|')/,
      `$1${meta.canonical}"`,
    )
    .replace(
      /(<meta property="og:url" content=")[^"]*("|')/,
      `$1${meta.canonical}"`,
    )
    .replace(
      /(<meta property="og:title" content=")[^"]*("|')/,
      `$1${meta.title}"`,
    )
    .replace(
      /(<meta property="og:description" content=")[^"]*("|')/,
      `$1${meta.description}"`,
    )
    .replace(
      /(<meta name="twitter:title" content=")[^"]*("|')/,
      `$1${meta.title}"`,
    )
    .replace(
      /(<meta name="twitter:description" content=")[^"]*("|')/,
      `$1${meta.description}"`,
    );
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Read index.html once at startup; inject per-route meta before serving.
  const indexPath = path.resolve(distPath, "index.html");
  const baseHtml = fs.readFileSync(indexPath, "utf-8");

  app.use("/{*path}", (req: Request, res: Response) => {
    const meta = metaForPath(req.path);
    const html = injectMeta(baseHtml, meta);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });
}
