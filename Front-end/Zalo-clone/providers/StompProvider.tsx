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
  sendReaction: (conversationId: number, messageId: number, reaction: string, action: 'add' | 'remove') => void;
}

const StompContext = createContext<StompContextValue | undefined>(undefined);

export function StompProvider({ children }: { children: ReactNode }) {
  const { status, token } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !token) {
      if (clientRef.current) {
        console.log('[STOMP] Deactivating client - not authenticated');
        clientRef.current.deactivate();
        clientRef.current = null;
      }

      setConnected(false);
      return;
    }

    // Đóng connection cũ trước khi tạo mới
    if (clientRef.current) {
      console.log('[STOMP] Deactivating old client before creating new one');
      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
    }

    // Dùng origin (protocol + host + port) cho WebSocket, loại bỏ phần path (/api/v1)
    let wsOrigin = BASE_URL;
    try {
      const parsed = new URL(BASE_URL);
      wsOrigin = parsed.origin;
    } catch (err) {
      console.warn('[STOMP] Invalid BASE_URL, fallback to raw value:', BASE_URL, err);
    }

    if (wsOrigin.startsWith('http')) {
      wsOrigin = wsOrigin.replace(/^http/, 'ws');
    }

    const STOMP_ENDPOINT = '/ws';
    const wsUrl = `${wsOrigin}${STOMP_ENDPOINT}?access_token=${encodeURIComponent(token)}`;

    console.log('[STOMP] Creating new WebSocket client with URL:', wsUrl.replace(/\?access_token=.*/, '?access_token=***'));

    const client = new Client({
      // Dùng WebSocket thuần, KHÔNG dùng SockJS để tránh CORS
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        access_token: token,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (frame) => {
        if (__DEV__) {
          console.log(`[STOMP] ${frame}`);
        }
      },
    });

    client.onConnect = (frame) => {
      console.log('✅ [STOMP] Connected to WebSocket', frame);
      setConnected(true);
    };

    client.onDisconnect = () => {
      console.log('❌ [STOMP] Disconnected from WebSocket');
      setConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('⚠️ [STOMP] STOMP Error:', {
        command: frame.command,
        headers: frame.headers,
        body: frame.body,
      });
      setConnected(false);
    };

    client.onWebSocketError = (event) => {
      console.error('⚠️ [STOMP] WebSocket error', event);
      setConnected(false);
    };

    client.onWebSocketClose = (event) => {
      console.log('🔌 [STOMP] WebSocket closed', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
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
      publish(`/app/chat/${conversationId}`, JSON.stringify({
        conversationId,
        content,
        messageType,
      }));
    },
    [publish],
  );

  // Helper: Gửi typing indicator
  const sendTypingIndicator = useCallback(
    (conversationId: number) => {
      publish(`/app/chat.typing/${conversationId}`, JSON.stringify({
        conversationId,
      }));
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

  // Helper: Gửi reaction
  const sendReaction = useCallback(
    (conversationId: number, messageId: number, reaction: string, action: 'add' | 'remove') => {
      console.log('📤 [STOMP] Sending reaction:', { conversationId, messageId, reaction, action });
      publish(
        `/app/chat.reaction/${conversationId}`,
        JSON.stringify({
          messageId,
          reaction,
          action,
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
      sendReaction,
    }), 
    [connected, publish, subscribe, sendMessage, sendTypingIndicator, markAsRead, sendReaction],
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