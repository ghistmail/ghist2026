import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft, Shield, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, t } from "@/lib/i18n";

export default function About() {
  const locale = useLocale();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button size="icon" variant="ghost" aria-label="Back to home" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">{t(locale, "about.title")}</h1>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p className="text-base text-foreground leading-relaxed">
            {t(locale, "about.description")}
          </p>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">Our mission</h2>
            <p>{t(locale, "about.mission")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">Our values</h2>
            <p>{t(locale, "about.values")}</p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Privacy first</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No accounts, no tracking, no personal data ever required.
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Ephemeral by design</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every mailbox and its contents vanish automatically after 24 hours.
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-2">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Fully transparent</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open about what we collect (virtually nothing) and how it works.
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">How it works</h2>
            <p>
              Ghist generates a temporary email address through established email providers. Incoming
              messages are cached server-side for the duration of the 24-hour window, then permanently
              purged. No message bodies, headers, metadata, or session tokens are retained after expiry.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">Who built this</h2>
            <p>
              Ghist was created by Alex Wain as a clean, no-friction alternative to services that
              require sign-ups or collect unnecessary data. It is designed to do one thing well: give
              you a real, working email address for the next 24 hours, then forget you ever existed.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
