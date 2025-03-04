class WebSocketClient {
  private socket: WebSocket;
  private roomId: string | null = null;
  private eventHandlers: { [key: string]: Function[] } = {};

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
      // Attempt to reconnect
      setTimeout(() => {
        this.reconnect();
      }, 3000);
    };
  }

  private reconnect() {
    console.log('Attempting to reconnect...');
    this.socket = new WebSocket('ws://localhost:8080');
    this.socket.onopen = () => {
      console.log('WebSocket connection reestablished');
      // If we were in a room before, rejoin it
      if (this.roomId) {
        console.log('Rejoining room:', this.roomId);
        // You would need to store the username somewhere to rejoin
      }
    };
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      setTimeout(() => {
        this.reconnect();
      }, 3000);
    };
  }

  private onMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      console.log('Received message from server:', data);
      if (this.eventHandlers[data.type]) {
        this.eventHandlers[data.type].forEach(handler => handler(data));
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  addEventListener(event: string, handler: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  removeEventListener(event: string, handler: Function) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    }
  }

  createRoom(username: string) {
    this.socket.send(JSON.stringify({ type: 'CREATE_ROOM', username }));
  }

  joinRoom(roomId: string, username: string) {
    this.roomId = roomId;
    this.socket.send(JSON.stringify({ type: 'JOIN_ROOM', roomId, username }));
  }

  sendMessage(roomId: string, message: string, sender: string) {
    this.socket.send(JSON.stringify({
      type: 'SEND_MESSAGE',
      roomId,
      message,
      sender
    }));
  }

  sendMove(roomId: string, notation: string) {
    this.socket.send(JSON.stringify({
      type: 'MAKE_MOVE',
      roomId,
      notation
    }));
  }

  leaveRoom() {
    if (this.roomId) {
      this.socket.send(JSON.stringify({ type: 'LEAVE_ROOM', roomId: this.roomId }));
      this.roomId = null;
    }
  }
}

export default WebSocketClient;
