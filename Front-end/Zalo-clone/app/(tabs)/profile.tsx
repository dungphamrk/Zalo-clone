import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, Modal, TextInput, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Gender } from '@/enums/gender.enum'; 

// --- MOCK API HOOKS (Giữ nguyên) ---
const useUploadAvatarMutation = () => ({ mutate: (uri: string, { onSuccess, onError }: any) => { 
    console.log("Mock Upload Avatar:", uri);
    setTimeout(() => { 
        if (uri.startsWith('http')) {
            onSuccess({ data: { avatar: uri } }); 
        } else {
            onError({ message: 'Lỗi upload mock.' });
        }
    }, 500);
} });
const useUpdateProfileMutation = () => ({ mutate: (payload: any, { onSuccess, onError }: any) => { 
    console.log("Mock Update Profile:", payload); 
    if (payload.displayName === 'lỗi') return onError({ message: 'Tên không hợp lệ.' });
    setTimeout(() => onSuccess({ data: { displayName: payload.displayName, username: payload.username, phone: '0900123456' } }), 500); 
} });
const useChangePasswordMutation = () => ({ mutate: (payload: any, { onSuccess, onError }: any) => { 
    console.log("Mock Change Password:", payload); 
    if (payload.oldPassword === '123') return onError({ message: 'Mật khẩu cũ sai.' });
    setTimeout(() => onSuccess(), 500); 
} });


// --- ĐỊNH NGHĨA TYPES (Đã Sửa Lỗi `replies` circular reference) ---
const TEXT_ONLY_POST_MOCK_IMAGE = 'https://images.unsplash.com/photo-1563207914-f584e03f56e9?auto=format&fit=crop&w=300&q=80';

// Định nghĩa cơ bản cho Comment/Reply
interface BaseComment {
    id: string;
    userName: string;
    content: string;
    time: string;
}
// Định nghĩa Comment hoàn chỉnh (có thể có replies)
interface CommentData extends BaseComment {
    replies: BaseComment[];
}
interface PostData {
    id: string;
    content: string;
    image?: string;
    time: string;
    likes: number;
    comments: CommentData[];
}

