package com.example.zalocloneserver.services.impl;

import com.example.zalocloneserver.dto.req.CommentRequest;
import com.example.zalocloneserver.dto.req.ReplyRequest;
import com.example.zalocloneserver.dto.res.CommentMapper;
import com.example.zalocloneserver.dto.res.CommentResponse;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.base.DataResponse;
import com.example.zalocloneserver.dto.res.user.UserProfileResponse;
import com.example.zalocloneserver.dto.res.user.UserResponse;
import com.example.zalocloneserver.model.entity.Comment;
import com.example.zalocloneserver.model.entity.CommentReaction;
import com.example.zalocloneserver.model.entity.Post;
import com.example.zalocloneserver.model.entity.User;
import com.example.zalocloneserver.repository.ICommentReactionRepository;
import com.example.zalocloneserver.repository.ICommentRepository;
import com.example.zalocloneserver.repository.IPostRepository;
import com.example.zalocloneserver.repository.IUserRepository;
import com.example.zalocloneserver.security.principle.MyUserDetails;
import com.example.zalocloneserver.services.ICommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements ICommentService {

    private final ICommentRepository commentRepository;
    private final IPostRepository postRepository;
    private final ICommentReactionRepository commentReactionRepository;
    private final IUserRepository userRepository;

    @Override
    public APIResponse<List<CommentResponse>> getCommentsByPostId(Long postId) {
        MyUserDetails currentUserDetails =
                (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        User currentUser = userRepository.findById(currentUserDetails.getId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài viết"));

        List<Comment> allComments = commentRepository.findByPost(post);

        List<CommentResponse> rootComments = new ArrayList<>();
        for (Comment c : allComments) {
            if (c.getParentComment() == null) {
                rootComments.add(CommentMapper.mapToCommentResponse(c, currentUser));
            }
        }
        DataResponse<List<CommentResponse>> response = new DataResponse<>(rootComments);
        return APIResponse.<List<CommentResponse>>builder()
                .data(response)
                .statusCode(HttpStatus.CREATED)
                .message("Lấy danh sách bình luận thành công")
                .build();
    }


    @Override
    public APIResponse<CommentResponse> createComment(CommentRequest commentRequest){
        MyUserDetails currentUserDetails =
                (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        User currentUser = userRepository.findById(currentUserDetails.getId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        Post post = postRepository.findById(commentRequest.getPostId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài viết"));

        Comment parentComment = null;
        Optional<User> replyToUser = Optional.empty();
        if (commentRequest.getParentId() != null) {
            parentComment = commentRepository.findById(commentRequest.getParentId())
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy comment cha"));
            replyToUser = Optional.of(parentComment.getUser());
        }

        Comment comment = Comment.builder()
                .content(commentRequest.getContent())
                .user(currentUser)
                .post(post)
                .parentComment(parentComment)
                .childComments(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        commentRepository.save(comment);

        CommentResponse response = CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .user(UserResponse.builder()
                        .id(comment.getUser().getId())
                        .username(comment.getUser().getUsername())
                        .profile(UserProfileResponse.fromEntity(comment.getUser().getProfile()))
                        .build())
                .createdAt(comment.getCreatedAt())
                .reactionCount(0)
                .reactedByCurrentUser(false)
                .replyToUsername(replyToUser.map(User::getUsername).orElse(null))
                .parentId(parentComment != null ? parentComment.getId() : null)
                .childComments(new ArrayList<>())
                .build();

        return APIResponse.<CommentResponse>builder()
                .data(new DataResponse<>(response))
                .statusCode(HttpStatus.CREATED)
                .message("Bình luận thành công")
                .build();
    }

    @Override
    public APIResponse<CommentResponse> createReply(Long commentId, ReplyRequest replyRequest) {
        MyUserDetails currentUserDetails =
                (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        User currentUser = userRepository.findById(currentUserDetails.getId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        Comment parentComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy comment cha"));

        Post post = parentComment.getPost();
        if (post == null) {
            throw new NoSuchElementException("Không tìm thấy bài viết");
        }

        Comment reply = Comment.builder()
                .content(replyRequest.getContent())
                .user(currentUser)
                .post(post)
                .parentComment(parentComment)
                .childComments(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        commentRepository.save(reply);

        CommentResponse response = CommentResponse.builder()
                .id(reply.getId())
                .content(reply.getContent())
                .user(UserResponse.builder()
                        .id(reply.getUser().getId())
                        .username(reply.getUser().getUsername())
                        .profile(UserProfileResponse.fromEntity(reply.getUser().getProfile()))
                        .build())
                .createdAt(reply.getCreatedAt())
                .reactionCount(0)
                .reactedByCurrentUser(false)
                .replyToUsername(parentComment.getUser().getUsername())
                .parentId(parentComment.getId())
                .childComments(new ArrayList<>())
                .build();

        return APIResponse.<CommentResponse>builder()
                .data(new DataResponse<>(response))
                .statusCode(HttpStatus.CREATED)
                .message("Trả lời bình luận thành công")
                .build();
    }

    @Override
    public APIResponse<Void> deleteComment(Long commentId){
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy comment"));

        commentRepository.delete(comment);

        return APIResponse.<Void>builder()
                .statusCode(HttpStatus.NO_CONTENT)
                .message("Xóa comment thành công")
                .build();
    }

    @Override
    public APIResponse<Void> toggleCommentReaction(Long commentId){
        MyUserDetails currentUserDetails =
                (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        User currentUser = userRepository.findById(currentUserDetails.getId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy người dùng"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy comment"));

        Optional<CommentReaction> existingReaction = comment.getReactions().stream()
                .filter(r -> r.getUser().getId().equals(currentUser.getId()))
                .findFirst();

        if (existingReaction.isPresent()) {
            commentReactionRepository.delete(existingReaction.get());
            comment.getReactions().remove(existingReaction.get());
        } else {
            CommentReaction reaction = CommentReaction.builder()
                    .comment(comment)
                    .user(currentUser)
                    .createdAt(LocalDateTime.now())
                    .build();

            commentReactionRepository.save(reaction);
            comment.getReactions().add(reaction);
        }

        return APIResponse.<Void>builder()
                .data(null)
                .statusCode(HttpStatus.OK)
                .message("Toggle reaction thành công")
                .build();
    }


}
