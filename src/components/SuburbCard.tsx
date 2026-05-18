import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MapPin, TrendingUp, Home, AlertTriangle,
  Hospital, GraduationCap, Train, ShieldCheck, ShoppingBag,
  Wrench, Building2, ExternalLink, Bookmark, BookmarkCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { metricLabels } from "@/lib/metric-labels";

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

interface RiskConfig {
  [key: string]: {
    color: string;
    icon: any;
    label: string;
  };
}

interface SuburbCardProps {
  suburb: SuburbResult;
  index: number;
  isSelected: boolean;
  isBookmarked: boolean;
  isExpanded: boolean;
  listings: PropertyListing[];
  riskConfig: RiskConfig;
  isOwnerOccupier: boolean;
  isInvestor: boolean;
  beginnerMode: boolean;
  labels: ReturnType<typeof metricLabels>;
  onSelectChange: () => void;
  onBookmarkChange: () => void;
  onExpandListings: () => void;
}

const fmtPriceBand = (l: PropertyListing) => {
  if (l.price_min != null && l.price_max != null) {
    return `$${(l.price_min / 1000).toFixed(0)}k–$${(l.price_max / 1000).toFixed(0)}k`;
  }
  if (l.price != null) return `$${l.price.toLocaleString()}`;
  return "Price on request";
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

const SuburbCardComponent = ({
  suburb,
  index,
  isSelected,
  isBookmarked,
  isExpanded,
  listings,
  riskConfig,
  isOwnerOccupier,
  isInvestor,
  beginnerMode,
  labels,
  onSelectChange,
  onBookmarkChange,
  onExpandListings,
}: SuburbCardProps) => {
  const risk = riskConfig[suburb.risk_level as keyof RiskConfig] ?? riskConfig.medium;
  const RiskIcon = risk.icon;

  return (
    <Card
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
              onCheckedChange={onSelectChange}
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
              onClick={onBookmarkChange}
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
        {listings.length > 0 && (
          <div className="border-t pt-3">
            <button
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
              onClick={onExpandListings}
            >
              <Building2 className="h-4 w-4" />
              {isExpanded ? "Hide" : "View"} {listings.length} property picks
            </button>
            {isExpanded && (
              <div className="mt-3 grid gap-2">
                {listings.map((listing) => (
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
          <div>
            {/* Import SuburbReportButton if needed */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(SuburbCardComponent, (prev, next) => {
  // Custom comparison: only re-render if relevant props change
  return (
    prev.isSelected === next.isSelected &&
    prev.isBookmarked === next.isBookmarked &&
    prev.isExpanded === next.isExpanded &&
    prev.suburb.id === next.suburb.id &&
    prev.suburb.match_score === next.suburb.match_score &&
    prev.listings.length === next.listings.length
  );
});
