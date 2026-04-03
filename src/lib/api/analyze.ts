import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswers } from "@/contexts/QuizContext";

export async function submitQuizAndAnalyze(answers: QuizAnswers) {
  // 1. Insert quiz submission
  const { data: submission, error: submitError } = await supabase
    .from("quiz_submissions")
    .insert({
      goal: answers.goal!,
      budget_min: answers.budget ?? null,
      budget_max: answers.budget ?? null,
      budget_unknown: answers.budgetUnknown,
      income: answers.income ?? null,
      deposit: answers.deposit ?? null,
      has_existing_home: answers.hasExistingHome,
      open_to_interstate: answers.interstateOpen,
      home_age_preference: answers.homeAgePreference,
      risk_growth_preference: answers.riskTolerance,
      timeline: answers.timeline!,
    })
    .select("id")
    .single();

  if (submitError || !submission) {
    throw new Error(submitError?.message ?? "Failed to submit quiz");
  }

  // 2. Call edge function
  const { data, error } = await supabase.functions.invoke("analyze-suburbs", {
    body: { submission_id: submission.id, answers },
  });

  if (error) {
    throw new Error(error.message ?? "Analysis failed");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return { submissionId: submission.id, results: data.results };
}
