-- Schema SQL para o Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- Tabela de usuários (estendendo auth.users do Supabase)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  settings jsonb default '{}'::jsonb
);

-- Habilitar RLS (Row Level Security)
alter table public.users enable row level security;

-- Políticas de segurança para users
drop policy if exists "Users can view their own data" on public.users;
create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);

drop policy if exists "Users can update their own data" on public.users;
create policy "Users can update their own data" on public.users
  for update using (auth.uid() = id);

-- Tabela de contas bancárias
create table if not exists public.bank_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  bank_name text not null,
  account_number text,
  balance numeric(15, 2) default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bank_accounts enable row level security;

drop policy if exists "Users can manage their own bank accounts" on public.bank_accounts;
create policy "Users can manage their own bank accounts" on public.bank_accounts
  for all using (auth.uid() = user_id);

-- Tabela de Caixas de Planejamento (Budget Boxes)
create table if not exists public.budget_boxes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  percentage numeric(5, 2) not null check (percentage >= 0 and percentage <= 100),
  color text default '#6366f1',
  icon text default '📦',
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.budget_boxes enable row level security;

drop policy if exists "Users can manage their own budget boxes" on public.budget_boxes;
create policy "Users can manage their own budget boxes" on public.budget_boxes
  for all using (auth.uid() = user_id);

