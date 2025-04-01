import { WebSocketClient } from '@/app/lib/websocket';
class MockWebSocket {
  url: string;
  onopen: Function | null = null;
  onmessage: Function | null = null;
  onclose: Function | null = null;
  onerror: Function | null = null;
  readyState: number = 0;
  CONNECTING: number = 0;
  OPEN: number = 1;
  CLOSING: number = 2;
  CLOSED: number = 3;
  
  constructor(url: string) {
    this.url = url;
  }

  send(data: string) {
  }

  close() {
  }
}

global.WebSocket = MockWebSocket as any;

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('WebSocketClient', () => {
  let wsClient: WebSocketClient;
  let mockSocket: MockWebSocket;

  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    
    wsClient = new WebSocketClient('testUser');

    mockSocket = (wsClient as any).socket;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it('initializes with the correct properties', () => {
    expect(wsClient.username).toBe('testUser');
    expect((wsClient as any).socketReady).toBe(false);
    expect((wsClient as any).listeners).toBeInstanceOf(Map);
    expect((wsClient as any).roomId).toBeNull();
  });

  it('connects to the WebSocket server', () => {
    expect(mockSocket.url).toBe('ws://api.gambit.plus:80');
  });

  it('changes state to ready when connection opens', () => {
    mockSocket.onopen!({} as Event);
    
    expect((wsClient as any).socketReady).toBe(true);
    expect(console.log).toHaveBeenCalledWith('WebSocket connected');
  });

  it('processes received messages', () => {
    const dispatchEventSpy = jest.spyOn(wsClient as any, 'dispatchEvent');
    
    mockSocket.onmessage!({
      data: JSON.stringify({ type: 'TEST_EVENT', data: 'test data' })
    } as MessageEvent);
    
    expect(console.log).toHaveBeenCalledWith(
      'Received message from server:',
      expect.objectContaining({ type: 'TEST_EVENT' })
    );
  });

  it('sets roomId when receiving ROOM_CREATED event', () => {
    mockSocket.onmessage!({
      data: JSON.stringify({ 
        type: 'ROOM_CREATED', 
        roomId: 'abc123'
      })
    } as MessageEvent);
    
    expect((wsClient as any).roomId).toBe('abc123');
    expect(console.log).toHaveBeenCalledWith('Set roomId to abc123');
  });

  it('sets roomId when receiving JOINED_ROOM event', () => {
    mockSocket.onmessage!({
      data: JSON.stringify({ 
        type: 'JOINED_ROOM', 
        roomId: 'xyz789'
      })
    } as MessageEvent);
    
    expect((wsClient as any).roomId).toBe('xyz789');
    expect(console.log).toHaveBeenCalledWith('Set roomId to xyz789');
  });

  it('handles WebSocket errors', () => {
    mockSocket.onerror!({ message: 'Connection failed' } as unknown as Event);
    
    expect(console.error).toHaveBeenCalledWith(
      'WebSocket error:',
      expect.objectContaining({ message: 'Connection failed' })
    );
  });

  it('handles WebSocket closing', () => {
    mockSocket.onclose!({} as CloseEvent);
    
    expect((wsClient as any).socketReady).toBe(false);
    expect(console.log).toHaveBeenCalledWith('WebSocket disconnected');
  });

  it('registers event listeners', () => {
    const mockHandler = jest.fn();
    
    wsClient.addEventListener('TEST_EVENT', mockHandler);
    
    expect((wsClient as any).listeners.get('TEST_EVENT')).toContain(mockHandler);
  });

  it('triggers event listeners when receiving a message', () => {
    const mockHandler = jest.fn();
    
    wsClient.addEventListener('TEST_EVENT', mockHandler);
    
    mockSocket.onmessage!({
      data: JSON.stringify({ type: 'TEST_EVENT', payload: 'test payload' })
    } as MessageEvent);
    
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({ 
        type: 'TEST_EVENT', 
        payload: 'test payload' 
      })
    );
  });

  it('handles JSON parse errors', () => {
    mockSocket.onmessage!({
      data: 'not valid json'
    } as MessageEvent);
    
    expect(console.error).toHaveBeenCalledWith(
      'Error processing message:',
      expect.any(Error)
    );
  });
});