import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, Pressable, Animated, Modal, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { useChats, Conversation } from '@/hooks'; // Đảm bảo đường dẫn đúng
import * as ImagePicker from 'expo-image-picker';

// Thêm giao diện đơn giản cho Friend (dùng cho dữ liệu giả)
interface Friend {
  id: string;
  name: string;
  avatar: string;
}

// Bổ sung dữ liệu giả cho friends
const DUMMY_FRIENDS: Friend[] = [
  { id: 'f1', name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 'f2', name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 'f3', name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 'f4', name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 'f5', name: 'Hoàng Văn E', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 'f6', name: 'Đỗ Thị G', avatar: 'https://i.pravatar.cc/150?img=6' },
  { id: 'f7', name: 'Võ Văn H', avatar: 'https://i.pravatar.cc/150?img=7' },
  { id: 'f8', name: 'Cao Thị I', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: 'f9', name: 'Bùi Văn K', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: 'f10', name: 'Lý Thị L', avatar: 'https://i.pravatar.cc/150?img=10' },
];

const DEFAULT_GROUP_AVATAR = 'https://via.placeholder.com/150/028fe7/ffffff?text=Group';

export default function MessageScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(0);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  // Animated shadow for search bar
  const shadowAnim = useRef(new Animated.Value(2)).current;

  // hook cung cấp danh sách conversations + hành động markAsRead
  // Đảm bảo createGroup có kiểu đúng
  const { chats, markAsRead, unreadCount, friends: actualFriends, createGroup } = useChats(); 

  const filteredChats = chats.filter((item: Conversation) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.lastMessage.toLowerCase().includes(search.toLowerCase()) ||
      (item.phone || '').includes(search);
    if (activeFilter === 1) return matchesSearch && !!item.unread; // Unread
    if (activeFilter === 2) return matchesSearch && !!item.isGroup; // Groups
    return matchesSearch; // All
  });

  const animateShadow = (toVal: number) => {
    Animated.timing(shadowAnim, {
      toValue: toVal,
      duration: 260,
      useNativeDriver: false,
    }).start();
  };

  const onOpenChat = (chatId: string) => {
    markAsRead(chatId); // thực hiện đọc trước khi điều hướng
    router.push({ pathname: '/chat', params: { chatId } });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top","left","right"]}>
      <View style={styles.container}>
        {/* Unified header: title + actions + search */}
        <Animated.View style={[styles.headerMerged, { elevation: shadowAnim, shadowOpacity: shadowAnim.interpolate({ inputRange: [2,5], outputRange: [0.02,0.14] }) }] }>
          <View style={styles.headerTopRow}>
            <Text style={styles.headerTitle}>Tin nhắn</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable style={{ marginRight: 10 }}>
                <Feather name="grid" size={22} color="#fff" />
              </Pressable>
              <Pressable style={{ marginRight: 10 }} onPress={() => setShowNotification(true)}>
                <Ionicons name="notifications-outline" size={22} color="#fff" />
                {unreadCount > 0 && (
                  <View style={styles.redDotHeader}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{unreadCount}</Text>
                  </View>
                )}
              </Pressable>
              <Pressable style={{ marginRight: 4 }} onPress={() => setShowCreateGroup(true)}>
                <Ionicons name="people-outline" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>

          <View style={styles.searchRow}>
            <Feather name="search" size={18} color="#2994f2" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm kiếm tin nhắn hoặc số điện thoại"
              placeholderTextColor="#7b868c"
              onFocus={() => animateShadow(5)}
              onBlur={() => animateShadow(2)}
            />
          </View>
        </Animated.View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {['Tất cả','Chưa đọc','Nhóm'].map((x, i) => (
            <Animatable.View key={x} animation={activeFilter === i ? 'pulse' : undefined} duration={320} useNativeDriver>
              <Pressable
                style={[styles.filterBtn, activeFilter === i && styles.filterActive]}
                onPress={() => setActiveFilter(i)}
              >
                <Text style={[ activeFilter === i ? { color:'#fff', fontWeight:'700' } : { color: '#2994f2' } ]}>{x}</Text>
              </Pressable>
            </Animatable.View>
          ))}
        </View>

        {/* Chat list */}
        <FlatList
          data={filteredChats}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <Animatable.View animation="fadeInUp" delay={index * 40} duration={360}>
              <Pressable
                style={({ pressed }) => [
                  styles.chatItem,
                  item.unread ? styles.chatItemUnread : null,
                  pressed && { transform: [{ scale: 0.985 }] }
                ]}
                onPress={() => onOpenChat(item.id)}
              >
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.chatInfo}>
                  <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                    <Text style={[styles.userName, item.unread && { fontWeight: '800' }]}>{item.name}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                  </View>
                  <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                    <Text style={[styles.lastMessage, item.unread && { color: '#0a0a0a', fontWeight:'600' }]} numberOfLines={1}>
                      {item.lastMessage}
                    </Text>
                    {item.unread && <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>Mới</Text></View>}
                  </View>
                </View>
              </Pressable>
            </Animatable.View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        friends={DUMMY_FRIENDS} // Sử dụng DUMMY_FRIENDS cho hiển thị
        onCreate={(name, memberIds, avatar) => {
          // Gọi createGroup từ hook đã được cập nhật
          if (createGroup) {
            createGroup(name, memberIds, avatar); 
          } else {
            console.log("Creating group:", name, memberIds, avatar);
          }
          setShowCreateGroup(false);
        }}
      />
      <NotificationModal visible={showNotification} onClose={() => setShowNotification(false)} />
    </SafeAreaView>
  );
}

