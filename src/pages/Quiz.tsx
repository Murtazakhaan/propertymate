import { useQuiz } from "@/contexts/QuizContext";
import { Progress } from "@/components/ui/progress";
import StepGoal from "@/components/quiz/StepGoal";
import StepBudget from "@/components/quiz/StepBudget";
import StepComfort from "@/components/quiz/StepComfort";
import StepTimeline from "@/components/quiz/StepTimeline";

const Quiz = () => {
  const { currentStep, totalSteps } = useQuiz();
  const progress = (currentStep / totalSteps) * 100;

  const stepComponents: Record<number, React.ReactNode> = {
    1: <StepGoal />,
    2: <StepBudget />,
    3: <StepComfort />,
    4: <StepTimeline />,
  };

  return (
    <div className="container max-w-2xl py-10 md:py-16">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step content */}
      <div className="animate-fade-in" key={currentStep}>
        {stepComponents[currentStep]}
      </div>
    </div>
  );
};

export default Quiz;
