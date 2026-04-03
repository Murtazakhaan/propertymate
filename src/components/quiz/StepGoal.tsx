import { useQuiz } from "@/contexts/QuizContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Home, TrendingUp, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const goals = [
  {
    value: "first-home" as const,
    label: "Owner Occupier",
    beginnerLabel: "I want to buy a home to live in",
    description: "I'm looking to buy a property to live in",
    beginnerDescription: "You want to find the right place to call home",
    icon: Home,
  },
  {
    value: "investment" as const,
    label: "Investor",
    beginnerLabel: "I want to invest in property",
    description: "I want a property to grow wealth or generate rental income",
    beginnerDescription: "You want to buy a property to rent out and make money over time",
    icon: TrendingUp,
  },
  {
    value: "not-sure" as const,
    label: "Not Sure Yet",
    beginnerLabel: "I'm just exploring",
    description: "I'm exploring my options and want to learn more",
    beginnerDescription: "No pressure - we'll help you figure out what makes sense for you",
    icon: HelpCircle,
  },
];

const StepGoal = () => {
  const { answers, updateAnswers, setCurrentStep } = useQuiz();
  const { beginnerMode } = useApp();

  const canProceed = (() => {
    if (!answers.goal) return false;
    if (answers.goal === "first-home" && answers.isFirstHome === null) return false;
    if (answers.goal === "investment" && !answers.investorStrategy) return false;
    return true;
  })();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {beginnerMode ? "What would you like to do?" : "What's your property goal?"}
        </h2>
        <p className="text-muted-foreground">
          {beginnerMode
            ? "Pick the option that best describes you."
            : "This helps us tailor our recommendations to your situation."}
        </p>
      </div>

      <div className="grid gap-4">
        {goals.map((goal) => (
          <Card
            key={goal.value}
            className={cn(
              "p-5 cursor-pointer transition-all hover:shadow-md border-2",
              answers.goal === goal.value
                ? "border-primary bg-primary/5"
                : "border-transparent hover:border-primary/30"
            )}
            onClick={() => {
              updateAnswers({
                goal: goal.value,
                isFirstHome: goal.value === "first-home" ? answers.isFirstHome : null,
                investorStrategy: goal.value === "investment" ? answers.investorStrategy : null,
              });
            }}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                answers.goal === goal.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <goal.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {beginnerMode ? goal.beginnerLabel : goal.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {beginnerMode ? goal.beginnerDescription : goal.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* First Home sub-question for Owner Occupier */}
      {answers.goal === "first-home" && (
        <div className="p-5 rounded-lg border bg-card space-y-3 animate-fade-in">
          <p className="font-medium text-foreground">
            {beginnerMode ? "Is this your first time buying a home?" : "Is this your first home?"}
          </p>
          <p className="text-sm text-muted-foreground">
            {beginnerMode
              ? "First home buyers may get stamp duty savings in most states."
              : "First home buyers are eligible for stamp duty concessions in most states."}
          </p>
          <div className="flex gap-3">
            <Button
              variant={answers.isFirstHome === true ? "default" : "outline"}
              onClick={() => updateAnswers({ isFirstHome: true })}
            >
              Yes, first home
            </Button>
            <Button
              variant={answers.isFirstHome === false ? "default" : "outline"}
              onClick={() => updateAnswers({ isFirstHome: false })}
            >
              No, I've owned before
            </Button>
          </div>
        </div>
      )}

      {/* Investor strategy sub-question */}
      {answers.goal === "investment" && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-lg border bg-card space-y-3">
            <p className="font-medium text-foreground">
              {beginnerMode ? "What matters most to you?" : "What's your investment strategy?"}
            </p>
            <p className="text-sm text-muted-foreground">
              {beginnerMode
                ? "Pick what you care about more - property value going up, or earning rental income."
                : "This determines which suburbs we prioritise for you."}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={cn(
                  "p-4 cursor-pointer text-center transition-all border-2",
                  answers.investorStrategy === "capital-growth"
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:border-primary/30"
                )}
                onClick={() => updateAnswers({ investorStrategy: "capital-growth" })}
              >
                <TrendingUp className={cn(
                  "h-7 w-7 mx-auto mb-2",
                  answers.investorStrategy === "capital-growth" ? "text-primary" : "text-muted-foreground"
                )} />
                <p className="font-semibold text-foreground text-sm">Capital Growth</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {beginnerMode ? "Property value goes up over time" : "Suburbs with highest growth potential"}
                </p>
              </Card>
              <Card
                className={cn(
                  "p-4 cursor-pointer text-center transition-all border-2",
                  answers.investorStrategy === "rental-return"
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:border-primary/30"
                )}
                onClick={() => updateAnswers({ investorStrategy: "rental-return" })}
              >
                <Home className={cn(
                  "h-7 w-7 mx-auto mb-2",
                  answers.investorStrategy === "rental-return" ? "text-primary" : "text-muted-foreground"
                )} />
                <p className="font-semibold text-foreground text-sm">Rental Return</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {beginnerMode ? "Earn more rent each week" : "Suburbs with best rental yields"}
                </p>
              </Card>
            </div>
          </div>

          {/* Existing property fields for investors who own a home */}
          {answers.hasExistingHome && (
            <div className="p-5 rounded-lg border bg-card space-y-3 animate-fade-in">
              <p className="font-medium text-foreground">
                {beginnerMode ? "Tell us about your current property" : "Existing property details"}
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Property address</Label>
                  <Input
                    placeholder="e.g. 12 Smith St, Sydney NSW"
                    value={answers.existingPropertyAddress}
                    onChange={(e) => updateAnswers({ existingPropertyAddress: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">
                      {beginnerMode ? "What's it worth?" : "Estimated value"}
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 650000"
                      value={answers.existingPropertyValue || ""}
                      onChange={(e) => updateAnswers({ existingPropertyValue: Number(e.target.value) || null })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">
                      {beginnerMode ? "How much do you owe?" : "Remaining loan"}
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 400000"
                      value={answers.existingLoanAmount || ""}
                      onChange={(e) => updateAnswers({ existingLoanAmount: Number(e.target.value) || null })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!canProceed}
          onClick={() => setCurrentStep(2)}
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepGoal;
