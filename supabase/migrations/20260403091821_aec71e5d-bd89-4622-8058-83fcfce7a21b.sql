
-- Add new columns to quiz_submissions
ALTER TABLE public.quiz_submissions
  ADD COLUMN IF NOT EXISTS is_first_home boolean DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS existing_property_address text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS existing_property_value integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS existing_loan_amount integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS investor_strategy text DEFAULT NULL;

-- Add new columns to suburb_results
ALTER TABLE public.suburb_results
  ADD COLUMN IF NOT EXISTS stamp_duty_estimate integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS capital_growth_rate numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS nearest_hospital text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS num_schools integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS has_train_station boolean DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS crime_rate_level text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS nearest_shopping_centre text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS infrastructure_projects text DEFAULT NULL;

-- Create property_listings table
CREATE TABLE public.property_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suburb_result_id uuid NOT NULL REFERENCES public.suburb_results(id) ON DELETE CASCADE,
  address text NOT NULL,
  price integer NOT NULL,
  bedrooms integer DEFAULT NULL,
  bathrooms integer DEFAULT NULL,
  property_type text DEFAULT NULL,
  link text DEFAULT NULL,
  image_url text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on property_listings
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can read property listings
CREATE POLICY "Anyone can read property listings"
  ON public.property_listings
  FOR SELECT
  TO public
  USING (true);
