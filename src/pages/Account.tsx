import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Crown, Loader2, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Pro Active", variant: "default" },
  past_due: { label: "Past Due", variant: "destructive" },
  canceled: { label: "Cancelled", variant: "secondary" },
};

const Account = () => {
  const { user, signOut, subscribed, subscriptionEnd, cancelAtPeriodEnd, subscriptionStatus, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.success("Subscription activated! Welcome to Investore Pro.");
      refreshSubscription();
    }
  }, [searchParams, refreshSubscription]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleManage = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to open portal");
    } finally {
      setLoadingPortal(false);
    }
  };

  const statusInfo = statusConfig[subscriptionStatus] || null;

  const dateLabel = cancelAtPeriodEnd
    ? `Cancels on ${subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "—"}`
    : `Renews on ${subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "—"}`;

  return (
    <div className="container max-w-lg py-16 md:py-24 space-y-6">
      <Card>
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">My Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">
              {user?.user_metadata?.display_name || "Not set"}
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1.5" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card className={subscribed ? "border-primary/40 shadow-md shadow-primary/5" : ""}>
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <CardTitle className="text-xl">Subscription</CardTitle>
            {statusInfo && (
              <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                {statusInfo.label}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscribed || subscriptionStatus === "past_due" ? (
            <>
              <div className="rounded-lg bg-primary/10 p-4 text-center space-y-1">
                <p className="font-semibold text-primary text-lg">Investore Pro</p>
                {subscriptionEnd && (
                  <p className="text-sm text-muted-foreground">{dateLabel}</p>
                )}
                {subscriptionStatus === "past_due" && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    ⚠️ Payment failed — please update your payment method
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full" onClick={handleManage} disabled={loadingPortal}>
                  {loadingPortal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Manage Subscription
                </Button>
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleManage} disabled={loadingPortal}>
                  <CreditCard className="h-4 w-4 mr-1.5" />
                  Update Payment Method
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                You're on the free plan. Upgrade to Pro for full access.
              </p>
              <Button className="w-full" onClick={() => navigate("/pricing")}>
                <Crown className="h-4 w-4 mr-1.5" />
                View Pricing
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
