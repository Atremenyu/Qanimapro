import { Composition, VectorLayer } from '../types';

export type SyncMessageType =
  | 'SYNC_COMPOSITION'
  | 'SYNC_LAYER_UPDATE'
  | 'SYNC_PLAYHEAD'
  | 'SYNC_SELECTION'
  | 'SYNC_PRESENCE'
  | 'PING'
  | 'PONG';

export interface SyncMessage {
  type: SyncMessageType;
  senderId: string;
  senderName: string;
  timestamp: number;
  payload?: any;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'local-sync';

type MessageCallback = (msg: SyncMessage) => void;

class RealtimeSyncService {
  private static instance: RealtimeSyncService;
  private ws: WebSocket | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<MessageCallback> = new Set();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();

  public clientId: string = 'peer_' + Math.random().toString(36).substring(2, 9);
  public clientName: string = 'Colaborador ' + Math.floor(100 + Math.random() * 900);
  public serverUrl: string = '';
  public status: ConnectionStatus = 'local-sync';
  public isSyncEnabled: boolean = true;
  public activePeers: Map<string, { id: string; name: string; lastSeen: number; cursor?: { x: number; y: number } }> = new Map();

  private constructor() {
    this.initBroadcastChannel();
  }

  public static getInstance(): RealtimeSyncService {
    if (!RealtimeSyncService.instance) {
      RealtimeSyncService.instance = new RealtimeSyncService();
    }
    return RealtimeSyncService.instance;
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('vectormotion_sync_channel');
        this.broadcastChannel.onmessage = (event: MessageEvent<SyncMessage>) => {
          if (!this.isSyncEnabled) return;
          const msg = event.data;
          if (msg && msg.senderId !== this.clientId) {
            this.handleIncomingMessage(msg);
          }
        };
        this.updateStatus('local-sync');
      } catch (err) {
        console.warn('BroadcastChannel not supported or restricted:', err);
      }
    }
  }

  public connectWebSocket(url: string) {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }

    if (!url || !url.trim()) {
      this.serverUrl = '';
      this.updateStatus('local-sync');
      return;
    }

    this.serverUrl = url.trim();
    this.updateStatus('connecting');

    try {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        this.updateStatus('connected');
        this.broadcast({
          type: 'SYNC_PRESENCE',
          payload: { action: 'join' },
        });
      };

      this.ws.onmessage = (event) => {
        if (!this.isSyncEnabled) return;
        try {
          const msg: SyncMessage = JSON.parse(event.data);
          if (msg && msg.senderId !== this.clientId) {
            this.handleIncomingMessage(msg);
          }
        } catch {
          // ignore non-json messages
        }
      };

      this.ws.onclose = () => {
        this.updateStatus(this.broadcastChannel ? 'local-sync' : 'disconnected');
      };

      this.ws.onerror = () => {
        this.updateStatus(this.broadcastChannel ? 'local-sync' : 'disconnected');
      };
    } catch (err) {
      console.warn('WebSocket connection error:', err);
      this.updateStatus(this.broadcastChannel ? 'local-sync' : 'disconnected');
    }
  }

  public disconnectWebSocket() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }
    this.serverUrl = '';
    this.updateStatus(this.broadcastChannel ? 'local-sync' : 'disconnected');
  }

  public broadcast(partialMsg: { type: SyncMessageType; payload?: any }) {
    if (!this.isSyncEnabled) return;

    const fullMsg: SyncMessage = {
      type: partialMsg.type,
      senderId: this.clientId,
      senderName: this.clientName,
      timestamp: Date.now(),
      payload: partialMsg.payload,
    };

    // 1. Broadcast to other tabs in the same browser (Zero config, works on Netlify)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(fullMsg);
      } catch {
        // ignore
      }
    }

    // 2. Broadcast via WebSocket if connected to remote server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(fullMsg));
      } catch {
        // ignore
      }
    }
  }

  private handleIncomingMessage(msg: SyncMessage) {
    // Track peer presence
    if (msg.senderId) {
      this.activePeers.set(msg.senderId, {
        id: msg.senderId,
        name: msg.senderName || 'Colaborador',
        lastSeen: Date.now(),
        cursor: msg.type === 'SYNC_PRESENCE' ? msg.payload?.cursor : undefined,
      });
    }

    // Notify all listeners
    this.listeners.forEach((callback) => {
      try {
        callback(msg);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  private updateStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((cb) => cb(newStatus));
  }

  public subscribe(callback: MessageCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }
}

export const realtimeSync = RealtimeSyncService.getInstance();
