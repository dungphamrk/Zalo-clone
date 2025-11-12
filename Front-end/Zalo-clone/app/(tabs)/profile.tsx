import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, Modal, TextInput, Alert, FlatList, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as ImagePicker from 'expo-image-picker';
import { Gender } from '@/enums/gender.enum';
import { 
  useProfileQuery, 
  useUpdateProfileMutation, 
  useUploadAvatarMutation,
  useChangePasswordMutation 
} from '@/hooks/profile/useProfile';
import Toast from 'react-native-toast-message';
import { Post, Comment } from '@/types/interfaces/wall.interface';
import { 
  useMyPosts, 
  useComments, 
  useAddComment, 
  useAddReply,
  useChangePostVisibility,
  useDeletePost,
} from '@/hooks/wall/useWall';
import { useNotifications, NotificationViewModel } from '@/hooks';
import { useRouter } from 'expo-router';
import { NotificationType } from '@/enums/notification.enum';
import { useLogoutMutation } from '@/hooks/auth/useAuth';

const TEXT_ONLY_POST_MOCK_IMAGE = 'https://images.unsplash.com/photo-1563207914-f584e03f56e9?auto=format&fit=crop&w=300&q=80';

// --- COMPONENTS CON ---

const PostItem: React.FC<{ post: Post; onPress: (post: Post) => void }> = ({ post, onPress }) => {
    const displayImage = post.image || post.mediaUrls?.[0] || TEXT_ONLY_POST_MOCK_IMAGE;
    const commentCount = post.commentCount ?? post.comments?.length ?? 0;

    return (
        <Pressable onPress={() => onPress(post)} style={styles.postItemWrapper}>
            <Animatable.View animation="fadeIn" duration={500} style={styles.postItem}>
                {/* Image */}
                <Image source={{ uri: displayImage }} style={styles.postItemImage} />
                
                {/* Overlay hiển thị Likes/Comments và Visibility */}
                <View style={styles.postOverlay}>
                    {post.visibility === 'PRIVATE' && (
                        <View style={styles.visibilityBadge}>
                            <Ionicons name="lock-closed" size={12} color="#fff" />
                        </View>
                    )}
                    <View style={styles.postStats}>
                        <Ionicons name="heart" size={16} color="#fff" style={{marginRight: 3}} />
                        <Text style={styles.postStatsText}>{post.likes}</Text>
                    </View>
                    <View style={styles.postStats}>
                        <Ionicons name="chatbubble-outline" size={16} color="#fff" style={{marginRight: 3}} />
                        <Text style={styles.postStatsText}>{commentCount}</Text>
                    </View>
                </View>
            </Animatable.View>
        </Pressable>
    );
};


// =================================================================
// 4. MAIN SCREEN
// =================================================================

