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




      {/* Notification preferences */}
      <AlertPreferencesCard />
    </div>
  );
};

export default Account;
