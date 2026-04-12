import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocale, t, getQuestions } from "@/lib/i18n";

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-b border-border/50 last:border-0"
      data-testid={`faq-item-${index}`}
    >
      <button
        className="w-full flex items-start justify-between gap-4 py-4 text-left text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        data-testid={`faq-question-${index}`}
      >
        <span>{q}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 mt-0.5 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p
          className="pb-4 text-sm text-muted-foreground leading-relaxed"
          data-testid={`faq-answer-${index}`}
        >
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  const locale = useLocale();
  const questions = getQuestions(locale);

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
          <h1 className="text-xl font-semibold tracking-tight">{t(locale, "faq.title")}</h1>
        </div>

        <div
          className="rounded-lg border border-border/50 bg-card/30 px-4 divide-y-0"
          data-testid="faq-list"
        >
          {questions.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} index={i} />
          ))}
        </div>

        <div className="rounded-lg bg-muted/30 border border-border/40 p-4 text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Still have questions?</p>
          <p>
            Reach out via our{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:text-foreground transition-colors">
              contact page
            </Link>{" "}
            and we'll get back to you.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
