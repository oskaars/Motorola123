import WebSocket from 'isomorphic-ws';

export class UciWebSocketClient {
  private ws: WebSocket | null = null;
  private clientId: string | null = null;
  private connected = false;
  private responseQueue: Map<string, { 
    resolve: (value: string[] | PromiseLike<string[]>) => void; 
    reject: (reason: unknown) => void;
    responses: string[];
  }> = new Map();
  private commandCounter = 0;

  constructor(private enginePath: string, private serverUrl = 'ws://127.0.0.1:3100/ws') {}

  public async initialize(): Promise<void> {
    if (this.connected) return;
    
    await this.connect();
    await this.sendCommand('uci');
    await this.sendCommand('isready');
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.serverUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connection established');
        };
        
        this.ws.onmessage = (event) => {
          const message = event.data.toString();
          
          if (message.startsWith('established:')) {
            this.clientId = message.substring('established:'.length);
            this.connected = true;
            console.log(`Connected with client ID: ${this.clientId}`);
            resolve();
            return;
          }
          
          for (const [cmdId, pendingCmd] of this.responseQueue.entries()) {
            pendingCmd.responses.push(message);
            
            if (message.startsWith('bestmove') || 
                message === 'readyok' || 
                message === 'uciok' || 
                message === 'ok') {
              pendingCmd.resolve(pendingCmd.responses);
              this.responseQueue.delete(cmdId);
              break;
            }
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
          this.connected = false;
          this.clientId = null;
        };
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        reject(error);
      }
    });
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async setOption(name: string, value: string): Promise<void> {
    const command = `setoption name ${name} value ${value}`;
    console.log(`Setting engine option: ${command}`);
    return this.sendCommand(command).then(() => undefined);
  }

  public async setPosition(fen: string): Promise<void> {
    await this.sendCommand(`position fen ${fen}`);
  }

  public async startSearch(depth = 15, movetime = 1000): Promise<string> {
    const responses = await this.sendCommand(`go depth ${depth} movetime ${movetime}`);
    
    const bestMoveResponse = responses.find(r => r.startsWith('bestmove'));
    if (!bestMoveResponse) {
      throw new Error('No bestmove found in engine response');
    }
    
    const bestMove = bestMoveResponse.split(' ')[1];
    return bestMove;
  }

  public async sendCommand(command: string): Promise<string[]> {
    if (!this.connected || !this.ws || !this.clientId) {
      await this.connect();
    }
    
    return new Promise((resolve, reject) => {
      try {
        const cmdId = `cmd_${this.commandCounter++}`;
        console.log(`Sending command [${cmdId}]: ${command}`);
        
        const timeoutId = setTimeout(() => {
          console.warn(`Command timeout [${cmdId}]: ${command}`);
          const pendingCmd = this.responseQueue.get(cmdId);
          if (pendingCmd) {
            this.responseQueue.delete(cmdId);
            if (pendingCmd.responses.length > 0) {
              resolve(pendingCmd.responses);
            } else {
              reject(new Error(`Command timed out without response: ${command}`));
            }
          }
        }, 7000);
        
        this.responseQueue.set(cmdId, { 
          resolve: (responses) => {
            clearTimeout(timeoutId);
            resolve(responses);
          }, 
          reject: (error) => {
            clearTimeout(timeoutId);
            reject(error);
          },
          responses: []
        });
        
        this.ws!.send(command);
        
        if (command.startsWith('setoption') || command === 'ucinewgame') {
          setTimeout(() => {
            const pendingCmd = this.responseQueue.get(cmdId);
            if (pendingCmd) {
              console.log(`Auto-completing command [${cmdId}]: ${command}`);
              pendingCmd.resolve(pendingCmd.responses);
              this.responseQueue.delete(cmdId);
            }
          }, 100);
        }
        
        if (command.startsWith('go')) {
          const intervalCheck = setInterval(() => {
            const pendingCmd = this.responseQueue.get(cmdId);
            if (!pendingCmd) {
              clearInterval(intervalCheck);
              return;
            }
              
            const hasBestMove = pendingCmd.responses.some(r => 
              r.startsWith('bestmove')
            );
              
            if (hasBestMove) {
              console.log(`Command completed [${cmdId}]: bestmove found`);
              pendingCmd.resolve(pendingCmd.responses);
              this.responseQueue.delete(cmdId);
              clearInterval(intervalCheck);
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(intervalCheck);
          }, 5000);
        }
      } catch (error) {
        console.error("Error sending command:", error);
        reject(error);
      }
    });
  }

  public async disconnect(): Promise<void> {
    if (this.ws && this.connected) {
      await this.sendCommand('quit');
      this.ws.close();
      this.ws = null;
      this.connected = false;
      this.clientId = null;
    }
  }
}
