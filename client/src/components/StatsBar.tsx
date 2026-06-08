/**
 * StatsBar — "24-Hour Activity" widget.
 * Matches the reference design: white card, 3-col grid, icon+label row, large number.
 */

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MailPlus, Mail, Globe, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Stats {
  inboxesCreated: number;
  emailsReceived: number;
  emailsPerInbox: number;
  arrivalTimeSec: number;
  topCountry: string | null;
}

function fmtNum(n: number): string {
  return n.toLocaleString("en-AU");
}

function fmtEmailsPerInbox(value: number, inboxesCreated: number): string {
  if (inboxesCreated === 0 || value === 0) return "–";
  if (value < 10) return value.toFixed(1);
  return String(Math.round(value));
}

// Count-up on first reveal — emails received only
function useCountUp(target: number, enabled: boolean, duration = 1200): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || target === 0) { setValue(target); return; }
    startRef.current = null;
    const step = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const t = Math.min((now - startRef.current) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, enabled, duration]);

  return value;
}

interface StatColProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  loading: boolean;
  animate?: boolean;
  animateTarget?: number;
  subtext?: string;
}

function StatCol({ icon, label, value, loading, animate, animateTarget = 0, subtext }: StatColProps) {
  const counted = useCountUp(animateTarget, !!animate);
  const display = animate ? fmtNum(counted) : value;

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Icon + label row */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      {/* Number */}
      <div className="pl-1">
        {loading
          ? <div className="w-12 h-10 rounded-md bg-muted animate-pulse" aria-hidden="true" />
          : <>
              <span
                className={`font-bold text-foreground ${
                  typeof value === "string" && value.length > 12
                    ? "text-xl sm:text-2xl"
                    : "text-4xl tabular-nums"
                }`}
                aria-live="polite"
                data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {display}
              </span>
              {subtext && <p className="mt-1 text-[11px] text-muted-foreground">{subtext}</p>}
            </>
        }
      </div>
    </div>
  );
}

export function StatsBar() {
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const { data, isLoading, isError } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 45_000,
    staleTime: 30_000,
  });

  // Trigger count-up once when section scrolls into view
  useEffect(() => {
    if (!sectionRef.current || revealed) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [revealed]);

  if (isError) return null;

  const stats = data ?? { inboxesCreated: 0, emailsReceived: 0, emailsPerInbox: 0, arrivalTimeSec: 0, topCountry: null };
  const canAnimate = revealed && !isLoading;

  return (
    <section
      ref={sectionRef}
      aria-label="24-hour activity statistics"
      data-testid="activity-24h-section"
      className="w-full bg-card rounded-2xl border border-border/60 shadow-sm dark:shadow-none overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/60">
        <h2 className="text-lg font-semibold text-foreground">
          Global Activity
        </h2>
      </div>

      {/* 4-col grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x md:divide-x divide-border/60">
        <StatCol
          icon={<MailPlus className="w-5 h-5" strokeWidth={1.6} />}
          label="Inboxes Created"
          value={fmtNum(stats.inboxesCreated)}
          loading={isLoading}
          animate={canAnimate}
          animateTarget={stats.inboxesCreated}
        />
        <StatCol
          icon={<Mail className="w-5 h-5" strokeWidth={1.6} />}
          label="Emails Received"
          value={fmtNum(stats.emailsReceived)}
          loading={isLoading}
          animate={canAnimate}
          animateTarget={stats.emailsReceived}
        />
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCol
                  icon={<TrendingUp className="w-5 h-5" strokeWidth={1.6} />}
                  label="Emails per Inbox"
                  value={
                    isLoading
                      ? "–"
                      : fmtEmailsPerInbox(stats.emailsPerInbox, stats.inboxesCreated)
                  }
                  loading={isLoading}
                  subtext={stats.inboxesCreated === 0 && !isLoading ? "No inboxes created yet" : undefined}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-center text-xs">
              Average emails received per inbox (total emails ÷ total inboxes).
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <StatCol
          icon={<Globe className="w-5 h-5" strokeWidth={1.6} />}
          label="Top Country"
          value={stats.topCountry ?? "No data"}
          loading={isLoading}
        />
      </div>
      <p className="px-6 pb-4 text-[11px] text-muted-foreground">
        Updated hourly
      </p>
    </section>
  );
}
