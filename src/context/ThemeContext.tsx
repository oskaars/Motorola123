"use client";
import React, { createContext, useContext, useState } from "react";

interface ThemeContextType {
  lightColor: string;
  darkColor: string;
  highlightColor: string;
  PossibleMoveColor: string;
  setLightColor: (color: string) => void;
  setDarkColor: (color: string) => void;
  setHighlightColor: (color: string) => void;
  setPossibleMoveColor: (color: string) => void;
  resetColors: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  lightColor: "#f0d9b5",
  darkColor: "#b58863",
  highlightColor: "#f3d459",
  PossibleMoveColor: "#B59EE0",
  setLightColor: () => {},
  setDarkColor: () => {},
  setHighlightColor: () => {},
  setPossibleMoveColor: () => {},
  resetColors: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lightColor, setLightColor] = useState("#f0d9b5");
  const [darkColor, setDarkColor] = useState("#b58863");
  const [highlightColor, setHighlightColor] = useState("#f3d459");
  const [PossibleMoveColor, setPossibleMoveColor] = useState("#B59EE0");

  const resetColors = () => {
    setLightColor("#f0d9b5");
    setDarkColor("#b58863");
    setHighlightColor("#f3d459");
    setPossibleMoveColor("#B59EE0");
  };

  return (
    <ThemeContext.Provider
      value={{
        lightColor,
        darkColor,
        highlightColor,
        PossibleMoveColor,
        setLightColor,
        setDarkColor,
        setHighlightColor,
        setPossibleMoveColor,
        resetColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
