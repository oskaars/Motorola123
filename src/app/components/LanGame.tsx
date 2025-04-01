"use client";
import React, { useEffect, useRef, useState } from "react";
import ThemeSettings from "./ThemeSettings";
import {
  algebraicToCoords,
  ChessGame,
  PieceSymbol,
  Square,
  validateFen,
} from "@/app/utils/chess";
import { WebSocketClient } from "@/app/lib/websocket";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

const playSound = (
  piece: PieceSymbol | " " | null,
  isCapture: boolean = false
) => {
  if (isCapture) {
    const captureNum = Math.floor(Math.random() * 3) + 1;
    const audio = new Audio(`/sounds/zbicie${captureNum}.mp3`);
    audio.play();
    return;
  }

  if (!piece || piece === " ") return;

  const soundMap: Record<string, string> = {
    p: "pawn.mp3",
    n: "knight.mp3",
    b: "bishop.mp3",
    r: "rook.mp3",
    q: "queen.mp3",
    k: "king.mp3",
  };

  const soundFile = soundMap[piece.toLowerCase()];
  if (soundFile) {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.play();
  }
};

interface ChessboardProps {
  maxSize?: number;
  minSize?: number;
  className?: string;
}

const getPieceImage = (piece: PieceSymbol | " "): string | null => {
  if (piece === " ") {
    return null;
  }
  const color = piece === piece.toUpperCase() ? "White" : "Black";
  const type = piece.toLowerCase();
  let pieceName = "";
  switch (type) {
    case "p":
      pieceName = "Pawn";
      break;
    case "n":
      pieceName = "Knight";
      break;
    case "b":
      pieceName = "Bishop";
      break;
    case "r":
      pieceName = "Rook";
      break;
    case "q":
      pieceName = "Queen";
      break;
    case "k":
      pieceName = "King";
      break;
    default:
      return null;
  }
  return `/pawns/${color}${pieceName}.svg`;
};

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const PlayerInfoBar = ({
  color,
  username,
  avatar,
  timeLeft,
  isActive,
  capturedPieces,
}: {
  color: "white" | "black";
  username: string;
  avatar: string;
  timeLeft: number;
  isActive: boolean;
  capturedPieces: string[];
}) => (
  <div
    className={`w-full flex items-center justify-between p-[1.5vh] rounded-[1vh] transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-[0.3vh] border-purple-500/50"
        : "bg-gray-900/50 border-[0.3vh] border-gray-700/50"
    }`}
  >
    <div className="flex items-center gap-[2vh]">
      <img src={avatar} alt={`${color} player`} className="w-[4vh] h-[4vh]" />
      <span
        className={`font-medium text-[2.2vh] ${
          color === "white" ? "text-purple-300" : "text-pink-300"
        }`}
      >
        {username}
      </span>
      <div className="flex items-center">
        <div className="flex -space-x-3">
          {" "}
          {/* Increased overlap with -space-x-3 */}
          {capturedPieces.map((piece, index) => (
            <div
              key={index}
              className="relative hover:z-20" // Added relative positioning and hover z-index
            >
              <img
                src={getPieceImage(piece as PieceSymbol)}
                alt={piece}
                className="w-[3vh] h-[3vh] opacity-75 hover:opacity-100 transition-all duration-200"
                style={{
                  filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))", // Added shadow for better visibility
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
    <div
      className={`text-[2.5vh] font-mono font-bold ${
        isActive ? "text-purple-300" : "text-gray-400"
      }`}
    >
      {formatTime(timeLeft)}
    </div>
  </div>
);

// Restore custom time option
const timeOptions = [
  { label: "1 Min", seconds: 60 },
  { label: "3 Min", seconds: 180 },
  { label: "10 Min", seconds: 600 },
  { label: "60 Min", seconds: 3600 },
  { label: "Custom", seconds: -1 }, // Add custom option back
];

// Update the custom time input logic in CreateJoinOverlay
const CreateJoinOverlay: React.FC<{
  onCreateRoom: (time: number, username: string) => void;
  onJoinRoom: (id: string, username: string) => void;
}> = ({ onCreateRoom, onJoinRoom }) => {
  const [step, setStep] = useState<
    "menu" | "createName" | "createTime" | "joinRoom" | "joinName"
  >("menu");
  const [username, setUsername] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [selectedTime, setSelectedTime] = useState<number>(600);
  const [customTime, setCustomTime] = useState<string>("");

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const minutes = Math.min(Math.max(parseInt(value) || 0, 1), 180);
    setCustomTime(minutes.toString());
    setSelectedTime(minutes * 60);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl p-8">
        {step === "menu" && (
          <div className="flex flex-col gap-6">
            <button
              onClick={() => setStep("createName")}
              className="w-full p-[2vh] rounded-[1vh] bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-[0.3vh] border-purple-500/50 text-purple-300 font-medium text-[2.5vh] transition-all duration-300"
            >
              Create Room
            </button>
            <button
              onClick={() => setStep("joinRoom")}
              className="w-full p-[2vh] rounded-[1vh] bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-[0.3vh] border-purple-500/50 text-purple-300 font-medium text-[2.5vh] transition-all duration-300"
            >
              Join Room
            </button>
            <Link
              href="/play"
              className="w-full p-[2vh] rounded-[1vh] bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border-[0.3vh] border-red-500/50 text-red-300 font-medium text-[2.5vh] transition-all duration-300 text-center"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/play";
              }}
            >
              Go Back
            </Link>
          </div>
        )}

        {step === "createName" && (
          <div className="flex flex-col gap-6">
            <h3 className="text-[2.5vh] font-bold text-center mb-[2vh] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Enter Your Username
            </h3>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-[2vh] py-[2vh] bg-gray-900/80 rounded-[1vh] border-[0.3vh] border-purple-500/40 text-white placeholder-gray-400 text-[2.5vh]"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setStep("menu")}
                className="px-[2vh] py-[1.5vh] bg-red-500/20 hover:bg-red-500/30 border-[0.3vh] border-red-500/50 rounded-[1vh] text-red-300 text-[2vh]"
              >
                Back
              </button>
              <button
                onClick={() => username.trim() && setStep("createTime")}
                disabled={!username.trim()}
                className="flex-1 p-[2vh] bg-gradient-to-r from-purple-600/40 to-pink-600/40 hover:from-purple-600/50 hover:to-pink-600/50 border-[0.3vh] border-purple-500/50 rounded-[1vh] text-purple-300 font-medium text-[2.5vh] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "createTime" && (
          <div className="flex flex-col gap-6">
            <h3 className="text-[2.5vh] font-bold text-center mb-[2vh] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Select Game Time
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {timeOptions.map((option) => (
                <button
                  key={option.seconds}
                  onClick={() => {
                    if (option.seconds === -1) {
                      setCustomTime("");
                      setSelectedTime(0);
                    } else {
                      setSelectedTime(option.seconds);
                      setCustomTime("");
                    }
                  }}
                  className={`p-[2vh] rounded-[1vh] transition-all duration-300 ${
                    (option.seconds === -1 && customTime) ||
                    selectedTime === option.seconds
                      ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-500/50"
                      : "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30"
                  } border-[0.3vh] text-purple-300 font-medium text-[2vh]`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Add custom time input */}
            {(selectedTime === 0 || customTime) && (
              <div className="mt-2">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customTime}
                  onChange={handleCustomTimeChange}
                  placeholder="Enter minutes (1-180)"
                  className="w-full px-[2vh] py-[2vh] bg-gray-900/80 rounded-[1vh] border-[0.3vh] border-purple-500/40 text-white placeholder-gray-400 text-[2vh]"
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep("createName")}
                className="px-[2vh] py-[1.5vh] bg-red-500/20 hover:bg-red-500/30 border-[0.3vh] border-red-500/50 rounded-[1vh] text-red-300 text-[2vh]"
              >
                Back
              </button>
              <button
                onClick={() =>
                  onCreateRoom(
                    selectedTime || parseInt(customTime) * 60,
                    username
                  )
                }
                disabled={!selectedTime && !customTime}
                className="flex-1 p-[2vh] bg-gradient-to-r from-purple-600/40 to-pink-600/40 hover:from-purple-600/50 hover:to-pink-600/50 border-[0.3vh] border-purple-500/50 rounded-[1vh] text-purple-300 font-medium text-[2.5vh] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Room
              </button>
            </div>
          </div>
        )}

        {step === "joinRoom" && (
          <div className="flex flex-col gap-6">
            <h3 className="text-[2.5vh] font-bold text-center mb-[2vh] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Enter Room ID
            </h3>
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="Room ID"
              className="w-full px-[2vh] py-[2vh] bg-gray-900/80 rounded-[1vh] border-[0.3vh] border-purple-500/40 text-white placeholder-gray-400 text-[2.5vh]"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setStep("menu")}
                className="px-[2vh] py-[1.5vh] bg-red-500/20 hover:bg-red-500/30 border-[0.3vh] border-red-500/50 rounded-[1vh] text-red-300 text-[2vh]"
              >
                Back
              </button>
              <button
                onClick={() => joinRoomId.trim() && setStep("joinName")}
                disabled={!joinRoomId.trim()}
                className="flex-1 p-[2vh] bg-gradient-to-r from-purple-600/40 to-pink-600/40 hover:from-purple-600/50 hover:to-pink-600/50 border-[0.3vh] border-purple-500/50 rounded-[1vh] text-purple-300 font-medium text-[2.5vh] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "joinName" && (
          <div className="flex flex-col gap-6">
            <h3 className="text-[2.5vh] font-bold text-center mb-[2vh] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Enter Your Username
            </h3>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-[2vh] py-[2vh] bg-gray-900/80 rounded-[1vh] border-[0.3vh] border-purple-500/40 text-white placeholder-gray-400 text-[2.5vh]"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setStep("joinRoom")}
                className="px-[2vh] py-[1.5vh] bg-red-500/20 hover:bg-red-500/30 border-[0.3vh] border-red-500/50 rounded-[1vh] text-red-300 text-[2vh]"
              >
                Back
              </button>
              <button
                onClick={() =>
                  username.trim() && onJoinRoom(joinRoomId, username)
                }
                disabled={!username.trim()}
                className="flex-1 p-[2vh] bg-gradient-to-r from-purple-600/40 to-pink-600/40 hover:from-purple-600/50 hover:to-pink-600/50 border-[0.3vh] border-purple-500/50 rounded-[1vh] text-purple-300 font-medium text-[2.5vh] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RoomIdPopup = ({
  roomId,
  onClose,
}: {
  roomId: string;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900/90 p-6 rounded-lg shadow-xl border-[0.4vh] border-[#5c085a]/50 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
        <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Room Created!
        </h3>
        <div className="bg-gray-800/80 p-4 rounded-lg shadow-md flex items-center justify-between gap-4 border border-purple-500/40">
          <div>
            <span className="font-bold text-purple-300">Room ID: </span>
            <span className="font-mono text-purple-200">{roomId}</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomId);
            }}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 transition-all duration-300"
          >
            Copy
          </button>
        </div>
        <p className="mt-4 text-gray-400 text-sm text-center">
          Share this ID with your opponent to join the game
        </p>
      </div>
    </div>
  );
};

const Chessboard: React.FC<ChessboardProps> = ({
  maxSize = 800,
  minSize = 280,
  className = "",
}) => {
  const { lightColor, darkColor, highlightColor, PossibleMoveColor } =
    useTheme();

  const [boardSize, setBoardSize] = useState<number>(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState(() => new ChessGame());
  const [boardState, setBoardState] = useState(game.board);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [isCheckmate, setIsCheckmate] = useState<boolean>(false);
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [showPromotion, setShowPromotion] = useState<boolean>(false);
  const [promotionSquare, setPromotionSquare] = useState<Square | null>(null);
  const [promotionFromSquare, setPromotionFromSquare] = useState<Square | null>(
    null
  );
  const PROMOTION_PIECES: PieceSymbol[] = ["q", "r", "b", "n"];
  const [playerInfo, setPlayerInfo] = useState({
    white: { username: "Player 1", avatar: "/pawns/WhiteKing.svg" },
    black: { username: "Player 2", avatar: "/pawns/BlackKing.svg" },
  });
  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);
  const [activeTimer, setActiveTimer] = useState<"white" | "black">("white");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedTimeOption, setSelectedTimeOption] = useState<number>(600);
  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(
    null
  );
  const [gameReady, setGameReady] = useState<boolean>(false);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [timeOutWinner, setTimeOutWinner] = useState<string | null>(null);
  const [showRoomIdPopup, setShowRoomIdPopup] = useState(false);

  // Add captured pieces state
  const [capturedPieces, setCapturedPieces] = useState<{
    white: string[];
    black: string[];
  }>({
    white: [],
    black: [],
  });

  // Add chat ref for scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Add useEffect for auto-scrolling chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    console.log("Initializing WebSocket client");
    // Remove random username generation
    const client = new WebSocketClient(""); // Empty initial username
    setWsClient(client);

    interface RoomCreatedData {
      roomId: string;
    }

    interface JoinedRoomData {
      roomId: string;
    }

    interface OpponentMoveData {
      notation: string;
      sender: string;
    }

    interface MessageData {
      sender: string;
      message: string;
    }
    client.addEventListener(
      "GAME_OVER",
      (data: { reason: string; winner: string }) => {
        setIsCheckmate(true);
        setChatMessages((prev) => [
          ...prev,
          `Game over! ${data.winner} wins by ${data.reason}`,
        ]);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    );

    client.addEventListener(
      "ROOM_CREATED",
      (data: { roomId: string; timeInSeconds: number }) => {
        console.log(`Room created event received: ${JSON.stringify(data)}`);
        setRoomId(data.roomId);
        setWhiteTime(data.timeInSeconds);
        setBlackTime(data.timeInSeconds);
        setShowRoomIdPopup(true);
        setChatMessages((prev) => [
          ...prev,
          `Room created! Your room ID is: ${data.roomId}`,
          `Game time set to ${Math.floor(data.timeInSeconds / 60)} minutes`,
          "Share this ID with your opponent to join the game.",
        ]);

        setTimeout(() => {
          console.log("Requesting color assignment after room creation");
          client.sendRequestColor();
        }, 500);
      }
    );

    client.addEventListener(
      "JOINED_ROOM",
      (data: JoinedRoomData & { timeInSeconds?: number }) => {
        setRoomId(data.roomId);
        if (data.timeInSeconds) {
          setWhiteTime(data.timeInSeconds);
          setBlackTime(data.timeInSeconds);
        }
        setChatMessages((prev) => [...prev, `You joined room: ${data.roomId}`]);
        console.log(`Joined room: ${data.roomId}`);
        client.sendRequestColor();
      }
    );

    client.addEventListener("USER_JOINED", (data: { username: string }) => {
      setChatMessages((prev) => [...prev, `${data.username} joined the game!`]);
    });

    client.addEventListener("OPPONENT_MOVE", (data: OpponentMoveData) => {
      const from = data.notation.substring(0, 2);
      const to = data.notation.substring(2, 4);
      const targetPiece = game.getPiece(to);
      const piece = game.getPiece(from);

      const moveResult =
        data.notation.length > 4
          ? game.makeMove(from, to, data.notation.substring(4) as PieceSymbol)
          : game.makeMove(from, to);

      if (moveResult) {
        // Play sound effects
        if (targetPiece && targetPiece !== " ") {
          playSound(null, true); // Play capture sound
        } else {
          playSound(piece); // Play piece movement sound
        }

        // If a piece was captured, add it to the captured pieces
        if (targetPiece && targetPiece !== " ") {
          const isWhitePiece = targetPiece === targetPiece.toUpperCase();
          setCapturedPieces((prev) => ({
            ...prev,
            [isWhitePiece ? "black" : "white"]: [
              ...prev[isWhitePiece ? "black" : "white"],
              targetPiece,
            ],
          }));
        }
        setBoardState(JSON.parse(JSON.stringify(game.board)));
        setChatMessages((prev) => [
          ...prev,
          `${data.sender} moved: ${data.notation}`,
        ]);

        setActiveTimer(game.turn === "w" ? "white" : "black");

        if (game.isCheckmate()) {
          setIsCheckmate(true);
          console.log("Checkmate!");
          setChatMessages((prev) => [...prev, "Checkmate!"]);
        }
      } else {
        console.error(`Failed to make opponent's move: ${data.notation}`);
      }
    });

    client.addEventListener("MESSAGE", (data: MessageData) => {
      setChatMessages((prev) => [...prev, `${data.sender}: ${data.message}`]);
    });

    client.addEventListener(
      "COLOR_ASSIGNED",
      (data: { color: "white" | "black" }) => {
        setPlayerColor(data.color);
        setChatMessages((prev) => [
          ...prev,
          `You are playing as ${data.color}`,
        ]);
        const playerUsername = client.username;

        if (data.color === "white") {
          setPlayerInfo((prev) => ({
            ...prev,
            white: { ...prev.white, username: playerUsername },
          }));
        } else {
          setPlayerInfo((prev) => ({
            ...prev,
            black: { ...prev.black, username: playerUsername },
          }));
        }
      }
    );

    client.addEventListener(
      "GAME_READY",
      (data: {
        whitePlayer: string;
        blackPlayer: string;
        timeInSeconds: number;
      }) => {
        if (data.whitePlayer === data.blackPlayer) {
          console.error("Server sent invalid player assignment:", data);
          setChatMessages((prev) => [
            ...prev,
            "Server error: Invalid game setup",
          ]);
          return;
        }

        if (data.whitePlayer === client.username) {
          setPlayerColor("white");
        } else if (data.blackPlayer === client.username) {
          setPlayerColor("black");
        } else {
          console.error("Player assignment mismatch");
          setChatMessages((prev) => [
            ...prev,
            "Connection error: Wrong player assignment",
          ]);
          return;
        }

        setGameReady(true);
        setWhiteTime(data.timeInSeconds);
        setBlackTime(data.timeInSeconds);
        setActiveTimer("white");

        setPlayerInfo({
          white: {
            username: data.whitePlayer,
            avatar: "/pawns/WhiteKing.svg",
          },
          black: {
            username: data.blackPlayer,
            avatar: "/pawns/BlackKing.svg",
          },
        });
      }
    );

    client.addEventListener("ROOM_FULL", (data: { message: string }) => {
      setChatMessages((prev) => [...prev, data.message]);
      client.sendRequestColor();
    });

    client.addEventListener("SOCKET_READY", () => {
      console.log("Socket is now ready");
      setSocketConnected(true);
    });

    // Update the cleanup effect
    return () => {
      console.log("Cleaning up WebSocket client");
      if (client && roomId) {
        client.leaveRoom();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    };
  }, []);

  // Add cleanup effect
  useEffect(() => {
    const handleUnload = () => {
      if (wsClient && roomId) {
        wsClient.leaveRoom();
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      if (wsClient && roomId) {
        wsClient.leaveRoom();
      }
    };
  }, [wsClient, roomId]);

  useEffect(() => {
    const updateSize = () => {
      if (boardRef.current) {
        const container = boardRef.current.parentElement;
        const containerWidth = container ? container.clientWidth : 0;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const smallerViewportDimension = Math.min(
          viewportWidth,
          viewportHeight
        );

        let idealSize;

        if (viewportWidth < 640) {
          // Mobile
          idealSize = Math.min(
            containerWidth * 0.95,
            smallerViewportDimension * 0.8,
            maxSize
          );
        } else if (viewportWidth < 1024) {
          // Tablet
          idealSize = Math.min(
            containerWidth * 0.85,
            smallerViewportDimension * 0.7,
            maxSize
          );
        } else {
          // Desktop
          idealSize = Math.min(
            containerWidth * 0.75,
            smallerViewportDimension * 0.6,
            maxSize
          );
        }

        const finalSize = Math.max(Math.min(idealSize, maxSize), minSize);

        setBoardSize(finalSize);
      }
    };

    updateSize();

    window.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", updateSize);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateSize);
      if (boardRef.current?.parentElement) {
        observer.observe(boardRef.current.parentElement);
      }

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateSize);
        window.removeEventListener("orientationchange", updateSize);
      };
    }

    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("orientationchange", updateSize);
    };
  }, [minSize, maxSize]);

  // Update the timer effect to ensure both players have the same time
  useEffect(() => {
    if (gameReady && roomId) {
      // Initialize both timers with the selected time
      if (!whiteTime || !blackTime || isNaN(whiteTime) || isNaN(blackTime)) {
        setWhiteTime(selectedTimeOption);
        setBlackTime(selectedTimeOption);
      }

      timerRef.current = setInterval(() => {
        if (activeTimer === "white") {
          setWhiteTime((prev) => {
            if (prev <= 0) {
              if (wsClient) {
                wsClient.sendTimeOut(playerInfo.black.username);
                setTimeOutWinner("black");
              }
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime((prev) => {
            if (prev <= 0) {
              if (wsClient) {
                wsClient.sendTimeOut(playerInfo.white.username);
                setTimeOutWinner("white");
              }
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [activeTimer, gameReady, roomId, selectedTimeOption]);

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const getSquareNotation = (
    rowIndex: number,
    colIndex: number,
    playerColor: "white" | "black" | null
  ): Square => {
    if (playerColor === "black") {
      // For black player, invert the coordinates
      const file = files[7 - colIndex];
      const rank = ranks[7 - rowIndex];
      return `${file}${rank}` as Square;
    } else {
      // For white player, normal coordinates
      const file = files[colIndex];
      const rank = ranks[rowIndex];
      return `${file}${rank}` as Square;
    }
  };

  const handleSquareClick = (square: Square) => {
    // First, check if game is ready and has opponent
    if (!gameReady || !socketConnected) {
      setChatMessages((prev) => [
        ...prev,
        "Please wait for your opponent to join...",
      ]);
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // Check if websocket or player color is missing
    if (!wsClient || !playerColor) {
      console.error("WebSocket or player color not initialized");
      return;
    }

    // Check if game is already over
    if (isCheckmate || timeOutWinner) {
      console.log("Game is already over");
      return;
    }

    // Check if it's player's turn
    const isPlayerTurn =
      (game.turn === "w" && playerColor === "white") ||
      (game.turn === "b" && playerColor === "black");

    if (!isPlayerTurn) {
      setChatMessages((prev) => [...prev, "It's not your turn ⛔"]);
      return;
    }

    if (selectedSquare) {
      // Check if move will capture a piece
      const targetPiece = game.getPiece(square);
      const piece = game.getPiece(selectedSquare);
      if (piece && piece.toLowerCase() === "p") {
        const startCoords = algebraicToCoords(selectedSquare);
        const endCoords = algebraicToCoords(square);

        if (startCoords && endCoords) {
          const isPawn = piece.toLowerCase() === "p";
          const isLastRank =
            (game.turn === "w" && endCoords[0] === 0) ||
            (game.turn === "b" && endCoords[0] === 7);

          const validMoves = game.getPossibleMoves(selectedSquare, true);

          if (isPawn && isLastRank && validMoves.includes(square)) {
            console.log("PROMOTION MOVE DETECTED!");
            setPromotionSquare(square);
            setPromotionFromSquare(selectedSquare);
            setShowPromotion(true);
            return;
          }
        }
      }

      const moveResult = game.makeMove(selectedSquare, square);

      if (moveResult) {
        // Play sound effects
        if (targetPiece && targetPiece !== " ") {
          playSound(null, true); // Play capture sound
        } else {
          playSound(piece); // Play piece movement sound
        }

        // If a piece was captured, add it to the captured pieces
        if (targetPiece && targetPiece !== " ") {
          const isWhitePiece = targetPiece === targetPiece.toUpperCase();
          setCapturedPieces((prev) => ({
            ...prev,
            [isWhitePiece ? "black" : "white"]: [
              ...prev[isWhitePiece ? "black" : "white"],
              targetPiece,
            ],
          }));
          playSound(targetPiece, true); // Play capture sound
        } else {
          playSound(game.getPiece(selectedSquare)); // Play move sound
        }

        setBoardState(JSON.parse(JSON.stringify(game.board)));
        setSelectedSquare(null);
        setPossibleMoves([]);

        setActiveTimer(game.turn === "w" ? "white" : "black");

        if (game.isCheckmate()) {
          setIsCheckmate(true);
          console.log("Checkmate!");
          setChatMessages((prev) => [...prev, "Checkmate!"]);
        }

        if (wsClient && roomId) {
          const notation = `${selectedSquare}${square}`;
          wsClient.sendMove(notation);
          setChatMessages((prev) => [...prev, `You moved: ${notation}`]);
        }
      } else {
        const piece = game.getPiece(square);
        const currentColor = game.turn;
        const isOwnPiece =
          piece !== null &&
          piece !== " " &&
          ((currentColor === "w" && piece === piece.toUpperCase()) ||
            (currentColor === "b" && piece === piece.toLowerCase()));

        if (isOwnPiece) {
          setSelectedSquare(square);
          setPossibleMoves(game.getPossibleMoves(square, true));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      const piece = game.getPiece(square);
      const currentColor = game.turn;
      const isOwnPiece =
        piece !== null &&
        piece !== " " &&
        ((currentColor === "w" && piece === piece.toUpperCase()) ||
          (currentColor === "b" && piece === piece.toLowerCase()));
      if (isOwnPiece) {
        setSelectedSquare(square);
        setPossibleMoves(game.getPossibleMoves(square, true));
      }
    }
  };

  const handlePromotion = (promotionPiece: PieceSymbol) => {
    if (!promotionFromSquare || !promotionSquare) {
      console.error("Missing promotion squares");
      return;
    }

    console.log(
      `Promoting pawn from ${promotionFromSquare} to ${promotionSquare} as ${promotionPiece}`
    );

    const moveResult = game.makeMove(
      promotionFromSquare,
      promotionSquare,
      promotionPiece
    );

    if (moveResult) {
      // Play sound effects
      const targetPiece = game.getPiece(promotionSquare);
      if (targetPiece && targetPiece !== " ") {
        playSound(null, true); // Play capture sound
      } else {
        playSound(promotionPiece); // Play promotion piece sound
      }

      playSound(promotionPiece); // Play promotion sound
      setBoardState(JSON.parse(JSON.stringify(game.board)));
      setSelectedSquare(null);
      setPossibleMoves([]);
      setShowPromotion(false);

      setActiveTimer(game.turn === "w" ? "white" : "black");

      if (game.isCheckmate()) {
        setIsCheckmate(true);
        console.log("Checkmate!");
        setChatMessages((prev) => [...prev, "Checkmate!"]);
      }

      if (wsClient && roomId) {
        const notation = `${promotionFromSquare}${promotionSquare}${promotionPiece}`;
        wsClient.sendMove(notation);
        setChatMessages((prev) => [...prev, `You promoted: ${notation}`]);
      }
    } else {
      console.error("Failed to make promotion move");
    }

    setPromotionSquare(null);
    setPromotionFromSquare(null);
  };

  const isPossibleMove = (square: Square): boolean => {
    return possibleMoves.includes(square);
  };

  // Update createRoom function to set the username
  const createRoom = (time: number, username: string) => {
    if (!wsClient) {
      console.error("WebSocket client not initialized");
      return;
    }

    console.log(`Creating room with ${time} seconds as ${username}`);
    setWhiteTime(time);
    setBlackTime(time);
    setSelectedTimeOption(time);
    wsClient.username = username; // Set the username
    wsClient.createRoom(time, username);
    setShowOverlay(false);
  };

  // Update joinRoom function to set the username
  const joinRoom = (id: string, username: string) => {
    if (id && wsClient) {
      wsClient.username = username; // Set the username
      wsClient.joinRoom(id, username);
      setShowOverlay(false);
    }
  };

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      <PlayerTeamBadge playerColor={playerColor} />
      {!socketConnected && (
        <div className="mt-4 p-2 bg-black-900/50 rounded text-center">
          Connecting to server...
        </div>
      )}

      {showPromotion && (
        <div className="fixed z-[9999] inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-gray-900/90 p-[3vh] rounded-[1vh] shadow-xl border-[0.4vh] border-[#5c085a]/50">
            <h3 className="text-[2.5vh] font-bold text-center mb-[2vh] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Choose Promotion Piece
            </h3>
            <div className="flex justify-center gap-[2vh]">
              {PROMOTION_PIECES.map((piece) => {
                const color = game.turn === "w" ? "White" : "Black";
                let pieceName = "";
                switch (piece) {
                  case "q":
                    pieceName = "Queen";
                    break;
                  case "r":
                    pieceName = "Rook";
                    break;
                  case "b":
                    pieceName = "Bishop";
                    break;
                  case "n":
                    pieceName = "Knight";
                    break;
                }
                return (
                  <div
                    key={piece}
                    className="w-[8vh] h-[8vh] flex items-center justify-center cursor-pointer rounded-[1vh] border-[0.3vh] border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-500/50 transition-all duration-300"
                    onClick={() => handlePromotion(piece)}
                  >
                    <img
                      src={`/pawns/${color}${pieceName}.svg`}
                      alt={pieceName}
                      className="w-[6vh] h-[6vh] transition-transform duration-200 hover:scale-110"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {showOverlay && (
        <CreateJoinOverlay onCreateRoom={createRoom} onJoinRoom={joinRoom} />
      )}
      {showRoomIdPopup && roomId && (
        <RoomIdPopup
          roomId={roomId}
          onClose={() => setShowRoomIdPopup(false)}
        />
      )}
      <div className="flex flex-col lg:flex-row w-full h-full lg:h-[85vh] mb-[5vh] px-4 mt-[3vh] lg:mt-[0vh] justify-center items-start relative z-50 lg:gap-x-[2vh] mx-auto">
        <div className="flex items-center justify-center w-full h-full lg:mt-[2vh]">
          <div className="py-[1vh] flex flex-col justify-center items-center w-full h-full bg-black/20 rounded-[2vh] px-4 shadow-xl border-[0.4vh] border-[#5c085a]/50 backdrop-blur-sm">
            <div
              className="w-full mb-[1vh]"
              style={{ maxWidth: `${boardSize}px` }}
            >
              <PlayerInfoBar
                color={playerColor === "black" ? "white" : "black"}
                username={
                  playerInfo[playerColor === "black" ? "white" : "black"]
                    .username
                }
                avatar={
                  playerInfo[playerColor === "black" ? "white" : "black"].avatar
                }
                timeLeft={playerColor === "black" ? whiteTime : blackTime}
                isActive={
                  activeTimer === (playerColor === "black" ? "white" : "black")
                }
                capturedPieces={
                  capturedPieces[playerColor === "black" ? "white" : "black"]
                }
              />
            </div>
            <div
              ref={boardRef}
              className="relative w-[90%]"
              style={{ maxWidth: `${boardSize}px` }}
            >
              <div className="relative w-full pb-[100%]">
                <div className="absolute top-0 left-0 w-full h-full flex flex-col">
                  <div className="flex flex-1">
                    {/* Left side: ranks */}
                    <div className="flex flex-col justify-around pr-2 text-gray-600 font-medium">
                      {(playerColor === "black"
                        ? [...ranks].reverse()
                        : ranks
                      ).map((rank) => (
                        <div
                          key={rank}
                          className="flex items-center justify-center h-[12.5%] w-5 sm:w-6 md:w-8 text-sm sm:text-base md:text-lg"
                        >
                          {rank}
                        </div>
                      ))}
                    </div>
                    {/* Board Grid */}
                    <div className="flex-1 relative">
                      {(isCheckmate || timeOutWinner) && (
                        <div
                          className="absolute inset-0 bg-red-500/75 rounded-[1vh] flex flex-col items-center justify-center text-white z-[9999] opacity-0 transition-all duration-1000"
                          style={{
                            animation: "fadeIn 1s ease-out forwards",
                          }}
                        >
                          <img
                            src={`/pawns/${
                              timeOutWinner
                                ? timeOutWinner.charAt(0).toUpperCase() +
                                  timeOutWinner.slice(1)
                                : game.turn === "w"
                                ? "Black"
                                : "White"
                            }King.svg`}
                            alt="King"
                            className="w-16 h-16 mb-4 opacity-0"
                            style={{
                              animation: "slideDown 1s ease-out forwards",
                              animationDelay: "0.3s",
                            }}
                          />
                          <div
                            className="text-4xl font-bold opacity-0"
                            style={{
                              animation: "slideDown 1s ease-out forwards",
                              animationDelay: "0.5s",
                            }}
                          >
                            {timeOutWinner ? "TIME'S UP!" : "CHECKMATE!"}
                          </div>
                          <div
                            className="text-2xl mt-2 opacity-0"
                            style={{
                              animation: "slideDown 1s ease-out forwards",
                              animationDelay: "0.8s",
                            }}
                          >
                            {timeOutWinner
                              ? `${playerInfo[timeOutWinner].username} Wins!`
                              : `${
                                  playerInfo[
                                    game.turn === "w" ? "black" : "white"
                                  ].username
                                } Wins!`}
                          </div>
                        </div>
                      )}
                      <div className="w-full h-full shadow-lg rounded-[1vh] overflow-hidden">
                        <div
                          className={`w-full h-full grid grid-cols-8 grid-rows-8`}
                          style={{
                            transform:
                              playerColor === "black"
                                ? "rotate(180deg)"
                                : "none",
                            boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
                            backgroundColor: darkColor,
                          }}
                        >
                          {boardState.map((row, rowIndex) =>
                            row.map((_, colIndex) => {
                              // Calculate correct square for both black and white perspective
                              const effectiveRowIndex =
                                playerColor === "black"
                                  ? 7 - rowIndex
                                  : rowIndex;
                              const effectiveColIndex =
                                playerColor === "black"
                                  ? 7 - colIndex
                                  : colIndex;

                              const square = getSquareNotation(
                                effectiveRowIndex,
                                effectiveColIndex,
                                playerColor
                              );
                              const piece = game.getPiece(square);
                              const pieceImage = getPieceImage(piece);
                              const isSelected = selectedSquare === square;
                              const isMoveableTo = isPossibleMove(square);
                              const isLightSquare =
                                (rowIndex + colIndex) % 2 === 0;

                              return (
                                <div
                                  key={square}
                                  id={square}
                                  className={`w-full h-full flex items-center justify-center ${
                                    gameReady
                                      ? "cursor-pointer"
                                      : "cursor-not-allowed"
                                  } transition-all duration-300 ease-out`}
                                  style={{
                                    backgroundColor: isLightSquare
                                      ? lightColor
                                      : darkColor,
                                    transform:
                                      playerColor === "black"
                                        ? "rotate(180deg)"
                                        : "none",
                                    ...(isSelected && {
                                      outline: `2px solid ${highlightColor}`,
                                      outlineOffset: "-2px",
                                      zIndex: 2,
                                    }),
                                    opacity: gameReady ? 1 : 0.7,
                                    position: "relative", // Add this to properly position the move indicator
                                  }}
                                  data-square={square}
                                  onClick={() => handleSquareClick(square)}
                                >
                                  {pieceImage && (
                                    <img
                                      src={pieceImage}
                                      alt={piece}
                                      className="w-3/4 h-3/4"
                                      style={{
                                        filter:
                                          "drop-shadow(0 0 1px rgba(0,0,0,0.3))",
                                      }}
                                    />
                                  )}
                                  {isMoveableTo && (
                                    <div
                                      className="absolute rounded-full"
                                      style={{
                                        width: "33%",
                                        height: "33%",
                                        backgroundColor: PossibleMoveColor,
                                        opacity: 0.6,
                                        pointerEvents: "none",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                      }}
                                    />
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Bottom labels (files) */}
                  <div className="flex pl-7 mt-1">
                    <div className="flex-1 grid grid-cols-8 text-gray-600 font-medium">
                      {(playerColor === "black"
                        ? [...files].reverse()
                        : files
                      ).map((file) => (
                        <div
                          key={file}
                          className="flex items-center justify-center text-sm sm:text-base md:text-lg"
                        >
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="w-full mt-[1vh] "
              style={{ maxWidth: `${boardSize}px` }}
            >
              <PlayerInfoBar
                color={playerColor === "black" ? "black" : "white"}
                username={
                  playerInfo[playerColor === "black" ? "black" : "white"]
                    .username
                }
                avatar={
                  playerInfo[playerColor === "black" ? "black" : "white"].avatar
                }
                timeLeft={playerColor === "black" ? blackTime : whiteTime}
                isActive={
                  activeTimer === (playerColor === "black" ? "black" : "white")
                }
                capturedPieces={
                  capturedPieces[playerColor === "black" ? "black" : "white"]
                }
              />
            </div>
          </div>{" "}
        </div>
        <div className="w-full lg:w-[40vw] h-full mt-[2vh] flex justify-center items-start">
          <div className="py-[2vh] flex flex-col justify-center items-center w-full h-full bg-black/20 rounded-xl px-4 shadow-xl border-[0.4vh] border-[#5c085a]/50 backdrop-blur-sm">
            <div className="w-full flex flex-row mx-[4vw]">
              <ThemeSettings />
            </div>
            {roomId && playerColor && (
              <div className="mt-4 w-full max-w-md">
                <div
                  className={`p-4 rounded-lg shadow-md text-center font-bold ${
                    playerColor === "white"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-gray-800 text-white"
                  }`}
                >
                  You are playing as{" "}
                  {playerColor === "white" ? "☀️ White" : "🌙 Black"}
                  {gameReady && (
                    <div className="mt-2 text-sm font-normal">
                      {activeTimer === playerColor
                        ? "It's your turn to move"
                        : "Waiting for opponent's move"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {roomId && (
              <div className="mt-4 w-full max-w-md">
                <div className="bg-gray-900/80 p-4 rounded-lg shadow-md flex items-center justify-between border border-purple-500/40">
                  <div>
                    <span className="font-bold text-purple-300">Room ID: </span>
                    <span className="font-mono text-purple-200">{roomId}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(roomId);
                      setChatMessages((prev) => [
                        ...prev,
                        "Room ID copied to clipboard!",
                      ]);
                    }}
                    className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-sm transition-all duration-300"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
            {roomId && !gameReady && (
              <div className="mt-4 w-full max-w-md">
                <div className="px-3 py-[1.5vh] bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-[2vh] transition-all duration-300">
                  <p className="text-center">Waiting for opponent to join...</p>
                </div>
              </div>
            )}
            <div className="mt-4 w-full max-w-md flex flex-col flex-grow">
              <div className="bg-gray-900/80 p-4 rounded-lg shadow-md border border-purple-500/40 flex flex-col h-[40vh]">
                <h3 className="text-lg font-bold mb-2 text-purple-300">Chat</h3>
                <div
                  ref={chatContainerRef}
                  className="flex-grow overflow-y-auto mb-4 custom-scrollbar"
                >
                  <div className="space-y-2">
                    {chatMessages.map((message, index) => {
                      // Handle move messages
                      if (message.includes("moved:")) {
                        const [username, moveInfo] = message.split(" moved: ");
                        // Set color based on the username of who made the move
                        const isWhiteMove =
                          username === playerInfo.white.username;

                        return (
                          <div key={index} className="text-sm break-words">
                            <span className="font-bold">{username}</span> moved:
                            <span
                              className={`ml-1 px-1.5 py-0.5 rounded ${
                                isWhiteMove
                                  ? "bg-gray-100 text-gray-900" // White background for white's moves
                                  : "bg-gray-800 text-white" // Black background for black's moves
                              }`}
                            >
                              {moveInfo}
                            </span>
                          </div>
                        );
                      }

                      // Handle regular chat messages
                      if (message.includes(":")) {
                        const [username, text] = message.split(":");
                        return (
                          <div
                            key={index}
                            className="text-sm text-gray-200 break-words"
                          >
                            <span className="font-bold">{username}</span>:{text}
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
                <div className="flex gap-2 mt-auto">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-800/50 rounded-lg border border-purple-500/40 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && wsClient && roomId) {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          wsClient.sendMessage(input.value);
                          input.value = "";
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector(
                        'input[type="text"]'
                      ) as HTMLInputElement;
                      if (input.value.trim() && wsClient && roomId) {
                        wsClient.sendMessage(input.value);
                        input.value = "";
                      }
                    }}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 transition-all duration-300"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-4 w-full">
              {(isCheckmate || timeOutWinner) && (
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border-[0.3vh] border-green-500/50 rounded-lg text-green-300 font-medium text-lg transition-all duration-300"
                >
                  Play Again
                </button>
              )}
              <Link
                href="/play"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border-[0.3vh] border-red-500/50 rounded-lg text-red-300 font-medium text-lg transition-all duration-300 text-center"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/play";
                }}
              >
                Go Back
              </Link>
            </div>

            <style jsx>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
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
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerTeamBadge = ({
  playerColor,
}: {
  playerColor: "white" | "black" | null;
}) => {
  if (!playerColor) return null;
};

export default Chessboard;
