// components/GameModeSelection.tsx
"use client";
import React from "react";
import { FaNetworkWired, FaRobot } from "react-icons/fa";

interface GameModeSelectionProps {
  onSelectMode: (mode: "LAN" | "COMPUTER") => void;
}

const GameModeSelection: React.FC<GameModeSelectionProps> = ({
  onSelectMode,
}) => {
  return (
    <div className="flex flex-row gap-6 w-full justify-center">
      <div
        className="p-4 rounded-2xl border-2 border-purple-500/30 hover:border-pink-500 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:scale-105 flex flex-col items-center"
        onClick={() => onSelectMode("LAN")}
      >
        <FaNetworkWired className="text-white text-4xl group-hover:fill-pink-500" />
        <h3 className="text-2xl font-bold text-white">LAN</h3>
      </div>

      <div
        className="p-4 rounded-2xl border-2 border-purple-500/30 hover:border-pink-500 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:scale-105 flex flex-col items-center"
        onClick={() => onSelectMode("COMPUTER")}
      >
        <FaRobot className="text-white text-4xl group-hover:fill-pink-500" />
        <h3 className="text-2xl font-bold text-white">Computer</h3>
      </div>
    </div>
  );
};

export default GameModeSelection;
