import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles, Gift, Copy, Check } from "lucide-react";
import { useSettings } from "@/lib/settings";

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
  const { t, language, formatBonus, playerName, setPlayerName } = useSettings();
  const [name, setName] = useState(playerName);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalReview | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2) return toast.error(t("err_name"));
    if (content.trim().length < 10) return toast.error(t("err_short"));
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
          language,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error || "Error");
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
      setPlayerName(name.trim());
      if (r.quality_score >= 90) toast.success(`🏆 +${r.quality_score} очков! Перфекционист!`);
      else if (r.bonus_amount > 0) toast.success(`+${r.quality_score} очков и бонус!`);
      setContent("");
      onSubmitted();
    } catch (e) {
      toast.error(t("net_err"));
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
                {t("your_bonus")}
              </div>
              <div className="font-display text-5xl font-bold">
                {formatBonus(result.bonus_amount)}
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
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {result.coupon_code}
                </button>
              )}
            </>
          ) : (
            <>
              <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <div className="font-display text-2xl font-bold">{t("review_accepted")}</div>
              <div className="mt-1 text-sm text-muted-foreground">{t("no_bonus_hint")}</div>
            </>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-muted/60 p-3">
            <div className="text-xs uppercase text-muted-foreground">{t("quality")}</div>
            <div className="font-display text-2xl font-bold">{result.quality_score}/100</div>
          </div>
          <div className="rounded-xl bg-muted/60 p-3">
            <div className="text-xs uppercase text-muted-foreground">{t("tone")}</div>
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
              <Sparkles className="h-3 w-3" /> {t("ai_comment")}
            </div>
            {result.ai_feedback}
          </div>
        )}

        <Button variant="outline" className="mt-5 w-full" onClick={() => setResult(null)}>
          {t("one_more")}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h3 className="font-display text-xl font-bold">{t("review_title")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("review_sub")}</p>
      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rname">{t("your_name")}</Label>
          <Input
            id="rname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("your_name_ph")}
            maxLength={60}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rcontent">{t("review_label")}</Label>
          <Textarea
            id="rcontent"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("review_ph")}
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
              <Loader2 className="h-4 w-4 animate-spin" /> {t("ai_checking")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> {t("send_get_bonus")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
