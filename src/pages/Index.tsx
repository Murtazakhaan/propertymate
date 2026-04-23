import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain, BookOpen, TrendingUp, ArrowRight, Shield, Sparkles,
  MapPin, Users, BarChart3, CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const valueProps = [
  {
    icon: Brain,
    title: "Smart Suburb Matching",
    description: "We evaluate hundreds of suburbs against your goals, budget, and risk appetite to find the best fit.",
  },
  {
    icon: BookOpen,
    title: "Beginner Friendly",
    description: "Toggle Beginner Mode to swap jargon for plain English. No finance degree required.",
  },
  {
    icon: TrendingUp,
    title: "Real Market Data",
    description: "Every recommendation is backed by actual market data including median prices, rental yields, vacancy rates, and growth trends.",
  },
];

const steps = [
  { number: "1", title: "Tell us your goals", description: "First home or investment? What's your budget and timeline?" },
  { number: "2", title: "Set your preferences", description: "Risk tolerance, location flexibility, property age — we tailor results to you." },
  { number: "3", title: "Get matched suburbs", description: "Suburbs are ranked with match scores, risk flags, and financial breakdowns." },
];

const stats = [
  { value: "2,000+", label: "Suburbs analysed", icon: MapPin },
  { value: "30+", label: "Data points per suburb", icon: BarChart3 },
  { value: "< 20s", label: "Time to results", icon: Sparkles },
  { value: "100%", label: "Australian focused", icon: Shield },
];

const features = [
  "Personalised suburb rankings",
  "Investor & owner-occupier paths",
  "Side-by-side suburb comparison",
  "Real property listings included",
  "Stamp duty estimates",
  "Infrastructure project insights",
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-investore-green/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="container relative py-16 sm:py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Smart Property Insights for Australia
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Find your next investment suburb{" "}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">in minutes</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Answer a few questions about your budget, goals, and comfort level. We'll match you with high-potential Australian suburbs in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to={user ? "/quiz" : "/login"}>
                <Button size="lg" className="text-base px-8 py-6 font-semibold w-full sm:w-auto">
                  Let's Find My Property
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
            Smarter suburb selection, made simple
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Whether you're a first-time buyer or seasoned investor, Investore gives you clarity.
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
              Everything you need to decide
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
              Three steps to your shortlist
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
            <Link to={user ? "/quiz" : "/login"}>
              <Button size="lg" className="font-semibold">
                Find My Property
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
              <Shield className="h-4 w-4" />
              <span>General guidance only, not financial advice</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Powered by real Australian property data</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
