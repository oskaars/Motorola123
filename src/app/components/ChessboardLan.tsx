"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/app/hooks/useTheme";
import { Chess, Square } from "chess.js";
import useWebSocket from "@/app/hooks/useWebSocket";

interface ChessboardLanProps {
  maxSize?: number;
  minSize?: number;
  className?: string;
  roomId: string | null;
  onBack: () => void;
}

interface PlayerInfo {
  username: string;
  avatar: string;
  color: "white" | "black";
}

const ChessboardLan: React.FC<ChessboardLanProps> = ({
  maxSize = 800,
  minSize = 280,
  className = "",
  roomId,
  onBack,
}) => {
  const { lightColor, darkColor, highlightColor } = useTheme();
  const [boardState, setBoardState] = useState<string[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [isCheckmate, setIsCheckmate] = useState(false);
  const [selectedTimeOption, setSelectedTimeOption] = useState<number | null>(
    null
  );
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [activeTimer, setActiveTimer] = useState<"white" | "black" | null>(
    null
  );
  const [timeOutWinner, setTimeOutWinner] = useState<"white" | "black" | null>(
    null
  );
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [messageInput, setMessageInput] = useState("");
  const [roomInfo, setRoomInfo] = useState<{
    id: string;
    players: PlayerInfo[];
  } | null>(null);
  const game = useRef(new Chess());
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(0);

  const wsClient = useWebSocket(roomId || "");

  useEffect(() => {
    if (boardRef.current) {
      const width = boardRef.current.offsetWidth;
      const height = boardRef.current.offsetHeight;
      const size = Math.min(width, height, maxSize);
      setBoardSize(Math.max(size, minSize));
    }
    setBoardState(game.current.board());
  }, [maxSize, minSize]);

  useEffect(() => {
    if (wsClient) {
      wsClient.onMessage((message) => {
        if (message.type === "move") {
          game.current.move(message.move);
          setBoardState(game.current.board());
        } else if (message.type === "chat") {
          setMessages((prev) => [
            ...prev,
            { sender: message.sender, text: message.text },
          ]);
        }
      });
    }
  }, [wsClient]);

  const handleSquareClick = (square: Square) => {
    if (isCheckmate || !wsClient) return;

    if (selectedSquare) {
      const moveResult = game.current.move({
        from: selectedSquare,
        to: square,
        promotion: "q",
      });

      if (moveResult) {
        setBoardState(game.current.board());
        setSelectedSquare(null);
        setPossibleMoves([]);

        if (!activeTimer && game.current.turn() === "b") {
          setActiveTimer("black");
        } else {
          setActiveTimer(game.current.turn() === "w" ? "white" : "black");
        }

        if (game.current.isCheckmate()) {
          setIsCheckmate(true);
        }

        wsClient.sendMove(`${selectedSquare} ${square}`);
      }
    } else {
      const piece = game.current.get(square);
      if (piece && piece.color === game.current.turn()) {
        setSelectedSquare(square);
        setPossibleMoves(
          game.current
            .moves({ square, verbose: true })
            .map((move) => move.to as Square)
        );
      }
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() && wsClient) {
      wsClient.sendMessage(messageInput);
      setMessageInput("");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full gap-4">
      <div className="flex-1 relative">
        {/* Checkmate Overlay */}
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
                  : game.current.turn() === "w"
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
                : `${game.current.turn() === "w" ? "Black" : "White"} Wins!`}
            </div>
          </div>
        )}

        {/* Chessboard */}
        <div
          ref={boardRef}
          className="w-full aspect-square"
          style={{ maxWidth: `${boardSize}px` }}
        >
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {boardState.map((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const square = `${String.fromCharCode(97 + colIndex)}${
                  8 - rowIndex
                }` as Square;
                const isSelected = square === selectedSquare;
                const isPossibleMove = possibleMoves.includes(square);

                return (
                  <div
                    key={square}
                    className={`w-full h-full flex items-center justify-center cursor-pointer transition-all duration-300`}
                    style={{
                      backgroundColor:
                        (rowIndex + colIndex) % 2 === 0
                          ? lightColor
                          : darkColor,
                      ...(isSelected && {
                        boxShadow: `0 0 15px 2px ${highlightColor}`,
                        transform: "scale(1.02)",
                      }),
                      ...(isPossibleMove && {
                        backgroundColor: "#4CAF50",
                      }),
                    }}
                    onClick={() => handleSquareClick(square)}
                  >
                    {piece && (
                      <img
                        src={`/pawns/${
                          piece.color === "w" ? "White" : "Black"
                        }${piece.type.toUpperCase()}.svg`}
                        alt={piece.type}
                        className="w-3/4 h-3/4"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-full lg:w-[300px] bg-gray-900/50 rounded-xl p-4">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h3 className="text-purple-300 text-lg font-medium">
              Room: {roomId}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className="bg-gray-800/50 rounded p-2">
                <span className="text-purple-300 font-medium">
                  {msg.sender}:{" "}
                </span>
                <span className="text-gray-300">{msg.text}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 bg-gray-800/50 rounded px-3 py-2 text-white"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-300"
            >
              Send
            </button>
          </div>
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
    </div>
  );
};

export default ChessboardLan;
