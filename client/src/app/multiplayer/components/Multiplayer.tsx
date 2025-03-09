"use client";
import React, { useState, useEffect, useRef } from "react";
import WebSocketClient from "../websocket";
import Chessboard from "@/app/Chessboard";

// Define proper interface for chessboard ref
interface ChessboardRef {
  executeNotationMove: (notation: string) => boolean;
}

const Multiplayer: React.FC<{ onJoinStatusChange?: (status: boolean) => void }> = (props) => {
  const [client] = useState(new WebSocketClient());
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [messages, setMessages] = useState<{sender: string; text: string}[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [moveInput, setMoveInput] = useState("");

  const chessboardRef = useRef<ChessboardRef>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleRoomCreated = (data: { roomId: string }) => {
      setRoomId(data.roomId);
      setJoined(true);
      setMessages([{sender: "System", text: `Room created with ID: ${data.roomId}`}]);
      if (props.onJoinStatusChange) props.onJoinStatusChange(true);
    };

    const handleJoinedRoom = (data: { roomId: string }) => {
      setRoomId(data.roomId);
      setJoined(true);
      setMessages([{sender: "System", text: `Joined room: ${data.roomId}`}]);
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
      setMessages(prev => [...prev, { sender: data.sender, text: data.message }]);
    };

    client.addEventListener("ROOM_CREATED", handleRoomCreated);
    client.addEventListener("JOINED_ROOM", handleJoinedRoom);
    client.addEventListener("MAKE_MOVE", handleOpponentMove);
    client.addEventListener("CHAT_MESSAGE", handleChatMessage);

    return () => {
      client.removeEventListener("ROOM_CREATED", handleRoomCreated);
      client.removeEventListener("JOINED_ROOM", handleJoinedRoom);
      client.removeEventListener("MAKE_MOVE", handleOpponentMove);
      client.removeEventListener("CHAT_MESSAGE", handleChatMessage);
    };
  }, [client, props]);

  // Scroll to bottom of chat when messages change
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
              <Chessboard ref={chessboardRef} />
            </div>
          </div>

          <div className="bg-gray-50 rounded p-4 flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-2 text-black">Game Room: {roomId}</h3>

            <div className="flex-grow overflow-hidden flex flex-col">
              <div
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto mb-4 p-2 bg-white border rounded"
                style={{ maxHeight: "500px" }}
              >
                {messages.map((msg, idx) => (
                  <div key={idx} className={`mb-2 ${msg.sender === username ? "text-blue-600" : "text-black"}`}>
                    <span className="font-bold">{msg.sender}: </span>
                    <span>{msg.text}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={moveInput}
                    onChange={(e) => setMoveInput(e.target.value)}
                    placeholder="Enter move (e.g., e2e4)"
                    className="p-2 border rounded flex-grow black enabled:text-black"
                  />
                  <button
                    onClick={handleSendMove}
                    className="bg-green-500 text-white px-4 py-2 rounded whitespace-nowrap"
                  >
                    Send Move
                  </button>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="Type a message..."
                    className="p-2 border rounded flex-grow enabled:text-black"
                  />
                  <button
                    onClick={handleSendChat}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
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
