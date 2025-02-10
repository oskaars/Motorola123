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
    };
  }

  private onMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    console.log('Received message from server:', data);
    if (this.eventHandlers[data.type]) {
      this.eventHandlers[data.type].forEach(handler => handler(data));
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
    this.socket.send(JSON.stringify({ type: 'SEND_MESSAGE', roomId, message, sender }));
  }

  leaveRoom() {
    if (this.roomId) {
      this.socket.send(JSON.stringify({ type: 'LEAVE_ROOM', roomId: this.roomId }));
      this.roomId = null;
    }
  }
}

export default WebSocketClient;
