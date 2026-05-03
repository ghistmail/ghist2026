export default {
  async email(message, env, ctx) {
    const raw = await new Response(message.raw).text();
    const recipient = (message.to || "").toLowerCase().trim();
    const timestamp = Date.now();
    const id = crypto.randomUUID();
    const key = `inbox:${recipient}:${timestamp}:${id}`;

    const subjectMatch = raw.match(/^Subject: (.+)$/im);
    const fromMatch = raw.match(/^From: (.+)$/im);
    let fromName = message.from;
    if (fromMatch) {
      const nameMatch = fromMatch[1].match(/^(.+?)\s*<.+>$/);
      if (nameMatch) fromName = nameMatch[1].replace(/['"]/g, "").trim();
    }

    const { textBody, htmlBody } = extractBodies(raw);

    const record = {
      id,
      to: recipient,
      from: message.from,
      fromName,
      subject: subjectMatch ? subjectMatch[1].trim() : "(No subject)",
      date: message.headers.get("date") || "",
      messageId: message.headers.get("message-id") || "",
      textBody,
      htmlBody,
      receivedAt: new Date(timestamp).toISOString(),
      expiresAt: new Date(timestamp + 24 * 60 * 60 * 1000).toISOString(),
      isRead: false,
    };

    // TTL = 86400s (24 hours) — keys auto-deleted by KV
    await env.INBOX.put(key, JSON.stringify(record), { expirationTtl: 86400 });
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return json(null, 204);
    }

    if (url.pathname === "/api/health") {
      return json({ ok: true, service: "inkpost-email-worker" });
    }

    // GET /api/inbox?email=slug@inkpost.org
    if (url.pathname === "/api/inbox" && request.method === "GET") {
      const email = (url.searchParams.get("email") || "").toLowerCase().trim();
      if (!email || !email.endsWith("@inkpost.org")) {
        return json({ error: "Valid @inkpost.org email required" }, 400);
      }

      const prefix = `inbox:${email}:`;
      const list = await env.INBOX.list({ prefix });

      const items = await Promise.all(
        list.keys.map(async ({ name }) => {
          const value = await env.INBOX.get(name);
          if (!value) return null;
          try {
            const parsed = JSON.parse(value);
            if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
              ctx.waitUntil(env.INBOX.delete(name));
              return null;
            }
            return {
              id: parsed.id,
              to: parsed.to,
              from: parsed.from,
              fromName: parsed.fromName,
              subject: parsed.subject,
              date: parsed.date,
              receivedAt: parsed.receivedAt,
              expiresAt: parsed.expiresAt,
              textBody: parsed.textBody,
              htmlBody: parsed.htmlBody || "",
              isRead: parsed.isRead,
            };
          } catch {
            return null;
          }
        })
      );

      const messages = items
        .filter(Boolean)
        .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

      return json({ email, messages });
    }

    // DELETE /api/inbox?email=slug@inkpost.org  (manual delete / generate new)
    if (url.pathname === "/api/inbox" && request.method === "DELETE") {
      const email = (url.searchParams.get("email") || "").toLowerCase().trim();
      if (!email) return json({ error: "email required" }, 400);
      const prefix = `inbox:${email}:`;
      const list = await env.INBOX.list({ prefix });
      ctx.waitUntil(
        Promise.all(list.keys.map(({ name }) => env.INBOX.delete(name)))
      );
      return json({ ok: true });
    }

    // GET /api/message/:email/:messageId  — full message including raw/html
    if (url.pathname.startsWith("/api/message/")) {
      const parts = url.pathname.split("/");
      const email = decodeURIComponent(parts[3] || "");
      const messageId = parts[4];

      if (!email || !messageId) {
        return json({ error: "Email and message ID required" }, 400);
      }

      const prefix = `inbox:${email}:`;
      const list = await env.INBOX.list({ prefix });

      for (const { name } of list.keys) {
        const value = await env.INBOX.get(name);
        if (!value) continue;
        try {
          const parsed = JSON.parse(value);
          if (parsed.id === messageId) {
            // Mark as read
            if (!parsed.isRead) {
              parsed.isRead = true;
              ctx.waitUntil(env.INBOX.put(name, JSON.stringify(parsed), { expirationTtl: 86400 }));
            }
            return json({
              id: parsed.id,
              to: parsed.to,
              from: parsed.from,
              fromName: parsed.fromName,
              subject: parsed.subject,
              date: parsed.date,
              receivedAt: parsed.receivedAt,
              expiresAt: parsed.expiresAt,
              textBody: parsed.textBody,
              htmlBody: parsed.htmlBody || "",
              isRead: true,
            });
          }
        } catch {
          continue;
        }
      }
      return json({ error: "Message not found" }, 404);
    }

    return json({ error: "Not found" }, 404);
  },
};

// ── MIME Body Extraction ──────────────────────────────────────────────────────

/**
 * Split raw MIME email into parts and return decoded text/plain + text/html.
 * Handles:
 *   - multipart/alternative, multipart/related, multipart/mixed (nested)
 *   - Content-Transfer-Encoding: quoted-printable, base64, 7bit/8bit
 *   - Non-multipart single-part emails (plain text or HTML only)
 */
