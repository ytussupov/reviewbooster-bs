-- Reviewers stats table for gamification
CREATE TABLE public.reviewers (
  name_key text PRIMARY KEY,
  display_name text NOT NULL,
  total_points integer NOT NULL DEFAULT 0,
  reviews_count integer NOT NULL DEFAULT 0,
  total_bonus integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_review_date date,
  best_quality integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviewers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviewers public readable"
  ON public.reviewers FOR SELECT
  USING (true);

-- No insert/update/delete policies: trigger runs as definer

-- Add reviewer key column on reviews for joining
ALTER TABLE public.reviews ADD COLUMN reviewer_key text;

CREATE INDEX idx_reviews_reviewer_key ON public.reviews(reviewer_key);
CREATE INDEX idx_reviewers_total_points ON public.reviewers(total_points DESC);

-- Trigger function: maintain reviewer aggregates + streak
CREATE OR REPLACE FUNCTION public.update_reviewer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k text;
  today date := (now() AT TIME ZONE 'UTC')::date;
  prev_date date;
  new_streak int;
BEGIN
  k := lower(trim(NEW.author_name));
  NEW.reviewer_key := k;

  SELECT last_review_date INTO prev_date FROM public.reviewers WHERE name_key = k;

  IF prev_date IS NULL THEN
    new_streak := 1;
  ELSIF prev_date = today THEN
    new_streak := COALESCE((SELECT current_streak FROM public.reviewers WHERE name_key = k), 1);
  ELSIF prev_date = today - 1 THEN
    new_streak := COALESCE((SELECT current_streak FROM public.reviewers WHERE name_key = k), 0) + 1;
  ELSE
    new_streak := 1;
  END IF;

  INSERT INTO public.reviewers (
    name_key, display_name, total_points, reviews_count, total_bonus,
    current_streak, longest_streak, last_review_date, best_quality
  ) VALUES (
    k, NEW.author_name, COALESCE(NEW.quality_score, 0), 1, COALESCE(NEW.bonus_amount, 0),
    new_streak, new_streak, today, COALESCE(NEW.quality_score, 0)
  )
  ON CONFLICT (name_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    total_points = public.reviewers.total_points + COALESCE(NEW.quality_score, 0),
    reviews_count = public.reviewers.reviews_count + 1,
    total_bonus = public.reviewers.total_bonus + COALESCE(NEW.bonus_amount, 0),
    current_streak = new_streak,
    longest_streak = GREATEST(public.reviewers.longest_streak, new_streak),
    last_review_date = today,
    best_quality = GREATEST(public.reviewers.best_quality, COALESCE(NEW.quality_score, 0)),
    updated_at = now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_update_reviewer_stats
BEFORE INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_reviewer_stats();

-- Backfill from existing reviews (in chronological order, so streaks compute correctly)
DO $$
DECLARE r record;
DECLARE k text;
DECLARE prev_date date;
DECLARE today_d date;
DECLARE new_streak int;
BEGIN
  FOR r IN SELECT * FROM public.reviews ORDER BY created_at ASC LOOP
    k := lower(trim(r.author_name));
    today_d := (r.created_at AT TIME ZONE 'UTC')::date;
    UPDATE public.reviews SET reviewer_key = k WHERE id = r.id;

    SELECT last_review_date INTO prev_date FROM public.reviewers WHERE name_key = k;
    IF prev_date IS NULL THEN
      new_streak := 1;
    ELSIF prev_date = today_d THEN
      new_streak := COALESCE((SELECT current_streak FROM public.reviewers WHERE name_key = k), 1);
    ELSIF prev_date = today_d - 1 THEN
      new_streak := COALESCE((SELECT current_streak FROM public.reviewers WHERE name_key = k), 0) + 1;
    ELSE
      new_streak := 1;
    END IF;

    INSERT INTO public.reviewers (
      name_key, display_name, total_points, reviews_count, total_bonus,
      current_streak, longest_streak, last_review_date, best_quality
    ) VALUES (
      k, r.author_name, COALESCE(r.quality_score, 0), 1, COALESCE(r.bonus_amount, 0),
      new_streak, new_streak, today_d, COALESCE(r.quality_score, 0)
    )
    ON CONFLICT (name_key) DO UPDATE SET
      total_points = public.reviewers.total_points + COALESCE(r.quality_score, 0),
      reviews_count = public.reviewers.reviews_count + 1,
      total_bonus = public.reviewers.total_bonus + COALESCE(r.bonus_amount, 0),
      current_streak = new_streak,
      longest_streak = GREATEST(public.reviewers.longest_streak, new_streak),
      last_review_date = today_d,
      best_quality = GREATEST(public.reviewers.best_quality, COALESCE(r.quality_score, 0)),
      updated_at = now();
  END LOOP;
END $$;