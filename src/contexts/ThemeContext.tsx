import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  // Tracks whether the current `theme` value originated from the user's saved profile.
  // Prevents the initial local theme from overwriting the stored preference on login.
  const hydratedFromProfileRef = useRef(false);
  const lastSyncedUserIdRef = useRef<string | null>(null);

  // Apply theme to <html> + persist locally
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // When the user logs in, load their saved preference
  useEffect(() => {
    if (!user) {
      hydratedFromProfileRef.current = false;
      lastSyncedUserIdRef.current = null;
      return;
    }
    if (lastSyncedUserIdRef.current === user.id) return;
    lastSyncedUserIdRef.current = user.id;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("theme_preference")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("Failed to load theme preference:", error);
        return;
      }
      const saved = data?.theme_preference as Theme | null | undefined;
      if (saved === "light" || saved === "dark") {
        hydratedFromProfileRef.current = true;
        setTheme(saved);
      } else {
        // No saved preference yet — persist current theme as the user's choice
        hydratedFromProfileRef.current = true;
        await supabase
          .from("profiles")
          .update({ theme_preference: theme })
          .eq("user_id", user.id);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, theme]);

  // Persist theme changes to the profile after hydration
  useEffect(() => {
    if (!user || !hydratedFromProfileRef.current) return;
    supabase
      .from("profiles")
      .update({ theme_preference: theme })
      .eq("user_id", user.id)
      .then(({ error }) => {
        if (error) console.error("Failed to save theme preference:", error);
      });
  }, [theme, user]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
