import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Image, Platform, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMessages, useChat } from '@/hooks';
import Toast from 'react-native-toast-message';
import * as Animatable from 'react-native-animatable';
import { useQueryClient } from '@tanstack/react-query';
import { chatKeys } from '@/hooks/chat/useChat';

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

const mockMessages = [
  { id: '1', text: 'Chào bạn!', fromMe: false, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '2', text: 'Chào bạn, hôm nay khỏe không?', fromMe: true },
  { id: '3', text: 'Mình khỏe, bạn thì sao?', fromMe: false, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '4', text: 'Mình ổn, cảm ơn nhé!', fromMe: true },
];

function MoreOptions({visible, onClose, onCall, onVideo}: MoreOptionsProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
        <View style={styles.menuBox}>
          <TouchableOpacity style={styles.menuItem} onPress={onCall}>
            <Text style={styles.menuIcon}>📞</Text>
            <Text style={styles.menuText}>Gọi thoại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onVideo}>
            <Text style={styles.menuIcon}>🎬</Text>
            <Text style={styles.menuText}>Gọi video</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider}/>
          <TouchableOpacity style={styles.menuItem}><Text style={styles.menuText}>Xoá đoạn chat</Text></TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}><Text style={styles.menuText}>Chặn bạn</Text></TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function CallScreen({ visible, onEnd, type }: CallScreenProps) {
  return (
    <Modal visible={visible} transparent animationType='slide'>
      <View style={styles.callScreen}>
        <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.callAvatar} />
        <Text style={styles.callName}>Nguyễn Văn A</Text>
        <Text style={{color:'#fff',opacity:0.7,marginBottom:30}}>{type === 'audio' ? 'Đang gọi...' : 'Đang gọi Video...'}</Text>
        <View style={styles.callActions}>
          <TouchableOpacity style={styles.callBtn}><Text style={styles.iconStyle}>🔇</Text></TouchableOpacity>
          {type === 'video' ? (
           <TouchableOpacity style={styles.callBtn}><Text style={styles.iconStyle}>📷</Text></TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.callBtn}><Text style={styles.iconStyle}>🔊</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.callBtn, { backgroundColor: '#ea2b2b'}]} onPress={onEnd}>
            <Text style={styles.iconStyle}>✖️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

// export default function ChatScreen() {
//   const params = useLocalSearchParams();
//   // chatId can come from route params. Fallback to '1' for demo/local behavior.
//   const chatId = (params?.chatId as string) || '1';

//   const { data: messagesData, isLoading, isError } = useMessages(chatId);
//   const { data: chatDetail } = useChat(chatId);
//   const sendMessageMutation = useSendMessage();
//   const { enqueueFailedMessage, connected, presenceMap, typingMap } = useSocket();
//   const queryClient = useQueryClient();
//   // Local input state only
//   const [input, setInput] = useState("");
//   const [isMenu, setIsMenu] = useState(false);
//   const [callType, setCallType] = useState<CallType>(undefined);
//   const flatRef = useRef<FlatList<any>>(null);
//   const router = useRouter();

//   const sendMessage = () => {
//     if (!input.trim()) return;

//     const payload = { chatId, text: input };

//     sendMessageMutation.mutate(payload, {
//       onError: () => {
//         // enqueue for retry if socket available; otherwise still enqueue
//         enqueueFailedMessage(payload);
//         Toast.show({ type: 'error', text1: 'Gửi tin nhắn thất bại', text2: 'Tin nhắn sẽ được gửi lại khi có kết nối' });
//       },
//       onSuccess: () => {
//         // optional success toast (we already optimistic update)
//         Toast.show({ type: 'success', text1: 'Đã gửi' });
//       },
//     });

//     setInput("");
//     // ensure we scroll to end after a tick
//     setTimeout(() => {
//       flatRef.current?.scrollToEnd({ animated: true });
//     }, 120);
//   };

//   // Smooth scroll to bottom when messages change
//   useEffect(() => {
//     // wait for layout to stabilize then scroll
//     const id = setTimeout(() => {
//       try {
//         flatRef.current?.scrollToEnd({ animated: true });
//       } catch {}
//     }, 60);
//     return () => clearTimeout(id);
//   }, [messagesData]);

