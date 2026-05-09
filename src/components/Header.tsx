import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-glow transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold">Review Booster</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              AI · бонусы за отзывы
            </div>
          </div>
        </Link>
        <Link
          to="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Каталог
        </Link>
      </div>
    </header>
  );
}
