import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { QuizProvider } from "@/contexts/QuizContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import RequireAuth from "@/components/RequireAuth";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import About from "./pages/About";
import Glossary from "./pages/Glossary";
import Compare from "./pages/Compare";
import Login from "./pages/Login";
import Account from "./pages/Account";
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
        <Route path="/compare" element={<Compare />} />
        <Route path="/about" element={<About />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />

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
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <QuizProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </QuizProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

