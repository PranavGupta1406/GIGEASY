// Real-Time Database Synchronization Manager for GigEasy
// Listens to live PostgreSQL CDC / WebSocket events and dispatches updates to client stores

import { supabase, hasValidSupabase, POSTGRES_CONFIG } from './postgresClient';
import { realtimeSocket, RealtimeEventName } from '../realtime/socketService';
import { Job, JobApplication } from '../../types';

class RealtimeDatabaseSyncManager {
  private isListening = false;
  private wsClient: WebSocket | null = null;
  private reconnectInterval: any = null;

  /**
   * Initialize real-time subscriptions
   */
  init() {
    if (this.isListening) return;
    this.isListening = true;

    if (hasValidSupabase && supabase) {
      this.initSupabaseRealtime();
    } else {
      this.initWebSocketRealtime();
    }
  }

  /**
   * Supabase PostgreSQL logical replication channel
   */
  private initSupabaseRealtime() {
    if (!supabase) return;

    try {
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'jobs' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              realtimeSocket.emit('JOB_DISPATCHED', payload.new as Job);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'job_applications' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              realtimeSocket.emit('APPLICATION_RECEIVED', payload.new as JobApplication);
            } else if (payload.eventType === 'UPDATE') {
              realtimeSocket.emit('COUNTER_OFFER_RECEIVED', payload.new);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase Realtime subscription error:', err);
    }
  }

  /**
   * Native WebSocket real-time subscription for self-hosted PostgreSQL backend
   */
  private initWebSocketRealtime() {
    if (typeof WebSocket === 'undefined') return;

    const connect = () => {
      try {
        const ws = new WebSocket(POSTGRES_CONFIG.wsUrl);
        this.wsClient = ws;

        ws.onopen = () => {
          if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event && data.payload) {
              realtimeSocket.emit(data.event as RealtimeEventName, data.payload);
            }
          } catch {}
        };

        ws.onerror = () => {
          ws.close();
        };

        ws.onclose = () => {
          if (!this.reconnectInterval) {
            this.reconnectInterval = setInterval(connect, 5000);
          }
        };
      } catch {
        if (!this.reconnectInterval) {
          this.reconnectInterval = setInterval(connect, 8000);
        }
      }
    };

    connect();
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = null;
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    this.isListening = false;
  }
}

export const realtimeDbSync = new RealtimeDatabaseSyncManager();
