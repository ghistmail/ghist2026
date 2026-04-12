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

        <p className="text-xs text-muted-foreground">Last updated: 12 April 2026</p>

        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">

          <p>
            Ghist ("Ghist", "we", "us", or "our") runs a temporary email service at ghist.email.
            This policy explains what we collect, why we collect it, and what happens to it. By using Ghist,
            you agree that we need to process temporary mailbox data so the service can work.
          </p>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">1. What we collect</h2>
            <p>
              When you create a temporary inbox, we store the temporary email address, a session identifier,
              and incoming email content linked to that inbox. This can include message bodies, sender details,
              subject lines, timestamps, and email headers where needed to operate the service.
            </p>
            <p>
              We do not require you to create an account, set a password, or build a permanent profile to use Ghist.
            </p>
            <p>
              We also use Google Analytics and Google AdSense. These services may collect or process technical and
              usage data such as your IP address, browser and device information, pages viewed, session activity,
              referral data, and cookie identifiers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">2. How we use it</h2>
            <p>
              We use mailbox and session data to run temporary inboxes, receive and display messages, match
              messages to the right inbox, delete expired inboxes, and protect the service from abuse or attacks.
            </p>
            <p>
              We use analytics and advertising data to understand site usage, improve performance, measure
              engagement, and display ads.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">3. Analytics, ads, and cookies</h2>
            <p>
              Ghist uses Google Analytics to understand how people use the site. Google Analytics may use cookies
              and similar technologies to collect information about how you interact with the website and generate
              reports for us.
            </p>
            <p>
              Ghist also uses Google AdSense to show ads. Third-party vendors, including Google, may use cookies
              to serve personalised or non-personalised ads based on your visits to this site and other sites.
              Google explains how it uses data collected from sites and apps that use its services on its{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                Privacy &amp; Terms page
              </a>.
            </p>
            <p>
              We and our partners may use cookies and similar technologies for functionality, analytics, ad
              delivery, ad measurement, fraud prevention, and related reporting. Depending on where you are
              located, consent may be required before non-essential cookies are used. Where required by law,
              we will ask for that consent before those cookies are activated.
            </p>
            <p>
              You can control cookies through your browser settings. You can also manage personalised ads
              through Google's ad settings and use Google's Analytics opt-out tools.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">4. Retention</h2>
            <p>
              Temporary inboxes and their contents are permanently deleted 24 hours after creation. This
              deletion removes the temporary email address, message content, and related session data from
              our service, with no recovery option.
            </p>
            <p>
              Data collected through Google Analytics and Google AdSense may be processed and retained by
              Google under Google's own systems, settings, and policies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">5. Hosting and providers</h2>
            <p>
              Ghist is hosted on Render.com. We may also use other service providers to help us host, secure,
              maintain, and improve the service. Where needed, those providers may have access to information
              only so they can perform services for us.
            </p>
            <p>
              Because we use Google Analytics and Google AdSense, information collected through those services
              may also be processed by Google for analytics, advertising, reporting, and related services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">6. Sharing</h2>
            <p>
              We may share information with service providers that help us operate the site, including
              infrastructure providers like Render.com.
            </p>
            <p>
              We may also share information when required by law, to respond to legal requests, to investigate
              abuse or security issues, or to protect our rights, users, or the service.
            </p>
            <p>
              We do not sell mailbox content as part of a profile data brokerage business. Third parties such
              as Google may still process data collected through their own technologies under their own policies
              when those technologies are used on the site.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">7. Security</h2>
            <p>
              We take reasonable steps to protect the service and the information we process. Email content
              shown in Ghist may be sanitised before display. Scripts, iframes, remote tracking pixels, remote
              images, and unsafe attachments may be blocked or filtered to reduce security risks.
            </p>
            <p>No system is completely secure, so we cannot guarantee absolute security.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">8. Important limits</h2>
            <p>
              Ghist is a receive-only service. You cannot send email from a Ghist address.
            </p>
            <p>
              Temporary inboxes are designed for short-term, disposable use only. Do not use Ghist for banking,
              healthcare, government, financial, legal, employment, identity, or any other account where
              long-term access or recovery matters.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">9. Your choices</h2>
            <p>
              You can stop using Ghist at any time by closing your session and letting the inbox expire.
            </p>
            <p>
              You can also control cookies through your browser and, where available, through any consent
              tools shown on the site.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">10. International use</h2>
            <p>
              If you access Ghist from outside the country where our infrastructure or providers are located,
              your information may be processed in other jurisdictions.
            </p>
            <p>
              If local laws require consent for analytics or advertising cookies, we may show extra notices
              or consent tools to comply with those laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">11. Changes</h2>
            <p>
              We may update this policy from time to time. When we do, we will post the latest version here
              and update the date at the top of the page.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">12. Contact</h2>
            <p>
              If you have questions, requests, or complaints about this policy or how we handle information,
              please{" "}
              <Link href="/contact" className="underline hover:text-foreground transition-colors">
                contact us
              </Link>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