const initialUserPosts: PostData[] = [
    { 
        id: 'p1', 
        content: 'Hôm nay trời đẹp quá! ☀️ Cảm ơn mọi người đã đồng hành cùng tôi.', 
        image: 'https://images.unsplash.com/photo-1517446549247-c09a8039b4b7?auto=format&fit=crop&w=300&q=80', 
        time: '1h trước', 
        likes: 15, 
        comments: [
            { id: 'c1', userName: 'Bạn A', content: 'Đồng ý luôn!', time: '50p', replies: [] },
            { id: 'c2', userName: 'Bạn B', content: 'Thật tuyệt vời!', time: '30p', replies: [{ id: 'r1', userName: 'Tôi', content: 'Cảm ơn!', time: '10p' }] }
        ]
    },
    { id: 'p2', content: 'Cũng lâu lắm mình mới đăng ảnh, mọi người thấy sao?', image: 'https://images.unsplash.com/photo-1549414275-c99459392275?auto=format&fit=crop&w=300&q=80', time: '3h trước', likes: 22, comments: [] },
    { id: 'p3', content: 'Chia sẻ một chút về công việc cuối tuần. Cần mẫn và hiệu quả!', image: 'https://images.unsplash.com/photo-1545665277-5937400233fc?auto=format&fit=crop&w=300&q=80', time: '1 ngày trước', likes: 10, comments: [] },
    { id: 'p4', content: 'Đây là bài post chỉ có nội dung text và sẽ dùng ảnh mock.', image: '', time: '5 giờ trước', likes: 5, comments: [] },
    { id: 'p5', content: 'Ảnh mới chụp khi đi chơi biển, gió mát thật!', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80', time: '1 tuần trước', likes: 45, comments: [] },
    { id: 'p6', content: 'Cà phê sáng cùng bạn bè!', image: 'https://images.unsplash.com/photo-1497935321356-9ac7ee38c5d3?auto=format&fit=crop&w=300&q=80', time: '2 tuần trước', likes: 30, comments: [] },
];

// --- COMPONENTS CON ---

const PostItem: React.FC<{ post: PostData; onPress: (post: PostData) => void; }> = ({ post, onPress }) => {
    // Nếu post không có ảnh, dùng ảnh mock
    const displayImage = post.image || TEXT_ONLY_POST_MOCK_IMAGE;

    // SỬA LỖI: Sử dụng Optional Chaining (?) và giá trị mặc định (|| []) để tránh lỗi "reading 'length'"
    const commentCount = post.comments?.length || 0;

    return (
        <Pressable onPress={() => onPress(post)} style={styles.postItemWrapper}>
            <Animatable.View animation="fadeIn" duration={500} style={styles.postItem}>
                {/* Image */}
                <Image source={{ uri: displayImage }} style={styles.postItemImage} />
                
                {/* Overlay hiển thị Likes/Comments */}
                <View style={styles.postOverlay}>
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
    const [name, setName] = useState('Dũng Phạm');
    const [phone, setPhone] = useState('0900123456');
    const [username, setUsername] = useState('dungpham');
    const [avatar, setAvatar] = useState('https://randomuser.me/api/portraits/men/32.jpg');
    const [posts, setPosts] = useState<PostData[]>(initialUserPosts);

    // Modal Flags
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [editInfoVisible, setEditInfoVisible] = useState(false);
    const [changePwdVisible, setChangePwdVisible] = useState(false);
    const [changeAvatarVisible, setChangeAvatarVisible] = useState(false);
    const [postDetailVisible, setPostDetailVisible] = useState(false);
    
    // Temp States
    const [tmpName, setTmpName] = useState(name);
    const [tmpUsername, setTmpUsername] = useState(username);
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [tmpAvatarUrl, setTmpAvatarUrl] = useState(avatar);
    const [selectedPost, setSelectedPost] = useState<PostData | null>(null);

    // Hooks
    const uploadAvatarMutation = useUploadAvatarMutation();
    const updateProfileMutation = useUpdateProfileMutation();
    const changePasswordMutation = useChangePasswordMutation();

    // --- HANDLERS ---

    const navigateToSettings = () => { setSettingsVisible(true); };

    const openEditInfo = () => {
        setTmpName(name); setTmpUsername(username); setSettingsVisible(false); setEditInfoVisible(true);
    };
    
    const openChangePwd = () => {
        setOldPwd(''); setNewPwd(''); setConfirmPwd(''); setSettingsVisible(false); setChangePwdVisible(true);
    };

    const saveEditInfo = () => {
        if (!tmpName.trim()) { Alert.alert('Lỗi', 'Tên không được để trống'); return; }
        updateProfileMutation.mutate({ displayName: tmpName.trim(), username: tmpUsername.trim(), email: '', gender: Gender.OTHER }, {
            onSuccess: (res: any) => {
                setName(res?.data?.displayName || tmpName.trim());
                setUsername(res?.data?.username || tmpUsername.trim());
                setPhone(res?.data?.phone || phone);
                Alert.alert('Thành công', 'Thông tin đã được cập nhật');
                setEditInfoVisible(false);
            },
            onError: (err: any) => Alert.alert('Lỗi', err?.message || 'Cập nhật thất bại')
        });
    };

    const saveChangePwd = () => {
        if (!oldPwd || !newPwd || !confirmPwd) { Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin'); return; }
        if (newPwd !== confirmPwd) { Alert.alert('Lỗi', 'Mật khẩu mới không khớp'); return; }
        changePasswordMutation.mutate({ oldPassword: oldPwd, password: newPwd, confirmPassword: confirmPwd }, {
            onSuccess: () => {
                Alert.alert('Thành công', 'Mật khẩu đã được thay đổi');
                setChangePwdVisible(false);
            },
            onError: (err: any) => Alert.alert('Lỗi', err?.message || 'Đổi mật khẩu thất bại')
        });
    };

    const openPostDetailModal = (post: PostData) => {
        setSelectedPost(post);
        setPostDetailVisible(true);
    };
    
    const deletePost = (postId: string) => {
        Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa bài viết này?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Xóa', style: 'destructive', onPress: () => {
                setPosts(prev => prev.filter(p => p.id !== postId));
                setPostDetailVisible(false);
                Alert.alert('Thành công', 'Bài viết đã được xóa.');
            }}
        ]);
    };

    // --- Avatar Handlers --- 
    const openChangeAvatar = () => { setTmpAvatarUrl(avatar); setChangeAvatarVisible(true); };
    const saveChangeAvatar = () => { 
        if (!tmpAvatarUrl.trim() || !tmpAvatarUrl.startsWith('http')) { 
            Alert.alert('Lỗi', 'URL ảnh không hợp lệ'); 
            return; 
        }
        uploadAvatarMutation.mutate(tmpAvatarUrl.trim(), {
            onSuccess: (res: any) => {
                if (res?.data?.avatar) setAvatar(res.data.avatar as string);
                setChangeAvatarVisible(false);
                Alert.alert('Thành công', 'Avatar đã được cập nhật!');
            },
            onError: (err: any) => {
                Alert.alert('Lỗi', err?.message || 'Tải avatar thất bại');
            }
        });
    };
    const pickImageFromLibrary = async () => { /* Logic pick image */ };
    const takePhotoWithCamera = async () => { /* Logic take photo */ };


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
                            
                            <Text style={styles.userName}>{name}</Text>
                            <Text style={styles.usernameText}>{'@' + username}</Text>
                            <Text style={styles.status}>Điện thoại: {phone}</Text>
                        </View>
                    </Animatable.View>
                    
                    {/* Khu vực Posts cá nhân */}
                    <Animatable.View animation="fadeInUp" duration={500} delay={150} style={styles.postSection}>
                        <Text style={styles.sectionTitle}>Bài đăng của bạn ({posts.length})</Text>
                        
                        <FlatList
                            data={posts}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <PostItem post={item} onPress={openPostDetailModal} />}
                            numColumns={2}
                            scrollEnabled={false}
                            columnWrapperStyle={styles.postRow}
                            contentContainerStyle={{paddingTop: 8, paddingHorizontal: 10}}
                        />

                    </Animatable.View>

                </ScrollView>

                {/* MODAL 1: Cài đặt (Settings) */}
                <Modal visible={settingsVisible} animationType="fade" transparent>
                    <Pressable style={styles.modalOverlay} onPress={() => setSettingsVisible(false)}>
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
                        </Animatable.View>
                    </Pressable>
                </Modal>
                
                {/* MODAL 2: Chỉnh sửa thông tin cá nhân (Edit Info) */}
                <Modal visible={editInfoVisible} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
                            <TextInput style={styles.input} value={tmpName} onChangeText={setTmpName} placeholder="Họ và tên" />
                            <TextInput style={styles.input} value={tmpUsername} onChangeText={setTmpUsername} placeholder="Username" />
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                                <Pressable onPress={() => setEditInfoVisible(false)} style={({ pressed }) => [styles.modalBtn, pressed && { opacity: 0.8 }]}>
                                    <Text style={styles.modalBtnText}>Hủy</Text>
                                </Pressable>
                                <Pressable onPress={saveEditInfo} style={({ pressed }) => [styles.modalPrimaryBtn, pressed && { opacity: 0.9 }]}>
                                    <Text style={[styles.modalBtnText, { color: '#fff' }]}>Lưu</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
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
                
                {/* MODAL 4: Đổi Avatar (Change Avatar) */}
                <Modal visible={changeAvatarVisible} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>Đổi Avatar</Text>
                            <Text style={{ marginBottom: 6, color: '#6b7780' }}>Chọn ảnh hoặc nhập URL (mock)</Text>
                            <TextInput style={styles.input} value={tmpAvatarUrl} onChangeText={setTmpAvatarUrl} placeholder="https://..." />
                            
                            <View style={styles.avatarActionRow}>
                                <Pressable onPress={pickImageFromLibrary} style={({ pressed }) => [styles.avatarActionBtn, pressed && { opacity: 0.8 }]}>
                                    <Text style={styles.avatarActionText}>Thư viện</Text>
                                </Pressable>
                                <Pressable onPress={takePhotoWithCamera} style={({ pressed }) => [styles.avatarActionBtn, pressed && { opacity: 0.8 }]}>
                                    <Text style={styles.avatarActionText}>Chụp ảnh</Text>
                                </Pressable>
                            </View>
                            
                            <View style={{ alignItems: 'center', marginVertical: 12 }}>
                                <Image source={{ uri: tmpAvatarUrl }} style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee', borderWidth: 3, borderColor: '#f0f0f0' }} />
                            </View>
                            
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                                <Pressable onPress={() => setChangeAvatarVisible(false)} style={({ pressed }) => [styles.modalBtn, pressed && { opacity: 0.8 }]}>
                                    <Text style={styles.modalBtnText}>Hủy</Text>
                                </Pressable>
                                <Pressable onPress={saveChangeAvatar} style={({ pressed }) => [styles.modalPrimaryBtn, pressed && { opacity: 0.9 }]}>
                                    <Text style={[styles.modalBtnText, { color: '#fff' }]}>Lưu URL</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* MODAL 5: CHI TIẾT BÀI VIẾT (POST DETAIL) */}
                <Modal visible={postDetailVisible} animationType="slide">
                    <PostDetailModal 
                        post={selectedPost} 
                        onClose={() => setPostDetailVisible(false)}
                        onDelete={deletePost}
                        currentUserName={name}
                    />
                </Modal>

            </View>
        </SafeAreaView>
    );
}

