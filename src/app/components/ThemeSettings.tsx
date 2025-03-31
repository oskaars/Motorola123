"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

const ThemeSettings = () => {
  const {
    lightColor,
    darkColor,
    highlightColor,
    PossibleMoveColor,
    setLightColor,
    setDarkColor,
    setHighlightColor,
    setPossibleMoveColor,
    resetColors,
  } = useTheme();
  const [showColorMenu, setShowColorMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowColorMenu(false);
      }
    };

    if (showColorMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorMenu]);

  return (
    <div className=" relative" ref={menuRef}>
      <button
        onClick={() => setShowColorMenu(!showColorMenu)}
        className="px-[3vw] py-3 bg-gray-900/50 border-2 border-[#5c085a] rounded-xl shadow-glow shadow-purple-500/20 hover:border-pink-500 transition-all text-sm font-medium text-purple-300 flex items-center gap-2 backdrop-blur-sm"
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
          <div className="flex flex-col gap-[3vh]">
            <div className="grid grid-cols-[3fr_1fr] gap-4 items-center">
              <label className="block text-sm font-medium">Light Squares</label>
              <div className="relative w-full h-10">
                <div
                  className="w-full h-full rounded-md"
                  style={{ backgroundColor: lightColor }}
                ></div>
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-[3fr_1fr] gap-4 items-center">
              <label className="block text-sm font-medium">Dark Squares</label>
              <div className="relative w-full h-10">
                <div
                  className="w-full h-full rounded-md"
                  style={{ backgroundColor: darkColor }}
                ></div>
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-[3fr_1fr] gap-4 items-center">
              <label className="block text-sm font-medium">
                Highlight Color
              </label>
              <div className="relative w-full h-10">
                <div
                  className="w-full h-full rounded-md"
                  style={{ backgroundColor: highlightColor }}
                ></div>
                <input
                  type="color"
                  value={highlightColor}
                  onChange={(e) => setHighlightColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-[3fr_1fr] gap-4 items-center">
              <label className="block text-sm font-medium">
                Possible Move Color
              </label>
              <div className="relative w-full h-10">
                <div
                  className="w-full h-full rounded-md"
                  style={{ backgroundColor: PossibleMoveColor }}
                ></div>
                <input
                  type="color"
                  value={PossibleMoveColor}
                  onChange={(e) => setPossibleMoveColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-md"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              resetColors();
              setShowColorMenu(false);
            }}
            className="mt-4 w-full py-2 bg-gray-800/50 border border-[#5c085a]/50 rounded-lg text-purple-300 hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset to Default Colors
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeSettings;
