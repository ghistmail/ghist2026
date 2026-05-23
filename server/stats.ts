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
  const topCode = sorted[0][0];
  return COUNTRY_NAMES[topCode] ?? topCode;
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
