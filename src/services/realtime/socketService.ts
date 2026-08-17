// GigEasy Real-Time WebSocket & Event Bus Service
// Dispatches and listens to live marketplace events (gigs, negotiations, check-in, payouts)

export type RealtimeEventName =
  | 'JOB_DISPATCHED'
  | 'APPLICATION_RECEIVED'
  | 'COUNTER_OFFER_RECEIVED'
  | 'WORKER_HIRED'
  | 'WORKER_CHECKED_IN'
  | 'SHIFT_COMPLETED'
  | 'PAYMENT_RELEASED';

export interface RealtimePayload<T = unknown> {
  event: RealtimeEventName;
  timestamp: string;
  data: T;
}

type EventListener<T = unknown> = (payload: RealtimePayload<T>) => void;

class RealtimeSocketService {
  private listeners: Map<RealtimeEventName, Set<EventListener<any>>> = new Map();
  private isConnected = true;

  subscribe<T = unknown>(event: RealtimeEventName, listener: EventListener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  emit<T = unknown>(event: RealtimeEventName, data: T) {
    const payload: RealtimePayload<T> = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((fn) => fn(payload));
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const realtimeSocket = new RealtimeSocketService();
