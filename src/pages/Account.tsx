import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="container max-w-lg py-16 md:py-24">
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
    </div>
  );
};

export default Account;
