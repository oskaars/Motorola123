import WebSocketClient from '@/app/lib/websocket';
import { UciWebSocketClient } from '../src/app/lib/ws-client';

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  readyState: number = WebSocket.CONNECTING;
  send = jest.fn();

  constructor(url: string) {}

  // Helper to simulate receiving messages
  mockReceiveMessage(data: any) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }

  // Helper to simulate connection opening
  mockOpen() {
    if (this.onopen) {
      this.onopen();
    }
  }
}

// Replace global WebSocket with mock
global.WebSocket = MockWebSocket as any;

describe('WebSocketClient', () => {
  let client: WebSocketClient;
  let mockSocket: MockWebSocket;

  beforeEach(() => {
    client = new WebSocketClient('testUser');
    mockSocket = client['socket'] as unknown as MockWebSocket;
  });

  describe('Event Listeners', () => {
    it('should add and handle event listeners', () => {
      const mockCallback = jest.fn();
      client.addEventListener('TEST_EVENT', mockCallback);

      const testData = { type: 'TEST_EVENT', data: 'test' };
      mockSocket.mockReceiveMessage(testData);

      expect(mockCallback).toHaveBeenCalledWith(testData);
    });

    it('should remove event listeners', () => {
      const mockCallback = jest.fn();
      client.addEventListener('TEST_EVENT', mockCallback);
      client.removeEventListener('TEST_EVENT', mockCallback);

      const testData = { type: 'TEST_EVENT', data: 'test' };
      mockSocket.mockReceiveMessage(testData);

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Socket Setup', () => {
    it('should set socketReady to true when connected', () => {
      mockSocket.mockOpen();
      expect(client['socketReady']).toBe(true);
    });

    it('should handle room creation message', () => {
      const roomData = { type: 'ROOM_CREATED', roomId: '123' };
      mockSocket.mockReceiveMessage(roomData);
      expect(client['roomId']).toBe('123');
    });
  });

  describe('Room Operations', () => {
    it('should send create room message', () => {
      mockSocket.mockOpen();
      client.createRoom(300);

      expect(mockSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'CREATE_ROOM',
          username: 'testUser',
          timeInSeconds: 300
        })
      );
    });

    it('should send join room message', () => {
      mockSocket.mockOpen();
      client.joinRoom('123');

      expect(mockSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'JOIN_ROOM',
          roomId: '123',
          username: 'testUser'
        })
      );
    });
  });

  describe('Message Handling', () => {
    it('should handle malformed messages gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      if (mockSocket.onmessage) {
        mockSocket.onmessage({ data: 'invalid json' });
      }

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Connection Management', () => {
    it('should handle connection errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      if (mockSocket.onerror) {
        mockSocket.onerror(new Error('Test error'));
      }

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle disconnection', () => {
      if (mockSocket.onclose) {
        mockSocket.onclose();
      }
      expect(client['socketReady']).toBe(false);
    });
  });
});