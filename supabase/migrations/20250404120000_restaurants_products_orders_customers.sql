-- Cardápio digital: restaurantes, produtos, pedidos e clientes (todos com restaurant_id)
-- Execute no SQL Editor do Supabase ou via CLI: supabase db push

create table if not exists public.restaurants (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  category text not null default 'outros',
  name text not null,
  description text not null default '',
  price numeric(12, 2) not null,
  image_url text not null default '',
  video_url text,
  ingredients jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_restaurant_id_idx on public.products (restaurant_id);

create table if not exists public.orders (
  id text primary key,
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  created_at timestamptz not null default now(),
  status text not null,
  payment_type text not null,
  fulfillment_type text not null,
  customer_name text not null default '',
  customer_phone text not null default '',
  items jsonb not null default '[]'::jsonb,
  total numeric(12, 2) not null default 0,
  constraint orders_status_check check (
    status in ('pending', 'preparing', 'completed')
  ),
  constraint orders_payment_check check (
    payment_type in ('cash', 'pix', 'card')
  ),
  constraint orders_fulfillment_check check (
    fulfillment_type in ('table', 'delivery', 'pickup')
  )
);

create index if not exists orders_restaurant_id_idx on public.orders (restaurant_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

create table if not exists public.customers (
  id text primary key,
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  name text not null,
  address text not null default '',
  phone text not null default '',
  birth_date date
);

create index if not exists customers_restaurant_id_idx on public.customers (restaurant_id);

alter table public.restaurants enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;

-- MVP: acesso total com anon key (substitua por políticas com auth.jwt() em produção)
create policy "restaurants_anon_all" on public.restaurants for all to anon using (true) with check (true);
create policy "restaurants_auth_all" on public.restaurants for all to authenticated using (true) with check (true);

create policy "products_anon_all" on public.products for all to anon using (true) with check (true);
create policy "products_auth_all" on public.products for all to authenticated using (true) with check (true);

create policy "orders_anon_all" on public.orders for all to anon using (true) with check (true);
create policy "orders_auth_all" on public.orders for all to authenticated using (true) with check (true);

create policy "customers_anon_all" on public.customers for all to anon using (true) with check (true);
create policy "customers_auth_all" on public.customers for all to authenticated using (true) with check (true);

-- Realtime: pedidos
alter publication supabase_realtime add table public.orders;

comment on table public.restaurants is 'SaaS: um registro por restaurante (id = slug)';
comment on column public.products.restaurant_id is 'FK → restaurants.id';
comment on column public.orders.restaurant_id is 'FK → restaurants.id';
comment on column public.customers.restaurant_id is 'FK → restaurants.id';
