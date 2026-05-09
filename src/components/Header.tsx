import { Link } from "@tanstack/react-router";
import { Sparkles, Trophy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings, CURRENCIES, LANGUAGES, Currency, Language } from "@/lib/settings";

export function Header() {
  const { currency, setCurrency, language, setLanguage, t } = useSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 group min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-hero shadow-glow transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-display text-lg font-bold truncate">Review Booster</div>
            <div className="hidden sm:block text-[10px] uppercase tracking-widest text-muted-foreground truncate">
              {t("brand_tagline")}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/leaderboard"
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-accent transition-colors"
            aria-label="Лидерборд"
          >
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Топ</span>
          </Link>
          <Link
            to="/leaderboard"
            className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card hover:bg-accent transition-colors"
            aria-label="Лидерборд"
          >
            <Trophy className="h-4 w-4 text-amber-500" />
          </Link>
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger className="h-9 w-[88px] sm:w-[120px]" aria-label={t("language")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(LANGUAGES) as Language[]).map((l) => (
                <SelectItem key={l} value={l}>
                  <span className="mr-1 uppercase text-xs text-muted-foreground">{l}</span>
                  <span className="hidden sm:inline">{LANGUAGES[l]}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger className="h-9 w-[80px] sm:w-[110px]" aria-label={t("currency")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CURRENCIES) as Currency[]).map((c) => (
                <SelectItem key={c} value={c}>
                  <span className="mr-1">{CURRENCIES[c].symbol}</span>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
