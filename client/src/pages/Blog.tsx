import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogPosts, getBlogCategories } from "@/lib/blogData";
import { useState } from "react";
import { useLocale, t } from "@/lib/i18n";

export default function Blog() {
  const locale = useLocale();
  const categories = getBlogCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? blogPosts.filter((p) => p.category === activeCategory)
    : blogPosts;

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
          <h1 className="text-xl font-semibold tracking-tight">{t(locale, "blog.title")}</h1>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap" data-testid="blog-categories">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === null
                ? "bg-foreground text-background border-foreground"
                : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
            }`}
            data-testid="category-all"
          >
            {t(locale, "blog.all_posts")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat
                  ? "bg-foreground text-background border-foreground"
                  : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
              data-testid={`category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Post list */}
        <div className="space-y-3" data-testid="blog-post-list">
          {filtered.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} data-testid={`blog-post-${post.slug}`}>
              <article className="group rounded-lg border border-border/50 bg-card/30 hover:bg-card/60 hover:border-border p-5 transition-all cursor-pointer">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-sm font-semibold text-foreground leading-snug group-hover:text-foreground/90 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground flex-shrink-0 mt-0.5 transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {post.metaDescription}
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                      <Clock className="w-3 h-3" />
                      {post.readingTime}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                      <Tag className="w-3 h-3" />
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground/50">
                      {new Date(post.publishDate).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
