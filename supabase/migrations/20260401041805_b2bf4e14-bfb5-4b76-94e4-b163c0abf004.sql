
-- Tighten quiz_submissions insert: user_id must be null or match the caller
DROP POLICY "Anyone can insert quiz submissions" ON public.quiz_submissions;
CREATE POLICY "Users can insert own quiz submissions"
  ON public.quiz_submissions FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Tighten suburb_results insert: restrict to service role only
DROP POLICY "Service role can insert suburb results" ON public.suburb_results;
-- No anon/authenticated insert policy — edge function uses service_role key
