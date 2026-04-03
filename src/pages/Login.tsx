import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3 } from "lucide-react";

const Login = () => (
  <div className="container max-w-md py-16 md:py-24">
    <Card>
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Sign in to Investore</CardTitle>
        <p className="text-sm text-muted-foreground">Save your shortlist and come back anytime</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input type="email" placeholder="you@example.com" className="mt-1.5" />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" placeholder="••••••••" className="mt-1.5" />
        </div>
        <Button className="w-full" disabled>
          Sign In
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Sign in to save your shortlist and access it later.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default Login;
