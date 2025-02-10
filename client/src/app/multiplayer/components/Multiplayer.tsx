"use client";
import React, { useState } from 'react';
import WebSocketClient from '../websocket';

const Multiplayer: React.FC = () => {
  const [client] = useState(new WebSocketClient());
  const [roomId, setRoomId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const handleCreateRoom = () => {
    client.createRoom();
  };

  const handleJoinRoom = () => {
    if (roomId) {
      client.joinRoom(roomId);
    }
  };

  const handleSendMessage = () => {
    client.sendMessage(message);
    setMessage('');
  };

  const handleLeaveRoom = () => {
    client.leaveRoom();
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <button onClick={handleCreateRoom} className="bg-blue-500 text-white px-4 py-2 rounded">Create Room</button>
        <input
          type="text"
          value={roomId || ''}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room ID"
          className="ml-2 p-2 border rounded"
        />
        <button onClick={handleJoinRoom} className="bg-green-500 text-white px-4 py-2 rounded ml-2">Join Room</button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          className="p-2 border rounded"
        />
        <button onClick={handleSendMessage} className="bg-yellow-500 text-white px-4 py-2 rounded ml-2">Send Message</button>
      </div>
      <button onClick={handleLeaveRoom} className="bg-red-500 text-white px-4 py-2 rounded">Leave Room</button>
    </div>
  );
};

export default Multiplayer;
