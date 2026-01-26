-- Create a table for public profiles (optional, but good practice for extending user data later)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- Create Checkups Table (The Event)
create table checkups (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null default CURRENT_DATE,
  summary text,
  original_files text[], -- Array of URLs to storage
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Checkups
alter table checkups enable row level security;

create policy "Users can view their own checkups." on checkups
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert their own checkups." on checkups
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own checkups." on checkups
  for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own checkups." on checkups
  for delete using ((select auth.uid()) = user_id);

-- Create Results Table (The Data Points)
create table results (
  id uuid default gen_random_uuid() primary key,
  checkup_id uuid references checkups on delete cascade not null,
  user_id uuid references auth.users not null, -- Denormalized for easier RLS and querying
  marker_name text not null,
  value numeric,
  unit text,
  reference_range_min numeric,
  reference_range_max numeric,
  confidence numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Results
alter table results enable row level security;

create policy "Users can view their own results." on results
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert their own results." on results
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own results." on results
  for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own results." on results
  for delete using ((select auth.uid()) = user_id);

-- Helper to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
