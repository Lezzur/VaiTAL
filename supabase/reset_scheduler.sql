-- RESET SCRIPT
-- WARNING: This will DELETE all data in the medicine scheduler tables.
-- Run this to fix "relation already exists" or "column does not exist" errors.

-- 1. Drop existing tables (Order matters due to foreign keys)
drop table if exists medication_logs cascade;
drop table if exists schedules cascade;
drop table if exists medications cascade;
drop table if exists push_subscriptions cascade;

-- 2. Create Tables (Fresh)
create table medications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  dosage text,
  stock_current integer default 0,
  stock_warn_threshold integer default 5,
  created_at timestamptz default now()
);

create table schedules (
  id uuid default gen_random_uuid() primary key,
  medication_id uuid references medications on delete cascade not null,
  time time not null, -- '08:00:00'
  days text[] default null, -- null = daily, or ['Mon', 'Wed']
  active boolean default true,
  created_at timestamptz default now()
);

create table medication_logs (
  id uuid default gen_random_uuid() primary key,
  schedule_id uuid references schedules on delete cascade not null,
  taken_at timestamptz default now(),
  status text check (status in ('taken', 'skipped', 'snoozed')),
  user_id uuid references auth.users not null
);

create table push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

-- 3. Enable RLS
alter table medications enable row level security;
alter table schedules enable row level security;
alter table medication_logs enable row level security;
alter table push_subscriptions enable row level security;

-- 4. Create Policies
-- Medications
create policy "Users can view their own medications" on medications for select using (auth.uid() = user_id);
create policy "Users can insert their own medications" on medications for insert with check (auth.uid() = user_id);
create policy "Users can update their own medications" on medications for update using (auth.uid() = user_id);
create policy "Users can delete their own medications" on medications for delete using (auth.uid() = user_id);

-- Schedules
create policy "Users can view their own schedules" on schedules for select using (exists (select 1 from medications where medications.id = schedules.medication_id and medications.user_id = auth.uid()));
create policy "Users can insert their own schedules" on schedules for insert with check (exists (select 1 from medications where medications.id = medication_id and medications.user_id = auth.uid()));
create policy "Users can delete their own schedules" on schedules for delete using (exists (select 1 from medications where medications.id = medication_id and medications.user_id = auth.uid()));

-- Logs
create policy "Users can view their own logs" on medication_logs for select using (auth.uid() = user_id);
create policy "Users can insert their own logs" on medication_logs for insert with check (auth.uid() = user_id);

-- Push Subscriptions
create policy "Users can view their own subscriptions" on push_subscriptions for select using (auth.uid() = user_id);
create policy "Users can insert their own subscriptions" on push_subscriptions for insert with check (auth.uid() = user_id);
create policy "Users can delete their own subscriptions" on push_subscriptions for delete using (auth.uid() = user_id);
