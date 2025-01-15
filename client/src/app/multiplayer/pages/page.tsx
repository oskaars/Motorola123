// pages/index.tsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import ChessBoard from '../components/ChessBoard';
import GameControls from '../components/GameControls';
import { createMessage, parseMessage } from '../utils/protocol';
import { ChessPosition, ChessMove, ChessMessage } from '../types/types';
import { initializeChessBoard } from '../utils/chess';

import '../styles/globals.css';


const IndexPage: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [position, setPosition] = useState<ChessPosition>(initializeChessBoard());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [playerRole, setPlayerRole] = useState<'Host A' | 'Host B'>('Host A');

    const connectToServer = useCallback(() => {
      const ws = new WebSocket(`ws://${window.location.hostname}:3000/api/ws`);
      setSocket(ws);


      ws.onopen = () => {
          console.log('Connected to server');
          setIsConnected(true);
      };

      ws.onmessage = (event) => {
          const message = parseMessage(event.data.toString());
          if (message) {
              handleMessage(message);
          }
      };

      ws.onclose = () => {
          console.log('Disconnected from server');
          setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      }

    }, []);

  useEffect(() => {
      if(playerRole === 'Host B') {
          connectToServer();
      }
  }, [playerRole, connectToServer]);


  const handleMessage = (message: ChessMessage) => {
    console.log("Received message:", message);
    switch (message.type) {
        case 'connection':
          if(message.position) setPosition(message.position)
          break;
      case 'move':
         if (message.position) {
           setPosition(message.position);
          }
        break;
      case 'invalidMove':
        alert("Invalid move")
        break;
      case 'status':
        if(message.message === 'Connected' && playerRole === 'Host A') {
              connectToServer()
        }
        break;

      default:
        console.warn('Unhandled message type:', message.type);
    }
  };


  const sendMessage = (message: string) => {
    if (socket && isConnected) {
      const moveRegex = /^[a-h][1-8][a-h][1-8]$/;
      if (moveRegex.test(message)) {
        const move: ChessMove = {from: message.substring(0,2), to: message.substring(2,4)};
        const chessMessage = createMessage({ type: 'move', move: move});
        socket.send(chessMessage);
      } else {
        alert("Invalid Input Format");
      }

    }
  };


  const handleSquareClick = (square: string) => {
      if (selectedSquare) {
          const move : ChessMove = {from: selectedSquare, to: square}
          sendMessage(move.from + move.to)
          setSelectedSquare(null);
      } else {
          setSelectedSquare(square);
      }
  };

  return (
      <div className={"container"}>
        <h1 className={"title"}>Chess Over LAN</h1>
        <div className={"gameContainer"}>
           <ChessBoard position={position} onSquareClick={handleSquareClick} />
          <GameControls isConnected={isConnected} sendMessage={sendMessage} playerRole={playerRole} />
          <div className={"roleSwitch"}>
              <button onClick={() => setPlayerRole(playerRole === 'Host A' ? 'Host B' : 'Host A')}>Switch Role</button>
            </div>
        </div>
    </div>
  );
};

export default IndexPage;