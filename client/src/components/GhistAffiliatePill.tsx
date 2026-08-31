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
    <div className="w-full max-w-2xl mx-auto my-3 px-2">
      <a
        href={ad.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group flex flex-col sm:inline-flex sm:flex-row sm:items-center sm:flex-wrap w-full sm:w-auto gap-x-2 gap-y-1 px-5 py-3 rounded-2xl sm:rounded-full bg-card border border-card-border hover:border-primary/40 transition-all duration-150"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-sm">💙</span>
          <span className="text-sm text-foreground/90 font-normal">
            {ad.hook}
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-primary group-hover:underline pl-7 sm:pl-0">
          <span aria-hidden="true">→</span>
          <span>{ad.cta}</span>
        </span>
      </a>
    </div>
  );
};
