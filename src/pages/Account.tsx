import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, Mail, Calendar, Shield } from "lucide-react";
import AlertPreferencesCard from "@/components/AlertPreferencesCard";

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-AU", { month: "long", year: "numeric" })
    : null;


  return (
    <div className="container max-w-lg py-10 md:py-20 px-4 sm:px-6 space-y-5">
      {/* Profile card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-xl truncate">
                {user?.user_metadata?.display_name || "My Account"}
              </CardTitle>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            {memberSince && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Since {memberSince}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 shrink-0" />
            <span>Email verified: {user?.email_confirmed_at ? "Yes" : "No"}</span>
          </div>
          <div className="pt-2 border-t">
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription card */}
      <Card className={subscribed ? "border-primary/40 shadow-md shadow-primary/5" : ""}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Subscription</CardTitle>
            </div>
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
              <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-primary text-lg">PropertyMate Pro</p>
                  {subscriptionEnd && (
                    <p className="text-xs text-muted-foreground">{dateLabel}</p>
                  )}
                </div>
                {subscriptionStatus === "past_due" && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    ⚠️ Payment failed — please update your payment method
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" onClick={handleManage} disabled={loadingPortal}>
                  {loadingPortal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Manage Subscription
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={handleManage} disabled={loadingPortal}>
                  <CreditCard className="h-4 w-4 mr-1.5" />
                  Update Payment
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg bg-muted p-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  You're on the free plan. Upgrade to Pro for full suburb analysis, comparisons, and shortlisting.
                </p>
              </div>
              <Button className="w-full" onClick={() => navigate("/pricing")}>
                <Crown className="h-4 w-4 mr-1.5" />
                View Pricing
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification preferences */}
      <AlertPreferencesCard />
    </div>
  );
};

export default Account;
