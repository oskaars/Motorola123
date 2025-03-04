"use client";
import React, { useState, useEffect } from 'react';
import WebSocketClient from '../websocket';

const Multiplayer: React.FC<{ onJoinStatusChange?: (status: boolean) => void }> = (props) => {
  const [client] = useState(new WebSocketClient());
  const [roomId, setRoomId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; message: string }[]>([]);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const handleRoomCreated = (data: { roomId: string }) => {
      setRoomId(data.roomId);
      setJoined(true);
      if (props.onJoinStatusChange) props.onJoinStatusChange(true); // Wysłanie statusu
    };

    const handleJoinedRoom = (data: { roomId: string }) => {
      setRoomId(data.roomId);
      setJoined(true);
      if (props.onJoinStatusChange) props.onJoinStatusChange(true); // Wysłanie statusu
    };

    const handleLeaveRoom = () => {
      setJoined(false);
      setRoomId(null);
      if (props.onJoinStatusChange) props.onJoinStatusChange(false); // Wysłanie statusu
    };

    client.addEventListener('ROOM_CREATED', handleRoomCreated);
    client.addEventListener('JOINED_ROOM', handleJoinedRoom);

    return () => {
      client.removeEventListener('ROOM_CREATED', handleRoomCreated);
      client.removeEventListener('JOINED_ROOM', handleJoinedRoom);
    };
  }, [client, props]);


  const handleCreateRoom = () => {
    client.createRoom(username);
  };

  const handleJoinRoom = () => {
    if (roomId) {
      client.joinRoom(roomId, username);
      setJoined(true);
    }
  };

  const handleSendMessage = () => {
    if (roomId) {
      client.sendMessage(roomId, message, username);
      setMessage('');
    }
  };

  const handleLeaveRoom = () => {
    client.leaveRoom();
    setRoomId(null);
    setJoined(false);
    setUsernames([]);
    setMessages([]);
  };

  const handleCopyToClipboard = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 text-black">
        {!joined && (
          <div className="mb-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="p-2 border rounded w-full"
            />
          </div>
        )}
        {roomId && (
          <div className="text-2xl font-bold text-center mb-4">
            Room Code: {roomId.toUpperCase()}
            <button onClick={handleCopyToClipboard} className="ml-2 bg-gray-300 text-black px-2 py-1 rounded">Copy</button>
          </div>
        )}
        {!joined && (
          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleCreateRoom} className="bg-blue-500 text-white px-4 py-2 rounded">Create Room</button>
            <div className="flex items-center">
              <input
                type="text"
                value={roomId || ''}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Room ID"
                className="p-2 border rounded w-full"
              />
              <button onClick={handleJoinRoom} className="bg-green-500 text-white px-4 py-2 rounded ml-2">Join Room</button>
            </div>
          </div>
        )}
        {joined && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message"
                className="p-2 border rounded w-full text-black"
              />
              <button onClick={handleSendMessage} className="bg-yellow-500 text-white px-4 py-2 rounded">Send Message</button>
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-bold">Messages:</h2>
              <ul className="list-disc list-inside">
                {messages.map((msg, index) => (
                  <li key={index}><strong>{msg.sender}:</strong> {msg.message}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        <button onClick={handleLeaveRoom} className="bg-red-500 text-white px-4 py-2 rounded w-full">Leave Room</button>
      </div>
      {joined && (
        <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 text-black ml-4">
          <h2 className="text-xl font-bold">Users in Room:</h2>
          <ul className="list-disc list-inside">
            {usernames.map((username, index) => (
              <li key={index}>{username}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Multiplayer;
