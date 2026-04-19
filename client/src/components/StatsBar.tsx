import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MailPlus, Mail, Trash2 } from "lucide-react";

interface Stats {
  inboxesCreated: number;
  emailsReceived: number;
  messagesDeleted: number;
}

// Format numbers with locale commas: 18340 → "18,340"
function fmt(n: number): string {
  return n.toLocaleString("en-AU");
}

// Lightweight count-up hook — runs once on first mount, ~600 ms
function useCountUp(target: number, enabled: boolean): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 600; // ms

  useEffect(() => {
    if (!enabled || target === 0) return;
    startRef.current = null;

    const step = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, enabled]);

  return enabled ? value : target;
}

interface StatItemProps {
  label: string;
  value: number;
  animate: boolean;
  loading: boolean;
  icon: React.ReactNode;
}

function StatItem({ label, value, animate, loading, icon }: StatItemProps) {
  const displayed = useCountUp(value, animate);

  return (
    <div className="flex flex-col items-center gap-2 py-5 px-4 flex-1 min-w-[120px]">
      <div className="text-muted-foreground/60" aria-hidden="true">{icon}</div>
      <span
        className="text-2xl sm:text-3xl font-bold tabular-nums text-foreground"
        aria-live="polite"
        data-testid={`stat-value-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {loading ? (
          <span className="inline-block w-20 h-7 rounded bg-muted animate-pulse" aria-hidden="true" />
        ) : (
          fmt(displayed)
        )}
      </span>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

export function StatsBar() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Use default queryFn (getQueryFn) which auto-parses JSON via the query key
  const { data, isLoading, isError } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 45_000, // near-real-time: poll every 45 s
    staleTime: 30_000,
  });

  // Trigger count-up animation only once when section enters the viewport
  useEffect(() => {
    if (!sectionRef.current || hasAnimated) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [hasAnimated]);

  if (isError) return null; // fail silently — don't break the page

  const stats = data ?? { inboxesCreated: 0, emailsReceived: 0, messagesDeleted: 0 };

  return (
    <section
      ref={sectionRef}
      aria-label="Usage statistics"
      data-testid="stats-bar"
      className="w-full border border-border/40 rounded-2xl bg-muted/20 overflow-hidden"
    >
      <div className="px-5 pt-5 pb-2 border-b border-border/40">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Worldwide Activity
        </h2>
      </div>
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border/40">
        <StatItem
          label="Inboxes Created"
          value={stats.inboxesCreated}
          animate={hasAnimated && !isLoading}
          loading={isLoading}
          icon={<MailPlus className="w-4 h-4" />}
        />
        <StatItem
          label="Emails Received"
          value={stats.emailsReceived}
          animate={hasAnimated && !isLoading}
          loading={isLoading}
          icon={<Mail className="w-4 h-4" />}
        />
        <StatItem
          label="Inboxes Deleted"
          value={stats.messagesDeleted}
          animate={hasAnimated && !isLoading}
          loading={isLoading}
          icon={<Trash2 className="w-4 h-4" />}
        />
      </div>
    </section>
  );
}
