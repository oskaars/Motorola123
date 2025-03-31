"use client";
import { useState, useEffect } from 'react';

type EngineType = "Minimax" | "MCTS";

export default function EngineControls({ 
  onSettingsChange,
  initialSettings = { type: "Minimax" as EngineType, useBook: false, depth: 5 },
  disabled = false
}) {
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [engineType, setEngineType] = useState<EngineType>(initialSettings.type);
  const [useOpeningBook, setUseOpeningBook] = useState<boolean>(initialSettings.useBook);
  const [searchDepth, setSearchDepth] = useState<number>(initialSettings.depth);

  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange({
        type: engineType,
        useBook: useOpeningBook,
        depth: searchDepth
      });
    }
  }, []);

  const analyzePosition = async () => {
    setLoading(true);
    setTimeout(() => {
      setBestMove('e2e4');
      setLoading(false);
    }, 2000);
  };

  const updateEngineSettings = (type: EngineType, useBook: boolean, depth: number) => {
    setEngineType(type);
    setUseOpeningBook(useBook);
    setSearchDepth(depth);
    
    setBestMove(null);
    
    if (onSettingsChange) {
      onSettingsChange({
        type,
        useBook,
        depth
      });
    }
  };

  return (
    <div className={`bg-gray-900/80 p-6 rounded-lg shadow-md border border-purple-500/40 ${disabled ? 'opacity-80' : ''}`}>
      <h2 className="text-xl font-bold mb-4 text-purple-300">Engine Settings</h2>
      
      {/* Engine Type Selection */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => !disabled && updateEngineSettings("MCTS", false, 3)}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg border-2 transition-all ${
            engineType === "MCTS" && !useOpeningBook
              ? "bg-purple-500/40 border-purple-500 text-white"
              : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Beginner
          <br />
          <span className="text-xs">(MCTS)</span>
        </button>
        
        <button
          onClick={() => !disabled && updateEngineSettings("Minimax", false, 5)}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg border-2 transition-all ${
            engineType === "Minimax" && !useOpeningBook
              ? "bg-purple-500/40 border-purple-500 text-white"
              : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Intermediate
          <br />
          <span className="text-xs">(Minimax)</span>
        </button>
        
        <button
          onClick={() => !disabled && updateEngineSettings("MCTS", true, 5)}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg border-2 transition-all ${
            engineType === "MCTS" && useOpeningBook
              ? "bg-pink-500/40 border-pink-500 text-white"
              : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Advanced
          <br />
          <span className="text-xs">(MCTS + Book)</span>
        </button>
        
        <button
          onClick={() => !disabled && updateEngineSettings("Minimax", true, 7)}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg border-2 transition-all ${
            engineType === "Minimax" && useOpeningBook && searchDepth >= 7
              ? "bg-pink-500/40 border-pink-500 text-white"
              : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Grandmaster
          <br />
          <span className="text-xs">(Minimax + Book)</span>
        </button>
      </div>
      
      {/* Depth Control */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-purple-300 mb-2">Search Depth: {searchDepth}</h3>
        <input
          type="range"
          min="1"
          max="7"
          value={searchDepth}
          onChange={(e) => {
            const newDepth = parseInt(e.target.value);
            setSearchDepth(newDepth);
            if (onSettingsChange) {
              onSettingsChange({
                type: engineType,
                useBook: useOpeningBook,
                depth: newDepth
              });
            }
          }}
          disabled={disabled}
          className={`w-full ${disabled ? 'opacity-50' : ''}`}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1 (Fast)</span>
          <span>4 (Standard)</span>
          <span>7 (Deep)</span>
        </div>
      </div>

      {/* Analysis Button */}
      <button
        onClick={analyzePosition}
        disabled={loading || disabled}
        className={`w-full px-4 py-3 rounded-lg transition-all duration-300 ${
          loading || disabled
            ? "bg-gray-700/50 cursor-not-allowed text-gray-400" 
            : "bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/40 hover:to-pink-500/40 border-[0.3vh] border-purple-500/50 text-purple-300"
        }`}
      >
        {loading ? 'Analyzing...' : 'Analyze Position'}
      </button>

      {/* Results Display */}
      {bestMove && (
        <div className="mt-4 p-3 bg-gray-800/50 border-l-4 border-purple-500/50 text-purple-300">
          <p className="font-medium">Best Move: {bestMove}</p>
          <p className="text-xs mt-1 text-gray-400">
            Using {engineType} engine {useOpeningBook ? 'with' : 'without'} opening book
            at depth {searchDepth}
          </p>
        </div>
      )}
    </div>
  );
}
