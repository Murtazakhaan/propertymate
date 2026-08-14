import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Database, BookOpen, TrendingUp, ArrowRight, Shield, Sparkles,
  MapPin, Users, BarChart3, CheckCircle2, Bell, FileText,
} from "lucide-react";

const valueProps = [
  {
    icon: Database,
    title: "Replace the Buyer's Agent",
    description: "Skip the $10,000+ fees. PropertyMate gives you the same suburb intelligence — instantly, for a fraction of the cost.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven, Not Guesswork",
    description: "Every recommendation is built on government data, infrastructure pipelines, demographics, and live market trends.",
  },
  {
    icon: Bell,
    title: "Real-Time Match Alerts",
    description: "Get instant SMS, email, and in-app alerts the moment a property matching your criteria hits the market.",
  },
];

const steps = [
  { number: "1", title: "Tell us your goals", description: "Budget, timeline, owner-occupier or investor — a few quick questions." },
  { number: "2", title: "Get your top 3 suburbs", description: "Ranked by growth, yield, and risk — with the data behind every pick." },
  { number: "3", title: "See matching properties", description: "Live listings on realestate.com.au and Domain, deep-linked to your criteria." },
];

const stats = [
  { value: "$10k+", label: "Saved vs buyer's agent", icon: Shield },
  { value: "Top 3", label: "High-growth suburbs", icon: TrendingUp },
  { value: "30+", label: "Data points per suburb", icon: BarChart3 },
  { value: "< 20s", label: "Time to results", icon: Sparkles },
];

const features = [
  "Top 3 high-growth suburbs",
  "Government & infrastructure data",
  "Live realestate.com.au + Domain links",
  "Downloadable suburb profile reports",
  "SMS, email & in-app match alerts",
  "Side-by-side suburb comparison",
];

const Index = () => {

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-brand-green/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="container relative py-16 sm:py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Skip the buyer's agent.{" "}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Find your next property with data.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              PropertyMate gives you the top 3 high-growth Australian suburbs and matching listings — backed by government, infrastructure, and live market data. No $10,000 buyer's agent fees.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/quiz">
                <Button size="lg" className="text-base px-8 py-6 font-semibold w-full sm:w-auto">
                  Find My Top 3 Suburbs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="text-base px-8 py-6 w-full sm:w-auto">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y bg-muted/30">
        <div className="container py-8 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-1">
                <stat.icon className="h-5 w-5 mx-auto text-primary mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="container py-14 md:py-24">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Buyer's agent intelligence — without the price tag
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
            PropertyMate combines government data, infrastructure intelligence, and market analytics in one platform.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {valueProps.map((prop, i) => (
            <Card
              key={prop.title}
              className="border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
            >
              <CardContent className="pt-6 pb-6 px-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <prop.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{prop.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{prop.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features checklist */}
      <section className="bg-primary/5 py-14 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
              Everything you need to act with confidence
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-3 bg-background rounded-lg px-4 py-3 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 md:py-24">
        <div className="container">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Three steps to your top 3 suburbs
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center space-y-3 animate-fade-in"
                style={{ animationDelay: `${0.15 * (i + 1)}s` }}
              >
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg shadow-primary/25">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 md:mt-12">
            <Link to="/quiz">
              <Button size="lg" className="font-semibold">
                Find My Top 3 Suburbs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-t bg-muted/30 py-8">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-muted-foreground">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>Downloadable suburb profile reports included</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              <span>General guidance only, not financial advice</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
