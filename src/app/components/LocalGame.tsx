"use client";
import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import ThemeSettings from "./ThemeSettings";
import Link from "next/link";
import { ChessGame, PieceSymbol, Square, validateFen } from "@/app/utils/chess";
import WebSocketClient from "@/app/lib/websocket";
import { useTheme } from "@/context/ThemeContext";

/* ------------------ Chessboard ------------------ */
interface ChessboardProps {
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
      <div className="flex items-center">
        <div className="flex -space-x-3">
          {capturedPieces.map((piece, index) => (
            <div key={index} className="relative hover:z-20">
              <img
                src={getPieceImage(piece as PieceSymbol)}
                alt={piece}
                className="w-[3vh] h-[3vh] opacity-75 hover:opacity-100 transition-all duration-200"
                style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="text-[2.5vh] font-mono font-bold text-gray-400">
      {formatTime(timeLeft)}
    </div>
  </div>
);

const TimeSelectionOverlay: React.FC<{ onStart: (time: number) => void }> = ({
  onStart,
}) => {
  const timeOptions = [
    { label: "1 Min", seconds: 60 },
    { label: "3 Min", seconds: 180 },
    { label: "10 Min", seconds: 600 },
    { label: "60 Min", seconds: 3600 },
  ];
  const [customTime, setCustomTime] = useState<string>("");

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl p-8">
        <div className="flex flex-col gap-6">
          <h3 className="text-[2.5vh] font-bold text-center mb-[2vh] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Select Game Time
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {timeOptions.map((option) => (
              <button
                key={option.seconds}
                onClick={() => onStart(option.seconds)}
                className="p-[2vh] rounded-[1vh] transition-all duration-300 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-[0.3vh] border-purple-500/30 hover:border-purple-500/50 text-purple-300 font-medium text-[2vh]"
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-purple-300 text-[1.8vh]">
              Custom Time (1-180 minutes):
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                value={customTime}
                onChange={(e) => {
                  const value = Math.min(
                    Math.max(parseInt(e.target.value) || 0, 1),
                    180
                  );
                  setCustomTime(value.toString());
                }}
                placeholder="Enter minutes"
                className="w-full px-[2vh] py-[2vh] bg-gray-900/80 rounded-[1vh] border-[0.3vh] border-purple-500/40 text-white placeholder-gray-400 text-[2.5vh]"
                min="1"
                max="180"
              />
              <button
                onClick={() => customTime && onStart(parseInt(customTime) * 60)}
                disabled={!customTime}
                className="px-[2vh] py-[1.5vh] bg-purple-500/20 hover:bg-purple-500/30 border-[0.3vh] border-purple-500/50 rounded-[1vh] text-purple-300 text-[2vh] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PromotionOverlay = ({
  onPromote,
  currentTurn,
}: {
  onPromote: (piece: PieceSymbol) => void;
  currentTurn: "w" | "b";
}) => {
  const PROMOTION_PIECES: PieceSymbol[] = ["q", "r", "b", "n"];
  return (
    <div className="fixed z-[9999] inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-gray-900/90 p-[3vh] rounded-[1vh] shadow-xl border-[0.4vh] border-[#5c085a]/50">
        <h3 className="text-[2.5vh] font-bold text-center mb-[2vh] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Choose Promotion Piece
        </h3>
        <div className="flex justify-center gap-[2vh]">
          {PROMOTION_PIECES.map((piece) => {
            const color = currentTurn === "w" ? "White" : "Black";
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
                onClick={() => onPromote(piece)}
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
  );
};

const Chessboard = forwardRef<
  { resetGame: () => void; loadFEN: (fen: string) => void },
  Omit<ChessboardProps, "fen" | "setLastMove" | "gameMode">
>(({ maxSize = 1000, minSize = 400, className = "" }, ref) => {
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

  const [showPromotion, setShowPromotion] = useState<boolean>(false);
  const [promotionSquare, setPromotionSquare] = useState<Square | null>(null);
  const [promotionFromSquare, setPromotionFromSquare] = useState<Square | null>(
    null
  );

  // Timer states
  const [whiteTime, setWhiteTime] = useState<number>(0);
  const [blackTime, setBlackTime] = useState<number>(0);
  const [activeTimer, setActiveTimer] = useState<"white" | "black" | null>(
    null
  );
  const [selectedTimeOption, setSelectedTimeOption] = useState<number | null>(
    null
  );
  const [timeOutWinner, setTimeOutWinner] = useState<"white" | "black" | null>(
    null
  );

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

  const [playerInfo] = useState({
    white: { username: "White", avatar: "/pawns/WhiteKing.svg" },
    black: { username: "Black", avatar: "/pawns/BlackKing.svg" },
  });

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

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
        setActiveTimer(game.current.turn === "w" ? "white" : "black");
      } else {
        console.error(`Failed to apply opponent's move: ${data.notation}`);
      }
    });

    return () => {
      client.leaveRoom();
    };
  }, []);

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
          // Mobile
          idealSize = Math.min(
            containerWidth * 0.95,
            smallerViewport * 0.8,
            maxSize
          );
        } else if (viewportWidth < 1024) {
          // Tablet
          idealSize = Math.min(
            containerWidth * 0.85,
            smallerViewport * 0.7,
            maxSize
          );
        } else {
          // Desktop
          idealSize = Math.min(
            containerWidth * 0.75,
            smallerViewport * 0.6,
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

  // Add event listener for FEN updates
  useEffect(() => {
    const handleFenApplied = (e: Event) => {
      const fenEvent = e as CustomEvent;
      if (fenEvent.detail) {
        game.current.loadFEN(fenEvent.detail);
        setBoardState(game.current.board);
        setSelectedSquare(null);
        setPossibleMoves([]);
        setIsCheckmate(false);
        setTimeOutWinner(null);
        setCapturedPieces({ white: [], black: [] });
        setActiveTimer(game.current.turn === "w" ? "white" : "black");
      }
    };
    
    document.addEventListener('fen-applied', handleFenApplied);
    return () => {
      document.removeEventListener('fen-applied', handleFenApplied);
    };
  }, []);

  const playSound = (
    piece: PieceSymbol | " " | null,
    isCapture: boolean = false
  ) => {
    if (isCapture) {
      // Random capture sound (zbicie1/2/3)
      const captureNum = Math.floor(Math.random() * 3) + 1;
      const audio = new Audio(`/sounds/zbicie${captureNum}.mp3`);
      audio.play();
      return;
    }

    if (!piece || piece === " ") return;

    let soundFile = "";
    switch (piece.toLowerCase()) {
      case "p":
        soundFile = "pawn.mp3";
        break;
      case "n":
        soundFile = "knight.mp3";
        break;
      case "b":
        soundFile = "bishop.mp3";
        break;
      case "r":
        soundFile = "rook.mp3";
        break;
      case "q":
        soundFile = "queen.mp3";
        break;
      case "k":
        soundFile = "king.mp3";
        break;
    }

    if (soundFile) {
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.play();
    }
  };

  const handlePromotion = (promotionPiece: PieceSymbol) => {
    if (!promotionFromSquare || !promotionSquare) return;

    const targetPiece = game.current.getPiece(promotionSquare);
    const moveResult = game.current.makeMove(
      promotionFromSquare,
      promotionSquare,
      promotionPiece
    );

    if (moveResult) {
      // Play capture sound if there's a piece being captured during promotion
      if (targetPiece && targetPiece !== " ") {
        playSound(null, true);
        const isWhitePiece = targetPiece === targetPiece.toUpperCase();
        setCapturedPieces((prev) => ({
          ...prev,
          [isWhitePiece ? "black" : "white"]: [
            ...prev[isWhitePiece ? "black" : "white"],
            targetPiece,
          ],
        }));
      } else {
        // Play the sound of the promoted piece
        playSound(promotionPiece);
      }

      setBoardState(game.current.board);
      setSelectedSquare(null);
      setPossibleMoves([]);
      setShowPromotion(false);
      setActiveTimer(game.current.turn === "w" ? "white" : "black");

      if (game.current.isCheckmate()) {
        setIsCheckmate(true);
      }
    }

    setPromotionSquare(null);
    setPromotionFromSquare(null);
  };

  const handleSquareClick = (square: Square) => {
    if (isCheckmate) return;

    if (selectedSquare) {
      const piece = game.current.getPiece(selectedSquare);
      if (piece && piece.toLowerCase() === "p") {
        const isLastRank =
          (game.current.turn === "w" && square[1] === "8") ||
          (game.current.turn === "b" && square[1] === "1");

        if (
          isLastRank &&
          game.current.getPossibleMoves(selectedSquare).includes(square)
        ) {
          setPromotionSquare(square);
          setPromotionFromSquare(selectedSquare);
          setShowPromotion(true);
          return;
        }
      }

      const targetPiece = game.current.getPiece(square);
      const moveResult = game.current.makeMove(selectedSquare, square);
      if (moveResult) {
        // Play capture sound if there's a piece being captured
        if (targetPiece && targetPiece !== " ") {
          playSound(null, true); // Play capture sound
          const isWhitePiece = targetPiece === targetPiece.toUpperCase();
          setCapturedPieces((prev) => ({
            ...prev,
            [isWhitePiece ? "black" : "white"]: [
              ...prev[isWhitePiece ? "black" : "white"],
              targetPiece,
            ],
          }));
        } else {
          // Play normal piece movement sound
          playSound(piece);
        }
        setBoardState(game.current.board);
        setSelectedSquare(null);
        setPossibleMoves([]);
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
    setSelectedTimeOption(null);
    setWhiteTime(0);
    setBlackTime(0);
    setCapturedPieces({ white: [], black: [] });
    game.current = newGame;
  };

  const loadFEN = (fen: string) => {
    game.current.loadFEN(fen);
    setBoardState(game.current.board);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setIsCheckmate(false);
    setTimeOutWinner(null);
    setCapturedPieces({ white: [], black: [] });
    setActiveTimer(game.current.turn === "w" ? "white" : "black");
  };

  // Update useImperativeHandle to expose loadFEN
  useImperativeHandle(ref, () => ({
    resetGame,
    loadFEN,
  }));

  return (
    <>
      {showPromotion && (
        <PromotionOverlay
          onPromote={handlePromotion}
          currentTurn={game.current.turn}
        />
      )}
      {selectedTimeOption === null && (
        <TimeSelectionOverlay onStart={(time) => setSelectedTimeOption(time)} />
      )}
      <div
        className={`flex flex-col items-center p-4 w-full mx-auto ${className}`}
      >
        {/* Top panel for Black */}
        <div className="w-full mb-[1vh]" style={{ maxWidth: `${boardSize}px` }}>
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
                <div className="flex-1 relative">
                  {isCheckmate && (
                    <div
                      className="absolute inset-0 bg-red-500/75 rounded-[1vh] flex flex-col items-center justify-center text-white z-50 opacity-0 transition-all duration-1000"
                      style={{ animation: "fadeIn 1s ease-out forwards" }}
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
                  <div className="w-full h-full shadow-lg rounded-[1vh] overflow-hidden">
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
                              className={`w-full h-full flex items-center justify-center ${
                                !isCheckmate
                                  ? "cursor-pointer"
                                  : "cursor-not-allowed"
                              } transition-all duration-300 ease-out`}
                              style={{
                                backgroundColor:
                                  (rowIndex + colIndex) % 2 === 0
                                    ? lightColor
                                    : darkColor,
                                position: "relative",
                                ...(isSelected && {
                                  outline: `2px solid ${highlightColor}`,
                                  outlineOffset: "-2px",
                                  zIndex: 2,
                                }),
                              }}
                              onClick={() =>
                                !isCheckmate && handleSquareClick(square)
                              }
                            >
                              <div className="w-full h-full flex items-center justify-center">
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
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
        <div className="w-full mt-[1vh]" style={{ maxWidth: `${boardSize}px` }}>
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
});

/* ------------------ LocalGame Component ------------------ */
const LocalGame = () => {
  const chessboardRef = useRef<{ resetGame: () => void }>(null);
  const gameRef = useRef(new ChessGame()); // Add game reference
  const [fenInput, setFenInput] = useState<string>("");
  const [fenError, setFenError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Common chess positions as FEN strings
  const fenPresets = [
    { name: "Initial Position", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" },
    { name: "Sicilian Defense", fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2" },
    { name: "Queen's Gambit", fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq d3 0 2" },
    { name: "Ruy Lopez", fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3" },
    { name: "Scholar's Mate", fen: "rnbqkbnr/ppp2ppp/3p4/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 1 3" },
  ];

  const applyFen = () => {
    try {
      // Validate FEN format
      const validation = validateFen(fenInput);
      if (!validation.ok) {
        setFenError(validation.error || "Invalid FEN format");
        return;
      }
      
      // Reset the game state
      if (chessboardRef.current) {
        chessboardRef.current.resetGame();
      }
      
      // Load the new FEN
      gameRef.current.loadFEN(fenInput);
      
      // Update board state
      if (chessboardRef.current) {
        // Force a refresh of the board
        const event = new CustomEvent('fen-applied', { detail: fenInput });
        document.dispatchEvent(event);
      }
      
      setFenError(null);
    } catch (error) {
      setFenError("Error applying FEN: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const copyCurrentFen = () => {
    const currentFen = gameRef.current.toFEN();
    navigator.clipboard.writeText(currentFen)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => {
        setFenError("Failed to copy FEN to clipboard");
      });
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full lg:h-[85vh] mb-[5vh] px-4 mt-[3vh] lg:mt-[0vh] justify-center items-start relative z-50 lg:gap-x-[2vh] mx-auto">
      {/* Left Section - Chessboard Container - Increased width */}
      <div className="flex items-center justify-center w-full lg:w-[65%] h-full lg:mt-[2vh]">
        <div className="py-[1vh] flex flex-col justify-center items-center w-full h-full bg-black/20 rounded-[2vh] px-4 shadow-xl border-[0.4vh] border-[#5c085a]/50 backdrop-blur-sm">
          <Chessboard
            ref={chessboardRef}
            maxSize={1200}
            minSize={400}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Right Section - Controls - Matching height */}
      <div className="w-full lg:w-[35%] h-full mt-[2vh] flex justify-center items-start">
        <div className="py-[2vh] flex flex-col justify-between w-full h-full bg-black/20 rounded-[2vh] px-4 shadow-xl border-[0.4vh] border-[#5c085a]/50 backdrop-blur-sm">
          <div className="mb-[2vh]">
            <div className="w-full justify-center items-center flex flex-row">
              <ThemeSettings />
            </div>
            
            {/* FEN Input Section */}
            <div className="w-full mt-6">
              <h3 className="text-[2vh] font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                FEN Position
              </h3>
              
              {/* FEN Input Field */}
              <div className="flex flex-col gap-2 mb-4">
                <input
                  type="text"
                  value={fenInput}
                  onChange={(e) => {
                    setFenInput(e.target.value);
                    setFenError(null);
                  }}
                  placeholder="Enter FEN string"
                  className="w-full px-3 py-2 bg-gray-900/80 rounded-lg border-[0.2vh] border-purple-500/40 text-white placeholder-gray-400 text-sm"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={applyFen}
                    className="flex-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border-[0.2vh] border-purple-500/50 rounded-lg text-purple-300 text-sm transition-all duration-300"
                  >
                    Apply FEN
                  </button>
                  <button
                    onClick={copyCurrentFen}
                    className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border-[0.2vh] border-blue-500/50 rounded-lg text-blue-300 text-sm transition-all duration-300"
                  >
                    {copySuccess ? "Copied!" : "Copy Current FEN"}
                  </button>
                </div>
                
                {fenError && (
                  <div className="text-red-400 text-sm mt-1 px-2 py-1 bg-red-500/10 rounded border border-red-500/30">
                    {fenError}
                  </div>
                )}
              </div>
              
              {/* FEN Presets */}
              <div className="mb-4">
                <h4 className="text-[1.8vh] font-medium text-purple-300 mb-2">Common Positions</h4>
                <div className="grid grid-cols-1 gap-2 max-h-[20vh] overflow-y-auto pr-2 custom-scrollbar">
                  {fenPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setFenInput(preset.fen);
                        setFenError(null);
                      }}
                      className="w-full text-left px-3 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-[0.2vh] border-purple-500/30 hover:border-purple-500/50 rounded-lg text-purple-300 text-sm transition-all duration-300"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="mt-auto flex flex-col gap-4 w-full">
            <button
              onClick={() => chessboardRef.current?.resetGame()}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-[0.3vh] border-purple-500/50 rounded-lg text-purple-300 font-medium text-lg transition-all duration-300"
            >
              Reset Game
            </button>
            <Link
              href="/play"
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border-[0.3vh] border-red-500/50 rounded-lg text-red-300 font-medium text-lg transition-all duration-300 text-center"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/play";
              }}
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
      
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 0, 130, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
};

export default LocalGame;
