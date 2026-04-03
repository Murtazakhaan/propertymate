import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, MapPin, TrendingUp, Home, Clock, AlertTriangle, Shield, Zap, RotateCcw, GitCompareArrows } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuiz } from "@/contexts/QuizContext";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { metricLabels } from "@/lib/metric-labels";

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
}

const Results = () => {
  const { answers } = useQuiz();
  const { beginnerMode } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [results, setResults] = useState<SuburbResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const labels = metricLabels(beginnerMode);

  const riskConfig = {
    low: { color: "bg-green-100 text-green-800", icon: Shield, label: labels.riskLow },
    medium: { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle, label: labels.riskMedium },
    high: { color: "bg-red-100 text-red-800", icon: Zap, label: labels.riskHigh },
  };

  useEffect(() => {
    if (!answers.goal || !answers.timeline) {
      setLoading(false);
      setError("no-quiz");
      return;
    }
    fetchResults();
  }, []);

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
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setResults(data.results ?? []);
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

  const handleCompare = () => {
    const suburbs = results.filter((r) => selected.has(r.id));
    navigate("/compare", { state: { suburbs } });
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-10 md:py-16">
        <div className="text-center space-y-6 py-20">
          <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {beginnerMode ? "Finding suburbs for you…" : "Analysing suburbs…"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {beginnerMode
                ? "We're searching through thousands of suburbs to find the best ones for you. Hang tight, about 10 to 20 seconds."
                : "Crunching market data to find your best matches. This usually takes 10 to 20 seconds."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error === "no-quiz") {
    return (
      <div className="container max-w-4xl py-10 md:py-16 text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">No quiz data found</h1>
        <p className="text-muted-foreground">Please complete the quiz first so we can analyse suburbs for you.</p>
        <Link to="/quiz">
          <Button size="lg"><ArrowLeft className="mr-2 h-4 w-4" />Take the Quiz</Button>
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
          <Link to="/quiz"><Button><ArrowLeft className="mr-2 h-4 w-4" />Retake Quiz</Button></Link>
        </div>
      </div>
    );
  }

  const sortedResults = [...results].sort((a, b) => b.match_score - a.match_score);

  return (
    <div className="container max-w-5xl py-10 md:py-16">
      <div className="text-center space-y-2 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{labels.topMatches}</h1>
        <p className="text-muted-foreground">{labels.topMatchesDesc}</p>
      </div>

      {selected.size >= 2 && (
        <div className="sticky top-4 z-20 mb-6 flex items-center justify-between bg-primary text-primary-foreground rounded-lg px-5 py-3 shadow-lg">
          <span className="text-sm font-medium">{selected.size} suburbs selected</span>
          <Button size="sm" variant="secondary" onClick={handleCompare}>
            <GitCompareArrows className="mr-2 h-4 w-4" />Compare Now
          </Button>
        </div>
      )}

      <div className="grid gap-6">
        {sortedResults.map((suburb, index) => {
          const risk = riskConfig[suburb.risk_level as keyof typeof riskConfig] ?? riskConfig.medium;
          const RiskIcon = risk.icon;
          const isSelected = selected.has(suburb.id);

          return (
            <Card
              key={suburb.id}
              className={cn(
                "overflow-hidden transition-all",
                isSelected && "ring-2 ring-primary"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(suburb.id)}
                      className="mt-1"
                      aria-label={`Select ${suburb.suburb_name} for comparison`}
                    />
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg shrink-0",
                      index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        <MapPin className="inline h-4 w-4 mr-1 text-primary" />
                        {suburb.suburb_name}, {suburb.state} {suburb.postcode ?? ""}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {suburb.best_for_tag && (
                          <Badge variant="secondary" className="text-xs">{suburb.best_for_tag}</Badge>
                        )}
                        <Badge className={cn("text-xs", risk.color)}>
                          <RiskIcon className="h-3 w-3 mr-1" />{risk.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{suburb.match_score}%</div>
                    <div className="text-xs text-muted-foreground">
                      {beginnerMode ? "Fit" : "Match"}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {suburb.median_price != null && (
                    <MetricCard icon={Home} label={labels.medianPrice} value={`$${(suburb.median_price / 1000).toFixed(0)}k`} />
                  )}
                  {answers.goal !== "first-home" && suburb.rental_yield != null && (
                    <MetricCard icon={TrendingUp} label={labels.rentalYield} value={`${suburb.rental_yield}%`} />
                  )}
                  {suburb.vacancy_rate != null && (
                    <MetricCard icon={AlertTriangle} label={labels.vacancyRate} value={`${suburb.vacancy_rate}%`} />
                  )}
                  {answers.goal !== "first-home" && suburb.days_on_market != null && (
                    <MetricCard icon={Clock} label={labels.daysOnMarket} value={`${suburb.days_on_market}`} />
                  )}
                </div>

                {(suburb.rental_range_low != null || suburb.weekly_out_of_pocket != null) && (
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {suburb.rental_range_low != null && suburb.rental_range_high != null && (
                      <span>{labels.weeklyRent}: ${suburb.rental_range_low}–${suburb.rental_range_high}</span>
                    )}
                    {suburb.weekly_out_of_pocket != null && (
                      <span>{labels.estOutOfPocket}: ${suburb.weekly_out_of_pocket}/wk</span>
                    )}
                  </div>
                )}

                {suburb.reasoning && (
                  <p className="text-sm text-muted-foreground border-t pt-3">{suburb.reasoning}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center gap-3 mt-10">
        <Link to="/quiz">
          <Button variant="outline" size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />Retake Quiz
          </Button>
        </Link>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="bg-muted/50 rounded-lg p-3 text-center">
    <Icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
    <div className="font-semibold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export default Results;
