"use client";
import React, { useState } from "react";
import LanOptions from "./ChooseMode/LanOptions";
import ChessboardLan from "./ChessboardLan";
import ThemeSettings from "./ThemeSettings";

const LanGameWindow = () => {
  const [gameState, setGameState] = useState<{
    isInGame: boolean;
    roomId: string | null;
  }>({
    isInGame: false,
    roomId: null,
  });

  const handleCreateRoom = () => {
    setGameState({ isInGame: true, roomId: null });
  };

  const handleJoinRoom = (roomId: string) => {
    setGameState({ isInGame: true, roomId });
  };

  const handleBack = () => {
    setGameState({ isInGame: false, roomId: null });
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full px-4 mt-[2vh] lg:mt-[0vh] justify-center items-start relative z-50 lg:gap-x-[2vh] mx-auto max-w-7xl">
      {!gameState.isInGame ? (
        <LanOptions
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onBack={handleBack}
        />
      ) : (
        <>
          {/* Left Section - Chessboard Container */}
          <div className="flex items-center justify-center w-full h-full lg:mt-[2vh]">
            <div className="flex justify-center items-center w-full h-full bg-black/20 rounded-xl px-4 shadow-xl border-[0.4vh] border-[#5c085a]/50 backdrop-blur-sm">
              <ChessboardLan
                className="w-full h-full"
                maxSize={1000}
                minSize={400}
                roomId={gameState.roomId}
                onBack={handleBack}
              />
            </div>
          </div>

          {/* Right Section - Controls and Chat */}
          <div className="w-full lg:w-[40vw] h-fit mt-[2vh] flex justify-center items-start">
            <div className="w-full bg-gray-900/50 border-[0.4vh] lg:mt-[10vh] h-full border-[#5c085a]/50 rounded-xl p-4 shadow-xl backdrop-blur-sm relative z-99 items-start justify-center flex flex-col py-[5vh] gap-8">
              <ThemeSettings />
              <button
                onClick={handleBack}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border-[0.3vh] border-red-500/50 rounded-lg text-red-300 font-medium text-lg transition-all duration-300"
              >
                Leave Game
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanGameWindow;
