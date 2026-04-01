import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const terms = [
  { term: "Capital Growth", plain: "How much a property's value increases over time", definition: "The increase in the value of a property over a period of time, usually expressed as a percentage." },
  { term: "Rental Yield", plain: "How much rent you earn compared to the property price", definition: "Annual rental income expressed as a percentage of the property's purchase price. Gross yield = (annual rent / purchase price) × 100." },
  { term: "Vacancy Rate", plain: "How quickly rentals get filled", definition: "The percentage of rental properties in an area that are unoccupied at a given time. Lower vacancy = higher rental demand." },
  { term: "Negative Gearing", plain: "When your property costs more than it earns (but you get tax benefits)", definition: "When the costs of owning a rental property exceed the income it generates, creating a tax-deductible loss." },
  { term: "LVR (Loan-to-Value Ratio)", plain: "How much of the property's value you're borrowing", definition: "The amount of your loan compared to the value of the property, expressed as a percentage. An LVR above 80% usually requires Lenders Mortgage Insurance." },
  { term: "Median Price", plain: "The middle price — half sold for more, half for less", definition: "The middle sale price in an area when all sales are ranked from lowest to highest." },
  { term: "Stamp Duty", plain: "A government tax you pay when buying property", definition: "A state government tax calculated as a percentage of the property's purchase price. Varies by state and buyer type." },
  { term: "Depreciation", plain: "Tax deductions for the property wearing out over time", definition: "The decline in value of a building and its fixtures over time, which can be claimed as a tax deduction for investment properties." },
  { term: "Body Corporate / Strata Fees", plain: "Shared maintenance costs for apartments or townhouses", definition: "Ongoing fees paid by owners in a strata-titled property to cover shared building maintenance, insurance, and management." },
  { term: "Settlement", plain: "The final step where ownership officially transfers to you", definition: "The legal process of transferring property ownership from the seller to the buyer, typically 30–90 days after contracts are exchanged." },
  { term: "Cash Flow", plain: "Money coming in minus money going out each week", definition: "The difference between rental income received and all expenses (mortgage, rates, insurance, maintenance) associated with an investment property." },
  { term: "Infrastructure Spend", plain: "Government money going into roads, trains, hospitals nearby", definition: "Government or private investment in transport, utilities, schools, and amenities that can increase property values in an area." },
];

const Glossary = () => {
  const [search, setSearch] = useState("");

  const filtered = terms.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container max-w-3xl py-10 md:py-16 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-foreground">Property Glossary</h1>
        <p className="text-muted-foreground">Common property terms explained in plain English.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((t) => (
          <div key={t.term} className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold text-foreground">{t.term}</h3>
            <p className="text-sm text-primary/80 mt-0.5">{t.plain}</p>
            <p className="text-sm text-muted-foreground mt-2">{t.definition}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No matching terms found.</p>
        )}
      </div>
    </div>
  );
};

export default Glossary;
