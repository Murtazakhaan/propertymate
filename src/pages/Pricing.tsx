import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Crown, Loader2, X, Shield, Lock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const freeFeatures = [
  { label: "Basic suburb search", included: true },
  { label: "Limited quiz results (top 3)", included: true },
  { label: "Glossary access", included: true },
  { label: "Full AI-powered recommendations", included: false },
  { label: "Compare suburbs side-by-side", included: false },
  { label: "Save to shortlist", included: false },
  { label: "Property listing insights", included: false },
  { label: "Priority support", included: false },
];

const proFeatures = [
  { label: "Everything in Free", included: true },
  { label: "Full AI-powered recommendations", included: true },
  { label: "Detailed property analytics & metrics", included: true },
  { label: "Compare suburbs side-by-side", included: true },
  { label: "Save suburbs to your shortlist", included: true },
  { label: "Property listing insights", included: true },
  { label: "Priority support", included: true },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. You can cancel your subscription at any time from the Stripe Customer Portal. You'll continue to have access until the end of your current billing period.",
  },
  {
    q: "How does billing work?",
    a: "You'll be charged $20 AUD per month. Your subscription renews automatically each month until you cancel.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) through Stripe's secure payment platform.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. All payments are processed by Stripe with 256-bit SSL encryption. We never store your card details on our servers.",
  },
];

const Pricing = () => {
  const { user, subscribed, subscriptionEnd, cancelAtPeriodEnd, subscriptionStatus, checkingSubscription } = useAuth();
  const navigate = useNavigate();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoadingCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.code === "ALREADY_SUBSCRIBED") {
        toast.info("You already have an active subscription.");
        return;
      }
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleManage = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to open portal");
    } finally {
      setLoadingPortal(false);
    }
  };

  const renewalLabel = cancelAtPeriodEnd
    ? `Cancels on ${subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "—"}`
    : `Renews ${subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : ""}`;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/90 to-primary py-16 md:py-24">
        <div className="container max-w-3xl text-center text-primary-foreground">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto">
            Start free or go Pro for the full power of AI-driven Australian property analysis
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="container max-w-4xl -mt-10 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <Card className="border-border">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">Free</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground ml-1">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f.label} className="flex items-start gap-2">
                    {f.included ? (
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground/40 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm ${!f.included ? "text-muted-foreground/50" : ""}`}>{f.label}</span>
                  </li>
                ))}
              </ul>
              {!user && (
                <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
                  Get Started Free
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-primary/40 shadow-lg shadow-primary/10 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Pro</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">$20</span>
                <span className="text-muted-foreground ml-1">AUD / month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {proFeatures.map((f) => (
                  <li key={f.label} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">{f.label}</span>
                  </li>
                ))}
              </ul>

              {subscribed ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-primary/10 p-3 text-center text-sm">
                    <p className="font-medium text-primary">You're subscribed ✓</p>
                    <p className="text-muted-foreground mt-1">{renewalLabel}</p>
                    {subscriptionStatus === "past_due" && (
                      <p className="text-destructive text-xs mt-1 font-medium">
                        ⚠️ Payment failed — please update your payment method
                      </p>
                    )}
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleManage} disabled={loadingPortal}>
                    {loadingPortal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Manage Subscription
                  </Button>
                </div>
              ) : (
                <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loadingCheckout || checkingSubscription}>
                  {loadingCheckout ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {user ? "Subscribe Now" : "Sign In to Subscribe"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            <span>Powered by Stripe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-4 w-4" />
            <span>256-bit encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" />
            <span>Cancel anytime</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
