class WebSocketClient {
  private socket: WebSocket;
  private roomId: string | null = null;

  constructor() {
    this.socket = new WebSocket('ws://localhost:8080');
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  private onMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    console.log('Received message from server:', data);
    switch (data.type) {
      case 'ROOM_CREATED':
        this.roomId = data.roomId;
        console.log(`Room created with ID: ${this.roomId}`);
        break;
      case 'JOINED_ROOM':
        this.roomId = data.roomId;
        console.log(`Joined room with ID: ${this.roomId}`);
        break;
      case 'MESSAGE':
        console.log(`Message received: ${data.message}`);
        break;
      case 'USER_JOINED':
        console.log(`User joined room: ${data.roomId}`);
        break;
      case 'USER_LEFT':
        console.log(`User left room: ${data.roomId}`);
        break;
      case 'ERROR':
        console.error(`Error: ${data.message}`);
        break;
    }
  }

  createRoom() {
    this.socket.send(JSON.stringify({ type: 'CREATE_ROOM' }));
  }

  joinRoom(roomId: string) {
    this.socket.send(JSON.stringify({ type: 'JOIN_ROOM', roomId }));
  }

  sendMessage(message: string) {
    if (this.roomId) {
      this.socket.send(JSON.stringify({ type: 'SEND_MESSAGE', roomId: this.roomId, message }));
    }
  }

  leaveRoom() {
    if (this.roomId) {
      this.socket.send(JSON.stringify({ type: 'LEAVE_ROOM', roomId: this.roomId }));
      this.roomId = null;
    }
  }
}

export default WebSocketClient;
