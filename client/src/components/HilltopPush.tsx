import { useEffect, useRef } from "react";

/**
 * HilltopAds in-page push (zone #7291997).
 * Loads once for the whole session. The network's own script controls
 * the notification's on-screen position/timing — nothing to place in our DOM.
 * Mounted in App.tsx so it never sits inside the inbox/email-address tree
 * and can't intercept clicks on Copy / Refresh / message rows.
 */
export function HilltopPush() {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;
    injected.current = true;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = `(function(ptnj){
var d = document,
    s = d.createElement('script'),
    l = d.scripts[d.scripts.length - 1];
s.settings = ptnj || {};
s.src = "//relieved-understanding.com/b.XOVksBd/G/lH0hYRWfcx/TesmB9TuhZaUUldk/PrTecQy_OmTVEA5eOFT/cdtJNMzTIZ5yM/jEAawkMKQS";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})`;
    document.body.appendChild(script);
  }, []);

  return null;
}
