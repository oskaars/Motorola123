export class WebSocketClient {
  private socket: WebSocket;
  private roomId: string | null = null;
  public username: string; // Change to public
  private eventHandlers: { [key: string]: Function[] } = {};

  constructor(username: string) {
    this.username = username; // Now accessible from outside
    console.log(`Creating WebSocketClient for user: ${username}`);
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

  createRoom(timeInSeconds: number = 600) {
    console.log(`Creating room with ${timeInSeconds} seconds per player`);
    this.socket.send(JSON.stringify({
      type: 'CREATE_ROOM',
      username: this.username,
      timeInSeconds: timeInSeconds
    }));
  }

  joinRoom(roomId: string) {
    this.roomId = roomId;
    this.socket.send(JSON.stringify({
      type: 'JOIN_ROOM',
      roomId,
      username: this.username
    }));

    // Queue color request after server acknowledgement
    this.addEventListener('JOINED_ROOM', () => {
      setTimeout(() => this.sendRequestColor(), 100);
    });
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
      console.log(`Sending move: ${notation} to room: ${this.roomId} as player: ${this.username}`);
      this.socket.send(JSON.stringify({
        type: 'MAKE_MOVE',
        roomId: this.roomId,
        notation,
        sender: this.username
      }));
    } else {
      console.error("Cannot send move: Not in a room");
    }
  }
  sendTimeOut(winner: string) {
    if (this.roomId) {
      this.socket.send(JSON.stringify({
        type: 'TIME_OUT',
        roomId: this.roomId,
        winner
      }));
    }
  }

  sendResignation(winner: string) {
    if (this.roomId) {
      this.socket.send(JSON.stringify({
        type: 'RESIGN',
        roomId: this.roomId,
        winner
      }));
    }
  }
  leaveRoom(){
    if (this.roomId) {
      this.socket.send(JSON.stringify({ type: 'LEAVE_ROOM', roomId: this.roomId }));
      this.roomId = null;
    }
  }
  sendRequestColor() {
    if (!this.roomId) {
      console.error('Room ID missing in color request');
      return;
    }
    this.socket.send(JSON.stringify({
      type: 'REQUEST_COLOR',
      roomId: this.roomId,
      username: this.username
    }));
  }

}

export default WebSocketClient;
