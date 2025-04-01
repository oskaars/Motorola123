// Replace Function types with proper TypeScript types
export class WebSocketClient {
  private socket: WebSocket;
  private roomId: string | null = null;
  public username: string;
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();
  private socketReady: boolean = false;
  private serverUrl: string;

  constructor(username: string) {
    this.username = username;
    this.serverUrl = process.env.WS && process.env.WS.trim() !== '' ? process.env.WS : 'ws://localhost:8080';
    console.log(`Creating WebSocketClient for user: ${username}, connecting to: ${this.serverUrl}`);
    this.socket = new WebSocket(this.serverUrl);
    this.setupSocket();
  }

  private reconnect() {
    console.log('Attempting to reconnect...');
    this.socket = new WebSocket(this.serverUrl);
    this.setupSocket();
  }

  private setupSocket() {
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.socketReady = true;
      this.dispatchEvent('SOCKET_READY', {});
    };

    this.socket.onmessage = (event) => this.onMessage(event);

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.socketReady = false;
    };
  }

  private ensureSocketReady(callback: () => void) {
    if (this.socketReady) {
      callback();
    } else {
      console.log('Socket not ready, waiting...');
      setTimeout(() => this.ensureSocketReady(callback), 100);
    }
  }

  private onMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      console.log('Received message from server:', data);
      if (data.type === 'ROOM_CREATED' || data.type === 'JOINED_ROOM') {
        this.roomId = data.roomId;
        console.log(`Set roomId to ${this.roomId}`);
      }
      if (this.listeners.has(data.type)) {
        this.listeners.get(data.type)!.forEach(handler => handler(data));
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  private dispatchEvent(event: string, data: unknown): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data));
    }
  }

  addEventListener(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: (data: unknown) => void): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      this.listeners.set(event, callbacks.filter(cb => cb !== callback));
    }
  }

  createRoom(timeInSeconds: number = 600) {
    console.log(`Attempting to create room with ${timeInSeconds} seconds`);
    
    this.ensureSocketReady(() => {
      console.log(`Creating room with ${timeInSeconds} seconds per player`);
      try {
        const message = JSON.stringify({
          type: 'CREATE_ROOM',
          username: this.username,
          timeInSeconds: timeInSeconds
        });
        console.log('Sending message:', message);
        this.socket.send(message);
      } catch (error) {
        console.error('Error creating room:', error);
      }
    });
  }

  joinRoom(roomId: string) {
    console.log(`Attempting to join room: ${roomId}`);
    
    this.ensureSocketReady(() => {
      console.log(`Joining room: ${roomId}`);
      this.socket.send(JSON.stringify({
        type: 'JOIN_ROOM',
        roomId: roomId,
        username: this.username
      }));
    });

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
      console.log(`Sending timeout notification. Winner: ${winner}`);
      this.socket.send(JSON.stringify({
        type: 'TIME_OUT',
        roomId: this.roomId,
        winner: winner
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
    if (this.roomId) {
      console.log(`Requesting color assignment for ${this.username} in room ${this.roomId}`);
      
      this.ensureSocketReady(() => {
        this.socket.send(JSON.stringify({
          type: 'REQUEST_COLOR',
          roomId: this.roomId,
          username: this.username
        }));
      });
    } else {
      console.error("Cannot request color: Not in a room");
    }
  }

}

export default WebSocketClient;
