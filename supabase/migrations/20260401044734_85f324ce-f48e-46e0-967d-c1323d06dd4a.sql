-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Users can view own submissions" ON public.quiz_submissions;

-- Create a new SELECT policy: only authenticated users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON public.quiz_submissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());