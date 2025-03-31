"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChessGame, PieceSymbol, Square } from "@/app/utils/chess";
import { useTheme } from "@/context/ThemeContext";

interface ServerChessboardProps {
  maxSize?: number;
  minSize?: number;
  className?: string;
  game: ChessGame;
  onPlayerMove: (from: Square, to: Square) => void;
  isThinking: boolean;
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

interface PlayerInfoBarProps {
  color: "white" | "black";
  username: string;
  avatar: string;
  isActive: boolean;
  capturedPieces: string[];
  isThinking?: boolean;
}

const PlayerInfoBar: React.FC<PlayerInfoBarProps> = ({
  color,
  username,
  avatar,
  isActive,
  capturedPieces,
  isThinking,
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
      {isThinking && color === "black" && (
        <span className="text-yellow-300 text-[1.8vh] animate-pulse ml-2">
          Thinking...
        </span>
      )}
      <div className="flex gap-[0.5vh] items-center ml-[2vh]">
        {capturedPieces.map((piece, index) => (
          <img
            key={index}
            src={getPieceImage(piece as PieceSymbol) ?? undefined}
            alt={piece}
            className="w-[2.8vh] h-[2.8vh] opacity-75"
          />
        ))}
      </div>
    </div>
  </div>
);

const ServerChessboard: React.FC<ServerChessboardProps> = ({
  maxSize = 800,
  minSize = 280,
  className = "",
  game,
  onPlayerMove,
  isThinking,
}) => {
  const [boardSize, setBoardSize] = useState<number>(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [isCheckmate, setIsCheckmate] = useState<boolean>(false);
  const { lightColor, darkColor, highlightColor, PossibleMoveColor } = useTheme();

  const [capturedPieces, setCapturedPieces] = useState<{
    white: string[];
    black: string[];
  }>({
    white: [],
    black: [],
  });

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const playerInfo = {
    white: { username: "You", avatar: "/pawns/WhiteKing.svg" },
    black: { username: "Server", avatar: "/pawns/BlackKing.svg" },
  };

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
    
    if (typeof ResizeObserver !== "undefined" && boardRef.current?.parentElement) {
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
    if (game.isCheckmate()) {
      setIsCheckmate(true);
    }
  }, [game]);

  const handleSquareClick = (square: Square) => {
    if (isCheckmate || isThinking || game.turn !== "w") return;

    if (selectedSquare) {
      if (possibleMoves.includes(square)) {
        const targetPiece = game.getPiece(square);
        
        if (targetPiece && targetPiece !== " ") {
          const isWhitePiece = targetPiece === targetPiece.toUpperCase();
          setCapturedPieces(prev => ({
            ...prev,
            [isWhitePiece ? "black" : "white"]: [
              ...prev[isWhitePiece ? "black" : "white"],
              targetPiece,
            ],
          }));
        }
        
        onPlayerMove(selectedSquare, square);
        
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else {
        const piece = game.getPiece(square);
        const isWhitePiece = piece && piece !== " " && piece === piece.toUpperCase();
        
        if (isWhitePiece) {
          setSelectedSquare(square);
          setPossibleMoves(game.getPossibleMoves(square, true));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      const piece = game.getPiece(square);
      const isWhitePiece = piece && piece !== " " && piece === piece.toUpperCase();
      
      if (isWhitePiece) {
        setSelectedSquare(square);
        setPossibleMoves(game.getPossibleMoves(square, true));
      }
    }
  };

  const isPossibleMove = (square: Square): boolean => {
    return possibleMoves.includes(square);
  };

  return (
    <div
      className={`flex flex-col items-center p-4 w-full mx-auto ${className}`}
    >
      <div className="w-full mb-[1vh]" style={{ maxWidth: `${boardSize}px` }}>
        <PlayerInfoBar
          color="black"
          username={playerInfo.black.username}
          avatar={playerInfo.black.avatar}
          isActive={game.turn === "b"}
          capturedPieces={capturedPieces.black}
          isThinking={isThinking}
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
                      src={`/pawns/${game.turn === "w" ? "Black" : "White"}King.svg`}
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
                      CHECKMATE!
                    </div>
                    <div
                      className="text-2xl mt-2 opacity-0"
                      style={{
                        animation: "slideDown 1s ease-out forwards",
                        animationDelay: "0.8s",
                      }}
                    >
                      {game.turn === "w" ? "Server" : "You"} Wins!
                    </div>
                  </div>
                )}
                <div className="w-full h-full shadow-lg rounded-sm overflow-hidden">
                  <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                    {game.board.map((row, rowIndex) =>
                      row.map((piece, colIndex) => {
                        const rank = ranks[rowIndex];
                        const file = files[colIndex];
                        const square = `${file}${rank}` as Square;
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
          isActive={game.turn === "w"}
          capturedPieces={capturedPieces.white}
        />
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
    </div>
  );
};

export default ServerChessboard;
