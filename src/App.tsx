import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { QuizProvider } from "@/contexts/QuizContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import About from "./pages/About";
import Glossary from "./pages/Glossary";
import Compare from "./pages/Compare";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { beginnerMode, toggleBeginnerMode } = useApp();

  return (
    <Layout beginnerMode={beginnerMode} onToggleBeginnerMode={toggleBeginnerMode}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
        <Route path="/about" element={<About />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <QuizProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </QuizProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
