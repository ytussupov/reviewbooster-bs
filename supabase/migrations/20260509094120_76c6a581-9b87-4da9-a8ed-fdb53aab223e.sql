
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  author_name text not null,
  content text not null,
  rating int,
  quality_score int,
  bonus_amount int not null default 0,
  coupon_code text,
  ai_feedback text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.reviews enable row level security;

create policy "products are public readable" on public.products for select using (true);
create policy "anyone can insert products" on public.products for insert with check (true);

create policy "reviews are public readable" on public.reviews for select using (true);
create policy "anyone can insert reviews" on public.reviews for insert with check (true);

create index on public.reviews(product_id);

-- seed a few demo products
insert into public.products (name, description, image_url) values
('Беспроводные наушники Aurora', 'Премиальные наушники с активным шумоподавлением и 40 часами автономности.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'),
('Умные часы Pulse X', 'Спортивные смарт-часы с GPS, мониторингом сна и AMOLED-дисплеем.', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'),
('Кофемашина Brewmaster', 'Автоматическая кофемашина с 15 рецептами и встроенной кофемолкой.', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800');
