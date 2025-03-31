"use client";
import React, { createContext, useContext, useState } from "react";

interface ThemeContextType {
  lightColor: string;
  darkColor: string;
  highlightColor: string;
  setLightColor: (color: string) => void;
  setDarkColor: (color: string) => void;
  setHighlightColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  lightColor: "#f0d9b5",
  darkColor: "#b58863",
  highlightColor: "#f3d459",
  setLightColor: () => {},
  setDarkColor: () => {},
  setHighlightColor: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [lightColor, setLightColor] = useState("#f0d9b5");
  const [darkColor, setDarkColor] = useState("#b58863");
  const [highlightColor, setHighlightColor] = useState("#f3d459");

  return (
    <ThemeContext.Provider
      value={{
        lightColor,
        darkColor,
        highlightColor,
        setLightColor,
        setDarkColor,
        setHighlightColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
