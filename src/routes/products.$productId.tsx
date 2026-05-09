import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ReviewForm } from "@/components/ReviewForm";
import { ArrowLeft, Sparkles, Star } from "lucide-react";

export const Route = createFileRoute("/products/$productId")({
  component: ProductPage,
});

type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

type Review = {
  id: string;
  author_name: string;
  content: string;
  rating: number | null;
  quality_score: number | null;
  bonus_amount: number;
  ai_feedback: string | null;
  created_at: string;
};

function ProductPage() {
  const { productId } = useParams({ from: "/products/$productId" });
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
  };

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();
    setProduct(data as Product | null);
    await loadReviews();
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [productId]);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="h-96 animate-pulse rounded-3xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Товар не найден</h1>
          <Link to="/" className="mt-4 inline-block text-primary">
            ← В каталог
          </Link>
        </div>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
      : 0;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> К каталогу
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <div className="aspect-[4/3] bg-muted">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-card">
                  <Sparkles className="h-16 w-16 text-primary/40" />
                </div>
              )}
            </div>
            <div className="p-6">
              <h1 className="font-display text-3xl font-bold">
                {product.name}
              </h1>
              {product.description && (
                <p className="mt-3 text-muted-foreground">
                  {product.description}
                </p>
              )}
              <div className="mt-5 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <= Math.round(avgRating)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  ))}
                  <span className="ml-1 font-semibold">
                    {avgRating ? avgRating.toFixed(1) : "—"}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  {reviews.length} отзыв(ов)
                </div>
              </div>
            </div>
          </div>

          <ReviewForm
            productId={product.id}
            productName={product.name}
            onSubmitted={loadReviews}
          />
        </div>

        <section className="mt-14">
          <h2 className="mb-5 font-display text-2xl font-bold">
            Отзывы ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Пока никто не оставлял отзыв. Будьте первым и получите бонус!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero font-display text-sm font-bold text-primary-foreground">
                        {r.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{r.author_name}</div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i <= (r.rating || 0)
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.bonus_amount > 0 && (
                        <span className="rounded-full bg-gradient-coupon px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow">
                          +{r.bonus_amount} ₽
                        </span>
                      )}
                      <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                        AI {r.quality_score ?? "—"}/100
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm">
                    {r.content}
                  </p>
                  {r.ai_feedback && (
                    <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">AI: </span>
                      {r.ai_feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
