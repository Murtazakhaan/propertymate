import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [userId, setUserId] = useState<string | null>(null);
  // Tracks whether the current `theme` value has been hydrated from the user's profile.
  const hydratedFromProfileRef = useRef(false);
  const lastSyncedUserIdRef = useRef<string | null>(null);

  // Apply theme to <html> + persist locally
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Track auth state directly via supabase (avoids coupling to AuthProvider order)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load saved preference when user logs in
  useEffect(() => {
    if (!userId) {
      hydratedFromProfileRef.current = false;
      lastSyncedUserIdRef.current = null;
      return;
    }
    if (lastSyncedUserIdRef.current === userId) return;
    lastSyncedUserIdRef.current = userId;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("theme_preference")
        .eq("user_id", userId)
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
        hydratedFromProfileRef.current = true;
        await supabase
          .from("profiles")
          .update({ theme_preference: theme })
          .eq("user_id", userId);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, theme]);

  // Persist theme changes to the profile after hydration
  useEffect(() => {
    if (!userId || !hydratedFromProfileRef.current) return;
    supabase
      .from("profiles")
      .update({ theme_preference: theme })
      .eq("user_id", userId)
      .then(({ error }) => {
        if (error) console.error("Failed to save theme preference:", error);
      });
  }, [theme, userId]);

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
