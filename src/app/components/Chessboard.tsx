"use client";
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ChessGame, PieceSymbol, Square } from "@/app/utils/chess";
import WebSocketClient from "@/app/lib/websocket";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

export interface ChessboardProps {
  maxSize?: number;
  minSize?: number;
  className?: string;
  fen: string;
  lightColor: string;
  darkColor: string;
  highlightColor: string;
  possibleMoveColor: string;
  setLastMove: (move: string) => void;
  gameMode: "ai" | "multiplayer";
}

const getPieceImage = (piece: PieceSymbol | " "): string | null => {
  if (piece === " ") return null;
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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

interface PlayerInfoBarProps {
  color: "white" | "black";
  username: string;
  avatar: string;
  timeLeft: number;
  isActive: boolean;
  capturedPieces: string[];
}

const PlayerInfoBar: React.FC<PlayerInfoBarProps> = ({
  color,
  username,
  avatar,
  timeLeft,
  isActive,
  capturedPieces,
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
      <div className="flex gap-[0.5vh] items-center ml-[2vh]">
        {capturedPieces.map((piece, index) => {
          const pieceImage = getPieceImage(piece as PieceSymbol);
          return pieceImage ? (
            <Image
              key={index}
              src={pieceImage}
              alt={piece}
              width={28}
              height={28}
              className="opacity-75"
            />
          ) : null;
        })}
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

const TimerSelectionOverlay: React.FC<{
  onSelect: (time: number) => void;
}> = ({ onSelect }) => {
  const [customMinutes, setCustomMinutes] = useState<string>("");
  const options: { label: string; seconds: number }[] = [
    { label: "1 Min", seconds: 60 },
    { label: "3 Min", seconds: 180 },
    { label: "10 Min", seconds: 600 },
    { label: "1 Hour", seconds: 3600 },
  ];

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseInt(customMinutes);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 180) {
      onSelect(minutes * 60);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
      <div className="bg-black/80 rounded-lg p-6 shadow-lg w-80 border-pink-500/50 border-[0.4vh]">
        <h2 className="text-xl font-bold mb-4 text-center text-pink-300">
          Select Game Timer
        </h2>
        <div className="flex flex-col space-y-3">
          {options.map((opt) => (
            <button
              key={opt.seconds}
              onClick={() => onSelect(opt.seconds)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-900 transition-colors"
            >
              {opt.label}
            </button>
          ))}
          <div className="relative mt-4 pt-4 border-t border-gray-600">
            <form onSubmit={handleCustomTimeSubmit} className="flex gap-2">
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="Custom minutes"
                min="1"
                max="180"
                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                Set
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-1">Enter minutes (1-180)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Chessboard = forwardRef<{ resetGame: () => void }, ChessboardProps>(
  ({ maxSize = 800, minSize = 280, className = "" }, ref) => {
    const [boardSize, setBoardSize] = useState<number>(0);
    const boardRef = useRef<HTMLDivElement>(null);
    const game = useRef(new ChessGame());
    const [boardState, setBoardState] = useState(game.current.board);
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
    const [isCheckmate, setIsCheckmate] = useState<boolean>(false);
    const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const { lightColor, darkColor, highlightColor, PossibleMoveColor } =
      useTheme();

    // Timer states
    const [whiteTime, setWhiteTime] = useState<number>(0);
    const [blackTime, setBlackTime] = useState<number>(0);
    const [activeTimer, setActiveTimer] = useState<"white" | "black" | null>(
      null
    );
    const [selectedTimeOption, setSelectedTimeOption] = useState<number | null>(
      null
    );
    const [timeOutWinner, setTimeOutWinner] = useState<
      "white" | "black" | null
    >(null);

    // Captured pieces state
    const [capturedPieces, setCapturedPieces] = useState<{
      white: string[];
      black: string[];
    }>({
      white: [],
      black: [],
    });

    useEffect(() => {
      if (selectedTimeOption !== null) {
        setWhiteTime(selectedTimeOption);
        setBlackTime(selectedTimeOption);
      }
    }, [selectedTimeOption]);

    // Player info (could be updated via context or props)
    const [playerInfo] = useState({
      white: { username: "White", avatar: "/pawns/WhiteKing.svg" },
      black: { username: "Black", avatar: "/pawns/BlackKing.svg" },
    });

    // Files and ranks for board coordinates
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

    // Setup websocket and event listeners
    useEffect(() => {
      const client = new WebSocketClient("Player1");
      setWsClient(client);

      client.addEventListener("ROOM_CREATED", (data: { roomId: string }) => {
        setRoomId(data.roomId);
        console.log(`Room created: ${data.roomId}`);
      });

      client.addEventListener("JOINED_ROOM", (data: { roomId: string }) => {
        setRoomId(data.roomId);
        console.log(`Joined room: ${data.roomId}`);
      });

      client.addEventListener("OPPONENT_MOVE", (data: { notation: string }) => {
        const [from, to] = data.notation.split(" ");
        const moveResult = game.current.makeMove(from, to);
        if (moveResult) {
          setBoardState(game.current.board);
          if (game.current.isCheckmate()) {
            setIsCheckmate(true);
            console.log("Checkmate!");
          }
          // Toggle timer after opponent's move:
          setActiveTimer(game.current.turn === "w" ? "white" : "black");
        } else {
          console.error(`Failed to apply opponent's move: ${data.notation}`);
        }
      });

      return () => {
        client.leaveRoom();
      };
    }, []);

    // Board resizing logic
    useEffect(() => {
      const updateSize = () => {
        if (boardRef.current) {
          const container = boardRef.current.parentElement;
          const containerWidth = container ? container.clientWidth : 0;
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const smallerViewport = Math.min(viewportWidth, viewportHeight);
          let idealSize: number;

          if (viewportWidth < 640) {
            idealSize = Math.min(
              containerWidth * 0.98,
              smallerViewport * 0.85,
              maxSize
            );
          } else if (viewportWidth < 1024) {
            idealSize = Math.min(
              containerWidth * 0.9,
              smallerViewport * 0.75,
              maxSize
            );
          } else {
            idealSize = Math.min(
              containerWidth * 0.9,
              smallerViewport * 0.8,
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
      if (
        typeof ResizeObserver !== "undefined" &&
        boardRef.current?.parentElement
      ) {
        const observer = new ResizeObserver(updateSize);
        observer.observe(boardRef.current.parentElement);
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

    // Timer update effect (runs only if game is ready and timer has been selected)
    useEffect(() => {
      if (selectedTimeOption !== null && activeTimer && !isCheckmate) {
        const timer = setInterval(() => {
          if (activeTimer === "white") {
            setWhiteTime((prev) => {
              if (prev <= 1) {
                setTimeOutWinner("black");
                setIsCheckmate(true);
                return 0;
              }
              return prev - 1;
            });
          } else {
            setBlackTime((prev) => {
              if (prev <= 1) {
                setTimeOutWinner("white");
                setIsCheckmate(true);
                return 0;
              }
              return prev - 1;
            });
          }
        }, 1000);
        return () => clearInterval(timer);
      }
    }, [activeTimer, selectedTimeOption, isCheckmate]);

    // Square click handler
    const handleSquareClick = (square: Square) => {
      if (isCheckmate || !wsClient) return;

      if (selectedSquare) {
        const targetPiece = game.current.getPiece(square);
        const moveResult = game.current.makeMove(selectedSquare, square);

        if (moveResult) {
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

          setBoardState(game.current.board);
          setSelectedSquare(null);
          setPossibleMoves([]);

          // Start timer on White's first move
          if (activeTimer === null && game.current.turn === "b") {
            setActiveTimer("black");
          } else {
            setActiveTimer(game.current.turn === "w" ? "white" : "black");
          }

          if (game.current.isCheckmate()) {
            setIsCheckmate(true);
            console.log("Checkmate!");
          }

          if (wsClient && roomId) {
            wsClient.sendMove(`${selectedSquare} ${square}`);
          }
        } else {
          const piece = game.current.getPiece(square);
          const currentColor = game.current.turn;
          const isOwnPiece =
            piece !== null &&
            piece !== " " &&
            ((currentColor === "w" && piece === piece.toUpperCase()) ||
              (currentColor === "b" && piece === piece.toLowerCase()));
          if (isOwnPiece) {
            setSelectedSquare(square);
            setPossibleMoves(game.current.getPossibleMoves(square, true));
          } else {
            setSelectedSquare(null);
            setPossibleMoves([]);
          }
        }
      } else {
        const piece = game.current.getPiece(square);
        const currentColor = game.current.turn;
        const isOwnPiece =
          piece !== null &&
          piece !== " " &&
          ((currentColor === "w" && piece === piece.toUpperCase()) ||
            (currentColor === "b" && piece === piece.toLowerCase()));
        if (isOwnPiece) {
          setSelectedSquare(square);
          setPossibleMoves(game.current.getPossibleMoves(square, true));
        }
      }
    };

    const isPossibleMove = (square: Square): boolean => {
      return possibleMoves.includes(square);
    };

    const resetGame = () => {
      const newGame = new ChessGame();
      setBoardState(newGame.board);
      setSelectedSquare(null);
      setPossibleMoves([]);
      setIsCheckmate(false);
      setTimeOutWinner(null);
      setActiveTimer(null);
      setSelectedTimeOption(null); // Reset timer selection
      setWhiteTime(0);
      setBlackTime(0);
      setCapturedPieces({ white: [], black: [] }); // Reset captured pieces
      game.current = newGame;
    };

    useImperativeHandle(ref, () => ({
      resetGame,
    }));

    // Render entire component
    return (
      <>
        {/* Timer Selection Overlay (only if timer not selected yet) */}
        {selectedTimeOption === null && (
          <TimerSelectionOverlay
            onSelect={(time) => setSelectedTimeOption(time)}
          />
        )}

        <div
          className={`flex flex-col items-center p-4 w-full mx-auto ${className}`}
        >
          {/* Top panel for Black */}
          <div
            className="w-full mb-[1vh]"
            style={{ maxWidth: `${boardSize}px` }}
          >
            <PlayerInfoBar
              color="black"
              username={playerInfo.black.username}
              avatar={playerInfo.black.avatar}
              timeLeft={blackTime}
              isActive={activeTimer === "black"}
              capturedPieces={capturedPieces.black}
            />
          </div>

          {/* Chessboard Container */}
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
                    {ranks.map((rank) => (
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
                    {isCheckmate && (
                      <div
                        className="absolute inset-0 bg-red-500/75 rounded-[1vh] flex flex-col items-center justify-center text-white z-50 opacity-0 transition-all duration-1000"
                        style={{
                          animation: "fadeIn 1s ease-out forwards",
                        }}
                      >
                        <img
                          src={`/pawns/${
                            timeOutWinner
                              ? timeOutWinner.charAt(0).toUpperCase() +
                                timeOutWinner.slice(1)
                              : game.current.turn === "w"
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
                            ? `${
                                timeOutWinner.charAt(0).toUpperCase() +
                                timeOutWinner.slice(1)
                              } Wins!`
                            : `${
                                game.current.turn === "w" ? "Black" : "White"
                              } Wins!`}
                        </div>
                      </div>
                    )}
                    <div className="w-full h-full shadow-lg rounded-sm overflow-hidden">
                      <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                        {boardState.map((row, rowIndex) =>
                          row.map((piece, colIndex) => {
                            const rank = ranks[rowIndex];
                            const file = files[colIndex];
                            const square = `${file}${rank}`;
                            const pieceImage = getPieceImage(piece);
                            const isSelected = selectedSquare === square;
                            const isMoveableTo = isPossibleMove(square);

                            return (
                              <div
                                key={square}
                                id={square}
                                className={`w-full h-full flex items-center justify-center cursor-pointer transition-all duration-300 ease-out ${
                                  isSelected ? "shadow-glow" : ""
                                }`}
                                style={{
                                  backgroundColor:
                                    (rowIndex + colIndex) % 2 === 0
                                      ? lightColor
                                      : darkColor,
                                  ...(isSelected && {
                                    boxShadow: `0 0 15px 2px ${highlightColor}`,
                                    border: `2px solid ${highlightColor}`,
                                    transform: "scale(1.02)",
                                  }),
                                  ...(isMoveableTo && {
                                    backgroundColor: PossibleMoveColor,
                                  }),
                                }}
                                data-square={square}
                                onClick={() => handleSquareClick(square)}
                              >
                                <div
                                  className={`w-full h-full flex items-center justify-center transition-transform duration-200 ease-out ${
                                    isSelected ? "scale-102" : ""
                                  }`}
                                >
                                  {pieceImage && (
                                    <img
                                      src={pieceImage}
                                      alt={piece}
                                      className="w-3/4 h-3/4"
                                    />
                                  )}
                                </div>
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
                    {files.map((file) => (
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

          {/* Bottom panel for White */}
          <div
            className="w-full mt-[1vh]"
            style={{ maxWidth: `${boardSize}px` }}
          >
            <PlayerInfoBar
              color="white"
              username={playerInfo.white.username}
              avatar={playerInfo.white.avatar}
              timeLeft={whiteTime}
              isActive={activeTimer === "white"}
              capturedPieces={capturedPieces.white}
            />
          </div>
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
        `}</style>
      </>
    );
  }
);

export default Chessboard;
