/**
 * stats.ts — cumulative lifetime activity counters + hourly-cached top country.
 */

// ── Cumulative counters (lifetime totals, reset on redeploy) ───────────────
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

export function incrementInboxes(): void { inboxesCreated++; }
export function incrementEmailsReceived(count = 1): void { emailsReceived += count; }
export function incrementMessagesDeleted(count = 1): void { messagesDeleted += count; }

export function recordArrivalTime(seconds: number): void {
  const α = 0.2;
  arrivalTimeSec = arrivalTimeSec === 0
    ? seconds
    : Math.round(α * seconds + (1 - α) * arrivalTimeSec);
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
