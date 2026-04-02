import { type Message } from "@shared/schema";
import { Mail, MailOpen, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InboxListProps {
  messages: Message[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function extractOTP(text: string): string | null {
  // Look for common OTP patterns: 4-8 digit codes
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
  return clean.length > maxLen ? clean.slice(0, maxLen) + "..." : clean;
}

export function InboxList({ messages, selectedId, onSelect }: InboxListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        {/* Animated icon */}
        <div className="relative w-14 h-14 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
            <Mail className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={2.5} />
          </span>
        </div>
        <p className="font-display text-base font-semibold text-foreground mb-1.5">
          Listening for pulses...
        </p>
        <p className="text-xs text-muted-foreground font-body max-w-[260px] leading-relaxed">
          Your temporary inbox is live and secured. Incoming messages will appear here in real-time.
        </p>
        {/* Status chips */}
        <div className="flex items-center gap-2 mt-5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-body font-medium bg-secondary text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Secure Connection
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-body font-medium bg-secondary text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            End-to-end
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {messages.map((msg) => {
        const otp = extractOTP(msg.subject + " " + msg.textBody);
        const isSelected = selectedId === msg.id;
        const timeAgo = formatDistanceToNow(new Date(msg.receivedAt), { addSuffix: true });

        return (
          <button
            key={msg.id}
            onClick={() => onSelect(msg.id)}
            className={`w-full text-left px-5 py-4 transition-colors hover-elevate ${
              isSelected
                ? "bg-secondary"
                : "hover:bg-secondary/50"
            }`}
            data-testid={`button-message-${msg.id}`}
          >
            <div className="flex items-start gap-3.5">
              {/* Read indicator dot or icon */}
              <div className="mt-1 shrink-0">
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
                {/* From + time row */}
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <span
                    className={`text-sm font-body truncate ${
                      msg.isRead ? "text-muted-foreground" : "font-semibold text-foreground"
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
                    <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-mono font-bold tracking-wider">
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
  );
}
