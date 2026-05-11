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
  inboxesCreated: 0,
  emailsReceived: 0,
  messagesDeleted: 0,
  arrivalTimeSec: 0,
};

// All three counters are real measured values.
// arrivalTimeSec is an exponential moving average of seconds from mailbox creation
// to first message received — α=0.2 so recent data has more weight.
interface StoredStats {
  inboxesCreated: number;
  emailsReceived: number;
  messagesDeleted: number;
  arrivalTimeSec: number; // EMA of seconds-to-first-message; 0 means no data yet
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
          arrivalTimeSec: typeof parsed.arrivalTimeSec === "number" ? parsed.arrivalTimeSec : 0,
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

/**
 * Update the arrival time EMA when a first message arrives in an inbox.
 * Pass the seconds elapsed between mailbox creation and first message receipt.
 * α = 0.2: recent samples weighted more, old data fades smoothly.
 */
export function recordArrivalTime(seconds: number): void {
  const α = 0.2;
  if (current.arrivalTimeSec === 0) {
    current.arrivalTimeSec = seconds; // bootstrap with first sample
  } else {
    current.arrivalTimeSec = Math.round(α * seconds + (1 - α) * current.arrivalTimeSec);
  }
  save(current);
}

export function getStats(): Readonly<Stats> {
  return { ...current };
}

// ── Country tracking (rolling 24-hour window) ─────────────────────────────
// Entries stored in memory only — no persistence needed (resets on deploy,
// but Cloudflare delivers CF-IPCountry on every request so it repopulates fast).

interface CountryHit {
  country: string; // 2-letter ISO code from Cloudflare
  ts: number;      // Date.now() at time of hit
}

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const countryHits: CountryHit[] = [];

/** Record a visitor country hit (call once per significant request). */
export function recordCountryHit(code: string): void {
  if (!code || code === "XX" || code === "T1") return; // unknown / Tor
  countryHits.push({ country: code.toUpperCase(), ts: Date.now() });
  // Prune old entries to keep memory bounded
  const cutoff = Date.now() - WINDOW_MS;
  while (countryHits.length > 0 && countryHits[0].ts < cutoff) {
    countryHits.shift();
  }
}

/** Return the country name with the most hits in the last 24 hours. */
export function getTopCountry(): string {
  const cutoff = Date.now() - WINDOW_MS;
  const recent = countryHits.filter(h => h.ts >= cutoff);
  if (recent.length === 0) return "";

  // Group by country, track count and most-recent timestamp
  const map = new Map<string, { count: number; lastSeen: number }>();
  for (const h of recent) {
    const entry = map.get(h.country);
    if (!entry) {
      map.set(h.country, { count: 1, lastSeen: h.ts });
    } else {
      entry.count++;
      if (h.ts > entry.lastSeen) entry.lastSeen = h.ts;
    }
  }

  // Sort by count desc, then by most-recent on tie
  const sorted = [...map.entries()].sort((a, b) => {
    if (b[1].count !== a[1].count) return b[1].count - a[1].count;
    return b[1].lastSeen - a[1].lastSeen;
  });

  const topCode = sorted[0][0];
  return COUNTRY_NAMES[topCode] ?? topCode; // fallback to 2-letter code
}

// ISO 3166-1 alpha-2 → common name (covers majority of web traffic)
const COUNTRY_NAMES: Record<string, string> = {
  AD: "Andorra", AE: "United Arab Emirates", AF: "Afghanistan", AG: "Antigua & Barbuda",
  AL: "Albania", AM: "Armenia", AO: "Angola", AR: "Argentina", AT: "Austria",
  AU: "Australia", AZ: "Azerbaijan", BA: "Bosnia & Herzegovina", BB: "Barbados",
  BD: "Bangladesh", BE: "Belgium", BF: "Burkina Faso", BG: "Bulgaria", BH: "Bahrain",
  BI: "Burundi", BJ: "Benin", BN: "Brunei", BO: "Bolivia", BR: "Brazil",
  BS: "Bahamas", BT: "Bhutan", BW: "Botswana", BY: "Belarus", BZ: "Belize",
  CA: "Canada", CD: "DR Congo", CF: "Central African Republic", CG: "Congo",
  CH: "Switzerland", CI: "Côte d'Ivoire", CL: "Chile", CM: "Cameroon",
  CN: "China", CO: "Colombia", CR: "Costa Rica", CU: "Cuba", CV: "Cape Verde",
  CY: "Cyprus", CZ: "Czech Republic", DE: "Germany", DJ: "Djibouti",
  DK: "Denmark", DM: "Dominica", DO: "Dominican Republic", DZ: "Algeria",
  EC: "Ecuador", EE: "Estonia", EG: "Egypt", ER: "Eritrea", ES: "Spain",
  ET: "Ethiopia", FI: "Finland", FJ: "Fiji", FR: "France", GA: "Gabon",
  GB: "United Kingdom", GD: "Grenada", GE: "Georgia", GH: "Ghana",
  GM: "Gambia", GN: "Guinea", GQ: "Equatorial Guinea", GR: "Greece",
  GT: "Guatemala", GW: "Guinea-Bissau", GY: "Guyana", HN: "Honduras",
  HR: "Croatia", HT: "Haiti", HU: "Hungary", ID: "Indonesia", IE: "Ireland",
  IL: "Israel", IN: "India", IQ: "Iraq", IR: "Iran", IS: "Iceland",
  IT: "Italy", JM: "Jamaica", JO: "Jordan", JP: "Japan", KE: "Kenya",
  KG: "Kyrgyzstan", KH: "Cambodia", KI: "Kiribati", KM: "Comoros",
  KN: "Saint Kitts & Nevis", KP: "North Korea", KR: "South Korea",
  KW: "Kuwait", KZ: "Kazakhstan", LA: "Laos", LB: "Lebanon", LC: "Saint Lucia",
  LI: "Liechtenstein", LK: "Sri Lanka", LR: "Liberia", LS: "Lesotho",
  LT: "Lithuania", LU: "Luxembourg", LV: "Latvia", LY: "Libya",
  MA: "Morocco", MC: "Monaco", MD: "Moldova", ME: "Montenegro", MG: "Madagascar",
  MH: "Marshall Islands", MK: "North Macedonia", ML: "Mali", MM: "Myanmar",
  MN: "Mongolia", MR: "Mauritania", MT: "Malta", MU: "Mauritius",
  MV: "Maldives", MW: "Malawi", MX: "Mexico", MY: "Malaysia", MZ: "Mozambique",
  NA: "Namibia", NE: "Niger", NG: "Nigeria", NI: "Nicaragua", NL: "Netherlands",
  NO: "Norway", NP: "Nepal", NR: "Nauru", NZ: "New Zealand", OM: "Oman",
  PA: "Panama", PE: "Peru", PG: "Papua New Guinea", PH: "Philippines",
  PK: "Pakistan", PL: "Poland", PT: "Portugal", PW: "Palau", PY: "Paraguay",
  QA: "Qatar", RO: "Romania", RS: "Serbia", RU: "Russia", RW: "Rwanda",
  SA: "Saudi Arabia", SB: "Solomon Islands", SC: "Seychelles", SD: "Sudan",
  SE: "Sweden", SG: "Singapore", SI: "Slovenia", SK: "Slovakia",
  SL: "Sierra Leone", SM: "San Marino", SN: "Senegal", SO: "Somalia",
  SR: "Suriname", SS: "South Sudan", ST: "São Tomé & Príncipe",
  SV: "El Salvador", SY: "Syria", SZ: "Eswatini", TD: "Chad",
  TG: "Togo", TH: "Thailand", TJ: "Tajikistan", TL: "Timor-Leste",
  TM: "Turkmenistan", TN: "Tunisia", TO: "Tonga", TR: "Turkey",
  TT: "Trinidad & Tobago", TV: "Tuvalu", TZ: "Tanzania", UA: "Ukraine",
  UG: "Uganda", US: "United States", UY: "Uruguay", UZ: "Uzbekistan",
  VA: "Vatican City", VC: "Saint Vincent & the Grenadines", VE: "Venezuela",
  VN: "Vietnam", VU: "Vanuatu", WS: "Samoa", YE: "Yemen",
  ZA: "South Africa", ZM: "Zambia", ZW: "Zimbabwe",
  HK: "Hong Kong", MO: "Macau", TW: "Taiwan", PS: "Palestine",
  XK: "Kosovo", EU: "Europe",
};
