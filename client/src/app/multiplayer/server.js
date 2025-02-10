// eslint-disable-next-line @typescript-eslint/no-require-imports
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let rooms = {};

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log('Received message:', message);
    const data = JSON.parse(message);
    switch (data.type) {
      case 'CREATE_ROOM':
        const roomId = Math.random().toString(36).substring(2, 7);
        rooms[roomId] = [ws];
        ws.send(JSON.stringify({ type: 'ROOM_CREATED', roomId }));
        break;
      case 'JOIN_ROOM':
        if (rooms[data.roomId]) {
          rooms[data.roomId].push(ws);
          ws.send(JSON.stringify({ type: 'JOINED_ROOM', roomId: data.roomId }));
          rooms[data.roomId].forEach(client => {
            if (client !== ws) {
              client.send(JSON.stringify({ type: 'USER_JOINED', roomId: data.roomId }));
            }
          });
        } else {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }));
        }
        break;
      case 'SEND_MESSAGE':
        if (rooms[data.roomId]) {
          rooms[data.roomId].forEach(client => {
            if (client !== ws) {
              client.send(JSON.stringify({ type: 'MESSAGE', message: data.message }));
            }
          });
        }
        break;
      case 'LEAVE_ROOM':
        if (rooms[data.roomId]) {
          rooms[data.roomId] = rooms[data.roomId].filter(client => client !== ws);
          rooms[data.roomId].forEach(client => {
            client.send(JSON.stringify({ type: 'USER_LEFT', roomId: data.roomId }));
          });
        }
        break;
    }
  });

  ws.on('close', () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(client => client !== ws);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
