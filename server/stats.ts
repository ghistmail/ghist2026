/**
 * stats.ts — cumulative lifetime activity counters + hourly-cached top country.
 *
 * Counters live in memory for fast reads, but are write-through persisted to
 * Upstash Redis (REST API, no driver needed) so they survive redeploys —
 * without Redis configured they silently fall back to in-memory-only
 * behavior (same as before) rather than crashing the server.
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const DURABLE = Boolean(UPSTASH_URL && UPSTASH_TOKEN);
const STATS_KEY = "ghist:global-stats";

// ── Cumulative counters (lifetime totals) ───────────────────────────────────
let inboxesCreated = 0;
let emailsReceived = 0;
let messagesDeleted = 0;
let arrivalTimeSec = 0;

export interface Stats {
  inboxesCreated: number;
  emailsReceived: number;
  messagesDeleted: number;
  arrivalTimeSec: number;
}

// Debounce writes: bursts of increments within the same tick/second collapse
// into a single Redis SET instead of one round-trip per increment.
let persistTimer: NodeJS.Timeout | null = null;

function schedulePersist(): void {
  if (!DURABLE || persistTimer) return;
  persistTimer = setTimeout(async () => {
    persistTimer = null;
    try {
      const payload = JSON.stringify({ inboxesCreated, emailsReceived, messagesDeleted, arrivalTimeSec });
      const res = await fetch(`${UPSTASH_URL}/set/${STATS_KEY}/${encodeURIComponent(payload)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      });
      if (!res.ok) console.error("Upstash stats persist failed:", res.status, await res.text());
    } catch (err) {
      console.error("Upstash stats persist error:", err);
    }
  }, 2000);
}

/** Call once at server boot, before listen(), to restore counters from Redis. */
export async function loadDurableStats(): Promise<void> {
  if (!DURABLE) {
    console.warn("UPSTASH_REDIS_REST_URL/TOKEN not set — Global Activity stats will reset on every redeploy.");
    return;
  }
  try {
    const res = await fetch(`${UPSTASH_URL}/get/${STATS_KEY}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    const json = await res.json();
    if (json?.result) {
      const saved = JSON.parse(json.result) as Partial<Stats>;
      inboxesCreated = saved.inboxesCreated ?? 0;
      emailsReceived = saved.emailsReceived ?? 0;
      messagesDeleted = saved.messagesDeleted ?? 0;
      arrivalTimeSec = saved.arrivalTimeSec ?? 0;
      console.log(`Restored durable stats: ${inboxesCreated} inboxes, ${emailsReceived} emails, ${messagesDeleted} deleted.`);
    }
  } catch (err) {
    console.error("Failed to load durable stats from Upstash — starting from zero:", err);
  }
}

export function incrementInboxes(): void { inboxesCreated++; schedulePersist(); }
export function incrementEmailsReceived(count = 1): void { emailsReceived += count; schedulePersist(); }
export function incrementMessagesDeleted(count = 1): void { messagesDeleted += count; schedulePersist(); }

export function recordArrivalTime(seconds: number): void {
  const α = 0.2;
  arrivalTimeSec = arrivalTimeSec === 0
    ? seconds
    : Math.round(α * seconds + (1 - α) * arrivalTimeSec);
  schedulePersist();
}

export function getStats(): Readonly<Stats> {
  return { inboxesCreated, emailsReceived, messagesDeleted, arrivalTimeSec };
}

// ── Top country — rolling 24h window, cached and refreshed once per hour ──
const COUNTRY_WINDOW_MS = 24 * 60 * 60 * 1000;
const CACHE_TTL_MS      =       60 * 60 * 1000; // 1 hour

interface CountryHit { country: string; ts: number; }
const countryHits: CountryHit[] = [];

// Hourly cache
let cachedTopCountry: string = "";
let cacheComputedAt  = 0;

export function recordCountryHit(code: string): void {
  if (!code || code === "XX" || code === "T1") return;
  countryHits.push({ country: code.toUpperCase(), ts: Date.now() });
  const cutoff = Date.now() - COUNTRY_WINDOW_MS;
  while (countryHits.length > 0 && countryHits[0].ts < cutoff) countryHits.shift();
}

function computeTopCountry(): string {
  const cutoff = Date.now() - COUNTRY_WINDOW_MS;
  const recent = countryHits.filter(h => h.ts >= cutoff);
  if (recent.length === 0) return "";
  const map = new Map<string, { count: number; lastSeen: number }>();
  for (const h of recent) {
    const e = map.get(h.country);
    if (!e) map.set(h.country, { count: 1, lastSeen: h.ts });
    else { e.count++; if (h.ts > e.lastSeen) e.lastSeen = h.ts; }
  }
  const sorted = [...map.entries()].sort((a, b) =>
    b[1].count !== a[1].count ? b[1].count - a[1].count : b[1].lastSeen - a[1].lastSeen
  );
  return sorted[0][0];
}

/** Returns cached top country; recomputes at most once per hour. */
export function getTopCountry(): string {
  if (Date.now() - cacheComputedAt >= CACHE_TTL_MS) {
    const result = computeTopCountry();
    if (result) { cachedTopCountry = result; } // keep last good value on empty
    cacheComputedAt = Date.now();
  }
  return cachedTopCountry;
}
