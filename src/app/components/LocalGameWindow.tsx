"use client";
import React from "react";
import Chessboard from "./Chessboard2";
import ThemeSettings from "./ThemeSettings";

const GameWindow = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full h-full gap-[2vh] px-[2vh] justify-center items-center relative z-[50]">
      {/* Left Section - Chessboard Container */}
      <div className="flex items-center h-full justify-center mt-[2vh] ">
        <div className="flex justify-center items-center w-full lg:w-[50vw] h-[88vh] bg-black/20 rounded-xl py-[3vh] shadow-xl border-[0.4vh] border-[#5c085a]/50 backdrop-blur-sm">
          <Chessboard className="h-full" maxSize={1000} minSize={400} />
        </div>
      </div>

      {/* Right Section - Controls and Chat */}
    </div>
  );
};

export default GameWindow;
