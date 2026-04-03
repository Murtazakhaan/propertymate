import { useQuiz } from "@/contexts/QuizContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Building2, Home, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const ageOptions = [
  {
    value: "new" as const,
    label: "New Build",
    beginnerLabel: "Brand New",
    description: "Modern, low maintenance",
    beginnerDescription: "A recently built home - less fixing up needed",
    icon: Building2,
  },
  {
    value: "established" as const,
    label: "Established",
    beginnerLabel: "Older Home",
    description: "Character, potential to renovate",
    beginnerDescription: "An older home that might need work but has character",
    icon: Home,
  },
  {
    value: "no-preference" as const,
    label: "No Preference",
    beginnerLabel: "Either is fine",
    description: "Open to both",
    beginnerDescription: "You're happy with new or old",
    icon: Layers,
  },
];

const StepComfort = () => {
  const { answers, updateAnswers, setCurrentStep } = useQuiz();
  const { beginnerMode } = useApp();
  const isInvestor = answers.goal === "investment";

  const canProceed = answers.homeAgePreference !== null;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {beginnerMode ? "What kind of property do you like?" : "Your preferences"}
        </h2>
        <p className="text-muted-foreground">
          {beginnerMode
            ? "Tell us what you prefer - we'll use this to match suburbs to you."
            : "Help us understand your preferences so we can find the right fit."}
        </p>
      </div>

      <div className="space-y-6">
        {/* Interstate toggle */}
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                {beginnerMode ? "Look in other states too?" : "Open to interstate suburbs?"}
              </p>
              <p className="text-sm text-muted-foreground">
                {beginnerMode
                  ? "Turn this on to see suburbs from all around Australia"
                  : "We'll include suburbs across all states"}
              </p>
            </div>
            <Switch
              checked={answers.interstateOpen}
              onCheckedChange={(checked) => updateAnswers({ interstateOpen: checked })}
            />
          </div>
        </div>

        {/* Home age preference */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            {beginnerMode ? "New or older home?" : "Property age preference"}
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {ageOptions.map((opt) => (
              <Card
                key={opt.value}
                className={cn(
                  "p-4 cursor-pointer text-center transition-all border-2",
                  answers.homeAgePreference === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:border-primary/30"
                )}
                onClick={() => updateAnswers({ homeAgePreference: opt.value })}
              >
                <opt.icon className={cn(
                  "h-6 w-6 mx-auto mb-2",
                  answers.homeAgePreference === opt.value ? "text-primary" : "text-muted-foreground"
                )} />
                <p className="text-sm font-medium text-foreground">
                  {beginnerMode ? opt.beginnerLabel : opt.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {beginnerMode ? opt.beginnerDescription : opt.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Risk vs Growth slider - only show for non-investors (investors choose strategy on step 1) */}
        {!isInvestor && (
          <div className="p-4 rounded-lg border bg-card space-y-4">
            <Label className="text-sm font-medium">
              {beginnerMode ? "How much risk are you comfortable with?" : "Risk vs. Growth preference"}
            </Label>
            {beginnerMode && (
              <p className="text-xs text-muted-foreground -mt-2">
                Low risk = safer but slower gains. High risk = bigger potential returns but more uncertainty.
              </p>
            )}
            <Slider
              value={[answers.riskTolerance]}
              onValueChange={([val]) => updateAnswers({ riskTolerance: val })}
              min={0}
              max={100}
              step={5}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>🛡️ {beginnerMode ? "Play it safe" : "Low risk, steady growth"}</span>
              <span>🚀 {beginnerMode ? "Go for growth" : "Higher risk, bigger upside"}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="lg" onClick={() => setCurrentStep(2)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="lg" disabled={!canProceed} onClick={() => setCurrentStep(4)}>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepComfort;
