"use client";
import React, { useState } from "react";
import ChessboardLan from "./ChessboardLan";
import LanOptions from "./LanOptions";
import ThemeSettings from "./ThemeSettings";
import Link from "next/link";

const LanGameWindow = () => {
  const [inGame, setInGame] = useState(false);
  const [wsClient, setWsClient] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  const handleBack = () => {
    // When leaving a game, simply reset the game state.
    setInGame(false);
    setWsClient(null);
    setRoomId(null);
  };

  const handleGameStart = (client: any, room: string) => {
    setWsClient(client);
    setRoomId(room);
    setInGame(true);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full px-4 mt-[2vh] lg:mt-[0vh] justify-center items-start relative z-50 lg:gap-x-[2vh] mx-auto max-w-7xl">
      {inGame ? (
        <>
          {/* Left Section - Chessboard */}
          <div className="flex items-center justify-center w-full h-full lg:mt-[2vh]">
            <div className="flex justify-center items-center w-full h-full bg-black/20 rounded-xl px-4 shadow-xl border-[0.4vh] border-[#5c085a]/50 backdrop-blur-sm">
              <ChessboardLan
                wsClient={wsClient}
                roomId={roomId}
                onBack={handleBack}
                maxSize={1000}
                minSize={400}
              />
            </div>
          </div>
          {/* Right Section - Controls */}
          <div className="w-full lg:w-[40vw] h-fit mt-[2vh] flex justify-center items-start">
            <div className="w-full bg-gray-900/50 border-[0.4vh] lg:mt-[10vh] h-full border-[#5c085a]/50 rounded-xl p-4 shadow-xl backdrop-blur-sm relative z-99 flex flex-col py-[5vh] gap-8">
              <ThemeSettings />
              <button
                onClick={handleBack}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-[0.3vh] border-purple-500/50 rounded-lg text-purple-300 font-medium text-lg transition-all duration-300"
              >
                Back to Options
              </button>
              <Link
                href="/play"
                className="w-full px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border-[0.3vh] border-red-500/50 rounded-lg text-red-300 font-medium text-lg transition-all duration-300 text-center"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/play";
                }}
              >
                Go Back
              </Link>
            </div>
          </div>
        </>
      ) : (
        // Options view to create or join a room
        <LanOptions
          onGameStart={handleGameStart}
          onBack={() => (window.location.href = "/play")}
        />
      )}
    </div>
  );
};

export default LanGameWindow;
