import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blogPosts, getBlogCategories } from "@/lib/blogData";
import { useState } from "react";
import { useLocale, t } from "@/lib/i18n";

// Fallback gradient backgrounds per category when no hero image exists
const CATEGORY_FALLBACK: Record<string, string> = {
  "Privacy":     "from-slate-700 to-slate-900",
  "Travel":      "from-sky-700 to-blue-900",
  "Productivity":"from-violet-700 to-purple-900",
  "Research":    "from-emerald-700 to-teal-900",
  "Security":    "from-rose-700 to-red-900",
  "Gaming":      "from-orange-700 to-amber-900",
};
const DEFAULT_FALLBACK = "from-neutral-600 to-neutral-900";

function categoryGradient(category: string) {
  return CATEGORY_FALLBACK[category] ?? DEFAULT_FALLBACK;
}

export default function Blog() {
  const locale = useLocale();
  const categories = getBlogCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? blogPosts.filter((p) => p.category === activeCategory)
    : blogPosts;

  const [featured, ...rest] = filtered;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button size="icon" variant="ghost" aria-label="Back to home" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">{t(locale, "blog.title")}</h1>
        </div>

        {/* ── Category filter ── */}
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

        {/* ── Post layout ── */}
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No articles in this category yet.</p>
        ) : (
          <div className="space-y-8" data-testid="blog-post-list">

            {/* ── Featured (first) post — full-width hero card ── */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                data-testid={`blog-post-${featured.slug}`}
                className="group block no-underline"
              >
                <article className="rounded-2xl overflow-hidden border border-border/40 bg-card hover:border-border transition-colors">
                  {/* Hero image — 16:9 */}
                  <div className="relative w-full aspect-video overflow-hidden">
                    {featured.heroImage ? (
                      <img
                        src={featured.heroImage}
                        alt={featured.heroAlt ?? featured.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        loading="eager"
                        fetchPriority="high"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${categoryGradient(featured.category)}`} aria-hidden="true" />
                    )}
                    {/* Category badge overlaid */}
                    <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-foreground border border-border/30">
                      {featured.category}
                    </span>
                  </div>
                  {/* Text content */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug group-hover:text-foreground/80 transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-4 pt-1">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                        <Clock className="w-3 h-3" />
                        {featured.readTime}
                      </span>
                      <span className="text-xs text-muted-foreground/50">
                        {new Date(featured.publishDate).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* ── Remaining posts — responsive 2-col grid ── */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rest.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    data-testid={`blog-post-${post.slug}`}
                    className="group block no-underline"
                  >
                    <article className="rounded-xl overflow-hidden border border-border/40 bg-card hover:border-border transition-colors h-full flex flex-col">
                      {/* Image — fixed aspect */}
                      <div className="relative w-full aspect-[16/9] overflow-hidden flex-shrink-0">
                        {post.heroImage ? (
                          <img
                            src={post.heroImage}
                            alt={post.heroAlt ?? post.title}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${categoryGradient(post.category)}`} aria-hidden="true" />
                        )}
                        <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground border border-border/30">
                          {post.category}
                        </span>
                      </div>
                      {/* Text */}
                      <div className="p-4 flex-1 flex flex-col space-y-2">
                        <h2 className="text-sm font-semibold text-foreground leading-snug group-hover:text-foreground/80 transition-colors line-clamp-2 flex-1">
                          {post.title}
                        </h2>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                          <span className="text-xs text-muted-foreground/40">
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
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
