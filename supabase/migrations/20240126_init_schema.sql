-- Create Checkups Table (The Event)
create table public.checkups (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  date date not null default current_date,
  summary text,
  original_files text[], -- Array of Storage URLs
  created_at timestamptz not null default now(),
  
  constraint checkups_pkey primary key (id),
  constraint checkups_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
);

-- Create Results Table (The Data Points)
create table public.results (
  id uuid not null default gen_random_uuid(),
  checkup_id uuid not null,
  marker_name text not null,
  value numeric,
  unit text,
  reference_range_min numeric,
  reference_range_max numeric,
  confidence numeric, -- 0.0 to 1.0 confidence score from AI
  created_at timestamptz not null default now(),

  constraint results_pkey primary key (id),
  constraint results_checkup_id_fkey foreign key (checkup_id) references public.checkups(id) on delete cascade
);

-- Enable RLS
alter table public.checkups enable row level security;
alter table public.results enable row level security;

-- Policies for Checkups
create policy "Users can view their own checkups"
  on public.checkups for select
  using (auth.uid() = user_id);

create policy "Users can insert their own checkups"
  on public.checkups for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own checkups"
  on public.checkups for update
  using (auth.uid() = user_id);

create policy "Users can delete their own checkups"
  on public.checkups for delete
  using (auth.uid() = user_id);

-- Policies for Results
-- We check based on the parent checkup's user_id
create policy "Users can view results of their own checkups"
  on public.results for select
  using (
    exists (
      select 1 from public.checkups
      where public.checkups.id = public.results.checkup_id
      and public.checkups.user_id = auth.uid()
    )
  );

create policy "Users can insert results for their own checkups"
  on public.results for insert
  with check (
    exists (
      select 1 from public.checkups
      where public.checkups.id = public.results.checkup_id
      and public.checkups.user_id = auth.uid()
    )
  );

create policy "Users can update results of their own checkups"
  on public.results for update
  using (
    exists (
      select 1 from public.checkups
      where public.checkups.id = public.results.checkup_id
      and public.checkups.user_id = auth.uid()
    )
  );

create policy "Users can delete results of their own checkups"
  on public.results for delete
  using (
    exists (
      select 1 from public.checkups
      where public.checkups.id = public.results.checkup_id
      and public.checkups.user_id = auth.uid()
    )
  );
