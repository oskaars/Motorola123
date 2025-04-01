"use client";
import React, { useState } from "react";
import { FaBrain, FaRobot, FaChessKing } from "react-icons/fa";
import { useRouter } from "next/navigation";

type TimeControlType = "blitz" | "rapid" | "classical";

type EngineSettings = {
  type: "Minimax" | "MCTS";
  useBook: boolean;
  depth: number;
  timeControl?: {
    type: TimeControlType;
    baseTime: number; // in seconds
    increment: number; // in seconds
  };
};

const ComputerOptions: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const [hoverOption, setHoverOption] = useState<string | null>(null);
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControlType>("rapid");
  
  const timeControls: Record<TimeControlType, { baseTime: number, increment: number }> = {
    blitz: { baseTime: 180, increment: 2 },      // 3+2
    rapid: { baseTime: 600, increment: 5 },      // 10+5
    classical: { baseTime: 1800, increment: 10 } // 30+10
  };
  
  const engineOptions: Record<string, EngineSettings> = {
    mcts: { type: "MCTS", useBook: false, depth: 3 },
    minimax: { type: "Minimax", useBook: false, depth: 5 },
    grandmaster: { type: "Minimax", useBook: true, depth: 7 },
  };

  const handleSelect = (option: string) => {
    const engineSetting = {...engineOptions[option]};
    
    // Add time control settings
    engineSetting.timeControl = {
      type: selectedTimeControl,
      baseTime: timeControls[selectedTimeControl].baseTime,
      increment: timeControls[selectedTimeControl].increment
    };
    
    localStorage.setItem('engineSettings', JSON.stringify(engineSetting));
    
    router.push('/play/engine');
  };

  return (
    <div className="relative z-[50] w-full flex flex-col items-center">
      <div className="h-[6vh] mb-[4vh] flex items-center">
        <button
          onClick={onBack}
          className="text-[2.5vh] text-gray-300 hover:text-purple-400 transition-all"
        >
          ← Back to Main Menu
        </button>
      </div>

      {/* Time Control Selection */}
      <div className="mb-[4vh] w-[80vw] lg:w-auto">
        <h3 className="text-[2.5vh] text-center text-gray-300 mb-[2vh]">Select Time Control</h3>
        <div className="flex flex-wrap justify-center gap-[2vh]">
          <button
            className={`px-[2vh] py-[1vh] rounded-[1vh] text-[2vh] transition-all ${
              selectedTimeControl === 'blitz' 
                ? 'bg-blue-500/30 border-2 border-blue-400 text-white' 
                : 'bg-gray-900/50 border-2 border-gray-700 text-gray-300 hover:border-blue-400'
            }`}
            onClick={() => setSelectedTimeControl('blitz')}
          >
            Blitz (3+2)
          </button>
          <button
            className={`px-[2vh] py-[1vh] rounded-[1vh] text-[2vh] transition-all ${
              selectedTimeControl === 'rapid' 
                ? 'bg-blue-500/30 border-2 border-blue-400 text-white' 
                : 'bg-gray-900/50 border-2 border-gray-700 text-gray-300 hover:border-blue-400'
            }`}
            onClick={() => setSelectedTimeControl('rapid')}
          >
            Rapid (10+5)
          </button>
          <button
            className={`px-[2vh] py-[1vh] rounded-[1vh] text-[2vh] transition-all ${
              selectedTimeControl === 'classical' 
                ? 'bg-blue-500/30 border-2 border-blue-400 text-white' 
                : 'bg-gray-900/50 border-2 border-gray-700 text-gray-300 hover:border-blue-400'
            }`}
            onClick={() => setSelectedTimeControl('classical')}
          >
            Classical (30+10)
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-[4vh] lg:gap-[2vw] w-full justify-center items-center">
        <div 
          className={`p-[2.5vh] rounded-[2vh] border-[0.4vh] border-blue-900 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all ${
            hoverOption === 'mcts' ? 'border-blue-400 shadow-lg shadow-blue-500/20 scale-105' : 'hover:border-blue-400'
          } w-[80vw] lg:w-[45vh] h-[35vh] flex flex-col justify-center items-center`}
          onMouseEnter={() => setHoverOption('mcts')}
          onMouseLeave={() => setHoverOption(null)}
          onClick={() => handleSelect('mcts')}
        >
          <FaRobot className="text-[5vh] text-blue-400 mb-[2vh]" />
          <h3 className="text-[3.2vh] font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            MCTS AI
          </h3>
          <p className="text-gray-300 mt-[1vh] text-[2vh] text-center">Beginner-friendly AI</p>
          
          {hoverOption === 'mcts' && (
            <div className="mt-4 text-gray-300 text-sm">
              <ul className="list-disc list-inside text-left">
                <li>Entry level</li>
                <li>Depth: 3</li>
                <li>No opening book</li>
              </ul>
            </div>
          )}
        </div>

        <div 
          className={`p-[2.5vh] rounded-[2vh] border-[0.4vh] border-blue-900 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all ${
            hoverOption === 'minimax' ? 'border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105' : 'hover:border-blue-400'
          } w-[80vw] lg:w-[45vh] h-[35vh] flex flex-col justify-center items-center`}
          onMouseEnter={() => setHoverOption('minimax')}
          onMouseLeave={() => setHoverOption(null)}
          onClick={() => handleSelect('minimax')}
        >
          <FaBrain className="text-[5vh] text-cyan-400 mb-[2vh]" />
          <h3 className="text-[3.2vh] font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Minimax AI
          </h3>
          <p className="text-gray-300 mt-[1vh] text-[2vh] text-center">Intermediate search algorithm</p>
          
          {hoverOption === 'minimax' && (
            <div className="mt-4 text-gray-300 text-sm">
              <ul className="list-disc list-inside text-left">
                <li>Intermediate level</li>
                <li>Depth: 5</li>
                <li>No opening book</li>
              </ul>
            </div>
          )}
        </div>

        <div 
          className={`p-[2.5vh] rounded-[2vh] border-[0.4vh] border-blue-900 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all ${
            hoverOption === 'grandmaster' ? 'border-purple-400 shadow-lg shadow-purple-500/20 scale-105' : 'hover:border-blue-400'
          } w-[80vw] lg:w-[45vh] h-[35vh] flex flex-col justify-center items-center`}
          onMouseEnter={() => setHoverOption('grandmaster')}
          onMouseLeave={() => setHoverOption(null)}
          onClick={() => handleSelect('grandmaster')}
        >
          <FaChessKing className="text-[5vh] text-purple-300 mb-[2vh]" />
          <h3 className="text-[3.2vh] font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Grand Master
          </h3>
          <p className="text-gray-300 mt-[1vh] text-[2vh] text-center">Intermediate AI with opening book</p>
          
          {hoverOption === 'grandmaster' && (
            <div className="mt-4 text-gray-300 text-sm">
              <ul className="list-disc list-inside text-left">
                <li>Advanced level</li>
                <li>Depth: 7</li>
                <li>Uses opening book</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComputerOptions;
