import { useQuiz } from "@/contexts/QuizContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, TrendingUp, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const goals = [
  {
    value: "first-home" as const,
    label: "First Home Buyer",
    beginnerLabel: "I want to buy my first home",
    description: "I'm looking to buy my first property to live in",
    beginnerDescription: "You've never owned a home before and want to find the right place to start",
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
    beginnerDescription: "No pressure — we'll help you figure out what makes sense for you",
    icon: HelpCircle,
  },
];

const StepGoal = () => {
  const { answers, updateAnswers, setCurrentStep } = useQuiz();
  const { beginnerMode } = useApp();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {beginnerMode ? "What would you like to do?" : "What's your property goal?"}
        </h2>
        <p className="text-muted-foreground">
          {beginnerMode
            ? "Pick the option that best describes you — there's no wrong answer."
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
            onClick={() => updateAnswers({ goal: goal.value })}
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

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!answers.goal}
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
