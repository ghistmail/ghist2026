import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Mailbox, type Message } from "@shared/schema";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmailAddress } from "@/components/EmailAddress";
import { InboxList, EmailCardSkeleton } from "@/components/InboxList";
import { MessageDetail } from "@/components/MessageDetail";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, Shield, Clock, Mail, Lock, EyeOff, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GhostLogo } from "@/components/GhostLogo";

// Session token stored in memory (no localStorage in sandbox)
let sessionToken: string | null = null;

export default function Home() {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [lastChecked, setLastChecked] = useState<number | undefined>(undefined);
  // Mobile bottom-sheet state
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

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
      setBottomSheetOpen(false);
      queryClient.setQueryData(["/api/mailbox", sessionToken], data);
      queryClient.invalidateQueries({ queryKey: ["/api/mailbox", sessionToken, "messages"] });
    },
  });

  // Get current mailbox
  const { data: mailbox, isLoading: mailboxLoading } = useQuery<Mailbox>({
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
    dataUpdatedAt,
    refetch: refetchMessages,
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

  // Track last checked timestamp
  useEffect(() => {
    if (dataUpdatedAt) setLastChecked(dataUpdatedAt);
  }, [dataUpdatedAt]);

  // Get selected message detail
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
      setBottomSheetOpen(false);
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

  const handleSelectMessage = useCallback((id: string) => {
    setSelectedMessageId(id);
    // On mobile, open bottom sheet
    if (window.innerWidth < 768) {
      setBottomSheetOpen(true);
    }
  }, []);

  const handleCloseMessage = useCallback(() => {
    setSelectedMessageId(null);
    setBottomSheetOpen(false);
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
                This inbox and all messages have been permanently deleted. No data can be recovered.
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
        <section className="bg-background px-5 sm:px-8 pt-12 pb-10 sm:pt-16 sm:pb-14">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="space-y-4 text-center w-full">
                  <Skeleton className="h-12 w-3/4 mx-auto" />
                  <Skeleton className="h-12 w-2/3 mx-auto" />
                  <Skeleton className="h-6 w-40 mx-auto" />
                </div>
                <div className="w-full max-w-2xl space-y-3">
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <div className="flex justify-between px-1">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
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
        <section className="bg-background px-5 sm:px-8 py-4">
          <div className="max-w-3xl mx-auto">
            {/* Inbox label */}
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-display text-base font-semibold text-foreground">Inbox</h2>
            </div>

            {/* Inbox card */}
            <div className="bg-card rounded-2xl overflow-hidden">
              {/* Desktop: show message detail inline */}
              {selectedMessageId && selectedMessage ? (
                <>
                  {/* Desktop inline detail */}
                  <div className="hidden md:block">
                    <MessageDetail
                      message={selectedMessage}
                      onBack={handleCloseMessage}
                    />
                  </div>
                  {/* Mobile: show inbox list (detail is in bottom-sheet) */}
                  <div className="md:hidden">
                    {messagesLoading ? (
                      <div>
                        <div className="px-5 pt-3 pb-2 border-b border-border/40">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                            <span className="text-[11px] text-muted-foreground font-body">Loading…</span>
                          </div>
                        </div>
                        <EmailCardSkeleton />
                        <EmailCardSkeleton />
                        <EmailCardSkeleton />
                      </div>
                    ) : (
                      <InboxList
                        messages={messages}
                        selectedId={selectedMessageId}
                        onSelect={handleSelectMessage}
                        lastChecked={lastChecked}
                        isFetching={messagesFetching}
                        onRefresh={refetchMessages}
                      />
                    )}
                  </div>
                </>
              ) : (
                /* No message selected — show inbox list on all screen sizes */
                <>
                  {messagesLoading ? (
                    <div>
                      <div className="px-5 pt-3 pb-2 border-b border-border/40">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                          <span className="text-[11px] text-muted-foreground font-body">Loading…</span>
                        </div>
                      </div>
                      <EmailCardSkeleton />
                      <EmailCardSkeleton />
                      <EmailCardSkeleton />
                    </div>
                  ) : (
                    <InboxList
                      messages={messages}
                      selectedId={selectedMessageId}
                      onSelect={handleSelectMessage}
                      lastChecked={lastChecked}
                      isFetching={messagesFetching}
                      onRefresh={refetchMessages}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Privacy notice ────────────────────────────────────── */}
        <section className="bg-muted/10 px-5 sm:px-8 py-5">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <EyeOff className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
                For temporary use only. Do not use for banking, healthcare, government, or accounts requiring long-term access. Messages permanently deleted after 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* ── Why Ghist ─────────────────────────────────────────── */}
        <section className="bg-background px-5 sm:px-8 py-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <p className="text-[11px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Why Ghist
              </p>
              <p className="text-base sm:text-lg font-display font-semibold text-foreground max-w-lg">
                Your privacy shouldn't be a premium feature.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

        {/* ── Perfect For ────────────────────────────────────────── */}
        <section className="bg-muted/20 px-5 sm:px-8 py-10">
          <div className="max-w-3xl mx-auto">
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

      {/* ── Mobile bottom-sheet for email detail ─────────────────── */}
      {bottomSheetOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Scrim */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseMessage}
            aria-hidden="true"
          />
          {/* Sheet */}
          <div
            className="relative bg-card rounded-t-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: "88vh" }}
          >
            {/* Handle + close */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/40 shrink-0">
              <div className="w-10 h-1 bg-border rounded-full mx-auto" />
              <button
                onClick={handleCloseMessage}
                className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Close email"
                data-testid="button-close-email-sheet"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1">
              <MessageDetail
                message={selectedMessage}
                onBack={handleCloseMessage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
