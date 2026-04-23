import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Loader2, XCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect, ReactNode } from "react";

const features = [
  "AI-powered suburb recommendations",
  "Detailed property analytics & metrics",
  "Compare suburbs side-by-side",
  "Save suburbs to your shortlist",
  "Property listing insights",
  "Priority support",
];

interface PaywallProps {
  children: ReactNode;
}

const Paywall = ({ children }: PaywallProps) => {
  const { user, subscribed, subscriptionStatus, cancelAtPeriodEnd, subscriptionEnd, checkingSubscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const checkoutStatus = searchParams.get("checkout");

  useEffect(() => {
    if (checkoutStatus === "success") {
      refreshSubscription();
    }
  }, [checkoutStatus, refreshSubscription]);

  const dismissCheckoutStatus = () => {
    searchParams.delete("checkout");
    setSearchParams(searchParams, { replace: true });
  };

  // If subscribed and no checkout banner, render children (with optional warnings)
  if (subscribed && !checkoutStatus) {
    return (
      <>
        {subscriptionStatus === "past_due" && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 text-sm flex items-center gap-2 justify-center">
            <AlertTriangle className="h-4 w-4" />
            <span>Payment failed. Please update your payment method to keep your subscription active.</span>
            <Button variant="outline" size="sm" className="ml-2 h-7 text-xs" onClick={handlePortal} disabled={loadingPortal}>
              Update Payment
            </Button>
          </div>
        )}
        {children}
      </>
    );
  }

  if (checkingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  async function handleCheckout() {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoadingCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoadingCheckout(false);
    }
  }

  async function handlePortal() {
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
  }

  // Success state
  if (checkoutStatus === "success") {
    return (
      <div className="container max-w-lg py-16 md:py-24">
        <Card className="border-primary/30 shadow-lg">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to Investore Pro!</h2>
            <p className="text-muted-foreground">
              Your subscription is now active. You have full access to all premium features.
            </p>
            <Button className="w-full" size="lg" onClick={dismissCheckoutStatus}>
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cancelled state
  if (checkoutStatus === "cancelled") {
    return (
      <div className="container max-w-lg py-16 md:py-24">
        <Card className="border-destructive/30 shadow-lg">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold">Checkout Cancelled</h2>
            <p className="text-muted-foreground">
              No worries — you weren't charged. You can subscribe whenever you're ready.
            </p>
            <div className="flex flex-col gap-2">
              <Button className="w-full" size="lg" onClick={() => { dismissCheckoutStatus(); handleCheckout(); }}>
                Try Again
              </Button>
              <Button variant="outline" className="w-full" onClick={() => { dismissCheckoutStatus(); navigate("/"); }}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default paywall / upsell screen
  return (
    <div className="container max-w-lg py-16 md:py-24">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Unlock Investore Pro</h1>
        <p className="text-muted-foreground">
          Subscribe to access AI-driven property analysis and premium tools
        </p>
      </div>

      {/* Show reactivation prompt if cancelled but still in period */}
      {cancelAtPeriodEnd && subscriptionEnd && new Date(subscriptionEnd) > new Date() && (
        <Card className="border-amber-500/30 mb-6">
          <CardContent className="pt-6 pb-4 text-center space-y-3">
            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto" />
            <p className="text-sm">
              Your subscription is set to cancel on{" "}
              <strong>{new Date(subscriptionEnd).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</strong>.
            </p>
            <Button variant="outline" size="sm" onClick={handlePortal} disabled={loadingPortal}>
              {loadingPortal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reactivate Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/30 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Pro Plan</CardTitle>
          <div className="mt-2">
            <span className="text-4xl font-bold">$20</span>
            <span className="text-muted-foreground ml-1">AUD / month</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loadingCheckout}>
            {loadingCheckout && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {user ? "Subscribe Now" : "Sign In to Subscribe"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. Powered by Stripe.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Paywall;
