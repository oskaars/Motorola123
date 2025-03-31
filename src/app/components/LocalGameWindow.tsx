"use client";
import React, { useRef } from "react";
import Chessboard from "./Chessboard2";
import ThemeSettings from "./ThemeSettings";

const LocalGameWindow = () => {
  const chessboardRef = useRef<{ resetGame: () => void }>(null);

  const handleReset = () => {
    chessboardRef.current?.resetGame();
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full px-4 mt-[2vh] lg:mt-[0vh] justify-center items-start relative z-50 lg:gap-x-[2vh] mx-auto max-w-7xl">
      {/* Left Section - Chessboard Container */}
      <div className="flex items-center justify-center w-full h-full lg:mt-[2vh]">
        <div className="flex justify-center items-center w-full h-full bg-black/20 rounded-xl px-4 shadow-xl border-[0.4vh] border-[#5c085a]/50 backdrop-blur-sm">
          <Chessboard
            ref={chessboardRef}
            className="w-full h-full"
            maxSize={1000}
            minSize={400}
          />
        </div>
      </div>

      {/* Right Section - Controls and Chat */}
      <div className="w-full lg:w-[40vw] h-fit mt-[2vh] flex justify-center items-start">
        <div className="w-full bg-gray-900/50 border-[0.4vh] lg:mt-[10vh] h-full border-[#5c085a]/50 rounded-xl p-4 shadow-xl backdrop-blur-sm relative z-99 items-start justify-center flex flex-col py-[5vh] gap-8">
          <ThemeSettings />
          <button
            onClick={handleReset}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-[0.3vh] border-purple-500/50 rounded-lg text-purple-300 font-medium text-lg transition-all duration-300"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalGameWindow;
