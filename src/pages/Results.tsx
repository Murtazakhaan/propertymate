import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, Loader2, MapPin, TrendingUp, Home, Clock, AlertTriangle,
  Shield, Zap, RotateCcw, GitCompareArrows, Hospital, GraduationCap,
  Train, ShieldCheck, ShoppingBag, Wrench, Building2, ExternalLink,
  Bookmark, BookmarkCheck, ArrowUpDown,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuiz } from "@/contexts/QuizContext";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { metricLabels } from "@/lib/metric-labels";
import SuburbReportButton from "@/components/SuburbReportButton";
import SuburbCard from "@/components/SuburbCard";

interface SuburbResult {
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

interface PropertyListing {
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

type SortOption = "match" | "price-low" | "price-high" | "growth";

const GUEST_SHORTLIST_KEY = "shortlist:guest";


const fmtPriceBand = (l: PropertyListing) => {
  if (l.price_min != null && l.price_max != null) {
    return `$${(l.price_min / 1000).toFixed(0)}k–$${(l.price_max / 1000).toFixed(0)}k`;
  }
  if (l.price != null) return `$${l.price.toLocaleString()}`;
  return "Price on request";
};

const Results = () => {
  const { answers } = useQuiz();
  const { beginnerMode } = useApp();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [results, setResults] = useState<SuburbResult[]>([]);
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedListings, setExpandedListings] = useState<Set<string>>(new Set());
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("match");
  const [loadedGoal, setLoadedGoal] = useState<string | null>(null);
  const [openedLatest, setOpenedLatest] = useState(false);

