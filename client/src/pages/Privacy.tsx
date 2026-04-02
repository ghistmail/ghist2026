import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button size="icon" variant="ghost" aria-label="Back to home" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">Privacy Policy</h1>
        </div>

        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">What we collect</h2>
            <p>
              Ghist collects the absolute minimum data needed to operate. When you generate a temporary
              email address, we store the address, a session identifier, and any incoming email content
              associated with that address. No personal information, IP addresses, or browsing data
              is retained beyond the temporary session.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">24-hour auto-deletion</h2>
            <p>
              Every mailbox and its contents are permanently deleted exactly 24 hours after creation.
              This deletion is automatic and irreversible. Once expired, the email address, message
              bodies, metadata, headers, and all session data are purged with no possibility of recovery.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">No accounts or tracking</h2>
            <p>
              Ghist requires no signup, login, password, or account creation. We do not use analytics
              trackers, advertising cookies, or third-party tracking scripts. There is no user profile
              to build or sell.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">Email content security</h2>
            <p>
              All email content is sanitized before display. Scripts, iframes, remote tracking pixels,
              and unsafe attachments are blocked. HTML content is aggressively filtered to prevent
              cross-site scripting and other injection attacks. We do not load remote images or
              external resources from within email messages.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">Receive only</h2>
            <p>
              Ghist is a receive-only service. You cannot send emails from a Ghist address.
              This prevents the service from being used for spam, phishing, or impersonation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">Not for sensitive accounts</h2>
            <p>
              Do not use Ghist for banking, healthcare, government, financial, or any account
              where long-term access or account recovery is needed. Temporary emails are designed
              for one-time verifications and disposable sign-ups only.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
