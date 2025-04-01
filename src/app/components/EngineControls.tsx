"use client";
import { useState, useEffect } from 'react';

type EngineType = "Minimax" | "MCTS";

type TimeControlType = "blitz" | "rapid" | "classical" | "custom";

interface EngineSettings {
  type: EngineType;
  useBook: boolean;
  depth: number;
  timeControl?: {
    type: TimeControlType;
    baseTime: number; // in seconds
    increment: number; // in seconds
    movesToGo?: number;
  };
}

interface EngineControlProps {
  onSettingsChange?: (settings: EngineSettings) => void;
  initialSettings?: EngineSettings;
  disabled?: boolean;
}

export default function EngineControls({ 
  onSettingsChange,
  initialSettings = { 
    type: "Minimax" as EngineType, 
    useBook: false, 
    depth: 5,
    timeControl: {
      type: "rapid" as TimeControlType,
      baseTime: 600, // 10 minutes
      increment: 5,
    }
  },
  disabled = false
}: EngineControlProps) {
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [engineType, setEngineType] = useState<EngineType>(initialSettings.type);
  const [useOpeningBook, setUseOpeningBook] = useState<boolean>(initialSettings.useBook);
  const [searchDepth, setSearchDepth] = useState<number>(initialSettings.depth);
  const [timeControlType, setTimeControlType] = useState<TimeControlType>(
    initialSettings.timeControl?.type || "rapid"
  );
  const [baseTime, setBaseTime] = useState<number>(
    initialSettings.timeControl?.baseTime || 600
  );
  const [increment, setIncrement] = useState<number>(
    initialSettings.timeControl?.increment || 5
  );

  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange({
        type: engineType,
        useBook: useOpeningBook,
        depth: searchDepth,
        timeControl: {
          type: timeControlType,
          baseTime,
          increment
        }
      });
    }
  }, [engineType, useOpeningBook, searchDepth, timeControlType, baseTime, increment, onSettingsChange]);

  const analyzePosition = async () => {
    setLoading(true);
    setTimeout(() => {
      setBestMove('e2e4');
      setLoading(false);
    }, 2000);
  };

  const updateEngineSettings = (
    type: EngineType, 
    useBook: boolean, 
    depth: number,
    timeCtrl: TimeControlType = timeControlType
  ) => {
    setEngineType(type);
    setUseOpeningBook(useBook);
    setSearchDepth(depth);
    setTimeControlType(timeCtrl);
    
    // Set appropriate time control based on the selected type
    switch(timeCtrl) {
      case "blitz":
        setBaseTime(180); // 3 minutes
        setIncrement(2);
        break;
      case "rapid":
        setBaseTime(600); // 10 minutes
        setIncrement(5);
        break;
      case "classical":
        setBaseTime(1800); // 30 minutes
        setIncrement(10);
        break;
      // custom remains unchanged
    }
    
    setBestMove(null);
    
    if (onSettingsChange) {
      onSettingsChange({
        type,
        useBook,
        depth,
        timeControl: {
          type: timeCtrl,
          baseTime: timeCtrl === "custom" ? baseTime : 
                   timeCtrl === "blitz" ? 180 :
                   timeCtrl === "rapid" ? 600 : 1800,
          increment: timeCtrl === "custom" ? increment :
                    timeCtrl === "blitz" ? 2 :
                    timeCtrl === "rapid" ? 5 : 10
        }
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
                depth: newDepth,
                timeControl: {
                  type: timeControlType,
                  baseTime,
                  increment
                }
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

      {/* Time Control Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-purple-300 mb-2">Time Control</h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => !disabled && setTimeControlType("blitz")}
            disabled={disabled}
            className={`px-2 py-1 rounded-lg border text-sm transition-all ${
              timeControlType === "blitz"
                ? "bg-purple-500/40 border-purple-500 text-white"
                : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Blitz
          </button>
          
          <button
            onClick={() => !disabled && setTimeControlType("rapid")}
            disabled={disabled}
            className={`px-2 py-1 rounded-lg border text-sm transition-all ${
              timeControlType === "rapid"
                ? "bg-purple-500/40 border-purple-500 text-white"
                : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Rapid
          </button>
          
          <button
            onClick={() => !disabled && setTimeControlType("classical")}
            disabled={disabled}
            className={`px-2 py-1 rounded-lg border text-sm transition-all ${
              timeControlType === "classical"
                ? "bg-purple-500/40 border-purple-500 text-white"
                : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Classical
          </button>
          
          <button
            onClick={() => !disabled && setTimeControlType("custom")}
            disabled={disabled}
            className={`px-2 py-1 rounded-lg border text-sm transition-all ${
              timeControlType === "custom"
                ? "bg-purple-500/40 border-purple-500 text-white"
                : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Custom
          </button>
        </div>
        
        {timeControlType === "custom" && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400">Base time (seconds)</label>
              <input
                type="number"
                min="10"
                max="3600"
                value={baseTime}
                onChange={(e) => setBaseTime(Number(e.target.value))}
                disabled={disabled}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Increment (seconds)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={increment}
                onChange={(e) => setIncrement(Number(e.target.value))}
                disabled={disabled}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300"
              />
            </div>
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-400">
          {timeControlType === "blitz" && "3 minutes + 2 seconds increment"}
          {timeControlType === "rapid" && "10 minutes + 5 seconds increment"}
          {timeControlType === "classical" && "30 minutes + 10 seconds increment"}
          {timeControlType === "custom" && `${baseTime} seconds + ${increment} seconds increment`}
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
          <p className="text-xs mt-1 text-gray-400">
            Time control: {
              timeControlType === "blitz" ? "Blitz (3+2)" :
              timeControlType === "rapid" ? "Rapid (10+5)" :
              timeControlType === "classical" ? "Classical (30+10)" :
              `Custom (${baseTime}+${increment})`
            }
          </p>
        </div>
      )}
    </div>
  );
}
