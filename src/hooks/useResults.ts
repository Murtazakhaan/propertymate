import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuiz } from "@/contexts/QuizContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface SuburbResult {
  id: string;
  suburb_name: string;
  state: string;
  postcode: string | null;
  match_score: number;
  risk_level: string;
  median_price: number | null;
  rental_yield: number | null;
  vacancy_rate: number | null;
  population_growth: number | null;
  days_on_market: number | null;
  rental_range_low: number | null;
  rental_range_high: number | null;
  weekly_out_of_pocket: number | null;
  best_for_tag: string | null;
  confidence: string | null;
  reasoning: string | null;
  stamp_duty_estimate: number | null;
  capital_growth_rate: number | null;
  nearest_hospital: string | null;
  num_schools: number | null;
  has_train_station: boolean | null;
  crime_rate_level: string | null;
  nearest_shopping_centre: string | null;
  infrastructure_projects: string | null;
  house_weekly_rent: number | null;
  unit_weekly_rent: number | null;
}

export interface PropertyListing {
  id: string;
  suburb_result_id: string;
  address: string | null;
  price: number | null;
  price_min: number | null;
  price_max: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string | null;
  link: string | null;
  image_url: string | null;
  realestate_url: string | null;
  domain_url: string | null;
  search_label: string | null;
}

type LoadingState = "idle" | "loading" | "success" | "error";

export const useResults = () => {
  const { answers } = useQuiz();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [results, setResults] = useState<SuburbResult[]>([]);
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loadedGoal, setLoadedGoal] = useState<string | null>(null);

  // Cache key and persistence
  const cacheKey = `results:lastSubmission:${user?.id ?? "anon"}`;
  const abortControllerRef = useRef<AbortController | null>(null);

  const readCache = useCallback((): { sid: string; goal: string } | null => {
    try {
      const raw = localStorage.getItem(cacheKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [cacheKey]);

  const writeCache = useCallback(
    (sid: string, goal: string) => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ sid, goal }));
      } catch {
        /* ignore quota errors */
      }
    },
    [cacheKey]
  );

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(cacheKey);
    } catch {
      /* ignore */
    }
  }, [cacheKey]);

  /**
   * Load results and listings for a submission with optimized combined query
   */
  const loadResultsForSubmission = useCallback(
    async (submissionId: string, goal: string): Promise<boolean> => {
      // Cancel any previous requests
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        setLoadingState("loading");
        setError(null);

        // Fetch suburbs
        const { data: suburbs, error: sErr } = await supabase
          .from("suburb_results")
          .select("*")
          .eq("quiz_submission_id", submissionId)
          .order("match_score", { ascending: false });

        if (sErr) throw sErr;
        if (!suburbs || suburbs.length === 0) {
          setError("no-quiz");
          setLoadingState("error");
          return false;
        }

        // Optimization: Use IN query only if we have suburbs
        const suburbIds = suburbs.map((s) => s.id);
        const { data: listingsData } = await supabase
          .from("property_listings")
          .select("*")
          .in("suburb_result_id", suburbIds);

        setResults(suburbs as SuburbResult[]);
        setListings((listingsData ?? []) as PropertyListing[]);
        setLoadedGoal(goal);
        writeCache(submissionId, goal);
        setLoadingState("success");
        return true;
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("Load submission error:", e);
          setError(e?.message || "Failed to load results");
          setLoadingState("error");
        }
        return false;
      }
    },
    [writeCache]
  );

  const loadFromSubmission = useCallback(
    async (submissionId: string, opts: { fromCache?: boolean } = {}) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        setLoadingState("loading");
        setError(null);

        const { data: sub, error: subErr } = await supabase
          .from("quiz_submissions")
          .select("id, goal")
          .eq("id", submissionId)
          .maybeSingle();

        if (subErr) throw subErr;
        if (!sub) throw new Error("Submission not found");

        const ok = await loadResultsForSubmission(sub.id, sub.goal);
        if (!ok && opts.fromCache) throw new Error("Cached submission has no results");
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("Load submission error:", e);
          if (opts.fromCache) {
            clearCache();
            setLoadedGoal(null);
            setError("no-quiz");
          } else {
            setError(e?.message || "Could not load saved results");
          }
        }
        setLoadingState("error");
      }
    },
    [loadResultsForSubmission, clearCache]
  );

  const loadLatestSubmission = useCallback(async () => {
    // Guard: only run when no sid is present in the URL
    if (searchParams.get("sid")) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoadingState("loading");
      setError(null);

      const { data: subs, error: subErr } = await supabase
        .from("quiz_submissions")
        .select("id, goal")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (subErr) throw subErr;
      if (!subs || subs.length === 0) {
        setError("no-quiz");
        setLoadingState("error");
        return false;
      }

      const ok = await loadResultsForSubmission(subs[0].id, subs[0].goal);
      setLoadingState(ok ? "success" : "error");
      return ok;
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error("Load latest error:", e);
        setError(e?.message || "Could not load your saved results");
        setLoadingState("error");
      }
      return false;
    }
  }, [user, searchParams, loadResultsForSubmission]);

  const fetchResults = useCallback(async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoadingState("loading");
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke("analyze-suburbs", {
        body: {
          goal: answers.goal,
          budget_min: answers.budget ?? undefined,
          budget_max: answers.budget ?? undefined,
          budget_unknown: answers.budgetUnknown,
          income: answers.income,
          deposit: answers.deposit,
          has_existing_home: answers.hasExistingHome,
          open_to_interstate: answers.interstateOpen,
          home_age_preference: answers.homeAgePreference,
          risk_growth_preference: answers.riskTolerance,
          timeline: answers.timeline,
          is_first_home: answers.isFirstHome,
          existing_property_address: answers.existingPropertyAddress,
          existing_property_value: answers.existingPropertyValue,
          existing_loan_amount: answers.existingLoanAmount,
          investor_strategy: answers.investorStrategy,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setResults(data.results ?? []);
      setListings(data.listings ?? []);
      setLoadedGoal(answers.goal);
      setLoadingState("success");
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error("Results error:", e);
        const msg = e?.message || "Failed to analyze suburbs";
        setError(msg);
        setLoadingState("error");
      }
    }
  }, [answers]);

  // Orchestrate loading priorities
  useEffect(() => {
    const sid = searchParams.get("sid");

    // Priority 1: Deep-link with submission id
    if (sid) {
      loadFromSubmission(sid);
      return;
    }

    // Priority 2: Fresh quiz answers
    if (answers.goal && answers.timeline) {
      fetchResults();
      return;
    }

    // Priority 3: Cached submission
    const cached = readCache();
    if (cached?.sid) {
      setLoadedGoal(cached.goal);
      loadFromSubmission(cached.sid, { fromCache: true });
      return;
    }

    // Priority 4: Logged-in user's latest
    if (user) {
      loadLatestSubmission();
      return;
    }

    // No valid state
    setLoadingState("idle");
    setError("no-quiz");
  }, [answers.goal, answers.timeline, user, searchParams, readCache, loadFromSubmission, fetchResults, loadLatestSubmission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    results,
    listings,
    loadingState,
    error,
    loadedGoal,
    refreshData: fetchResults,
  };
};
