"use client";
import React, { useState, useEffect } from "react";
import { FaPlus, FaSignInAlt } from "react-icons/fa";
import WebSocketClient from "@/app/lib/websocket";
import ChessboardLan from "../ChessboardLan";

interface LanOptionsProps {
  onBack: () => void;
}

const LanOptions: React.FC<LanOptionsProps> = ({ onBack }) => {
  const [step, setStep] = useState<"menu" | "join" | "time">("menu");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [selectedTimeOption, setSelectedTimeOption] = useState<number>(600);
  const [gameState, setGameState] = useState<{
    inGame: boolean;
    roomId: string | null;
  }>({
    inGame: false,
    roomId: null,
  });

  useEffect(() => {
    const randomUsername = `Player${Math.floor(
      Math.random() * 1000
    )}_${Date.now().toString().slice(-4)}`;
    const client = new WebSocketClient(randomUsername);
    setWsClient(client);

    return () => {
      if (client) {
        client.leaveRoom();
      }
    };
  }, []);

  const handleCreateRoom = () => {
    if (wsClient) {
      wsClient.createRoom(selectedTimeOption);
      const roomId = "ROOM" + Math.floor(Math.random() * 10000);
      setGameState({ inGame: true, roomId });
    }
  };

  const handleJoinRoom = () => {
    if (joinRoomId.trim() && wsClient) {
      wsClient.joinRoom(joinRoomId.trim());
      setGameState({ inGame: true, roomId: joinRoomId.trim() });
    }
  };

  const handleTimeSelection = (seconds: number) => {
    setSelectedTimeOption(seconds);
  };

  const handleBackFromGame = () => {
    setGameState({ inGame: false, roomId: null });
    if (wsClient) {
      wsClient.leaveRoom();
    }
  };

  return (
    <div className="w-full h-full">
      {!gameState.inGame ? (
        <div className="relative z-[50] w-full flex flex-col items-center">
          <div className="h-[6vh] mb-[4vh] flex items-center">
            <button
              onClick={() => (step === "menu" ? onBack() : setStep("menu"))}
              className="text-[2.5vh] text-gray-300 hover:text-purple-400 transition-all"
            >
              ← {step === "menu" ? "Back to Main Menu" : "Back to Options"}
            </button>
          </div>

          {step === "menu" && (
            <div className="flex flex-col lg:flex-row gap-[4vh] lg:gap-[2vw] w-full justify-center items-center">
              <div
                className="p-[2.5vh] rounded-[2vh] border-[0.4vh] border-purple-500/40 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:border-purple-500 w-[80vw] lg:w-[45vh] h-[35vh] flex flex-col justify-center items-center"
                onClick={() => setStep("time")}
              >
                <FaPlus className="text-[6vh] text-purple-400 mb-[2vh]" />
                <h3 className="text-[3.5vh] font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Create Room
                </h3>
                <p className="text-gray-300 mt-[1vh] text-[2.2vh]">
                  Start new game
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
          )}

          {step === "time" && (
            <div className="w-full max-w-[60vh] flex flex-col gap-8">
              <div>
                <h3 className="text-[2.5vh] font-bold text-purple-300 mb-4">
                  Select Game Time
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "1 Min", seconds: 60 },
                    { label: "3 Min", seconds: 180 },
                    { label: "10 Min", seconds: 600 },
                    { label: "60 Min", seconds: 3600 },
                  ].map((option) => (
                    <button
                      key={option.seconds}
                      onClick={() => handleTimeSelection(option.seconds)}
                      className={`py-[2vh] rounded-[1vh] transition-all duration-300 ${
                        selectedTimeOption === option.seconds
                          ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-500/50"
                          : "bg-gray-900/50 border-purple-500/40"
                      } border-[0.3vh] text-purple-300 font-medium hover:border-purple-500 hover:bg-purple-500/20`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateRoom}
                className="w-full py-[2vh] mt-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2vh] text-white font-semibold text-[2.5vh] transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
              >
                <FaPlus className="text-[2.5vh]" />
                Create {selectedTimeOption / 60} Min Game Room
              </button>
            </div>
          )}

          {step === "join" && (
            <div className="w-full max-w-[60vh] flex flex-col gap-[4vh] items-center">
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Room ID"
                className="w-full px-[3vw] py-[2vh] text-[2.5vh] bg-gray-900/80 rounded-[2vh] border-[0.4vh] border-purple-500/40 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleJoinRoom}
                className="w-full py-[2vh] bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2vh] text-white font-semibold text-[2.5vh] transition-opacity hover:opacity-90"
              >
                Join Room
              </button>
            </div>
          )}
        </div>
      ) : (
        <ChessboardLan
          maxSize={1000}
          minSize={400}
          wsClient={wsClient}
          roomId={gameState.roomId}
          onBack={handleBackFromGame}
        />
      )}
    </div>
  );
};

export default LanOptions;
