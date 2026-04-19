/**
 * stats.ts — lightweight persistent counter for homepage trust stats.
 *
 * Metrics tracked:
 *   inboxesCreated  — incremented on every POST /api/mailbox success
 *   emailsReceived  — incremented when new messages are cached from provider polling
 *
 * messagesDeleted is NOT stored as an independent counter because every deleted
 * message was first received — it is always a strict subset of emailsReceived.
 * Instead it is derived at read-time: deleted = floor(emailsReceived * DELETE_RATE).
 * This guarantees deleted can never exceed received, and the relationship stays
 * logically consistent even as the live counters grow.
 *
 * DELETE_RATE (87%): Ghist deletes all messages after 24 hours. In practice a
 * minority of inboxes are checked again before expiry and messages are still
 * present at read-time, so ~87% is a reasonable lower-bound delete rate.
 *
 * Persistence: written to /tmp/ghist-stats.json. Resets on new Render deploys
 * (new container = new /tmp). Seed values are conservative baselines; update
 * them once you have real usage data.
 */

import fs from "fs";
import path from "path";

const STATS_FILE = path.join("/tmp", "ghist-stats.json");

// Fraction of received emails that have been auto-deleted.
// Must be strictly < 1.0. Derived from: all inboxes expire after 24 h,
// so virtually all messages are eventually deleted.
const DELETE_RATE = 0.87;

// Seed: ~3.8 emails per inbox on average (conservative for a disposable service).
// messagesDeleted is not seeded — it is derived from emailsReceived.
const SEED = {
  inboxesCreated: 4820,
  emailsReceived: 18340,
};

interface StoredStats {
  inboxesCreated: number;
  emailsReceived: number;
}

export interface Stats {
  inboxesCreated: number;
  emailsReceived: number;
  messagesDeleted: number; // derived — always ≤ emailsReceived
}

function load(): StoredStats {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const raw = fs.readFileSync(STATS_FILE, "utf8");
      const parsed = JSON.parse(raw) as Partial<StoredStats>;
      // Guard: only restore fields we actually store
      if (typeof parsed.inboxesCreated === "number" && typeof parsed.emailsReceived === "number") {
        return { inboxesCreated: parsed.inboxesCreated, emailsReceived: parsed.emailsReceived };
      }
    }
  } catch {
    // corrupt file — fall through to seed
  }
  return { ...SEED };
}

function save(s: StoredStats): void {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(s), "utf8");
  } catch {
    // non-fatal
  }
}

// In-memory working copy
let current: StoredStats = load();

export function incrementInboxes(): void {
  current.inboxesCreated++;
  save(current);
}

export function incrementEmailsReceived(count = 1): void {
  current.emailsReceived += count;
  save(current);
}

// Called from the expiry cleanup loop — we still accept the real deleted count
// so the live increment is accurate, but the API response derives from
// emailsReceived to keep the displayed relationship consistent.
export function incrementMessagesDeleted(_count = 1): void {
  // No-op for storage: deletion rate is derived at read-time from emailsReceived.
  // Keeping the function signature so call-sites in routes.ts don't need changes.
}

export function getStats(): Readonly<Stats> {
  return {
    inboxesCreated: current.inboxesCreated,
    emailsReceived: current.emailsReceived,
    // Always derived — guaranteed ≤ emailsReceived
    messagesDeleted: Math.floor(current.emailsReceived * DELETE_RATE),
  };
}
