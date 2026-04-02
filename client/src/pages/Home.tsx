import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Mailbox, type Message } from "@shared/schema";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmailAddress } from "@/components/EmailAddress";
import { InboxList } from "@/components/InboxList";
import { MessageDetail } from "@/components/MessageDetail";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, AlertTriangle, Shield, Clock, Mail, Lock, EyeOff } from "lucide-react";
import ghistLogoPath from "@assets/ghist-logo.png";
import { Skeleton } from "@/components/ui/skeleton";

// Session token stored in memory (no localStorage in sandbox)
let sessionToken: string | null = null;

export default function Home() {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  // Create mailbox mutation
  const createMailbox = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/mailbox");
      return (await res.json()) as Mailbox;
    },
    onSuccess: (data) => {
      sessionToken = data.sessionToken;
      setSelectedMessageId(null);
      setExpired(false);
      queryClient.setQueryData(["/api/mailbox", sessionToken], data);
      queryClient.invalidateQueries({ queryKey: ["/api/mailbox", sessionToken, "messages"] });
    },
  });

  // Get current mailbox
  const {
    data: mailbox,
    isLoading: mailboxLoading,
  } = useQuery<Mailbox>({
    queryKey: ["/api/mailbox", sessionToken],
    queryFn: async () => {
      if (!sessionToken) throw new Error("No session");
      const res = await apiRequest("GET", `/api/mailbox/${sessionToken}`);
      return (await res.json()) as Mailbox;
    },
    enabled: !!sessionToken,
    refetchInterval: 30000,
    retry: false,
  });

  // Get messages
  const {
    data: messages = [],
    isLoading: messagesLoading,
    isFetching: messagesFetching,
  } = useQuery<Message[]>({
    queryKey: ["/api/mailbox", sessionToken, "messages"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const res = await apiRequest("GET", `/api/mailbox/${sessionToken}/messages`);
      return (await res.json()) as Message[];
    },
    enabled: !!sessionToken && !expired,
    refetchInterval: 10000,
  });

  // Get selected message detail — uses session token in URL
  const { data: selectedMessage } = useQuery<Message>({
    queryKey: ["/api/message", sessionToken, selectedMessageId],
    queryFn: async () => {
      if (!selectedMessageId || !sessionToken) throw new Error("No message");
      const res = await apiRequest("GET", `/api/message/${sessionToken}/${selectedMessageId}`);
      return (await res.json()) as Message;
    },
    enabled: !!selectedMessageId && !!sessionToken,
  });

  // Delete mailbox
  const deleteMailbox = useMutation({
    mutationFn: async () => {
      if (!sessionToken) return;
      await apiRequest("DELETE", `/api/mailbox/${sessionToken}`);
    },
    onSuccess: () => {
      sessionToken = null;
      setSelectedMessageId(null);
      setExpired(false);
      queryClient.clear();
    },
  });

  // Auto-create on first load
  useEffect(() => {
    if (!sessionToken && !createMailbox.isPending) {
      createMailbox.mutate();
    }
  }, []);

  const handleGenerate = useCallback(() => {
    createMailbox.mutate();
  }, [createMailbox]);

  const handleDelete = useCallback(() => {
    deleteMailbox.mutate();
  }, [deleteMailbox]);

  const handleExpired = useCallback(() => {
    setExpired(true);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/mailbox", sessionToken, "messages"] });
  }, []);

  // Expired state
  if (expired && !createMailbox.isPending) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-5 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-destructive/8 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-destructive" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Session expired</h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                This inbox and all messages have been permanently deleted.
                No data can be recovered.
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              className="gap-2"
              data-testid="button-generate-new"
            >
              <Plus className="w-4 h-4" />
              Generate new address
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No mailbox yet / deleted
  if (!sessionToken && !createMailbox.isPending) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-5 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Inbox deleted</h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Generate a new temporary address to get started.
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              className="gap-2"
              data-testid="button-generate-new"
            >
              <Plus className="w-4 h-4" />
              Generate new address
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isLoading = createMailbox.isPending || mailboxLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full">
        {/* ── Hero zone ──────────────────────────────────────────── */}
        <section className="bg-background px-5 sm:px-8 pt-10 pb-4 sm:pt-14 sm:pb-6">
          <div className="max-w-5xl mx-auto">
            {/* Hero copy — high-impact value proposition */}
            <div className="mb-8 sm:mb-10 max-w-2xl">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-snug mb-3">
                Your real inbox, protected.
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-body leading-relaxed">
                Ghist gives you free, anonymous, disposable email addresses — secure and instant.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-9 w-56" />
                <Skeleton className="h-8 w-40" />
              </div>
            ) : mailbox ? (
              <EmailAddress
                address={mailbox.address}
                expiresAt={mailbox.expiresAt}
                onGenerate={handleGenerate}
                onDelete={handleDelete}
                isGenerating={createMailbox.isPending}
                onExpired={handleExpired}
              />
            ) : null}
          </div>
        </section>

        {/* ── Inbox section ─────────────────────────────────────── */}
        <section className="bg-background px-5 sm:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            {/* Inbox header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-base font-semibold text-foreground">
                  Inbox
                </h2>
                {messages.length > 0 && (
                  <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body font-semibold tabular-nums">
                    {messages.length}
                  </span>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleRefresh}
                disabled={messagesFetching}
                aria-label="Refresh inbox"
                data-testid="button-refresh"
                className="w-7 h-7 rounded-full"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${messagesFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {/* Inbox card — tonal background, no border */}
            <div className="bg-card rounded-2xl overflow-hidden">
              {selectedMessageId && selectedMessage ? (
                <MessageDetail
                  message={selectedMessage}
                  onBack={() => {
                    setSelectedMessageId(null);
                    queryClient.invalidateQueries({ queryKey: ["/api/mailbox", sessionToken, "messages"] });
                  }}
                />
              ) : messagesLoading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3.5">
                      <Skeleton className="w-4 h-4 mt-1 rounded-md" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3.5 w-48" />
                        <Skeleton className="h-3 w-64" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <InboxList
                  messages={messages}
                  selectedId={selectedMessageId}
                  onSelect={setSelectedMessageId}
                />
              )}
            </div>
          </div>
        </section>


        {/* Privacy notice (directly under inbox) */}
        <section className="bg-muted/10 px-5 sm:px-8 py-5">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start gap-3">
              <EyeOff className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
                For temporary use only. Do not use for banking, healthcare, government, or accounts requiring long-term access. Messages permanently deleted after 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* Why Ghist */}
        <section className="bg-background px-5 sm:px-8 py-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <p className="text-[11px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Why Ghist
              </p>
              <p className="text-base sm:text-lg font-display font-semibold text-foreground max-w-lg">
                Your privacy shouldn’t be a premium feature.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Stay Anonymous */}
              <div className="bg-card rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-display font-semibold text-foreground">Stay Anonymous</span>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  No account, no profile, no trace. Every session is born and dies in isolation.
                </p>
              </div>

              {/* Built to Expire */}
              <div className="bg-card rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-display font-semibold text-foreground">Built to Expire</span>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  Emails are permanently wiped every 24hrs. Ephemeral by architecture, not policy.
                </p>
              </div>

              {/* Secure by Design */}
              <div className="bg-card rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-display font-semibold text-foreground">Secure by Design</span>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  All sessions use end-to-end encryption. Your address is never linked to your identity.
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-body text-muted-foreground">TLS 1.3 active</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Perfect For */}
        <section className="bg-muted/20 px-5 sm:px-8 py-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <p className="text-[11px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Perfect For
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Free trials", desc: "Sign up without risking spam." },
                { label: "Content downloads", desc: "Grab freebies without the marketing." },
                { label: "Verifications", desc: "One-time codes, no commitment." },
                { label: "Promo codes", desc: "Unlock discounts without ruining your inbox." },
              ].map((item) => (
                <div key={item.label} className="bg-card rounded-xl p-4 space-y-1">
                  <span className="text-sm font-display font-semibold text-foreground">{item.label}</span>
                  <p className="text-[11px] text-muted-foreground font-body leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}