// =================================================================
// 5. POST DETAIL MODAL COMPONENT (ĐÃ SỬA LỖI HOOKS VÀ LOGIC)
// =================================================================

const PostDetailModal: React.FC<{ post: PostData | null, onClose: () => void, onDelete: (postId: string) => void, currentUserName: string }> = ({ post, onClose, onDelete, currentUserName }) => {
    
    // SỬA LỖI: Tất cả Hooks phải được gọi ở đầu cấp cao nhất của component, không được trong if/else
    const [commentText, setCommentText] = useState('');
    // Clone comments từ post. comments để cập nhật local. Đảm bảo post không null.
    const [localComments, setLocalComments] = useState(post?.comments || []); 
    const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);

    // Dùng useEffect để reset localComments nếu post thay đổi
    React.useEffect(() => {
        setLocalComments(post?.comments || []);
    }, [post]);

    if (!post) return null; // Thoát nếu post null (Lưu ý: đặt sau Hooks)

    // Lấy tên người dùng đang được phản hồi (Sau khi xác định post không null)
    const replyingToUser = replyingToCommentId 
        ? localComments.find(c => c.id === replyingToCommentId)?.userName
        : null;


    // HANDLER: ĐĂNG BÌNH LUẬN/PHẢN HỒI
    const handlePostComment = () => {
        if (!commentText.trim()) return;

        const newCommentObj: BaseComment = {
            id: Date.now().toString(),
            userName: currentUserName, 
            content: commentText.trim(),
            time: 'vài giây trước',
        };

        if (replyingToCommentId) {
            // Xử lý Phản hồi
            setLocalComments(prevComments => prevComments.map(c => {
                if (c.id === replyingToCommentId) {
                    return {
                        ...c,
                        // Thêm phản hồi vào cuối danh sách replies của comment đó
                        replies: [...c.replies, newCommentObj],
                    };
                }
                return c;
            }));
            setReplyingToCommentId(null);
        } else {
            // Xử lý Bình luận mới
            const newFullComment: CommentData = { ...newCommentObj, replies: [] };
            // Đăng comment mới lên đầu danh sách
            setLocalComments(prevComments => [newFullComment, ...prevComments]);
        }

        setCommentText('');
    };

    // HANDLER: BẮT ĐẦU PHẢN HỒI
    const handleReplyAction = (commentId: string) => {
        setReplyingToCommentId(commentId);
    };

    // HANDLER: HỦY PHẢN HỒI
    const handleCancelReply = () => {
        setReplyingToCommentId(null);
    };

    // Sub-component: Comment Item
    const CommentItem = ({ comment, index }: { comment: CommentData, index: number }) => (
        <View key={comment.id} style={postDetailStyles.commentItem}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/thumb/men/'+(index+10)+'.jpg' }} style={postDetailStyles.commentAvatar} />
            <View style={{flex: 1}}>
                <Text style={postDetailStyles.commentUser}>{comment.userName}</Text>
                <Text style={postDetailStyles.commentText}>{comment.content}</Text>
                <View style={postDetailStyles.commentActions}>
                    <Text style={postDetailStyles.commentTime}>{comment.time}</Text>
                    <Pressable onPress={() => handleReplyAction(comment.id)}>
                        <Text style={[postDetailStyles.commentTime, { fontWeight: '700', color: '#2994f2' }]}>Phản hồi</Text>
                    </Pressable>
                </View>
                
                {/* Replies */}
                {comment.replies.length > 0 && (
                    <View style={postDetailStyles.repliesList}>
                        {comment.replies.map((reply, replyIndex) => (
                            <View key={reply.id} style={postDetailStyles.replyItem}>
                                <Text style={postDetailStyles.commentUser}>{reply.userName} </Text>
                                <Text style={postDetailStyles.commentText}>{reply.content}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafd' }}>
            <View style={postDetailStyles.header}>
                <Pressable onPress={onClose} style={{padding: 8}}>
                    <Feather name="arrow-left" size={24} color="#181c2b" />
                </Pressable>
                <Text style={postDetailStyles.headerTitle}>Chi tiết bài viết</Text>
                
                {/* Config Button */}
                <Pressable onPress={() => Alert.alert('Quản lý bài viết', 'Bạn muốn làm gì với bài viết này?', [
                    { text: 'Xóa bài', style: 'destructive', onPress: () => onDelete(post.id) },
                    { text: 'Ẩn bài', onPress: () => { Alert.alert('Thao tác', 'Bài viết đã được ẩn (Mock).'); onClose(); } },
                    { text: 'Hủy', style: 'cancel' }
                ])} style={{padding: 8}}>
                    <Feather name="more-vertical" size={24} color="#181c2b" />
                </Pressable>
            </View>
            
            <ScrollView contentContainerStyle={postDetailStyles.contentContainer}>
                {/* Post Content */}
                <View style={postDetailStyles.postContentBox}>
                    <Text style={postDetailStyles.postContentText}>{post.content}</Text>
                    {post.image && (
                        <Image source={{ uri: post.image }} style={postDetailStyles.postImage} />
                    )}
                </View>

                {/* Reaction Summary */}
                <View style={postDetailStyles.reactionsBar}>
                    <Ionicons name="heart" size={14} color="#ff6b6b" />
                    <Text style={postDetailStyles.reactionCount}>{post.likes} lượt thích</Text>
                    <Text style={[postDetailStyles.reactionCount, {marginLeft: 'auto'}]}>{localComments.length} bình luận</Text>
                </View>

                {/* Actions Bar */}
                <View style={postDetailStyles.actionsBar}>
                    <Pressable style={postDetailStyles.actionButton}><Ionicons name="heart-outline" size={20} color="#666" /><Text style={postDetailStyles.actionText}>Thích</Text></Pressable>
                    <Pressable style={postDetailStyles.actionButton}><Ionicons name="chatbubble-outline" size={20} color="#666" /><Text style={postDetailStyles.actionText}>Bình luận</Text></Pressable>
                    <Pressable style={postDetailStyles.actionButton}><Feather name="send" size={20} color="#666" /><Text style={postDetailStyles.actionText}>Chia sẻ</Text></Pressable>
                </View>


                {/* Comments Section (Dùng localComments) */}
                <View style={{paddingHorizontal: 16, marginTop: 10}}>
                    <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>Bình luận ({localComments.length})</Text>
                    
                    {localComments.map((comment, index) => (
                        <CommentItem key={comment.id} comment={comment} index={index} />
                    ))}
                </View>
            </ScrollView>
            
            {/* Input Comment/Reply */}
            <View style={postDetailStyles.commentInputContainer}>
                {replyingToCommentId && (
                    <View style={postDetailStyles.replyTagContainer}>
                        <Text style={postDetailStyles.replyTagText}>Đang trả lời: {replyingToUser}</Text>
                        <Pressable onPress={handleCancelReply}>
                            <Feather name="x" size={16} color="#028fe7" style={{marginLeft: 5}} />
                        </Pressable>
                    </View>
                )}
                <View style={postDetailStyles.commentInputRow}>
                    <TextInput
                        style={postDetailStyles.commentInput}
                        value={commentText}
                        onChangeText={setCommentText}
                        placeholder={replyingToCommentId ? `Phản hồi ${replyingToUser}...` : `Bình luận bằng ${currentUserName}...`}
                        placeholderTextColor="#aaa"
                        multiline
                    />
                    <Pressable 
                        onPress={handlePostComment} 
                        style={({ pressed }) => [postDetailStyles.sendCommentButton, pressed && { opacity: 0.8 }, !commentText.trim() && { backgroundColor: '#ccc' }]}
                        disabled={!commentText.trim()}
                    >
                        <Ionicons name="send" size={20} color="#fff" />
                    </Pressable>
                </View>
            </View>
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
    
    avatarActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    avatarActionBtn: { 
        flex: 1, 
        backgroundColor: '#f3f7fb', 
        borderRadius: 8, 
        paddingVertical: 10, 
        marginHorizontal: 5,
        alignItems: 'center',
    },
    avatarActionText: { color: '#028fe7', fontWeight: '600', fontSize: 14 },
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
});