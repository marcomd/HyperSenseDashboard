import { useEffect, useRef, useCallback, useState } from 'react';
import { createConsumer } from '@rails/actioncable';
import type { Consumer, Subscription } from '@rails/actioncable';
import type { WebSocketMessage, WebSocketMessageType } from '@/types';

type MessageHandler<T = unknown> = (message: WebSocketMessage<T>) => void;

interface UseWebSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

// WebSocket URL - in development, Vite proxies this to the Rails server
// When accessed via tunnel, connect directly to the backend tunnel
const getWebSocketUrl = () => {
  const backendTunnelUrl = import.meta.env.VITE_BACKEND_TUNNEL_URL;
  // If we're not on localhost and have a backend tunnel URL configured, use it
  if (backendTunnelUrl && !window.location.hostname.includes('localhost')) {
    // Convert http(s) to ws(s)
    const wsUrl = backendTunnelUrl.replace(/^http/, 'ws');
    return `${wsUrl}/cable`;
  }
  // Local development - use Vite proxy
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/cable`;
};

// Global consumer instance (singleton)
let consumer: Consumer | null = null;

const getConsumer = () => {
  if (!consumer) {
    consumer = createConsumer(getWebSocketUrl());
  }
  return consumer;
};

/**
 * Hook for subscribing to the Dashboard channel
 * Receives real-time updates for market data, positions, decisions, etc.
 */
export function useDashboardChannel(options?: UseWebSocketOptions) {
  const subscriptionRef = useRef<Subscription | null>(null);
  const handlersRef = useRef<Map<WebSocketMessageType, Set<MessageHandler>>>(new Map());
  const [connected, setConnected] = useState(false);

  // Register a handler for a specific message type
  const on = useCallback(<T>(type: WebSocketMessageType, handler: MessageHandler<T>) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler as MessageHandler);

    // Return unsubscribe function
    return () => {
      handlersRef.current.get(type)?.delete(handler as MessageHandler);
    };
  }, []);

  // Connect to the channel
  useEffect(() => {
    const cableConsumer = getConsumer();

    subscriptionRef.current = cableConsumer.subscriptions.create('DashboardChannel', {
      connected() {
        setConnected(true);
        options?.onConnect?.();
        console.log('[WebSocket] Connected to DashboardChannel');
      },

      disconnected() {
        setConnected(false);
        options?.onDisconnect?.();
        console.log('[WebSocket] Disconnected from DashboardChannel');
      },

      received(message: WebSocketMessage) {
        console.log('[WebSocket] Received:', message.type);
        const handlers = handlersRef.current.get(message.type);
        if (handlers) {
          handlers.forEach(handler => handler(message));
        }
      },
    });

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [options]);

  return { on, connected };
}

/**
 * Hook for subscribing to the Markets channel
 * Receives real-time price updates for specific symbols or all symbols
 */
export function useMarketsChannel(symbol?: string, options?: UseWebSocketOptions) {
  const subscriptionRef = useRef<Subscription | null>(null);
  const handlersRef = useRef<Set<MessageHandler>>(new Set());
  const [connected, setConnected] = useState(false);

  // Register a handler for market updates
  const onMarketUpdate = useCallback(<T>(handler: MessageHandler<T>) => {
    handlersRef.current.add(handler as MessageHandler);
    return () => {
      handlersRef.current.delete(handler as MessageHandler);
    };
  }, []);

  // Connect to the channel
  useEffect(() => {
    const cableConsumer = getConsumer();

    subscriptionRef.current = cableConsumer.subscriptions.create(
      { channel: 'MarketsChannel', symbol: symbol?.toUpperCase() },
      {
        connected() {
          setConnected(true);
          options?.onConnect?.();
          console.log(`[WebSocket] Connected to MarketsChannel${symbol ? `:${symbol}` : ''}`);
        },

        disconnected() {
          setConnected(false);
          options?.onDisconnect?.();
          console.log(`[WebSocket] Disconnected from MarketsChannel${symbol ? `:${symbol}` : ''}`);
        },

        received(message: WebSocketMessage) {
          handlersRef.current.forEach(handler => handler(message));
        },
      }
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [symbol, options]);

  return { onMarketUpdate, connected };
}

/**
 * Combined hook for dashboard real-time data
 * Provides a simpler API for common use cases
 */
export function useRealTimeData(options?: UseWebSocketOptions) {
  const { on, connected } = useDashboardChannel(options);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Track last update time
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    const trackUpdate = () => setLastUpdate(new Date());

    unsubscribes.push(on('market_update', trackUpdate));
    unsubscribes.push(on('position_update', trackUpdate));
    unsubscribes.push(on('decision_update', trackUpdate));
    unsubscribes.push(on('macro_strategy_update', trackUpdate));

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [on]);

  return { on, connected, lastUpdate };
}
