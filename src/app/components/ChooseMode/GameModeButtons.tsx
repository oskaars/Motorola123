"use client";
import React, { useState } from "react";
import { FaRobot } from "react-icons/fa";
import { PiNetwork } from "react-icons/pi";
import LanOptions from "./LanOptions";
import ComputerOptions from "./ComputerOptions";
import { BsFillPeopleFill } from "react-icons/bs";
import Link from "next/link";
import LocalGameWindow from "../LocalGameWindow";

const GameModeButtons: React.FC = () => {
  const [mode, setMode] = useState<string | null>(null);

  return (
    <div className="w-full min-h-screen flex flex-col items-center mb-[10vh]">
      {mode !== "Local" && (
        <>
          <div className="w-[90vw] lg:w-[70vw] mb-[4vh] flex justify-start pt-[8vh] pb-[4vh]">
            <Link
              href="/"
              className="text-[2.5vh] text-gray-300 hover:text-purple-400 transition-all"
            >
              🏠︎ - Go Back Home
            </Link>
          </div>

          <div className="relative z-[50] text-center mb-[8vh] lg:mt-[-5vh]">
            <h1
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-pink-600"
              style={{
                fontSize: "8vh",
                animation: "floatAnimation 6s ease-in-out infinite",
              }}
            >
              Gambit.pl
            </h1>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes floatAnimation {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <div className="flex-1 w-full px-[4vw]">
        {!mode ? (
          <div className="relative z-[50] flex flex-col lg:flex-row gap-[4vh] lg:gap-[2vw] justify-center mt-[10vh] items-center">
            <div
              className="p-[2.5vh] rounded-[2vh] border-[0.4vh] border-[#5c085a] bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:border-pink-500 w-[80vw] lg:w-[45vh] h-[35vh] flex flex-col justify-center items-center"
              onClick={() => setMode("Local")}
            >
              <BsFillPeopleFill className="text-[7vh] text-pink-500 mb-[2vh]" />
              <h3 className="text-[3.2vh] font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                Play Locally
              </h3>
              <p className="text-gray-300 mt-[1vh] text-[2vh]">
                Play with friend on one device
              </p>
            </div>

            <div
              className="p-[2.5vh] rounded-[2vh] border-[0.4vh] border-purple-900 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:border-purple-500 w-[80vw] lg:w-[45vh] h-[35vh] flex flex-col justify-center items-center"
              onClick={() => setMode("LAN")}
            >
              <PiNetwork className="text-[7vh] text-purple-400 mb-[2vh]" />
              <h3 className="text-[3.2vh] font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Play LAN
              </h3>
              <p className="text-gray-300 mt-[1vh] text-[2vh]">
                Connect with local players
              </p>
            </div>

            <div
              className="p-[2.5vh] rounded-[2vh] border-[0.4vh] border-blue-900 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:border-blue-400 w-[80vw] lg:w-[45vh] h-[35vh] flex flex-col justify-center items-center"
              onClick={() => setMode("Computer")}
            >
              <FaRobot className="text-[7vh] text-cyan-300 mb-[2vh]" />
              <h3 className="text-[3.2vh] font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                Play Computer
              </h3>
              <p className="text-gray-300 mt-[1vh] text-[2vh]">
                Challenge AI opponents
              </p>
            </div>
          </div>
        ) : (
          <>
            {mode === "LAN" && <LanOptions onBack={() => setMode(null)} />}
            {mode === "Computer" && (
              <ComputerOptions onBack={() => setMode(null)} />
            )}
            {mode === "Local" && (
              <LocalGameWindow onBack={() => setMode(null)} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameModeButtons;