//   // Realtime handled by SocketProvider which updates the react-query cache
//   return (
//     <View style={styles.container}>
//       {/* Header giống zalo */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Text style={styles.headerButton}>{'<'}</Text>
//         </TouchableOpacity>
//         <Image source={{ uri: chatDetail?.items.name || 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.headerAvatar} />
//         <View style={{ flex: 1}}>
//           <Text style={styles.headerTitle}>{chatDetail?.items.name || 'Người lạ'}</Text>
//           {
//             (() => {
//               const typingUsers = typingMap?.[chatId] || [];
//               const isTyping = typingUsers.length > 0;
//               const online = typeof presenceMap?.[chatId] === 'boolean' ? presenceMap[chatId] : connected;
//               return (
//                 <Text style={styles.headerStatus}>{isTyping ? 'Đang nhập...' : (online ? 'Đang hoạt động' : 'Offline')}</Text>
//               );
//             })()
//           }
//         </View>
//         <TouchableOpacity onPress={() => setCallType('audio')}>
//           <Text style={styles.headerButton}>📞</Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => setIsMenu(true)}>
//           <Text style={styles.headerButton}>⋯</Text>
//         </TouchableOpacity>
//       </View>
//       {/* Message list */}
//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#028fe7" />
//         </View>
//       ) : isError ? (
//         <View style={styles.loadingContainer}>
//           <Text style={{ marginBottom: 12 }}>Không tải được tin nhắn.</Text>
//           <TouchableOpacity onPress={() => queryClient.invalidateQueries({ queryKey: chatKeys.messages(chatId) })} style={styles.retryBtn}>
//             <Text style={{ color: '#fff' }}>Thử lại</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <FlatList
//           ref={flatRef}
//           data={messagesData || mockMessages}
//           keyExtractor={item => item.id}
//           renderItem={({ item, index }) => {
//             const arr = (messagesData || mockMessages) as any[];
//             const lastId = arr.length ? arr[arr.length - 1].id : undefined;
//             const animate = item.id === lastId;
//             return (
//               <Animatable.View
//                 animation={animate ? 'fadeInUp' : undefined}
//                 duration={160}
//                 useNativeDriver
//                 style={[styles.messageWrapper]}
//               >
//                 <View style={[styles.messageBox, item.fromMe ? styles.messageMe : styles.messageOther] }>
//                   {!item.fromMe && <Image source={{ uri: item.avatar }} style={styles.messageAvatar} />}
//                   <View style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleOther]}>
//                       <Text style={item.fromMe ? styles.textMe : styles.textOther}>{item.text}</Text>
//                       {item.queued ? (
//                         <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
//                           <Text style={styles.queuedText}>⏳ Đang chờ gửi</Text>
//                           <TouchableOpacity onPress={async () => {
//                             try {
//                               await removeQueueItem(item.id);
//                               // remove from cache
//                               queryClient.setQueryData(chatKeys.messages(item.chatId), (old: any[] = []) => old.filter(m => m.id !== item.id));
//                               Toast.show({ type: 'info', text1: 'Đã huỷ tin nhắn'});
//                             } catch {
//                               Toast.show({ type: 'error', text1: 'Không thể huỷ'});
//                             }
//                           }} style={{ marginLeft: 10 }}>
//                             <Text style={{ color: '#ff6b6b', fontWeight: '700' }}>Huỷ</Text>
//                           </TouchableOpacity>
//                         </View>
//                       ) : null}
//                     </View>
//                 </View>
//               </Animatable.View>
//             );
//           }}
//           contentContainerStyle={{ padding: 10, paddingBottom: 120 }}
//           onContentSizeChange={() => {
//             // small delay then smooth scroll
//             setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 40);
//           }}
//           onLayout={() => setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 20)}
//         />
//       )}
//       {/* Input - placed in normal flow so keyboard pushes content */}
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
//       >
//         <View style={styles.inputContainerInline}>
//           <TextInput
//             value={input}
//             onChangeText={setInput}
//             style={styles.input}
//             placeholder="Nhập tin nhắn..."
//           />
//           <TouchableOpacity
//             onPress={sendMessage}
//             style={[styles.sendButton, (sendMessageMutation.isPending || !input.trim()) && { opacity: 0.55 }]}
//             disabled={sendMessageMutation.isPending || !input.trim()}
//           >
//             {sendMessageMutation.isPending ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={{ color: 'white', fontWeight: 'bold' }}>Gửi</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//       <MoreOptions
//         visible={isMenu}
//         onClose={() => setIsMenu(false)}
//         onCall={() => { setIsMenu(false); setCallType('audio'); }}
//         onVideo={() => { setIsMenu(false); setCallType('video'); }}
//       />
//       <CallScreen
//         visible={!!callType}
//         type={callType}
//         onEnd={() => setCallType(undefined)}
//       />
//     </View>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingTop: Platform.OS === 'ios' ? 24 : 0,
    paddingHorizontal: 10,
    backgroundColor: '#028fe7',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e4e4e4',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  headerStatus: {
    color: '#cde6fe',
    fontSize: 12,
  },
  headerButton: {
    color: 'white',
    fontSize: 24,
    width: 34,
    textAlign: 'center',
  },
  messageBox: {
    flexDirection: 'row',
    marginVertical: 5,
    maxWidth: '85%',
  },
  messageMe: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageOther: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginHorizontal: 3,
    maxWidth: 250,
  },
  bubbleMe: {
    backgroundColor: '#d7f8eb',
    borderTopRightRadius: 5,
  },
  bubbleOther: {
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderColor: '#ececec',
    borderWidth: 1,
  },
  textMe: {
    color: '#3c3c3c',
    fontSize: 15,
  },
  textOther: {
    color: '#222',
    fontSize: 15,
  },
  queuedText: { fontSize: 11, color: '#6b6b6b', marginTop: 6 },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 3,
    marginTop: 'auto',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#028fe7',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainerInline: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  menuBox: {
    position: 'absolute',
    right: 16, top: 60,
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#333',
    shadowOpacity: 0.20,
    shadowRadius: 10,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 9
  },
  menuIcon: {
    fontSize: 20, marginRight: 8
  },
  menuText: {
    fontSize: 15, color: '#252525', fontWeight:'600'
  },
  menuDivider: {
    backgroundColor: '#eaeaea', height: 1, marginVertical: 7
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.13)'
  },
  callScreen: {
    flex:1, backgroundColor:'#1877f2', justifyContent:'center', alignItems:'center'
  },
  callAvatar: { width: 90, height: 90, borderRadius: 45, marginBottom:18, borderWidth:3, borderColor:'#fff'},
  callName: { color:'#fff', fontWeight:'bold', fontSize:21, marginBottom:4 },
  callActions: { flexDirection:'row', marginTop:35 },
  callBtn: {
    width: 54, height: 54,
    backgroundColor: '#253b80',
    borderRadius: 27,
    marginHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: { color:'#fff', fontSize:22 }
});
