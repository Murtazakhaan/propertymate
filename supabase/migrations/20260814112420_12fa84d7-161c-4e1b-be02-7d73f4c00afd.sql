GRANT SELECT ON public.quiz_submissions TO anon;

CREATE POLICY "Guests can view guest submissions"
ON public.quiz_submissions
FOR SELECT
TO anon
USING (user_id IS NULL);