/** Beginner-friendly metric labels and tooltips */
export const metricLabels = (beginner: boolean) => ({
  matchScore: beginner ? "How well it fits you" : "Match Score",
  medianPrice: beginner ? "Typical home price" : "Median Price",
  rentalYield: beginner ? "Rent income %" : "Rental Yield",
  vacancyRate: beginner ? "Empty rentals %" : "Vacancy Rate",
  populationGrowth: beginner ? "Area growth" : "Population Growth",
  daysOnMarket: beginner ? "How fast homes sell" : "Days on Market",
  weeklyRentLow: beginner ? "Cheapest weekly rent" : "Weekly Rent (Low)",
  weeklyRentHigh: beginner ? "Highest weekly rent" : "Weekly Rent (High)",
  outOfPocket: beginner ? "Your weekly cost" : "Out-of-Pocket /wk",
  weeklyRent: beginner ? "Weekly rent range" : "Weekly rent",
  estOutOfPocket: beginner ? "Est. your weekly cost" : "Est. out-of-pocket",
  riskLow: beginner ? "Safer bet" : "Low Risk",
  riskMedium: beginner ? "Some risk" : "Medium Risk",
  riskHigh: beginner ? "Higher risk" : "High Risk",
  whyThisSuburb: beginner ? "Why we picked this" : "Why this suburb?",
  topMatches: beginner ? "Your Best Suburb Matches" : "Your Top Suburb Matches",
  topMatchesDesc: beginner
    ? "These suburbs suit your answers best. Take a look."
    : "Suburbs ranked by how well they fit your criteria.",
  compareTitle: beginner ? "Compare Your Suburbs" : "Compare Suburbs",
  compareDesc: beginner
    ? "See how your picked suburbs stack up against each other"
    : "Side-by-side comparison of your selected suburbs",
});
