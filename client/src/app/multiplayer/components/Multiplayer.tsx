"use client";
import React, { useState, useEffect, useRef } from "react";
import WebSocketClient from "../websocket";
import Chessboard from "@/app/multiplayer/components/Chessboard";
import { GameState, TeamType } from "@/app/multiplayer/components/Chessboard";

interface ChessboardRef {
  executeNotationMove: (notation: string) => boolean;
}

const Multiplayer: React.FC<{ onJoinStatusChange?: (status: boolean) => void }> = (props) => {
  const [client] = useState(new WebSocketClient());
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [moveInput, setMoveInput] = useState("");

  const chessboardRef = useRef<ChessboardRef>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleRoomCreated = (data: { roomId: string }) => {
      setRoomId(data.roomId);
      setJoined(true);
      setMessages([{ sender: "System", text: `Room created with ID: ${data.roomId}` }]);
      if (props.onJoinStatusChange) props.onJoinStatusChange(true);
    };

    const handleJoinedRoom = (data: { roomId: string }) => {
      setRoomId(data.roomId);
      setJoined(true);
      setMessages([{ sender: "System", text: `Joined room: ${data.roomId}` }]);
      if (props.onJoinStatusChange) props.onJoinStatusChange(true);
    };

    const handleOpponentMove = (data: { notation: string, sender?: string }) => {
      console.log("Received opponent move:", data.notation);
      if (chessboardRef.current) {
        chessboardRef.current.executeNotationMove(data.notation);
        setMessages(prev => [...prev, {
          sender: data.sender || "Opponent",
          text: `Made move: ${data.notation}`
        }]);
      }
    };

    const handleChatMessage = (data: { sender: string, message: string }) => {
      console.log("Received chat message:", data); // Debugging
      setMessages(prev => [...prev, { sender: data.sender, text: data.message }]);
    };

    const handleRoomFull = (data: { message: string }) => {
      setMessages(prev => [...prev, { sender: "System", text: data.message }]);
    };

    client.addEventListener("ROOM_CREATED", handleRoomCreated);
    client.addEventListener("JOINED_ROOM", handleJoinedRoom);
    client.addEventListener("OPPONENT_MOVE", handleOpponentMove);
    client.addEventListener("MESSAGE", handleChatMessage);
    client.addEventListener("ROOM_FULL", handleRoomFull);

    return () => {
      client.removeEventListener("ROOM_CREATED", handleRoomCreated);
      client.removeEventListener("JOINED_ROOM", handleJoinedRoom);
      client.removeEventListener("OPPONENT_MOVE", handleOpponentMove);
      client.removeEventListener("MESSAGE", handleChatMessage);
      client.removeEventListener("ROOM_FULL", handleRoomFull);
    };
  }, [client, props]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCreateRoom = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    client.createRoom(username);
  };

  const handleJoinRoom = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    if (roomId) {
      client.joinRoom(roomId, username);
    } else {
      alert("Please enter a room ID");
    }
  };

  const handleSendMove = () => {
    if (roomId && moveInput.trim()) {
      console.log(`Move made by ${username}: ${moveInput}`); // Debugging
      client.sendMove(roomId, moveInput);
      if (chessboardRef.current) {
        const success = chessboardRef.current.executeNotationMove(moveInput);
        if (success) {
          setMessages(prev => [...prev, {
            sender: username,
            text: `Made move: ${moveInput}`
          }]);
          setMoveInput("");
        } else {
          setMessages(prev => [...prev, {
            sender: "System",
            text: `Invalid move: ${moveInput}`
          }]);
        }
      }
    }
  };

  const handleSendChat = () => {
    if (roomId && currentMessage.trim()) {
      client.sendMessage(roomId, currentMessage, username);
      setMessages(prev => [...prev, { sender: username, text: currentMessage }]);
      setCurrentMessage("");
    }
  };

  const handleGameStateChange = (state: GameState, team: TeamType | null) => {
    if (state === GameState.CHECK) {
      const teamName = team === TeamType.OUR ? "White" : "Black";
      const message = `${teamName} is in check!`;
      client.sendMessage(roomId!, message, "System");
      setMessages(prev => [...prev, { sender: "System", text: message }]);
    } else if (state === GameState.CHECKMATE) {
      const teamName = team === TeamType.OUR ? "White" : "Black";
      const winner = team === TeamType.OUR ? "Black" : "White";
      const message = `CHECKMATE! ${teamName} is in checkmate. ${winner} wins!`;
      client.sendMessage(roomId!, message, "System");
      setMessages(prev => [...prev, { sender: "System", text: message }]);
    } else if (state === GameState.STALEMATE) {
      const message = "Stalemate! The game is a draw.";
      client.sendMessage(roomId!, message, "System");
      setMessages(prev => [...prev, { sender: "System", text: message }]);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {!joined ? (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 text-black">
          <h2 className="text-xl font-bold mb-4">Join a Chess Room</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="p-2 border rounded w-full mb-4"
          />
          <div className="space-y-4">
            <button
              onClick={handleCreateRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              Create New Room
            </button>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                value={roomId || ""}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Room ID"
                className="p-2 border rounded w-full"
              />
              <button
                onClick={handleJoinRoom}
                className="bg-green-500 text-white px-4 py-2 rounded w-full"
              >
                Join Existing Room
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white rounded-xl shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-2 text-black">Chess Game</h2>
            <div className="mb-4">
              <Chessboard
                ref={chessboardRef}
                onGameStateChange={handleGameStateChange}
                onMove={(notation) => {
                  if (roomId) {
                    client.sendMove(roomId, notation);
                    setMessages(prev => [...prev, {
                      sender: username,
                      text: `Made move: ${notation}`
                    }]);
                  }
                }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-4 flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-black">Game Room: {roomId}</h3>
            
            <div className="flex-1 overflow-hidden flex flex-col">
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-4 p-2 bg-gray-50 rounded-lg border"
              >
                {messages.map((msg, idx) => (
                  <div key={idx} className={`mb-2 ${msg.sender === username ? "text-blue-600" : "text-black"}`}>
                    <span className="font-bold">{msg.sender}: </span>
                    <span>{msg.text}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={moveInput}
                  onChange={(e) => setMoveInput(e.target.value)}
                  placeholder="Enter move (e.g., e2e4)"
                  className="flex-1 p-2 border rounded enabled:text-black"
                />
                <button
                  onClick={handleSendMove}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Send Move
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded enabled:text-black"
                />
                <button
                  onClick={handleSendChat}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default Multiplayer;
