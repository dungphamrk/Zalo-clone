package com.example.zalocloneserver.services;


import com.example.zalocloneserver.dto.req.CommentRequest;
import com.example.zalocloneserver.dto.res.CommentResponse;
import com.example.zalocloneserver.dto.res.base.APIResponse;

import java.util.List;

public interface ICommentService{
    APIResponse<List<CommentResponse>> getCommentsByPostId(Long postId);
    APIResponse<CommentResponse> createComment(CommentRequest commentRequest);
    APIResponse<CommentResponse> createReply(Long commentId, com.example.zalocloneserver.dto.req.ReplyRequest replyRequest);
    APIResponse<Void> deleteComment(Long commentId);
    APIResponse<Void> toggleCommentReaction(Long commentId);

}
