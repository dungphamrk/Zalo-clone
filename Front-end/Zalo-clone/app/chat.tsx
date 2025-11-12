import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { useMessages, useChat, useChats } from '@/hooks';
import { chatKeys } from '@/hooks/chat/useChat';
import { useProfileQuery } from '@/hooks/profile/useProfile';
import { useStomp } from '@/providers/StompProvider';
import { MessageResponseDTO, MessageReactionResponse, ReactionSummary } from '@/types/interfaces/chat.interface';
import customAvatar from '@/utils/avatar';

const LinearGradientFallback = ({ children, style, colors, ...props }: any) => (
  <View style={[style, { backgroundColor: colors?.[0] || '#028fe7' }]} {...props}>
    {children}
  </View>
);
LinearGradientFallback.displayName = 'LinearGradientFallback';

// Try to use expo-linear-gradient if available
let LinearGradient: any = LinearGradientFallback;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expoLinearGradient = require('expo-linear-gradient');
  LinearGradient = expoLinearGradient.LinearGradient;
} catch {
  // Use fallback
  LinearGradient = LinearGradientFallback;
}

type MoreOptionsProps = {
  visible: boolean;
  onClose: () => void;
  onCall: () => void;
  onVideo: () => void;
};

type CallType = 'audio' | 'video' | undefined;

type CallScreenProps = {
  visible: boolean;
  onEnd: () => void;
  type: CallType;
};

const FALLBACK_AVATAR = customAvatar;
const FALLBACK_MEMBER_AVATAR = customAvatar;

// Common emoji reactions
const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

function MoreOptions({ visible, onClose, onCall, onVideo }: MoreOptionsProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
        <Animatable.View animation="fadeInDown" duration={200} style={styles.menuBox}>
          <TouchableOpacity style={styles.menuItem} onPress={onCall}>
            <Ionicons name="call" size={22} color="#028fe7" />
            <Text style={styles.menuText}>Gọi thoại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onVideo}>
            <Ionicons name="videocam" size={22} color="#028fe7" />
            <Text style={styles.menuText}>Gọi video</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="trash-outline" size={22} color="#ff4d4f" />
            <Text style={[styles.menuText, { color: '#ff4d4f' }]}>Xoá đoạn chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="ban-outline" size={22} color="#ff4d4f" />
            <Text style={[styles.menuText, { color: '#ff4d4f' }]}>Chặn bạn</Text>
          </TouchableOpacity>
        </Animatable.View>
      </TouchableOpacity>
    </Modal>
  );
}

function CallScreen({ visible, onEnd, type }: CallScreenProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.callScreen}>
        <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.callAvatar} />
        <Text style={styles.callName}>Nguyễn Văn A</Text>
        <Text style={{ color: '#fff', opacity: 0.7, marginBottom: 30 }}>
          {type === 'audio' ? 'Đang gọi...' : 'Đang gọi Video...'}
        </Text>
        <View style={styles.callActions}>
          <TouchableOpacity style={styles.callBtn}>
            <Ionicons name="volume-mute" size={24} color="#fff" />
          </TouchableOpacity>
          {type === 'video' ? (
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="camera-reverse" size={24} color="#fff" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.callBtn}>
            <Ionicons name="volume-high" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.callBtn, { backgroundColor: '#ea2b2b' }]} onPress={onEnd}>
            <Ionicons name="call" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Emoji Picker Component
function EmojiPicker({
  visible,
  onSelect,
  onClose,
  messageId,
  currentReactions,
  currentUserId,
}: {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  messageId: number;
  currentReactions?: MessageReactionResponse[];
  currentUserId?: number;
}) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.emojiPickerOverlay} activeOpacity={1} onPress={onClose}>
        <Animatable.View animation="bounceIn" style={styles.emojiPickerContainer}>
          <View style={styles.emojiPickerHeader}>
            <Text style={styles.emojiPickerTitle}>Thêm cảm xúc</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.emojiGrid}>
            {EMOJI_REACTIONS.map((emoji) => {
              const hasReacted = currentReactions?.some(
                (r) => r.reaction === emoji && r.userId === currentUserId,
              );
              return (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiButton, hasReacted && styles.emojiButtonActive]}
                  onPress={() => {
                    onSelect(emoji);
                    onClose();
                  }}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animatable.View>
      </TouchableOpacity>
    </Modal>
  );
}

