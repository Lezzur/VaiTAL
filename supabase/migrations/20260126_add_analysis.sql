-- Add analysis column for long-form AI insights
alter table public.checkups 
add column if not exists analysis text;

comment on column public.checkups.analysis is 'Detailed, patient-friendly AI analysis of the results';
