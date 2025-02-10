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
        ws.send(JSON.stringify({ type: 'ROOM_CREATED', roomId }));
        break;
      case 'JOIN_ROOM':
        if (rooms[data.roomId]) {
          rooms[data.roomId].push({ ws, username: data.username });
          ws.send(JSON.stringify({ type: 'JOINED_ROOM', roomId: data.roomId }));
          broadcastUserList(data.roomId);
        } else {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }));
        }
        break;
      case 'SEND_MESSAGE':
        if (rooms[data.roomId]) {
          rooms[data.roomId].forEach(client => {
            client.ws.send(JSON.stringify({ type: 'MESSAGE', message: data.message, sender: data.sender }));
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