export default function ProfileScreen() {
    const router = useRouter();
    
    // Real hooks from API
    const { data: profileData, isLoading: profileLoading } = useProfileQuery();
    const updateProfileMutation = useUpdateProfileMutation();
    const uploadAvatarMutation = useUploadAvatarMutation();
    const changePasswordMutation = useChangePasswordMutation();
    const { data: userPosts = [], isLoading: postsLoading, refetch: refetchPosts } = useMyPosts();
    const changeVisibilityMutation = useChangePostVisibility();
    const deletePostMutation = useDeletePost();
    const logoutMutation = useLogoutMutation();
    
    // Notifications
    const {
      notifications,
      unseenCount: notificationUnseenCount,
      isLoading: notificationsLoading,
      isFetching: isFetchingNotifications,
      isFetchingNextPage: isFetchingMoreNotifications,
      hasNextPage: hasMoreNotifications,
      fetchNextPage: fetchMoreNotifications,
      markAllAsSeen,
      isMarkingAllAsSeen,
      deleteAll: deleteAllNotifications,
      isDeletingAll: isDeletingAllNotifications,
      refetch: refetchNotifications,
    } = useNotifications();

    // Local state from API data
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState<Gender>(Gender.MALE);
    const [avatar, setAvatar] = useState('https://randomuser.me/api/portraits/men/32.jpg');
    const [posts, setPosts] = useState<Post[]>([]);

    // Update local state when profile data loads
    useEffect(() => {
        if (profileData) {
            setName(profileData.displayName || '');
            setUsername(profileData.username || '');
            setEmail(profileData.email || '');
            setGender(profileData.gender || Gender.MALE);
            setAvatar(profileData.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg');
        }
    }, [profileData]);

    useEffect(() => {
        setPosts(userPosts);
    }, [userPosts]);

    // Modal Flags
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [editInfoVisible, setEditInfoVisible] = useState(false);
    const [changePwdVisible, setChangePwdVisible] = useState(false);
    const [changeAvatarVisible, setChangeAvatarVisible] = useState(false);
    const [postDetailVisible, setPostDetailVisible] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
    
    // Temp States for editing
    const [tmpName, setTmpName] = useState('');
    const [tmpUsername, setTmpUsername] = useState('');
    const [tmpEmail, setTmpEmail] = useState('');
    const [tmpGender, setTmpGender] = useState<Gender>(Gender.MALE);
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [selectedAvatarUri, setSelectedAvatarUri] = useState<string | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // --- HANDLERS ---

    const navigateToSettings = () => { setSettingsVisible(true); };

    const openEditInfo = () => {
        setTmpName(name);
        setTmpUsername(username);
        setTmpEmail(email);
        setTmpGender(gender);
        setSettingsVisible(false);
        setEditInfoVisible(true);
    };
    
    const openChangePwd = () => {
        setOldPwd(''); setNewPwd(''); setConfirmPwd(''); setSettingsVisible(false); setChangePwdVisible(true);
    };

    const handleLogout = () => {
        console.log('handleLogout called');
        setSettingsVisible(false);
        // Hiển thị modal xác nhận thay vì Alert
        setTimeout(() => {
            setLogoutConfirmVisible(true);
        }, 300);
    };

    const confirmLogout = () => {
        console.log('User confirmed logout, calling mutation...');
        setLogoutConfirmVisible(false);
        logoutMutation.mutate();
    };

    const cancelLogout = () => {
        console.log('Logout cancelled by user');
        setLogoutConfirmVisible(false);
    };

    const saveEditInfo = () => {
        // Validation
        if (!tmpName.trim()) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Tên hiển thị không được để trống' });
            return;
        }
        if (!tmpUsername.trim()) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Username không được để trống' });
            return;
        }
        if (!tmpEmail.trim() || !tmpEmail.includes('@')) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Email không hợp lệ' });
            return;
        }

        updateProfileMutation.mutate(
            { 
                displayName: tmpName.trim(), 
                username: tmpUsername.trim(), 
                email: tmpEmail.trim(),
                gender: tmpGender 
            },
            {
                onSuccess: () => {
                    Toast.show({ type: 'success', text1: 'Thành công', text2: 'Thông tin đã được cập nhật' });
                    setEditInfoVisible(false);
                },
                onError: (err: any) => {
                    Toast.show({ 
                        type: 'error', 
                        text1: 'Lỗi', 
                        text2: err?.message || 'Cập nhật thất bại' 
                    });
                }
            }
        );
    };

    const saveChangePwd = () => {
        if (!oldPwd || !newPwd || !confirmPwd) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đủ thông tin' });
            return;
        }
        if (newPwd.length < 6) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
            return;
        }
        if (newPwd !== confirmPwd) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu mới không khớp' });
            return;
        }
        changePasswordMutation.mutate(
            { oldPassword: oldPwd, password: newPwd, confirmPassword: confirmPwd },
            {
                onSuccess: () => {
                    Toast.show({ type: 'success', text1: 'Thành công', text2: 'Mật khẩu đã được thay đổi' });
                    setChangePwdVisible(false);
                    setOldPwd('');
                    setNewPwd('');
                    setConfirmPwd('');
                },
                onError: (err: any) => {
                    Toast.show({ 
                        type: 'error', 
                        text1: 'Lỗi', 
                        text2: err?.message || 'Đổi mật khẩu thất bại' 
                    });
                }
            }
        );
    };

    const openPostDetailModal = (post: Post) => {
        setSelectedPost(post);
        setPostDetailVisible(true);
    };
    
    const handleDeletePost = (postId: string) => {
        // Gọi trực tiếp API, không cần Alert vì đã có confirm trong modal quản lý
        deletePostMutation.mutate(postId, {
            onSuccess: () => {
                setPostDetailVisible(false);
                refetchPosts();
                Toast.show({
                    type: 'success',
                    text1: 'Thành công',
                    text2: 'Bài viết đã được xóa',
                });
            },
            onError: (error: any) => {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: error?.message || 'Không thể xóa bài viết',
                });
            },
        });
    };

    const handleChangeVisibility = (postId: string, currentVisibility: 'PUBLIC' | 'PRIVATE') => {
        const newVisibility = currentVisibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
        const visibilityText = newVisibility === 'PUBLIC' ? 'Công khai' : 'Bạn bè';
        
        // Gọi API trực tiếp
        changeVisibilityMutation.mutate(
            { postId, visibility: newVisibility },
            {
                onSuccess: () => {
                    refetchPosts();
                    Toast.show({
                        type: 'success',
                        text1: 'Thành công',
                        text2: `Bài viết đã chuyển sang chế độ "${visibilityText}"`,
                    });
                },
                onError: (error: any) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Lỗi',
                        text2: error?.message || 'Không thể thay đổi chế độ hiển thị',
                    });
                },
            }
        );
    };

    const handleDeleteAllNotifications = () => {
        Alert.alert(
            'Xóa tất cả thông báo',
            'Bạn có chắc chắn muốn xóa tất cả thông báo? Hành động này không thể hoàn tác.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAllNotifications();
                            Alert.alert('Thành công', 'Đã xóa tất cả thông báo.');
                        } catch {
                            Alert.alert('Lỗi', 'Không thể xóa thông báo.');
                        }
                    },
                },
            ]
        );
    };

    const handleMarkAllAsSeen = async () => {
        try {
            await markAllAsSeen();
        } catch (error) {
            console.error('[handleMarkAllAsSeen] Error:', error);
        }
    };

    const handleNotificationPress = (notification: NotificationViewModel) => {
        if (!notification.referenceId) return;

        // Đóng modal trước
        setShowNotification(false);

        // Đợi một chút để modal đóng hoàn toàn trước khi điều hướng
        setTimeout(() => {
            // Điều hướng dựa trên type
            switch (notification.type) {
                case NotificationType.NEW_MESSAGE:
                    // referenceId là conversationId
                    router.push({ pathname: '/chat', params: { chatId: notification.referenceId } });
                    break;
                case NotificationType.NEW_POST:
                case NotificationType.POST_REACTION:
                case NotificationType.NEW_COMMENT:
                case NotificationType.COMMENT_REPLY:
                    // referenceId là postId, điều hướng đến wall tab
                    router.push('/(tabs)/wall');
                    break;
                case NotificationType.FRIEND_REQUEST_RECEIVED:
                case NotificationType.FRIEND_REQUEST_ACCEPTED:
                    // Điều hướng đến tab contacts
                    router.push('/(tabs)/contacts');
                    break;
                default:
                    // Không điều hướng cho các type khác
                    break;
            }
        }, 300); // Đợi 300ms để modal đóng
    };

    // --- Avatar Handlers --- 
    const openChangeAvatar = () => {
        setSelectedAvatarUri(null);
        setChangeAvatarVisible(true);
    };

    const pickImageFromLibrary = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Cần quyền truy cập thư viện ảnh' });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
            setSelectedAvatarUri(result.assets[0].uri);
        }
    };

    const takePhotoWithCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Cần quyền truy cập camera' });
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
            setSelectedAvatarUri(result.assets[0].uri);
        }
    };

    const saveChangeAvatar = () => {
        if (!selectedAvatarUri) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn ảnh' });
            return;
        }

        uploadAvatarMutation.mutate(selectedAvatarUri, {
            onSuccess: (response) => {
                // Response structure: response.data.items.avatarUrl
                const avatarUrl = response.data?.items?.avatarUrl;
                
                if (avatarUrl) {
                    setAvatar(avatarUrl);
                }
                setChangeAvatarVisible(false);
                setSelectedAvatarUri(null);
            },
            onError: (err: any) => {
                Toast.show({ 
                    type: 'error', 
                    text1: 'Lỗi', 
                    text2: err?.message || 'Tải avatar thất bại' 
                });
            }
        });
    };


    // --- RENDER ---
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#028fe7' }} edges={['top', 'left', 'right']}>
            <View style={{ flex: 1, backgroundColor: '#f8fafd' }}>
                {/* Header màu xanh với icon Settings */}
                <Animatable.View animation="bounceInDown" duration={650} style={styles.headerBox}>
                    <Text style={styles.headerTitle}>Trang cá nhân</Text>
                    <Pressable onPress={navigateToSettings}>
                        <Animatable.View animation="bounceIn" delay={190} style={styles.headerIconBox}>
                            <Feather name="settings" size={26} color="#fff" />
                        </Animatable.View>
                    </Pressable>
                </Animatable.View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    
                    {/* Box thông tin user */}
                    <Animatable.View animation="fadeInDown" duration={450} delay={90} style={styles.infoBox}>
                        <View style={{alignItems: 'center', width: '100%'}}>
                            <Pressable onPress={openChangeAvatar} style={styles.avatarWrapper}>
                                <Image source={{ uri: avatar }} style={styles.avatar} />
                                <View style={styles.cameraIcon}>
                                    <Feather name="camera" size={16} color="#fff" />
                                </View>
                            </Pressable>
                            
                            {profileLoading ? (
                                <ActivityIndicator size="small" color="#028fe7" style={{ marginTop: 10 }} />
                            ) : (
                                <>
                                    <Text style={styles.userName}>{name || 'Đang tải...'}</Text>
                                    <Text style={styles.usernameText}>{username ? '@' + username : ''}</Text>
                                    {email ? <Text style={styles.status}>{email}</Text> : null}
                                </>
                            )}
                        </View>
                    </Animatable.View>
                    
                    {/* Khu vực Posts cá nhân */}
                    <Animatable.View animation="fadeInUp" duration={500} delay={150} style={styles.postSection}>
                        <Text style={styles.sectionTitle}>Bài đăng của bạn ({posts.length})</Text>
                        
                        {postsLoading ? (
                            <ActivityIndicator size="small" color="#028fe7" style={{ paddingVertical: 20 }} />
                        ) : posts.length === 0 ? (
                            <Text style={{ textAlign: 'center', color: '#666', paddingVertical: 20 }}>
                                Bạn chưa có bài đăng nào.
                            </Text>
                        ) : (
                            <FlatList
                                data={posts}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => <PostItem post={item} onPress={openPostDetailModal} />}
                                numColumns={2}
                                scrollEnabled={false}
                                columnWrapperStyle={styles.postRow}
                                contentContainerStyle={{paddingTop: 8, paddingHorizontal: 10}}
                            />
                        )}

                    </Animatable.View>

                </ScrollView>

                {/* MODAL 1: Cài đặt (Settings) */}
                <Modal visible={settingsVisible} animationType="fade" transparent>
                    <Pressable style={styles.modalOverlay} onPress={() => setSettingsVisible(false)}>
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <Animatable.View animation="bounceInDown" duration={300} style={[styles.modalBox, { marginTop: 60, marginRight: 16, width: 250, alignSelf: 'flex-end', marginHorizontal: 0, padding: 0 }]}>
                                <Pressable onPress={openEditInfo} style={styles.settingsOption}>
                                    <Feather name="user" size={18} color="#028fe7" />
                                    <Text style={styles.settingsText}>Chỉnh sửa thông tin</Text>
                                </Pressable>
                                <View style={styles.settingsSeparator} />
                                <Pressable onPress={openChangePwd} style={styles.settingsOption}>
                                    <Feather name="lock" size={18} color="#028fe7" />
                                    <Text style={styles.settingsText}>Đổi mật khẩu</Text>
                                </Pressable>
                                <View style={styles.settingsSeparator} />
                                <Pressable 
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        console.log('Logout button pressed');
                                        handleLogout();
                                    }} 
                                    style={styles.settingsOption}
                                    disabled={logoutMutation.isPending}
                                >
                                    <Feather name="log-out" size={18} color="#ff4444" />
                                    <Text style={[styles.settingsText, { color: '#ff4444' }]}>
                                        {logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
                                    </Text>
                                </Pressable>
                            </Animatable.View>
                        </Pressable>
                    </Pressable>
                </Modal>
                
                {/* MODAL 2: Chỉnh sửa thông tin cá nhân (Edit Info) - IMPROVED */}
                <Modal visible={editInfoVisible} animationType="slide" transparent>
                    <Pressable style={styles.modalOverlay} onPress={() => setEditInfoVisible(false)}>
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <Animatable.View animation="slideInUp" duration={300} style={styles.editModalBox}>
                                {/* Header */}
                                <View style={styles.editModalHeader}>
                                    <Text style={styles.editModalTitle}>Chỉnh sửa thông tin</Text>
                                    <Pressable onPress={() => setEditInfoVisible(false)}>
                                        <Ionicons name="close" size={24} color="#666" />
                                    </Pressable>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false} style={styles.editModalContent}>
                                    {/* Display Name */}
                                    <View style={styles.inputGroup}>
                                        <View style={styles.inputLabelRow}>
                                            <Ionicons name="person-outline" size={18} color="#028fe7" />
                                            <Text style={styles.inputLabel}>Tên hiển thị</Text>
                                        </View>
                                        <TextInput
                                            style={styles.modernInput}
                                            value={tmpName}
                                            onChangeText={setTmpName}
                                            placeholder="Nhập tên hiển thị"
                                            placeholderTextColor="#999"
                                        />
                                    </View>

                                    {/* Username */}
                                    <View style={styles.inputGroup}>
                                        <View style={styles.inputLabelRow}>
                                            <Ionicons name="at-outline" size={18} color="#028fe7" />
                                            <Text style={styles.inputLabel}>Username</Text>
                                        </View>
                                        <TextInput
                                            style={styles.modernInput}
                                            value={tmpUsername}
                                            onChangeText={setTmpUsername}
                                            placeholder="Nhập username"
                                            placeholderTextColor="#999"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    {/* Email */}
                                    <View style={styles.inputGroup}>
                                        <View style={styles.inputLabelRow}>
                                            <Ionicons name="mail-outline" size={18} color="#028fe7" />
                                            <Text style={styles.inputLabel}>Email</Text>
                                        </View>
                                        <TextInput
                                            style={styles.modernInput}
                                            value={tmpEmail}
                                            onChangeText={setTmpEmail}
                                            placeholder="Nhập email"
                                            placeholderTextColor="#999"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    {/* Gender */}
                                    <View style={styles.inputGroup}>
                                        <View style={styles.inputLabelRow}>
                                            <Ionicons name="people-outline" size={18} color="#028fe7" />
                                            <Text style={styles.inputLabel}>Giới tính</Text>
                                        </View>
                                        <View style={styles.genderPicker}>
                                            {[Gender.MALE, Gender.FEMALE, Gender.OTHER].map((g) => (
                                                <Pressable
                                                    key={g}
                                                    onPress={() => setTmpGender(g)}
                                                    style={[
                                                        styles.genderOption,
                                                        tmpGender === g && styles.genderOptionSelected
                                                    ]}
                                                >
                                                    <Text style={[
                                                        styles.genderOptionText,
                                                        tmpGender === g && styles.genderOptionTextSelected
                                                    ]}>
                                                        {g === Gender.MALE ? 'Nam' : g === Gender.FEMALE ? 'Nữ' : 'Khác'}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>
                                </ScrollView>

                                {/* Footer Actions */}
                                <View style={styles.editModalFooter}>
                                    <Pressable
                                        onPress={() => setEditInfoVisible(false)}
                                        style={({ pressed }) => [styles.modalBtnCancel, pressed && { opacity: 0.8 }]}
                                    >
                                        <Text style={styles.modalBtnCancelText}>Hủy</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={saveEditInfo}
                                        disabled={updateProfileMutation.isPending}
                                        style={({ pressed }) => [
                                            styles.modalBtnSave,
                                            pressed && { opacity: 0.9 },
                                            updateProfileMutation.isPending && { opacity: 0.6 }
                                        ]}
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.modalBtnSaveText}>Lưu thay đổi</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </Animatable.View>
                        </Pressable>
                    </Pressable>
                </Modal>
                
                {/* MODAL 3: Đổi mật khẩu (Change Password) */}
                <Modal visible={changePwdVisible} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
                            <TextInput style={styles.input} value={oldPwd} onChangeText={setOldPwd} placeholder="Mật khẩu cũ" secureTextEntry />
                            <TextInput style={styles.input} value={newPwd} onChangeText={setNewPwd} placeholder="Mật khẩu mới" secureTextEntry />
                            <TextInput style={styles.input} value={confirmPwd} onChangeText={setConfirmPwd} placeholder="Xác nhận mật khẩu mới" secureTextEntry />
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                                <Pressable onPress={() => setChangePwdVisible(false)} style={({ pressed }) => [styles.modalBtn, pressed && { opacity: 0.8 }]}>
                                    <Text style={styles.modalBtnText}>Hủy</Text>
                                </Pressable>
                                <Pressable onPress={saveChangePwd} style={({ pressed }) => [styles.modalPrimaryBtn, pressed && { opacity: 0.9 }]}>
                                    <Text style={[styles.modalBtnText, { color: '#fff' }]}>Lưu</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
                
                {/* MODAL 4: Đổi Avatar (Change Avatar) - IMPROVED */}
                <Modal visible={changeAvatarVisible} animationType="slide" transparent>
                    <Pressable style={styles.modalOverlay} onPress={() => setChangeAvatarVisible(false)}>
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <Animatable.View animation="slideInUp" duration={300} style={styles.avatarModalBox}>
                                {/* Header */}
                                <View style={styles.editModalHeader}>
                                    <Text style={styles.editModalTitle}>Đổi ảnh đại diện</Text>
                                    <Pressable onPress={() => setChangeAvatarVisible(false)}>
                                        <Ionicons name="close" size={24} color="#666" />
                                    </Pressable>
                                </View>

                                {/* Avatar Preview */}
                                <View style={styles.avatarPreviewContainer}>
                                    <Image
                                        source={{ uri: selectedAvatarUri || avatar }}
                                        style={styles.avatarPreview}
                                    />
                                    {!selectedAvatarUri && (
                                        <Text style={styles.avatarPreviewHint}>Chọn ảnh mới từ bên dưới</Text>
                                    )}
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.avatarActionRow}>
                                    <Pressable
                                        onPress={pickImageFromLibrary}
                                        style={({ pressed }) => [
                                            styles.avatarActionBtn,
                                            pressed && { opacity: 0.8 }
                                        ]}
                                    >
                                        <Ionicons name="images-outline" size={24} color="#028fe7" />
                                        <Text style={styles.avatarActionText}>Thư viện</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={takePhotoWithCamera}
                                        style={({ pressed }) => [
                                            styles.avatarActionBtn,
                                            pressed && { opacity: 0.8 }
                                        ]}
                                    >
                                        <Ionicons name="camera-outline" size={24} color="#028fe7" />
                                        <Text style={styles.avatarActionText}>Chụp ảnh</Text>
                                    </Pressable>
                                </View>

                                {/* Footer Actions */}
                                <View style={styles.editModalFooter}>
                                    <Pressable
                                        onPress={() => {
                                            setChangeAvatarVisible(false);
                                            setSelectedAvatarUri(null);
                                        }}
                                        style={({ pressed }) => [styles.modalBtnCancel, pressed && { opacity: 0.8 }]}
                                    >
                                        <Text style={styles.modalBtnCancelText}>Hủy</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={saveChangeAvatar}
                                        disabled={!selectedAvatarUri || uploadAvatarMutation.isPending}
                                        style={({ pressed }) => [
                                            styles.modalBtnSave,
                                            pressed && { opacity: 0.9 },
                                            (!selectedAvatarUri || uploadAvatarMutation.isPending) && { opacity: 0.6 }
                                        ]}
                                    >
                                        {uploadAvatarMutation.isPending ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.modalBtnSaveText}>Lưu ảnh</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </Animatable.View>
                        </Pressable>
                    </Pressable>
                </Modal>

                {/* MODAL 5: CHI TIẾT BÀI VIẾT (POST DETAIL) */}
                <Modal visible={postDetailVisible} animationType="slide">
                    <PostDetailModal 
                        post={selectedPost} 
                        onClose={() => setPostDetailVisible(false)}
                        onDelete={handleDeletePost}
                        onChangeVisibility={handleChangeVisibility}
                        currentUserName={name}
                        currentUserAvatar={avatar}
                    />
                </Modal>

                {/* MODAL 6: NOTIFICATIONS */}
                <NotificationModal
                    visible={showNotification}
                    notifications={notifications}
                    isLoading={notificationsLoading}
                    isFetching={isFetchingNotifications}
                    isFetchingMore={isFetchingMoreNotifications}
                    hasMore={hasMoreNotifications}
                    onLoadMore={fetchMoreNotifications}
                    onRefresh={refetchNotifications}
                    onClose={() => setShowNotification(false)}
                    onMarkAllAsSeen={handleMarkAllAsSeen}
                    isMarkingAll={isMarkingAllAsSeen}
                    onDeleteAll={handleDeleteAllNotifications}
                    isDeletingAll={isDeletingAllNotifications}
                    onNotificationPress={handleNotificationPress}
                />

                {/* MODAL 7: LOGOUT CONFIRMATION */}
                <Modal visible={logoutConfirmVisible} animationType="fade" transparent>
                    <Pressable 
                        style={styles.modalOverlay} 
                        onPress={cancelLogout}
                    >
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <Animatable.View animation="zoomIn" duration={200} style={styles.logoutConfirmBox}>
                                <View style={styles.logoutConfirmHeader}>
                                    <Ionicons name="log-out-outline" size={32} color="#ff4444" />
                                    <Text style={styles.logoutConfirmTitle}>Đăng xuất</Text>
                                </View>
                                <Text style={styles.logoutConfirmMessage}>
                                    Bạn có chắc chắn muốn đăng xuất?
                                </Text>
                                <View style={styles.logoutConfirmActions}>
                                    <Pressable
                                        onPress={cancelLogout}
                                        style={({ pressed }) => [
                                            styles.logoutConfirmBtn,
                                            styles.logoutConfirmBtnCancel,
                                            pressed && { opacity: 0.8 }
                                        ]}
                                    >
                                        <Text style={styles.logoutConfirmBtnCancelText}>Hủy</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={confirmLogout}
                                        disabled={logoutMutation.isPending}
                                        style={({ pressed }) => [
                                            styles.logoutConfirmBtn,
                                            styles.logoutConfirmBtnConfirm,
                                            pressed && { opacity: 0.8 },
                                            logoutMutation.isPending && { opacity: 0.6 }
                                        ]}
                                    >
                                        {logoutMutation.isPending ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.logoutConfirmBtnConfirmText}>Đăng xuất</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </Animatable.View>
                        </Pressable>
                    </Pressable>
                </Modal>

            </View>
        </SafeAreaView>
    );
}

