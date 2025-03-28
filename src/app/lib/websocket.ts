// lib/ws-client.ts
export class WebSocketClient {
  private socket: WebSocket;
  private roomId: string | null = null;
  private username: string;
  private eventHandlers: { [key: string]: Function[] } = {};

  constructor(username: string) {
    this.username = username;
    this.socket = new WebSocket('ws://localhost:8080');

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => this.onMessage(event);

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      setTimeout(() => this.reconnect(), 3000);
    };
  }

  private reconnect() {
    console.log('Attempting to reconnect...');
    this.socket = new WebSocket('ws://localhost:8080');
    this.setupSocket();
  }

  private setupSocket() {
    this.socket.onopen = () => {
      console.log('WebSocket connection reestablished');
      if (this.roomId) {
        console.log('Rejoining room:', this.roomId);
        this.joinRoom(this.roomId);
      }
    };

    this.socket.onmessage = (event) => this.onMessage(event);

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      setTimeout(() => this.reconnect(), 3000);
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

  createRoom() {
    this.socket.send(JSON.stringify({ type: 'CREATE_ROOM', username: this.username }));
  }

  joinRoom(roomId: string) {
    this.roomId = roomId;
    this.socket.send(JSON.stringify({ type: 'JOIN_ROOM', roomId, username: this.username }));
  }

  sendMessage(message: string) {
    if (this.roomId) {
      this.socket.send(JSON.stringify({
        type: 'SEND_MESSAGE',
        roomId: this.roomId,
        message,
        sender: this.username
      }));
    }
  }

  sendMove(notation: string) {
    if (this.roomId) {
      this.socket.send(JSON.stringify({
        type: 'MAKE_MOVE',
        roomId: this.roomId,
        notation,
        sender: this.username
      }));
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
