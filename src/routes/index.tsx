import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { AddProductDialog } from "@/components/AddProductDialog";
import { Sparkles, Gift, Zap, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Review Booster — бонусы за отзывы с AI-проверкой" },
      {
        name: "description",
        content:
          "Получайте мгновенные бонусы за качественные отзывы. AI оценивает полезность за 5 секунд.",
      },
    ],
  }),
});

type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px, 90px 90px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center text-primary-foreground">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest backdrop-blur">
            <Sparkles className="h-3 w-3" /> AI оценивает за 5 секунд
          </div>
          <h1 className="mx-auto max-w-3xl font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
            Бонусы за отзывы,
            <br />
            которые правда полезны
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg opacity-90">
            Подробнее, конкретнее, конструктивнее — больше бонус. Никаких модераторов,
            всё считает искусственный интеллект.
          </p>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Zap, t: "5 сек", s: "AI-проверка" },
              { icon: Gift, t: "до 1000 ₽", s: "купон сразу" },
              { icon: MessageSquare, t: "0 модерации", s: "автоматически" },
            ].map((b) => (
              <div
                key={b.t}
                className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"
              >
                <b.icon className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-display text-xl font-bold">{b.t}</div>
                  <div className="text-xs uppercase tracking-widest opacity-80">
                    {b.s}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold">Каталог</h2>
            <p className="text-muted-foreground">
              Выберите товар и оставьте отзыв — бонус прилетит сразу.
            </p>
          </div>
          <AddProductDialog onCreated={load} />
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-3xl bg-muted"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">
              Пока нет товаров. Добавьте первый!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                to="/products/$productId"
                params={{ productId: p.id }}
                className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-card">
                      <Sparkles className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold">{p.name}</h3>
                  {p.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {p.description}
                    </p>
                  )}
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Оставить отзыв →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Review Booster · бонусы за честные отзывы
      </footer>
    </div>
  );
}
