import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { getLevel } from "@/lib/gamification";
import { useSettings } from "@/lib/settings";
import { Trophy, Crown, Medal, Flame, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
  head: () => ({
    meta: [{ title: "Лидерборд — Review Booster" }],
  }),
});

type Row = {
  name_key: string;
  display_name: string;
  total_points: number;
  reviews_count: number;
  total_bonus: number;
  current_streak: number;
  longest_streak: number;
};

function LeaderboardPage() {
  const { playerName, formatBonus } = useSettings();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("reviewers")
      .select("name_key, display_name, total_points, reviews_count, total_bonus, current_streak, longest_streak")
      .order("total_points", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setRows((data as Row[]) || []);
        setLoading(false);
      });
  }, []);

  const myKey = playerName.trim().toLowerCase();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Назад
        </Link>

        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-hero p-8 text-center text-primary-foreground shadow-glow">
          <Trophy className="mx-auto mb-3 h-10 w-10" />
          <h1 className="font-display text-4xl font-bold">Лидерборд</h1>
          <p className="mt-1 opacity-90">Топ ревьюеров по очкам качества</p>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Пока никого нет. Будьте первым!
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r, i) => {
              const lvl = getLevel(r.total_points).current;
              const isMe = myKey && r.name_key === myKey;
              const rankIcon =
                i === 0 ? <Crown className="h-5 w-5 text-amber-400" /> :
                i === 1 ? <Medal className="h-5 w-5 text-slate-400" /> :
                i === 2 ? <Medal className="h-5 w-5 text-amber-700" /> :
                <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>;
              return (
                <div
                  key={r.name_key}
                  className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
                    isMe
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center">{rankIcon}</div>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${lvl.color} text-white`}>
                    <lvl.Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold truncate">{r.display_name}</div>
                      {isMe && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                          Вы
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {lvl.name} · {r.reviews_count} отзыв(ов) · {formatBonus(r.total_bonus)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold">{r.total_points}</div>
                    <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      <Flame className="h-3 w-3" /> {r.current_streak}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
