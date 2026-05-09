import { Trophy, Crown, Star, Sparkles, Flame, Award, Zap, Target, Gem } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Level = {
  id: "novice" | "expert" | "top" | "legend";
  name: string;
  min: number;
  color: string;
  Icon: LucideIcon;
};

export const LEVELS: Level[] = [
  { id: "novice", name: "Новичок",      min: 0,    color: "from-slate-400 to-slate-600",   Icon: Sparkles },
  { id: "expert", name: "Эксперт",      min: 200,  color: "from-sky-400 to-indigo-600",    Icon: Star },
  { id: "top",    name: "Top Reviewer", min: 800,  color: "from-amber-400 to-orange-600",  Icon: Trophy },
  { id: "legend", name: "Legend",       min: 2000, color: "from-fuchsia-500 to-rose-600",  Icon: Crown },
];

export function getLevel(points: number): { current: Level; next: Level | null; progress: number } {
  let current = LEVELS[0];
  for (const l of LEVELS) if (points >= l.min) current = l;
  const idx = LEVELS.indexOf(current);
  const next = LEVELS[idx + 1] || null;
  const progress = next ? Math.min(100, ((points - current.min) / (next.min - current.min)) * 100) : 100;
  return { current, next, progress };
}

export type Badge = {
  id: string;
  name: string;
  description: string;
  Icon: LucideIcon;
  color: string;
  earned: boolean;
};

export type ReviewerStats = {
  total_points: number;
  reviews_count: number;
  total_bonus: number;
  current_streak: number;
  longest_streak: number;
  best_quality: number;
};

export function getBadges(s: ReviewerStats): Badge[] {
  return [
    { id: "first",      name: "Первый шаг",   description: "Первый отзыв",          Icon: Sparkles, color: "bg-sky-500",     earned: s.reviews_count >= 1 },
    { id: "streak3",    name: "На волне",     description: "Серия 3 дня",            Icon: Flame,    color: "bg-orange-500",  earned: s.longest_streak >= 3 },
    { id: "streak7",    name: "Неделя огня",  description: "Серия 7 дней",           Icon: Flame,    color: "bg-rose-500",    earned: s.longest_streak >= 7 },
    { id: "perfect",    name: "Перфекционист",description: "Отзыв на 90+",           Icon: Award,    color: "bg-amber-500",   earned: s.best_quality >= 90 },
    { id: "prolific",   name: "Графоман",     description: "10 отзывов",             Icon: Zap,      color: "bg-violet-500",  earned: s.reviews_count >= 10 },
    { id: "hunter",     name: "Охотник за бонусами", description: "2000 ₽ бонусов",  Icon: Gem,      color: "bg-emerald-500", earned: s.total_bonus >= 2000 },
    { id: "expert",     name: "Эксперт",      description: "200 очков",              Icon: Star,     color: "bg-indigo-500",  earned: s.total_points >= 200 },
    { id: "legend",     name: "Легенда",      description: "2000 очков",             Icon: Crown,    color: "bg-fuchsia-600", earned: s.total_points >= 2000 },
  ];
}

export type Quest = {
  id: string;
  title: string;
  description: string;
  reward: number;
  Icon: LucideIcon;
  done: boolean;
  progress: number;
  target: number;
};

type TodayReview = { quality_score: number | null; product_id: string; bonus_amount: number };

export function getDailyQuests(today: TodayReview[], allReviewedProductIds: Set<string>): Quest[] {
  const reviewsToday = today.length;
  const high = today.filter((r) => (r.quality_score ?? 0) >= 70).length;
  const newProducts = today.filter((r) => {
    // Was it a new product (only reviewed today by user)?
    return Array.from(allReviewedProductIds).filter((id) => id === r.product_id).length === 1;
  }).length;

  return [
    {
      id: "daily_one",
      title: "Ежедневный отзыв",
      description: "Оставьте 1 отзыв сегодня",
      reward: 50,
      Icon: Target,
      progress: Math.min(1, reviewsToday),
      target: 1,
      done: reviewsToday >= 1,
    },
    {
      id: "quality_70",
      title: "Качество 70+",
      description: "Получите оценку 70+ от AI",
      reward: 100,
      Icon: Star,
      progress: Math.min(1, high),
      target: 1,
      done: high >= 1,
    },
    {
      id: "explorer",
      title: "Исследователь",
      description: "Отзыв на новый для вас товар",
      reward: 75,
      Icon: Sparkles,
      progress: Math.min(1, newProducts),
      target: 1,
      done: newProducts >= 1,
    },
  ];
}
