"use client";
import React, { useState } from "react";
import { FaPlus, FaSignInAlt } from "react-icons/fa";

const LanOptions: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState<"menu" | "create" | "join">("menu");

  return (
    <div className="relative z-[50] w-full flex flex-col items-center">
      <div className="h-[6vh] mb-[4vh] flex items-center">
        {step === "menu" ? (
          <button
            onClick={onBack}
            className="text-[2.5vh] text-gray-300 hover:text-purple-400 transition-all"
          >
            ← Back to Main Menu
          </button>
        ) : (
          <button
            onClick={() => setStep("menu")}
            className="text-[2.5vh] text-gray-300 hover:text-purple-400 transition-all"
          >
            ← Back to LAN Options
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-[4vh] lg:gap-[2vw] w-full justify-center items-center">
        {step === "menu" ? (
          <div className="flex flex-col lg:flex-row gap-[4vh] lg:gap-[2vw] w-full justify-center items-center">
            <div
              className="p-[2.5vh] rounded-[2vh] border-[0.4vh] border-purple-500/40 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:border-purple-500 w-[80vw] lg:w-[45vh] h-[35vh] flex flex-col justify-center items-center"
              onClick={() => setStep("create")}
            >
              <FaPlus className="text-[6vh] text-purple-400 mb-[2vh]" />
              <h3 className="text-[3.5vh] font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Create Room
              </h3>
              <p className="text-gray-300 mt-[1vh] text-[2.2vh]">
                Start new session
              </p>
            </div>

            <div
              className="p-[2.5vh] rounded-[2vh] border-[0.4vh] border-purple-500/40 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:border-purple-500 w-[80vw] lg:w-[45vh] h-[35vh] flex flex-col justify-center items-center"
              onClick={() => setStep("join")}
            >
              <FaSignInAlt className="text-[6vh] text-purple-400 mb-[2vh]" />
              <h3 className="text-[3.5vh] font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Join Room
              </h3>
              <p className="text-gray-300 mt-[1vh] text-[2.2vh]">
                Enter room ID
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[60vh] flex flex-col gap-[4vh] items-center">
            <input
              type="text"
              placeholder={step === "create" ? "Your Name" : "Room ID"}
              className="w-full px-[3vw] py-[2vh] text-[2.5vh] bg-gray-900/80 rounded-[2vh] border-[0.4vh] border-purple-500/40 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <button className="w-full py-[2vh] bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2vh] text-white font-semibold text-[2.5vh] transition-opacity hover:opacity-90">
              {step === "create" ? "Create Room" : "Join Room"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanOptions;
