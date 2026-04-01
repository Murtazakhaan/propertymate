
-- Quiz submissions table
CREATE TABLE public.quiz_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  goal TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  budget_unknown BOOLEAN DEFAULT false,
  income INTEGER,
  deposit INTEGER,
  has_existing_home BOOLEAN,
  open_to_interstate BOOLEAN DEFAULT false,
  home_age_preference TEXT,
  risk_growth_preference INTEGER DEFAULT 50,
  timeline TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Suburb results table (cached AI responses)
CREATE TABLE public.suburb_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_submission_id UUID REFERENCES public.quiz_submissions(id) ON DELETE CASCADE NOT NULL,
  suburb_name TEXT NOT NULL,
  state TEXT NOT NULL,
  postcode TEXT,
  match_score INTEGER NOT NULL DEFAULT 0,
  reasoning TEXT,
  risk_level TEXT NOT NULL DEFAULT 'medium',
  best_for_tag TEXT,
  median_price INTEGER,
  rental_range_low INTEGER,
  rental_range_high INTEGER,
  weekly_out_of_pocket INTEGER,
  confidence TEXT DEFAULT 'medium',
  vacancy_rate NUMERIC(5,2),
  rental_yield NUMERIC(5,2),
  population_growth NUMERIC(5,2),
  days_on_market INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User shortlists
CREATE TABLE public.shortlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  suburb_result_id UUID REFERENCES public.suburb_results(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, suburb_result_id)
);

-- Glossary terms
CREATE TABLE public.glossary_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  beginner_definition TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies

-- Quiz submissions: users can read/insert their own, anon can insert (nullable user_id)
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert quiz submissions"
  ON public.quiz_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own submissions"
  ON public.quiz_submissions FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Suburb results: readable by anyone who submitted the quiz
ALTER TABLE public.suburb_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read suburb results"
  ON public.suburb_results FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert suburb results"
  ON public.suburb_results FOR INSERT
  WITH CHECK (true);

-- Shortlists: users own their shortlists
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shortlists"
  ON public.shortlists FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Glossary: public read
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read glossary terms"
  ON public.glossary_terms FOR SELECT
  USING (true);
