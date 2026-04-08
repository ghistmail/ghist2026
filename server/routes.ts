import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";

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
      return res.json(alreadyCached);
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
          htmlBody: msg.mail_body || "",
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

  return httpServer;
}
