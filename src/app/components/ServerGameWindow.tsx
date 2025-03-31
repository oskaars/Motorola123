"use client";
import React, { useState, useEffect, useRef } from "react";
import ServerChessboard from "./ServerChessboard";
import ThemeSettings from "./ThemeSettings";
import Link from "next/link";
import { UciWebSocketClient } from "@/app/lib/ws-client";
import { ChessGame, Square } from "@/app/utils/chess";

type EngineType = "Minimax" | "MCTS";

type ServerGameWindowProps = {
  initialSettings?: {
    type: EngineType;
    useBook: boolean;
    depth: number;
  };
};

const ServerGameWindow = ({ initialSettings }: ServerGameWindowProps) => {
  const [inGame, setInGame] = useState(false);
  const [serverClient, setServerClient] = useState<UciWebSocketClient | null>(null);
  const [game, setGame] = useState<ChessGame | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [gameMessages, setGameMessages] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [gameMoves, setGameMoves] = useState<string[]>([]);
  const [engineType, setEngineType] = useState<EngineType>(initialSettings?.type || "Minimax");
  const [useOpeningBook, setUseOpeningBook] = useState<boolean>(initialSettings?.useBook || false);
  const [searchDepth, setSearchDepth] = useState<number>(initialSettings?.depth || 5);

  useEffect(() => {
    if (initialSettings) {
      setEngineType(initialSettings.type);
      setUseOpeningBook(initialSettings.useBook);
      setSearchDepth(initialSettings.depth);
    }
  }, [initialSettings]);

  useEffect(() => {
    handleStartGame();
    return () => {
      if (serverClient) {
        console.log("Disconnecting from server");
        serverClient.disconnect();
      }
    };
  }, []);

  const handleStartGame = async () => {
    try {
      console.log("Initializing connection to chess engine...");
      setConnectionError(null);
      setGameMoves([]);

      const client = new UciWebSocketClient("", "ws://127.0.0.1:3100/ws");

      await client.initialize();
      console.log("Successfully connected to chess engine");

      setServerClient(client);

      await applyEngineSettings(client);

      const newGame = new ChessGame();
      setGame(newGame);
      setInGame(true);
      setGameMessages([
        "Game started! You are playing as White against the server.",
        `Engine type: ${engineType}`,
        `Opening book: ${useOpeningBook ? "Enabled" : "Disabled"}`,
        `Search depth: ${searchDepth}`,
      ]);
    } catch (error) {
      console.error("Failed to initialize server connection:", error);
      setConnectionError("Failed to connect to chess engine server. Please try again.");
      setGameMessages(["Failed to connect to server. Please try again."]);
    }
  };

  const applyEngineSettings = async (client = serverClient) => {
    if (!client || !client.isConnected()) return false;

    try {
      console.log("Applying engine settings...");

      await Promise.all([
        client.sendCommand("ucinewgame"),
        client.setOption("EngineType", engineType),
        client.setOption("EnableBook", useOpeningBook ? "true" : "false"),
      ]);

      console.log("Engine settings applied successfully");
      return true;
    } catch (error) {
      console.warn("Warning: Failed to apply engine settings:", error);
      setGameMessages((prev) => [...prev, "Failed to update engine settings"]);
      return false;
    }
  };

  const setEngineSettings = async (type: EngineType, useBook: boolean, depth: number) => {
    setEngineType(type);
    setUseOpeningBook(useBook);
    setSearchDepth(depth);

    if (serverClient && serverClient.isConnected()) {
      try {
        await applyEngineSettings();
        setGameMessages((prev) => [
          ...prev,
          `Engine settings updated: ${type} engine, ${useBook ? "with" : "without"} opening book, depth ${depth}`,
        ]);
      } catch (error) {
        console.error("Failed to update engine settings:", error);
        setGameMessages((prev) => [...prev, "Failed to update engine settings: " + error.message]);
      }
    } else {
      setGameMessages((prev) => [
        ...prev,
        `Engine settings will be applied when game starts: ${type} engine, ${useBook ? "with" : "without"} opening book, depth ${depth}`,
      ]);
    }
  };

  const handlePlayerMove = async (from: Square, to: Square) => {
    if (!game || !serverClient || isThinking) return;

    const moveResult = game.makeMove(from, to);
    if (!moveResult) return;

    const moveNotation = `${from}${to}`;
    const updatedMoves = [...gameMoves, moveNotation];
    setGameMoves(updatedMoves);

    setGameMessages((prev) => [...prev, `Your move: ${from}${to}`]);

    if (game.isCheckmate()) {
      setGameMessages((prev) => [...prev, "Checkmate! You win!"]);
      return;
    }

    try {
      setIsThinking(true);
      setGameMessages((prev) => [...prev, "Server is thinking..."]);

      const currentGameState = game.toFEN();
      console.log("Current game state (FEN):", currentGameState);

      const movesString = updatedMoves.join(" ");
      const positionCommand = `position startpos moves ${movesString}`;
      console.log("Sending position command to engine:", positionCommand);

      try {
        await serverClient.sendCommand(positionCommand);
      } catch (error) {
        console.error("Error setting position:", error);
        throw new Error(`Failed to set position: ${error.message}`);
      }

      const goCommand = `go depth ${searchDepth}`;
      console.log(`Sending search command: ${goCommand} (depth: ${searchDepth})`);

      let responses;
      try {
        responses = await serverClient.sendCommand(goCommand);
        console.log("Go command responses:", responses);
      } catch (error) {
        console.error("Error during engine search:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw new Error(`Search failed: ${error.message || "Unknown error"}`);
      }

      if (!responses || responses.length === 0) {
        console.error("Empty response from engine");
        throw new Error("Engine returned empty response");
      }

      console.log("Searching for bestmove in responses:", responses);
      const bestMoveResponse = responses.find((r) => r.toLowerCase().includes("bestmove"));

      if (!bestMoveResponse) {
        console.error("No bestmove in response:", responses);
        throw new Error("No bestmove found in engine response");
      }

      console.log("Best move response:", bestMoveResponse);
      const parts = bestMoveResponse.trim().split(/\s+/);
      console.log("Response parts:", parts);

      if (parts.length < 2) {
        throw new Error(`Invalid bestmove response format: ${bestMoveResponse}`);
      }

      const bestMove = parts[1];
      console.log("Best move extracted:", bestMove);

      if (!bestMove || bestMove.length < 4 || bestMove === "(none)") {
        throw new Error(`Invalid move received from engine: ${bestMove}`);
      }

      const serverFrom = bestMove.substring(0, 2) as Square;
      const serverTo = bestMove.substring(2, 4) as Square;
      console.log(`Server move: from ${serverFrom} to ${serverTo}`);

      if (game.toFEN() !== currentGameState) {
        console.warn("Game state changed during engine thinking - resetting");
        const resetGame = new ChessGame(currentGameState);
        setGame(resetGame);
      }

      const serverMoveResult = game.makeMove(serverFrom, serverTo);
      if (serverMoveResult) {
        const serverMoveNotation = `${serverFrom}${serverTo}`;
        const allMoves = [...updatedMoves, serverMoveNotation];
        setGameMoves(allMoves);

        setGameMessages((prev) => [...prev, `Server move: ${serverFrom}${serverTo}`]);

        setGame(new ChessGame(game.toFEN()));

        if (game.isCheckmate()) {
          setGameMessages((prev) => [...prev, "Checkmate! Server wins!"]);
        }
      } else {
        console.error(`Failed to make move: ${serverFrom}${serverTo}`);
        throw new Error(`Invalid engine move: ${serverFrom}${serverTo}`);
      }
    } catch (error) {
      console.error("Error getting server move:", error);
      setGameMessages((prev) => [...prev, `Error getting server's move: ${error.message || "Unknown error"}`]);

      if (error.stack) {
        console.error("Error stack:", error.stack);
      }

      if (
        typeof error.message === "string" &&
        (error.message.includes("connection") ||
          error.message.includes("timeout") ||
          error.message.includes("WebSocket"))
      ) {
        setGameMessages((prev) => [...prev, "Attempting to reconnect to server..."]);
        await handleStartGame();
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleBack = () => {
    if (serverClient) {
      serverClient.disconnect();
    }
    setInGame(false);
    setServerClient(null);
    setGame(null);
    setGameMessages([]);
  };

  const EngineSelector = () => (
    <div className="flex flex-col space-y-3">
      <h2 className="text-xl font-bold text-purple-300">Engine Settings</h2>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setEngineSettings("MCTS", false, 3)}
          className={`px-4 py-2 rounded-lg border-2 transition-all ${
            engineType === "MCTS" && !useOpeningBook
              ? "bg-purple-500/40 border-purple-500 text-white"
              : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
          }`}
        >
          Beginner
          <br />
          <span className="text-xs">(MCTS)</span>
        </button>

        <button
          onClick={() => setEngineSettings("Minimax", false, 5)}
          className={`px-4 py-2 rounded-lg border-2 transition-all ${
            engineType === "Minimax" && !useOpeningBook
              ? "bg-purple-500/40 border-purple-500 text-white"
              : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
          }`}
        >
          Intermediate
          <br />
          <span className="text-xs">(Minimax)</span>
        </button>

        <button
          onClick={() => setEngineSettings("MCTS", true, 5)}
          className={`px-4 py-2 rounded-lg border-2 transition-all ${
            engineType === "MCTS" && useOpeningBook
              ? "bg-pink-500/40 border-pink-500 text-white"
              : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
          }`}
        >
          Advanced
          <br />
          <span className="text-xs">(MCTS + Book)</span>
        </button>

        <button
          onClick={() => setEngineSettings("Minimax", true, 7)}
          className={`px-4 py-2 rounded-lg border-2 transition-all ${
            engineType === "Minimax" && useOpeningBook && searchDepth >= 7
              ? "bg-pink-500/40 border-pink-500 text-white"
              : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
          }`}
        >
          Grandmaster
          <br />
          <span className="text-xs">(Minimax + Book)</span>
        </button>
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-medium text-purple-300 mb-2">Search Depth: {searchDepth}</h3>
        <input
          type="range"
          min="1"
          max="7"
          value={searchDepth}
          onChange={(e) => setSearchDepth(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1 (Fast)</span>
          <span>4 (Standard)</span>
          <span>7 (Deep)</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row w-full h-full px-4 mt-[2vh] lg:mt-[0vh] justify-center items-start relative z-50 lg:gap-x-[2vh] mx-auto max-w-7xl">
      <div className="flex items-center justify-center w-full h-full lg:mt-[2vh]">
        <div className="flex justify-center items-center w-full h-full bg-black/20 rounded-xl px-4 shadow-xl border-[0.4vh] border-[#5c085a]/50 backdrop-blur-sm">
          {!game ? (
            <div className="flex flex-col items-center justify-center h-[500px] w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <p className="text-purple-300 mt-4">Initializing chess engine...</p>
              {connectionError && (
                <div className="mt-4 text-red-400 text-center max-w-md p-3 bg-black/30 rounded-lg">
                  <p>{connectionError}</p>
                  <button
                    onClick={handleStartGame}
                    className="mt-3 px-4 py-2 bg-purple-500/50 hover:bg-purple-500/70 rounded-lg text-white"
                  >
                    Retry Connection
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ServerChessboard
              game={game}
              onPlayerMove={handlePlayerMove}
              isThinking={isThinking}
              maxSize={1000}
              minSize={400}
            />
          )}
        </div>
      </div>
      <div className="w-full lg:w-[40vw] h-fit mt-[2vh] flex justify-center items-start">
        <div className="w-full bg-gray-900/50 border-[0.4vh] lg:mt-[10vh] h-full border-[#5c085a]/50 rounded-xl p-4 shadow-xl backdrop-blur-sm relative z-99 flex flex-col py-[5vh] gap-8">
          <ThemeSettings />

          {!inGame ? (
            <EngineSelector />
          ) : (
            <div className="bg-gray-800/30 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-purple-200">Current Settings</h3>
              <p className="text-xs text-gray-300">Engine: {engineType}</p>
              <p className="text-xs text-gray-300">Opening Book: {useOpeningBook ? "Enabled" : "Disabled"}</p>
              <p className="text-xs text-gray-300">Search Depth: {searchDepth}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-purple-300">Game Messages</h2>
            <div className="bg-gray-800/50 p-4 rounded-lg max-h-[30vh] overflow-y-auto">
              {gameMessages.map((msg, idx) => (
                <p key={idx} className="text-gray-300 mb-2">{msg}</p>
              ))}
            </div>
          </div>

          <button
            onClick={handleBack}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-[0.3vh] border-purple-500/50 rounded-lg text-purple-300 font-medium text-lg transition-all duration-300"
          >
            End Game
          </button>
          <Link
            href="/play"
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border-[0.3vh] border-red-500/50 rounded-lg text-red-300 font-medium text-lg transition-all duration-300 text-center"
            onClick={(e) => {
              e.preventDefault();
              if (serverClient) {
                serverClient.disconnect();
              }
              window.location.href = "/play";
            }}
          >
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServerGameWindow;
