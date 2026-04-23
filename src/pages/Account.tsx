import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const Account = () => {
  const { user, signOut, subscribed, subscriptionEnd, refreshSubscription } = useAuth();
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

      <Card className={subscribed ? "border-primary/30" : ""}>
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscribed ? (
            <>
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="font-medium text-primary">Investore Pro — Active ✓</p>
                {subscriptionEnd && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Renews {new Date(subscriptionEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button variant="outline" className="w-full" onClick={handleManage} disabled={loadingPortal}>
                {loadingPortal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Manage Subscription
              </Button>
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
