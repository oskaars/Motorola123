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
            console.log(`Users in room: ${rooms[data.roomId].map(client => client.username).join(', ')}`);
            
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
          console.log(`Move made in room ${data.roomId}: ${data.notation} by ${data.sender}`);
          
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
      case 'LEAVE_ROOM':
        if (rooms[data.roomId]) {
          rooms[data.roomId] = rooms[data.roomId].filter(client => client.ws !== ws);
          rooms[data.roomId].forEach(client => {
            client.ws.send(JSON.stringify({ type: 'USER_LEFT', roomId: data.roomId }));
          });
          broadcastUserList(data.roomId);
        }
        break;
      case 'REQUEST_COLOR':
        if (rooms[data.roomId]) {
          if (!rooms[data.roomId].hasOwnProperty('whitePlayer')) {
            const isWhite = Math.random() >= 0.5;
            
            rooms[data.roomId].whitePlayer = isWhite ? data.username : null;
            rooms[data.roomId].blackPlayer = !isWhite ? data.username : null;
            
            ws.send(JSON.stringify({
              type: 'COLOR_ASSIGNED',
              color: isWhite ? 'white' : 'black'
            }));
            
            console.log(`Assigned ${isWhite ? 'white' : 'black'} to ${data.username} in room ${data.roomId}`);
          } 
          else {
            const isWhite = rooms[data.roomId].whitePlayer === null;
            
            if (isWhite) {
              rooms[data.roomId].whitePlayer = data.username;
            } else {
              rooms[data.roomId].blackPlayer = data.username;
            }
            
            ws.send(JSON.stringify({
              type: 'COLOR_ASSIGNED',
              color: isWhite ? 'white' : 'black'
            }));
            
            console.log(`Assigned ${isWhite ? 'white' : 'black'} to ${data.username} in room ${data.roomId}`);
            
            rooms[data.roomId].forEach(client => {
              client.ws.send(JSON.stringify({
                type: 'GAME_READY',
                whitePlayer: rooms[data.roomId].whitePlayer,
                blackPlayer: rooms[data.roomId].blackPlayer,
                timeInSeconds: rooms[data.roomId].timeInSeconds || 600
              }));
            });
          }
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
