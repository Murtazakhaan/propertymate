import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const features = [
  "AI-powered suburb recommendations",
  "Detailed property analytics & metrics",
  "Compare suburbs side-by-side",
  "Save suburbs to your shortlist",
  "Property listing insights",
  "Priority support",
];

const Pricing = () => {
  const { user, subscribed, subscriptionEnd, checkingSubscription } = useAuth();
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

  return (
    <div className="container max-w-lg py-16 md:py-24">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Investore Pro</h1>
        <p className="text-muted-foreground">
          Unlock the full power of AI-driven property analysis
        </p>
      </div>

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

          {subscribed ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-primary/10 p-3 text-center text-sm">
                <p className="font-medium text-primary">You're subscribed ✓</p>
                {subscriptionEnd && (
                  <p className="text-muted-foreground mt-1">
                    Renews {new Date(subscriptionEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleManage}
                disabled={loadingPortal}
              >
                {loadingPortal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Manage Subscription
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={loadingCheckout || checkingSubscription}
            >
              {loadingCheckout ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {user ? "Subscribe Now" : "Sign In to Subscribe"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;
