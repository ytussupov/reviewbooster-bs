import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/lib/settings";
import { getLevel, getBadges, ReviewerStats } from "@/lib/gamification";
import { Flame, Trophy, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function PlayerCard() {
  const { playerName } = useSettings();
  const [stats, setStats] = useState<ReviewerStats | null>(null);

  useEffect(() => {
    if (!playerName) {
      setStats(null);
      return;
    }
    const key = playerName.trim().toLowerCase();
    supabase
      .from("reviewers")
      .select("total_points, reviews_count, total_bonus, current_streak, longest_streak, best_quality")
      .eq("name_key", key)
      .maybeSingle()
      .then(({ data }) => {
        setStats(
          (data as ReviewerStats) || {
            total_points: 0,
            reviews_count: 0,
            total_bonus: 0,
            current_streak: 0,
            longest_streak: 0,
            best_quality: 0,
          }
        );
      });
  }, [playerName]);

  if (!playerName) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center">
        <Sparkles className="mx-auto mb-2 h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground">
          Оставьте свой первый отзыв — и начните путь к статусу{" "}
          <span className="font-semibold text-foreground">Legend</span>.
        </p>
      </div>
    );
  }

  const s = stats || {
    total_points: 0, reviews_count: 0, total_bonus: 0,
    current_streak: 0, longest_streak: 0, best_quality: 0,
  };
  const { current, next, progress } = getLevel(s.total_points);
  const badges = getBadges(s);
  const earned = badges.filter((b) => b.earned);

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className={`bg-gradient-to-br ${current.color} p-6 text-white`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <current.Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-widest opacity-80">{current.name}</div>
              <div className="font-display text-xl font-bold truncate">{playerName}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold backdrop-blur">
            <Flame className="h-4 w-4" /> {s.current_streak}
          </div>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-xs opacity-90">
            <span>{s.total_points} очков</span>
            <span>{next ? `${next.min - s.total_points} до ${next.name}` : "MAX"}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-4 text-center text-xs">
        <Stat label="Отзывов" value={s.reviews_count} />
        <Stat label="Лучший" value={`${s.best_quality}/100`} />
        <Stat label="Серия макс" value={s.longest_streak} />
      </div>

      <div className="border-t border-border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Бейджи · {earned.length}/{badges.length}
          </div>
          <Link to="/leaderboard" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <Trophy className="h-3 w-3" /> Лидерборд
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <div
              key={b.id}
              title={`${b.name} — ${b.description}`}
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                b.earned ? `${b.color} text-white shadow-soft` : "bg-muted text-muted-foreground/40"
              }`}
            >
              <b.Icon className="h-4 w-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/60 p-2">
      <div className="font-display text-lg font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
