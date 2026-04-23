import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, MapPin, Shield, AlertTriangle, Zap, TrendingUp, Home,
  Clock, Users, BarChart3, Hospital, GraduationCap, Train, ShieldCheck,
  ShoppingBag, Wrench, Building2,
} from "lucide-react";
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
  stamp_duty_estimate: number | null;
  capital_growth_rate: number | null;
  nearest_hospital: string | null;
  num_schools: number | null;
  has_train_station: boolean | null;
  crime_rate_level: string | null;
  nearest_shopping_centre: string | null;
  infrastructure_projects: string | null;
}

const formatPrice = (v: number | null) => (v != null ? `$${(v / 1000).toFixed(0)}k` : "-");
const formatPct = (v: number | null) => (v != null ? `${v}%` : "-");
const formatNum = (v: number | null) => (v != null ? `${v}` : "-");
const formatDollar = (v: number | null) => (v != null ? `$${v}` : "-");
const formatBool = (v: boolean | null) => (v === true ? "Yes" : v === false ? "No" : "-");

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
      <td className="py-3 px-3 sm:px-4 text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden text-xs">{label}</span>
      </td>
      {values.map((val, i) => (
        <td
          key={i}
          className={cn(
            "py-3 px-3 sm:px-4 text-sm text-center font-medium",
            i === bestIdx ? "text-primary font-bold" : "text-foreground"
          )}
        >
          {val ?? "-"}
        </td>
      ))}
    </tr>
  );
};

