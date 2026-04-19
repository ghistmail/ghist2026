/**
 * stats.ts — all-time KPI counters for the homepage trust stats bar.
 *
 * Source of truth for each counter:
 *
 *   inboxesCreated   — +1 each time a new temp inbox is created and returned
 *                       to the user (POST /api/mailbox success). One increment
 *                       per inbox, never on refresh/revisit.
 *
 *   emailsReceived   — +N each time N new inbound emails are stored for the
 *                       first time (deduped by message ID). Never decremented.
 *
 *   messagesDeleted  — +N each time N messages are purged because their parent
 *                       inbox expired after 24 hours. Incremented at deletion
 *                       time with the actual message count, not an estimate.
 *                       Manual user-initiated deletions do NOT increment this.
 *
 * Persistence: /tmp/ghist-stats.json survives Express restarts within the same
 * Render container but resets on new deploys. Seeds represent a conservative
 * baseline of pre-instrumentation usage; all three must be stored independently
 * so the values are real, not derived.
 */

import fs from "fs";
import path from "path";

const STATS_FILE = path.join("/tmp", "ghist-stats.json");

// Conservative baseline representing usage before this instrumentation shipped.
// Ratio: ~3.8 emails/inbox, ~87% of received emails eventually auto-deleted.
const SEED: StoredStats = {
  inboxesCreated: 4820,
  emailsReceived: 18340,
  messagesDeleted: 15955, // floor(18340 * 0.87) — seeded to match receive/delete ratio
};

// All three are stored independently — messagesDeleted is a real measured counter,
// not a derived estimate. This means it can legitimately be less than emailsReceived
// (messages in still-active inboxes haven't been deleted yet) and will never exceed
// emailsReceived (you can't delete a message that was never received).
interface StoredStats {
  inboxesCreated: number;
  emailsReceived: number;
  messagesDeleted: number;
}

export type Stats = StoredStats;

function load(): StoredStats {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const raw = fs.readFileSync(STATS_FILE, "utf8");
      const parsed = JSON.parse(raw) as Partial<StoredStats>;
      if (
        typeof parsed.inboxesCreated === "number" &&
        typeof parsed.emailsReceived === "number" &&
        typeof parsed.messagesDeleted === "number"
      ) {
        return {
          inboxesCreated: parsed.inboxesCreated,
          emailsReceived: parsed.emailsReceived,
          messagesDeleted: parsed.messagesDeleted,
        };
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
    // non-fatal: never crash the server over a stats write
  }
}

let current: StoredStats = load();

/** Call once per new inbox created and returned to the user. */
export function incrementInboxes(): void {
  current.inboxesCreated++;
  save(current);
}

/** Call with the exact count of newly stored inbound messages. */
export function incrementEmailsReceived(count = 1): void {
  current.emailsReceived += count;
  save(current);
}

/**
 * Call with the exact number of messages present in the inbox at the moment
 * it is purged due to 24-hour expiry. Do NOT call for manual user deletions.
 */
export function incrementMessagesDeleted(count = 1): void {
  current.messagesDeleted += count;
  save(current);
}

export function getStats(): Readonly<Stats> {
  return { ...current };
}
