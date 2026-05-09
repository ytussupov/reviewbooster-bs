import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles, Gift, Copy, Check } from "lucide-react";

type EvalReview = {
  id: string;
  quality_score: number;
  rating: number;
  bonus_amount: number;
  coupon_code: string | null;
  ai_feedback: string;
};

export function ReviewForm({
  productId,
  productName,
  onSubmitted,
}: {
  productId: string;
  productName: string;
  onSubmitted: () => void;
}) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalReview | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2) return toast.error("Укажите имя");
    if (content.trim().length < 10)
      return toast.error("Отзыв слишком короткий (мин. 10 символов)");
    setLoading(true);
    try {
      const res = await fetch("/api/public/evaluate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          author_name: name,
          content,
          product_name: productName,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error || "Ошибка");
        return;
      }
      const r = json.review;
      setResult({
        id: r.id,
        quality_score: r.quality_score,
        rating: r.rating,
        bonus_amount: r.bonus_amount,
        coupon_code: r.coupon_code,
        ai_feedback: r.ai_feedback,
      });
      setName("");
      setContent("");
      onSubmitted();
    } catch (e) {
      toast.error("Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const win = result.bonus_amount > 0;
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div
          className={`rounded-2xl p-6 text-center ${
            win
              ? "bg-gradient-coupon text-primary-foreground shadow-glow"
              : "bg-muted text-foreground"
          }`}
        >
          {win ? (
            <>
              <Gift className="mx-auto mb-3 h-10 w-10" />
              <div className="text-sm uppercase tracking-widest opacity-90">
                Ваш бонус
              </div>
              <div className="font-display text-5xl font-bold">
                {result.bonus_amount} ₽
              </div>
              {result.coupon_code && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.coupon_code!);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-background/20 px-4 py-2 font-mono text-sm backdrop-blur transition hover:bg-background/30"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {result.coupon_code}
                </button>
              )}
            </>
          ) : (
            <>
              <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <div className="font-display text-2xl font-bold">
                Отзыв принят
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                В этот раз без бонуса — попробуйте подробнее в следующий раз
              </div>
            </>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-muted/60 p-3">
            <div className="text-xs uppercase text-muted-foreground">
              Качество
            </div>
            <div className="font-display text-2xl font-bold">
              {result.quality_score}/100
            </div>
          </div>
          <div className="rounded-xl bg-muted/60 p-3">
            <div className="text-xs uppercase text-muted-foreground">
              Тональность
            </div>
            <div className="font-display text-2xl font-bold">
              {"★".repeat(result.rating)}
              <span className="text-muted-foreground/40">
                {"★".repeat(5 - result.rating)}
              </span>
            </div>
          </div>
        </div>

        {result.ai_feedback && (
          <div className="mt-4 rounded-xl border border-border bg-background p-4 text-sm">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" /> AI-комментарий
            </div>
            {result.ai_feedback}
          </div>
        )}

        <Button
          variant="outline"
          className="mt-5 w-full"
          onClick={() => setResult(null)}
        >
          Оставить ещё один
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h3 className="font-display text-xl font-bold">Оставить отзыв</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Чем подробнее и конструктивнее — тем больше бонус. AI оценит за 5 секунд.
      </p>
      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rname">Ваше имя</Label>
          <Input
            id="rname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Анна"
            maxLength={60}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rcontent">Отзыв</Label>
          <Textarea
            id="rcontent"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Опишите впечатления, плюсы, минусы, кому подойдёт..."
            maxLength={2000}
          />
          <div className="text-right text-xs text-muted-foreground">
            {content.length}/2000
          </div>
        </div>
        <Button
          onClick={submit}
          disabled={loading}
          size="lg"
          className="w-full bg-gradient-hero shadow-glow hover:opacity-95"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> AI проверяет...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Отправить и получить бонус
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
