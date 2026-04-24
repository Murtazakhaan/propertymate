import { Card, CardContent } from "@/components/ui/card";
import { Database, BarChart3, Eye, Target, Bell } from "lucide-react";

const pillars = [
  {
    icon: Database,
    title: "Replace the Buyer's Agent",
    text: "PropertyMate replaces the $10,000+ fees of traditional buyer's agents with technology — giving you the same suburb intelligence in minutes.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Decisions",
    text: "Every recommendation is backed by government statistics, infrastructure spending pipelines, demographic shifts, and live property market data.",
  },
  {
    icon: Eye,
    title: "Clarity, Not Confusion",
    text: "No jargon. No overwhelm. You're told exactly where to invest, why those suburbs, and which properties match your criteria.",
  },
  {
    icon: Target,
    title: "Actionable Insights",
    text: "Not just education — real properties on realestate.com.au and Domain, deep-linked to your budget, beds, and suburb shortlist.",
  },
  {
    icon: Bell,
    title: "Real-Time Opportunities",
    text: "Instant SMS, email, and in-app alerts ensure you act quickly when a property matching your criteria hits the market.",
  },
];

const About = () => (
  <div className="container max-w-3xl py-10 md:py-16 space-y-10">
    <div className="text-center space-y-3">
      <h1 className="text-3xl font-bold text-foreground">How PropertyMate Works</h1>
      <p className="text-muted-foreground max-w-xl mx-auto">
        PropertyMate is a digital property strategist — democratising property investing by replacing
        expensive buyer's agents with a data-driven, technology-led platform.
      </p>
    </div>

    <div className="grid gap-6">
      {pillars.map((item) => (
        <Card key={item.title}>
          <CardContent className="flex gap-4 py-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card className="bg-muted/40">
      <CardContent className="py-6 space-y-2">
        <h3 className="font-semibold text-foreground">Not Financial Advice</h3>
        <p className="text-sm text-muted-foreground">
          PropertyMate provides general guidance only. We are not licensed financial advisors.
          Always consult a qualified professional before making purchasing decisions. Property data
          is sourced from publicly available datasets including ABS, state infrastructure registers,
          realestate.com.au, and Domain.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default About;
