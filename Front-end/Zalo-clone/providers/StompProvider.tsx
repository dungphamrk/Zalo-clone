import { Client, type IMessage } from '@stomp/stompjs';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { BASE_URL } from '@/utils/axios-instance';
import { useAuth } from '@/hooks/auth/useAuth';

interface StompContextValue {
  connected: boolean;
  subscribe: (destination: string, callback: (message: IMessage) => void) => () => void;
  publish: (destination: string, body: string, headers?: Record<string, string>) => void;
  // Helper methods cho chat
  sendMessage: (conversationId: number, content: string, messageType?: string) => void;
  sendTypingIndicator: (conversationId: number) => void;
  markAsRead: (messageId: number, conversationId: number) => void;
}

const StompContext = createContext<StompContextValue | undefined>(undefined);

export function StompProvider({ children }: { children: ReactNode }) {
  const { status, token } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !token) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }

      setConnected(false);
      return;
    }

    // Chuyển ws:// thành ws:// hoặc wss:// (không cần convert sang http)
    const wsUrl = BASE_URL.startsWith('http') 
      ? BASE_URL.replace(/^http/, 'ws')
      : BASE_URL;
    const STOMP_ENDPOINT = '/ws';
    const client = new Client({
      // Dùng WebSocket thuần, KHÔNG dùng SockJS để tránh CORS
      brokerURL: `${wsUrl}${STOMP_ENDPOINT}?access_token=${token}`,
      connectHeaders: { 
        Authorization: `Bearer ${token}` 
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (frame) => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(`[STOMP] ${frame}`);
        }
      },
    });

    client.onConnect = () => {
      console.log('✅ [STOMP] Connected to WebSocket');
      setConnected(true);
    };

    client.onDisconnect = () => {
      console.log('❌ [STOMP] Disconnected from WebSocket');
      setConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('⚠️ [STOMP] Error:', frame.headers['message'], frame.body);
      console.warn('STOMP error', frame.headers['message'], frame.body);
    };

    client.onWebSocketClose = () => {
      console.log('🔌 [STOMP] WebSocket closed');
      setConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      setConnected(false);
      client.deactivate();
      clientRef.current = null;
    };
  }, [status, token]);

  const subscribe = useCallback(
    (destination: string, callback: (message: IMessage) => void) => {
      if (!clientRef.current) {
        console.warn('⚠️ [STOMP] Subscribe failed: No client');
        return () => {};
}

      if (!connected) {
        console.warn('⚠️ [STOMP] Subscribe failed: Not connected');
        return () => {};
      }

      console.log('📡 [STOMP] Subscribing to:', destination);
      const subscription = clientRef.current.subscribe(destination, (message) => {
        console.log('📨 [STOMP] Message received from:', destination);
        callback(message);
      });

      return () => {
        console.log('🔕 [STOMP] Unsubscribing from:', destination);
        subscription.unsubscribe();
      };
    },
    [connected],
  );

  const publish = useCallback(
    (destination: string, body: string, headers?: Record<string, string>) => {
      if (!clientRef.current || !connected) {
        console.warn('STOMP publish attempted without active connection');
        return;
      }

      clientRef.current.publish({ destination, body, headers });
    },
    [connected],
  );

  // Helper: Gửi tin nhắn qua WebSocket
  const sendMessage = useCallback(
    (conversationId: number, content: string, messageType: string = 'TEXT') => {
      console.log('📤 [STOMP] Sending message:', { conversationId, content, messageType });
      publish(
        '/app/chat.send',
        JSON.stringify({
          conversationId,
          content,
          messageType,
        }),
      );
    },
    [publish],
  );

  // Helper: Gửi typing indicator
  const sendTypingIndicator = useCallback(
    (conversationId: number) => {
      publish(
        '/app/chat.typing',
        JSON.stringify({
          conversationId,
        }),
      );
    },
    [publish],
  );

  // Helper: Đánh dấu tin nhắn đã đọc
  const markAsRead = useCallback(
    (messageId: number, conversationId: number) => {
      publish(
        '/app/chat.read',
        JSON.stringify({
          id: messageId,
          conversationId,
        }),
      );
    },
    [publish],
  );

  const value = useMemo<StompContextValue>(
    () => ({ 
      connected, 
      subscribe, 
      publish,
      sendMessage,
      sendTypingIndicator,
      markAsRead,
    }), 
    [connected, publish, subscribe, sendMessage, sendTypingIndicator, markAsRead],
  );

  return <StompContext.Provider value={value}>{children}</StompContext.Provider>;
}

export function useStomp() {
  const context = useContext(StompContext);

  if (!context) {
    throw new Error('useStomp phải được sử dụng bên trong StompProvider');
  }

  return context;
}