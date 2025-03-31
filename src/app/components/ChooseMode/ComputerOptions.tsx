"use client";
import React from "react";
import { FaBrain, FaRobot, FaChessKing } from "react-icons/fa";

const ComputerOptions: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="relative z-[50] w-full flex flex-col items-center">
      {/* Back button container */}
      <div className="h-[6vh] mb-[4vh] flex items-center">
        <button
          onClick={onBack}
          className="text-[2.5vh] text-gray-300 hover:text-purple-400 transition-all"
        >
          ← Back to Main Menu
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-[4vh] lg:gap-[2vw] w-full justify-center items-center">
        <div className="p-[2.5vh] rounded-[2vh] border-[0.4vh] border-blue-900 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:border-blue-400 w-[80vw] lg:w-[45vh] h-[35vh] flex flex-col justify-center items-center">
          <FaBrain className="text-[5vh] text-blue-400 mb-[2vh]" />
          <h3 className="text-[3.2vh] font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Minimax AI
          </h3>
          <p className="text-gray-300 mt-[1vh] text-[2vh]">Classic algorithm</p>
        </div>

        <div className="p-[2.5vh] rounded-[2vh] border-[0.4vh] border-blue-900 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:border-blue-400 w-[80vw] lg:w-[45vh] h-[35vh] flex flex-col justify-center items-center">
          <FaRobot className="text-[5vh] text-cyan-400 mb-[2vh]" />
          <h3 className="text-[3.2vh] font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            MCTS AI
          </h3>
          <p className="text-gray-300 mt-[1vh] text-[2vh]">Tree search AI</p>
        </div>

        <div className="p-[2.5vh] rounded-[2vh] border-[0.4vh] border-blue-900 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:border-blue-400 w-[80vw] lg:w-[45vh] h-[35vh] flex flex-col justify-center items-center">
          <FaChessKing className="text-[5vh] text-cyan-300 mb-[2vh]" />
          <h3 className="text-[3.2vh] font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Grand Master
          </h3>
          <p className="text-gray-300 mt-[1vh] text-[2vh]">Neural network AI</p>
        </div>
      </div>
    </div>
  );
};

export default ComputerOptions;
