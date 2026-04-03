ALTER TABLE public.suburb_results
  ADD COLUMN IF NOT EXISTS house_weekly_rent integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS unit_weekly_rent integer DEFAULT NULL;