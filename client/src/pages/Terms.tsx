import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
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
          <h1 className="text-xl font-semibold tracking-tight">Terms of Use</h1>
        </div>

        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">Acceptable use</h2>
            <p>
              Ghist provides disposable temporary email addresses for legitimate one-time use cases
              such as email verification, sign-up confirmations, and receiving one-time passwords.
              You agree not to use Ghist for any unlawful purpose, including but not limited to
              fraud, phishing, harassment, or receiving illegal content.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">Abuse prevention</h2>
            <p>
              We enforce rate limits on mailbox creation and message polling to prevent abuse.
              Automated mass mailbox creation, bot traffic, and attempts to circumvent rate limits
              may result in temporary or permanent access restrictions. We reserve the right to
              block or disable any mailbox that violates these terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">No guaranteed delivery</h2>
            <p>
              Ghist does not guarantee delivery of all emails. Some services may block or filter
              messages to disposable email addresses. Domain rotation is supported to reduce blocking,
              but delivery is provided on a best-effort basis.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">Data lifecycle</h2>
            <p>
              All mailboxes, messages, and associated data are permanently deleted 24 hours after
              mailbox creation. Users may also delete their mailbox early at any time. Deleted data
              cannot be recovered under any circumstances.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">Limitation of liability</h2>
            <p>
              Ghist is provided "as is" without warranty of any kind. We are not responsible for
              any loss, damage, or inconvenience caused by missed emails, expired inboxes, service
              downtime, or data deletion. Use at your own risk.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">Not for sensitive accounts</h2>
            <p>
              You acknowledge that Ghist should never be used as the primary email for banking,
              healthcare, government, financial services, or any account where you may need
              long-term access, password recovery, or account verification in the future.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
