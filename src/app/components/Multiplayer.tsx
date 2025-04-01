"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  algebraicToCoords,
  ChessGame,
  PieceSymbol,
  Square
} from "@/app/utils/chess";
import WebSocketClient from "../lib/websocket";

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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const PlayerInfoBar = ({
  username,
  avatar,
  timeLeft,
  isActive,
}: {
  color: "white" | "black";
  username: string;
  avatar: string;
  timeLeft: number;
  isActive: boolean;
}) => (
  <div
    className={`w-full flex items-center justify-between p-2 rounded-md ${
      isActive ? "bg-blue-100" : "bg-gray-100"
    }`}
  >
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
        <img
          src={avatar}
          alt={username}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="font-medium">{username}</span>
    </div>
    <div
      className={`text-xl font-mono font-bold ${
        isActive ? "text-blue-600" : "text-gray-600"
      }`}
    >
      {formatTime(timeLeft)}
    </div>
  </div>
);

PlayerInfoBar.displayName = 'PlayerInfoBar';

const Chessboard: React.FC<ChessboardProps> = ({
  maxSize = 800,
  minSize = 280,
  className = "",
}) => {
  const [boardSize, setBoardSize] = useState<number>(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [game] = useState(() => new ChessGame());
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

  useEffect(() => {
    console.log("Initializing WebSocket client");
    const randomUsername = `Player${Math.floor(
      Math.random() * 1000
    )}_${Date.now().toString().slice(-4)}`;
    console.log(`Generated username: ${randomUsername}`);

    const client = new WebSocketClient(randomUsername);
    setWsClient(client);

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
    client.addEventListener("GAME_OVER", (data: unknown) => {
        const gameOverData = data as { reason: string; winner: string };
        setIsCheckmate(true);
        setChatMessages((prev) => [
          ...prev,
          `Game over! ${gameOverData.winner} wins by ${gameOverData.reason}`,
        ]);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    );

    client.addEventListener("RESIGN", (data: unknown) => {
      const resignData = data as { winner: string };
      setIsCheckmate(true);
      setChatMessages((prev) => [
        ...prev,
        `Game resigned! ${resignData.winner} wins`,
      ]);
      if (timerRef.current) clearInterval(timerRef.current);
    });
    client.addEventListener("ROOM_CREATED", (data: unknown) => {
        const roomData = data as { roomId: string; timeInSeconds: number };
        console.log(`Room created event received: ${JSON.stringify(data)}`);
        setRoomId(roomData.roomId);
        setChatMessages((prev) => [
          ...prev,
          `Room created! Your room ID is: ${roomData.roomId}`,
          "Share this ID with your opponent to join the game.",
        ]);

        setTimeout(() => {
          console.log("Requesting color assignment after room creation");
          client.sendRequestColor();
        }, 500);
      }
    );

    client.addEventListener("JOINED_ROOM", (data: unknown) => {
      const joinedData = data as JoinedRoomData;
      setRoomId(joinedData.roomId);
      setChatMessages((prev) => [...prev, `You joined room: ${joinedData.roomId}`]);
      console.log(`Joined room: ${joinedData.roomId}`);
      client.sendRequestColor();
    });

    client.addEventListener("USER_JOINED", (data: unknown) => {
      const userData = data as { username: string };
      setChatMessages((prev) => [...prev, `${userData.username} joined the game!`]);
    });

    client.addEventListener("OPPONENT_MOVE", (data: unknown) => {
      const moveData = data as OpponentMoveData;
      console.log(
        `Received opponent move: ${moveData.notation} from ${moveData.sender}`
      );

      let moveResult;

      if (moveData.notation.length > 4) {
        const from = moveData.notation.substring(0, 2);
        const to = moveData.notation.substring(2, 4);
        const promotionPiece = moveData.notation.substring(4) as PieceSymbol;

        console.log(
          `Opponent promoting from ${from} to ${to} as ${promotionPiece}`
        );
        moveResult = game.makeMove(from, to, promotionPiece);
      } else {
        const moveData = data as OpponentMoveData;
        moveResult = game.makeMove(
          moveData.notation.substring(0, 2),
          moveData.notation.substring(2, 4)
        );
      }

      if (moveResult) {
        setBoardState(JSON.parse(JSON.stringify(game.board)));
        setChatMessages((prev) => [
          ...prev,
          `${(data as OpponentMoveData).sender} moved: ${(data as OpponentMoveData).notation}`,
        ]);

        setActiveTimer(game.turn === "w" ? "white" : "black");

        if (game.isCheckmate()) {
          setIsCheckmate(true);
          console.log("Checkmate!");
          setChatMessages((prev) => [...prev, "Checkmate!"]);
        }
      } else {
        console.error(`Failed to make opponent's move: ${(data as OpponentMoveData).notation}`);
      }
    });

    client.addEventListener("MESSAGE", (data: unknown) => {
      const messageData = data as MessageData;
      setChatMessages((prev) => [...prev, `${messageData.sender}: ${messageData.message}`]);
    });

    client.addEventListener("COLOR_ASSIGNED", (data: unknown) => {
    const colorData = data as { color: "white" | "black" };
      setPlayerColor(colorData.color);
      setChatMessages((prev) => [
        ...prev,
        `You are playing as ${colorData.color}`,
      ]);
        const playerUsername = client.username;

        if (colorData.color === "white") {
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

    client.addEventListener("GAME_READY", (data: unknown) => {
      const gameReadyData = data as {
        whitePlayer: string;
        blackPlayer: string;
        timeInSeconds: number;
      };
        if (gameReadyData.whitePlayer === gameReadyData.blackPlayer) {
          console.error("Server sent invalid player assignment:", data);
          setChatMessages((prev) => [
            ...prev,
            "Server error: Invalid game setup",
          ]);
          return;
        }

        if (gameReadyData.whitePlayer === client.username) {
          setPlayerColor("white");
        } else if (gameReadyData.blackPlayer === client.username) {
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
        setWhiteTime(gameReadyData.timeInSeconds);
        setBlackTime(gameReadyData.timeInSeconds);
        setActiveTimer("white");

        setPlayerInfo({
          white: {
            username: gameReadyData.whitePlayer,
            avatar: "/pawns/WhiteKing.svg",
          },
          black: {
            username: gameReadyData.blackPlayer,
            avatar: "/pawns/BlackKing.svg",
          },
        });
      }
    );

    client.addEventListener("ROOM_FULL", (data: unknown) => {
      const roomFullData = data as { message: string };
      setChatMessages((prev) => [...prev, roomFullData.message]);
      client.sendRequestColor();
    });

    client.addEventListener("SOCKET_READY", () => {
      console.log("Socket is now ready");
      setSocketConnected(true);
    });

    return () => {
      console.log("Cleaning up WebSocket client");
      if (client && roomId) {
        client.leaveRoom();
      }
    };
  }, []);

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
  }, [minSize, maxSize, game, roomId]);

  useEffect(() => {
    if (gameReady && roomId) {
      timerRef.current = setInterval(() => {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            wsClient?.sendTimeOut(playerInfo.black.username);
            return 0;
          }
          return activeTimer === "white" ? prev - 1 : prev;
        });

        setBlackTime((prev) => {
          if (prev <= 0) {
            wsClient?.sendTimeOut(playerInfo.white.username);
            return 0;
          }
          return activeTimer === "black" ? prev - 1 : prev;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    activeTimer, 
    gameReady, 
    roomId, 
    wsClient, 
    playerInfo.black.username, 
    playerInfo.white.username
  ]);

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const handleSquareClick = (square: Square) => {
    if (isCheckmate || !wsClient || !playerColor) {
      return;
    }

    const isPlayerTurn =
      (game.turn === "w" && playerColor === "white") ||
      (game.turn === "b" && playerColor === "black");

    if (!isPlayerTurn) {
      setChatMessages((prev) => [...prev, "It's not your turn"]);
      return;
    }

    if (selectedSquare) {
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
      console.log(
        `Promotion successful, new piece: ${game.getPiece(promotionSquare)}`
      );

      setBoardState([...game.board]);
      setSelectedSquare(null);
      setPossibleMoves([]);

      setActiveTimer(game.turn === "w" ? "white" : "black");

      if (game.isCheckmate()) {
        setIsCheckmate(true);
        console.log("Checkmate!");
        setChatMessages((prev) => [...prev, "Checkmate!"]);
      }

      if (wsClient && roomId) {
        const moveNotation = `${promotionFromSquare}${promotionSquare}${promotionPiece}`;
        console.log(`Sending move with promotion: ${moveNotation}`);
        wsClient.sendMove(moveNotation);
        setChatMessages((prev) => [
          ...prev,
          `You promoted to ${promotionPiece.toUpperCase()}`,
        ]);
      }
    } else {
      console.error("Promotion move failed");
    }

    setShowPromotion(false);
    setPromotionSquare(null);
    setPromotionFromSquare(null);
  };

  const isPossibleMove = (square: Square): boolean => {
    return possibleMoves.includes(square);
  };

  const createRoom = () => {
    if (!wsClient) {
      console.error("WebSocket client not initialized");
      return;
    }

    console.log(`Creating room with ${selectedTimeOption} seconds`);
    wsClient.createRoom(selectedTimeOption);
  };

  const joinRoom = () => {
    const roomId = prompt("Enter room ID:");
    if (roomId && wsClient) {
      wsClient.joinRoom(roomId);
    }
  };

  const sendMessage = () => {
    const message = prompt("Enter message:");
    if (message && wsClient && roomId) {
      wsClient.sendMessage(message);
    }
  };

  return (
    <div
      className={`flex flex-col items-center p-4 w-full mx-auto ${className}`}
    >
      <PlayerTeamBadge playerColor={playerColor} />
      {!socketConnected && (
        <div className="mt-4 p-2 bg-yellow-100 rounded text-center">
          Connecting to server...
        </div>
      )}
      {isCheckmate && (
        <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center text-white text-4xl font-bold z-50">
          CHECKMATE!
        </div>
      )}
      {showPromotion && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-2 text-center">
              Choose promotion piece
            </h3>
            <div className="flex justify-center">
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
                    className="w-16 h-16 m-1 flex items-center justify-center cursor-pointer border border-gray-300 hover:bg-gray-100"
                    onClick={() => handlePromotion(piece)}
                  >
                    <img
                      src={`/pawns/${color}${pieceName}.svg`}
                      alt={pieceName}
                      className="w-12 h-12"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="w-full" style={{ maxWidth: `${boardSize}px` }}>
        <PlayerInfoBar
          color="black"
          username={playerInfo.black.username}
          avatar={playerInfo.black.avatar}
          timeLeft={blackTime}
          isActive={activeTimer === "black"}
        />
      </div>
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
                              ${
                                (rowIndex + colIndex) % 2 === 0
                                  ? "bg-[#f0d9b5]"
                                  : "bg-[#b58863]"
                              }
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

      <div className="w-full" style={{ maxWidth: `${boardSize}px` }}>
        <PlayerInfoBar
          color="white"
          username={playerInfo.white.username}
          avatar={playerInfo.white.avatar}
          timeLeft={whiteTime}
          isActive={activeTimer === "white"}
        />
      </div>

      <div className="mt-4 w-full max-w-md">
        {!roomId && (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Game Time</h3>
              <div className="flex space-x-2 flex-wrap">
                <button
                  onClick={() => setSelectedTimeOption(60)}
                  className={`px-4 py-2 rounded-md m-1 ${
                    selectedTimeOption === 60
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  1 Min
                </button>
                <button
                  onClick={() => setSelectedTimeOption(180)}
                  className={`px-4 py-2 rounded-md m-1 ${
                    selectedTimeOption === 180
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  3 Min
                </button>
                <button
                  onClick={() => setSelectedTimeOption(600)}
                  className={`px-4 py-2 rounded-md m-1 ${
                    selectedTimeOption === 600
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  10 Min
                </button>
                <button
                  onClick={() => setSelectedTimeOption(3600)}
                  className={`px-4 py-2 rounded-md m-1 ${
                    selectedTimeOption === 3600
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  60 Min
                </button>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
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
          </>
        )}

        {roomId && (
          <div className="flex justify-center">
            <button
              onClick={sendMessage}
              className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white"
            >
              Send Message
            </button>
          </div>
        )}
      </div>

      {roomId && (
        <div className="mt-4 w-full max-w-md">
          <div className="bg-blue-100 p-4 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <span className="font-bold">Room ID: </span>
              <span className="font-mono">{roomId}</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomId);
                setChatMessages((prev) => [
                  ...prev,
                  "Room ID copied to clipboard!",
                ]);
              }}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {roomId && !gameReady && (
        <div className="mt-4 w-full max-w-md">
          <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
            <p className="text-center">Waiting for opponent to join...</p>
          </div>
        </div>
      )}

      <div className="mt-4 w-full max-w-md">
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-2">Chat</h3>
          <div className="h-64 overflow-y-auto">
            {chatMessages.map((message, index) => (
              <div key={index} className="mb-2 text-sm">
                {message}
              </div>
            ))}
          </div>
        </div>
      </div>
      {roomId && playerColor && (
        <div className="mt-4 w-full max-w-md">
          <div
            className={`p-4 rounded-lg shadow-md text-center font-bold ${
              playerColor === "white" ? "bg-gray-100" : "bg-gray-800 text-white"
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
    </div>
  );
};

Chessboard.displayName = 'Chessboard';

const PlayerTeamBadge = ({
  playerColor,
}: {
  playerColor: "white" | "black" | null;
}) => {
  if (!playerColor) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white shadow-md rounded-lg p-3 flex items-center space-x-2">
      <div
        className={`w-6 h-6 rounded-full ${
          playerColor === "white"
            ? "bg-white border border-gray-300"
            : "bg-black"
        }`}
      ></div>
      <span className="font-medium">You are playing as {playerColor}</span>
    </div>
  );
};

PlayerTeamBadge.displayName = 'PlayerTeamBadge';

export default Chessboard;
