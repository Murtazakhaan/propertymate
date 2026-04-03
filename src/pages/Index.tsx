import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, BookOpen, TrendingUp, ArrowRight, Shield, Sparkles } from "lucide-react";

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

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-investore-green/5" />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Smart Property Insights for Australia
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Find your next investment suburb{" "}
              <span className="text-primary">in minutes</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Answer a few questions about your budget, goals, and comfort level. We'll match you with high-potential Australian suburbs in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/quiz">
                <Button size="lg" className="text-base px-8 py-6 font-semibold">
                  Let's Find My Property
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="text-base px-8 py-6">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Smarter suburb selection, made simple
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Whether you're a first-time buyer or seasoned investor, Investore gives you clarity.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {valueProps.map((prop, i) => (
            <Card
              key={prop.title}
              className="border bg-card hover:shadow-lg transition-shadow animate-fade-in"
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

      {/* How it works */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Three steps to your shortlist
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center space-y-3 animate-fade-in"
                style={{ animationDelay: `${0.15 * (i + 1)}s` }}
              >
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/quiz">
              <Button size="lg" className="font-semibold">
                Find My Property
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="container py-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            <span>General guidance only, not financial advice</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Powered by real Australian property data</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
