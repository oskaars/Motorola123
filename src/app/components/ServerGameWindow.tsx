"use client";
import React, { useState, useEffect, useRef } from "react";
import ServerChessboard from "./ServerChessboard";
import ThemeSettings from "./ThemeSettings";
import Link from "next/link";
import { UciWebSocketClient, TimeControlParams } from "@/app/lib/ws-client";
import { ChessGame, Square } from "@/app/utils/chess";

type EngineType = "Minimax" | "MCTS";
type TimeControlType = "blitz" | "rapid" | "classical" | "custom";

interface TimeControl {
  type: TimeControlType;
  baseTime: number;
  increment: number;
}

type ServerGameWindowProps = {
  initialSettings?: {
    type: EngineType;
    useBook: boolean;
    depth: number;
    timeControl?: TimeControl;
  };
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const ServerGameWindow = ({ initialSettings }: ServerGameWindowProps) => {
  const [inGame, setInGame] = useState(false);
  const [serverClient, setServerClient] = useState<UciWebSocketClient | null>(
    null
  );
  const [game, setGame] = useState<ChessGame | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [gameMessages, setGameMessages] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionLost, setConnectionLost] = useState<boolean>(false);
  const [gameMoves, setGameMoves] = useState<string[]>([]);
  const [engineType, setEngineType] = useState<EngineType>(
    initialSettings?.type || "Minimax"
  );
  const [useOpeningBook, setUseOpeningBook] = useState<boolean>(
    initialSettings?.useBook || false
  );
  const [searchDepth, setSearchDepth] = useState<number>(
    initialSettings?.depth || 5
  );

  const [timeControl, setTimeControlState] = useState<TimeControl>(
    initialSettings?.timeControl || {
      type: "rapid",
      baseTime: 600,
      increment: 5,
    }
  );
  const [whiteTime, setWhiteTime] = useState<number>(timeControl.baseTime);
  const [blackTime, setBlackTime] = useState<number>(timeControl.baseTime);
  const [clockRunning, setClockRunning] = useState<boolean>(false);
  const [lastMoveTime, setLastMoveTime] = useState<number>(0);
  const clockIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPlayerRef = useRef<"w" | "b">("w");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSettings?.timeControl) {
      setTimeControlState(initialSettings.timeControl);
      setWhiteTime(initialSettings.timeControl.baseTime);
      setBlackTime(initialSettings.timeControl.baseTime);
    }

    if (initialSettings) {
      setEngineType(initialSettings.type);
      setUseOpeningBook(initialSettings.useBook);
      setSearchDepth(initialSettings.depth);
    }
  }, [initialSettings]);

  useEffect(() => {
    return () => {
      if (serverClient) {
        console.log("Disconnecting from server");
        serverClient.disconnect();
      }
      stopClock();
    };
  }, []);

  useEffect(() => {
    if (serverClient) {
      const checkConnection = setInterval(() => {
        if (!serverClient.isConnected() && inGame && !connectionLost) {
          console.error("WebSocket connection lost");
          setConnectionLost(true);
          setConnectionError(
            "Connection to chess engine lost. The game cannot continue."
          );
          stopClock();
          setGame(null);
        }
      }, 1000);

      return () => clearInterval(checkConnection);
    }
  }, [serverClient, inGame, connectionLost]);

  useEffect(() => {
    if (clockRunning && game) {
      startClock(game.turn);
    } else {
      stopClock();
    }

    return () => stopClock();
  }, [clockRunning, game?.turn, serverClient]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [gameMessages]);

  const startClock = (player: "w" | "b") => {
    stopClock();
    currentPlayerRef.current = player;

    clockIntervalRef.current = setInterval(() => {
      if (player === "w") {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            stopClock();
            setGameMessages((prev) => [
              ...prev,
              "Time's up! Black wins on time.",
            ]);
            return 0;
          }
          return prev - 0.1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 0) {
            stopClock();
            setGameMessages((prev) => [
              ...prev,
              "Time's up! White wins on time.",
            ]);
            return 0;
          }
          return prev - 0.1;
        });
      }
    }, 100);
  };

  const stopClock = () => {
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
      clockIntervalRef.current = null;
    }
  };

  const handleStartGame = async () => {
    try {
      console.log("Initializing connection to chess engine...");
      setConnectionError(null);
      setConnectionLost(false);
      setGameMessages([]);
      setGameMoves([]);
      setWhiteTime(timeControl.baseTime);
      setBlackTime(timeControl.baseTime);
      setInGame(true);

      const client = new UciWebSocketClient("", "ws://127.0.0.1:3100/ws");

      client.onConnectionLost(() => {
        console.error("WebSocket connection lost");
        setConnectionLost(true);
        setConnectionError(
          "Connection to chess engine lost. The game cannot continue."
        );
        stopClock();
        setGame(null);
      });

      await client.initialize();
      console.log("Successfully connected to chess engine");

      setServerClient(client);

      await applyEngineSettings(client);

      const newGame = new ChessGame();
      setGame(newGame);

      setGameMessages([
        "Game started! You are playing as White against the server.",
        `Engine type: ${engineType}`,
        `Opening book: ${useOpeningBook ? "Enabled" : "Disabled"}`,
        `Search depth: ${searchDepth}`,
        `Time control: ${formatTimeControlName(timeControl.type)} (${
          timeControl.baseTime / 60
        } min + ${timeControl.increment} sec)`,
      ]);

      setClockRunning(true);
      setLastMoveTime(Date.now());
    } catch (error) {
      console.error("Failed to initialize server connection:", error);
      setConnectionError(
        "Failed to connect to chess engine server. Please try again."
      );
      setGameMessages(["Failed to connect to server. Please try again."]);
    }
  };

  const formatTimeControlName = (type: TimeControlType): string => {
    switch (type) {
      case "blitz":
        return "Blitz";
      case "rapid":
        return "Rapid";
      case "classical":
        return "Classical";
      case "custom":
        return "Custom";
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

  const setEngineSettings = async (
    type: EngineType,
    useBook: boolean,
    depth: number
  ) => {
    setEngineType(type);
    setUseOpeningBook(useBook);
    setSearchDepth(depth);

    try {
      const currentSettings = localStorage.getItem("engineSettings");
      if (currentSettings) {
        const parsedSettings = JSON.parse(currentSettings);
        localStorage.setItem(
          "engineSettings",
          JSON.stringify({
            ...parsedSettings,
            type,
            useBook,
            depth,
          })
        );
      }
    } catch (e) {
      console.error("Error updating localStorage engine settings:", e);
    }

    if (serverClient && serverClient.isConnected()) {
      try {
        await applyEngineSettings();
        setGameMessages((prev) => [
          ...prev,
          `Engine settings updated: ${type} engine, ${
            useBook ? "with" : "without"
          } opening book, depth ${depth}`,
        ]);
      } catch (error) {
        console.error("Failed to update engine settings:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setGameMessages((prev) => [
          ...prev,
          `Failed to update engine settings: ${errorMessage}`,
        ]);
      }
    } else {
      setGameMessages((prev) => [
        ...prev,
        `Engine settings will be applied when game starts: ${type} engine, ${
          useBook ? "with" : "without"
        } opening book, depth ${depth}`,
      ]);
    }
  };

  const setTimeControl = (newTimeControl: TimeControl) => {
    console.log(`Setting time control: ${JSON.stringify(newTimeControl)}`);
    setTimeControlState(newTimeControl);

    try {
      const currentSettings = localStorage.getItem("engineSettings");
      if (currentSettings) {
        const parsedSettings = JSON.parse(currentSettings);
        localStorage.setItem(
          "engineSettings",
          JSON.stringify({
            ...parsedSettings,
            timeControl: newTimeControl,
          })
        );
      }
    } catch (_) {
      console.error("Error updating localStorage time control:", _);
    }
  };

  const handlePlayerMove = async (from: Square, to: Square) => {
    if (!game || !serverClient || isThinking) return;

    const moveResult = game.makeMove(from, to);
    if (!moveResult) return;

    const moveNotation = `${from}${to}`;
    const updatedMoves = [...gameMoves, moveNotation];
    setGameMoves(updatedMoves);

    const now = Date.now();
    setLastMoveTime(now);

    setWhiteTime((prev) => prev + timeControl.increment);
    setGameMessages((prev) => [...prev, `Your move: ${from}${to}`]);

    if (game.isCheckmate()) {
      setGameMessages((prev) => [...prev, "Checkmate! You win!"]);
      setClockRunning(false);
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
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to set position: ${errorMessage}`);
      }

      const timeControlParams: TimeControlParams = {
        wtime: Math.round(whiteTime * 1000),
        btime: Math.round(blackTime * 1000),
        winc: timeControl.increment * 1000,
        binc: timeControl.increment * 1000,
        depth: searchDepth,
      };

      if (blackTime < 5) {
        timeControlParams.movetime = 500;
      } else if (blackTime < 15) {
        timeControlParams.movetime = 1000;
      }

      console.log(
        `Sending search command with time control: `,
        timeControlParams
      );

      let bestMove;
      try {
        bestMove = await serverClient.startSearch(timeControlParams);
        console.log("Best move response:", bestMove);
      } catch (error) {
        console.error("Error during engine search:", error);

        const safeStringify = (obj: unknown) => {
          try {
            return JSON.stringify(
              obj,
              (key, value) =>
                key === "stack" || key === "message" ? String(value) : value,
              2
            );
          } catch (e) {
            return String(obj);
          }
        };

        console.error("Error details:", safeStringify(error));

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Search failed: ${errorMessage}`);
      }

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

        setBlackTime((prev) => prev + timeControl.increment);

        setGameMessages((prev) => [
          ...prev,
          `Server move: ${serverFrom}${serverTo}`,
        ]);

        setGame(new ChessGame(game.toFEN()));

        if (game.isCheckmate()) {
          setGameMessages((prev) => [...prev, "Checkmate! Server wins!"]);
          setClockRunning(false);
        }
      } else {
        console.error(`Failed to make move: ${serverFrom}${serverTo}`);
        throw new Error(`Invalid engine move: ${serverFrom}${serverTo}`);
      }
    } catch (error) {
      console.error("Error getting server move:", error);

      const isErrorWithMessage = (err: unknown): err is Error =>
        typeof err === "object" && err !== null && "message" in err;

      const errorMessage = isErrorWithMessage(error)
        ? error.message
        : String(error);
      setGameMessages((prev) => [
        ...prev,
        `Error getting server's move: ${errorMessage}`,
      ]);

      if (isErrorWithMessage(error) && error.stack) {
        console.error("Error stack:", error.stack);
      }

      if (
        isErrorWithMessage(error) &&
        typeof error.message === "string" &&
        (error.message.includes("connection") ||
          error.message.includes("timeout") ||
          error.message.includes("WebSocket"))
      ) {
        setGameMessages((prev) => [
          ...prev,
          "Attempting to reconnect to server...",
        ]);
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
    stopClock();
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
        <h3 className="text-sm font-medium text-purple-300 mb-2">
          Search Depth: {searchDepth}
        </h3>
        <input
          type="range"
          min="1"
          max="7"
          value={searchDepth}
          onChange={(e) => {
            const newDepth = parseInt(e.target.value);
            setSearchDepth(newDepth);
            if (engineType === "Minimax" && useOpeningBook && newDepth >= 7) {
              setEngineSettings("Minimax", true, newDepth);
            }
          }}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1 (Fast)</span>
          <span>4 (Standard)</span>
          <span>7 (Deep)</span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-purple-300 mb-2">
          Time Control
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() =>
              setTimeControl({ type: "blitz", baseTime: 180, increment: 2 })
            }
            className={`px-3 py-2 rounded-lg border-2 transition-all ${
              timeControl.type === "blitz"
                ? "bg-purple-500/40 border-purple-500 text-white"
                : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
            }`}
          >
            Blitz
            <br />
            <span className="text-xs">(3+2)</span>
          </button>

          <button
            onClick={() =>
              setTimeControl({ type: "rapid", baseTime: 600, increment: 5 })
            }
            className={`px-3 py-2 rounded-lg border-2 transition-all ${
              timeControl.type === "rapid"
                ? "bg-purple-500/40 border-purple-500 text-white"
                : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
            }`}
          >
            Rapid
            <br />
            <span className="text-xs">(10+5)</span>
          </button>

          <button
            onClick={() =>
              setTimeControl({
                type: "classical",
                baseTime: 1800,
                increment: 10,
              })
            }
            className={`px-3 py-2 rounded-lg border-2 transition-all ${
              timeControl.type === "classical"
                ? "bg-purple-500/40 border-purple-500 text-white"
                : "bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40"
            }`}
          >
            Classical
            <br />
            <span className="text-xs">(30+10)</span>
          </button>
        </div>
      </div>

      <button
        onClick={handleStartGame}
        className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border-[0.3vh] border-blue-500/50 rounded-lg text-blue-300 font-medium text-lg transition-all duration-300"
      >
        Start Game
      </button>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row w-full h-full px-4 mt-[2vh] lg:mt-[0vh] justify-center items-start relative z-50 lg:gap-x-[2vh] mx-auto max-w-7xl">
      <div className="flex items-center justify-center w-full h-full lg:mt-[2vh]">
        <div className="flex flex-col justify-center items-center w-full h-full bg-black/20 rounded-xl px-4 shadow-xl border-[0.4vh] border-[#5c085a]/50 backdrop-blur-sm">
          {connectionLost ? (
            <div className="flex flex-col items-center justify-center h-[500px] w-full">
              <div className="text-red-400 text-center max-w-md p-5 bg-black/30 rounded-lg border border-red-500/50">
                <h3 className="text-xl font-semibold mb-3">Connection Lost</h3>
                <p className="mb-4">{connectionError}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setConnectionLost(false);
                      setInGame(false);
                    }}
                    className="px-4 py-2 bg-blue-500/50 hover:bg-blue-500/70 rounded-lg text-white"
                  >
                    Choose Settings
                  </button>
                  <button
                    onClick={handleStartGame}
                    className="px-4 py-2 bg-purple-500/50 hover:bg-purple-500/70 rounded-lg text-white"
                  >
                    Try Reconnecting
                  </button>
                </div>
              </div>
            </div>
          ) : !game ? (
            <div className="flex flex-col items-center justify-center h-[500px] w-full">
              {!inGame ? (
                <EngineSelector />
              ) : (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  <p className="text-purple-300 mt-4">
                    Initializing chess engine...
                  </p>
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
                </>
              )}
            </div>
          ) : (
            <>
              <ServerChessboard
                game={game}
                onPlayerMove={handlePlayerMove}
                isThinking={isThinking}
                maxSize={1000}
                minSize={400}
                whiteTimeRemaining={formatTime(whiteTime)}
                blackTimeRemaining={formatTime(blackTime)}
              />
            </>
          )}
        </div>
      </div>
      <div className="w-full lg:w-[40vw] h-full flex justify-center mt-[2vh] items-start">
        <div className="w-full bg-gray-900/50 border-[0.4vh] h-full border-[#5c085a]/50 rounded-xl p-4 shadow-xl backdrop-blur-sm relative z-99 flex flex-col py-[2vh] gap-8">
          <ThemeSettings />

          {game && (
            <div className="bg-gray-800/30 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-purple-200">
                Current Settings
              </h3>
              <p className="text-xs text-gray-300">Engine: {engineType}</p>
              <p className="text-xs text-gray-300">
                Opening Book: {useOpeningBook ? "Enabled" : "Disabled"}
              </p>
              <p className="text-xs text-gray-300">
                Search Depth: {searchDepth}
              </p>
              <p className="text-xs text-gray-300">
                Time Control: {formatTimeControlName(timeControl.type)} (
                {timeControl.baseTime / 60}+{timeControl.increment})
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="bg-gray-900/80 p-4 rounded-lg shadow-md border border-purple-500/40 flex flex-col h-[40vh]">
              <h3 className="text-lg font-bold mb-2 text-purple-300">
                Game Messages
              </h3>
              <div
                ref={messagesContainerRef}
                className="flex-grow overflow-y-auto mb-4 custom-scrollbar"
              >
                <div className="space-y-2">
                  {gameMessages.map((message, index) => {
                    // Handle move messages
                    if (
                      message.includes("Your move:") ||
                      message.includes("Server move:")
                    ) {
                      const [player, moveInfo] = message.split(": ");
                      const isPlayerMove = player === "Your move";

                      return (
                        <div key={index} className="text-sm break-words">
                          <span className="font-bold">
                            {isPlayerMove ? "You" : "Server"}
                          </span>{" "}
                          moved:
                          <span
                            className={`ml-1 px-1.5 py-0.5 rounded ${
                              isPlayerMove
                                ? "bg-gray-100 text-gray-900"
                                : "bg-gray-800 text-white"
                            }`}
                          >
                            {moveInfo}
                          </span>
                        </div>
                      );
                    }

                    // Default message rendering
                    return (
                      <div
                        key={index}
                        className="text-sm text-gray-200 break-words"
                      >
                        {message}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(107, 114, 128, 0.1);
              border-radius: 4px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(139, 92, 246, 0.3);
              border-radius: 4px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(139, 92, 246, 0.4);
            }
          `}</style>

          {game && (
            <button
              onClick={handleBack}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-[0.3vh] border-purple-500/50 rounded-lg text-purple-300 font-medium text-lg transition-all duration-300"
            >
              End Game
            </button>
          )}

          <Link
            href="/play"
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border-[0.3vh] border-red-500/50 rounded-lg text-red-300 font-medium text-lg transition-all duration-300 text-center"
            onClick={(e) => {
              e.preventDefault();
              if (serverClient) {
                serverClient.disconnect();
              }
              stopClock();
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
