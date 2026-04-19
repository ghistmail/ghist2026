import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { blogPosts } from "@/lib/blogData";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Mailbox, type Message } from "@shared/schema";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmailAddress } from "@/components/EmailAddress";
import { InboxList, EmailCardSkeleton } from "@/components/InboxList";
import { MessageDetail } from "@/components/MessageDetail";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, Clock, Mail, EyeOff, X, LayoutTemplate, BarChart2, Tag, MessageSquare, Wifi, Bot, KeyRound } from "lucide-react";
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

        {/* ── Every signup you don't quite trust ───────────────── */}
        <section className="bg-muted/20 px-5 sm:px-8 py-10 sm:py-14">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-display font-black text-foreground leading-tight tracking-tight">
                Every signup you<br />don't quite trust.
              </h2>
              <p className="text-base text-muted-foreground font-body mt-4 leading-relaxed">
                Anywhere you'd normally hand over your real address and regret it later.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5">
              {[
                { label: "Newsletter sign-ups",      Icon: Mail },
                { label: "Free trial accounts",      Icon: Clock },
                { label: "AI tool sign-ups",         Icon: Bot },
                { label: "Suspect promo codes",      Icon: Tag },
                { label: "Gated content downloads",  Icon: LayoutTemplate },
                { label: "App beta testing",         Icon: BarChart2 },
                { label: "Shared Wi‑Fi portals",     Icon: Wifi },
                { label: "Feedback forms",           Icon: MessageSquare },
                { label: "One-time passcodes",       Icon: KeyRound },
              ].map(({ label, Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border/40"
                >
                  <div className="w-7 h-7 rounded-lg bg-muted/60 dark:bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground dark:text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-body font-medium text-foreground whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────── */}
        <section className="bg-background px-5 sm:px-8 py-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-7">
              <p className="text-[11px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
                How It Works
              </p>
              <h2 className="text-base sm:text-lg font-display font-semibold text-foreground">
                Three steps. Zero effort.
              </h2>
              <p className="text-sm text-muted-foreground font-body mt-2 max-w-lg leading-relaxed">
                No account, no profile, no footprint. Ghist gives you a disposable inbox the moment you need it — and makes it disappear just as easily.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-card rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-[11px] font-display font-bold text-primary">1</span>
                  <h3 className="text-sm font-display font-semibold text-foreground">Your inbox, now</h3>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  An address is ready the moment you arrive. No signup, no name, no credit card. Just a fresh inbox waiting for mail.
                </p>
              </div>
              <div className="bg-card rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-[11px] font-display font-bold text-primary">2</span>
                  <h3 className="text-sm font-display font-semibold text-foreground">Use it anywhere</h3>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  Drop the address into any sign-up form, free trial, content download, or newsletter you don't fully trust. Your email arrives instantly.
                </p>
              </div>
              <div className="bg-card rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-[11px] font-display font-bold text-primary">3</span>
                  <h3 className="text-sm font-display font-semibold text-foreground">It vanishes</h3>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  Emails are permanently wiped every 24 hours. Ephemeral by architecture, not policy. No cleanup required. You're a ghost.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why Ghist? ─────────────────────────────────────────── */}
        <section className="bg-muted/20 px-5 sm:px-8 py-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-7">
              <p className="text-[11px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Why Ghist?
              </p>
              <h2 className="text-base sm:text-lg font-display font-semibold text-foreground">
                Built for people who’d rather share less.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-card rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <EyeOff className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-display font-semibold text-foreground">Temporary by default.</h3>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  No accounts, no permanent profiles, and no unnecessary data. Your ghost address is yours when you need it—and gone when you don’t.
                </p>
              </div>
              <div className="bg-card rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-display font-semibold text-foreground">Fast enough for OTPs</h3>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  Mail lands in your inbox within seconds — fast enough for verification codes and time-sensitive login emails.
                </p>
              </div>
            </div>
          </div>
        </section>
            {/* ── Latest blogs section */}
        <section className="px-5 sm:px-8 py-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <p className="text-[11px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">Blog</p>
              <h2 className="text-base sm:text-lg font-display font-semibold text-foreground">Latest articles</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {blogPosts.slice(0, 3).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block no-underline"
                >
                  <article className="rounded-xl overflow-hidden border border-border/40 bg-card hover:border-border transition-colors h-full flex flex-col">
                    <div className="aspect-video w-full bg-muted overflow-hidden flex-shrink-0">
                      {post.heroImage ? (
                        <img
                          src={post.heroImage}
                          alt={post.heroAlt ?? post.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col space-y-1.5">
                      <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-foreground/80 transition-colors flex-1">{post.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                      <p className="text-[10px] text-muted-foreground/50 pt-0.5">{post.readTime}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-right">
              <Link href="/blog" className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                View all articles
              </Link>
            </div>
          </div>
        </section>

    {/* ── FAQ section ───────────────────────────────────────── */}
        <section className="bg-muted/20 px-5 sm:px-8 py-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <p className="text-[11px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">FAQ</p>
              <h2 className="text-base sm:text-lg font-display font-semibold text-foreground">Frequently asked questions</h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  q: "Is Ghist completely free?",
                  a: "Yes. Ghist is 100% free with no premium tiers, no sign-up, and no credit card required.",
                },
                {
                  q: "Do I need to create an account?",
                  a: "No. Ghist generates a temporary email address the moment you open the site. No account, no password, no personal information required.",
                },
                {
                  q: "How long does my Ghist address last?",
                  a: "Every address and all its messages are automatically and permanently deleted after 24 hours. There is no way to recover them.",
                },
                {
                  q: "Is it safe for verification codes and OTPs?",
                  a: "Yes. Ghist uses TLS 1.3 encryption and all sessions are isolated — your temporary address is never linked to your real identity.",
                },
                {
                  q: "Does Ghist store or sell my data?",
                  a: "No. Ghist does not require any personal information and permanently deletes all emails after 24 hours.",
                },
                {
                  q: "Can I use Ghist for banking or important accounts?",
                  a: "No. Ghist is for temporary use only. Do not use it for banking, healthcare, government services, or any account requiring long-term access.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="bg-card rounded-xl overflow-hidden group"
                >
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-display font-semibold text-sm text-foreground select-none hover:bg-secondary/30 transition-colors">
                    <span>{item.q}</span>
                    <span className="text-muted-foreground text-lg leading-none group-open:rotate-45 transition-transform duration-200">+</span>
                  </summary>
                  <p className="px-5 pb-4 pt-1 text-xs text-muted-foreground font-body leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Definition — small print, SEO ────────────────────── */}
        <section className="bg-background px-5 sm:px-8 pt-6 pb-10">
          <div className="max-w-3xl mx-auto border-t border-border/30 pt-6">
            <h2 className="text-[11px] font-body font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] mb-2">
              What is a disposable email address?
            </h2>
            <p className="text-[11px] text-muted-foreground/50 font-body leading-relaxed max-w-2xl">
              A disposable email address — also called a temp mail, throwaway email, or burner email — is a temporary inbox you can use without revealing your real address. Ghist generates one instantly, requires no account, and permanently deletes everything after 24 hours. It’s the cleanest way to keep your inbox free from spam and unwanted marketing.
            </p>
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