/** Mobile-friendly card for a single metric comparison */
const MobileMetricCard = ({
  label,
  icon: Icon,
  values,
  suburbs,
  highlight,
  rawValues,
}: MetricRowProps & { suburbs: SuburbResult[] }) => {
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
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {values.map((val, i) => (
          <div key={i} className="text-center">
            <div className={cn(
              "text-sm font-semibold",
              i === bestIdx ? "text-primary" : "text-foreground"
            )}>
              {val ?? "-"}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">{suburbs[i]?.suburb_name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Compare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { beginnerMode } = useApp();
  const suburbs: SuburbResult[] = location.state?.suburbs ?? [];
  const goal: string | null = location.state?.goal ?? null;
  const labels = metricLabels(beginnerMode);
  const isOwnerOccupier = goal === "first-home";
  const isInvestor = goal === "investment";

  const riskConfig = {
    low: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: Shield, label: labels.riskLow },
    medium: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: AlertTriangle, label: labels.riskMedium },
    high: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: Zap, label: labels.riskHigh },
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

  // Common metrics for both views
  const commonMetrics = [
    { label: labels.medianPrice, icon: Home, values: suburbs.map((s) => formatPrice(s.median_price)), highlight: "lowest" as const, rawValues: suburbs.map((s) => s.median_price) },
    { label: labels.capitalGrowth, icon: TrendingUp, values: suburbs.map((s) => formatPct(s.capital_growth_rate)), highlight: "highest" as const, rawValues: suburbs.map((s) => s.capital_growth_rate) },
    { label: labels.populationGrowth, icon: Users, values: suburbs.map((s) => formatPct(s.population_growth)), highlight: "highest" as const, rawValues: suburbs.map((s) => s.population_growth) },
  ];

  const ownerMetrics = isOwnerOccupier ? [
    { label: labels.stampDuty, icon: Building2, values: suburbs.map((s) => formatPrice(s.stamp_duty_estimate)), highlight: "lowest" as const, rawValues: suburbs.map((s) => s.stamp_duty_estimate) },
    { label: labels.nearestHospital, icon: Hospital, values: suburbs.map((s) => s.nearest_hospital ?? "-") },
    { label: labels.numSchools, icon: GraduationCap, values: suburbs.map((s) => formatNum(s.num_schools)), highlight: "highest" as const, rawValues: suburbs.map((s) => s.num_schools) },
    { label: labels.trainStation, icon: Train, values: suburbs.map((s) => formatBool(s.has_train_station)) },
    { label: labels.crimeRate, icon: ShieldCheck, values: suburbs.map((s) => s.crime_rate_level ? s.crime_rate_level.charAt(0).toUpperCase() + s.crime_rate_level.slice(1) : "-") },
    { label: labels.shoppingCentre, icon: ShoppingBag, values: suburbs.map((s) => s.nearest_shopping_centre ?? "-") },
  ] : [];

  const investorMetrics = isInvestor ? [
    { label: labels.rentalYield, icon: TrendingUp, values: suburbs.map((s) => formatPct(s.rental_yield)), highlight: "highest" as const, rawValues: suburbs.map((s) => s.rental_yield) },
    { label: labels.vacancyRate, icon: AlertTriangle, values: suburbs.map((s) => formatPct(s.vacancy_rate)), highlight: "lowest" as const, rawValues: suburbs.map((s) => s.vacancy_rate) },
    { label: labels.daysOnMarket, icon: Clock, values: suburbs.map((s) => formatNum(s.days_on_market)), highlight: "lowest" as const, rawValues: suburbs.map((s) => s.days_on_market) },
    { label: labels.weeklyRentLow, icon: Home, values: suburbs.map((s) => formatDollar(s.rental_range_low)) },
    { label: labels.weeklyRentHigh, icon: Home, values: suburbs.map((s) => formatDollar(s.rental_range_high)) },
    { label: labels.outOfPocket, icon: TrendingUp, values: suburbs.map((s) => formatDollar(s.weekly_out_of_pocket)), highlight: "lowest" as const, rawValues: suburbs.map((s) => s.weekly_out_of_pocket) },
  ] : [];

  const allMetrics = [...commonMetrics, ...ownerMetrics, ...investorMetrics];

  return (
    <div className="container max-w-6xl py-8 md:py-16 px-4 sm:px-6">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 md:mb-8">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{labels.compareTitle}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{labels.compareDesc}</p>
        </div>
      </div>

      {/* Mobile: Card-based comparison */}
      <div className="md:hidden space-y-4">
        {/* Suburb headers */}
        <div className="grid grid-cols-2 gap-3">
          {suburbs.map((s) => {
            const risk = riskConfig[s.risk_level as keyof typeof riskConfig] ?? riskConfig.medium;
            return (
              <Card key={s.id} className="text-center">
                <CardContent className="pt-4 pb-3 px-3">
                  <div className="flex items-center justify-center gap-1 text-sm font-bold text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {s.suburb_name}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.state} {s.postcode ?? ""}</div>
                  <div className="text-2xl font-bold text-primary mt-2">{s.match_score}%</div>
                  <div className="flex justify-center gap-1 mt-1.5 flex-wrap">
                    {s.best_for_tag && <Badge variant="secondary" className="text-[10px]">{s.best_for_tag}</Badge>}
                    {!isOwnerOccupier && <Badge className={cn("text-[10px]", risk.color)}>{risk.label}</Badge>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-3">
          {allMetrics.map((m) => (
            <MobileMetricCard key={m.label} suburbs={suburbs} {...m} />
          ))}
        </div>

        {/* Reasoning */}
        {suburbs.map((s) => (
          <Card key={s.id}>
            <CardContent className="pt-4 pb-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                {labels.whyThisSuburb} — {s.suburb_name}
              </div>
              <p className="text-sm text-foreground">{s.reasoning ?? "-"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: Table comparison */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
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
                        {s.best_for_tag && <Badge variant="secondary" className="text-xs">{s.best_for_tag}</Badge>}
                        {!isOwnerOccupier && <Badge className={cn("text-xs", risk.color)}>{risk.label}</Badge>}
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

            {allMetrics.map((m) => (
              <MetricRow key={m.label} {...m} />
            ))}

            {/* Infrastructure (investor) */}
            {isInvestor && (
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  {labels.infrastructureProjects}
                </td>
                {suburbs.map((s) => (
                  <td key={s.id} className="py-3 px-4 text-sm text-muted-foreground align-top">
                    {s.infrastructure_projects ?? "-"}
                  </td>
                ))}
              </tr>
            )}

            {/* Reasoning */}
            <tr>
              <td className="py-4 px-4 text-sm font-medium text-muted-foreground align-top">
                {labels.whyThisSuburb}
              </td>
              {suburbs.map((s) => (
                <td key={s.id} className="py-4 px-4 text-sm text-muted-foreground align-top">
                  {s.reasoning ?? "-"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-8 md:mt-10">
        <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to Results
        </Button>
      </div>
    </div>
  );
};

export default Compare;
