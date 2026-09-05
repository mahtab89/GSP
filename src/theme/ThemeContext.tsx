import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

import { darkTheme, lightTheme, type AppTheme } from "./theme";

const THEME_MODE_KEY = "theme-mode";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setCurrentMode] = useState<ThemeMode>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (storedMode === "light" || storedMode === "dark") {
          setCurrentMode(storedMode);
        }
      } catch (error) {
        
      } finally {
        setHydrated(true);
      }
    };

    void hydrate();
  }, []);

  const setMode = (nextMode: ThemeMode) => {
    setCurrentMode(nextMode);
    void AsyncStorage.setItem(THEME_MODE_KEY, nextMode).catch((error) => {
      
    });
  };

  if (!hydrated) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ theme: mode === "dark" ? darkTheme : lightTheme, mode, setMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
