import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, FlatList, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

// =================================================================
// 1. DỮ LIỆU VÀ INTERFACE
// =================================================================
const CURRENT_USER_ID = 'my_id'; 
const CURRENT_USER_AVATAR = 'https://randomuser.me/api/portraits/men/1.jpg'; 

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  time: string;
  likes: number;
  isLikedByMe: boolean;
  replies: Comment[]; // Đảm bảo luôn tồn tại
}

interface Post {
  id: string;
  userId: string;
  avatar: string;
  name: string;
  content: string;
  image?: string; 
  time: string;
  likes: number;
  isLikedByMe: boolean;
  comments: Comment[]; 
}

interface Story {
    id: string;
    userId: string;
    avatar: string;
    name: string;
    isViewed: boolean;
}

const storiesData: Story[] = [
    { id: 's1', userId: CURRENT_USER_ID, avatar: CURRENT_USER_AVATAR, name: 'Tạo mới', isViewed: false },
    { id: 's2', userId: 'u1', avatar: 'https://randomuser.me/api/portraits/men/12.jpg', name: 'Bạn A', isViewed: false },
    { id: 's3', userId: 'u2', avatar: 'https://randomuser.me/api/portraits/women/31.jpg', name: 'Bạn B', isViewed: true },
    { id: 's4', userId: 'u3', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', name: 'Bạn C', isViewed: false },
    { id: 's5', userId: 'u4', avatar: 'https://randomuser.me/api/portraits/women/67.jpg', name: 'Bạn D', isViewed: false },
    { id: 's6', userId: 'u5', avatar: 'https://randomuser.me/api/portraits/men/88.jpg', name: 'Bạn E', isViewed: true },
];

const initialPosts: Post[] = [
  {
    id: 'p1',
    userId: 'u1',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    name: 'Bạn A',
    content: 'Hôm nay thật tuyệt vời! Cảm ơn mọi người đã đồng hành cùng tôi.',
    image: 'https://images.unsplash.com/photo-1465101046530-773398c7f28ca?auto=format&fit=crop&w=800&q=80',
    time: '1 giờ trước',
    likes: 15,
    isLikedByMe: false,
    comments: [
      { id: 'c1', userId: 'u2', userName: 'Bạn B', userAvatar: 'https://randomuser.me/api/portraits/women/31.jpg', content: 'Đồng ý luôn!', time: '50 phút trước', likes: 2, isLikedByMe: false, replies: [] }, // ĐÃ SỬA
      { 
        id: 'c2', 
        userId: 'u3', 
        userName: 'Bạn C', 
        userAvatar: 'https://randomuser.me/api/portraits/men/45.jpg', 
        content: 'Tuyệt vời quá!', 
        time: '30 phút trước', 
        likes: 5, 
        isLikedByMe: true, 
        replies: [ 
            { id: 'r1', userId: CURRENT_USER_ID, userName: 'Tôi', userAvatar: CURRENT_USER_AVATAR, content: 'Cảm ơn bạn nhé!', time: '10 phút trước', likes: 0, isLikedByMe: false, replies: [] } // ĐÃ SỬA
        ]
      },
    ],
  },
  {
    id: 'p2',
    userId: 'u2',
    avatar: 'https://randomuser.me/api/portraits/women/31.jpg',
    name: 'Bạn B',
    content: 'Cũng lâu lắm mình mới đăng ảnh, mọi người thấy sao?',
    image: '', 
    time: '3 giờ trước',
    likes: 22,
    isLikedByMe: true,
    comments: [
      { id: 'c3', userId: 'u1', userName: 'Bạn A', userAvatar: 'https://randomuser.me/api/portraits/men/12.jpg', content: 'Xinh quá B ơi!', time: '2 giờ trước', likes: 10, isLikedByMe: true, replies: [] }, // ĐÃ SỬA
    ],
  },
];

// =================================================================
// 2. CÁC COMPONENTS CON
// =================================================================

// StoryItem Component
function StoryItem({ story }: { story: Story }) {
    const isMine = story.userId === CURRENT_USER_ID;
    const borderColor = story.isViewed || isMine ? '#ccc' : '#2994f2';
    const borderWidth = story.isViewed ? 1.5 : 2.5;

    return (
        <Pressable 
            style={wallStyles.storyItem} 
            android_ripple={{ color: '#eee', borderless: true }}
            onPress={() => Alert.alert("Story", isMine ? "Tạo Khoảnh khắc mới" : `Xem Story của ${story.name}`)}
        >
            <View style={[wallStyles.storyAvatarWrap, { borderColor, borderWidth }]}>
                <Image source={{ uri: story.avatar }} style={wallStyles.storyAvatar} />
                {isMine && (
                    <View style={wallStyles.storyAdd}>
                        <Feather name="plus" size={15} color="#fff" />
                    </View>
                )}
            </View>
            <Text style={wallStyles.storyName} numberOfLines={1}>{isMine ? 'Bạn' : story.name}</Text>
        </Pressable>
    );
}

// CommentReplyItem Component (Hiển thị phản hồi con)
function CommentReplyItem({ reply }: { reply: Comment }) {
    return (
        <View style={wallStyles.commentItemReply}>
            <Image source={{ uri: reply.userAvatar }} style={wallStyles.commentAvatarSmall} />
            <View style={wallStyles.commentContentWrap}>
                <Text style={wallStyles.commentUser}>{reply.userName}</Text>
                <Text style={wallStyles.commentText}>{reply.content}</Text>
                <View style={wallStyles.commentActions}>
                    <Text style={wallStyles.commentTime}>{reply.time}</Text>
                    <Text style={wallStyles.commentActionText}>Thích ({reply.likes})</Text>
                </View>
            </View>
            <Pressable style={{padding:4}} onPress={() => Alert.alert("Thích Reply", `Bạn đã thích phản hồi của ${reply.userName}`)}>
                <Ionicons 
                    name={reply.isLikedByMe ? "heart" : "heart-outline"} 
                    size={14} 
                    color={reply.isLikedByMe ? "#ff6b6b" : "#999"} 
                />
            </Pressable>
        </View>
    );
}

// PostItem Component (Đã sửa lỗi và tối ưu hóa)
function PostItem({ post, onLikePost, onAddComment, onAddReply }: {
  post: Post;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onAddReply: (postId: string, commentId: string, replyText: string) => void; 
}) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  
  const [replyingTo, setReplyingTo] = useState<{ commentId: string, userName: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  const handlePostComment = () => {
    if (newCommentText.trim()) {
      onAddComment(post.id, newCommentText);
      setNewCommentText('');
    }
  };

  const handlePostReply = () => {
    if (replyText.trim() && replyingTo) {
      onAddReply(post.id, replyingTo.commentId, replyText);
      setReplyText('');
      setReplyingTo(null); 
    }
  };
  
  const handleReplyButton = (commentId: string, userName: string) => {
      setReplyingTo({ commentId, userName });
  };


  return (
    <Animatable.View animation="fadeInUp" duration={500} style={wallStyles.post}>
      {/* Header bài đăng */}
      <View style={wallStyles.postHeader}>
        <Image source={{ uri: post.avatar }} style={wallStyles.avatar} />
        <View style={{ marginLeft: 8, flex: 1 }}>
          <Text style={wallStyles.name}>{post.name}</Text>
          <Text style={wallStyles.time}>{post.time}</Text>
        </View>
        <Pressable style={{ padding: 5 }} onPress={() => Alert.alert("Tùy chọn", "Bạn muốn: Chỉnh sửa, Xóa hay Báo cáo bài viết này?")}>
          <Feather name="more-horizontal" size={20} color="#777" />
        </Pressable>
      </View>

      {/* Nội dung bài đăng */}
      <Text style={wallStyles.content}>{post.content}</Text>
      {post.image ? (
        <Animatable.Image animation="zoomIn" duration={600} source={{ uri: post.image }} style={wallStyles.postImage} />
      ) : null}

      {/* Thanh hành động (Likes, Comments, Shares) */}
      <View style={wallStyles.postActionsBar}>
        <Pressable onPress={() => onLikePost(post.id)} style={wallStyles.actionButton}>
          <Ionicons
            name={post.isLikedByMe ? "heart" : "heart-outline"}
            size={24}
            color={post.isLikedByMe ? "#ff6b6b" : "#666"}
          />
          <Text style={wallStyles.actionText}>{post.likes > 0 ? post.likes : ''}</Text>
        </Pressable>

        <Pressable onPress={() => setShowCommentInput(!showCommentInput)} style={wallStyles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#666" />
          <Text style={wallStyles.actionText}>{post.comments.length > 0 ? post.comments.length : ''}</Text>
        </Pressable>

        <Pressable style={wallStyles.actionButton} onPress={() => Alert.alert("Chia sẻ", "Bạn muốn chia sẻ bài viết này?")}>
          <Feather name="send" size={22} color="#666" />
        </Pressable>
      </View>
      
      {/* Hiển thị lượt thích tóm tắt */}
      {post.likes > 0 && (
          <Text style={wallStyles.likesSummary}>
              <Ionicons name="heart-sharp" size={12} color="#ff6b6b" /> 
              {` ${post.likes} lượt thích`}
          </Text>
      )}

      {/* Phần Comment Input Chính */}
      {showCommentInput && (
        <View style={wallStyles.commentInputContainer}>
          <Image source={{ uri: CURRENT_USER_AVATAR }} style={wallStyles.commentAvatar} />
          <TextInput
            style={wallStyles.commentInput}
            placeholder="Viết bình luận..."
            placeholderTextColor="#aaa"
            value={newCommentText}
            onChangeText={setNewCommentText}
            onSubmitEditing={handlePostComment}
            returnKeyType="send"
          />
          <Pressable onPress={handlePostComment} style={wallStyles.sendCommentButton}>
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* Phần Comment List */}
      {post.comments.length > 0 && (
        <View style={wallStyles.commentsSection}>
          {post.comments.map((comment, commentIdx) => (
            <View key={comment.id}>
                {/* Comment chính */}
                <Animatable.View animation="fadeInLeft" duration={300} delay={commentIdx * 50} style={wallStyles.commentItem}>
                    <Image source={{ uri: comment.userAvatar }} style={wallStyles.commentAvatar} />
                    <View style={wallStyles.commentContentWrap}>
                        <Text style={wallStyles.commentUser}>{comment.userName}</Text>
                        <Text style={wallStyles.commentText}>{comment.content}</Text>
                        <View style={wallStyles.commentActions}>
                            <Text style={wallStyles.commentTime}>{comment.time}</Text>
                            <Text style={wallStyles.commentActionText}>Thích ({comment.likes})</Text>
                            {/* Nút Phản hồi */}
                            <Pressable onPress={() => handleReplyButton(comment.id, comment.userName)}>
                                <Text style={[wallStyles.commentActionText, {fontWeight: '700', color: '#2994f2'}]}>Phản hồi</Text>
                            </Pressable>
                        </View>
                    </View>
                    <Pressable style={{padding:4}} onPress={() => Alert.alert("Thích Comment", `Bạn đã thích bình luận của ${comment.userName}`)}>
                        <Ionicons 
                            name={comment.isLikedByMe ? "heart" : "heart-outline"} 
                            size={16} 
                            color={comment.isLikedByMe ? "#ff6b6b" : "#999"} 
                        />
                    </Pressable>
                </Animatable.View>
                
                {/* Khung Phản hồi (Sub Chat) */}
                {replyingTo && replyingTo.commentId === comment.id && (
                    <Animatable.View animation="fadeInUp" duration={300} style={wallStyles.replyInputContainer}>
                        <Image source={{ uri: CURRENT_USER_AVATAR }} style={wallStyles.commentAvatarSmall} />
                        <TextInput
                            style={wallStyles.replyInput}
                            placeholder={`Phản hồi ${replyingTo.userName}...`}
                            placeholderTextColor="#999"
                            value={replyText}
                            onChangeText={setReplyText}
                            onSubmitEditing={handlePostReply}
                            returnKeyType="send"
                            autoFocus={true}
                        />
                        <Pressable onPress={handlePostReply} style={wallStyles.sendCommentButtonSmall}>
                            <Ionicons name="send" size={18} color="#fff" />
                        </Pressable>
                    </Animatable.View>
                )}

                {/* Hiển thị danh sách Phản hồi con (Đã an toàn) */}
                {comment.replies && comment.replies.length > 0 && (
                    <View style={wallStyles.repliesList}>
                        {comment.replies.map((reply) => (
                            <CommentReplyItem key={reply.id} reply={reply} />
                        ))}
                    </View>
                )}
            </View>
          ))}
        </View>
      )}
    </Animatable.View>
  );
}

// =================================================================
// 3. COMPONENT CHÍNH: WallScreen
// =================================================================
export default function WallScreen() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [stories] = useState<Story[]>(storiesData);

  const handleLikePost = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? { ...p, isLikedByMe: !p.isLikedByMe, likes: p.isLikedByMe ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleAddComment = (postId: string, commentText: string) => {
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c${Date.now()}`,
                  userId: CURRENT_USER_ID,
                  userName: 'Tôi', 
                  userAvatar: CURRENT_USER_AVATAR,
                  content: commentText,
                  time: 'Vừa xong',
                  likes: 0,
                  isLikedByMe: false,
                  replies: [] // ĐẢM BẢO KHỞI TẠO MẢNG
                },
              ],
            }
          : p
      )
    );
  };

  const handleAddReply = (postId: string, commentId: string, replyText: string) => {
    setPosts(prevPosts =>
        prevPosts.map(p =>
            p.id === postId
                ? {
                    ...p,
                    comments: p.comments.map(c =>
                        c.id === commentId
                            ? {
                                ...c,
                                replies: [
                                    ...c.replies,
                                    {
                                        id: `r${Date.now()}`,
                                        userId: CURRENT_USER_ID,
                                        userName: 'Tôi',
                                        userAvatar: CURRENT_USER_AVATAR,
                                        content: replyText,
                                        time: 'Vừa xong',
                                        likes: 0,
                                        isLikedByMe: false,
                                        replies: [] // ĐẢM BẢO KHỞI TẠO MẢNG
                                    },
                                ],
                            }
                            : c
                    ),
                }
                : p
        )
    );
  };

  return (
    <SafeAreaView style={wallStyles.safeArea} edges={['top', 'left', 'right']}>
      <View style={wallStyles.container}>
        {/* Header */}
        <Animatable.View animation="bounceInDown" duration={650} style={wallStyles.headerBox}>
          <Text style={wallStyles.headerTitle}>Tường nhà</Text>
          <Animatable.View animation="bounceIn" delay={150} style={{marginLeft:'auto',position:'relative'}}>
            <Pressable style={{minWidth:36, alignItems:'center', justifyContent:'center'}} onPress={() => Alert.alert("Thông báo", "Bạn có thông báo mới!")}>
              <Ionicons name="notifications-outline" size={25} color="#fff" />
              <View style={wallStyles.redDot}/>
            </Pressable>
          </Animatable.View>
        </Animatable.View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Stories */}
          <Animatable.View animation="fadeInLeft" duration={600} delay={100} style={wallStyles.storiesContainer}>
            <FlatList
                data={stories}
                renderItem={({ item }) => <StoryItem story={item} />}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={wallStyles.storiesListContent}
            />
          </Animatable.View>
          
          {/* Danh sách bài đăng */}
          <FlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <PostItem 
                    post={item} 
                    onLikePost={handleLikePost} 
                    onAddComment={handleAddComment} 
                    onAddReply={handleAddReply} 
                />
            )}
            showsVerticalScrollIndicator={false}
            style={wallStyles.postsList}
            scrollEnabled={false} 
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// =================================================================
// 4. STYLESHEET
// =================================================================
const wallStyles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8fafd' }, 
    container: { flex: 1, backgroundColor: '#f8fafd' },
    headerBox: {
        flexDirection: 'row', alignItems: 'center', height: 60, backgroundColor: '#028fe7',
        paddingHorizontal: 16, elevation: 3, 
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3,
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 0.5 },
    redDot:{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'red', position: 'absolute', top: 4, right: 1, borderColor:'#fff', borderWidth:1 },

    // --- STORIES ---
    storiesContainer: {
        paddingVertical: 10, backgroundColor: '#fff', marginBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee',
    },
    storiesListContent: { paddingHorizontal: 15 },
    storyItem: { alignItems: 'center', marginRight: 15, width: 65 },
    storyAvatarWrap: {
        width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center',
        position: 'relative', marginBottom: 5, backgroundColor: '#eee',
    },
    storyAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#ddd' },
    storyAdd: {
        position: 'absolute', bottom: 0, right: 0, backgroundColor: '#028fe7',
        width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5, borderColor: '#fff',
    },
    storyName: { fontSize: 12, color: '#333', textAlign: 'center' },

    // --- POSTS ---
    postsList: { paddingTop: 5 },
    post: {
        backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, marginHorizontal: 12,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor:'#eee' },
    name: { fontWeight: 'bold', fontSize: 16, color: '#222' },
    time: { color: '#888', fontSize: 12, marginTop: 2 },
    content: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 10 },
    postImage: { width: '100%', height: 250, borderRadius: 8, resizeMode: 'cover', marginBottom: 10 },
    
    // --- POST ACTIONS ---
    postActionsBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
        paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee', marginTop: 5,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee',
    },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingRight: 25, paddingVertical: 5 },
    actionText: { marginLeft: 6, fontSize: 14, color: '#666', fontWeight: '500' },
    likesSummary: { 
        fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8, paddingTop: 5,
    },

    // --- COMMENTS ---
    commentsSection: { marginTop: 10, paddingTop: 10 },
    commentItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    commentAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8, backgroundColor: '#eee' },
    commentContentWrap: { flex: 1 },
    commentUser: { fontWeight: 'bold', fontSize: 13, color: '#333', marginBottom: 2 },
    commentText: { fontSize: 14, color: '#444' },
    commentActions: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
    commentTime: { fontSize: 11, color: '#999', marginRight: 10 },
    commentActionText: { fontSize: 11, color: '#777', fontWeight: '500', marginRight: 10 },
    
    commentInputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9',
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, marginTop: 10,
        borderWidth: StyleSheet.hairlineWidth, borderColor: '#eee',
    },
    commentInput: { flex: 1, height: 38, fontSize: 14, color: '#333', paddingHorizontal: 8 },
    sendCommentButton: {
        backgroundColor: '#2994f2', borderRadius: 15, width: 30, height: 30,
        justifyContent: 'center', alignItems: 'center', marginLeft: 5,
    },
    
    // --- REPLIES & SUB CHAT STYLES ---
    repliesList: {
        marginLeft: 45, 
        marginTop: 5,
        borderLeftWidth: 2,
        borderLeftColor: '#f0f0f0',
        paddingLeft: 10,
    },
    commentItemReply: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    commentAvatarSmall: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        marginRight: 8,
        backgroundColor: '#eee',
    },
    sendCommentButtonSmall: {
        backgroundColor: '#2994f2',
        borderRadius: 12,
        width: 25,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5,
    },
    replyInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginTop: 5,
        marginBottom: 10,
        marginLeft: 45, 
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#ddd',
        elevation: 1,
    },
    replyInput: {
        flex: 1,
        height: 35,
        fontSize: 14,
        color: '#333',
        paddingHorizontal: 8,
    },
});