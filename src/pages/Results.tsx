import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const Results = () => {
  // TODO: Wire up to real AI results
  return (
    <div className="container max-w-4xl py-10 md:py-16">
      <div className="text-center space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Your Suburb Matches</h1>
        <p className="text-muted-foreground">Results will appear here once the AI analysis is connected.</p>
      </div>

      <Card className="mt-10 border-dashed">
        <CardContent className="py-16 text-center space-y-4">
          <Loader2 className="h-10 w-10 text-muted-foreground mx-auto animate-spin" />
          <p className="text-muted-foreground">
            AI suburb analysis will be available once Supabase is connected and the edge function is deployed.
          </p>
          <Link to="/quiz">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retake Quiz
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Results;
