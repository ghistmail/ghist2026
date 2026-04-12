import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { Resend } from "resend";

// Resend client — only active when RESEND_API_KEY is set
const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const CONTACT_TO = process.env.CONTACT_EMAIL ?? "alexwain+ghist@gmail.com";

// ============================================================
// Guerrilla Mail API (primary — works from cloud hosting)
// ============================================================
const GM_API = "https://api.guerrillamail.com/ajax.php";

async function gmGetEmail(): Promise<{ email: string; sidToken: string; domain: string }> {
  const res = await fetch(`${GM_API}?f=get_email_address&lang=en`);
  if (!res.ok) throw new Error("Guerrilla Mail API unavailable");
  const data = await res.json() as any;
  if (!data.email_addr) throw new Error("No email returned");
  const parts = data.email_addr.split("@");
  return {
    email: data.email_addr,
    sidToken: data.sid_token,
    domain: parts[1] || "guerrillamailblock.com",
  };
}

async function gmCheckEmail(sidToken: string, seq: number = 0): Promise<any[]> {
  const res = await fetch(`${GM_API}?f=check_email&seq=${seq}&sid_token=${sidToken}`);
  if (!res.ok) return [];
  const data = await res.json() as any;
  return data.list || [];
}

async function gmFetchEmail(sidToken: string, emailId: string): Promise<any> {
  const res = await fetch(`${GM_API}?f=fetch_email&email_id=${emailId}&sid_token=${sidToken}`);
  if (!res.ok) throw new Error("Failed to fetch email");
  return res.json();
}

async function gmForgetMe(sidToken: string, emailAddr: string): Promise<void> {
  try {
    await fetch(`${GM_API}?f=forget_me&email_addr=${encodeURIComponent(emailAddr)}&sid_token=${sidToken}`);
  } catch {
    // Best effort
  }
}

// ============================================================
// mail.tm API (fallback)
// ============================================================
const MAIL_API = "https://api.mail.tm";

async function mtGetDomain(): Promise<string> {
  const res = await fetch(`${MAIL_API}/domains`);
  const data = await res.json() as any;
  const domains = data["hydra:member"] || [];
  const active = domains.filter((d: any) => d.isActive && !d.isPrivate);
  if (active.length === 0) throw new Error("No active mail.tm domains");
  return active[Math.floor(Math.random() * active.length)].domain;
}

