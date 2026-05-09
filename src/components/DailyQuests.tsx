import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/lib/settings";
import { getDailyQuests, Quest } from "@/lib/gamification";
import { Check } from "lucide-react";

export function DailyQuests() {
  const { playerName } = useSettings();
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    if (!playerName) {
      setQuests(getDailyQuests([], new Set()));
      return;
    }
    const key = playerName.trim().toLowerCase();
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    Promise.all([
      supabase
        .from("reviews")
        .select("quality_score, product_id, bonus_amount")
        .eq("reviewer_key", key)
        .gte("created_at", startOfDay.toISOString()),
      supabase
        .from("reviews")
        .select("product_id")
        .eq("reviewer_key", key),
    ]).then(([today, all]) => {
      const reviewed = new Set<string>();
      (all.data || []).forEach((r: any) => reviewed.add(r.product_id));
      setQuests(getDailyQuests((today.data as any) || [], reviewed));
    });
  }, [playerName]);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">Ежедневные задания</h3>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {quests.filter((q) => q.done).length}/{quests.length}
        </span>
      </div>
      <div className="space-y-2.5">
        {quests.map((q) => (
          <div
            key={q.id}
            className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
              q.done
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-background"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                q.done
                  ? "bg-gradient-coupon text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {q.done ? <Check className="h-5 w-5" /> : <q.Icon className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">{q.title}</div>
                <div className="shrink-0 text-xs font-bold text-primary">+{q.reward} очков</div>
              </div>
              <div className="text-xs text-muted-foreground">{q.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
