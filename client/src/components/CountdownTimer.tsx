import { useState, useEffect } from "react";

interface CountdownTimerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    function update() {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        setIsUrgent(true);
        setExpired(true);
        onExpired?.();
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const urgent = diff < 3600000; // under 1 hour
      setIsUrgent(urgent);

      if (urgent) {
        // Show mm:ss when under 1 hour for precision
        setTimeLeft(`${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`);
      } else {
        // Human-readable: "23h 47m"
        setTimeLeft(`${hours}h ${minutes.toString().padStart(2, "0")}m`);
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  if (expired) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase bg-destructive/10 text-destructive"
        data-testid="text-countdown"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
        Expired
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide tabular-nums font-body ${
        isUrgent
          ? "bg-destructive/10 text-destructive urgent-pulse"
          : "bg-secondary text-muted-foreground"
      }`}
      data-testid="text-countdown"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isUrgent ? "bg-destructive animate-pulse" : "bg-primary"
        }`}
      />
      Expires in {timeLeft}
    </span>
  );
}