function CreateGroupModal({ visible, onClose, friends, onCreate }: { visible: boolean; onClose: () => void; friends: Friend[]; onCreate: (name: string, memberIds: string[], avatar: string) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');
  // Khởi tạo groupAvatar với DEFAULT_GROUP_AVATAR
  const [groupAvatar, setGroupAvatar] = useState(DEFAULT_GROUP_AVATAR); 

  // Reset state khi modal mở/đóng để tránh dữ liệu cũ
  React.useEffect(() => {
    if (visible) {
      setSelected([]);
      setGroupName('');
      setSearch('');
      setGroupAvatar(DEFAULT_GROUP_AVATAR); // Reset về avatar mặc định
    }
  }, [visible]);

  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  
  // Lọc bạn bè theo search
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(search.toLowerCase())
  );

  // HÀM CHỌN ẢNH TỪ THƯ VIỆN
  const pickImage = async () => {
    // Yêu cầu quyền truy cập thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để chọn ảnh đại diện.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Lấy URI của ảnh đã chọn và cập nhật state
      setGroupAvatar(result.assets[0].uri); 
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
        <View style={styles.modalBox} onStartShouldSetResponder={() => true}> 
          <Text style={styles.modalHeaderTitle}>Tạo nhóm mới</Text>

          {/* Avatar và Tên nhóm */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Pressable onPress={pickImage} style={{ marginRight: 12 }}>
              <Image source={{ uri: groupAvatar }} style={styles.groupAvatarPreview} />
              <View style={styles.cameraIconBadge}><Feather name="camera" size={12} color="#fff" /></View>
            </Pressable>
            <TextInput 
              value={groupName} 
              onChangeText={setGroupName} 
              placeholder="Tên nhóm (bắt buộc)" 
              placeholderTextColor="#999"
              style={[styles.input, { flex: 1, marginBottom: 0, marginTop: 0 }]} 
            />
          </View>

          {/* Thanh tìm kiếm bạn bè */}
          <View style={[styles.searchRow, { marginTop: 0, marginBottom: 8, height: 38, backgroundColor:'#f3f7f9', paddingHorizontal: 8 }]}>
            <Feather name="search" size={16} color="#6b7780" style={{ marginRight: 6 }} />
            <TextInput
              style={[styles.searchInput, { flex: 1, fontSize: 14, height: '100%' }]}
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm kiếm bạn bè"
              placeholderTextColor="#7b868c"
            />
          </View>
          
          <Text style={{ marginBottom: 6, color: '#6b7780', fontSize: 13 }}>Chọn thành viên ({selected.length}/{friends.length})</Text>
          
          {/* Danh sách bạn bè có scroll bar và max height */}
          <FlatList
            data={filteredFriends}
            keyExtractor={(i) => i.id}
            style={styles.friendsList}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
              <Pressable onPress={() => toggle(item.id)} style={({ pressed }) => [styles.friendItem, pressed && { opacity: 0.8 }] }>
                <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
                <Text style={styles.friendName}>{item.name}</Text>
                {/* Custom Checkbox */}
                <View style={[styles.customCheckbox, selected.includes(item.id) && styles.customCheckboxSelected]}>
                  {selected.includes(item.id) && <Ionicons name="checkmark-sharp" size={14} color="#fff" />}
                </View>
              </Pressable>
            )}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: 'center', color: '#999', padding: 10 }}>Không tìm thấy bạn bè nào.</Text>
            )}
          />
          
          {/* Nút Tạo nhóm */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 }}>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.modalBtn, pressed && { opacity: 0.8 }]}><Text style={styles.modalBtnText}>Hủy</Text></Pressable>
            <Pressable 
              onPress={() => { 
                if (groupName.trim() && selected.length) {
                  onCreate(groupName.trim(), selected, groupAvatar); 
                } else {
                  Alert.alert('Lỗi', 'Vui lòng nhập tên nhóm và chọn ít nhất một thành viên.');
                }
              }} 
              disabled={!groupName.trim() || selected.length === 0}
              style={({ pressed }) => [
                styles.modalPrimaryBtn, 
                (!groupName.trim() || selected.length === 0) && styles.modalPrimaryBtnDisabled,
                pressed && { opacity: 0.85 }
              ]}
            >
              <Text style={[styles.modalBtnText, { color: '#fff' }]}>Tạo ({selected.length})</Text>
            </Pressable>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

