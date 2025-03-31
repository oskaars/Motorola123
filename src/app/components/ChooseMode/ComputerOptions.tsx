"use client";
import React, { useState } from "react";
import { FaBrain, FaRobot, FaChessKing } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

type EngineSettings = {
  type: "Minimax" | "MCTS";
  useBook: boolean;
  depth: number;
};

const ComputerOptions: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const [hoverOption, setHoverOption] = useState<string | null>(null);
  
  const [selectedOption, setSelectedOption] = useState<EngineSettings | null>(null);
  
  const engineOptions: Record<string, EngineSettings> = {
    mcts: { type: "MCTS", useBook: false, depth: 3 },
    minimax: { type: "Minimax", useBook: false, depth: 5 },
    grandmaster: { type: "Minimax", useBook: true, depth: 7 },
  };

  const handleSelect = (option: string) => {
    setSelectedOption(engineOptions[option]);
    
    localStorage.setItem('engineSettings', JSON.stringify(engineOptions[option]));
    
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
