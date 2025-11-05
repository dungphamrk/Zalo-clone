import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Image, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';

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

export default function ChatScreen() {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState("");
  const [isMenu, setIsMenu] = useState(false);
  const [callType, setCallType] = useState<CallType>(undefined);
  const flatRef = useRef<FlatList<any>>(null);
  const router = useRouter();

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { id: String(Date.now()), text: input, fromMe: true }]);
      setInput("");
      setTimeout(() => {
        flatRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  return (
    <View style={styles.container}>
      {/* Header giống zalo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerButton}>{'<'}</Text>
        </TouchableOpacity>
        <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.headerAvatar} />
        <View style={{ flex: 1}}>
          <Text style={styles.headerTitle}>Nguyễn Văn A</Text>
          <Text style={styles.headerStatus}>Đang hoạt động</Text>
        </View>
        <TouchableOpacity onPress={() => setCallType('audio')}>
          <Text style={styles.headerButton}>📞</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsMenu(true)}>
          <Text style={styles.headerButton}>⋯</Text>
        </TouchableOpacity>
      </View>
      {/* Message list */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageBox, item.fromMe ? styles.messageMe : styles.messageOther] }>
            {!item.fromMe && <Image source={{ uri: item.avatar }} style={styles.messageAvatar} />}
            <View style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleOther]}>
              <Text style={item.fromMe ? styles.textMe : styles.textOther}>{item.text}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 10, paddingBottom: 70 }}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
      />
      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={70} style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="Nhập tin nhắn..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Gửi</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      <MoreOptions
        visible={isMenu}
        onClose={() => setIsMenu(false)}
        onCall={() => { setIsMenu(false); setCallType('audio'); }}
        onVideo={() => { setIsMenu(false); setCallType('video'); }}
      />
      <CallScreen
        visible={!!callType}
        type={callType}
        onEnd={() => setCallType(undefined)}
      />
    </View>
  );
}

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