// =================================================================
// 5. POST DETAIL MODAL COMPONENT (ĐÃ SỬA LỖI HOOKS VÀ LOGIC)
// =================================================================

type PostDetailModalProps = {
    post: Post | null;
    onClose: () => void;
    onDelete: (postId: string) => void;
    onChangeVisibility: (postId: string, currentVisibility: 'PUBLIC' | 'PRIVATE') => void;
    currentUserName: string;
    currentUserAvatar: string;
};

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose, onDelete, onChangeVisibility, currentUserName, currentUserAvatar }) => {
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [postManageVisible, setPostManageVisible] = useState(false);
    const [postDeleteConfirmVisible, setPostDeleteConfirmVisible] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const { data: comments = [], isLoading: commentsLoading } = useComments(post?.id ?? '', Boolean(post));
    const addCommentMutation = useAddComment();
    const addReplyMutation = useAddReply();

    useEffect(() => {
        setCommentText('');
        setReplyText('');
        setReplyingTo(null);
    }, [post?.id]);

    if (!post) {
        return null;
    }

    const handleSubmitComment = () => {
        if (!commentText.trim()) return;
        addCommentMutation.mutate(
            { postId: post.id, data: { content: commentText.trim() } },
            {
                onSuccess: () => {
                    setCommentText('');
                },
            }
        );
    };

    const handleSubmitReply = () => {
        if (!replyText.trim() || !replyingTo) return;
        addReplyMutation.mutate(
            { postId: post.id, commentId: replyingTo.id, data: { content: replyText.trim() } },
            {
                onSuccess: () => {
                    setReplyText('');
                    setReplyingTo(null);
                },
            }
        );
    };

    const displayImage = post.image || post.mediaUrls?.[0];
    const commentCount = post.commentCount ?? comments.length;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafd' }}>
            <View style={postDetailStyles.header}>
                <Pressable onPress={onClose} style={{ padding: 8 }}>
                    <Feather name="arrow-left" size={24} color="#181c2b" />
                </Pressable>
                <Text style={postDetailStyles.headerTitle}>Chi tiết bài viết</Text>
                <Pressable
                    onPress={() => {
                        setPostManageVisible(true);
                    }}
                    style={{ padding: 8 }}
                >
                    <Feather name="more-vertical" size={24} color="#181c2b" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={postDetailStyles.contentContainer}>
                <View style={postDetailStyles.postContentBox}>
                    <Text style={postDetailStyles.postContentText}>{post.content}</Text>
                    {displayImage ? (
                        <Image source={{ uri: displayImage }} style={postDetailStyles.postImage} />
                    ) : null}
                </View>

                <View style={postDetailStyles.reactionsBar}>
                    <Ionicons name="heart" size={14} color="#ff6b6b" />
                    <Text style={postDetailStyles.reactionCount}>{post.likes} lượt thích</Text>
                    <Text style={[postDetailStyles.reactionCount, { marginLeft: 'auto' }]}>
                        {commentCount} bình luận
                    </Text>
                </View>

                <View style={postDetailStyles.actionsBar}>
                    <Pressable style={postDetailStyles.actionButton}>
                        <Ionicons name="heart-outline" size={20} color="#666" />
                        <Text style={postDetailStyles.actionText}>Thích</Text>
                    </Pressable>
                    <Pressable style={postDetailStyles.actionButton}>
                        <Ionicons name="chatbubble-outline" size={20} color="#666" />
                        <Text style={postDetailStyles.actionText}>Bình luận</Text>
                    </Pressable>
                    <Pressable style={postDetailStyles.actionButton}>
                        <Feather name="send" size={20} color="#666" />
                        <Text style={postDetailStyles.actionText}>Chia sẻ</Text>
                    </Pressable>
                </View>

                <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                        Bình luận ({commentCount})
                    </Text>
                    {commentsLoading ? (
                        <ActivityIndicator size="small" color="#028fe7" style={{ paddingVertical: 12 }} />
                    ) : (
                        comments.map((comment, index) => (
                            <View key={comment.id} style={postDetailStyles.commentItem}>
                                <Image
                                    source={{ uri: comment.userAvatar || currentUserAvatar }}
                                    style={postDetailStyles.commentAvatar}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={postDetailStyles.commentUser}>{comment.userName}</Text>
                                    <Text style={postDetailStyles.commentText}>{comment.content}</Text>
                                    <View style={postDetailStyles.commentActions}>
                                        <Text style={postDetailStyles.commentTime}>{comment.time}</Text>
                                        <Pressable onPress={() => setReplyingTo(comment)}>
                                            <Text
                                                style={[
                                                    postDetailStyles.commentTime,
                                                    { fontWeight: '700', color: '#2994f2' },
                                                ]}
                                            >
                                                Phản hồi
                                            </Text>
                                        </Pressable>
                                    </View>

                                    {comment.replies?.length ? (
                                        <View style={postDetailStyles.repliesList}>
                                            {comment.replies.map((reply) => (
                                                <View key={reply.id} style={postDetailStyles.replyItem}>
                                                    <Text style={postDetailStyles.commentUser}>
                                                        {reply.userName}{' '}
                                                    </Text>
                                                    <Text style={postDetailStyles.commentText}>
                                                        {reply.content}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <View style={postDetailStyles.commentInputContainer}>
                {replyingTo && (
                    <View style={postDetailStyles.replyTagContainer}>
                        <Text style={postDetailStyles.replyTagText}>Đang trả lời: {replyingTo.userName}</Text>
                        <Pressable onPress={() => setReplyingTo(null)}>
                            <Feather name="x" size={16} color="#028fe7" style={{ marginLeft: 5 }} />
                        </Pressable>
                    </View>
                )}
                <View style={postDetailStyles.commentInputRow}>
                    <TextInput
                        style={postDetailStyles.commentInput}
                        value={replyingTo ? replyText : commentText}
                        onChangeText={replyingTo ? setReplyText : setCommentText}
                        placeholder={
                            replyingTo
                                ? `Phản hồi ${replyingTo.userName}...`
                                : `Bình luận bằng ${currentUserName}...`
                        }
                        placeholderTextColor="#aaa"
                        multiline
                    />
                    <Pressable
                        onPress={replyingTo ? handleSubmitReply : handleSubmitComment}
                        style={({ pressed }) => [
                            postDetailStyles.sendCommentButton,
                            pressed && { opacity: 0.8 },
                            !(replyingTo ? replyText.trim() : commentText.trim()) && { backgroundColor: '#ccc' },
                        ]}
                        disabled={replyingTo ? !replyText.trim() : !commentText.trim()}
                    >
                        {(addCommentMutation.isPending && !replyingTo) ||
                        (addReplyMutation.isPending && replyingTo) ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color="#fff" />
                        )}
                    </Pressable>
                </View>
            </View>

            {/* MODAL: QUẢN LÝ BÀI VIẾT */}
            <Modal visible={postManageVisible} animationType="fade" transparent>
                <Pressable 
                    style={postDetailStyles.modalOverlay} 
                    onPress={() => setPostManageVisible(false)}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <Animatable.View animation="zoomIn" duration={200} style={postDetailStyles.postManageBox}>
                            <View style={postDetailStyles.postManageHeader}>
                                <Ionicons name="settings-outline" size={28} color="#028fe7" />
                                <Text style={postDetailStyles.postManageTitle}>Quản lý bài viết</Text>
                            </View>
                            
                            <View style={postDetailStyles.postManageOptions}>
                                <Pressable
                                    onPress={() => {
                                        const currentVisibility = post.visibility || 'PUBLIC';
                                        console.log('Changing visibility:', post.id, currentVisibility);
                                        setPostManageVisible(false);
                                        // Gọi API ngay lập tức
                                        onChangeVisibility(post.id, currentVisibility);
                                    }}
                                    style={({ pressed }) => [
                                        postDetailStyles.postManageOption,
                                        pressed && { backgroundColor: '#f5f5f5' }
                                    ]}
                                >
                                    <Ionicons 
                                        name={post.visibility === 'PUBLIC' ? 'lock-closed-outline' : 'globe-outline'} 
                                        size={22} 
                                        color="#028fe7" 
                                    />
                                    <Text style={postDetailStyles.postManageOptionText}>
                                        {post.visibility === 'PUBLIC' ? 'Chuyển sang Bạn bè' : 'Chuyển sang Công khai'}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                                </Pressable>

                                <View style={postDetailStyles.postManageSeparator} />

                                <Pressable
                                    onPress={() => {
                                        console.log('Deleting post:', post.id);
                                        setPostManageVisible(false);
                                        // Hiển thị confirm modal trước khi xóa
                                        setTimeout(() => {
                                            setPostDeleteConfirmVisible(true);
                                            setPostToDelete(post.id);
                                        }, 200);
                                    }}
                                    style={({ pressed }) => [
                                        postDetailStyles.postManageOption,
                                        postDetailStyles.postManageOptionDanger,
                                        pressed && { backgroundColor: '#fff5f5' }
                                    ]}
                                >
                                    <Ionicons name="trash-outline" size={22} color="#ff4444" />
                                    <Text style={[postDetailStyles.postManageOptionText, { color: '#ff4444' }]}>
                                        Xóa bài viết
                                    </Text>
                                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                                </Pressable>
                            </View>

                            <Pressable
                                onPress={() => setPostManageVisible(false)}
                                style={({ pressed }) => [
                                    postDetailStyles.postManageCancelBtn,
                                    pressed && { opacity: 0.8 }
                                ]}
                            >
                                <Text style={postDetailStyles.postManageCancelText}>Hủy</Text>
                            </Pressable>
                        </Animatable.View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* MODAL: XÁC NHẬN XÓA BÀI VIẾT */}
            <Modal visible={postDeleteConfirmVisible} animationType="fade" transparent>
                <Pressable 
                    style={postDetailStyles.modalOverlay} 
                    onPress={() => {
                        setPostDeleteConfirmVisible(false);
                        setPostToDelete(null);
                    }}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <Animatable.View animation="zoomIn" duration={200} style={postDetailStyles.postDeleteConfirmBox}>
                            <View style={postDetailStyles.postDeleteConfirmHeader}>
                                <Ionicons name="trash-outline" size={32} color="#ff4444" />
                                <Text style={postDetailStyles.postDeleteConfirmTitle}>Xóa bài viết</Text>
                            </View>
                            <Text style={postDetailStyles.postDeleteConfirmMessage}>
                                Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
                            </Text>
                            <View style={postDetailStyles.postDeleteConfirmActions}>
                                <Pressable
                                    onPress={() => {
                                        setPostDeleteConfirmVisible(false);
                                        setPostToDelete(null);
                                    }}
                                    style={({ pressed }) => [
                                        postDetailStyles.postDeleteConfirmBtn,
                                        postDetailStyles.postDeleteConfirmBtnCancel,
                                        pressed && { opacity: 0.8 }
                                    ]}
                                >
                                    <Text style={postDetailStyles.postDeleteConfirmBtnCancelText}>Hủy</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        if (postToDelete) {
                                            console.log('Confirming delete for post:', postToDelete);
                                            setPostDeleteConfirmVisible(false);
                                            onDelete(postToDelete);
                                            setPostToDelete(null);
                                        }
                                    }}
                                    style={({ pressed }) => [
                                        postDetailStyles.postDeleteConfirmBtn,
                                        postDetailStyles.postDeleteConfirmBtnConfirm,
                                        pressed && { opacity: 0.8 }
                                    ]}
                                >
                                    <Text style={postDetailStyles.postDeleteConfirmBtnConfirmText}>Xóa</Text>
                                </Pressable>
                            </View>
                        </Animatable.View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};


// =================================================================
// 6. STYLES (Giữ nguyên sau khi sửa lỗi)
// =================================================================

const styles = StyleSheet.create({
    // ... (Styles Header, Info Box)
    headerBox:{
        flexDirection:'row', alignItems:'center', height:60, backgroundColor:'#028fe7',
        paddingHorizontal:16, 
        elevation:5, shadowColor:'#009', shadowOpacity:0.12, shadowRadius:6,
    },
    headerTitle:{ color:'#fff', fontSize:19, fontWeight:'bold', letterSpacing:0.7, flex:1},
    headerIconBox:{ marginLeft:10, padding: 5},
    
    infoBox: {
        alignItems:'center', backgroundColor:'#fff',
        borderRadius:14, marginTop:16, marginHorizontal:16, padding:20, 
        shadowColor:'#111', shadowOpacity:0.06, shadowRadius:4, elevation:2,
        marginBottom: 10,
    },
    avatarWrapper: {
        width: 100, height: 100, borderRadius: 50, marginBottom: 15, position: 'relative',
    },
    avatar: { width:100, height:100, borderRadius:50, backgroundColor:'#eee', borderWidth: 4, borderColor: '#f3f7fb' },
    cameraIcon: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: '#028fe7', width: 30, height: 30, borderRadius: 15,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#fff',
    },
    userName: { fontWeight:'bold', fontSize:22, color:'#181c2b', marginTop: 5 },
    usernameText: { color: '#667480', fontSize: 14, marginBottom: 4 },
    status: { color:'#6b7780', fontSize:14, marginTop: 5 },

    // --- Post Section Styles (Grid) ---
    postSection: {
        marginHorizontal: 16,
        paddingTop: 10,
        backgroundColor: '#fff',
        borderRadius: 14,
        shadowColor:'#111', shadowOpacity:0.06, shadowRadius:4, elevation:2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#181c2b',
        paddingHorizontal: 16, 
        marginBottom: 5,
    },
    postRow: {
        // Căn lề cho cột
    },
    postItemWrapper: {
        width: '50%', 
        paddingHorizontal: 1, 
        marginBottom: 2,
        aspectRatio: 1, 
    },
    postItem: {
        flex: 1,
        overflow: 'hidden', 
        backgroundColor: '#eee',
        position: 'relative',
    },
    postItemImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    postOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)', 
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    postStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    postStatsText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    visibilityBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        padding: 4,
        paddingHorizontal: 6,
    },
    // --- Styles Modal (General & Settings) ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center' },
    modalBox: { backgroundColor: '#fff', borderRadius: 12, padding: 18, elevation: 8, marginHorizontal: 30, alignSelf: 'center' },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#181c2b' },
    input: { 
        borderWidth: 1, borderColor: '#e6eef5', borderRadius: 10, 
        paddingHorizontal: 12, paddingVertical: 10, marginTop: 8, color: '#222',
        backgroundColor: '#f8fafd'
    },
    modalBtn: { paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8 },
    modalPrimaryBtn: { paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8, backgroundColor: '#2994f2', borderRadius: 8 },
    modalBtnText: { color: '#2994f2', fontWeight: '600', fontSize: 14 },

    settingsOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
    settingsText: { marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#333' },
    settingsSeparator: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 0, marginHorizontal: 10 },
    
    avatarActionRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    avatarActionBtn: { 
        flex: 1, 
        backgroundColor: '#f3f7fb', 
        borderRadius: 12, 
        paddingVertical: 16, 
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e6eef5',
    },
    avatarActionText: { 
        color: '#028fe7', 
        fontWeight: '600', 
        fontSize: 14,
        marginTop: 8,
    },

    // --- Improved Edit Modal Styles ---
    editModalBox: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    },
    editModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    editModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#181c2b',
    },
    editModalContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        maxHeight: 400,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    modernInput: {
        borderWidth: 1.5,
        borderColor: '#e6eef5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#222',
        backgroundColor: '#fafbfc',
    },
    genderPicker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    genderOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#e6eef5',
        backgroundColor: '#fafbfc',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    genderOptionSelected: {
        backgroundColor: '#e6f4ff',
        borderColor: '#028fe7',
    },
    genderOptionText: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
    },
    genderOptionTextSelected: {
        color: '#028fe7',
        fontWeight: '700',
    },
    editModalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    modalBtnCancel: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        marginRight: 12,
    },
    modalBtnCancelText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 15,
    },
    modalBtnSave: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        backgroundColor: '#028fe7',
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnSaveText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },

    // --- Improved Avatar Modal Styles ---
    avatarModalBox: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    },
    avatarPreviewContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    avatarPreview: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#eee',
        borderWidth: 4,
        borderColor: '#f3f7fb',
    },
    avatarPreviewHint: {
        marginTop: 12,
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },

    // Logout Confirmation Modal Styles
    logoutConfirmBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 30,
        alignSelf: 'center',
        minWidth: 280,
        maxWidth: 400,
    },
    logoutConfirmHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    logoutConfirmTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#181c2b',
        marginTop: 12,
    },
    logoutConfirmMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    logoutConfirmActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    logoutConfirmBtn: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    logoutConfirmBtnCancel: {
        backgroundColor: '#f0f0f0',
    },
    logoutConfirmBtnConfirm: {
        backgroundColor: '#ff4444',
    },
    logoutConfirmBtnCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    logoutConfirmBtnConfirmText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});


