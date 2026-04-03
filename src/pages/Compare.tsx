import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Shield, AlertTriangle, Zap, TrendingUp, Home, Clock, Users, BarChart3 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
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

const formatPrice = (v: number | null) => (v != null ? `$${(v / 1000).toFixed(0)}k` : "-");
const formatPct = (v: number | null) => (v != null ? `${v}%` : "-");
const formatNum = (v: number | null) => (v != null ? `${v}` : "-");
const formatDollar = (v: number | null) => (v != null ? `$${v}` : "-");

interface MetricRowProps {
  label: string;
  icon: React.ElementType;
  values: (string | null)[];
  highlight?: "highest" | "lowest";
  rawValues?: (number | null)[];
}

const MetricRow = ({ label, icon: Icon, values, highlight, rawValues }: MetricRowProps) => {
  let bestIdx = -1;
  if (highlight && rawValues) {
    const filtered = rawValues.map((v, i) => (v != null ? { v, i } : null)).filter(Boolean) as { v: number; i: number }[];
    if (filtered.length > 0) {
      bestIdx = highlight === "highest"
        ? filtered.reduce((a, b) => (b.v > a.v ? b : a)).i
        : filtered.reduce((a, b) => (b.v < a.v ? b : a)).i;
    }
  }

  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="py-3 px-4 text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </td>
      {values.map((val, i) => (
        <td
          key={i}
          className={cn(
            "py-3 px-4 text-sm text-center font-medium",
            i === bestIdx ? "text-primary font-bold" : "text-foreground"
          )}
        >
          {val ?? "-"}
        </td>
      ))}
    </tr>
  );
};

const Compare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { beginnerMode } = useApp();
  const suburbs: SuburbResult[] = location.state?.suburbs ?? [];
  const labels = metricLabels(beginnerMode);

  const riskConfig = {
    low: { color: "bg-green-100 text-green-800", icon: Shield, label: labels.riskLow },
    medium: { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle, label: labels.riskMedium },
    high: { color: "bg-red-100 text-red-800", icon: Zap, label: labels.riskHigh },
  };

  if (suburbs.length < 2) {
    return (
      <div className="container max-w-4xl py-10 md:py-16 text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Not enough suburbs to compare</h1>
        <p className="text-muted-foreground">Please go back to results and select at least 2 suburbs.</p>
        <Link to="/results">
          <Button size="lg"><ArrowLeft className="mr-2 h-4 w-4" />Back to Results</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{labels.compareTitle}</h1>
          <p className="text-sm text-muted-foreground">{labels.compareDesc}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="py-4 px-4 text-left text-sm font-medium text-muted-foreground w-44">
                {beginnerMode ? "What we're comparing" : "Metric"}
              </th>
              {suburbs.map((s) => {
                const risk = riskConfig[s.risk_level as keyof typeof riskConfig] ?? riskConfig.medium;
                return (
                  <th key={s.id} className="py-4 px-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-base font-bold text-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        {s.suburb_name}
                      </div>
                      <div className="text-xs text-muted-foreground">{s.state} {s.postcode ?? ""}</div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        {s.best_for_tag && (
                          <Badge variant="secondary" className="text-xs">{s.best_for_tag}</Badge>
                        )}
                        <Badge className={cn("text-xs", risk.color)}>{risk.label}</Badge>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Match Score */}
            <tr className="border-b border-border/50 bg-primary/5">
              <td className="py-3 px-4 text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {labels.matchScore}
              </td>
              {suburbs.map((s) => (
                <td key={s.id} className="py-3 px-4 text-center">
                  <span className="text-2xl font-bold text-primary">{s.match_score}%</span>
                </td>
              ))}
            </tr>

            <MetricRow
              label={labels.medianPrice}
              icon={Home}
              values={suburbs.map((s) => formatPrice(s.median_price))}
              highlight="lowest"
              rawValues={suburbs.map((s) => s.median_price)}
            />
            <MetricRow
              label={labels.rentalYield}
              icon={TrendingUp}
              values={suburbs.map((s) => formatPct(s.rental_yield))}
              highlight="highest"
              rawValues={suburbs.map((s) => s.rental_yield)}
            />
            <MetricRow
              label={labels.vacancyRate}
              icon={AlertTriangle}
              values={suburbs.map((s) => formatPct(s.vacancy_rate))}
              highlight="lowest"
              rawValues={suburbs.map((s) => s.vacancy_rate)}
            />
            <MetricRow
              label={labels.populationGrowth}
              icon={Users}
              values={suburbs.map((s) => formatPct(s.population_growth))}
              highlight="highest"
              rawValues={suburbs.map((s) => s.population_growth)}
            />
            <MetricRow
              label={labels.daysOnMarket}
              icon={Clock}
              values={suburbs.map((s) => formatNum(s.days_on_market))}
              highlight="lowest"
              rawValues={suburbs.map((s) => s.days_on_market)}
            />
            <MetricRow
              label={labels.weeklyRentLow}
              icon={Home}
              values={suburbs.map((s) => formatDollar(s.rental_range_low))}
            />
            <MetricRow
              label={labels.weeklyRentHigh}
              icon={Home}
              values={suburbs.map((s) => formatDollar(s.rental_range_high))}
            />
            <MetricRow
              label={labels.outOfPocket}
              icon={TrendingUp}
              values={suburbs.map((s) => formatDollar(s.weekly_out_of_pocket))}
              highlight="lowest"
              rawValues={suburbs.map((s) => s.weekly_out_of_pocket)}
            />

            {/* Reasoning */}
            <tr>
              <td className="py-4 px-4 text-sm font-medium text-muted-foreground align-top">
                {labels.whyThisSuburb}
              </td>
              {suburbs.map((s) => (
                <td key={s.id} className="py-4 px-4 text-sm text-muted-foreground align-top">
                  {s.reasoning ?? "—"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-10">
        <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to Results
        </Button>
      </div>
    </div>
  );
};

export default Compare;
