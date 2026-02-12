-- IDEMPOTENT SCHEMA SCRIPT
-- This script safely checks if tables exist before creating them.

-- 1. Create Tables (IF NOT EXISTS)
create table if not exists medications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  dosage text,
  stock_current integer default 0,
  stock_warn_threshold integer default 5,
  created_at timestamptz default now()
);

create table if not exists schedules (
  id uuid default gen_random_uuid() primary key,
  medication_id uuid references medications on delete cascade not null,
  time time not null,
  days text[] default null,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists medication_logs (
  id uuid default gen_random_uuid() primary key,
  schedule_id uuid references schedules on delete cascade not null,
  taken_at timestamptz default now(),
  status text check (status in ('taken', 'skipped', 'snoozed')),
  user_id uuid references auth.users not null
);

create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

-- 2. Enable RLS (Safe to run multiple times)
alter table medications enable row level security;
alter table schedules enable row level security;
alter table medication_logs enable row level security;
alter table push_subscriptions enable row level security;

-- 3. Reset & Recreate Policies (To avoid "Policy already exists" errors)
-- Medications
drop policy if exists "Users can view their own medications" on medications;
create policy "Users can view their own medications" on medications for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own medications" on medications;
create policy "Users can insert their own medications" on medications for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own medications" on medications;
create policy "Users can update their own medications" on medications for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own medications" on medications;
create policy "Users can delete their own medications" on medications for delete using (auth.uid() = user_id);

-- Schedules
drop policy if exists "Users can view their own schedules" on schedules;
create policy "Users can view their own schedules" on schedules for select using (exists (select 1 from medications where medications.id = schedules.medication_id and medications.user_id = auth.uid()));

drop policy if exists "Users can insert their own schedules" on schedules;
create policy "Users can insert their own schedules" on schedules for insert with check (exists (select 1 from medications where medications.id = medication_id and medications.user_id = auth.uid()));

drop policy if exists "Users can delete their own schedules" on schedules;
create policy "Users can delete their own schedules" on schedules for delete using (exists (select 1 from medications where medications.id = medication_id and medications.user_id = auth.uid()));

-- Logs
drop policy if exists "Users can view their own logs" on medication_logs;
create policy "Users can view their own logs" on medication_logs for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own logs" on medication_logs;
create policy "Users can insert their own logs" on medication_logs for insert with check (auth.uid() = user_id);

-- Push Subscriptions
drop policy if exists "Users can view their own subscriptions" on push_subscriptions;
create policy "Users can view their own subscriptions" on push_subscriptions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own subscriptions" on push_subscriptions;
create policy "Users can insert their own subscriptions" on push_subscriptions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own subscriptions" on push_subscriptions;
create policy "Users can delete their own subscriptions" on push_subscriptions for delete using (auth.uid() = user_id);