/* Restored Notification Modal (modernized) */
function NotificationModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const notifications = [
    { id: 'n1', title: 'Bạn có lời mời kết bạn mới', time: '1h' },
    { id: 'n2', title: 'Hệ thống: Bảo trì vào 00:00', time: '2d' },
    { id: 'n3', title: 'Tài khoản của bạn đã được xác minh', time: '2h' },
  ];
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
        <View style={[styles.modalBox, { maxHeight: 360 }] }>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight:'700', marginBottom:8, fontSize:16 }}>Thông báo</Text>
            <Pressable onPress={onClose}><Text style={{ color: '#2994f2' }}>Đóng</Text></Pressable>
          </View>
          <View style={{ height: 8 }} />
          {notifications.map(n => (
            <View key={n.id} style={[styles.nItem, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }] }>
              <View>
                <Text style={{ fontWeight:'600' }}>{n.title}</Text>
                <Text style={{ color:'#666', fontSize:12 }}>{n.time}</Text>
              </View>
              <Pressable style={{ padding:6 }}><Text style={{ color: '#2994f2' }}>Xem</Text></Pressable>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#028fe7' },
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
  },
  headerBox: {
    flexDirection: 'row', alignItems: 'center', height: 60, backgroundColor: '#028fe7',
    paddingHorizontal: 13, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, elevation: 3,
  },
  headerTitle: { color: '#fff', fontSize: 19, fontWeight: 'bold', flex: 1, letterSpacing: 0.7 },
  headerQr: { marginLeft: 2, marginRight: 6 },
  headerNoti: { marginLeft: 8, marginTop:2, position: 'relative' },
  redDot:{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'red', position: 'absolute', top: 2, right: 2, borderColor:'#fff', borderWidth:1 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 17, marginHorizontal: 14, marginTop: 9,
    marginBottom: 6, height: 40, paddingHorizontal: 11, shadowColor:'#111',shadowOpacity:0.03,shadowRadius:3,elevation:1
  },
  searchInput: { flex: 1, fontSize: 15, color: '#222', padding: 0 },

  filterRow: { flexDirection: 'row', marginBottom: 4, marginLeft: 15 },
  filterBtn: {
    fontSize: 14, color: '#2994f2', backgroundColor: '#e4f2fc',
    borderRadius: 10, paddingVertical: 4, paddingHorizontal: 11, marginRight: 7,
  },
  filterActive: {
    backgroundColor: '#2994f2', color: '#fff', fontWeight: 'bold',
  },
  chatItem: {
    flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff',
    marginHorizontal: 9, borderRadius: 13, marginTop: 7
  },
  chatItemUnread: {
    backgroundColor: '#e8f7ff',
    borderWidth: 0.5,
    borderColor: '#cdeefd'
  },
  avatar: {
    width: 54, height: 54, borderRadius: 27, marginRight: 12, backgroundColor: '#eee'
  },
  chatInfo: { flex: 1 },
  userName: {
    fontSize: 16, marginBottom: 2,
  },
  lastMessage: {
    color: '#666', fontSize: 14, flex: 1,
  },
  time: {
    color: '#b2b2b2', fontSize: 12, marginLeft: 8,
  },
  unreadBadge: {
    backgroundColor: '#ff6b6b', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginLeft: 8
  },
  unreadBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  separator: { height: 6 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 5 },
  nItem: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  modalClose: { marginTop: 10, alignSelf: 'flex-end' }
  ,
  /* merged header/search */
  headerMerged: { backgroundColor: '#028fe7', paddingHorizontal: 12, paddingBottom: 10, paddingTop: 8, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 10, marginTop: 8, height: 40 },
  redDotHeader: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'red', position: 'absolute', top: -6, right: -6, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' },

  /* modal small styles used in CreateGroup - UPDATED/ADDED */
  input: { borderWidth: 1, borderColor: '#e6eef5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginTop: 8, color: '#222' },
  modalHeaderTitle: { fontWeight: '700', fontSize: 18, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  modalBtn: { paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8 },
  modalPrimaryBtn: { paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8, backgroundColor: '#2994f2', borderRadius: 8 },
  modalPrimaryBtnDisabled: { backgroundColor: '#aedaff' }, // Style cho nút bị disable
  modalBtnText: { color: '#2994f2', fontWeight: '600' },
  
  // Create Group Modal specific styles
  groupAvatarPreview: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e9e9e9' },
  cameraIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2994f2', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' },
  friendsList: { maxHeight: 220, paddingRight: 6 }, 
  friendItem: { paddingVertical: 8, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  friendAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#eee' },
  friendName: { flex: 1, fontSize: 15 },
  customCheckbox: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  customCheckboxSelected: { backgroundColor: '#2994f2', borderColor: '#2994f2' },
});