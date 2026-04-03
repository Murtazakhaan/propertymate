import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  TrendingUp,
  Home,
  DollarSign,
  Clock,
  Users,
  AlertTriangle,
  Shield,
  Zap,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type SuburbResult = Tables<"suburb_results">;

const riskConfig = {
  low: { label: "Low Risk", color: "bg-green-100 text-green-800 border-green-200", icon: Shield },
  medium: { label: "Medium Risk", color: "bg-amber-100 text-amber-800 border-amber-200", icon: AlertTriangle },
  high: { label: "High Risk", color: "bg-red-100 text-red-800 border-red-200", icon: Zap },
};

const confidenceConfig = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-green-100 text-green-800",
};

const Results = () => {
  const [searchParams] = useSearchParams();
  const submissionId = searchParams.get("id");
  const [results, setResults] = useState<SuburbResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) {
      setError("No submission ID found. Please retake the quiz.");
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      const { data, error: fetchErr } = await supabase
        .from("suburb_results")
        .select("*")
        .eq("quiz_submission_id", submissionId)
        .order("match_score", { ascending: false });

      if (fetchErr) {
        setError(fetchErr.message);
      } else if (!data || data.length === 0) {
        setError("No results found. The analysis may still be processing.");
      } else {
        setResults(data);
      }
      setLoading(false);
    };

    fetchResults();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="container max-w-4xl py-16 text-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
        <h1 className="text-2xl font-bold text-foreground">Analysing suburbs…</h1>
        <p className="text-muted-foreground">Our AI is crunching property data, infrastructure plans, and market trends.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-16 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground">{error}</p>
        <Link to="/quiz">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retake Quiz
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-10 md:py-16">
      <div className="text-center space-y-2 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Your Top Suburb Matches</h1>
        <p className="text-muted-foreground">
          AI-powered recommendations based on your profile, market data, and infrastructure outlook.
        </p>
      </div>

      <div className="space-y-6">
        {results.map((suburb, index) => {
          const risk = riskConfig[suburb.risk_level as keyof typeof riskConfig] ?? riskConfig.medium;
          const RiskIcon = risk.icon;
          const conf = confidenceConfig[(suburb.confidence as keyof typeof confidenceConfig) ?? "medium"];

          return (
            <Card key={suburb.id} className="overflow-hidden border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      <CardTitle className="text-xl">
                        {suburb.suburb_name}, {suburb.state}
                      </CardTitle>
                      {suburb.postcode && (
                        <span className="text-sm text-muted-foreground">{suburb.postcode}</span>
                      )}
                    </div>
                    {suburb.best_for_tag && (
                      <Badge variant="secondary" className="text-xs font-medium">
                        {suburb.best_for_tag}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-bold text-primary">{suburb.match_score}</div>
                    <div className="text-xs text-muted-foreground">Match Score</div>
                  </div>
                </div>
                <Progress value={suburb.match_score} className="h-2 mt-2" />
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Risk & Confidence badges */}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className={cn("gap-1", risk.color)}>
                    <RiskIcon className="h-3 w-3" />
                    {risk.label}
                  </Badge>
                  <Badge variant="outline" className={cn("gap-1", conf)}>
                    {suburb.confidence === "high" ? "High" : suburb.confidence === "low" ? "Low" : "Medium"} Confidence
                  </Badge>
                </div>

                {/* Financial metrics grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetricCard
                    icon={Home}
                    label="Median Price"
                    value={suburb.median_price ? `$${(suburb.median_price / 1000).toFixed(0)}k` : "N/A"}
                  />
                  <MetricCard
                    icon={TrendingUp}
                    label="Rental Yield"
                    value={suburb.rental_yield ? `${Number(suburb.rental_yield).toFixed(1)}%` : "N/A"}
                  />
                  <MetricCard
                    icon={BarChart3}
                    label="Vacancy Rate"
                    value={suburb.vacancy_rate ? `${Number(suburb.vacancy_rate).toFixed(1)}%` : "N/A"}
                  />
                  <MetricCard
                    icon={Users}
                    label="Pop. Growth"
                    value={suburb.population_growth ? `${Number(suburb.population_growth).toFixed(1)}%` : "N/A"}
                  />
                  <MetricCard
                    icon={DollarSign}
                    label="Weekly Rent"
                    value={
                      suburb.rental_range_low && suburb.rental_range_high
                        ? `$${suburb.rental_range_low}–$${suburb.rental_range_high}`
                        : "N/A"
                    }
                  />
                  <MetricCard
                    icon={Clock}
                    label="Days on Market"
                    value={suburb.days_on_market ? `${suburb.days_on_market}` : "N/A"}
                  />
                  <MetricCard
                    icon={MapPin}
                    label="Out-of-Pocket"
                    value={
                      suburb.weekly_out_of_pocket != null
                        ? `$${suburb.weekly_out_of_pocket}/wk`
                        : "N/A"
                    }
                    highlight={suburb.weekly_out_of_pocket != null && suburb.weekly_out_of_pocket <= 0}
                  />
                </div>

                {/* Reasoning */}
                {suburb.reasoning && (
                  <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed">
                    <p className="font-medium text-foreground mb-1">Why this suburb?</p>
                    {suburb.reasoning}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 mt-10">
        <Link to="/quiz">
          <Button variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retake Quiz
          </Button>
        </Link>
      </div>
    </div>
  );
};

function MetricCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border p-3 space-y-1", highlight && "border-green-300 bg-green-50")}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={cn("text-sm font-semibold", highlight ? "text-green-700" : "text-foreground")}>
        {value}
      </div>
    </div>
  );
}

export default Results;
