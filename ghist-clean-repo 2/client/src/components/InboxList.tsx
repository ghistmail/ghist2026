import { useRef, useEffect, useState } from "react";
import { type Message } from "@shared/schema";
import { Mail, MailOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { GhostLogo } from "./GhostLogo";

interface InboxListProps {
  messages: Message[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Unix timestamp ms of last poll */
  lastChecked?: number;
  /** Whether currently fetching */
  isFetching?: boolean;
}

function extractOTP(text: string): string | null {
  const patterns = [
    /\b(\d{6})\b/,
    /\b(\d{4})\b/,
    /\b(\d{8})\b/,
    /code[:\s]+(\d{4,8})/i,
    /OTP[:\s]+(\d{4,8})/i,
    /password[:\s]+(\d{4,8})/i,
    /verification[:\s]+(\d{4,8})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getPreview(text: string, maxLen = 80): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > maxLen ? clean.slice(0, maxLen) + "…" : clean;
}

/** Format "last checked" time: "Checked X seconds ago" */
function useLastCheckedLabel(lastChecked?: number) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!lastChecked) return;

    function update() {
      const diffMs = Date.now() - (lastChecked ?? 0);
      const secs = Math.floor(diffMs / 1000);
      if (secs < 5) setLabel("just now");
      else if (secs < 60) setLabel(`${secs} seconds ago`);
      else setLabel(`${Math.floor(secs / 60)}m ago`);
    }

    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, [lastChecked]);

  return label;
}

/** Animated empty state — ghostly envelope floats */
function EmptyInbox() {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {/* Floating ghost envelope */}
      <div className="relative mb-6">
        {/* Floating ghost icon */}
        <div
          style={{
            animation: "ghost-float 3s ease-in-out infinite",
            willChange: "transform",
          }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center relative">
            <Mail
              className="w-7 h-7 text-muted-foreground"
              strokeWidth={1.5}
              style={{ animation: "live-pulse 3s ease-in-out infinite" }}
            />
          </div>
        </div>

        {/* Shadow below the icon box */}
        <div
          className="mx-auto mt-1 rounded-full bg-foreground/10"
          style={{
            width: 40,
            height: 6,
            animation: "shadow-pulse 3s ease-in-out infinite",
            willChange: "transform, opacity",
          }}
          aria-hidden="true"
        />
      </div>

      <p className="font-display text-base font-semibold text-foreground mb-1.5">
        Waiting for mail…
      </p>
      <p className="text-xs text-muted-foreground font-body max-w-[260px] leading-relaxed">
        Emails appear here in seconds. Your inbox is live and listening.
      </p>

      {/* Status chips */}
      <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-body font-medium bg-secondary text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary live-dot" />
          Secure Connection
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-body font-medium bg-secondary text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary live-dot" />
          End-to-end
        </span>
      </div>
    </div>
  );
}

/** Skeleton loader for a single email card */
export function EmailCardSkeleton() {
  return (
    <div className="px-5 py-4 animate-pulse">
      <div className="flex items-start gap-3.5">
        <div className="mt-1 w-4 h-4 rounded-md bg-secondary shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between gap-4">
            <div className="h-3.5 bg-secondary rounded w-28" />
            <div className="h-3 bg-secondary rounded w-12" />
          </div>
          <div className="h-3.5 bg-secondary rounded w-48" />
          <div className="h-3 bg-secondary rounded w-64" />
        </div>
      </div>
    </div>
  );
}

export function InboxList({
  messages,
  selectedId,
  onSelect,
  lastChecked,
  isFetching,
}: InboxListProps) {
  const checkedLabel = useLastCheckedLabel(lastChecked);
  const prevIdsRef = useRef<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Track newly arrived messages for slide-in animation
  useEffect(() => {
    const incoming = messages.filter((m) => !prevIdsRef.current.has(m.id));
    if (incoming.length > 0) {
      const ids = new Set(incoming.map((m) => m.id));
      setNewIds(ids);
      setTimeout(() => setNewIds(new Set()), 600);
    }
    prevIdsRef.current = new Set(messages.map((m) => m.id));
  }, [messages]);

  const empty = messages.length === 0;

  return (
    <div>
      {/* Live auto-refresh indicator */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary live-dot"
            aria-hidden="true"
          />
          <span className="text-[11px] text-muted-foreground font-body">
            {isFetching ? "Checking for new mail…" : checkedLabel ? `Checked ${checkedLabel}` : "Auto-refreshing"}
          </span>
        </div>
        {messages.length > 0 && (
          <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body font-semibold tabular-nums">
            {messages.length}
          </span>
        )}
      </div>

      {empty ? (
        <EmptyInbox />
      ) : (
        <div>
          {messages.map((msg) => {
            const otp = extractOTP(msg.subject + " " + msg.textBody);
            const isSelected = selectedId === msg.id;
            const isNew = newIds.has(msg.id);
            let timeAgo = "";
            try {
              timeAgo = formatDistanceToNow(new Date(msg.receivedAt), { addSuffix: true });
            } catch {
              timeAgo = "";
            }

            return (
              <button
                key={msg.id}
                onClick={() => onSelect(msg.id)}
                className={`
                  w-full text-left px-5 py-4 transition-colors
                  border-b border-border/30 last:border-b-0
                  hover-elevate
                  ${isSelected ? "bg-secondary" : "hover:bg-secondary/50"}
                  ${isNew ? "email-card-enter" : ""}
                `}
                data-testid={`button-message-${msg.id}`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Read indicator */}
                  <div className="mt-0.5 shrink-0">
                    {msg.isRead ? (
                      <MailOpen className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    ) : (
                      <div className="relative">
                        <Mail className="w-4 h-4 text-primary" strokeWidth={1.5} />
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Sender + time — one scan line */}
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <span
                        className={`text-sm font-body truncate ${
                          msg.isRead ? "font-normal text-muted-foreground" : "font-semibold text-foreground"
                        }`}
                      >
                        {msg.fromName || msg.from}
                      </span>
                      <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums font-body">
                        {timeAgo}
                      </span>
                    </div>

                    {/* Subject */}
                    <p
                      className={`text-sm font-body truncate mb-0.5 ${
                        msg.isRead ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {msg.subject}
                    </p>

                    {/* Preview + OTP chip */}
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground font-body truncate flex-1">
                        {getPreview(msg.textBody)}
                      </p>
                      {otp && (
                        <span
                          className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-mono font-bold tracking-wider"
                          style={{ fontFamily: "'Geist Mono', monospace" }}
                        >
                          {otp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