// --- POST DETAIL MODAL STYLES ---
const postDetailStyles = StyleSheet.create({
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        height: 55, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff',
        paddingHorizontal: 8
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#181c2b' },
    contentContainer: { paddingBottom: 20 },
    
    postContentBox: { padding: 16, backgroundColor: '#fff' },
    postContentText: { fontSize: 16, color: '#333', lineHeight: 24, marginBottom: 10 },
    postImage: { width: '100%', height: 300, borderRadius: 10, resizeMode: 'cover', marginTop: 5 },
    
    reactionsBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    reactionCount: { fontSize: 14, color: '#666', marginLeft: 5 },

    actionsBar: { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8 },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
    actionText: { marginLeft: 6, fontSize: 14, color: '#666' },

    commentItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
    commentAvatar: { width: 35, height: 35, borderRadius: 17.5, marginRight: 10, backgroundColor: '#eee' },
    commentUser: { fontWeight: 'bold', fontSize: 14, color: '#333' },
    commentText: { fontSize: 14, color: '#444' },
    commentActions: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
    commentTime: { fontSize: 11, color: '#999', marginRight: 10 },
    
    repliesList: { marginTop: 5, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#f0f0f0' },
    replyItem: { flexDirection: 'row', marginTop: 4 },

    commentInputContainer: { 
        padding: 10, 
        borderTopWidth: 1, 
        borderTopColor: '#eee', 
        backgroundColor: '#fff' 
    },
    commentInputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    commentInput: { 
        flex: 1, 
        minHeight: 40,
        maxHeight: 100, 
        backgroundColor: '#f0f0f0', 
        borderRadius: 20, 
        paddingHorizontal: 15, 
        paddingTop: 10, 
        paddingBottom: 10, 
        marginRight: 10,
        fontSize: 14,
        alignSelf: 'stretch',
    },
    sendCommentButton: { 
        backgroundColor: '#2994f2', 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginLeft: -50, 
        marginBottom: 5,
    },

    replyTagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 5,
        backgroundColor: '#e6f4ff',
        borderRadius: 10,
        marginBottom: 5,
        marginRight: 50,
    },
    replyTagText: {
        color: '#028fe7',
        fontWeight: '600',
        fontSize: 13,
    },

    // Post Management Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    postManageBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        minWidth: 300,
        maxWidth: 400,
    },
    postManageHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    postManageTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#181c2b',
        marginTop: 12,
    },
    postManageOptions: {
        marginBottom: 12,
    },
    postManageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 4,
    },
    postManageOptionDanger: {
        // Style riêng cho option nguy hiểm (xóa)
    },
    postManageOptionText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
        fontWeight: '500',
    },
    postManageSeparator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 8,
    },
    postManageCancelBtn: {
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        marginTop: 8,
    },
    postManageCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },

    // Post Delete Confirm Modal Styles
    postDeleteConfirmBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 30,
        alignSelf: 'center',
        minWidth: 280,
        maxWidth: 400,
    },
    postDeleteConfirmHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    postDeleteConfirmTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#181c2b',
        marginTop: 12,
    },
    postDeleteConfirmMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    postDeleteConfirmActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    postDeleteConfirmBtn: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    postDeleteConfirmBtnCancel: {
        backgroundColor: '#f0f0f0',
    },
    postDeleteConfirmBtnConfirm: {
        backgroundColor: '#ff4444',
    },
    postDeleteConfirmBtnCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    postDeleteConfirmBtnConfirmText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

