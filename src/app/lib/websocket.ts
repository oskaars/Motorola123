export class WebSocketClient {
  private socket: WebSocket;
  private roomId: string | null = null;
  public username: string;
  private eventHandlers: { [key: string]: Function[] } = {};
  private socketReady: boolean = false;

  constructor(username: string) {
    this.username = username; 
    console.log(`Creating WebSocketClient for user: ${username}`);
    this.socket = new WebSocket('ws://localhost:8080');
    this.setupSocket();

    // Add window unload handler
    window.addEventListener('beforeunload', () => {
      if (this.roomId) {
        this.leaveRoom();
      }
    });
  }

  private reconnect() {
    console.log('Attempting to reconnect...');
    this.socket = new WebSocket('ws://localhost:8080');
    this.setupSocket();
  }

  private setupSocket() {
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.socketReady = true;
      this.triggerEvent('SOCKET_READY', {});
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
      console.log('Received message:', data);

      if (data.type === 'PLAYER_LEFT') {
        console.log('Player left event received:', data);
        // Trigger event for remaining player
        this.triggerEvent('PLAYER_LEFT', {
          leftPlayer: data.username,
          winner: this.username // The remaining player wins
        });
      }

      if (data.type === 'ROOM_CREATED' || data.type === 'JOINED_ROOM') {
        this.roomId = data.roomId;
        console.log(`Set roomId to ${this.roomId}`);
      }
      
      if (this.eventHandlers[data.type]) {
        this.eventHandlers[data.type].forEach(handler => handler(data));
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  private triggerEvent(type: string, data: any) {
    const handlers = this.eventHandlers[type] || [];
    handlers.forEach(handler => handler(data));
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
      console.log('Player leaving room:', this.username);
      this.socket.send(JSON.stringify({ 
        type: 'LEAVE_ROOM', 
        roomId: this.roomId,
        username: this.username 
      }));
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
