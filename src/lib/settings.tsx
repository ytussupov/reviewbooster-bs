import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Currency = "RUB" | "USD" | "EUR" | "CNY" | "KZT";
export type Language = "ru" | "kk" | "en";

export const CURRENCIES: Record<Currency, { symbol: string; rate: number; label: string }> = {
  RUB: { symbol: "₽", rate: 1, label: "Рубли" },
  USD: { symbol: "$", rate: 0.011, label: "Доллары" },
  EUR: { symbol: "€", rate: 0.0095, label: "Евро" },
  CNY: { symbol: "¥", rate: 0.079, label: "Юани" },
  KZT: { symbol: "₸", rate: 5.6, label: "Тенге" },
};

export const LANGUAGES: Record<Language, string> = {
  ru: "Русский",
  kk: "Қазақша",
  en: "English",
};

type Dict = Record<string, Record<Language, string>>;

const T: Dict = {
  catalog: { ru: "Каталог", kk: "Каталог", en: "Catalog" },
  brand_tagline: { ru: "AI · бонусы за отзывы", kk: "AI · пікір үшін бонустар", en: "AI · review bonuses" },
  hero_badge: { ru: "AI оценивает за 5 секунд", kk: "AI 5 секундта бағалайды", en: "AI rates in 5 seconds" },
  hero_title_1: { ru: "Бонусы за отзывы,", kk: "Пікір үшін бонустар,", en: "Bonuses for reviews" },
  hero_title_2: { ru: "которые правда полезны", kk: "шынымен пайдалы", en: "that are truly useful" },
  hero_sub: {
    ru: "Подробнее, конкретнее, конструктивнее — больше бонус. Никаких модераторов, всё считает искусственный интеллект.",
    kk: "Толығырақ, нақтырақ, сындарлырақ — бонус көбірек. Модераторсыз, барлығын жасанды интеллект есептейді.",
    en: "More detailed, specific, constructive — bigger bonus. No moderators, AI does it all.",
  },
  badge_ai_check: { ru: "AI-проверка", kk: "AI-тексеру", en: "AI check" },
  badge_coupon: { ru: "купон сразу", kk: "бірден купон", en: "instant coupon" },
  badge_no_mod: { ru: "автоматически", kk: "автоматты", en: "automatic" },
  badge_up_to: { ru: "до", kk: "дейін", en: "up to" },
  catalog_sub: {
    ru: "Выберите товар и оставьте отзыв — бонус прилетит сразу.",
    kk: "Тауарды таңдап, пікір қалдырыңыз — бонус бірден келеді.",
    en: "Pick a product and leave a review — your bonus arrives instantly.",
  },
  empty_products: { ru: "Пока нет товаров. Добавьте первый!", kk: "Әзірге тауарлар жоқ. Бірінші қосыңыз!", en: "No products yet. Add the first one!" },
  leave_review: { ru: "Оставить отзыв →", kk: "Пікір қалдыру →", en: "Leave a review →" },
  footer: { ru: "Review Booster · бонусы за честные отзывы", kk: "Review Booster · адал пікірлер үшін бонустар", en: "Review Booster · bonuses for honest reviews" },
  add_product: { ru: "Добавить товар", kk: "Тауар қосу", en: "Add product" },
  new_product: { ru: "Новый товар", kk: "Жаңа тауар", en: "New product" },
  name_required: { ru: "Название *", kk: "Атауы *", en: "Name *" },
  name_ph: { ru: "Например, Кроссовки Atlas Pro", kk: "Мысалы, Atlas Pro кроссовкалары", en: "e.g. Atlas Pro Sneakers" },
  description: { ru: "Описание", kk: "Сипаттамасы", en: "Description" },
  desc_ph: { ru: "Короткое описание товара", kk: "Тауардың қысқаша сипаттамасы", en: "Short product description" },
  image_link: { ru: "Ссылка на картинку", kk: "Сурет сілтемесі", en: "Image link" },
  adding: { ru: "Добавляю...", kk: "Қосылуда...", en: "Adding..." },
  add: { ru: "Добавить", kk: "Қосу", en: "Add" },
  enter_name: { ru: "Укажите название товара", kk: "Тауар атауын енгізіңіз", en: "Enter product name" },
  product_added: { ru: "Товар добавлен", kk: "Тауар қосылды", en: "Product added" },
  product_add_fail: { ru: "Не удалось добавить товар", kk: "Тауарды қосу мүмкін болмады", en: "Could not add product" },
  product_not_found: { ru: "Товар не найден", kk: "Тауар табылмады", en: "Product not found" },
  to_catalog: { ru: "← В каталог", kk: "← Каталогқа", en: "← To catalog" },
  back_catalog: { ru: "К каталогу", kk: "Каталогқа", en: "To catalog" },
  reviews: { ru: "Отзывы", kk: "Пікірлер", en: "Reviews" },
  reviews_count: { ru: "отзыв(ов)", kk: "пікір", en: "review(s)" },
  no_reviews: {
    ru: "Пока никто не оставлял отзыв. Будьте первым и получите бонус!",
    kk: "Әзірге ешкім пікір қалдырмаған. Бірінші болыңыз және бонус алыңыз!",
    en: "No reviews yet. Be the first and earn a bonus!",
  },
  review_title: { ru: "Оставить отзыв", kk: "Пікір қалдыру", en: "Leave a review" },
  review_sub: {
    ru: "Чем подробнее и конструктивнее — тем больше бонус. AI оценит за 5 секунд.",
    kk: "Неғұрлым толық әрі сындарлы — бонус соғұрлым көп. AI 5 секундта бағалайды.",
    en: "The more detailed and constructive — the bigger the bonus. AI rates in 5 seconds.",
  },
  your_name: { ru: "Ваше имя", kk: "Сіздің атыңыз", en: "Your name" },
  your_name_ph: { ru: "Анна", kk: "Айгүл", en: "Anna" },
  review_label: { ru: "Отзыв", kk: "Пікір", en: "Review" },
  review_ph: {
    ru: "Опишите впечатления, плюсы, минусы, кому подойдёт...",
    kk: "Әсерлерді, артықшылықтары мен кемшіліктерін, кімге сай келетінін жазыңыз...",
    en: "Share impressions, pros, cons, who it suits...",
  },
  ai_checking: { ru: "AI проверяет...", kk: "AI тексеруде...", en: "AI checking..." },
  send_get_bonus: { ru: "Отправить и получить бонус", kk: "Жіберіп бонус алу", en: "Submit and get bonus" },
  err_name: { ru: "Укажите имя", kk: "Атыңызды енгізіңіз", en: "Enter your name" },
  err_short: { ru: "Отзыв слишком короткий (мин. 10 символов)", kk: "Пікір тым қысқа (мин. 10 таңба)", en: "Review too short (min. 10 chars)" },
  net_err: { ru: "Сетевая ошибка", kk: "Желі қатесі", en: "Network error" },
  your_bonus: { ru: "Ваш бонус", kk: "Сіздің бонусыңыз", en: "Your bonus" },
  review_accepted: { ru: "Отзыв принят", kk: "Пікір қабылданды", en: "Review accepted" },
  no_bonus_hint: {
    ru: "В этот раз без бонуса — попробуйте подробнее в следующий раз",
    kk: "Бұл жолы бонуссыз — келесі жолы толығырақ жазып көріңіз",
    en: "No bonus this time — try a more detailed review next time",
  },
  quality: { ru: "Качество", kk: "Сапа", en: "Quality" },
  tone: { ru: "Тональность", kk: "Реңк", en: "Tone" },
  ai_comment: { ru: "AI-комментарий", kk: "AI-түсіндірме", en: "AI comment" },
  one_more: { ru: "Оставить ещё один", kk: "Тағы біреуін қалдыру", en: "Leave another" },
  language: { ru: "Язык", kk: "Тіл", en: "Language" },
  currency: { ru: "Валюта", kk: "Валюта", en: "Currency" },
};

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: keyof typeof T) => string;
  formatBonus: (rub: number) => string;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("RUB");
  const [language, setLanguageState] = useState<Language>("ru");

  useEffect(() => {
    const c = localStorage.getItem("rb_currency") as Currency | null;
    const l = localStorage.getItem("rb_language") as Language | null;
    if (c && CURRENCIES[c]) setCurrencyState(c);
    if (l && LANGUAGES[l]) setLanguageState(l);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("rb_currency", c);
  };
  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem("rb_language", l);
  };

  const t = (key: keyof typeof T) => T[key]?.[language] ?? String(key);

  const formatBonus = (rub: number) => {
    const { symbol, rate } = CURRENCIES[currency];
    const v = rub * rate;
    const rounded = currency === "KZT" ? Math.round(v) : currency === "RUB" ? Math.round(v) : Math.round(v * 100) / 100;
    return `${rounded}\u00A0${symbol}`;
  };

  return (
    <SettingsContext.Provider value={{ currency, setCurrency, language, setLanguage, t, formatBonus }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
