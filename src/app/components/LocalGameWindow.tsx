"use client";
import React from "react";
import Chessboard from "./Chessboard2";
import ThemeSettings from "./ThemeSettings";

const LocalGameWindow = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full h-full px-4 mt-[2vh] lg:mt-[0vh] justify-center items-start relative z-50 lg:gap-x-[2vh] mx-auto max-w-7xl">
      {/* Left Section - Chessboard Container */}
      <div className="flex items-center justify-center w-full h-full lg:mt-[2vh]">
        <div className="flex justify-center items-center w-full  h-full  bg-black/20 rounded-xl px-4 shadow-xl border-[0.4vh] border-[#5c085a]/50 backdrop-blur-sm">
          <Chessboard className="w-full h-full" maxSize={1000} minSize={400} />
        </div>
      </div>

      {/* Right Section - Controls and Chat */}
      <div className="w-full  lg:w-[40vw] h-fit mt-[2vh] flex justify-center items-start">
        <div className="w-full bg-gray-900/50 border-[0.4vh] lg:mt-[10vh] h-full border-[#5c085a]/50 rounded-xl p-4 shadow-xl backdrop-blur-sm relative z-99 items-start justify-center flex py-[5vh]">
          <ThemeSettings />
          {/* Additional controls can be added here */}
        </div>
      </div>
    </div>
  );
};

export default LocalGameWindow;
