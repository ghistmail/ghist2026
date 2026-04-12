import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link, useParams } from "wouter";
import { ArrowLeft, Clock, Tag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug } from "@/lib/blogData";
import { useLocale, t } from "@/lib/i18n";

export default function BlogPost() {
  const locale = useLocale();
  const params = useParams<{ slug: string }>();
  const post = getBlogPostBySlug(params.slug ?? "");

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

        {/* Post body */}
        <div
          className="space-y-4 text-sm text-muted-foreground leading-relaxed"
          data-testid="blog-post-body"
        >
          {post.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
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
