-- Add status and flags for review workflow
alter table public.checkups 
add column if not exists status text default 'needs_review', -- 'verified', 'needs_review'
add column if not exists flags text[] default '{}';

alter table public.results
add column if not exists flags text[] default '{}';

comment on column public.checkups.status is 'Verification status of the extracted data';
