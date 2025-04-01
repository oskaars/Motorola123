import WebSocket from 'isomorphic-ws';

export interface TimeControlParams {
  wtime?: number;    // White's remaining time in milliseconds
  btime?: number;    // Black's remaining time in milliseconds
  winc?: number;     // White's increment per move in milliseconds
  binc?: number;     // Black's increment per move in milliseconds
  movestogo?: number; // Moves to go until next time control
  movetime?: number;  // Time to spend on the move in milliseconds
  depth?: number;     // Search depth limit
}

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
  private connectionLostHandler: (() => void) | null = null;

  constructor(private enginePath: string, private serverUrl = 'ws://127.0.0.1:3100/ws') {}

  public onConnectionLost(callback: () => void): void {
    this.connectionLostHandler = callback;
  }

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
          this.connected = false;
          if (this.connectionLostHandler) {
            this.connectionLostHandler();
          }
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
          this.connected = false;
          this.clientId = null;
          if (this.connectionLostHandler) {
            this.connectionLostHandler();
          }
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

  public async startSearch(timeControl: TimeControlParams = {}): Promise<string> {
    const { depth = 15, movetime = 1000, wtime, btime, winc, binc, movestogo } = timeControl;

    let goCommand = 'go';

    if (wtime !== undefined) goCommand += ` wtime ${wtime}`;
    if (btime !== undefined) goCommand += ` btime ${btime}`;
    if (winc !== undefined) goCommand += ` winc ${winc}`;
    if (binc !== undefined) goCommand += ` binc ${binc}`;
    if (movestogo !== undefined) goCommand += ` movestogo ${movestogo}`;
    if (movetime !== undefined) goCommand += ` movetime ${movetime}`;
    if (depth !== undefined) goCommand += ` depth ${depth}`;

    const responses = await this.sendCommand(goCommand);

    const bestMoveResponse = responses.find(r => r.startsWith('bestmove'));
    if (!bestMoveResponse) {
      throw new Error('No bestmove found in engine response');
    }

    const bestMove = bestMoveResponse.split(' ')[1];
    return bestMove;
  }

  public async sendCommand(command: string): Promise<string[]> {
    if (!this.connected || !this.ws || !this.clientId) {
      try {
        await this.connect();
      } catch (error) {
        return Promise.reject(new Error("Failed to connect to WebSocket server" + error));
      }
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
      try {
        await this.sendCommand('quit');
      } catch (error) {
        console.warn('Error sending quit command:', error);
      }
      this.ws.close();
      this.ws = null;
      this.connected = false;
      this.clientId = null;
    }
  }
}
