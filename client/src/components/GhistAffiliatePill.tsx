import React, { useState, useEffect } from 'react';

interface AdVariation {
  hook: string;
  cta: string;
  url: string;
  category: 'privacy' | 'travel' | 'home';
}

const AD_INVENTORY: Record<'privacy' | 'travel' | 'home', AdVariation[]> = {
  privacy: [
    { hook: "Your email is temporary. Keep logins safe.", cta: "See 2FA security keys", url: "https://amzn.to/4qNlaT4", category: "privacy" },
    { hook: "Every signup shares more than you think.", cta: "Shop privacy gear", url: "https://amzn.to/4qNlaT4", category: "privacy" },
    { hook: "Stop giving strangers your identity.", cta: "Explore privacy tools", url: "https://amzn.to/4qNlaT4", category: "privacy" },
    { hook: "Reduce tracking. Block scams.", cta: "Shop privacy essentials", url: "https://amzn.to/4qNlaT4", category: "privacy" }
  ],
  travel: [
    { hook: "Public Wi-Fi is never truly private.", cta: "View travel routers", url: "https://amzn.to/4xAEwO0", category: "travel" },
    { hook: "Public charging carries hidden risks.", cta: "Shop USB data blockers", url: "https://amzn.to/4xAEwO0", category: "travel" },
    { hook: "That hotel Wi-Fi is not private.", cta: "See travel security gear", url: "https://amzn.to/4xAEwO0", category: "travel" },
    { hook: "Airports are crowded. So are threats.", cta: "Browse travel picks", url: "https://amzn.to/4xAEwO0", category: "travel" }
  ],
  home: [
    { hook: "Stop paying monthly cloud storage fees.", cta: "Explore local NAS storage", url: "https://a.co/d/033jIyUo", category: "home" },
    { hook: "One weak device can expose your network.", cta: "Secure your home", url: "https://a.co/d/033jIyUo", category: "home" },
    { hook: "Take control of backups and privacy.", cta: "Shop private storage", url: "https://a.co/d/033jIyUo", category: "home" },
    { hook: "Your smart home shouldn't be an open door.", cta: "Lock it down", url: "https://a.co/d/033jIyUo", category: "home" }
  ]
};

export const GhistAffiliatePill: React.FC = () => {
  const [ad, setAd] = useState<AdVariation | null>(null);

  useEffect(() => {
    // 50% Privacy, 35% Travel, 15% Home
    const rand = Math.random() * 100;
    let category: 'privacy' | 'travel' | 'home' = 'privacy';

    if (rand < 50) {
      category = 'privacy';
    } else if (rand < 85) {
      category = 'travel';
    } else {
      category = 'home';
    }

    const items = AD_INVENTORY[category];
    const selected = items[Math.floor(Math.random() * items.length)];
    setAd(selected);
  }, []);

  if (!ad) return null;

  return (
    <div className="w-full max-w-xl mx-auto my-3 px-2">
      <a
        href={ad.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group flex flex-row items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-150"
      >
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="shrink-0 text-sm">💙</span>
          <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-normal truncate">
            {ad.hook}
          </span>
        </div>
        <span className="shrink-0 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5 whitespace-nowrap">
          <span>{ad.cta}</span>
          <span className="text-[11px] opacity-70">↗</span>
        </span>
      </a>
    </div>
  );
};
