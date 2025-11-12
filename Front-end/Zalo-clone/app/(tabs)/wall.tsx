import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, FlatList, TextInput, Alert, ActivityIndicator, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Story, Post, Comment } from '@/types/interfaces/wall.interface';
import {
  useStories,
  usePosts,
  useToggleLikePost,
  useAddComment,
  useAddReply,
  useComments,
  useCreatePost,
} from '@/hooks/wall/useWall';
import { useProfileQuery } from '@/hooks/profile/useProfile';
import { useNotifications, NotificationViewModel } from '@/hooks';
import { useRouter } from 'expo-router';
import { NotificationType } from '@/enums/notification.enum';
import { useSendFriendRequestMutation } from '@/hooks/contacts/useContacts';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

type StoryItemData = Story & { isCreate?: boolean };

type CurrentUserInfo = {
  id: string;
  name: string;
  avatar: string;
};

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=60';

// Image Gallery Component để hiển thị nhiều ảnh
function ImageGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const modalScrollRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  const galleryItemWidth = screenWidth - 48; // Trừ padding của post (12*2 + 12*2)

  // Scroll to initial index when modal opens
  useEffect(() => {
    if (modalVisible && modalScrollRef.current) {
      setTimeout(() => {
        modalScrollRef.current?.scrollTo({
          x: modalIndex * screenWidth,
          animated: false,
        });
      }, 100);
    }
  }, [modalVisible, modalIndex, screenWidth]);

  if (!images || images.length === 0) return null;

  const handleImagePress = (index: number) => {
    setModalIndex(index);
    setModalVisible(true);
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  return (
    <>
      <View style={wallStyles.imageGalleryContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={wallStyles.imageGalleryScroll}
        >
          {images.map((imageUri, index) => (
            <Pressable
              key={index}
              onPress={() => handleImagePress(index)}
              style={[wallStyles.imageGalleryItem, { width: galleryItemWidth }]}
            >
              <Image source={{ uri: imageUri }} style={wallStyles.postImage} />
            </Pressable>
          ))}
        </ScrollView>
        
        {/* Indicator dots */}
        {images.length > 1 && (
          <View style={wallStyles.imageGalleryIndicators}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  wallStyles.imageGalleryDot,
                  index === currentIndex && wallStyles.imageGalleryDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={wallStyles.imageModalOverlay}>
          <SafeAreaView style={wallStyles.imageModalContainer}>
            {/* Header */}
            <View style={wallStyles.imageModalHeader}>
              <Text style={wallStyles.imageModalCounter}>
                {modalIndex + 1} / {images.length}
              </Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={wallStyles.imageModalCloseButton}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
            </View>

            {/* Image ScrollView */}
            <ScrollView
              ref={modalScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const slideSize = event.nativeEvent.layoutMeasurement.width;
                const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
                setModalIndex(index);
              }}
              style={wallStyles.imageModalScrollView}
            >
              {images.map((imageUri, index) => (
                <View key={index} style={[wallStyles.imageModalItem, { width: screenWidth }]}>
                  <Image
                    source={{ uri: imageUri }}
                    style={wallStyles.imageModalImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>

            {/* Bottom indicators */}
            {images.length > 1 && (
              <View style={wallStyles.imageModalIndicators}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      wallStyles.imageModalDot,
                      index === modalIndex && wallStyles.imageModalDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

function StoryItem({ story, onCreate }: { story: StoryItemData; onCreate: () => void }) {
  const isCreate = story.isCreate;
  const borderColor = story.isViewed || isCreate ? '#ccc' : '#2994f2';
  const borderWidth = story.isViewed ? 1.5 : 2.5;

  return (
    <Pressable
      style={wallStyles.storyItem}
      android_ripple={{ color: '#eee', borderless: true }}
      onPress={() => {
        if (isCreate) {
          onCreate();
        } else {
          Alert.alert('Story', `Xem story của ${story.name}`);
        }
      }}
    >
      <View style={[wallStyles.storyAvatarWrap, { borderColor, borderWidth }]}>
        <Image source={{ uri: story.avatar || DEFAULT_AVATAR }} style={wallStyles.storyAvatar} />
        {isCreate && (
          <View style={wallStyles.storyAdd}>
            <Feather name="plus" size={15} color="#fff" />
          </View>
        )}
      </View>
      <Text style={wallStyles.storyName} numberOfLines={1}>
        {isCreate ? 'Tin của bạn' : story.name}
      </Text>
    </Pressable>
  );
}

function CommentReplyItem({ reply }: { reply: Comment }) {
    return (
        <View style={wallStyles.commentItemReply}>
            <Image source={{ uri: reply.userAvatar || DEFAULT_AVATAR }} style={wallStyles.commentAvatarSmall} />
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

type PostItemProps = {
  post: Post;
  currentUser: CurrentUserInfo;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, content: string, onSuccess?: () => void) => void;
  onAddReply: (
    postId: string,
    commentId: string,
    content: string,
    onSuccess?: () => void
  ) => void;
  likePending: boolean;
  commentPending: boolean;
  replyPending: boolean;
};

function PostItem({
  post,
  currentUser,
  onToggleLike,
  onAddComment,
  onAddReply,
  likePending,
  commentPending,
  replyPending,
  onSendFriendRequest,
}: PostItemProps & { onSendFriendRequest?: (userId: string) => void }) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  
  const [replyingTo, setReplyingTo] = useState<{ commentId: string, userName: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const { data: comments = [], isLoading: commentsLoading } = useComments(post.id || '', true);

  const commentCounter = post.commentCount ?? comments.length;

  const handlePostComment = () => {
    if (!newCommentText.trim()) return;
    onAddComment(post.id, newCommentText.trim(), () => {
      setNewCommentText('');
      setShowCommentInput(false);
    });
  };

  const handlePostReply = () => {
    if (!replyText.trim() || !replyingTo) return;
    onAddReply(post.id, replyingTo.commentId, replyText.trim(), () => {
      setReplyText('');
      setReplyingTo(null);
    });
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={wallStyles.name}>{post.name}</Text>
            {post.visibility === 'PRIVATE' && (
              <Ionicons name="lock-closed" size={14} color="#666" />
            )}
          </View>
          <Text style={wallStyles.time}>{post.time}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Nút thêm bạn nếu không phải bạn bè và post là private */}
          {post.visibility === 'PRIVATE' && post.isFriend === false && post.userId !== currentUser.id && (
            <Pressable 
              style={wallStyles.addFriendButton}
              onPress={() => {
                Alert.alert(
                  'Thêm bạn',
                  `Bạn cần kết bạn với ${post.name} để xem bài viết này. Bạn có muốn gửi lời mời kết bạn không?`,
                  [
                    { text: 'Hủy', style: 'cancel' },
                    { 
                      text: 'Gửi lời mời', 
                      onPress: () => {
                        if (onSendFriendRequest && post.userId) {
                          onSendFriendRequest(post.userId);
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Ionicons name="person-add-outline" size={18} color="#2994f2" />
              <Text style={wallStyles.addFriendButtonText}>Thêm bạn</Text>
            </Pressable>
          )}
          <Pressable style={{ padding: 5 }} onPress={() => Alert.alert("Tùy chọn", "Bạn muốn: Chỉnh sửa, Xóa hay Báo cáo bài viết này?")}>
            <Feather name="more-horizontal" size={20} color="#777" />
          </Pressable>
        </View>
      </View>

      {/* Nội dung bài đăng */}
      <Text style={wallStyles.content}>{post.content}</Text>
      
      {/* Hiển thị nhiều ảnh */}
      {post.mediaUrls && post.mediaUrls.length > 0 ? (
        <ImageGallery images={post.mediaUrls} />
      ) : post.image ? (
        <ImageGallery images={[post.image]} />
      ) : null}

      {/* Thanh hành động (Likes, Comments, Shares) */}
      <View style={wallStyles.postActionsBar}>
        <Pressable
          onPress={() => onToggleLike(post.id)}
          style={wallStyles.actionButton}
          disabled={likePending}
        >
          <Ionicons
            name={post.isLikedByMe ? "heart" : "heart-outline"}
            size={24}
            color={post.isLikedByMe ? "#ff6b6b" : "#666"}
          />
          <Text style={wallStyles.actionText}>{post.likes > 0 ? post.likes : ''}</Text>
        </Pressable>

        <Pressable onPress={() => setShowCommentInput(!showCommentInput)} style={wallStyles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#666" />
          <Text style={wallStyles.actionText}>
            {commentCounter && commentCounter > 0 ? commentCounter : ''}
          </Text>
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
          <Image source={{ uri: currentUser.avatar || DEFAULT_AVATAR }} style={wallStyles.commentAvatar} />
          <TextInput
            style={wallStyles.commentInput}
            placeholder={`Bình luận với tên ${currentUser.name}...`}
            placeholderTextColor="#aaa"
            value={newCommentText}
            onChangeText={setNewCommentText}
            onSubmitEditing={handlePostComment}
            returnKeyType="send"
          />
          <Pressable
            onPress={handlePostComment}
            style={wallStyles.sendCommentButton}
            disabled={commentPending}
          >
            {commentPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      )}

      {/* Phần Comment List */}
      <View style={wallStyles.commentsSection}>
        {commentsLoading ? (
          <ActivityIndicator size="small" color="#028fe7" style={{ marginVertical: 8 }} />
        ) : comments.length === 0 ? null : (
        <View style={wallStyles.commentsSection}>
          {comments.map((comment, commentIdx) => (
            <View key={comment.id}>
                {/* Comment chính */}
                <Animatable.View animation="fadeInLeft" duration={300} delay={commentIdx * 50} style={wallStyles.commentItem}>
                    <Image source={{ uri: comment.userAvatar || DEFAULT_AVATAR }} style={wallStyles.commentAvatar} />
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
                        <Image source={{ uri: currentUser.avatar || DEFAULT_AVATAR }} style={wallStyles.commentAvatarSmall} />
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
                        <Pressable
                          onPress={handlePostReply}
                          style={wallStyles.sendCommentButtonSmall}
                          disabled={replyPending}
                        >
                          {replyPending ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Ionicons name="send" size={18} color="#fff" />
                          )}
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
      </View>
    </Animatable.View>
  );
}

// Create Post Modal Component
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function CreatePostModal({ 
  visible, 
  onClose, 
  currentUser, 
  onCreatePost, 
  isPending 
}: { 
  visible: boolean; 
  onClose: () => void; 
  currentUser: CurrentUserInfo;
  onCreatePost: (content: string, mediaFiles: ImagePicker.ImagePickerAsset[], visibility?: 'PUBLIC' | 'PRIVATE') => void;
  isPending: boolean;
}) {
  const [postContent, setPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');

  React.useEffect(() => {
    if (visible) {
      setPostContent('');
      setSelectedImages([]);
      setVisibility('PUBLIC');
    }
  }, [visible]);

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.assets?.length) return;

      // Compress images nếu quá lớn
      const processed: ImagePicker.ImagePickerAsset[] = [];
      for (let m of result.assets) {
        let compressedUri = m.uri;
        if (m.fileSize && m.fileSize > MAX_SIZE) {
          const compressed = await ImageManipulator.manipulateAsync(
            m.uri,
            [{ resize: { width: 1080 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          compressedUri = compressed.uri;
        }
        processed.push({ ...m, uri: compressedUri });
      }

      setSelectedImages([...selectedImages, ...processed]);
    } catch (err) {
      console.error('Error picking images:', err);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    if (!postContent.trim() && selectedImages.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung hoặc chọn ảnh.');
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert('Lỗi', 'Cần ít nhất một ảnh để đăng bài.');
      return;
    }
    // Chỉ gọi một lần, không gọi lại nếu đang pending
    if (isPending) {
      return;
    }
    onCreatePost(postContent.trim(), selectedImages, visibility);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={wallStyles.createPostModalOverlay}>
        <View style={wallStyles.createPostModalContent}>
          <View style={wallStyles.createPostHeader}>
            <Pressable onPress={onClose} disabled={isPending}>
              <Text style={wallStyles.createPostCancel}>Hủy</Text>
            </Pressable>
            <Text style={wallStyles.createPostTitle}>Tạo bài viết</Text>
            <Pressable onPress={handlePost} disabled={isPending || (!postContent.trim() && selectedImages.length === 0)}>
              {isPending ? (
                <ActivityIndicator size="small" color="#2994f2" />
              ) : (
                <Text style={[wallStyles.createPostSubmit, (!postContent.trim() && selectedImages.length === 0) && { opacity: 0.5 }]}>
                  Đăng
                </Text>
              )}
            </Pressable>
          </View>

          <View style={wallStyles.createPostBody}>
            <Image source={{ uri: currentUser.avatar }} style={wallStyles.createPostAvatar} />
            <TextInput
              style={wallStyles.createPostInput}
              placeholder="Bạn đang nghĩ gì?"
              placeholderTextColor="#999"
              value={postContent}
              onChangeText={setPostContent}
              multiline
              maxLength={1000}
            />
          </View>

          {selectedImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8 }}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={wallStyles.createPostImageContainer}>
                    <Image source={{ uri: image.uri }} style={wallStyles.createPostImagePreview} />
                    <Pressable 
                      style={wallStyles.createPostRemoveImage}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#fff" />
                    </Pressable>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <View style={wallStyles.createPostActions}>
            <Pressable style={wallStyles.createPostActionBtn} onPress={pickImages}>
              <Ionicons name="image-outline" size={24} color="#2994f2" />
              <Text style={wallStyles.createPostActionText}>Ảnh ({selectedImages.length})</Text>
            </Pressable>
            
            {/* Chọn chế độ hiển thị */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable 
                style={[wallStyles.visibilityButton, visibility === 'PUBLIC' && wallStyles.visibilityButtonActive]}
                onPress={() => setVisibility('PUBLIC')}
              >
                <Ionicons 
                  name={visibility === 'PUBLIC' ? 'globe' : 'globe-outline'} 
                  size={20} 
                  color={visibility === 'PUBLIC' ? '#2994f2' : '#666'} 
                />
                <Text style={[wallStyles.visibilityButtonText, visibility === 'PUBLIC' && wallStyles.visibilityButtonTextActive]}>
                  Công khai
                </Text>
              </Pressable>
              
              <Pressable 
                style={[wallStyles.visibilityButton, visibility === 'PRIVATE' && wallStyles.visibilityButtonActive]}
                onPress={() => setVisibility('PRIVATE')}
              >
                <Ionicons 
                  name={visibility === 'PRIVATE' ? 'lock-closed' : 'lock-closed-outline'} 
                  size={20} 
                  color={visibility === 'PRIVATE' ? '#2994f2' : '#666'} 
                />
                <Text style={[wallStyles.visibilityButtonText, visibility === 'PRIVATE' && wallStyles.visibilityButtonTextActive]}>
                  Bạn bè
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Notification Modal Component
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
      <TouchableOpacity style={wallStyles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
        <View style={[wallStyles.modalBox, { maxHeight: 500 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontWeight: '700', fontSize: 18 }}>Thông báo</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable
                style={[wallStyles.modalBtn, { marginLeft: 0 }]}
                onPress={onMarkAllAsSeen}
                disabled={isMarkingAll || notifications.length === 0}
              >
                <Text
                  style={[
                    wallStyles.modalActionText,
                    (isMarkingAll || notifications.length === 0) && { opacity: 0.5 },
                  ]}
                >
                  {isMarkingAll ? 'Đang xử lý...' : 'Đánh dấu đã đọc'}
                </Text>
              </Pressable>
              <Pressable
                style={[wallStyles.modalBtn]}
                onPress={onDeleteAll}
                disabled={isDeletingAll || notifications.length === 0}
              >
                <Text
                  style={[
                    wallStyles.modalActionText,
                    { color: '#ff4444' },
                    (isDeletingAll || notifications.length === 0) && { opacity: 0.5 },
                  ]}
                >
                  {isDeletingAll ? 'Đang xóa...' : 'Xóa tất cả'}
                </Text>
              </Pressable>
              <Pressable style={wallStyles.modalBtn} onPress={onClose}>
                <Text style={wallStyles.modalActionText}>Đóng</Text>
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
                  style={wallStyles.notificationItem}
                  onPress={() => onNotificationPress(item)}
                >
                  {item.actorAvatar ? (
                    <Image source={{ uri: item.actorAvatar }} style={wallStyles.notificationAvatar} />
                  ) : (
                    <Image source={{ uri: DEFAULT_AVATAR }} style={wallStyles.notificationAvatar} />
                  )}
                  <View style={wallStyles.notificationContent}>
                    <Text style={wallStyles.notificationTitle}>{item.message}</Text>
                    <Text style={wallStyles.notificationTime}>{item.relativeTime}</Text>
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

export default function WallScreen() {
  const { data: profile } = useProfileQuery();
  const currentUser: CurrentUserInfo = useMemo(() => ({
    id: profile?.id?.toString() ?? '',
    name: profile?.displayName ?? 'Bạn',
    avatar: profile?.avatarUrl ?? DEFAULT_AVATAR,
  }), [profile?.id, profile?.displayName, profile?.avatarUrl]);

  const { data: stories = [], isLoading: storiesLoading } = useStories();
  const {
    data: posts = [],
    isLoading: postsLoading,
    isFetching: postsFetching,
    isFetchingNextPage: postsFetchingNextPage,
    hasNextPage: postsHasNextPage,
    fetchNextPage: postsFetchNextPage,
    refetch: postsRefetch,
    isError: postsError,
    error: postsErrorData,
  } = usePosts();

  const router = useRouter();
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
    deleteAll,
    isDeletingAll,
    refetch: refetchNotifications,
  } = useNotifications();

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const toggleLikeMutation = useToggleLikePost();
  const addCommentMutation = useAddComment();
  const addReplyMutation = useAddReply();
  const createPostMutation = useCreatePost();
  const sendFriendRequestMutation = useSendFriendRequestMutation();

  const handleLikePost = (postId: string) => {
    toggleLikeMutation.mutate(postId);
  };

  const handleAddComment = (
    postId: string,
    commentText: string,
    onSuccess?: () => void,
  ) => {
    addCommentMutation.mutate(
      { postId, data: { content: commentText } },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  const handleAddReply = (
    postId: string,
    commentId: string,
    replyText: string,
    onSuccess?: () => void,
  ) => {
    addReplyMutation.mutate(
      { postId, commentId, data: { content: replyText } },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  const handleCreatePost = (content: string, mediaFiles: ImagePicker.ImagePickerAsset[], visibility?: 'PUBLIC' | 'PRIVATE') => {
    // Tránh gọi lại nếu đang pending
    if (createPostMutation.isPending) {
      return;
    }
    
    createPostMutation.mutate(
      { content, mediaFiles, visibility: visibility || 'PUBLIC' },
      {
        onSuccess: () => {
          setShowCreatePost(false);
        },
        onError: (error) => {
          console.error('[handleCreatePost] Error:', error);
          // Không đóng modal nếu có lỗi để user có thể thử lại
        },
      },
    );
  };

  const handleOpenNotifications = () => {
    refetchNotifications();
    setShowNotification(true);
  };

  const handleMarkAllAsSeen = async () => {
    try {
      await markAllAsSeen();
    } catch (error) {
      console.error('Failed to mark notifications as seen', error);
    }
  };

  const handleDeleteAll = () => {
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
              await deleteAll();
              Alert.alert('Thành công', 'Đã xóa tất cả thông báo.');
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa thông báo.');
            }
          },
        },
      ]
    );
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
          // referenceId là postId, scroll đến post đó trong wall
          // Vì đang ở wall rồi, chỉ cần scroll đến post
          // TODO: Implement scroll to post if needed
          // For now, just stay on wall tab
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

  const handleLoadMore = () => {
    if (postsHasNextPage && !postsFetchingNextPage) {
      postsFetchNextPage();
    }
  };

  const storiesWithCreate: StoryItemData[] = useMemo(() => {
    const createItem: StoryItemData = {
      id: 'create',
      userId: currentUser.id,
      avatar: currentUser.avatar,
      name: currentUser.name || 'Bạn',
      isViewed: false,
      isCreate: true,
    };
    if (!stories || stories.length === 0) {
      return [createItem];
    }
    return [createItem, ...stories];
  }, [stories, currentUser]);

  return (
    <SafeAreaView style={wallStyles.safeArea} edges={['top', 'left', 'right']}>
      <View style={wallStyles.container}>
        {/* Header */}
        <Animatable.View animation="bounceInDown" duration={650} style={wallStyles.headerBox}>
          <Text style={wallStyles.headerTitle}>Tường nhà</Text>
          <View style={{ flexDirection: 'row', marginLeft: 'auto', alignItems: 'center' }}>
            <Pressable 
              style={{ minWidth: 36, alignItems: 'center', justifyContent: 'center', marginRight: 12, position: 'relative' }} 
              onPress={handleOpenNotifications}
            >
              <Ionicons name="notifications-outline" size={25} color="#fff" />
              {notificationUnseenCount > 0 && (
                <View style={wallStyles.redDot}>
                  <Text style={{ color: '#fff', fontSize: 8, fontWeight: '700' }}>
                    {notificationUnseenCount > 9 ? '9+' : notificationUnseenCount}
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable 
              style={{ minWidth: 36, alignItems: 'center', justifyContent: 'center' }} 
              onPress={() => setShowCreatePost(true)}
            >
              <Ionicons name="create-outline" size={25} color="#fff" />
            </Pressable>
          </View>
        </Animatable.View>

        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <Animatable.View animation="fadeInLeft" duration={600} delay={100} style={wallStyles.storiesContainer}>
              {storiesLoading ? (
                <ActivityIndicator size="small" color="#028fe7" style={{ paddingVertical: 16 }} />
              ) : (
                <FlatList
                  data={storiesWithCreate}
                  renderItem={({ item }) => (
                    <StoryItem
                      story={item}
                      onCreate={() => Alert.alert('Khoảnh khắc', 'Tính năng tạo story sẽ có sau.')}
                    />
                  )}
                  keyExtractor={item => item.id?.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={wallStyles.storiesListContent}
                />
              )}
            </Animatable.View>
          }
          renderItem={({ item }) => (
            <PostItem 
              post={item} 
              currentUser={currentUser}
              onToggleLike={handleLikePost} 
              onAddComment={handleAddComment} 
              onAddReply={handleAddReply}
              likePending={toggleLikeMutation.isPending}
              commentPending={addCommentMutation.isPending}
              replyPending={addReplyMutation.isPending}
              onSendFriendRequest={(userId) => {
                const numericId = parseInt(userId, 10);
                if (!isNaN(numericId)) {
                  sendFriendRequestMutation.mutate(
                    { toUserId: numericId },
                    {
                      onSuccess: () => {
                        Alert.alert('Thành công', 'Đã gửi lời mời kết bạn!');
                      },
                      onError: (error) => {
                        Alert.alert('Lỗi', error?.message || 'Không thể gửi lời mời kết bạn.');
                      },
                    }
                  );
                }
              }}
            />
          )}
          ListEmptyComponent={() => {
            if (postsLoading) {
              return (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#028fe7" />
                </View>
              );
            }
            // Kiểm tra nếu có lỗi
            const hasError = postsError || (posts.length === 0 && !postsLoading && postsErrorData);
            return (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Ionicons name="alert-circle-outline" size={48} color="#999" style={{ marginBottom: 12 }} />
                <Text style={{ color: '#666', textAlign: 'center', marginBottom: 8 }}>
                  {hasError 
                    ? 'Không thể tải bài đăng. Vui lòng thử lại sau.' 
                    : 'Chưa có bài đăng nào.'}
                </Text>
                {hasError && (
                  <Pressable 
                    onPress={() => postsRefetch()} 
                    style={{ marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#2994f2', borderRadius: 8 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Thử lại</Text>
                  </Pressable>
                )}
              </View>
            );
          }}
          ListFooterComponent={() => {
            if (postsFetchingNextPage) {
              return (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#028fe7" />
                </View>
              );
            }
            return null;
          }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={postsFetching && !postsFetchingNextPage}
          onRefresh={postsRefetch}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={wallStyles.postsList}
        />

        <CreatePostModal
          visible={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          currentUser={currentUser}
          onCreatePost={handleCreatePost}
          isPending={createPostMutation.isPending}
        />

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
          onDeleteAll={handleDeleteAll}
          isDeletingAll={isDeletingAll}
          onNotificationPress={handleNotificationPress}
        />
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
    addFriendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#e6f4ff',
        borderWidth: 1,
        borderColor: '#2994f2',
        gap: 4,
    },
    addFriendButtonText: {
        fontSize: 12,
        color: '#2994f2',
        fontWeight: '600',
    },
    avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor:'#eee' },
    name: { fontWeight: 'bold', fontSize: 16, color: '#222' },
    time: { color: '#888', fontSize: 12, marginTop: 2 },
    content: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 10 },
    postImage: { width: '100%', height: 250, borderRadius: 8, resizeMode: 'cover', marginBottom: 10 },
    
    // Image Gallery Styles
    imageGalleryContainer: {
        marginBottom: 10,
        position: 'relative',
    },
    imageGalleryScroll: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    imageGalleryItem: {
        // Width sẽ được set động trong component
    },
    imageGalleryIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        gap: 6,
    },
    imageGalleryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    imageGalleryDotActive: {
        backgroundColor: '#fff',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    
    // Image Modal Styles
    imageModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    imageModalContainer: {
        flex: 1,
    },
    imageModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    imageModalCounter: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    imageModalCloseButton: {
        padding: 8,
    },
    imageModalScrollView: {
        flex: 1,
    },
    imageModalItem: {
        // Width sẽ được set động trong component
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageModalImage: {
        width: '100%',
        height: '100%',
    },
    imageModalIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    imageModalDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    imageModalDotActive: {
        backgroundColor: '#fff',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    
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
    // Create Post Modal Styles
    createPostModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    createPostModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: '90%',
    },
    createPostHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    createPostCancel: {
        fontSize: 16,
        color: '#666',
    },
    createPostTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
    },
    createPostSubmit: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2994f2',
    },
    createPostBody: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    createPostAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    createPostInput: {
        flex: 1,
        fontSize: 16,
        color: '#222',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    createPostImageContainer: {
        position: 'relative',
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    createPostImagePreview: {
        width: 120,
        height: 120,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    createPostRemoveImage: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
    },
    createPostActions: {
        flexDirection: 'row',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    createPostActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 12,
    },
    createPostActionText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#2994f2',
        fontWeight: '500',
    },
    visibilityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f5f5f5',
    },
    visibilityButtonActive: {
        borderColor: '#2994f2',
        backgroundColor: '#e6f4ff',
    },
    visibilityButtonText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    visibilityButtonTextActive: {
        color: '#2994f2',
        fontWeight: '600',
    },
    // Notification Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        padding: 16,
    },
    modalBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        elevation: 5,
    },
    modalBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginLeft: 8,
    },
    modalActionText: {
        color: '#2994f2',
        fontWeight: '600',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    notificationAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e4f2fc',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontWeight: '600',
        color: '#1b1b1b',
        fontSize: 14,
    },
    notificationTime: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
});