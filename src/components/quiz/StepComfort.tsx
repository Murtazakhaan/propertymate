import { useQuiz } from "@/contexts/QuizContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Building2, Home, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const ageOptions = [
  { value: "new" as const, label: "New Build", description: "Modern, low maintenance", icon: Building2 },
  { value: "established" as const, label: "Established", description: "Character, potential to renovate", icon: Home },
  { value: "no-preference" as const, label: "No Preference", description: "Open to both", icon: Layers },
];

const StepComfort = () => {
  const { answers, updateAnswers, setCurrentStep } = useQuiz();

  const canProceed = answers.homeAgePreference !== null;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Your comfort zone</h2>
        <p className="text-muted-foreground">Help us understand your preferences so we can find the right fit.</p>
      </div>

      <div className="space-y-6">
        {/* Interstate toggle */}
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Open to interstate suburbs?</p>
              <p className="text-sm text-muted-foreground">We'll include suburbs across all states</p>
            </div>
            <Switch
              checked={answers.interstateOpen}
              onCheckedChange={(checked) => updateAnswers({ interstateOpen: checked })}
            />
          </div>
        </div>

        {/* Home age preference */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Property age preference</Label>
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
                <p className="text-sm font-medium text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Risk vs Growth slider */}
        <div className="p-4 rounded-lg border bg-card space-y-4">
          <Label className="text-sm font-medium">Risk vs. Growth preference</Label>
          <Slider
            value={[answers.riskTolerance]}
            onValueChange={([val]) => updateAnswers({ riskTolerance: val })}
            min={0}
            max={100}
            step={5}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>🛡️ Low risk, steady growth</span>
            <span>🚀 Higher risk, bigger upside</span>
          </div>
        </div>
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
