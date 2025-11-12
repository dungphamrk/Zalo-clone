package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.dto.req.PostRequestDTO;
import com.example.zalocloneserver.dto.req.post.PostRequest;
import com.example.zalocloneserver.dto.res.PostMediaResponse;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.base.DataResponse;
import com.example.zalocloneserver.dto.res.post.PostResponse;
import com.example.zalocloneserver.dto.res.user.UserProfileResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import com.example.zalocloneserver.model.constants.MediaType;
import com.example.zalocloneserver.model.constants.NotificationType;
import com.example.zalocloneserver.model.constants.Visibility;
import com.example.zalocloneserver.model.entity.Friend;
import com.example.zalocloneserver.model.entity.Post;
import com.example.zalocloneserver.model.entity.PostMedia;
import com.example.zalocloneserver.model.entity.PostReaction;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.*;
import com.example.zalocloneserver.security.principle.MyUserDetails;
import com.example.zalocloneserver.services.IPostService;
import com.example.zalocloneserver.services.INotificationService;
import com.example.zalocloneserver.services.cloudinary.CloudinaryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements IPostService {

    private final IPostRepository postRepository;
    private final IUserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final IPostMediaRepository postmediaRepository;
    private final ICommentRepository commentRepository;
//    private final IFollowRepository followRepository;
    private final IPostReactionRepository postReactionRepository;
//    private final IBlockedUserRepository blockedUserRepository;
    private final IFriendRepository friendRepository;
    private final INotificationService notificationService;

    /**
     * Helper method để lấy current user ID một cách an toàn
     * @return User ID
     * @throws NoSuchElementException nếu không tìm thấy user ID
     */
    private Long getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new NoSuchElementException("Không tìm thấy thông tin xác thực");
        }

        var principal = authentication.getPrincipal();
        if (!(principal instanceof MyUserDetails)) {
            throw new NoSuchElementException("Thông tin xác thực không hợp lệ");
        }

        MyUserDetails currentUserDetails = (MyUserDetails) principal;
        Long userId = currentUserDetails.getId();
        
        // Fallback: lấy ID từ user object nếu getId() trả về null
        if (userId == null && currentUserDetails.getUser() != null) {
            userId = currentUserDetails.getUser().getId();
        }
        
        if (userId == null) {
            throw new NoSuchElementException("Không tìm thấy ID người dùng");
        }
        
        return userId;
    }

    /**
     * Helper method để lấy current user một cách an toàn
     * @return User entity
     * @throws NoSuchElementException nếu không tìm thấy user
     */
    private User getCurrentUser() {
        Long userId = getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));
    }

    @Override
    @Transactional
    public APIResponse<PostResponse> createPost(PostRequest request){
        User currentUser = getCurrentUser();

        List<MultipartFile> mediaFiles = request.getMediaFiles();
        if (mediaFiles == null || mediaFiles.isEmpty()) {
            throw new IllegalArgumentException("Cần ít nhất 1 file media");
        }

        boolean hasVideo = mediaFiles.stream().anyMatch(f -> 
            f.getContentType() != null && f.getContentType().startsWith("video"));
        boolean hasImage = mediaFiles.stream().anyMatch(f -> 
            f.getContentType() != null && f.getContentType().startsWith("image"));

        List<PostMediaResponse> mediaList;
        
        if (hasVideo) {
            try {
                MultipartFile video = mediaFiles.get(0);
                String url = cloudinaryService.uploadVideo(video);
                mediaList = List.of(PostMediaResponse.builder()
                        .url(url)
                        .type(MediaType.VIDEO)
                        .build());
            } catch (IOException e) {
                throw new RuntimeException("Upload file lỗi", e);
            }
        } else {
            mediaList = mediaFiles.stream().map(file -> {
                try {
                    String url = cloudinaryService.uploadImage(file);
                    return PostMediaResponse.builder()
                            .url(url)
                            .type(MediaType.IMAGE)
                            .build();
                } catch (IOException e) {
                    throw new RuntimeException("Upload file lỗi", e);
                }
            }).toList();
        }

        // Validate content - cho phép content rỗng nếu có media
        String content = request.getContent();
        if ((content == null || content.trim().isEmpty()) && mediaList.isEmpty()) {
            throw new IllegalArgumentException("Nội dung bài viết hoặc media không được để trống");
        }

        Post post = Post.builder()
                .content(content != null ? content.trim() : "")
                .visibility(request.getVisibility() != null ? request.getVisibility() : Visibility.PUBLIC)
                .user(currentUser)
                .createdAt(LocalDateTime.now())
                .build();

        postRepository.save(post);

        for(PostMediaResponse m : mediaList){
            PostMedia postMedia = PostMedia.builder()
                    .post(post)
                    .url(m.getUrl())
                    .type(m.getType())
                    .build();
            postmediaRepository.save(postMedia);
        }

        PostResponse response = PostResponse.builder()
                .id(post.getId())
                .content(post.getContent().trim())
                .createdAt(post.getCreatedAt())
                .user(UserResponse.builder()
                        .id(currentUser.getId())
                        .username(currentUser.getUsername())
                        .profile(UserProfileResponse.fromEntity(currentUser.getProfile()))
                        .email(currentUser.getEmail())
                        .build())
                .mediaList(mediaList)
                .totalReactions(0)
                .totalComments(0)
                .reactedByCurrentUser(false)
                .build();

        if (post.getVisibility() == Visibility.PUBLIC) {
            String actorName = currentUser.getProfile() != null && currentUser.getProfile().getDisplayName() != null
                    ? currentUser.getProfile().getDisplayName()
                    : currentUser.getUsername();

            String notificationMessage = actorName + " vừa đăng một bài viết mới.";

            Set<User> recipients = friendRepository.findFriendsByUserId(currentUser.getId()).stream()
                    .map(friendRelation -> Objects.equals(friendRelation.getUser().getId(), currentUser.getId())
                            ? friendRelation.getFriend()
                            : friendRelation.getUser())
                    .filter(Objects::nonNull)
                    .filter(friend -> !Objects.equals(friend.getId(), currentUser.getId()))
                    .collect(Collectors.toSet());

            recipients.forEach(friend ->
                    notificationService.createAndSendNotification(
                            friend,
                            currentUser,
                            NotificationType.NEW_POST,
                            post.getId().toString(),
                            notificationMessage
                    )
            );
        }

        return APIResponse.<PostResponse>builder()
                .data(new DataResponse<>(response))
                .statusCode(HttpStatus.CREATED)
                .message("Bài đăng đã được tạo")
                .build();
    }

    @Override
    public APIResponse<List<PostResponse>> getFeeds() {
        User currentUser = getCurrentUser();

        // Lấy danh sách bạn bè
        List<Friend> friendRelations = friendRepository.findFriendsByUserId(currentUser.getId());
        
        // Lấy danh sách user IDs của bạn bè
        List<User> friendUsers = friendRelations.stream()
                .map(friendRelation -> Objects.equals(friendRelation.getUser().getId(), currentUser.getId())
                        ? friendRelation.getFriend()
                        : friendRelation.getUser())
                .filter(Objects::nonNull)
                .filter(friend -> !Objects.equals(friend.getId(), currentUser.getId()))
                .collect(Collectors.toList());

        // Thêm chính mình vào danh sách để lấy cả posts của mình
        List<User> allUsers = Stream.concat(friendUsers.stream(), Stream.of(currentUser))
                .distinct()
                .collect(Collectors.toList());

        // Lấy posts của bạn bè và chính mình
        List<Post> posts = postRepository.findByUserInOrderByCreatedAtDesc(allUsers);
        
        // Tạo Set friend IDs để check nhanh
        Set<Long> friendIds = friendUsers.stream()
                .map(User::getId)
                .collect(Collectors.toSet());
        
        // Lọc posts:
        // - PUBLIC posts: ai cũng xem được
        // - PRIVATE posts: chỉ bạn bè và chính mình xem được
        List<Post> filteredPosts = posts.stream()
                .filter(post -> {
                    Long postUserId = post.getUser().getId();
                    // Posts của chính mình: luôn hiển thị
                    if (Objects.equals(postUserId, currentUser.getId())) {
                        return true;
                    }
                    // PUBLIC posts: ai cũng xem được
                    if (post.getVisibility() == Visibility.PUBLIC) {
                        return true;
                    }
                    // PRIVATE posts: chỉ bạn bè xem được
                    return friendIds.contains(postUserId);
                })
                // Đảm bảo sắp xếp theo createdAt DESC (mới nhất trước) sau khi filter
                .sorted((p1, p2) -> {
                    if (p1.getCreatedAt() == null && p2.getCreatedAt() == null) return 0;
                    if (p1.getCreatedAt() == null) return 1;
                    if (p2.getCreatedAt() == null) return -1;
                    return p2.getCreatedAt().compareTo(p1.getCreatedAt());
                })
                .collect(Collectors.toList());
        
        List<Post> postsWithMedia = postRepository.findAllWithMedia(filteredPosts);
        return getListAPIResponse(postsWithMedia, currentUser.getId(), friendIds);
    }

    private APIResponse<List<PostResponse>> getListAPIResponse(List<Post> posts){
        return getListAPIResponse(posts, null, null);
    }
    
    private APIResponse<List<PostResponse>> getListAPIResponse(List<Post> posts, Long currentUserId, Set<Long> friendIds){
        if (currentUserId == null) {
            try {
                currentUserId = getCurrentUserId();
            } catch (Exception e) {
                // Nếu không lấy được current user ID, tiếp tục với null
            }
        }
        
        final Long finalCurrentUserId = currentUserId;
        final Set<Long> finalFriendIds = friendIds != null ? friendIds : Collections.emptySet();
        
        List<PostResponse> response = posts.stream()
                .map(post -> {
                    List<PostMediaResponse> mediaList = post.getMedia().stream()
                            .map(m -> PostMediaResponse.builder()
                                    .id(m.getId())
                                    .url(m.getUrl())
                                    .type(m.getType())
                                    .build())
                            .toList();

                    // Tính số reactions và comments
                    int totalReactions = post.getReactions() != null ? post.getReactions().size() : 0;
                    int totalComments = commentRepository.findByPost(post).size();
                    boolean reactedByCurrentUser = finalCurrentUserId != null && 
                            postReactionRepository.existsByPostIdAndUserId(post.getId(), finalCurrentUserId);

                    // Xác định isFriend: null nếu là chính mình, true nếu là bạn bè, false nếu không phải
                    Boolean isFriend = null;
                    if (finalCurrentUserId != null && !Objects.equals(post.getUser().getId(), finalCurrentUserId)) {
                        isFriend = finalFriendIds.contains(post.getUser().getId());
                    }

                    return PostResponse.builder()
                            .id(post.getId())
                            .content(post.getContent())
                            .createdAt(post.getCreatedAt())
                            .user(UserResponse.builder()
                                    .id(post.getUser().getId())
                                    .username(post.getUser().getUsername())
                                    .profile(UserProfileResponse.fromEntity(post.getUser().getProfile()))
                                    .email(post.getUser().getEmail())
                                    .build())
                            .mediaList(mediaList)
                            .totalReactions(totalReactions)
                            .totalComments(totalComments)
                            .reactedByCurrentUser(reactedByCurrentUser)
                            .visibility(post.getVisibility())
                            .isFriend(isFriend)
                            .build();
                })
                .toList();

        return APIResponse.<List<PostResponse>>builder()
                .data(new DataResponse<>(response))
                .message("Lấy feeds thành công")
                .build();
    }

    @Override
    public APIResponse<List<PostResponse>> getOwnPosts(){
        User currentUser = getCurrentUser();

        List<Post> posts = postRepository.findByUserByCreateAtDesc(currentUser);
        List<Post> postsWithMedia = postRepository.findAllWithMedia(posts);
        return getListAPIResponse(postsWithMedia);
    }

    @Override
    public APIResponse<List<PostResponse>> getOtherPosts(long userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        User currentUser = getCurrentUser();


        List<Post> posts = postRepository.findByUserByCreateAtDesc(user);
        List<Post> postsWithMedia = postRepository.findAllWithMedia(posts);
        return getListAPIResponse(postsWithMedia);
    }

    @Override
    public APIResponse<PostResponse> changePostVisibility(Long postId, Visibility visibility){

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài đăng"));
        List<PostMedia> postMediaList = postmediaRepository.findByPost(post);

        post.setVisibility(visibility);

        postRepository.save(post);

        List<PostMediaResponse> mediaList = postMediaList.stream()
                .map(m -> PostMediaResponse.builder()
                        .id(m.getId())
                        .url(m.getUrl())
                        .type(m.getType())
                        .build())
                .toList();

        PostResponse response = PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .user(UserResponse.builder()
                        .id(post.getId())
                        .username(post.getUser().getUsername())
                        .profile(UserProfileResponse.fromEntity(post.getUser().getProfile()))
                        .email(post.getUser().getEmail())
                        .build())
                .mediaList(mediaList)
                .totalReactions(0)
                .totalComments(0)
                .reactedByCurrentUser(false)
                .build();

        return APIResponse.<PostResponse>builder()
                .data(new DataResponse<>(response))
                .statusCode(HttpStatus.CREATED)
                .message("Đổi chế độ xem bài viết thành công")
                .build();
    }

    @Override
    @Transactional
    public APIResponse<Void> togglePostReaction(Long postId) {
        User currentUser = getCurrentUser();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài đăng"));

        Optional<PostReaction> existingReaction = postReactionRepository
                .findByPostIdAndUserId(post.getId(), currentUser.getId());

        if (existingReaction.isPresent()) {
            postReactionRepository.delete(existingReaction.get());
            return APIResponse.<Void>builder()
                    .message("Đã bỏ reaction")
                    .statusCode(HttpStatus.NO_CONTENT)
                    .build();
        } else {
            PostReaction newReaction = PostReaction.builder()
                    .post(post)
                    .user(currentUser)
                    .createdAt(LocalDateTime.now())
                    .build();
            postReactionRepository.save(newReaction);
            return APIResponse.<Void>builder()
                    .message("Đã thêm reaction")
                    .statusCode(HttpStatus.CREATED)
                    .build();
        }
    }

    @Override
    public APIResponse<PostResponse> getPostById(Long postId){
        Long currentUserId = getCurrentUserId();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài đăng"));
        List<PostMedia> postMediaList = postmediaRepository.findByPost(post);

        List<PostMediaResponse> mediaList = postMediaList.stream()
                .map(m -> PostMediaResponse.builder()
                        .id(m.getId())
                        .url(m.getUrl())
                        .type(m.getType())
                        .build())
                .toList();

        PostResponse postResponse = PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .totalReactions(post.getReactions().size())
                .totalComments(commentRepository.findByPost(post).size())
                .reactedByCurrentUser(postReactionRepository.existsByPostIdAndUserId(postId, currentUserId))
                .mediaList(mediaList)
                .createdAt(post.getCreatedAt())
                .user(UserResponse.builder()
                        .id(post.getUser().getId())
                        .username(post.getUser().getUsername())
                        .profile(UserProfileResponse.fromEntity(post.getUser().getProfile()))
                        .email(post.getUser().getEmail())
                        .build())
                .build();

        return APIResponse.<PostResponse>builder()
                .data(new DataResponse<>(postResponse))
                .statusCode(HttpStatus.OK)
                .message("Lấy bài đăng thành công")
                .build();
    }
    
    @Override
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }
        
        // Kiểm tra content type, nhưng cho phép null (một số client không gửi)
        if (file.getContentType() != null && !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
        
        try {
            String url = cloudinaryService.uploadImage(file);
            if (url == null || url.isEmpty()) {
                throw new RuntimeException("Cloudinary returned empty URL");
            }
            return url;
        } catch (IOException e) {
            throw new RuntimeException("Upload image lỗi: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error uploading image: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public APIResponse<Void> deletePost(Long postId) {
        User currentUser = getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài đăng"));
        
        // Kiểm tra quyền: chỉ chủ bài viết mới được xóa
        if (!Objects.equals(post.getUser().getId(), currentUser.getId())) {
            throw new SecurityException("Bạn không có quyền xóa bài viết này");
        }
        
        // Xóa các media liên quan
        List<PostMedia> mediaList = postmediaRepository.findByPost(post);
        postmediaRepository.deleteAll(mediaList);
        
        // Xóa các reaction
        postReactionRepository.deleteAll(post.getReactions());
        
        // Xóa các comment (nếu có cascade thì không cần)
        // commentRepository.deleteAll(commentRepository.findByPost(post));
        
        // Xóa bài viết
        postRepository.delete(post);
        
        return APIResponse.<Void>builder()
                .statusCode(HttpStatus.OK)
                .message("Đã xóa bài viết thành công")
                .build();
    }
}