  // Track pending requests to prevent race conditions
  const pendingRequestRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (pendingRequestRef.current) {
        pendingRequestRef.current.abort();
      }
    };
  }, []);

  const goalLabel = (g: string | null) => {
    switch (g) {
      case "first-home": return beginnerMode ? "First home" : "First Home Buyer";
      case "investment": return beginnerMode ? "Investment" : "Investment Property";
      case "not-sure": return beginnerMode ? "Not sure yet" : "Exploring Options";
      default: return "Property search";
    }
  };

  const labels = metricLabels(beginnerMode);
  const effectiveGoal = answers.goal ?? loadedGoal;
  const isOwnerOccupier = effectiveGoal === "first-home";
  const isInvestor = effectiveGoal === "investment";

  const riskConfig = {
    low: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: Shield, label: labels.riskLow },
    medium: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: AlertTriangle, label: labels.riskMedium },
    high: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: Zap, label: labels.riskHigh },
  };

  // Persist last loaded submission per user
  const cacheKey = `results:lastSubmission:${user?.id ?? "anon"}`;
  const readCache = (): { sid: string; goal: string } | null => {
    try {
      const raw = localStorage.getItem(cacheKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const writeCache = (sid: string, goal: string) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ sid, goal }));
    } catch {
      /* ignore quota errors */
    }
  };
  const clearCache = () => {
    try { localStorage.removeItem(cacheKey); } catch { /* ignore */ }
  };

  const loadFromSubmission = useCallback(async (
    submissionId: string,
    opts: { fromCache?: boolean } = {}
  ) => {
    if (!isMountedRef.current) return;
    
    // Cancel previous request
    if (pendingRequestRef.current) {
      pendingRequestRef.current.abort();
    }
    pendingRequestRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
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
      if (e.name === 'AbortError') return; // Request was cancelled
      
      console.error("Load submission error:", e);
      if (opts.fromCache) {
        clearCache();
        setLoadedGoal(null);
        if (user && isMountedRef.current) {
          await loadLatestSubmission();
          return;
        }
        if (isMountedRef.current) {
          setError("no-quiz");
        }
      } else {
        if (isMountedRef.current) {
          setError(e?.message || "Could not load saved results");
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  const loadLatestSubmission = useCallback(async () => {
    if (searchParams.get("sid")) return;
    
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    
    try {
      const { data: subs, error: subErr } = await supabase
        .from("quiz_submissions")
        .select("id, goal")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (subErr) throw subErr;
      if (!subs || subs.length === 0) {
        if (isMountedRef.current) {
          setError("no-quiz");
        }
        return;
      }
      
      const ok = await loadResultsForSubmission(subs[0].id, subs[0].goal);
      if (ok && isMountedRef.current) {
        setOpenedLatest(true);
        toast({
          title: "Opened latest match",
          description: `Showing your most recent ${goalLabel(subs[0].goal)} search.`,
        });
      }
    } catch (e: any) {
      console.error("Load latest error:", e);
      if (isMountedRef.current) {
        setError(e?.message || "Could not load your saved results");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, searchParams, toast]);

  const loadResultsForSubmission = useCallback(async (submissionId: string, goal: string): Promise<boolean> => {
    const { data: suburbs, error: sErr } = await supabase
      .from("suburb_results")
      .select("*")
      .eq("quiz_submission_id", submissionId)
      .order("match_score", { ascending: false });
    
    if (sErr) throw sErr;
    if (!suburbs || suburbs.length === 0) {
      if (isMountedRef.current) {
        setError("no-quiz");
      }
      return false;
    }

    // Optimized: Fetch all listings in single query with suburb IDs
    const ids = suburbs.map((s) => s.id);
    const { data: lst, error: lErr } = await supabase
      .from("property_listings")
      .select("*")
      .in("suburb_result_id", ids);
    
    if (lErr) {
      console.error("Error loading listings:", lErr);
    }

    if (isMountedRef.current) {
      setResults(suburbs as SuburbResult[]);
      setListings((lst ?? []) as PropertyListing[]);
      setLoadedGoal(goal);
      writeCache(submissionId, goal);
    }
    
    return true;
  }, []);

  // Load existing shortlists (DB when signed in, localStorage for guests)
  useEffect(() => {
    const loadShortlists = async () => {
      if (!user) {
        try {
          const raw = localStorage.getItem(GUEST_SHORTLIST_KEY);
          const ids: string[] = raw ? JSON.parse(raw) : [];
          if (isMountedRef.current) setShortlisted(new Set(ids));
        } catch {
          /* ignore */
        }
        return;
      }

      const { data } = await supabase
        .from("shortlists")
        .select("suburb_result_id")
        .eq("user_id", user.id);

      if (data && isMountedRef.current) {
        setShortlisted(new Set(data.map((s) => s.suburb_result_id)));
      }
    };

    loadShortlists();
  }, [user]);


  // Priority-based loading with race condition prevention
  useEffect(() => {
    const sid = searchParams.get("sid");
    
    if (sid) {
      loadFromSubmission(sid);
    } else if (answers.goal && answers.timeline) {
      fetchResults();
    } else {
      const cached = readCache();
      if (cached?.sid) {
        setLoadedGoal(cached.goal);
        loadFromSubmission(cached.sid, { fromCache: true });
      } else if (user) {
        loadLatestSubmission();
      } else {
        if (isMountedRef.current) {
          setLoading(false);
          setError("no-quiz");
        }
      }
    }
  }, [user]); // Only depend on user to prevent race conditions

  const fetchResults = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
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

      if (isMountedRef.current) {
        setResults(data.results ?? []);
        setListings(data.listings ?? []);
      }
    } catch (e: any) {
      console.error("Results error:", e);
      const msg = e?.message || "Failed to analyze suburbs";
      if (isMountedRef.current) {
        setError(msg);
        toast({ title: "Analysis failed", description: msg, variant: "destructive" });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [answers, toast]);

  // Pre-index listings by suburb (fixes O(n²) filtering)
  const listingsBySuburb = useMemo(() => {
    const map = new Map<string, PropertyListing[]>();
    listings.forEach(listing => {
      const suburbId = listing.suburb_result_id;
      if (!map.has(suburbId)) {
        map.set(suburbId, []);
      }
      map.get(suburbId)!.push(listing);
    });
    return map;
  }, [listings]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 3) {
          toast({ title: "Max 3 suburbs", description: "Deselect one before adding another." });
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const toggleShortlist = useCallback(async (suburbId: string) => {
    const isShortlisted = shortlisted.has(suburbId);

    // Guests: keep the shortlist in this browser
    if (!user) {
      setShortlisted((prev) => {
        const next = new Set(prev);
        isShortlisted ? next.delete(suburbId) : next.add(suburbId);
        try {
          localStorage.setItem(GUEST_SHORTLIST_KEY, JSON.stringify([...next]));
        } catch {
          /* ignore quota errors */
        }
        return next;
      });
      toast({
        title: isShortlisted ? "Removed from shortlist" : "Added to shortlist",
        description: isShortlisted ? undefined : "Sign in to sync your shortlist across devices.",
      });
      return;
    }

    if (isShortlisted) {
      await supabase.from("shortlists").delete().eq("user_id", user.id).eq("suburb_result_id", suburbId);
      setShortlisted((prev) => {
        const next = new Set(prev);
        next.delete(suburbId);
        return next;
      });
      toast({ title: "Removed from shortlist" });
    } else {
      await supabase.from("shortlists").insert({ user_id: user.id, suburb_result_id: suburbId });
      setShortlisted((prev) => new Set(prev).add(suburbId));
      toast({ title: "Added to shortlist" });
    }
  }, [user, shortlisted, toast]);


  const toggleListings = (id: string) => {
    setExpandedListings((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCompare = () => {
    const suburbs = results.filter((r) => selected.has(r.id));
    navigate("/compare", { state: { suburbs, goal: answers.goal } });
  };

  // Memoized sorted results (fixes repeated sorting)
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.median_price ?? Infinity) - (b.median_price ?? Infinity);
        case "price-high":
          return (b.median_price ?? 0) - (a.median_price ?? 0);
        case "growth":
          return (b.capital_growth_rate ?? 0) - (a.capital_growth_rate ?? 0);
        default:
          return b.match_score - a.match_score;
      }
    });
  }, [results, sortBy]);

  if (loading) {
    return (
      <div className="container max-w-4xl py-10 md:py-16">
        <div className="text-center space-y-6 py-20">
          <div className="relative mx-auto w-16 h-16">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {beginnerMode ? "Finding suburbs for you…" : "Analysing suburbs…"}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {beginnerMode
                ? "We're searching through thousands of suburbs to find the best ones for you. This takes about 10 to 20 seconds."
                : "Crunching market data to find your best matches. This usually takes 10 to 20 seconds."}
            </p>
          </div>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error === "no-quiz") {
    return (
      <div className="container max-w-4xl py-10 md:py-16 text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">No search data found</h1>
        <p className="text-muted-foreground">Tell us what you're looking for so we can find the right suburbs for you.</p>
        <Link to="/quiz">
          <Button size="lg"><ArrowLeft className="mr-2 h-4 w-4" />Find My Property</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-10 md:py-16 text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground">{error}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={fetchResults} variant="outline"><RotateCcw className="mr-2 h-4 w-4" />Try Again</Button>
          <Link to="/quiz"><Button><ArrowLeft className="mr-2 h-4 w-4" />Start Over</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8 md:py-16 px-4 sm:px-6">
      {openedLatest && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-foreground">
              Opened your latest match for{" "}
              <Badge variant="secondary" className="ml-1">{goalLabel(loadedGoal)}</Badge>
            </span>
          </div>
          <Link to="/quiz">
            <Button size="sm" variant="outline">
              <RotateCcw className="mr-2 h-3 w-3" />Start a new search
            </Button>
          </Link>
        </div>
      )}
      <div className="text-center space-y-2 mb-6 md:mb-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{labels.topMatches}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{labels.topMatchesDesc}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm bg-muted rounded-md px-3 py-1.5 border-0 text-foreground focus:ring-2 focus:ring-primary"
          >
            <option value="match">Best Match</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="growth">Growth Rate</option>
          </select>
          {effectiveGoal && (
            <Badge variant="outline" className="text-xs">
              Goal: {goalLabel(effectiveGoal)}
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {results.length} suburbs found
        </div>
      </div>

      {selected.size >= 2 && (
        <div className="sticky top-4 z-20 mb-6 flex items-center justify-between bg-primary text-primary-foreground rounded-lg px-4 sm:px-5 py-3 shadow-lg">
          <span className="text-sm font-medium">{selected.size} suburbs selected</span>
          <Button size="sm" variant="secondary" onClick={handleCompare}>
            <GitCompareArrows className="mr-2 h-4 w-4" />Compare Now
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:gap-6">
        {sortedResults.map((suburb, index) => (
          <SuburbCard
            key={suburb.id}
            suburb={suburb}
            index={index}
            isSelected={selected.has(suburb.id)}
            isBookmarked={shortlisted.has(suburb.id)}
            isExpanded={expandedListings.has(suburb.id)}
            listings={listingsBySuburb.get(suburb.id) || []}
            riskConfig={riskConfig}
            isOwnerOccupier={isOwnerOccupier}
            isInvestor={isInvestor}
            beginnerMode={beginnerMode}
            labels={labels}
            onSelectChange={() => toggleSelect(suburb.id)}
            onBookmarkChange={() => toggleShortlist(suburb.id)}
            onExpandListings={() => toggleListings(suburb.id)}
          />
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-8 md:mt-10">
        <Link to="/quiz">
          <Button variant="outline" size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />Start Over
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Results;
