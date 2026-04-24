import { useEffect, useState } from "react";
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

  const labels = metricLabels(beginnerMode);
  const effectiveGoal = answers.goal ?? loadedGoal;
  const isOwnerOccupier = effectiveGoal === "first-home";
  const isInvestor = effectiveGoal === "investment";

  const riskConfig = {
    low: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: Shield, label: labels.riskLow },
    medium: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: AlertTriangle, label: labels.riskMedium },
    high: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: Zap, label: labels.riskHigh },
  };

  useEffect(() => {
    // Priority 1: Deep-link with submission id (from notification)
    const sid = searchParams.get("sid");
    if (sid) {
      loadFromSubmission(sid);
      return;
    }
    // Priority 2: Fresh quiz answers in memory → run analysis
    if (answers.goal && answers.timeline) {
      fetchResults();
      return;
    }
    // Priority 3: Logged-in user → load most recent saved results
    if (user) {
      loadLatestSubmission();
      return;
    }
    setLoading(false);
    setError("no-quiz");
  }, [user]);

  const loadFromSubmission = async (submissionId: string) => {
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
      await loadResultsForSubmission(sub.id, sub.goal);
    } catch (e: any) {
      console.error("Load submission error:", e);
      setError(e?.message || "Could not load saved results");
    } finally {
      setLoading(false);
    }
  };

  const loadLatestSubmission = async () => {
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
        setError("no-quiz");
        return;
      }
      await loadResultsForSubmission(subs[0].id, subs[0].goal);
    } catch (e: any) {
      console.error("Load latest error:", e);
      setError(e?.message || "Could not load your saved results");
    } finally {
      setLoading(false);
    }
  };

  const loadResultsForSubmission = async (submissionId: string, goal: string) => {
    const { data: suburbs, error: sErr } = await supabase
      .from("suburb_results")
      .select("*")
      .eq("quiz_submission_id", submissionId)
      .order("match_score", { ascending: false });
    if (sErr) throw sErr;
    if (!suburbs || suburbs.length === 0) {
      setError("no-quiz");
      return;
    }
    const ids = suburbs.map((s) => s.id);
    const { data: lst } = await supabase
      .from("property_listings")
      .select("*")
      .in("suburb_result_id", ids);
    setResults(suburbs as SuburbResult[]);
    setListings((lst ?? []) as PropertyListing[]);
    setLoadedGoal(goal);
  };

  // Load existing shortlists
  useEffect(() => {
    if (!user) return;
    const loadShortlists = async () => {
      const { data } = await supabase
        .from("shortlists")
        .select("suburb_result_id")
        .eq("user_id", user.id);
      if (data) {
        setShortlisted(new Set(data.map((s) => s.suburb_result_id)));
      }
    };
    loadShortlists();
  }, [user]);

  const fetchResults = async () => {
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

      setResults(data.results ?? []);
      setListings(data.listings ?? []);
    } catch (e: any) {
      console.error("Results error:", e);
      const msg = e?.message || "Failed to analyze suburbs";
      setError(msg);
      toast({ title: "Analysis failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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

  const toggleShortlist = async (suburbId: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save suburbs." });
      return;
    }
    const isShortlisted = shortlisted.has(suburbId);
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
  };

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

  const getListingsForSuburb = (suburbId: string) =>
    listings.filter((l) => l.suburb_result_id === suburbId);

  const sortedResults = [...results].sort((a, b) => {
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
          {/* Progress dots */}
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
      <div className="text-center space-y-2 mb-6 md:mb-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{labels.topMatches}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{labels.topMatchesDesc}</p>
      </div>

      {/* Sort & compare bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
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
        {sortedResults.map((suburb, index) => {
          const risk = riskConfig[suburb.risk_level as keyof typeof riskConfig] ?? riskConfig.medium;
          const RiskIcon = risk.icon;
          const isSelected = selected.has(suburb.id);
          const isBookmarked = shortlisted.has(suburb.id);
          const suburbListings = getListingsForSuburb(suburb.id);
          const showListings = expandedListings.has(suburb.id);

          return (
            <Card
              key={suburb.id}
              className={cn(
                "overflow-hidden transition-all duration-200",
                isSelected && "ring-2 ring-primary shadow-lg shadow-primary/10"
              )}
            >
              <CardHeader className="pb-3 px-4 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(suburb.id)}
                      className="mt-1.5 shrink-0"
                      aria-label={`Select ${suburb.suburb_name} for comparison`}
                    />
                    <div className={cn(
                      "hidden sm:flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg shrink-0",
                      index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base sm:text-xl flex items-center gap-1 flex-wrap">
                        <MapPin className="inline h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{suburb.suburb_name}, {suburb.state} {suburb.postcode ?? ""}</span>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {suburb.best_for_tag && (
                          <Badge variant="secondary" className="text-xs">{suburb.best_for_tag}</Badge>
                        )}
                        {!isOwnerOccupier && (
                          <Badge className={cn("text-xs", risk.color)}>
                            <RiskIcon className="h-3 w-3 mr-1" />{risk.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 shrink-0">
                    <button
                      onClick={() => toggleShortlist(suburb.id)}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
                      )}
                      aria-label={isBookmarked ? "Remove from shortlist" : "Add to shortlist"}
                    >
                      {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                    </button>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-primary">{suburb.match_score}%</div>
                      <div className="text-xs text-muted-foreground">
                        {beginnerMode ? "Fit" : "Match"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                {/* Key metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  {suburb.median_price != null && (
                    <MetricCard icon={Home} label={labels.medianPrice} value={`$${(suburb.median_price / 1000).toFixed(0)}k`} />
                  )}
                  {suburb.capital_growth_rate != null && (
                    <MetricCard icon={TrendingUp} label={labels.capitalGrowth} value={`${suburb.capital_growth_rate}%`} />
                  )}
                  {suburb.population_growth != null && (
                    <MetricCard icon={TrendingUp} label={labels.populationGrowth} value={`${suburb.population_growth}%`} />
                  )}
                  {suburb.stamp_duty_estimate != null && (
                    <MetricCard icon={Building2} label={labels.stampDuty} value={`$${(suburb.stamp_duty_estimate / 1000).toFixed(0)}k`} />
                  )}
                  {isInvestor && suburb.rental_yield != null && (
                    <MetricCard icon={TrendingUp} label={labels.rentalYield} value={`${suburb.rental_yield}%`} />
                  )}
                  {isInvestor && suburb.vacancy_rate != null && (
                    <MetricCard icon={AlertTriangle} label={labels.vacancyRate} value={`${suburb.vacancy_rate}%`} />
                  )}
                </div>

                {/* Owner occupier: amenities */}
                {isOwnerOccupier && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {suburb.nearest_hospital && (
                      <AmenityItem icon={Hospital} label={labels.nearestHospital} value={suburb.nearest_hospital} />
                    )}
                    {suburb.num_schools != null && (
                      <AmenityItem icon={GraduationCap} label={labels.numSchools} value={`${suburb.num_schools}`} />
                    )}
                    {suburb.has_train_station != null && (
                      <AmenityItem icon={Train} label={labels.trainStation} value={suburb.has_train_station ? "Yes" : "No"} />
                    )}
                    {suburb.crime_rate_level && (
                      <AmenityItem icon={ShieldCheck} label={labels.crimeRate} value={suburb.crime_rate_level} />
                    )}
                    {suburb.nearest_shopping_centre && (
                      <AmenityItem icon={ShoppingBag} label={labels.shoppingCentre} value={suburb.nearest_shopping_centre} />
                    )}
                  </div>
                )}

                {/* Investor: infrastructure projects */}
                {isInvestor && suburb.infrastructure_projects && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                    <Wrench className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">{labels.infrastructureProjects}: </span>
                      <span className="text-muted-foreground">{suburb.infrastructure_projects}</span>
                    </div>
                  </div>
                )}

                {/* Investor: house vs unit rental breakdown */}
                {isInvestor && (suburb.house_weekly_rent != null || suburb.unit_weekly_rent != null) && (
                  <div className="grid grid-cols-2 gap-3">
                    {suburb.house_weekly_rent != null && (
                      <MetricCard icon={Home} label={labels.houseRentalReturn} value={`$${suburb.house_weekly_rent}/wk`} />
                    )}
                    {suburb.unit_weekly_rent != null && (
                      <MetricCard icon={Building2} label={labels.unitRentalReturn} value={`$${suburb.unit_weekly_rent}/wk`} />
                    )}
                  </div>
                )}

                {/* Investor rental info */}
                {isInvestor && (suburb.rental_range_low != null || suburb.weekly_out_of_pocket != null) && (
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {suburb.rental_range_low != null && suburb.rental_range_high != null && (
                      <span>{labels.weeklyRent}: ${suburb.rental_range_low}-${suburb.rental_range_high}</span>
                    )}
                    {suburb.weekly_out_of_pocket != null && (
                      <span>{labels.estOutOfPocket}: ${suburb.weekly_out_of_pocket}/wk</span>
                    )}
                  </div>
                )}

                {suburb.reasoning && (
                  <p className="text-sm text-muted-foreground border-t pt-3">{suburb.reasoning}</p>
                )}

                {/* Property listings */}
                {suburbListings.length > 0 && (
                  <div className="border-t pt-3">
                    <button
                      className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                      onClick={() => toggleListings(suburb.id)}
                    >
                      <Building2 className="h-4 w-4" />
                      {showListings ? "Hide" : "View"} {suburbListings.length} property picks
                    </button>
                    {showListings && (
                      <div className="mt-3 grid gap-2">
                        {suburbListings.map((listing) => (
                          <div key={listing.id} className="p-3 rounded-lg bg-muted/30 text-sm space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-medium text-foreground">
                                  {listing.search_label ?? `${listing.bedrooms ?? "?"}-bed ${listing.property_type ?? ""}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {listing.property_type} · {listing.bedrooms ?? "?"} bed · {listing.bathrooms ?? "?"} bath
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold text-primary text-sm">{fmtPriceBand(listing)}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {listing.realestate_url && (
                                <a
                                  href={listing.realestate_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  realestate.com.au
                                </a>
                              )}
                              {listing.domain_url && (
                                <a
                                  href={listing.domain_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Domain
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Download report */}
                <div className="border-t pt-3 flex flex-wrap gap-2">
                  <SuburbReportButton suburbResultId={suburb.id} suburbName={suburb.suburb_name} />
                </div>
              </CardContent>
            </Card>
          );
        })}
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

const MetricCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="bg-muted/50 rounded-lg p-3 text-center">
    <Icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
    <div className="font-semibold text-foreground text-sm sm:text-base">{value}</div>
    <div className="text-[11px] sm:text-xs text-muted-foreground leading-tight">{label}</div>
  </div>
);

const AmenityItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
    <Icon className="h-4 w-4 text-primary shrink-0" />
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground capitalize truncate">{value}</div>
    </div>
  </div>
);

export default Results;