// Notification Modal Styles
const notificationStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalBox: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: '80%',
    },
    modalBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        marginLeft: 8,
    },
    modalActionText: {
        fontSize: 12,
        color: '#2994f2',
        fontWeight: '600',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    notificationAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: '#999',
    },
});

// Notification Modal Component
const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=60';

function NotificationModal({
    visible,
    onClose,
    notifications,
    isLoading,
    isFetching,
    isFetchingMore,
    hasMore,
    onLoadMore,
    onRefresh,
    onMarkAllAsSeen,
    isMarkingAll,
    onDeleteAll,
    isDeletingAll,
    onNotificationPress,
}: {
    visible: boolean;
    onClose: () => void;
    notifications: NotificationViewModel[];
    isLoading: boolean;
    isFetching: boolean;
    isFetchingMore: boolean;
    hasMore: boolean;
    onLoadMore?: () => void;
    onRefresh?: () => Promise<any>;
    onMarkAllAsSeen: () => Promise<void>;
    isMarkingAll: boolean;
    onDeleteAll: () => void;
    isDeletingAll: boolean;
    onNotificationPress: (notification: NotificationViewModel) => void;
}) {
    const handleEndReached = () => {
        if (hasMore && !isFetchingMore) {
            onLoadMore?.();
        }
    };

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={notificationStyles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
                <View style={[notificationStyles.modalBox, { maxHeight: 500 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontWeight: '700', fontSize: 18 }}>Thông báo</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Pressable
                                style={[notificationStyles.modalBtn, { marginLeft: 0 }]}
                                onPress={onMarkAllAsSeen}
                                disabled={isMarkingAll || notifications.length === 0}
                            >
                                <Text
                                    style={[
                                        notificationStyles.modalActionText,
                                        (isMarkingAll || notifications.length === 0) && { opacity: 0.5 },
                                    ]}
                                >
                                    {isMarkingAll ? 'Đang xử lý...' : 'Đánh dấu đã đọc'}
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[notificationStyles.modalBtn]}
                                onPress={onDeleteAll}
                                disabled={isDeletingAll || notifications.length === 0}
                            >
                                <Text
                                    style={[
                                        notificationStyles.modalActionText,
                                        { color: '#ff4444' },
                                        (isDeletingAll || notifications.length === 0) && { opacity: 0.5 },
                                    ]}
                                >
                                    {isDeletingAll ? 'Đang xóa...' : 'Xóa tất cả'}
                                </Text>
                            </Pressable>
                            <Pressable style={notificationStyles.modalBtn} onPress={onClose}>
                                <Text style={notificationStyles.modalActionText}>Đóng</Text>
                            </Pressable>
                        </View>
                    </View>
                    {isLoading && notifications.length === 0 ? (
                        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                            <ActivityIndicator color="#2994f2" />
                        </View>
                    ) : (
                        <FlatList
                            data={notifications}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <Pressable 
                                    style={notificationStyles.notificationItem}
                                    onPress={() => onNotificationPress(item)}
                                >
                                    {item.actorAvatar ? (
                                        <Image source={{ uri: item.actorAvatar }} style={notificationStyles.notificationAvatar} />
                                    ) : (
                                        <Image source={{ uri: DEFAULT_AVATAR }} style={notificationStyles.notificationAvatar} />
                                    )}
                                    <View style={notificationStyles.notificationContent}>
                                        <Text style={notificationStyles.notificationTitle}>{item.message}</Text>
                                        <Text style={notificationStyles.notificationTime}>{item.relativeTime}</Text>
                                    </View>
                                </Pressable>
                            )}
                            ListEmptyComponent={() => (
                                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                                    <Text style={{ color: '#666' }}>Bạn chưa có thông báo nào.</Text>
                                </View>
                            )}
                            ListFooterComponent={() =>
                                isFetchingMore ? (
                                    <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                                        <ActivityIndicator color="#2994f2" size="small" />
                                    </View>
                                ) : null
                            }
                            refreshing={isFetching && notifications.length > 0}
                            onRefresh={onRefresh}
                            onEndReached={handleEndReached}
                            onEndReachedThreshold={0.2}
                            contentContainerStyle={{ paddingBottom: 8 }}
                        />
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}