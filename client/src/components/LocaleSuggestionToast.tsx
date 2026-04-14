/**
 * LocaleSuggestionToast
 *
 * Priority order:
 *   1. localStorage "ghist_locale_pref" — user has already chosen, never prompt again
 *   2. Browser Accept-Language (injected server-side as window.__GHIST_BROWSER_LOCALE__)
 *   3. IP-geo locale (injected server-side as window.__GHIST_LOCALE__)
 *
 * If browser locale ≠ IP locale AND no saved preference, show a non-blocking toast
 * offering to switch. Saving "dismiss" also stores to localStorage so it never re-fires.
 */
import { useEffect, useState } from "react";

declare global {
  interface Window {
    __GHIST_LOCALE__: string;
    __GHIST_BROWSER_LOCALE__: string;
  }
}

const LS_KEY = "ghist_locale_pref";

const LOCALE_NAMES: Record<string, string> = {
  en: "English", zh: "中文", hi: "हिन्दी", es: "Español", ar: "العربية",
  fr: "Français", bn: "বাংলা", pt: "Português", ru: "Русский", ur: "اردو",
  id: "Bahasa Indonesia", de: "Deutsch", ja: "日本語", vi: "Tiếng Việt",
  te: "తెలుగు", mr: "मराठी", tr: "Türkçe", ta: "தமிழ்", fa: "فارسی", ko: "한국어",
};

export function LocaleSuggestionToast() {
  const [show, setShow] = useState(false);
  const [browserLocale, setBrowserLocale] = useState("");
  const [geoLocale, setGeoLocale] = useState("");

  useEffect(() => {
    // Already saved a preference — never prompt
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return;

    const geo = window.__GHIST_LOCALE__ ?? "";
    const browser = window.__GHIST_BROWSER_LOCALE__ ?? "";

    // No mismatch or no browser signal
    if (!browser || !geo || browser === geo) return;

    setBrowserLocale(browser);
    setGeoLocale(geo);
    setShow(true);
  }, []);

  const handleSwitch = () => {
    localStorage.setItem(LS_KEY, browserLocale);
    setShow(false);
    // Navigate to browser-locale version of current path (no hard redirect)
    const path = window.location.pathname;
    // Strip existing locale prefix if present, then prepend browser locale
    const stripped = path.replace(/^\/(en|zh|hi|es|ar|fr|bn|pt|ru|ur|id|de|ja|vi|te|mr|tr|ta|fa|ko)(\/|$)/, "/");
    window.location.href = `/${browserLocale}${stripped === "/" ? "" : stripped}`;
  };

  const handleDismiss = () => {
    localStorage.setItem(LS_KEY, geoLocale);
    setShow(false);
  };

  if (!show) return null;

  const langName = LOCALE_NAMES[browserLocale] ?? browserLocale.toUpperCase();

  return (
    <div
      role="alertdialog"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        maxWidth: "360px",
        width: "calc(100% - 32px)",
        background: "var(--popover)",
        color: "var(--popover-foreground)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "14px 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        fontSize: "13px",
        lineHeight: "1.5",
      }}
    >
      <span>
        Your browser is set to <strong>{langName}</strong>. Switch to the {langName} version of Ghist?
      </span>
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button
          onClick={handleDismiss}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--muted-foreground)",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Stay here
        </button>
        <button
          onClick={handleSwitch}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "none",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          Switch to {langName}
        </button>
      </div>
    </div>
  );
}