function extractBodies(raw) {
  // Normalise CRLF → LF for easier parsing
  const src = raw.replace(/\r\n/g, "\n");

  // Split headers from body at the first blank line
  const blankIdx = src.indexOf("\n\n");
  if (blankIdx === -1) return { textBody: "", htmlBody: "" };

  const topHeaders = src.slice(0, blankIdx);
  const topBody    = src.slice(blankIdx + 2);

  const topCT = getHeader(topHeaders, "content-type") || "text/plain";

  // Non-multipart: single-part message
  if (!topCT.toLowerCase().includes("multipart/")) {
    const enc  = getHeader(topHeaders, "content-transfer-encoding") || "7bit";
    const decoded = decodePart(topBody, enc);
    if (/text\/html/i.test(topCT)) return { textBody: "", htmlBody: decoded };
    return { textBody: decoded, htmlBody: "" };
  }

  // Multipart: walk all parts recursively
  const boundary = getBoundary(topCT);
  if (!boundary) return { textBody: "", htmlBody: "" };

  return walkParts(topBody, boundary, 0);
}

/**
 * Recursively walk MIME parts and collect text + html.
 * depth guard prevents infinite loops on malformed messages.
 */
function walkParts(body, boundary, depth) {
  if (depth > 5) return { textBody: "", htmlBody: "" };

  const parts = splitOnBoundary(body, boundary);
  let textBody = "";
  let htmlBody  = "";

  for (const part of parts) {
    const blankIdx = part.indexOf("\n\n");
    if (blankIdx === -1) continue;

    const headers = part.slice(0, blankIdx);
    const content = part.slice(blankIdx + 2);
    const ct  = getHeader(headers, "content-type") || "";
    const enc = getHeader(headers, "content-transfer-encoding") || "7bit";

    if (/multipart\//i.test(ct)) {
      const childBoundary = getBoundary(ct);
      if (childBoundary) {
        const child = walkParts(content, childBoundary, depth + 1);
        if (!textBody && child.textBody) textBody = child.textBody;
        if (!htmlBody  && child.htmlBody)  htmlBody  = child.htmlBody;
      }
    } else if (/text\/html/i.test(ct) && !htmlBody) {
      htmlBody = decodePart(content, enc);
    } else if (/text\/plain/i.test(ct) && !textBody) {
      textBody = decodePart(content, enc);
    }

    if (textBody && htmlBody) break; // Found both — stop early
  }

  return { textBody, htmlBody };
}

/** Split a multipart body on its boundary marker. Returns array of part strings. */
function splitOnBoundary(body, boundary) {
  // Boundaries are preceded by "--" and appear on their own line
  const delimiter = "--" + boundary;
  const parts = [];
  let start = 0;

  // Find first boundary
  let pos = body.indexOf(delimiter, start);
  if (pos === -1) return parts;

  while (pos !== -1) {
    const afterDelim = pos + delimiter.length;

    // Check for closing boundary: "--boundary--"
    if (body.slice(afterDelim, afterDelim + 2) === "--") break;

    // Skip the newline after the boundary line
    const contentStart = body.indexOf("\n", afterDelim);
    if (contentStart === -1) break;

    const nextPos = body.indexOf("\n" + delimiter, contentStart);
    if (nextPos === -1) {
      // Last part
      parts.push(body.slice(contentStart + 1));
      break;
    }

    parts.push(body.slice(contentStart + 1, nextPos));
    pos = nextPos + 1;
  }

  return parts;
}

/** Extract a named header value (first occurrence, unfolded). */
function getHeader(headers, name) {
  const re = new RegExp(`^${name}:\\s*(.+(?:\\n[ \\t]+.+)*)`, "im");
  const m = headers.match(re);
  if (!m) return null;
  // Unfold continuation lines
  return m[1].replace(/\n[ \t]+/g, " ").trim();
}

/** Extract boundary= value from a Content-Type header string. */
function getBoundary(ct) {
  const m = ct.match(/boundary\s*=\s*(?:"([^"]+)"|([^\s;]+))/i);
  return m ? (m[1] || m[2]) : null;
}

/** Decode a part body based on its Content-Transfer-Encoding. */
function decodePart(body, enc) {
  const e = (enc || "").toLowerCase().trim();
  if (e === "quoted-printable") return decodeQP(body);
  if (e === "base64") {
    try {
      const cleaned = body.replace(/\s+/g, "");
      // atob() returns a binary string — decode as UTF-8 via TextDecoder
      const binary = atob(cleaned);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    } catch {
      return body;
    }
  }
  // 7bit / 8bit / binary — return as-is
  return body.trim();
}

/**
 * Quoted-Printable decoder — UTF-8 aware.
 * Soft line breaks (trailing =) are joined; =XX hex escapes are collected as
 * byte sequences and decoded together via TextDecoder so multi-byte UTF-8
 * characters (smart quotes, em-dashes, etc.) are correctly reconstructed.
 */
function decodeQP(src) {
  // Step 1: join soft-wrapped lines (trailing = before \n or \r\n)
  const joined = src.replace(/=\r?\n/g, "");

  // Step 2: walk the string, collecting raw bytes for =XX runs,
  // then flushing them through TextDecoder before any literal text.
  let result = "";
  let i = 0;
  const bytes = [];

  const flushBytes = () => {
    if (bytes.length === 0) return;
    const arr = new Uint8Array(bytes);
    result += new TextDecoder("utf-8", { fatal: false }).decode(arr);
    bytes.length = 0;
  };

  while (i < joined.length) {
    if (joined[i] === "=" && i + 2 < joined.length &&
        /[0-9A-Fa-f]{2}/.test(joined.slice(i + 1, i + 3))) {
      bytes.push(parseInt(joined.slice(i + 1, i + 3), 16));
      i += 3;
    } else {
      flushBytes();
      result += joined[i];
      i++;
    }
  }
  flushBytes();
  return result;
}

// ── HTTP Helper ───────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(data === null ? "" : JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
      "access-control-allow-headers": "Content-Type",
    },
  });
}
