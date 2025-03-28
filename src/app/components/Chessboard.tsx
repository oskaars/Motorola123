"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChessGame, PieceSymbol, Square } from "@/app/utils/chess";
import WebSocketClient from '@/app/lib/websocket';

interface ChessboardProps {
  maxSize?: number;
  minSize?: number;
  className?: string;
}

const getPieceImage = (piece: PieceSymbol | ' '): string | null => {
  if (piece === ' ') {
    return null;
  }
  const color = piece === piece.toUpperCase() ? 'White' : 'Black';
  const type = piece.toLowerCase();
  let pieceName = '';
  switch (type) {
    case 'p':
      pieceName = 'Pawn';
      break;
    case 'n':
      pieceName = 'Knight';
      break;
    case 'b':
      pieceName = 'Bishop';
      break;
    case 'r':
      pieceName = 'Rook';
      break;
    case 'q':
      pieceName = 'Queen';
      break;
    case 'k':
      pieceName = 'King';
      break;
    default:
      return null;
  }
  return `/pawns/${color}${pieceName}.svg`;
};

const Chessboard: React.FC<ChessboardProps> = ({maxSize = 800, minSize = 280,className = ""}) => {
  const [boardSize, setBoardSize] = useState<number>(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [game] = useState(() => new ChessGame());
  const [boardState, setBoardState] = useState(game.board);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [isCheckmate, setIsCheckmate] = useState<boolean>(false);
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const client = new WebSocketClient("Player1");
    setWsClient(client);

    client.addEventListener('ROOM_CREATED', (data: { roomId: React.SetStateAction<string | null>; }) => {
      setRoomId(data.roomId);
      console.log(`Room created: ${data.roomId}`);
    });

    client.addEventListener('JOINED_ROOM', (data: { roomId: React.SetStateAction<string | null>; }) => {
      setRoomId(data.roomId);
      console.log(`Joined room: ${data.roomId}`);
    });

    client.addEventListener('OPPONENT_MOVE', (data: { notation: string; }) => {
      const moveResult = game.makeMove(data.notation.split(' ')[0], data.notation.split(' ')[1]);
      if (moveResult) {
        setBoardState(game.board);
        if (game.isCheckmate()) {
          setIsCheckmate(true);
          console.log("Checkmate!");
        }
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

        const smallerViewportDimension = Math.min(viewportWidth, viewportHeight);

        let idealSize;

        if (viewportWidth < 640) { // Mobile
          idealSize = Math.min(containerWidth * 0.95, smallerViewportDimension * 0.8, maxSize);
        } else if (viewportWidth < 1024) { // Tablet
          idealSize = Math.min(containerWidth * 0.85, smallerViewportDimension * 0.7, maxSize);
        } else { // Desktop
          idealSize = Math.min(containerWidth * 0.75, smallerViewportDimension * 0.6, maxSize);
        }

        const finalSize = Math.max(Math.min(idealSize, maxSize), minSize);

        setBoardSize(finalSize);
      }
    };

    updateSize();

    window.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", updateSize);

    if (typeof ResizeObserver !== 'undefined') {
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

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const handleSquareClick = (square: Square) => {
    if (isCheckmate || !wsClient) {
      return;
    }

    if (selectedSquare) {
      const moveResult = game.makeMove(selectedSquare, square);
      if (moveResult) {
        setBoardState(game.board);
        setSelectedSquare(null);
        setPossibleMoves([]);

        if (game.isCheckmate()) {
          setIsCheckmate(true);
          console.log("Checkmate!");
        }

        if (wsClient && roomId) {
          wsClient.sendMove(`${selectedSquare}${square}`);
        }
      } else {
        const piece = game.getPiece(square);
        const currentColor = game.turn;
        const isOwnPiece = piece !== null && piece !== ' ' && ((currentColor === 'w' && piece === piece.toUpperCase()) || (currentColor === 'b' && piece === piece.toLowerCase()));
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
      const isOwnPiece = piece !== null && piece !== ' ' && ((currentColor === 'w' && piece === piece.toUpperCase()) || (currentColor === 'b' && piece === piece.toLowerCase()));
      if (isOwnPiece) {
        setSelectedSquare(square);
        setPossibleMoves(game.getPossibleMoves(square, true));
      }
    }
  };

  const isPossibleMove = (square: Square): boolean => {
    return possibleMoves.includes(square);
  };

  const createRoom = () => {
    if (wsClient) {
      wsClient.createRoom();
    }
  };

  const joinRoom = () => {
    const roomId = prompt('Enter room ID:');
    if (roomId && wsClient) {
      wsClient.joinRoom(roomId);
    }
  };

  return (
    <div className={`flex flex-col items-center p-4 w-full mx-auto ${className}`}>
      {isCheckmate && (
        <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center text-white text-4xl font-bold">
          CHECKMATE!
        </div>
      )}
      <div
        ref={boardRef}
        className="relative w-full"
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
                <div className="w-full h-full border-2 border-gray-700 shadow-lg rounded-sm overflow-hidden">
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
                            className={`w-full h-full flex items-center justify-center cursor-pointer
                              ${(rowIndex + colIndex) % 2 === 0 ? "bg-[#f0d9b5]" : "bg-[#b58863]"}
                              ${isSelected ? "bg-yellow-300" : ""}
                              ${isMoveableTo ? "bg-green-300" : ""}
                              ${isCheckmate ? "bg-red-300" : ""}
                            `}
                            data-square={square}
                            onClick={() => handleSquareClick(square)}
                          >
                            {pieceImage && (
                              <img
                                src={pieceImage}
                                alt={piece}
                                className="w-4/5 h-4/5"
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

      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={createRoom}
          className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
        >
          Create Room
        </button>
        <button
          onClick={joinRoom}
          className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default Chessboard;
