import React, { useState, useEffect } from 'react';
import { Heart, ArrowRight } from 'lucide-react';

interface AdVariation {
  hook: string;
  cta: string;
  url: string;
  category: 'privacy' | 'travel' | 'home' | 'desk';
}

const AD_INVENTORY: Record<'privacy' | 'travel' | 'home' | 'desk', AdVariation[]> = {
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
  ],
  desk: [
    { hook: "Tired of a Messy Desk?", cta: "Clean Up Your Workspace", url: "https://www.amazon.com/shop/sobasogo/list/1OKLXOBB52CCI?ref_=aip_sf_list_spv_ons_mixed_d", category: "desk" },
    { hook: "Minimalist WFH Desk", cta: "Shop our curated Setup", url: "https://www.amazon.com/shop/sobasogo/list/1OKLXOBB52CCI?ref_=aip_sf_list_spv_ons_mixed_d", category: "desk" },
    { hook: "Home Office Checklist", cta: "Shop Every Essential", url: "https://www.amazon.com/shop/sobasogo/list/1OKLXOBB52CCI?ref_=aip_sf_list_spv_ons_mixed_d", category: "desk" },
    { hook: "Desk Setup Stuck in 2020?", cta: "Upgrade From $20", url: "https://www.amazon.com/shop/sobasogo/list/1OKLXOBB52CCI?ref_=aip_sf_list_spv_ons_mixed_d", category: "desk" },
    { hook: "Cables Everywhere?", cta: "Hide Them for Under $25", url: "https://www.amazon.com/shop/sobasogo/list/1OKLXOBB52CCI?ref_=aip_sf_list_spv_ons_mixed_d", category: "desk" }
  ]
};

export const GhistAffiliatePill: React.FC = () => {
  const [ad, setAd] = useState<AdVariation | null>(null);

  useEffect(() => {
    // 40% Privacy, 25% Desk, 20% Travel, 15% Home
    const rand = Math.random() * 100;
    let category: 'privacy' | 'travel' | 'home' | 'desk' = 'privacy';

    if (rand < 40) {
      category = 'privacy';
    } else if (rand < 65) {
      category = 'desk';
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
    <div className="w-full my-3">
      <a
        href={ad.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group flex flex-col sm:flex-row sm:justify-center items-center w-full gap-x-2 gap-y-1.5 px-5 py-3.5 sm:py-3 rounded-2xl bg-card border border-card-border hover:border-primary/40 transition-all duration-150 text-center"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Heart className="w-4 h-4 shrink-0 text-primary fill-primary animate-heartbeat" aria-hidden="true" />
          <span className="text-sm text-foreground/90 font-bold">
            {ad.hook}
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-sm font-bold text-primary group-hover:underline">
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{ad.cta}</span>
        </span>
      </a>
    </div>
  );
};
