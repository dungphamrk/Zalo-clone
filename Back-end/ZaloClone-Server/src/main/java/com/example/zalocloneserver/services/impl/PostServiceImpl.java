package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.dto.req.PostRequestDTO;
import com.example.zalocloneserver.dto.res.PostMediaResponse;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.base.DataResponse;
import com.example.zalocloneserver.dto.res.post.PostResponse;
import com.example.zalocloneserver.dto.res.user.UserProfileResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import com.example.zalocloneserver.model.constants.MediaType;
import com.example.zalocloneserver.model.constants.Visibility;
import com.example.zalocloneserver.model.entity.Post;
import com.example.zalocloneserver.model.entity.PostMedia;
import com.example.zalocloneserver.model.entity.PostReaction;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.*;
import com.example.zalocloneserver.security.principle.MyUserDetails;
import com.example.zalocloneserver.services.IPostService;
import com.example.zalocloneserver.services.cloudinary.CloudinaryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
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

    @Override
    @Transactional
    public APIResponse<PostResponse> createPost(PostRequestDTO request){
        MyUserDetails currentUserDetails = (MyUserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        if(currentUserDetails == null){
            throw new NoSuchElementException("Không tìm thầy người dùng");
        }

        User currentUser = userRepository.findById(currentUserDetails.getId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thầy người dùng"));

        List<MultipartFile> mediaFiles = request.getMediaFiles();
        if (mediaFiles.isEmpty()) {
            throw new IllegalArgumentException("Cần ít nhất 1 file media");
        }
        boolean hasVideo = mediaFiles.stream().anyMatch(f -> Objects.requireNonNull(f.getContentType()).startsWith("video"));
        boolean hasImage = mediaFiles.stream().anyMatch(f -> Objects.requireNonNull(f.getContentType()).startsWith("image"));
        List<PostMediaResponse> mediaList;
        if (hasVideo) {
            try{
                MultipartFile video = mediaFiles.getFirst();
                String url = cloudinaryService.uploadVideo(video);
                mediaList = List.of(PostMediaResponse.builder()
                        .url(url)
                        .type(MediaType.VIDEO)
                        .build());
            }catch (IOException e){
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

        Post post = Post.builder()
                .content(request.getContent())
                .visibility(request.getVisibility())
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

        return APIResponse.<PostResponse>builder()
                .data(new DataResponse<>(response))
                .statusCode(HttpStatus.CREATED)
                .message("Bài đăng đã được tạo")
                .build();
    }

//    @Override
//    public APIResponse<List<PostResponse>> getFeeds() {
//        MyUserDetails currentUserDetails = (MyUserDetails) SecurityContextHolder
//                .getContext()
//                .getAuthentication()
//                .getPrincipal();
//
//        if (currentUserDetails == null) {
//            throw new NoSuchElementException("Không tìm thấy người dùng");
//        }
//
//        User currentUser = userRepository.findById(currentUserDetails.getId())
//                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));
//
//        List<Follow> followings = followRepository.findByFollowerAndStatus(currentUser, EFollowStatus.ACCEPTED);
//
//        List<User> followingUsers = followings.stream()
//                .map(Follow::getFollowing)
//                .toList();
//
//        followingUsers = Stream.concat(followingUsers.stream(), Stream.of(currentUser))
//                .toList();
//
//        List<Post> posts = postRepository.findByUserInOrderByCreatedAtDesc(followingUsers);
//        List<Post> postsWithMedia = postRepository.findAllWithMedia(posts);
//        return getListAPIResponse(postsWithMedia);
//    }

    private APIResponse<List<PostResponse>> getListAPIResponse(List<Post> posts){
        List<PostResponse> response = posts.stream()
                .map(post -> {
                    List<PostMediaResponse> mediaList = post.getMedia().stream()
                            .map(m -> PostMediaResponse.builder()
                                    .id(m.getId())
                                    .url(m.getUrl())
                                    .type(m.getType())
                                    .build())
                            .toList();

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
                            .totalReactions(0)
                            .totalComments(0)
                            .reactedByCurrentUser(false)
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
        MyUserDetails currentUserDetails = (MyUserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        if (currentUserDetails == null) {
            throw new NoSuchElementException("Không tìm thấy người dùng");
        }

        User currentUser = userRepository.findById(currentUserDetails.getId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        List<Post> posts = postRepository.findByUserByCreateAtDesc(currentUser);
        List<Post> postsWithMedia = postRepository.findAllWithMedia(posts);
        return getListAPIResponse(postsWithMedia);
    }

    @Override
    public APIResponse<List<PostResponse>> getOtherPosts(long userId){
        MyUserDetails currentUserDetails = (MyUserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        User currentUser = userRepository.findById(currentUserDetails.getId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));


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
        MyUserDetails currentUserDetails =
                (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        User currentUser = userRepository.findById(currentUserDetails.getId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

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
        MyUserDetails currentUserDetails =
                (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

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
                .reactedByCurrentUser(postReactionRepository.existsByPostIdAndUserId(postId, currentUserDetails.getId()))
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
}
