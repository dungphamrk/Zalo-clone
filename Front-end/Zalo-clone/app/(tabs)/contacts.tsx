import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, Pressable, Animated, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Contact, FriendRequestIncoming, FriendRequestResponse, FriendRequestSent, UpdateContactRequest } from '@/types/interfaces/contact.interface'; // Import các type cần thiết
import { useQueryClient } from '@tanstack/react-query';
import { 
    useContacts, 
    useSearchContacts,
    useIncomingRequests,
    useOutgoingRequests,
    useSendFriendRequestMutation,
    // SỬA: Loại bỏ các hook cũ, sử dụng các hook đã ánh xạ chức năng
    useCreateContactMutation, // <--- Dùng để ACCEPT
    useUpdateContactMutation, // <--- Dùng để REJECT
    useCancelFriendRequestMutation,
    contactKeys
} from '@/hooks/contacts/useContacts'; 
import { useCreateOrGetPrivateChat, chatKeys as chatQueryKeys } from '@/hooks/chat/useChat';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import customAvatar from '@/utils/avatar';

interface AcceptRequestPayload {
    requestId: string;
}

function RequestsModal({ visible, onClose, onAccept, onReject, onCancel }: {
    visible: boolean;
    onClose: () => void;
    // SỬA: Kiểu dữ liệu tham số onAccept/onReject/onCancel phải là string (requestId)
    onAccept: (requestId: string) => void;
    onReject: (requestId: string) => void;
    onCancel: (requestId: string) => void;
}) {
    // Sử dụng hooks để lấy requests - chỉ fetch khi modal visible
    const { data: incoming = [], isLoading: loadingIncoming } = useIncomingRequests();
    const { data: outgoing = [], isLoading: loadingOutgoing } = useOutgoingRequests();
    
    const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
    
    // Memoize listData để tránh tạo array mới mỗi lần render
    const listData = useMemo<FriendRequestResponse[]>(() => {
        return activeTab === 'incoming' ? incoming : outgoing;
    }, [activeTab, incoming, outgoing]);
    
    const isLoading = loadingIncoming || loadingOutgoing;

  // Memoize renderRequestItem để tránh tạo function mới mỗi lần render
  const renderRequestItem = useCallback(({ item }: { item: FriendRequestResponse }) => {
    // 1. Xác định thông tin của đối phương dựa trên tab
    const isIncoming = activeTab === 'incoming';
    
    // Sử dụng type assertion hoặc kiểm tra cụ thể hơn nếu cần, 
    // nhưng cách an toàn nhất là kiểm tra sự tồn tại của trường
    const opponentId = isIncoming 
        ? (item as FriendRequestIncoming).id 
        : (item as FriendRequestSent).id;

    const opponentUsername = isIncoming 
        ? (item as FriendRequestIncoming).fromUsername 
        : (item as FriendRequestSent).toUsername;

    const opponentDisplayName = isIncoming 
        ? (item as FriendRequestIncoming).fromDisplayName || opponentUsername
        : (item as FriendRequestSent).toDisplayName || opponentUsername;

    const opponentAvatar = isIncoming 
        ? (item as FriendRequestIncoming).fromAvatar 
        : (item as FriendRequestSent).toAvatar;

    // 2. Render component với thông tin đã xác định
    return (
        <View style={requestModalStyles.requestItem}>
            <Image 
                source={opponentAvatar ? { uri: opponentAvatar } : customAvatar} 
                style={requestModalStyles.avatar} 
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={requestModalStyles.userName}>{opponentDisplayName}</Text>
                <Text style={requestModalStyles.phone}>@{opponentUsername}</Text> 
            </View>
            <View style={{ flexDirection: 'row' }}>
                {isIncoming ? (
                    <>
                        <Pressable 
                            // Chuyển ID đối phương thành string
                            onPress={() => onReject(opponentId.toString())} 
                            style={[requestModalStyles.btn, { backgroundColor: '#ff6b6b' }]}
                        >
                            <Text style={requestModalStyles.btnText}>Từ chối</Text>
                        </Pressable>
                        <Pressable 
                            // Chuyển ID đối phương thành string
                            onPress={() => onAccept(opponentId.toString())} 
                            style={[requestModalStyles.btn, { backgroundColor: '#4cd964', marginLeft: 8 }]}
                        >
                            <Text style={requestModalStyles.btnText}>Đồng ý</Text>
                        </Pressable>
                    </>
                ) : (
                    <Pressable 
                        // Chuyển ID đối phương thành string
                        onPress={() => onCancel(opponentId.toString())} 
                        style={[requestModalStyles.btn, { backgroundColor: '#aeb3b8' }]}
                    >
                        <Text style={requestModalStyles.btnText}>Hủy lời mời</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
  }, [activeTab, onAccept, onReject, onCancel]);
    return (
        <Modal transparent visible={visible} animationType="slide">
            <TouchableOpacity style={requestModalStyles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
                <View style={requestModalStyles.modalBox} onStartShouldSetResponder={() => true}>
                    <Text style={requestModalStyles.modalTitle}>Quản lý Lời mời Kết bạn</Text>
                    
                    {/* Tabs */}
                    <View style={requestModalStyles.tabContainer}>
                        <Pressable onPress={() => setActiveTab('incoming')} style={[requestModalStyles.tab, activeTab === 'incoming' && requestModalStyles.tabActive]}>
                            <Text style={[requestModalStyles.tabText, activeTab === 'incoming' && requestModalStyles.tabTextActive]}>Đến ({incoming.length})</Text>
                        </Pressable>
                        <Pressable onPress={() => setActiveTab('outgoing')} style={[requestModalStyles.tab, activeTab === 'outgoing' && requestModalStyles.tabActive]}>
                            <Text style={[requestModalStyles.tabText, activeTab === 'outgoing' && requestModalStyles.tabTextActive]}>Đi ({outgoing.length})</Text>
                        </Pressable>
                    </View>
                    
                    {isLoading ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#2994f2" />
                            <Text style={{ marginTop: 10, color: '#666' }}>Đang tải lời mời...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={listData}
                            // Sửa lỗi: Chuyển item.id (number) thành string
                            keyExtractor={item => item.id.toString()} 
                            renderItem={renderRequestItem}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={() => (
                                <Text style={{ textAlign: 'center', color: '#999', padding: 20 }}>Không có lời mời nào.</Text>
                            )}
                            style={{ maxHeight: 400 }}
                        />
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

// Giữ nguyên ProfileViewModal vì nó không liên quan đến logic mutation

function ProfileViewModal({ visible, onClose, contact, onStartChat }: { visible: boolean; onClose: () => void; contact: Contact | null; onStartChat: (contact: Contact) => void }) {
    if (!contact) return null;

    return (
        <Modal transparent visible={visible} animationType="slide">
            <TouchableOpacity style={requestModalStyles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
                <View style={[requestModalStyles.modalBox, { padding: 0 }]} onStartShouldSetResponder={() => true}>
                    <View style={profileModalStyles.header}>
                        <Image 
                          source={contact.avatarUrl ? { uri: contact.avatarUrl } : customAvatar} 
                          style={profileModalStyles.profileAvatar} 
                        />
                        <Text style={profileModalStyles.profileName}>{contact.friendName}</Text>
                        <Text style={profileModalStyles.profileUsername}>@{contact.username || 'N/A'}</Text>
                    </View>

                    <View style={profileModalStyles.body}>
                        <View style={profileModalStyles.infoRow}>
                            <Ionicons name="call-outline" size={20} color="#666" />
                            <Text style={profileModalStyles.infoText}>Số điện thoại: **{contact.username}**</Text>
                        </View>
                        <View style={profileModalStyles.infoRow}>
                            <Ionicons name="person-outline" size={20} color="#666" />
                            <Text style={profileModalStyles.infoText}>Trạng thái: **{contact.friend ? 'Bạn bè' : 'Người lạ'}**</Text>
                        </View>
                    </View>
                    
                    <View style={profileModalStyles.actionFooter}>
                        <Pressable style={profileModalStyles.footerBtn} onPress={() => onStartChat(contact)}>
                            <Ionicons name="chatbubble-ellipses-sharp" size={22} color="#2994f2" />
                            <Text style={profileModalStyles.footerText}>Nhắn tin</Text>
                        </Pressable>
                        <Pressable style={profileModalStyles.footerBtn} onPress={() => { Alert.alert('Chức năng Call'); onClose(); }}>
                            <Ionicons name="call-sharp" size={22} color="#4cd964" />
                            <Text style={profileModalStyles.footerText}>Gọi điện</Text>
                        </Pressable>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}



export default function ContactsScreen() {
    const [search, setSearch] = useState('');
    const [showRequestsModal, setShowRequestsModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const queryClient = useQueryClient();
    const router = useRouter();

    const shadowAnim = useRef(new Animated.Value(2)).current;

    // 1. FETCH DATA HOOKS
    const { data: friends = [], isLoading: loadingFriends, isError: errorFriends } = useContacts();
    
    const { data: searchResults = [], isLoading: loadingSearch } = useSearchContacts(search);
    const { data: incomingRequests = [] } = useIncomingRequests();
    const { data: outgoingRequests = [] } = useOutgoingRequests();

    
    // 2. MUTATION HOOKS (SỬ DỤNG CÁC HOOK ĐÃ ÁNH XẠ CHỨC NĂNG)
    const sendRequestMutation = useSendFriendRequestMutation();
    const acceptMutation = useCreateContactMutation(); // Dùng createContact để Accept
    const rejectMutation = useUpdateContactMutation(); // Dùng updateContact để Reject
    const cancelRequestMutation = useCancelFriendRequestMutation();
    const createChatMutation = useCreateOrGetPrivateChat();

    // 3. LOGIC Xử lý Requests (Sử dụng Mutations đã đổi tên và cấu trúc)
    // Memoize handlers để tránh tạo function mới mỗi lần render
    const handleAcceptRequest = useCallback((requestId: string) => {
        // SỬA LỖI: Sử dụng AcceptRequestPayload thay vì CreateContactRequest
        const data: AcceptRequestPayload = { requestId: requestId }; 
        
        // Ép kiểu (as any) để khớp với kiểu generic hiện tại của hook, 
        // vì hook này được dùng cho 2 mục đích.
        acceptMutation.mutate(data as any, { 
            onSuccess: () => {
                // Giữ modal mở để người dùng tiếp tục thao tác hoặc đóng nếu danh sách hết
                setShowRequestsModal(false); 
            },
            onError: (err) => console.error("Accept failed:", err),
        });
    }, [acceptMutation]);
    
    const handleRejectRequest = useCallback((requestId: string) => {
        // useUpdateContactMutation (Reject) mong đợi { requestId: string, data: UpdateContactRequest }
        const data: UpdateContactRequest = {}; // UpdateContactRequest có thể trống nếu chỉ cần ID để Từ chối
        
        rejectMutation.mutate({ requestId: requestId, data: data }, {
            onSuccess: () => {
                // Giữ modal mở
                setShowRequestsModal(false);
            },
            onError: (err) => console.error("Reject failed:", err),
        });
    }, [rejectMutation]);

    const handleCancelRequest = useCallback((id: string) => {
        // useCancelFriendRequestMutation mong đợi requestId (string)
        cancelRequestMutation.mutate(id, {
            onSuccess: () => {
                // Giữ modal mở
                setShowRequestsModal(false);
            },
            onError: (err) => console.error("Cancel failed:", err),
        });
    }, [cancelRequestMutation]);
    
    // Hàm mở Profile Modal
    const handleOpenProfile = (contact: Contact) => {
        setSelectedContact(contact);
        setShowProfileModal(true);
    };
    
    const handleStartChat = (contact: Contact) => {
        const rawId = contact.userId || contact.id;
        const otherUserId = Number(rawId);
        if (!rawId || Number.isNaN(otherUserId)) {
            Toast.show({
                type: 'error',
                text1: 'Không thể mở chat',
                text2: 'Thiếu thông tin người dùng.',
            });
            return;
        }
        createChatMutation.mutate(otherUserId, {
            onSuccess: (response) => {
                const conversationId = response.data?.items?.id;
                queryClient.invalidateQueries({ queryKey: chatQueryKeys.lists() });
                setShowProfileModal(false);
                if (conversationId) {
                    router.push({ pathname: '/chat', params: { chatId: String(conversationId) } });
                } else {
                    Toast.show({
                        type: 'info',
                        text1: 'Đã tạo cuộc trò chuyện',
                        text2: 'Mở danh sách tin nhắn để xem.',
                    });
                }
            },
            onError: (error: any) => {
                Toast.show({
                    type: 'error',
                    text1: 'Không thể tạo cuộc trò chuyện',
                    text2: error?.message || 'Đã xảy ra lỗi.',
                });
            },
        });
    };
    
    // Logic hiển thị danh sách (Giữ nguyên)
    // Memoize separator object để tránh tạo mới mỗi lần render
    const separatorContact = useMemo(() => ({
        id: 'sep1', 
        userId: 'sep1',
        friendName: 'Kết quả tìm kiếm chính xác', 
        avatarUrl: '', 
        isFriend: false, 
        username: '', 
        email: '',
        friend: false,  
        status: 'NEW' as const,
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
    } as Contact), []); // Chỉ tạo một lần

    const getDisplayContacts = useMemo(() => {
        const q = search.trim().toLowerCase();
        
        if (!q) return friends; 

        if (searchResults.length > 0) {
            const nonFriends = searchResults.filter(c => !c.friend);
            const existingFriends = searchResults.filter(c => c.friend);

            if (nonFriends.length > 0) {
                // Thêm một item Contact làm separator để phân biệt Search Result
                return [
                    ...existingFriends, 
                    separatorContact, 
                    ...nonFriends
                ];
            }
            return existingFriends;
        }
        return [];
    }, [search, friends, searchResults, separatorContact]);

    const sendFriendRequest = (rawId: string) => {
        if (!rawId || rawId.startsWith('sep')) {
            return;
        }
        const numericId = Number(rawId);
        if (Number.isNaN(numericId)) {
            console.warn('Invalid friend request target id:', rawId);
            return;
        }
        console.log('sendFriendRequest -> payload', { rawId, numericId, typeOfRaw: typeof rawId });
        // sendRequestMutation mong đợi FriendRequestDTO { toUserId: number, message?: string }
        sendRequestMutation.mutate(
            { toUserId: numericId },
            {
                onSuccess: () => {
                    if (search.trim()) {
                        queryClient.setQueryData<Contact[] | undefined>(
                            contactKeys.listSearch(search),
                            (old) => {
                                if (Array.isArray(old)) { 
                                    return old.map(contact =>
                                        contact.id === rawId
                                            ? { ...contact, status: 'PENDING', friend: false }
                                            : contact
                                    );
                                }
                                return old; 
                            }
                        );
                    }
                },
            }
        );
    };

    const animateShadow = (toVal: number) => {
        Animated.timing(shadowAnim, {
            toValue: toVal,
            duration: 240,
            useNativeDriver: false,
        }).start();
    };
    
    // Component hiển thị thông tin thống kê (Giữ nguyên)
    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statsItem}>
                <Ionicons name="people-sharp" size={24} color="#028fe7" />
                <Text style={styles.statsText}>{friends.length}</Text>
                <Text style={styles.statsLabel}>Tổng số bạn</Text>
            </View>
            <View style={styles.statsSeparator} />
            {/* Nút mở RequestsModal cho Lời mời đến */}
            <Pressable style={styles.statsItem} onPress={() => { setShowRequestsModal(true); }}>
                <Ionicons name="arrow-down-circle-sharp" size={24} color="#ff6b6b" />
                {incomingRequests.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{incomingRequests.length}</Text></View>}
                <Text style={styles.statsLabel}>Lời mời đến</Text>
            </Pressable>
            <View style={styles.statsSeparator} />
            {/* Nút mở RequestsModal cho Đã gửi đi */}
            <Pressable style={styles.statsItem} onPress={() => { setShowRequestsModal(true); }}>
                <Ionicons name="arrow-up-circle-sharp" size={24} color="#f29929" />
                {outgoingRequests.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{outgoingRequests.length}</Text></View>}
                <Text style={styles.statsLabel}>Đã gửi đi</Text>
            </Pressable>
        </View>
    );

    // Component render từng item (Giữ nguyên logic chính)
    const renderItem = ({ item, index }: { item: Contact, index: number }) => {
        if (item.id === 'sep1') {
            return <Text style={styles.separatorText}>{item.friendName}</Text>;
        }
        
        const status = item.status || (item.friend ? 'FRIEND' : 'NEW');
        const isFriend = status === 'FRIEND' || item.friend;
        const isPending = status === 'PENDING';
        const isSentRequest = outgoingRequests.some(req => req.toUserId?.toString() === (item.userId || item.id));
        const showAddButton = !isFriend;
        const isAddDisabled = isPending || isSentRequest || sendRequestMutation.isPending;
        const addBtnLabel = isPending || isSentRequest ? 'Đang chờ' : 'Kết bạn';

        return (
            <Animatable.View animation="fadeInUp" duration={400} delay={index * 50}>
                <Pressable
                    style={({ pressed }) => [styles.contactItem, pressed && { opacity: 0.95 }]}
                    android_ripple={{color:'#eaf4fb'}}
                    onPress={() => handleOpenProfile(item)} // Mở Profile Modal
                >
                    <Image 
                      source={item.avatarUrl ? { uri: item.avatarUrl } : customAvatar} 
                      style={styles.avatar} 
                    />
                    <View style={{ flex:1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                            <Text style={[styles.userName, isFriend && { fontWeight: '700' }]}>{item.friendName}</Text>
                            {isFriend && (
                                <View style={[styles.statusTag, styles.friendTag]}>
                                    <Ionicons name="checkmark-circle" size={14} color="#fff" />
                                    <Text style={styles.statusTagText}>Bạn bè</Text>
                                </View>
                            )}
                            {!isFriend && (
                                <View style={[
                                    styles.statusTag,
                                    (isPending || isSentRequest) ? styles.pendingTag : styles.newTag
                                ]}>
                                    <Ionicons
                                        name={(isPending || isSentRequest) ? 'time-outline' : 'person-add-outline'}
                                        size={14}
                                        color="#fff"
                                    />
                                    <Text style={styles.statusTagText}>
                                        {(isPending || isSentRequest) ? 'Đang chờ' : 'Người mới'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {item.username ? (
                            <Text style={styles.username}>@{item.username}</Text>
                        ) : null}
                        <Text style={styles.phone}>{item.username}</Text>
                    </View>
                    
                    <View style={styles.actionContainer}>
                        <Pressable style={styles.iconBtn}>
                            <Feather name="phone" size={21} color="#2994f2" />
                        </Pressable>
                        
                        {showAddButton && (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.addBtn,
                                    (isPending || isSentRequest) && styles.addBtnDisabled,
                                    pressed && { opacity: 0.8 }
                                ]}
                                onPress={() => sendFriendRequest(item.userId || item.id)}
                                disabled={isAddDisabled}
                            >
                                <Text style={[
                                    styles.addBtnText,
                                    (isPending || isSentRequest) && styles.addBtnTextDisabled
                                ]}>
                                    {addBtnLabel}
                                </Text>
                            </Pressable>
                        )}
                        {isFriend && <Ionicons name="chatbubble-ellipses-outline" size={21} color="#4cd964" style={{ marginLeft: 6 }} />}

                    </View>
                </Pressable>
            </Animatable.View>
        );
    };


    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={styles.container}>
                <Text style={styles.mainTitle}>Danh bạ</Text>

            <Animated.View style={[
                styles.searchBox,
                {
                    shadowOpacity: shadowAnim.interpolate({ inputRange: [2, 5], outputRange: [0.02, 0.16] }),
                    elevation: shadowAnim,
                }
            ]}>
                <Feather name="search" size={20} color="#2994f2" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Tìm kiếm bạn bè (Tên/SĐT) hoặc SĐT 10 số"
                    placeholderTextColor="#7b868c"
                    onFocus={() => animateShadow(5)}
                    onBlur={() => animateShadow(2)}
                />
            </Animated.View>
            
            {renderStats()}

            <Text style={styles.sectionTitle}>
                {search.trim() ? 'Kết quả tìm kiếm' : 'Danh sách bạn bè của tôi'}
            </Text>
            
            {loadingFriends || loadingSearch ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#2994f2" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Đang tải danh bạ...</Text>
                </View>
            ) : errorFriends ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'red', fontSize: 16 }}>Lỗi tải danh bạ. Vui lòng thử lại.</Text>
                </View>
            ) : (
                <FlatList
                    data={getDisplayContacts}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <Text style={styles.emptyText}>
                            {search.trim() ? 'Không tìm thấy kết quả phù hợp.' : 'Bạn chưa có bạn bè nào.'}
                        </Text>
                    )}
                />
            )}
            </View>

            {/* MODALS */}
            <RequestsModal
                visible={showRequestsModal}
                onClose={() => setShowRequestsModal(false)}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                onCancel={handleCancelRequest}
            />

            <ProfileViewModal
                visible={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                contact={selectedContact}
                onStartChat={handleStartChat}
            />
        </SafeAreaView>
    );
}


// --- STYLES (Giữ nguyên) ---

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8fafd' },
    container: { flex: 1, backgroundColor: '#f8fafd', paddingHorizontal: 16, paddingBottom: 8 },
    mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1c2536', marginBottom: 10, marginTop: 5 },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, marginBottom: 15, paddingHorizontal: 15, height: 48, borderWidth: 0, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 5, elevation: 3 },
    searchInput: { flex: 1, fontSize: 16, color: '#222', padding: 0 },
    // --- STATS SECTION ---
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', borderRadius: 15, paddingVertical: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    statsItem: { alignItems: 'center', paddingHorizontal: 10, position: 'relative' },
    statsSeparator: { width: 1, backgroundColor: '#eee' },
    statsText: { fontSize: 18, fontWeight: '800', color: '#1c2536', marginTop: 4 },
    statsLabel: { fontSize: 12, color: '#7b868c', marginTop: 2 },
    badge: { position: 'absolute', top: -5, right: -2, backgroundColor: '#ff6b6b', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 1, borderColor: '#fff' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    // --- LIST SECTION ---
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1c2536', marginTop: 5, marginBottom: 8 },
    separatorText: { fontSize: 14, fontWeight: '600', color: '#7b868c', paddingVertical: 8, paddingLeft: 4, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginTop: 10 },
    contactItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 13, borderRadius: 10, marginBottom: 6, shadowColor: '#333', shadowOpacity: 0.02, shadowRadius: 1, elevation: 0.5 },
    avatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 12, backgroundColor: '#e5eaef' },
    userName: { fontWeight: '600', fontSize: 16, color: '#1c2536' },
    username: { color: '#4b5963', fontSize: 12, marginTop: 1 },
    phone: { color: '#7b868c', fontSize: 12, marginTop: 1 },
    actionContainer: { flexDirection: 'row', alignItems: 'center' },
    addBtn: { backgroundColor: '#2994f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginLeft: 6 },
    addBtnDisabled: { backgroundColor: '#e6eefb' },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    addBtnTextDisabled: { color: '#7b868c', fontSize: 13 },
    iconBtn: { padding: 6, borderRadius: 15, backgroundColor: '#f5f9ff' },
    statusTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 6 },
    statusTagText: { color: '#fff', fontSize: 11, marginLeft: 4 },
    friendTag: { backgroundColor: '#4cd964' },
    pendingTag: { backgroundColor: '#f29929' },
    newTag: { backgroundColor: '#2994f2' },
    emptyText: { textAlign: 'center', color: '#7b868c', marginTop: 30, fontSize: 15 },
});

const requestModalStyles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
    modalBox: { backgroundColor: '#fff', borderRadius: 12, padding: 15, elevation: 10, maxHeight: 550 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1c2536', marginBottom: 15, textAlign: 'center' },
    tabContainer: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 15, padding: 4 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
    tabText: { fontWeight: '600', color: '#7b868c' },
    tabTextActive: { color: '#2994f2' },
    requestItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5eaef' },
    userName: { fontWeight: '700', fontSize: 16, color: '#1c2536' },
    phone: { fontSize: 13, color: '#7b868c', marginTop: 2 },
    btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

const profileModalStyles = StyleSheet.create({
    header: { backgroundColor: '#2994f2', padding: 20, borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: 'center' },
    profileAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#fff', marginBottom: 10 },
    profileName: { fontSize: 20, fontWeight: '700', color: '#fff' },
    profileUsername: { fontSize: 14, color: '#e0f0ff' },
    body: { padding: 15 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
    infoText: { fontSize: 15, color: '#333', marginLeft: 10 },
    actionFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee' },
    footerBtn: { flex: 1, alignItems: 'center', paddingVertical: 12 },
    footerText: { fontSize: 13, color: '#666', marginTop: 4 },
});