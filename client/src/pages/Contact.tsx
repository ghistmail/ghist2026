import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useLocale, t } from "@/lib/i18n";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setStatus("idle");
    setErrorMsg("");
    try {
      const res = await apiRequest("POST", "/api/contact", data);
      const body = await res.json();
      if (!res.ok) {
        setErrorMsg(body.error ?? t(locale, "contact.error"));
        setStatus("error");
      } else {
        setStatus("success");
        reset();
      }
    } catch {
      setErrorMsg(t(locale, "contact.error"));
      setStatus("error");
    }
  };

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
          <h1 className="text-xl font-semibold tracking-tight">{t(locale, "contact.title")}</h1>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Have a question, a bug report, or something else to share? Fill in the form below and
          we'll get back to you as soon as possible.
        </p>

        {status === "success" && (
          <div
            className="flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-600 dark:text-green-400"
            data-testid="contact-success"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{t(locale, "contact.success")}</p>
          </div>
        )}

        {status === "error" && (
          <div
            className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
            data-testid="contact-error"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{errorMsg || t(locale, "contact.error")}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="contact-form">
          <div className="space-y-1.5">
            <Label htmlFor="contact-name" className="text-sm">
              {t(locale, "contact.name_label")}
            </Label>
            <Input
              id="contact-name"
              placeholder="Alex Smith"
              data-testid="input-name"
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
              })}
            />
            {errors.name && (
              <p className="text-xs text-destructive" data-testid="error-name">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-email" className="text-sm">
              {t(locale, "contact.email_label")}
            </Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="alex@example.com"
              data-testid="input-email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-destructive" data-testid="error-email">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-subject" className="text-sm">
              {t(locale, "contact.subject_label")}
            </Label>
            <Input
              id="contact-subject"
              placeholder="Quick question about..."
              data-testid="input-subject"
              {...register("subject", {
                required: "Subject is required",
                minLength: { value: 3, message: "Subject must be at least 3 characters" },
              })}
            />
            {errors.subject && (
              <p className="text-xs text-destructive" data-testid="error-subject">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-message" className="text-sm">
              {t(locale, "contact.message_label")}
            </Label>
            <Textarea
              id="contact-message"
              rows={5}
              placeholder="Tell us what's on your mind..."
              data-testid="input-message"
              className="resize-none"
              {...register("message", {
                required: "Message is required",
                minLength: { value: 10, message: "Message must be at least 10 characters" },
                maxLength: { value: 2000, message: "Message must be under 2000 characters" },
              })}
            />
            {errors.message && (
              <p className="text-xs text-destructive" data-testid="error-message">
                {errors.message.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
            data-testid="button-submit"
          >
            {isSubmitting ? "Sending…" : t(locale, "contact.submit")}
          </Button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
