import { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  beginnerMode: boolean;
  toggleBeginnerMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [beginnerMode, setBeginnerMode] = useState(true);

  const toggleBeginnerMode = () => setBeginnerMode((prev) => !prev);

  return (
    <AppContext.Provider value={{ beginnerMode, toggleBeginnerMode }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
