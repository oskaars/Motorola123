"use client";
import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

const ThemeSettings = () => {
  const {
    lightColor,
    darkColor,
    highlightColor,
    setLightColor,
    setDarkColor,
    setHighlightColor,
  } = useTheme();
  const [showColorMenu, setShowColorMenu] = useState(false);

  const ColorPickerItem = ({
    label,
    color,
    onChange,
  }: {
    label: string;
    color: string;
    onChange: (color: string) => void;
  }) => (
    <div className="flex items-center gap-4 p-3 rounded-xl border border-[#5c085a] bg-gray-900/50 backdrop-blur-sm mb-3 z-[99]">
      <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        {label}
      </span>
      <div className="relative flex-1 flex justify-end">
        <button
          onClick={() => document.getElementById(`${label}-input`)?.click()}
          className="h-8 w-8 rounded-lg border-2 border-purple-400 shadow-glow shadow-purple-500/30 cursor-pointer transition-all hover:scale-110"
          style={{ backgroundColor: color }}
          aria-label={`Choose ${label} color`}
        >
          <input
            id={`${label}-input`}
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="absolute opacity-0 w-0 h-0"
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="mt-4 relative">
      <button
        onClick={() => setShowColorMenu(!showColorMenu)}
        className="px-6 py-3 bg-gray-900/50 border-2 border-[#5c085a] rounded-xl shadow-glow shadow-purple-500/20 hover:border-pink-500 transition-all text-sm font-medium text-purple-300 flex items-center gap-2 backdrop-blur-sm"
      >
        <svg
          className="w-5 h-5 text-pink-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        Customize Board Colors
      </button>

      {showColorMenu && (
        <div className="absolute top-full left-0 mt-3 w-full bg-gray-900/80 border-2 border-[#5c085a] rounded-xl shadow-xl shadow-purple-500/10 p-4 z-10 backdrop-blur-lg">
          <h3 className="text-base font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Board Customization
          </h3>
          <div className="space-y-3">
            <ColorPickerItem
              label="Light Squares"
              color={lightColor}
              onChange={setLightColor}
            />
            <ColorPickerItem
              label="Dark Squares"
              color={darkColor}
              onChange={setDarkColor}
            />
            <ColorPickerItem
              label="Highlight Color"
              color={highlightColor}
              onChange={setHighlightColor}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSettings;
