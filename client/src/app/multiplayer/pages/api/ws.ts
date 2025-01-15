// pages/api/ws.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { createMessage, parseMessage } from '../../utils/protocol';
import { isValidMove, applyMove, initializeChessBoard } from '../../utils/chess';
import { ChessPosition } from '../../types/types';


const wss = new WebSocketServer({ noServer: true });

let currentPosition: ChessPosition = initializeChessBoard();
let playerTurn: 'white' | 'black' = 'white';
const clients: WebSocket[] = [];


wss.on('connection', (ws) => {
  console.log('Client connected');
    clients.push(ws);
    const startMsg = createMessage({type: 'status', message: 'Connected'});
    ws.send(startMsg)

    if (clients.length === 2) {
      const initialPositionMessage = createMessage({type: 'connection', position: currentPosition, message: 'Game starting', });
      clients.forEach(client => client.send(initialPositionMessage));
    }
  ws.on('message', (message) => {
    if(clients.length !== 2) return;
      const parsed = parseMessage(message.toString());
    if(parsed && parsed.type === 'move' && parsed.move) {
        const move = parsed.move;
          if (isValidMove(currentPosition, move, playerTurn)) {
            currentPosition = applyMove(currentPosition, move);
             playerTurn = playerTurn === 'white' ? 'black' : 'white'
            clients.forEach(client => client.send(createMessage({
                  type: 'move',
                  move: move,
                  position: currentPosition,
            })))

          } else {
            ws.send(createMessage({type: 'invalidMove', message: 'Invalid move'}))
          }
      }

  });

  ws.on('close', () => {
    console.log('Client disconnected');
     clients.splice(clients.indexOf(ws), 1);
  });
});

import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

interface ExtendedServer extends HTTPServer {
  webSocketServer?: WebSocketServer;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const server = (res.socket as any)?.server as ExtendedServer | undefined;
  if (server && !server.webSocketServer) {
    console.log('Setting up WebSocket');

    (server as ExtendedServer).webSocketServer = wss;
    wss.handleUpgrade(req, req.socket as NetSocket, Buffer.alloc(0), ws => {
        wss.emit('connection', ws, req);
    });
  }
  res.end();
}