-- Tabela de categorias (atualizada com box_id)
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text default '#6366f1',
  icon text default '📁',
  parent_id uuid references public.categories(id) on delete set null,
  box_id uuid references public.budget_boxes(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

drop policy if exists "Users can manage their own categories" on public.categories;
create policy "Users can manage their own categories" on public.categories
  for all using (auth.uid() = user_id);

-- Tabela de transações
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  account_id uuid references public.bank_accounts(id) on delete set null,
  amount numeric(15, 2) not null,
  description text not null,
  category_id uuid references public.categories(id) on delete set null,
  date date not null,
  type text not null check (type in ('income', 'expense')),
  is_recurring boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

drop policy if exists "Users can manage their own transactions" on public.transactions;
create policy "Users can manage their own transactions" on public.transactions
  for all using (auth.uid() = user_id);

-- Índices para melhor performance
create index if not exists transactions_user_id_date_idx on public.transactions(user_id, date desc);
create index if not exists transactions_category_id_idx on public.transactions(category_id);

-- Tabela de orçamentos
create table if not exists public.budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  amount numeric(15, 2) not null,
  period text not null check (period in ('monthly', 'yearly')),
  spent_amount numeric(15, 2) default 0,
  alert_threshold numeric(3, 2) default 0.80,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.budgets enable row level security;

drop policy if exists "Users can manage their own budgets" on public.budgets;
create policy "Users can manage their own budgets" on public.budgets
  for all using (auth.uid() = user_id);

-- Tabela de metas
create table if not exists public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  target_amount numeric(15, 2) not null,
  current_amount numeric(15, 2) default 0 not null,
  target_date date not null,
  annual_interest_rate numeric(5, 2) default 0.00 check (annual_interest_rate >= 0 and annual_interest_rate <= 100),
  priority text check (priority in ('low', 'medium', 'high')),
  status text default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.goals enable row level security;

drop policy if exists "Users can manage their own goals" on public.goals;
create policy "Users can manage their own goals" on public.goals
  for all using (auth.uid() = user_id);

-- Tabela de investimentos
create table if not exists public.investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  symbol text not null,
  asset_type text not null check (asset_type in ('stock', 'fund', 'crypto', 'fixed_income', 'real_estate')),
  quantity numeric(15, 6) not null,
  avg_price numeric(15, 2) not null,
  current_price numeric(15, 2),
  broker text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.investments enable row level security;

drop policy if exists "Users can manage their own investments" on public.investments;
create policy "Users can manage their own investments" on public.investments
  for all using (auth.uid() = user_id);

-- Tabela de aportes para metas
create table if not exists public.goal_contributions (
  id uuid default uuid_generate_v4() primary key,
  goal_id uuid references public.goals(id) on delete cascade not null,
  amount numeric(15, 2) not null,
  date date not null,
  source_type text check (source_type in ('manual', 'transaction', 'investment')),
  source_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.goal_contributions enable row level security;

drop policy if exists "Users can manage contributions for their goals" on public.goal_contributions;
create policy "Users can manage contributions for their goals" on public.goal_contributions
  for all using (
    exists (
      select 1 from public.goals
      where goals.id = goal_contributions.goal_id
      and goals.user_id = auth.uid()
    )
  );

-- Função para criar caixas de planejamento padrão
create or replace function public.create_default_budget_boxes(user_id uuid)
returns void as $$
declare
  box_custos_fixos uuid;
  box_conforto uuid;
  box_metas uuid;
  box_prazeres uuid;
  box_liberdade uuid;
  box_conhecimento uuid;
begin
  -- Criar as 6 caixas de planejamento
  insert into public.budget_boxes (user_id, name, percentage, icon, color, order_index) 
  values 
    (user_id, 'Custos fixos', 35.00, '🏠', '#ef4444', 1)
  returning id into box_custos_fixos;
  
  insert into public.budget_boxes (user_id, name, percentage, icon, color, order_index) 
  values 
    (user_id, 'Conforto', 15.00, '✨', '#f59e0b', 2)
  returning id into box_conforto;
  
  insert into public.budget_boxes (user_id, name, percentage, icon, color, order_index) 
  values 
    (user_id, 'Metas', 10.00, '🎯', '#10b981', 3)
  returning id into box_metas;
  
  insert into public.budget_boxes (user_id, name, percentage, icon, color, order_index) 
  values 
    (user_id, 'Prazeres', 10.00, '🎉', '#ec4899', 4)
  returning id into box_prazeres;
  
  insert into public.budget_boxes (user_id, name, percentage, icon, color, order_index) 
  values 
    (user_id, 'Liberdade financeira', 25.00, '💎', '#8b5cf6', 5)
  returning id into box_liberdade;
  
  insert into public.budget_boxes (user_id, name, percentage, icon, color, order_index) 
  values 
    (user_id, 'Conhecimento', 5.00, '📚', '#06b6d4', 6)
  returning id into box_conhecimento;
end;
$$ language plpgsql security definer;

-- Função para criar categorias padrão para novos usuários (atualizada)
create or replace function public.create_default_categories(user_id uuid)
returns void as $$
declare
  box_custos_fixos uuid;
  box_conforto uuid;
  box_metas uuid;
  box_prazeres uuid;
  box_liberdade uuid;
  box_conhecimento uuid;
begin
  -- Buscar as caixas criadas
  select id into box_custos_fixos from public.budget_boxes where budget_boxes.user_id = create_default_categories.user_id and name = 'Custos fixos';
  select id into box_conforto from public.budget_boxes where budget_boxes.user_id = create_default_categories.user_id and name = 'Conforto';
  select id into box_metas from public.budget_boxes where budget_boxes.user_id = create_default_categories.user_id and name = 'Metas';
  select id into box_prazeres from public.budget_boxes where budget_boxes.user_id = create_default_categories.user_id and name = 'Prazeres';
  select id into box_liberdade from public.budget_boxes where budget_boxes.user_id = create_default_categories.user_id and name = 'Liberdade financeira';
  select id into box_conhecimento from public.budget_boxes where budget_boxes.user_id = create_default_categories.user_id and name = 'Conhecimento';
  
  -- Criar categorias de receita
  insert into public.categories (user_id, name, type, icon, color) values
    (user_id, 'Salário', 'income', '💰', '#10b981'),
    (user_id, 'Freelance', 'income', '💼', '#059669');
    
  -- Criar categorias de despesa vinculadas às caixas
  insert into public.categories (user_id, name, type, icon, color, box_id) values
    (user_id, 'Moradia', 'expense', '🏠', '#ef4444', box_custos_fixos),
    (user_id, 'Transporte', 'expense', '🚗', '#f59e0b', box_conforto),
    (user_id, 'Alimentação', 'expense', '🍔', '#ec4899', box_conforto),
    (user_id, 'Lazer', 'expense', '🎮', '#8b5cf6', box_prazeres),
    (user_id, 'Saúde', 'expense', '🏥', '#06b6d4', box_custos_fixos),
    (user_id, 'Educação', 'expense', '📚', '#6366f1', box_conhecimento),
    (user_id, 'Investimentos', 'expense', '💎', '#8b5cf6', box_liberdade),
    (user_id, 'Reserva', 'expense', '🎯', '#10b981', box_metas);
end;
$$ language plpgsql security definer;

-- Trigger para criar usuário, caixas e categorias automaticamente após sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', 'Usuário'));
  
  -- Criar caixas de planejamento primeiro
  perform public.create_default_budget_boxes(new.id);
  
  -- Depois criar categorias vinculadas às caixas
  perform public.create_default_categories(new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Remover trigger existente se houver
drop trigger if exists on_auth_user_created on auth.users;

-- Criar o trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

