-- Add text_value column to results table for qualitative data
alter table public.results 
add column if not exists text_value text;

comment on column public.results.text_value is 'Qualitative result value (e.g. "Normal", "Positive")';