async function mtCreateAccount(address: string, password: string): Promise<any> {
  const res = await fetch(`${MAIL_API}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  if (!res.ok) throw new Error(`mail.tm account creation failed`);
  return res.json();
}

async function mtGetToken(address: string, password: string): Promise<string> {
  const res = await fetch(`${MAIL_API}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  if (!res.ok) throw new Error(`mail.tm token failed`);
  const data = await res.json() as any;
  return data.token;
}

async function mtFetchMessages(token: string): Promise<any[]> {
  const res = await fetch(`${MAIL_API}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json() as any;
  return data["hydra:member"] || [];
}

async function mtFetchMessage(token: string, messageId: string): Promise<any> {
  const res = await fetch(`${MAIL_API}/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Message not found");
  return res.json();
}

async function mtDeleteAccount(token: string, accountId: string): Promise<void> {
  try {
    await fetch(`${MAIL_API}/accounts/${accountId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {}
}

// ============================================================
// Maildrop API (second fallback — no account needed, just pick a name)
// ============================================================
const MAILDROP_API = "https://maildrop.cc/api";

function randomMaildropLocal(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 12; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

async function mdFetchMessages(local: string): Promise<any[]> {
  const res = await fetch(`${MAILDROP_API}/mailbox/${local}`);
  if (!res.ok) return [];
  const data = await res.json() as any;
  return Array.isArray(data) ? data : [];
}

async function mdFetchMessage(local: string, messageId: string): Promise<any> {
  const res = await fetch(`${MAILDROP_API}/mailbox/${local}/${messageId}`);
  if (!res.ok) throw new Error("Message not found");
  return res.json();
}

// ============================================================
// Helpers
// ============================================================
function randomLocal(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 });
    return true;
  }
  if (limit.count >= 15) return false;
  limit.count++;
  return true;
}

// Cleanup expired mailboxes every 2 minutes
setInterval(async () => {
  const expired = await storage.getExpiredMailboxes();
  for (const mailbox of expired) {
    try {
      if (mailbox.provider === "guerrilla" && mailbox.sidToken) {
        await gmForgetMe(mailbox.sidToken, mailbox.address);
      } else if (mailbox.provider === "mailtm" && mailbox.mailToken && mailbox.accountId) {
        await mtDeleteAccount(mailbox.mailToken, mailbox.accountId);
      }
    } catch {}
    await storage.deleteMessagesByMailbox(mailbox.id);
    await storage.deleteMailbox(mailbox.id);
  }
  // Clean rate limit entries
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 120000);

// ============================================================
// Routes
// ============================================================
/**
 * Some email providers (e.g. Guerrilla Mail) rewrite <img src="https://..."> to
 * their own proxy path: /res.php?r=1&n=img&q=<encoded_original_url>
 * These relative paths break in our srcdoc iframe. Unwrap them back to the
 * original absolute URL so our own imgproxy can handle them.
 */
function unwrapProviderImageProxies(html: string): string {
  // Handle src="/res.php?...q=<encoded>..." on img/source tags
  let result = html.replace(
    /src=["']\/res\.php[^"']*?[?&](?:amp;)?q=([^&"'\s]+)[^"']*?["']/gi,
    (_match: string, encoded: string) => {
      try {
        const url = decodeURIComponent(encoded);
        if (/^https?:\/\//.test(url)) return `src="${url}"`;
      } catch { /* ignore malformed */ }
      return _match;
    }
  );
  // Handle background-image:url(&quot;/res.php?...q=...&quot;) in style attributes
  result = result.replace(
    /url\((?:&quot;|["']?)\/res\.php[^)]*?[?&](?:amp;)?q=([^&)"';\s]+)[^)]*?(?:&quot;|["']?)\)/gi,
    (_match: string, encoded: string) => {
      try {
        const url = decodeURIComponent(encoded);
        if (/^https?:\/\//.test(url)) return `url("${url}")`;
      } catch { /* ignore */ }
      return _match;
    }
  );
  return result;
}

/** Strip HTML tags and decode common entities to get plain text */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")         // remove all tags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#\d+;/g, "")            // strip remaining numeric entities
    .replace(/&[a-z]+;/gi, "")         // strip any remaining named entities
    .replace(/\s+/g, " ")
    .trim();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Create a new mailbox — tries Guerrilla Mail first, falls back to mail.tm
  app.post("/api/mailbox", async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: "Too many mailboxes created. Please try again later." });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const sessionToken = randomUUID();

    // Try Guerrilla Mail first
    try {
      const gm = await gmGetEmail();

      const mailbox = await storage.createMailbox({
        address: gm.email,
        domain: gm.domain,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        sessionToken,
        sidToken: gm.sidToken,
        provider: "guerrilla",
      });

      return res.json({
        id: mailbox.id,
        address: mailbox.address,
        domain: mailbox.domain,
        createdAt: mailbox.createdAt,
        expiresAt: mailbox.expiresAt,
        sessionToken: mailbox.sessionToken,
      });
    } catch (gmErr: any) {
      console.error("Guerrilla Mail failed, trying mail.tm:", gmErr.message);
    }

    // Fallback to mail.tm
    try {
      const domain = await mtGetDomain();
      const local = randomLocal();
      const address = `${local}@${domain}`;
      const password = `Gh1st_${randomUUID().slice(0, 16)}`;

      const account = await mtCreateAccount(address, password);
      const mailToken = await mtGetToken(address, password);

      const mailbox = await storage.createMailbox({
        address,
        domain,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        sessionToken,
        mailToken,
        mailPassword: password,
        accountId: account.id,
        provider: "mailtm",
      });

      return res.json({
        id: mailbox.id,
        address: mailbox.address,
        domain: mailbox.domain,
        createdAt: mailbox.createdAt,
        expiresAt: mailbox.expiresAt,
        sessionToken: mailbox.sessionToken,
      });
    } catch (mtErr: any) {
      console.error("mail.tm also failed:", mtErr.message);
    }

    // Second fallback: Maildrop (no account creation needed)
    try {
      const local = randomMaildropLocal();
      const address = `${local}@maildrop.cc`;

      const mailbox = await storage.createMailbox({
        address,
        domain: "maildrop.cc",
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        sessionToken,
        sidToken: local, // reuse sidToken field to store the local part
        provider: "maildrop",
      });

      return res.json({
        id: mailbox.id,
        address: mailbox.address,
        domain: mailbox.domain,
        createdAt: mailbox.createdAt,
        expiresAt: mailbox.expiresAt,
        sessionToken: mailbox.sessionToken,
      });
    } catch (mdErr: any) {
      console.error("Maildrop also failed:", mdErr.message);
    }

    res.status(422).json({ error: "Failed to create mailbox. Please try again." });
  });

  // Get mailbox by session token
  app.get("/api/mailbox/:token", async (req: Request, res: Response) => {
    const mailbox = await storage.getMailboxByToken(req.params.token);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found or expired" });
    }
    if (new Date(mailbox.expiresAt) <= new Date()) {
      try {
        if (mailbox.provider === "guerrilla" && mailbox.sidToken) {
          await gmForgetMe(mailbox.sidToken, mailbox.address);
        } else if (mailbox.mailToken && mailbox.accountId) {
          await mtDeleteAccount(mailbox.mailToken, mailbox.accountId);
        }
      } catch {}
      await storage.deleteMessagesByMailbox(mailbox.id);
      await storage.deleteMailbox(mailbox.id);
      return res.status(410).json({ error: "Mailbox has expired and been deleted" });
    }
    res.json({
      id: mailbox.id,
      address: mailbox.address,
      domain: mailbox.domain,
      createdAt: mailbox.createdAt,
      expiresAt: mailbox.expiresAt,
      sessionToken: mailbox.sessionToken,
    });
  });

  // Get messages — proxied from the active provider, cached in DB so read messages persist
  app.get("/api/mailbox/:token/messages", async (req: Request, res: Response) => {
    const mailbox = await storage.getMailboxByToken(req.params.token);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    if (new Date(mailbox.expiresAt) <= new Date()) {
      return res.status(410).json({ error: "Mailbox has expired" });
    }

    // Always load whatever we have cached in DB first
    const cached = await storage.getMessages(mailbox.id);
    const cachedIds = new Set(cached.map((m) => m.id));

    try {
      let freshMessages: Array<{
        id: string; mailboxId: string; from: string; fromName: string;
        subject: string; textBody: string; htmlBody: string;
        receivedAt: string; isRead: boolean;
      }> = [];

      if (mailbox.provider === "guerrilla" && mailbox.sidToken) {
        const rawMessages = await gmCheckEmail(mailbox.sidToken);
        const filtered = rawMessages.filter((msg: any) => {
          const from = (msg.mail_from || "").toLowerCase();
          const subject = (msg.mail_subject || "").toLowerCase();
          if (from.includes("guerrillamail") || from.includes("grr.la")) return false;
          if (subject.includes("welcome to guerrilla")) return false;
          if (msg.mail_timestamp === 0 || msg.mail_timestamp === "0") return false;
          return true;
        });
        freshMessages = filtered.map((msg: any) => ({
          id: String(msg.mail_id),
          mailboxId: mailbox.id,
          from: msg.mail_from || "",
          fromName: "",
          subject: msg.mail_subject || "(no subject)",
          textBody: stripHtml(msg.mail_excerpt || ""),
          htmlBody: "",
          receivedAt: msg.mail_timestamp && msg.mail_timestamp > 0
            ? new Date(msg.mail_timestamp * 1000).toISOString()
            : new Date().toISOString(),
          isRead: msg.mail_read === 1,
        }));
      } else if (mailbox.provider === "mailtm") {
        let token = mailbox.mailToken;
        if (!token && mailbox.mailPassword) {
          token = await mtGetToken(mailbox.address, mailbox.mailPassword);
          await storage.updateMailToken(mailbox.id, token);
        }
        if (token) {
          const rawMessages = await mtFetchMessages(token);
          freshMessages = rawMessages.map((msg: any) => ({
            id: msg.id,
            mailboxId: mailbox.id,
            from: msg.from?.address || "",
            fromName: msg.from?.name || "",
            subject: msg.subject || "(no subject)",
            textBody: stripHtml(msg.intro || ""),
            htmlBody: "",
            receivedAt: msg.createdAt || new Date().toISOString(),
            isRead: msg.seen || false,
          }));
        }
      } else if (mailbox.provider === "maildrop" && mailbox.sidToken) {
        const rawMessages = await mdFetchMessages(mailbox.sidToken);
        freshMessages = rawMessages.map((msg: any) => ({
          id: String(msg.id),
          mailboxId: mailbox.id,
          from: msg.headerfrom || msg.sender || "",
          fromName: "",
          subject: msg.subject || "(no subject)",
          textBody: stripHtml(msg.body || ""),
          htmlBody: "",
          receivedAt: msg.date || new Date().toISOString(),
          isRead: false,
        }));
      }

      // Cache any new messages we haven't seen before
      for (const msg of freshMessages) {
        if (!cachedIds.has(msg.id)) {
          await storage.createMessage(msg);
        }
      }

      // Return the full DB set (includes read messages that providers no longer return)
      const allMessages = await storage.getMessages(mailbox.id);
      return res.json(allMessages);
    } catch (err: any) {
      console.error("Fetch messages error:", err.message);
      // On provider error, still return cached messages so inbox doesn't go blank
      return res.json(cached);
    }
  });

  // Get single message — full body from provider, falls back to DB cache, marks as read
  app.get("/api/message/:token/:messageId", async (req: Request, res: Response) => {
    const mailbox = await storage.getMailboxByToken(req.params.token);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }

    const messageId = req.params.messageId;

    // If we already have the full body cached (i.e. it was opened before), serve from cache.
    // This avoids re-fetching from providers that mark messages read and may not return them again.
    const alreadyCached = await storage.getMessage(messageId);
    if (alreadyCached && alreadyCached.isRead && alreadyCached.htmlBody) {
      return res.json({
        ...alreadyCached,
        htmlBody: unwrapProviderImageProxies(alreadyCached.htmlBody),
      });
    }

    try {
      let result: any = null;

      if (mailbox.provider === "guerrilla" && mailbox.sidToken) {
        const msg = await gmFetchEmail(mailbox.sidToken, messageId);
        const from = (msg.mail_from || "").toLowerCase();
        const subject = (msg.mail_subject || "").toLowerCase();
        if (from.includes("guerrillamail") || from.includes("grr.la") || subject.includes("welcome to guerrilla") || msg.mail_timestamp === 0 || msg.mail_timestamp === "0") {
          return res.status(404).json({ error: "Message not found" });
        }
        result = {
          id: String(msg.mail_id),
          mailboxId: mailbox.id,
          from: msg.mail_from || "",
          fromName: "",
          subject: msg.mail_subject || "(no subject)",
          textBody: stripHtml(msg.mail_body || msg.mail_excerpt || ""),
          htmlBody: unwrapProviderImageProxies(msg.mail_body || ""),
          receivedAt: msg.mail_timestamp && msg.mail_timestamp > 0
            ? new Date(msg.mail_timestamp * 1000).toISOString()
            : new Date().toISOString(),
          isRead: true,
        };
      } else if (mailbox.provider === "mailtm") {
        let token = mailbox.mailToken;
        if (!token && mailbox.mailPassword) {
          token = await mtGetToken(mailbox.address, mailbox.mailPassword);
          await storage.updateMailToken(mailbox.id, token);
        }
        if (!token) {
          return res.status(404).json({ error: "Cannot retrieve message" });
        }
        const msg = await mtFetchMessage(token, messageId);
        result = {
          id: msg.id,
          mailboxId: mailbox.id,
          from: msg.from?.address || "",
          fromName: msg.from?.name || "",
          subject: msg.subject || "(no subject)",
          textBody: stripHtml(msg.text || msg.intro || ""),
          htmlBody: msg.html?.join("") || "",
          receivedAt: msg.createdAt || new Date().toISOString(),
          isRead: true,
        };
      } else if (mailbox.provider === "maildrop" && mailbox.sidToken) {
        const msg = await mdFetchMessage(mailbox.sidToken, messageId);
        result = {
          id: String(msg.id),
          mailboxId: mailbox.id,
          from: msg.headerfrom || msg.sender || "",
          fromName: "",
          subject: msg.subject || "(no subject)",
          textBody: stripHtml(msg.body || ""),
          htmlBody: msg.body || "",
          receivedAt: msg.date || new Date().toISOString(),
          isRead: true,
        };
      }

      if (!result) {
        return res.status(404).json({ error: "Unknown provider" });
      }

      // Update the DB cache with full body + mark as read
      const existing = await storage.getMessage(messageId);
      if (existing) {
        await storage.updateMessageBody(messageId, result.textBody, result.htmlBody);
      } else {
        // First time seeing this message — cache it
        await storage.createMessage(result);
      }

      return res.json(result);
    } catch (err: any) {
      console.error("Fetch message error:", err.message);
      // Fallback: return cached version if we have it
      const cached = await storage.getMessage(messageId);
      if (cached) return res.json(cached);
      res.status(404).json({ error: "Message not found" });
    }
  });

  // ── Image proxy — fetches external email images server-side to avoid
  // referrer/CORS blocks from email marketing servers
  app.get("/api/imgproxy", async (req: Request, res: Response) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).end();
    // Only proxy http/https URLs
    if (!/^https?:\/\//i.test(url)) return res.status(400).end();
    try {
      const upstream = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Ghist/1.0)",
          "Accept": "image/*,*/*;q=0.8",
        },
        redirect: "follow",
      });
      const contentType = upstream.headers.get("content-type") || "image/jpeg";
      // Only relay image responses
      if (!contentType.startsWith("image/") && !contentType.startsWith("application/octet")) {
        return res.status(415).end();
      }
      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=86400");
      const buf = await upstream.arrayBuffer();
      return res.send(Buffer.from(buf));
    } catch (err: any) {
      return res.status(502).end();
    }
  });

  // Delete mailbox early
  app.delete("/api/mailbox/:token", async (req: Request, res: Response) => {
    const mailbox = await storage.getMailboxByToken(req.params.token);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    try {
      if (mailbox.provider === "guerrilla" && mailbox.sidToken) {
        await gmForgetMe(mailbox.sidToken, mailbox.address);
      } else if (mailbox.mailToken && mailbox.accountId) {
        await mtDeleteAccount(mailbox.mailToken, mailbox.accountId);
      }
    } catch {}
    await storage.deleteMessagesByMailbox(mailbox.id);
    await storage.deleteMailbox(mailbox.id);
    res.json({ success: true });
  });

  // ============================================================
  // SEO: robots.txt, sitemaps, locale routes, contact form
  // ============================================================

  const SITE_BASE = "https://ghist.email";

  const ALL_LOCALES = [
    "en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ur",
    "id", "de", "ja", "vi", "te", "mr", "tr", "ta", "fa", "ko",
  ];

  const RTL_LOCALES = ["ar", "ur", "fa"];

  const BLOG_SLUGS = [
    "what-is-a-temporary-email-address",
    "travel-without-inbox-clutter",
    "student-inbox-management",
    "competitor-research-without-inbox-clutter",
    "gaming-inbox-clean",
    "threat-research-inbox-separation",
    "gated-reports-without-sales-emails",
  ];

  const PAGE_PRIORITIES: Record<string, string> = {
    home: "1.0",
    blog: "0.9",
    faq: "0.8",
    about: "0.7",
    privacy: "0.6",
    terms: "0.6",
    contact: "0.6",
  };

  // Determine dist path — works both in dev (ts-node) and production (compiled)
  const distPath = process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(process.cwd(), "dist", "public");

  // Cache index.html content — read lazily on first SEO route request
  let cachedIndexHtml: string | null = null;

  function getIndexHtml(): string {
    if (cachedIndexHtml) return cachedIndexHtml;
    const htmlPath = path.join(distPath, "index.html");
    if (fs.existsSync(htmlPath)) {
      cachedIndexHtml = fs.readFileSync(htmlPath, "utf-8");
      return cachedIndexHtml;
    }
    // Fallback minimal shell for dev
    return `<!DOCTYPE html><html lang="en"><head><title>Ghist</title><meta name="description" content="Free temporary email"><link rel="canonical" href="https://ghist.email/"></head><body><div id="root"></div></body></html>`;
  }

  // Per-page meta definitions
  const PAGE_META: Record<string, (locale: string) => { title: string; description: string }> = {
    home: (locale) => ({
      title: locale === "en" ? "Free Temporary Email Address | Ghist — Instant & Anonymous" : `Ghist — Free Temporary Email (${locale.toUpperCase()})`,
      description: "Get a free disposable email address in seconds — no sign-up, no tracking. Perfect for free trials, OTPs, and avoiding spam. Permanently deleted after 24 hours.",
    }),
    privacy: (locale) => ({
      title: `Privacy Policy — Ghist`,
      description: "Read Ghist's privacy policy. We collect minimal data, store nothing beyond 24 hours, and never track users.",
    }),
    terms: (locale) => ({
      title: `Terms of Service — Ghist`,
      description: "Read Ghist's terms of service for using our free disposable temporary email service.",
    }),
    about: (locale) => ({
      title: `About Ghist — Free Disposable Email`,
      description: "Learn about Ghist: a free disposable email service built for privacy. No sign-up, no tracking, auto-deleted after 24 hours.",
    }),
    faq: (locale) => ({
      title: `FAQ — Ghist Temporary Email`,
      description: "Answers to the most frequently asked questions about Ghist's free temporary email service.",
    }),
    blog: (locale) => ({
      title: `Blog — Ghist`,
      description: "Tips, guides and articles about temporary email, inbox management, and digital privacy from the Ghist team.",
    }),
    contact: (locale) => ({
      title: `Contact — Ghist`,
      description: "Get in touch with the Ghist team. We're happy to help with questions, feedback, or bug reports.",
    }),
  };

  const BLOG_HERO_IMAGES: Record<string, string> = {
    "what-is-a-temporary-email-address": "/hero-temp-email.jpg",
    "travel-without-inbox-clutter": "/hero-travel.jpg",
    "student-inbox-management": "/hero-student.jpg",
    "competitor-research-without-inbox-clutter": "/hero-competitor.jpg",
    "gaming-inbox-clean": "/hero-gaming.jpg",
    "threat-research-inbox-separation": "/hero-threat.jpg",
    "gated-reports-without-sales-emails": "/hero-gated.jpg",
  };

  function getBlogPostMeta(slug: string): { title: string; description: string; heroImage?: string } {
    const titles: Record<string, string> = {
      "what-is-a-temporary-email-address": "What Is a Temporary Email Address and When Should You Use One? — Ghist",
      "travel-without-inbox-clutter": "How to Travel Without Inbox Clutter — Ghist",
      "student-inbox-management": "Student Inbox Management With Temporary Email — Ghist",
      "competitor-research-without-inbox-clutter": "Competitor Research Without Inbox Clutter — Ghist",
      "gaming-inbox-clean": "Keep Your Gaming Inbox Clean — Ghist",
      "threat-research-inbox-separation": "Threat Research Inbox Separation — Ghist",
      "gated-reports-without-sales-emails": "Read Gated Reports Without Sales Emails — Ghist",
    };
    const descriptions: Record<string, string> = {
      "what-is-a-temporary-email-address": "A temporary email address lets you receive emails without exposing your real inbox. Learn what it is, how it works, and the best situations to use one.",
      "travel-without-inbox-clutter": "Travelling means constant sign-ups, bookings and Wi-Fi prompts. Use temporary email to stay organised, reduce spam, and keep your inbox clear.",
      "student-inbox-management": "Uni life comes with endless sign-ups, discounts and free trials. Use temporary email to reduce clutter, stay organised, and keep your student inbox useful.",
      "competitor-research-without-inbox-clutter": "Competitor research often means signing up for reports, newsletters and webinars. Use temporary email to keep your research cleaner, sharper and easier to manage.",
      "gaming-inbox-clean": "Betas, giveaways, alt accounts and gaming communities create inbox clutter fast. Use temporary email to keep your main gaming inbox clean and easier to protect.",
      "threat-research-inbox-separation": "If you investigate phishing, suspicious portals or low-trust systems, temporary email helps you keep research contained and your real inbox out of the blast zone.",
      "gated-reports-without-sales-emails": "Want the report, not the follow-up emails? Use temporary email to access gated content without cluttering your work inbox or triggering endless sales follow-ups.",
    };
    return {
      title: titles[slug] ?? `Blog — Ghist`,
      description: descriptions[slug] ?? "Read this article on the Ghist blog.",
      heroImage: BLOG_HERO_IMAGES[slug],
    };
  }

  function serveWithMeta(
    res: Response,
    locale: string,
    page: string,
    extraMeta?: { title?: string; description?: string; canonical?: string; ogImage?: string }
  ): void {
    const isRTL = RTL_LOCALES.includes(locale);
    const metaFn = PAGE_META[page];
    const baseMeta = metaFn ? metaFn(locale) : { title: "Ghist", description: "Free temporary email" };
    const title = extraMeta?.title ?? baseMeta.title;
    const description = extraMeta?.description ?? baseMeta.description;
    const pagePath = page === "home" ? "" : `${page}/`;
    const canonical = extraMeta?.canonical ?? `${SITE_BASE}/${locale}/${pagePath}`;

    const hreflangLinks = ALL_LOCALES.map((l) => {
      const href = `${SITE_BASE}/${l}/${pagePath}`;
      return `<link rel="alternate" hreflang="${l}" href="${href}">`;
    }).join("\n    ");
    const xDefault = `<link rel="alternate" hreflang="x-default" href="${SITE_BASE}/en/${pagePath}">`;

    const safeTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeDesc = description.replace(/"/g, "&quot;").replace(/</g, "&lt;");
    const safeCanonical = canonical.replace(/"/g, "&quot;");

    const ogImageUrl = extraMeta?.ogImage
      ? `${SITE_BASE}${extraMeta.ogImage}`
      : `${SITE_BASE}/og-image.jpg`;
    const safeOgImage = ogImageUrl.replace(/"/g, "&quot;");

    let html = getIndexHtml()
      .replace(
        /<html lang="[^"]*"[^>]*>/,
        `<html lang="${locale}"${isRTL ? ' dir="rtl"' : ""}>`
      )
      .replace(
        /<title>[^<]*<\/title>/,
        `<title>${safeTitle}</title>`
      )
      .replace(
        /<meta name="description"[^>]*>/,
        `<meta name="description" content="${safeDesc}">`
      )
      .replace(
        /<meta property="og:title"[^>]*>/,
        `<meta property="og:title" content="${safeTitle}">`
      )
      .replace(
        /<meta property="og:description"[^>]*>/,
        `<meta property="og:description" content="${safeDesc}">`
      )
      .replace(
        /<meta property="og:image"[^>]*>/,
        `<meta property="og:image" content="${safeOgImage}">`
      )
      .replace(
        /<meta property="og:url"[^>]*>/,
        `<meta property="og:url" content="${safeCanonical}">`
      )
      .replace(
        /<link rel="canonical"[^>]*>/,
        `<link rel="canonical" href="${safeCanonical}">\n    ${hreflangLinks}\n    ${xDefault}`
      )
      .replace(
        "</head>",
        `<script>window.__GHIST_LOCALE__="${locale}";window.__GHIST_PAGE__="${page}";</script>\n  </head>`
      );

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  }

  // ── robots.txt
  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(
`User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_BASE}/sitemap.xml
`
    );
  });

  // ── Sitemap index
  app.get("/sitemap.xml", (_req: Request, res: Response) => {
    const locs = ALL_LOCALES.map(
      (l) => `  <sitemap>\n    <loc>${SITE_BASE}/sitemap-${l}.xml</loc>\n  </sitemap>`
    ).join("\n");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(
`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs}
</sitemapindex>
`
    );
  });

  // ── Per-locale sitemaps
  app.get("/sitemap-:locale.xml", (req: Request, res: Response) => {
    const locale = req.params.locale;
    if (!ALL_LOCALES.includes(locale)) return res.status(404).end();

    const now = new Date().toISOString().split("T")[0];
    const pages = ["home", "blog", "faq", "about", "privacy", "terms", "contact"];

    const urls: string[] = pages.map((page) => {
      const pagePath = page === "home" ? "" : `${page}/`;
      const priority = PAGE_PRIORITIES[page] ?? "0.6";
      return `  <url>\n    <loc>${SITE_BASE}/${locale}/${pagePath}</loc>\n    <lastmod>${now}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
    });

    // Add blog post URLs for English locale only
    if (locale === "en") {
      for (const slug of BLOG_SLUGS) {
        urls.push(`  <url>\n    <loc>${SITE_BASE}/en/blog/${slug}/</loc>\n    <lastmod>${now}</lastmod>\n    <priority>0.7</priority>\n  </url>`);
      }
    }

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`
    );
  });

  // ── Contact form API
  const contactRateLimit = new Map<string, { count: number; resetAt: number }>();

  function checkContactRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = contactRateLimit.get(ip);
    if (!entry || now > entry.resetAt) {
      contactRateLimit.set(ip, { count: 1, resetAt: now + 3_600_000 }); // 1 hour window
      return true;
    }
    if (entry.count >= 3) return false;
    entry.count++;
    return true;
  }

  app.post("/api/contact", async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!checkContactRateLimit(ip)) {
      return res.status(429).json({ error: "Too many requests. Please wait before submitting again." });
    }

    const { name, email, subject, message } = req.body ?? {};

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    if (!subject || typeof subject !== "string" || subject.trim().length < 3) {
      return res.status(400).json({ error: "Subject must be at least 3 characters." });
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return res.status(400).json({ error: "Message must be at least 10 characters." });
    }
    if (message.trim().length > 2000) {
      return res.status(400).json({ error: "Message must be under 2000 characters." });
    }

    // Always log to console
    console.log(`[contact] From: ${name.trim()} <${email.trim()}> | Subject: ${subject.trim()} | IP: ${ip}`);
    console.log(`[contact] Message: ${message.trim().substring(0, 200)}`);

    // Send via Resend if API key is configured
    if (resendClient) {
      try {
        await resendClient.emails.send({
          from: "Ghist Contact <onboarding@resend.dev>",
          to: CONTACT_TO,
          replyTo: `${name.trim()} <${email.trim()}>`,
          subject: `[Ghist Contact] ${subject.trim()}`,
          html: `<p><strong>From:</strong> ${name.trim()} &lt;${email.trim()}&gt;</p>
<p><strong>Subject:</strong> ${subject.trim()}</p>
<hr/>
<p style="white-space:pre-wrap">${message.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`,
          text: `From: ${name.trim()} <${email.trim()}>\nSubject: ${subject.trim()}\n\n${message.trim()}`,
        });
        console.log("[contact] Email sent via Resend");
      } catch (err) {
        console.error("[contact] Resend error:", err);
        return res.status(500).json({ error: "Failed to send your message. Please try again shortly." });
      }
    } else {
      console.warn("[contact] RESEND_API_KEY not set — email logged only");
    }

    return res.json({ success: true });
  });

  // ── Locale home routes  e.g. GET /en/  /zh/
  for (const locale of ALL_LOCALES) {
    app.get(`/${locale}`, (req: Request, res: Response) => {
      serveWithMeta(res, locale, "home");
    });
    app.get(`/${locale}/`, (req: Request, res: Response) => {
      serveWithMeta(res, locale, "home");
    });

    const internalPages = ["privacy", "terms", "about", "faq", "blog", "contact"];
    for (const page of internalPages) {
      app.get(`/${locale}/${page}`, (req: Request, res: Response) => {
        serveWithMeta(res, locale, page);
      });
      app.get(`/${locale}/${page}/`, (req: Request, res: Response) => {
        serveWithMeta(res, locale, page);
      });
    }

    // Blog post routes (en only — other locales fall through to index)
    if (locale === "en") {
      app.get(`/en/blog/:slug`, (req: Request, res: Response) => {
        const slug = req.params.slug;
        const meta = getBlogPostMeta(slug);
        serveWithMeta(res, "en", "blog", {
          title: meta.title,
          description: meta.description,
          canonical: `${SITE_BASE}/en/blog/${slug}/`,
          ogImage: meta.heroImage,
        });
      });
      app.get(`/en/blog/:slug/`, (req: Request, res: Response) => {
        const slug = req.params.slug;
        const meta = getBlogPostMeta(slug);
        serveWithMeta(res, "en", "blog", {
          title: meta.title,
          description: meta.description,
          canonical: `${SITE_BASE}/en/blog/${slug}/`,
          ogImage: meta.heroImage,
        });
      });
    }
  }

  return httpServer;
}
