"use client";
import React from "react";
import Chessboard from "./Chessboard";
import ThemeSettings from "./ThemeSettings";

const GameWindow = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full h-[90vh] gap-[2vh] px-[2vh] py-[5vh] justify-center align-center">
      {/* Left Section - Chessboard Container */}
      <div className="flex-1 flex flex-col items-center lg:items-end min-h-[70vh] justify-center">
        <div className="w-full lg:w-[75vw] max-w-[1000px] h-[80vh] bg-white/10 rounded-xl p-4 shadow-xl border border-[#5c085a]/50 backdrop-blur-sm">
          <Chessboard className="h-full" maxSize={1000} minSize={400} />
        </div>
      </div>

      {/* Right Section - Controls and Chat */}
      <div className="flex flex-col lg:w-[400px] gap-4 h-[80vh] items-start justify-center">
        <div className="bg-gray-900/50 border border-[#5c085a]/50 rounded-xl p-4 shadow-xl backdrop-blur-sm relative z-[99]">
          <ThemeSettings />
        </div>

        <div className="flex-1 bg-gray-900/50 border border-[#5c085a]/50 rounded-xl p-4 shadow-xl backdrop-blur-sm ">
          <div className="h-full flex flex-col items-center justify-center">
            <span className="text-purple-300/80 text-xl mb-4">
              🚧 Chat Under Construction 🚧
            </span>
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full mb-4" />
              <div className="h-4 bg-purple-500/20 rounded w-3/4 mb-2" />
              <div className="h-4 bg-purple-500/20 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameWindow;
