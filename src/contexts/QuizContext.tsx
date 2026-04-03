import { createContext, useContext, useState, ReactNode } from "react";

export interface QuizAnswers {
  goal: "first-home" | "investment" | "not-sure" | null;
  isFirstHome: boolean | null;
  investorStrategy: "capital-growth" | "rental-return" | null;
  budget: number | null;
  budgetUnknown: boolean;
  income: number | null;
  deposit: number | null;
  hasExistingHome: boolean | null;
  existingPropertyAddress: string;
  existingPropertyValue: number | null;
  existingLoanAmount: number | null;
  interstateOpen: boolean;
  homeAgePreference: "new" | "established" | "no-preference" | null;
  riskTolerance: number;
  timeline: "0-3" | "3-6" | "6-12" | "12+" | null;
}

const defaultAnswers: QuizAnswers = {
  goal: null,
  isFirstHome: null,
  investorStrategy: null,
  budget: null,
  budgetUnknown: false,
  income: null,
  deposit: null,
  hasExistingHome: null,
  existingPropertyAddress: "",
  existingPropertyValue: null,
  existingLoanAmount: null,
  interstateOpen: false,
  homeAgePreference: null,
  riskTolerance: 50,
  timeline: null,
};

interface QuizContextType {
  answers: QuizAnswers;
  updateAnswers: (updates: Partial<QuizAnswers>) => void;
  resetQuiz: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<QuizAnswers>(defaultAnswers);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const updateAnswers = (updates: Partial<QuizAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...updates }));
  };

  const resetQuiz = () => {
    setAnswers(defaultAnswers);
    setCurrentStep(1);
  };

  return (
    <QuizContext.Provider
      value={{ answers, updateAnswers, resetQuiz, currentStep, setCurrentStep, totalSteps }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error("useQuiz must be used within QuizProvider");
  return context;
};
