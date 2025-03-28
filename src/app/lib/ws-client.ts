// lib/ws-client.ts
export class UciWebSocketClient {
  private socket: WebSocket;
  private listeners: { [key: string]: ((data: string) => void)[] } = {};

  constructor(private url: string) {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      const data = event.data.toString();
      this.handleMessage(data);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  private handleMessage(data: string): void {
    const lines = data.split('\n');
    for (const line of lines) {
      if (line.startsWith('bestmove')) {
        this.triggerListeners('bestmove', line.replace('bestmove ', ''));
      } else if (line.startsWith('info')) {
        this.triggerListeners('info', line.replace('info ', ''));
      } else if (line === 'readyok') {
        this.triggerListeners('readyok', '');
      } else if (line.startsWith('id')) {
        this.triggerListeners('identify', line);
      }
    }
  }

  private triggerListeners(event: string, data: string): void {
    if (!this.listeners[event]) return;
    for (const listener of this.listeners[event]) {
      listener(data);
    }
  }

  public sendCommand(command: string): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(command);
    } else {
      console.error('WebSocket is not open');
    }
  }

  public on(event: string, callback: (data: string) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public close(): void {
    this.socket.close();
  }
}
