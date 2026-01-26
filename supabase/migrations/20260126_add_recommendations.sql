-- Add recommendations column to checkups table
alter table public.checkups 
add column if not exists recommendations text[] default '{}';

comment on column public.checkups.recommendations is 'AI-generated actionable advice list';
