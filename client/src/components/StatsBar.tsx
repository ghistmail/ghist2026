/**
 * Activity24h — replaces the old "Worldwide Activity" StatsBar.
 * Shows a rolling 24-hour window with three KPI cards:
 *   Emails Received  — count-up on first reveal
 *   Arrival Time     — floating icon, pulse on change
 *   Inboxes Deleted  — number-flip on change
 *
 * Exported as `StatsBar` so no import changes are needed in Home.tsx.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { MailPlus, Timer, Trash2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  emailsReceived: number;
  messagesDeleted: number;
  arrivalTimeSec: number; // EMA seconds; 0 = no data yet
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtNum(n: number): string {
  return n.toLocaleString("en-AU");
}

function fmtArrival(sec: number): string {
  if (sec <= 0) return "—";
  if (sec < 60) return `${sec}s`;
  return `${Math.round(sec / 60)}m`;
}

// Respects prefers-reduced-motion
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ─── Count-up hook (Emails Received) ─────────────────────────────────────────

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
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, enabled, duration]);

  return value;
}

// ─── Number-flip hook (Inboxes Deleted) ──────────────────────────────────────

function useNumberFlip(target: number): { displayed: number; flipping: boolean } {
  const [displayed, setDisplayed] = useState(target);
  const [flipping, setFlipping] = useState(false);
  const prev = useRef(target);

  useEffect(() => {
    if (target === prev.current) return;
    prev.current = target;
    setFlipping(true);
    const t = setTimeout(() => {
      setDisplayed(target);
      setFlipping(false);
    }, 220); // halfway through flip — swap value at apex
    return () => clearTimeout(t);
  }, [target]);

  return { displayed, flipping };
}

// ─── KPI Card components ──────────────────────────────────────────────────────

interface EmailsCardProps { value: number; animate: boolean; loading: boolean; }

function EmailsCard({ value, animate, loading }: EmailsCardProps) {
  const displayed = useCountUp(value, animate);
  return (
    <article className="kpi-card" data-testid="stat-emails-received">
      <div className="kpi-card__header">
        <div className="kpi-icon-badge">
          <MailPlus className="kpi-icon" aria-hidden="true" strokeWidth={1.6} />
        </div>
        <span className="kpi-card__title">Emails Received</span>
      </div>
      <div className="kpi-card__body">
        <span className="kpi-label">Emails Received</span>
        <span className="kpi-value" aria-live="polite">
          {loading
            ? <span className="kpi-skeleton" aria-hidden="true" />
            : fmtNum(displayed)
          }
        </span>
      </div>
    </article>
  );
}

interface ArrivalCardProps { value: number; loading: boolean; }

function ArrivalCard({ value, loading }: ArrivalCardProps) {
  const [pulse, setPulse] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    prev.current = value;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 400);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <article className="kpi-card" data-testid="stat-arrival-time">
      <div className="kpi-card__header">
        <div className={`kpi-icon-badge kpi-icon-badge--float${pulse ? " kpi-icon-badge--pulse" : ""}`}>
          <Timer className="kpi-icon" aria-hidden="true" strokeWidth={1.6} />
        </div>
        <span className="kpi-card__title">Arrival Time</span>
      </div>
      <div className="kpi-card__body">
        <span className="kpi-label">Arrival Time</span>
        <span className={`kpi-value${pulse ? " kpi-value--pulse" : ""}`} aria-live="polite">
          {loading
            ? <span className="kpi-skeleton" aria-hidden="true" />
            : fmtArrival(value)
          }
        </span>
      </div>
    </article>
  );
}

interface DeletedCardProps { value: number; loading: boolean; }

function DeletedCard({ value, loading }: DeletedCardProps) {
  const { displayed, flipping } = useNumberFlip(value);
  return (
    <article className="kpi-card" data-testid="stat-inboxes-deleted">
      <div className="kpi-card__header">
        <div className="kpi-icon-badge">
          <Trash2 className="kpi-icon" aria-hidden="true" strokeWidth={1.6} />
        </div>
        <span className="kpi-card__title">Inboxes Deleted</span>
      </div>
      <div className="kpi-card__body">
        <span className="kpi-label">Inboxes Deleted</span>
        <span className={`kpi-value kpi-value--flip${flipping ? " kpi-value--flip-active" : ""}`} aria-live="polite">
          {loading
            ? <span className="kpi-skeleton" aria-hidden="true" />
            : fmtNum(displayed)
          }
        </span>
      </div>
    </article>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function StatsBar() {
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [titlePulse, setTitlePulse] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const prevDataRef = useRef<Stats | null>(null);

  const { data, isLoading, isError } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 45_000,
    staleTime: 30_000,
  });

  // Reveal once when section enters viewport
  useEffect(() => {
    if (!sectionRef.current || revealed) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [revealed]);

  // Title pulse on any data refresh
  useEffect(() => {
    if (!data || reduced) return;
    const prev = prevDataRef.current;
    if (prev && (
      prev.emailsReceived !== data.emailsReceived ||
      prev.messagesDeleted !== data.messagesDeleted ||
      prev.arrivalTimeSec !== data.arrivalTimeSec
    )) {
      setTitlePulse(true);
      const t = setTimeout(() => setTitlePulse(false), 500);
      prevDataRef.current = data;
      return () => clearTimeout(t);
    }
    prevDataRef.current = data;
  }, [data, reduced]);

  if (isError) return null;

  const stats = data ?? { emailsReceived: 0, messagesDeleted: 0, arrivalTimeSec: 0 };
  const animateCount = revealed && !isLoading && !reduced;

  return (
    <>
      {/* Scoped styles — no new CSS files, no global pollution */}
      <style>{`
        .activity-24h {
          width: 100%;
          border-radius: 1.25rem;
          border: 1px solid hsl(var(--border) / 0.4);
          background: hsl(var(--card));
          box-shadow:
            0 1px 2px hsl(0 0% 0% / 0.04),
            0 4px 16px hsl(0 0% 0% / 0.06),
            0 0 0 1px hsl(var(--border) / 0.08);
          overflow: hidden;
        }

        .activity-24h__head {
          padding: 1.25rem 1.5rem 1rem;
          border-bottom: 1px solid hsl(var(--border) / 0.3);
        }

        .activity-24h__title {
          font-size: 1.0625rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: hsl(var(--foreground));
          line-height: 1.2;
          display: block;
          transition: opacity 0.3s ease;
        }

        .activity-24h__title--pulse {
          animation: titlePulse 0.45s ease;
        }

        .activity-24h__subtitle {
          font-size: 0.75rem;
          color: hsl(var(--muted-foreground));
          margin-top: 0.2rem;
          display: block;
        }

        .activity-24h__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }

        @media (min-width: 640px) {
          .activity-24h__grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* ── KPI card ── */
        .kpi-card {
          padding: 1.25rem 1.5rem 1.375rem;
          border-right: 1px solid hsl(var(--border) / 0.3);
          border-bottom: 1px solid hsl(var(--border) / 0.3);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .kpi-card:last-child { border-right: 0; }
          .kpi-card { border-bottom: 0; }
        }

        .kpi-card:last-child { border-bottom: 0; }

        .kpi-card__header {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .kpi-card__title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          letter-spacing: -0.005em;
        }

        /* ── Icon badge ── */
        .kpi-icon-badge {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          background: hsl(var(--primary) / 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: hsl(var(--primary));
        }

        .kpi-icon {
          width: 1.0625rem;
          height: 1.0625rem;
        }

        /* Float animation — Arrival Time only */
        @media (prefers-reduced-motion: no-preference) {
          .kpi-icon-badge--float {
            animation: iconFloat 4s ease-in-out infinite;
          }
        }

        /* ── Card body ── */
        .kpi-card__body {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .kpi-label {
          font-size: 0.6875rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: hsl(var(--muted-foreground));
        }

        .kpi-value {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          font-variant-numeric: tabular-nums;
          color: hsl(var(--foreground));
          line-height: 1.1;
          display: block;
          min-height: 2.4rem;
        }

        .kpi-skeleton {
          display: inline-block;
          width: 5rem;
          height: 1.875rem;
          border-radius: 0.375rem;
          background: hsl(var(--muted));
          animation: shimmer 1.4s ease infinite;
        }

        /* ── Arrival pulse on value ── */
        @media (prefers-reduced-motion: no-preference) {
          .kpi-value--pulse {
            animation: valuePulse 0.35s ease;
          }
          .kpi-icon-badge--pulse {
            animation: iconFloat 4s ease-in-out infinite, badgePulse 0.35s ease;
          }
        }

        /* ── Number flip (Inboxes Deleted) ── */
        @media (prefers-reduced-motion: no-preference) {
          .kpi-value--flip-active {
            animation: numFlip 0.44s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }

        /* ── Keyframes ── */
        @keyframes titlePulse {
          0%   { opacity: 1; }
          40%  { opacity: 0.55; }
          100% { opacity: 1; }
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-3px); }
        }

        @keyframes valuePulse {
          0%   { opacity: 1; transform: scale(1); }
          40%  { opacity: 0.6; transform: scale(0.97); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes badgePulse {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }

        @keyframes numFlip {
          0%   { opacity: 1;    transform: translateY(0) scaleY(1); }
          45%  { opacity: 0;    transform: translateY(-6px) scaleY(0.85); }
          55%  { opacity: 0;    transform: translateY(6px) scaleY(0.85); }
          100% { opacity: 1;    transform: translateY(0) scaleY(1); }
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1;   }
        }
      `}</style>

      <section
        ref={sectionRef}
        aria-label="24-hour activity statistics"
        data-testid="activity-24h-section"
        className="activity-24h"
      >
        <div className="activity-24h__head">
          <span
            className={`activity-24h__title${titlePulse ? " activity-24h__title--pulse" : ""}`}
          >
            24-Hour Activity
          </span>
          <span className="activity-24h__subtitle">Rolling 24-hour window</span>
        </div>

        <div className="activity-24h__grid">
          <EmailsCard
            value={stats.emailsReceived}
            animate={animateCount}
            loading={isLoading}
          />
          <ArrivalCard
            value={stats.arrivalTimeSec}
            loading={isLoading}
          />
          <DeletedCard
            value={stats.messagesDeleted}
            loading={isLoading}
          />
        </div>
      </section>
    </>
  );
}
