const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let rooms = {};

wss.on('connection', (ws) => {
  ws.isAlive = true;

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    switch (data.type) {
      case 'CREATE_ROOM':
        const roomId = Math.random().toString(36).substring(2, 7);
        rooms[roomId] = [{ ws, username: data.username }];
        rooms[roomId].timeInSeconds = data.timeInSeconds || 600;

        console.log(`Room ${roomId} created by ${data.username} with ${rooms[roomId].timeInSeconds} seconds`);

        ws.send(JSON.stringify({
          type: 'ROOM_CREATED',
          roomId,
          timeInSeconds: rooms[roomId].timeInSeconds
        }));
        break;

      case 'JOIN_ROOM':
        if (rooms[data.roomId]) {
          if (rooms[data.roomId].length >= 2) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full' }));
          } else {
            rooms[data.roomId].push({ ws, username: data.username });
            ws.send(JSON.stringify({ type: 'JOINED_ROOM', roomId: data.roomId }));

            console.log(`User ${data.username} joined room ${data.roomId}`);

            rooms[data.roomId].forEach(client => {
              client.ws.send(JSON.stringify({
                type: 'USER_JOINED',
                username: data.username,
              }));
            });

            if (rooms[data.roomId].length === 2) {
              console.log(`Room ${data.roomId} is now full with 2 players`);
              rooms[data.roomId].forEach(client => {
                client.ws.send(JSON.stringify({
                  type: 'ROOM_FULL',
                  message: 'The room is now full. Game starting...',
                }));
              });
            }
          }
        } else {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }));
        }
        break;

      case 'SEND_MESSAGE':
        if (rooms[data.roomId]) {
          rooms[data.roomId].forEach(client => {
            client.ws.send(JSON.stringify({
              type: 'MESSAGE',
              message: data.message,
              sender: data.sender
            }));
          });
        }
        break;

      case 'MAKE_MOVE':
        if (rooms[data.roomId]) {
          rooms[data.roomId].forEach(client => {
            if (client.username !== data.sender) {
              client.ws.send(JSON.stringify({
                type: 'OPPONENT_MOVE',
                notation: data.notation,
                sender: data.sender,
              }));
            }
          });
        }
        break;

      // server.js - Fix color assignment logic
      case 'REQUEST_COLOR':
        if (rooms[data.roomId]) {
          const room = rooms[data.roomId];

          // Validate exactly 2 unique players
          if (room.length === 2 && room[0].username !== room[1].username) {
            // First-time color assignment
            if (!room.colorsAssigned) {
              const isFirstWhite = Math.random() >= 0.5;
              const whiteUser = isFirstWhite ? room[0].username : room[1].username;
              const blackUser = isFirstWhite ? room[1].username : room[0].username;

              // Store assignments in room state
              room.whitePlayer = whiteUser;
              room.blackPlayer = blackUser;
              room.colorsAssigned = true;

              // Send individual color assignments
              room.forEach(client => {
                client.ws.send(JSON.stringify({
                  type: 'COLOR_ASSIGNED',
                  color: client.username === whiteUser ? 'white' : 'black'
                }));
              });

              // Broadcast game ready with validated players
              room.forEach(client => {
                client.ws.send(JSON.stringify({
                  type: 'GAME_READY',
                  whitePlayer: whiteUser,
                  blackPlayer: blackUser,
                  timeInSeconds: room.timeInSeconds
                }));
              });
            }
          } else {
            ws.send(JSON.stringify({
              type: 'ERROR',
              message: 'Invalid player configuration'
            }));
          }
        }
        break;

      case 'TIME_OUT':
        if (rooms[data.roomId]) {
          rooms[data.roomId].forEach(client => {
            client.ws.send(JSON.stringify({
              type: 'GAME_OVER',
              reason: 'timeout',
              winner: data.winner
            }));
          });
        }
        break;

      case 'RESIGN':
        if (rooms[data.roomId]) {
          rooms[data.roomId].forEach(client => {
            client.ws.send(JSON.stringify({
              type: 'GAME_OVER',
              reason: 'resignation',
              winner: data.winner
            }));
          });
        }
        break;
      case 'LEAVE_ROOM':
        if (rooms[data.roomId]) {
          rooms[data.roomId] = rooms[data.roomId].filter(client => client.ws !== ws);
          rooms[data.roomId].forEach(client => {
            client.ws.send(JSON.stringify({ type: 'USER_LEFT', roomId: data.roomId }));
          });
          broadcastUserList(data.roomId);
        }
        break;
    }
  });

  ws.on('close', () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(client => client.ws !== ws);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      } else {
        broadcastUserList(roomId);
      }
    }
  });
});

function broadcastUserList(roomId) {
  const userList = rooms[roomId].map(client => client.username);
  rooms[roomId].forEach(client => {
    client.ws.send(JSON.stringify({ type: 'USER_LIST', usernames: userList }));
  });
}

console.log('WebSocket server is running on ws://localhost:8080');
