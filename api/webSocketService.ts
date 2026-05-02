import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

const API_CORE_URL = Constants.expoConfig?.extra?.apiCoreUrl;

class WebSocketService {
  private socket: Socket | null = null;
  private url: string | undefined = API_CORE_URL;

  // Initialize WebSocket connection
  public initialize(token: string): void {
    if (!this.url) {
      console.error('No URL configured for WebSocket');
      return;
    }

    // Avoid reinitializing if already connected
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.disconnect();

    this.socket = io(this.url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log(`WebSocket connected to ${this.url}`);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error.message);
      setTimeout(() => this.initialize(token), 5000);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn(`No socket available for event: ${event}`);
    }
  }

  public off(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    } else {
      console.warn(`No socket available to remove event: ${event}`);
    }
  }

  public emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn(`No socket available to emit event: ${event}`);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('WebSocket disconnected');
    }
  }
}

export default new WebSocketService();