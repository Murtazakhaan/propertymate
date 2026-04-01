import { useQuiz } from "@/contexts/QuizContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight } from "lucide-react";

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  return `$${(value / 1000).toFixed(0)}K`;
};

const StepBudget = () => {
  const { answers, updateAnswers, setCurrentStep } = useQuiz();

  const canProceed = answers.budgetUnknown
    ? (answers.income && answers.income > 0)
    : (answers.budget && answers.budget > 0);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">What's your budget?</h2>
        <p className="text-muted-foreground">
          Don't worry if you're not sure — we can estimate based on your income.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Switch
            id="budget-unknown"
            checked={answers.budgetUnknown}
            onCheckedChange={(checked) =>
              updateAnswers({ budgetUnknown: checked, budget: checked ? null : answers.budget })
            }
          />
          <Label htmlFor="budget-unknown" className="text-sm text-muted-foreground cursor-pointer">
            I don't know my budget — help me estimate
          </Label>
        </div>

        {!answers.budgetUnknown ? (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">
                {answers.budget ? formatCurrency(answers.budget) : "$—"}
              </span>
            </div>
            <Slider
              value={[answers.budget || 400000]}
              onValueChange={([val]) => updateAnswers({ budget: val })}
              min={200000}
              max={2500000}
              step={25000}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$200K</span>
              <span>$2.5M+</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-5 rounded-lg bg-muted/50 border">
            <div>
              <Label className="text-sm font-medium">Annual household income</Label>
              <Input
                type="number"
                placeholder="e.g. 85000"
                value={answers.income || ""}
                onChange={(e) => updateAnswers({ income: Number(e.target.value) || null })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Savings / deposit available</Label>
              <Input
                type="number"
                placeholder="e.g. 50000"
                value={answers.deposit || ""}
                onChange={(e) => updateAnswers({ deposit: Number(e.target.value) || null })}
                className="mt-1.5"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="existing-home"
                checked={answers.hasExistingHome || false}
                onCheckedChange={(checked) => updateAnswers({ hasExistingHome: checked })}
              />
              <Label htmlFor="existing-home" className="text-sm cursor-pointer">
                I already own a property
              </Label>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="lg" onClick={() => setCurrentStep(1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="lg" disabled={!canProceed} onClick={() => setCurrentStep(3)}>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepBudget;
