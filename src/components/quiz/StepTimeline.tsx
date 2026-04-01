import { useNavigate } from "react-router-dom";
import { useQuiz } from "@/contexts/QuizContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Clock, Zap, CalendarDays, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

const timelines = [
  { value: "0-3" as const, label: "0–3 months", description: "Ready to act now", icon: Zap },
  { value: "3-6" as const, label: "3–6 months", description: "Actively researching", icon: Clock },
  { value: "6-12" as const, label: "6–12 months", description: "Planning ahead", icon: CalendarDays },
  { value: "12+" as const, label: "12+ months", description: "Long-term exploration", icon: CalendarRange },
];

const StepTimeline = () => {
  const { answers, updateAnswers, setCurrentStep } = useQuiz();
  const navigate = useNavigate();

  const handleSubmit = () => {
    // TODO: Submit to Supabase + call edge function
    navigate("/results");
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">When are you looking to buy?</h2>
        <p className="text-muted-foreground">This helps us prioritise suburbs with the right market timing.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {timelines.map((t) => (
          <Card
            key={t.value}
            className={cn(
              "p-5 cursor-pointer transition-all border-2 text-center",
              answers.timeline === t.value
                ? "border-primary bg-primary/5"
                : "border-transparent hover:border-primary/30"
            )}
            onClick={() => updateAnswers({ timeline: t.value })}
          >
            <t.icon className={cn(
              "h-7 w-7 mx-auto mb-2",
              answers.timeline === t.value ? "text-primary" : "text-muted-foreground"
            )} />
            <p className="font-semibold text-foreground">{t.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="lg" onClick={() => setCurrentStep(3)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          disabled={!answers.timeline}
          onClick={handleSubmit}
          className="font-semibold"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Find My Suburbs
        </Button>
      </div>
    </div>
  );
};

export default StepTimeline;
