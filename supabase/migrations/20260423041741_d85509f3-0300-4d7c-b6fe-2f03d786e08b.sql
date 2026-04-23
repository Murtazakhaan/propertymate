
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  status text not null default 'active',
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription"
  on public.subscriptions for select
  to authenticated
  using (user_id = auth.uid());

create trigger set_updated_at before update on public.subscriptions
  for each row execute function public.update_updated_at_column();