// Reaction Display Component
function ReactionDisplay({
  reactions,
  summary,
  onPress,
  currentUserId,
}: {
  reactions?: MessageReactionResponse[];
  summary?: ReactionSummary;
  onPress: () => void;
  currentUserId?: number;
}) {
  if (!summary || summary.totalCount === 0) return null;

  const reactionGroups = Object.entries(summary.byType || {});
  if (reactionGroups.length === 0) return null;

  return (
    <Pressable onPress={onPress} style={styles.reactionContainer}>
      {reactionGroups.map(([emoji, count]) => (
        <View key={emoji} style={styles.reactionBadge}>
          <Text style={styles.reactionEmoji}>{emoji}</Text>
          {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
        </View>
      ))}
    </Pressable>
  );
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const chatId = (params?.chatId as string) || '';

  const router = useRouter();
  const queryClient = useQueryClient();
  const { subscribe, sendMessage: sendSocketMessage, connected, sendReaction } = useStomp();
  const { data: profile } = useProfileQuery();

  const {
    data: rawMessages = [],
    isLoading,
    isError,
    refetch,
    error: messagesError,
  } = useMessages(chatId);
  const { data: chatDetail } = useChat(chatId);
  const { markAsRead } = useChats();

  // Mark as read when chat screen is opened (only once)
  const hasMarkedAsRead = useRef(false);
  useEffect(() => {
    if (chatId && !hasMarkedAsRead.current) {
      markAsRead(chatId);
      hasMarkedAsRead.current = true;
    }
    // Reset when chatId changes
    return () => {
      hasMarkedAsRead.current = false;
    };
  }, [chatId]);

  const [input, setInput] = useState('');
  const [isMenu, setIsMenu] = useState(false);
  const [callType, setCallType] = useState<CallType>(undefined);
  const [realtimeMessages, setRealtimeMessages] = useState<MessageResponseDTO[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messagesMap, setMessagesMap] = useState<Map<number, MessageResponseDTO>>(new Map());

  const flatRef = useRef<FlatList<any>>(null);

  // Update messages map when rawMessages or realtimeMessages change
  useEffect(() => {
    const map = new Map<number, MessageResponseDTO>();
    [...rawMessages, ...realtimeMessages].forEach((msg) => {
      map.set(msg.id, msg);
    });
    setMessagesMap(map);
  }, [rawMessages, realtimeMessages]);

  // Subscribe to chat messages and reaction updates
  useEffect(() => {
    if (!chatId) {
      return;
    }
    
    // Memoize callback để tránh tạo function mới mỗi lần
    const messageHandler = (message: any) => {
      try {
        const payload = JSON.parse(message.body);
        console.log('[ChatScreen] Incoming payload', payload);

        // Handle REACTION_UPDATE
        if (payload.type === 'REACTION_UPDATE') {
          const { messageId: msgId, summary } = payload.payload;
          setMessagesMap((prev) => {
            const newMap = new Map(prev);
            const existing = newMap.get(msgId);
            if (existing) {
              newMap.set(msgId, {
                ...existing,
                reactionSummary: summary,
                reactions: summary?.recentByUsers || [],
              });
            }
            return newMap;
          });
          // Don't invalidate queries here - we're updating state directly
          // Only invalidate conversations list to update lastMessage
          queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
          return;
        }

        // Handle new message
        setRealtimeMessages((prev) => {
          const exists = prev.some((m) => m.id === payload.id);
          if (exists) {
            return prev;
          }
          return [...prev, payload];
        });
        // Don't invalidate messages query - we're using realtimeMessages state
        // Only invalidate conversations list to update lastMessage
        queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      } catch (error) {
        console.warn('[ChatScreen] Failed to parse incoming STOMP message', error);
      }
    };

    const unsubscribe = subscribe(`/topic/chat/${chatId}`, messageHandler);
    return unsubscribe;
    // Chỉ phụ thuộc vào chatId - subscribe và queryClient đã ổn định
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    if (!rawMessages || rawMessages.length === 0 || realtimeMessages.length === 0) {
      return;
    }
    const serverIds = new Set(rawMessages.map((msg) => msg.id));
    setRealtimeMessages((prev) => prev.filter((msg) => !serverIds.has(msg.id)));
  }, [rawMessages, realtimeMessages.length]);

  useEffect(() => {
    setRealtimeMessages([]);
  }, [chatId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        flatRef.current?.scrollToEnd({ animated: true });
      } catch (error) {
        console.warn('[ChatScreen] scrollToEnd error', error);
      }
    }, 80);
    return () => clearTimeout(timeout);
  }, [rawMessages]);

  const currentUserId = profile?.id;
  const currentDisplayName = profile?.displayName;

  const messages = useMemo(() => {
    const allMessages = Array.from(messagesMap.values());
    if (allMessages.length === 0) {
      return [];
    }
    const sorted = allMessages.sort(
      (a, b) => new Date(a.createdAt ?? '').getTime() - new Date(b.createdAt ?? '').getTime(),
    );
    return sorted.map((msg) => {
      const fromMe =
        currentUserId != null
          ? msg.senderId === currentUserId
          : currentDisplayName
            ? msg.senderName === currentDisplayName
            : false;

      return {
        id: String(msg.id),
        messageId: msg.id,
        text: msg.content ?? '',
        fromMe,
        avatar: msg.senderAvatar,
        senderName: msg.senderName,
        timestamp: msg.createdAt,
        replyToText: msg.replyTo?.content ?? undefined,
        reactions: msg.reactions || [],
        reactionSummary: msg.reactionSummary,
      };
    });
  }, [messagesMap, currentUserId, currentDisplayName]);

  const members = useMemo((): any[] => {
    const raw = (chatDetail as any)?.members;
    if (!raw) {
      return [];
    }
    return Array.isArray(raw) ? raw : Array.from(raw as any);
  }, [chatDetail]);

  const headerTitle = useMemo(() => {
    if (!chatDetail) return 'Tin nhắn';
    if (chatDetail.type === 'PRIVATE' && currentUserId) {
      const other = members.find((m: any) => m?.userId !== currentUserId);
      return other?.userName || chatDetail.title || 'Bạn bè';
    }
    return chatDetail.title || 'Nhóm';
  }, [chatDetail, members, currentUserId]);

  const headerAvatar = useMemo(() => {
    if (!chatDetail) return FALLBACK_AVATAR;
    if (chatDetail.type === 'PRIVATE' && currentUserId) {
      const other = members.find((m: any) => m?.userId !== currentUserId);
      return other?.avatarUrl || chatDetail.avatarUrl || null;
    }
    return chatDetail.avatarUrl || null;
  }, [chatDetail, members, currentUserId]);

  const handleRetry = () => refetch();

  const handleSendMessage = () => {
    if (!chatId || !input.trim()) {
      return;
    }
    if (!connected) {
      Toast.show({
        type: 'error',
        text1: 'Không thể gửi tin nhắn',
        text2: 'Kết nối máy chủ bị gián đoạn.',
      });
      return;
    }
    try {
      sendSocketMessage(Number(chatId), input.trim());
      setInput('');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Gửi thất bại',
        text2: String(error),
      });
    }
  };

  const handleReactionPress = (messageId: number) => {
    setSelectedMessageId(messageId);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (!selectedMessageId || !chatId || !currentUserId) return;

    const message = messagesMap.get(selectedMessageId);
    const hasReacted = message?.reactions?.some((r) => r.reaction === emoji && r.userId === currentUserId);

    if (hasReacted) {
      sendReaction(Number(chatId), selectedMessageId, emoji, 'remove');
    } else {
      sendReaction(Number(chatId), selectedMessageId, emoji, 'add');
    }
  };

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (isError && messagesError) {
      console.error('[ChatScreen] Failed to load messages:', messagesError);
    }
  }, [isError, messagesError]);

  const selectedMessage = selectedMessageId ? messagesMap.get(selectedMessageId) : null;

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#028fe7', '#0066cc']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image 
          source={headerAvatar && typeof headerAvatar === 'string' ? { uri: headerAvatar } : FALLBACK_AVATAR} 
          style={styles.headerAvatar} 
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <Text style={styles.headerStatus}>{connected ? 'Đang hoạt động' : 'Mất kết nối'}</Text>
        </View>
        <TouchableOpacity onPress={() => setCallType('audio')}>
          <Ionicons name="call" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsMenu(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#028fe7" />
        </View>
      ) : isError ? (
        <View style={styles.loadingContainer}>
          <Text style={{ marginBottom: 12, color: '#666' }}>Không tải được tin nhắn.</Text>
          {messagesError ? (
            <Text style={styles.errorMessage}>
              {(messagesError as Error).message ?? 'Đã xảy ra lỗi.'}
            </Text>
          ) : null}
          <TouchableOpacity onPress={handleRetry} style={styles.retryBtn}>
            <Text style={{ color: '#fff' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : hasMessages ? (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => {
            // Format timestamp
            const formatTime = (timestamp?: string) => {
              if (!timestamp) return '';
              const date = new Date(timestamp);
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMs / 3600000);
              const diffDays = Math.floor(diffMs / 86400000);

              if (diffMins < 1) return 'Vừa xong';
              if (diffMins < 60) return `${diffMins} phút trước`;
              if (diffHours < 24) return `${diffHours} giờ trước`;
              if (diffDays < 7) return `${diffDays} ngày trước`;
              
              // Format date
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const day = date.getDate();
              const month = date.getMonth() + 1;
              return `${hours}:${minutes} ${day}/${month}`;
            };

            const timeStr = formatTime(item.timestamp);
            const displayName = item.fromMe ? 'Bạn' : (item.senderName || 'Người dùng');
            const showSenderInfo = item.senderName || item.fromMe;

            return (
              <Animatable.View animation="fadeInUp" duration={200} useNativeDriver style={styles.messageWrapper}>
                <View style={[styles.messageBox, item.fromMe ? styles.messageMe : styles.messageOther]}>
                  {!item.fromMe && (
                    <Image
                      source={item.avatar ? { uri: item.avatar } : FALLBACK_MEMBER_AVATAR}
                      style={styles.messageAvatar}
                    />
                  )}
                  <View style={styles.messageContent}>
                    {showSenderInfo && (
                      <View style={[styles.messageHeader, item.fromMe && styles.messageHeaderRight]}>
                        <Text style={styles.senderName}>{displayName}</Text>
                        {timeStr && <Text style={styles.messageTimeInline}>{timeStr}</Text>}
                      </View>
                    )}
                    <Pressable
                      onLongPress={() => handleReactionPress(item.messageId)}
                      style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleOther]}
                    >
                      {item.replyToText ? (
                        <View style={styles.replyPreview}>
                          <Text style={styles.replyPreviewText} numberOfLines={2}>
                            {item.replyToText}
                          </Text>
                        </View>
                      ) : null}
                      <Text style={item.fromMe ? styles.textMe : styles.textOther}>{item.text}</Text>
                      <ReactionDisplay
                        reactions={item.reactions}
                        summary={item.reactionSummary}
                        onPress={() => handleReactionPress(item.messageId)}
                        currentUserId={currentUserId}
                      />
                    </Pressable>
                  </View>
                </View>
              </Animatable.View>
            );
          }}
          contentContainerStyle={{ padding: 10, paddingBottom: 120 }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Hãy bắt đầu cuộc trò chuyện</Text>
          <Text style={styles.emptySubtitle}>
            Gửi lời chào để kết nối với bạn bè ngay bây giờ.
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
      >
        <View style={styles.inputContainerInline}>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={[styles.sendButton, (!input.trim() || !connected) && { opacity: 0.55 }]}
            disabled={!input.trim() || !connected}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {!connected ? (
          <Text style={styles.connectionWarning}>
            Mất kết nối máy chủ, tin nhắn sẽ không gửi được.
          </Text>
        ) : null}
      </KeyboardAvoidingView>

      <EmojiPicker
        visible={showEmojiPicker}
        onSelect={handleEmojiSelect}
        onClose={() => {
          setShowEmojiPicker(false);
          setSelectedMessageId(null);
        }}
        messageId={selectedMessageId || 0}
        currentReactions={selectedMessage?.reactions}
        currentUserId={currentUserId}
      />

      <MoreOptions
        visible={isMenu}
        onClose={() => setIsMenu(false)}
        onCall={() => {
          setIsMenu(false);
          setCallType('audio');
        }}
        onVideo={() => {
          setIsMenu(false);
          setCallType('video');
        }}
      />
      <CallScreen visible={!!callType} type={callType} onEnd={() => setCallType(undefined)} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingTop: Platform.OS === 'ios' ? 24 : 0,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 17,
    color: '#fff',
  },
  headerStatus: {
    color: '#e3f2fd',
    fontSize: 12,
    marginTop: 2,
  },
  messageBox: {
    flexDirection: 'row',
    marginVertical: 4,
    maxWidth: '80%',
  },
  messageMe: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageOther: {
    alignSelf: 'flex-start',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  messageHeaderRight: {
    justifyContent: 'flex-end',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  messageTimeInline: {
    fontSize: 11,
    color: '#999',
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginHorizontal: 4,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bubbleMe: {
    backgroundColor: '#dcf8c6',
    borderTopRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  replyPreview: {
    borderLeftWidth: 3,
    borderLeftColor: '#028fe7',
    paddingLeft: 8,
    marginBottom: 6,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 4,
  },
  replyPreviewText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  textMe: {
    color: '#1a1a1a',
    fontSize: 15,
    lineHeight: 20,
  },
  textOther: {
    color: '#1a1a1a',
    fontSize: 15,
    lineHeight: 20,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 6,
    marginTop: 'auto',
    borderWidth: 2,
    borderColor: '#fff',
  },
  inputContainerInline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    marginRight: 8,
    maxHeight: 100,
    color: '#1a1a1a',
  },
  sendButton: {
    backgroundColor: '#028fe7',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#028fe7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  messageWrapper: {
    marginVertical: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryBtn: {
    backgroundColor: '#028fe7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#028fe7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  connectionWarning: {
    marginTop: 4,
    textAlign: 'center',
    color: '#ff6b6b',
    fontSize: 12,
    paddingBottom: 4,
  },
  errorMessage: {
    color: '#ff4d4f',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c2536',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6b7a8c',
    textAlign: 'center',
    lineHeight: 22,
  },
  menuBox: {
    position: 'absolute',
    right: 16,
    top: 60,
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#252525',
    fontWeight: '500',
    marginLeft: 12,
  },
  menuDivider: {
    backgroundColor: '#eaeaea',
    height: 1,
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  callScreen: {
    flex: 1,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#fff',
  },
  callName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 8,
  },
  callActions: {
    flexDirection: 'row',
    marginTop: 40,
  },
  callBtn: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 28,
    marginHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Emoji Picker Styles
  emojiPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    backgroundColor: '#f5f5f5',
  },
  emojiButtonActive: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#028fe7',
  },
  emojiText: {
    fontSize: 24,
  },
  // Reaction Display Styles
  reactionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
  },
});
