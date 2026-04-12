import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link, useParams } from "wouter";
import { ArrowLeft, Clock, Tag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug } from "@/lib/blogData";
import { useLocale, t } from "@/lib/i18n";
import { useEffect } from "react";

// Detect whether a body paragraph is a subheading.
// Subheadings: short (≤80 chars), not ending in a period/comma/colon/semi-colon,
// not starting with a lowercase letter (those are mid-paragraph fragments).
function isSubheading(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > 80) return false;
  if (/[.,;:!?]$/.test(trimmed)) return false;  // ends in punctuation → sentence
  if (/^[a-z]/.test(trimmed)) return false;       // starts lowercase → fragment
  // Must have at least 2 words to be a heading
  if (trimmed.split(/\s+/).length < 2) return false;
  return true;
}

export default function BlogPost() {
  const locale = useLocale();
  const params = useParams<{ slug: string }>();
  const post = getBlogPostBySlug(params.slug ?? "");

  // Inject OG image meta tag for this post into document head
  useEffect(() => {
    if (!post?.heroImage) return;
    const ogImgUrl = `https://ghist.email${post.heroImage}`;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("og:image", ogImgUrl);
    setMeta("og:image:width", "1200");
    setMeta("og:image:height", "630");
    setMeta("og:image:alt", post.heroAlt);
    setMeta("og:title", `${post.title} — Ghist`);
    setMeta("og:description", post.metaDescription);
    setMeta("og:type", "article");
    setMetaName("twitter:card", "summary_large_image");
    setMetaName("twitter:image", ogImgUrl);

    // Update <title>
    document.title = `${post.title} — Ghist`;
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="flex items-center gap-2">
            <Link href="/blog">
              <Button size="icon" variant="ghost" aria-label="Back to blog" data-testid="button-back-blog">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold tracking-tight">Post not found</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            This article does not exist or may have been moved.{" "}
            <Link href="/blog" className="underline underline-offset-2 hover:text-foreground">
              Browse all posts →
            </Link>
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Back nav */}
        <div className="flex items-center gap-2">
          <Link href="/blog">
            <Button size="icon" variant="ghost" aria-label="Back to blog" data-testid="button-back-blog">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground transition-colors">
              {t(locale, "blog.title")}
            </Link>
          </span>
        </div>

        {/* Post header */}
        <header className="space-y-4">
          <h1
            className="text-xl font-bold tracking-tight text-foreground leading-snug"
            data-testid="blog-post-title"
          >
            {post.title}
          </h1>
          <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {new Date(post.publishDate).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {post.readingTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
            {post.metaDescription}
          </p>
        </header>

        {/* Hero image */}
        <div className="rounded-xl overflow-hidden w-full aspect-[1200/630] bg-muted/30">
          <img
            src={post.heroImage}
            alt={post.heroAlt}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            data-testid="blog-hero-image"
          />
        </div>

        {/* Post body — subheadings bolded, bullet items grouped, mid-article image injected */}
        <div
          className="space-y-4 text-sm text-foreground/80 leading-relaxed"
          data-testid="blog-post-body"
        >
          {(() => {
            const elements: React.ReactNode[] = [];
            // Insert body image after ~40% of paragraphs
            const insertAt = Math.floor(post.body.length * 0.40);
            let imageInserted = false;
            let i = 0;
            while (i < post.body.length) {
              // Inject body image at the right paragraph boundary
              if (!imageInserted && i >= insertAt) {
                imageInserted = true;
                elements.push(
                  <div key="body-image" className="rounded-xl overflow-hidden w-full my-6">
                    <img
                      src={post.bodyImage}
                      alt={post.bodyImageAlt}
                      className="w-full h-64 object-cover"
                      loading="lazy"
                    />
                  </div>
                );
              }
              const paragraph = post.body[i];
              if (paragraph.startsWith("- ")) {
                // Collect consecutive bullet items
                const bullets: string[] = [];
                while (i < post.body.length && post.body[i].startsWith("- ")) {
                  bullets.push(post.body[i].slice(2));
                  i++;
                }
                elements.push(
                  <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1 text-sm leading-7">
                    {bullets.map((b, bi) => (
                      <li key={bi}>{b}</li>
                    ))}
                  </ul>
                );
              } else if (isSubheading(paragraph)) {
                elements.push(
                  <h2 key={i} className="text-base font-bold text-foreground mt-6 mb-1 leading-snug">
                    {paragraph}
                  </h2>
                );
                i++;
              } else {
                elements.push(
                  <p key={i} className="text-sm leading-7">{paragraph}</p>
                );
                i++;
              }
            }
            return elements;
          })()}
        </div>

        {/* Footer CTA */}
        <div className="rounded-lg border border-border/50 bg-muted/20 p-5 space-y-3 mt-8">
          <p className="text-sm font-medium text-foreground">Ready to protect your inbox?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ghist gives you a free temporary email address instantly — no sign-up, no tracking.
            Auto-deleted after 24 hours.
          </p>
          <Link href="/">
            <Button size="sm" className="mt-1" data-testid="button-try-ghist">
              Try Ghist for free →
            </Button>
          </Link>
        </div>

        {/* Related posts nav */}
        <div className="pt-2 border-t border-border/40">
          <Link
            href="/blog"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            data-testid="link-all-posts"
          >
            ← {t(locale, "blog.all_posts")}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
