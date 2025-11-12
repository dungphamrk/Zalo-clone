package com.example.zalocloneserver.services;



import com.example.zalocloneserver.dto.req.PostRequestDTO;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.post.PostResponse;
import com.example.zalocloneserver.model.constants.Visibility;

import java.util.List;

public interface IPostService{
    APIResponse<PostResponse> createPost(PostRequestDTO request);
//    APIResponse<List<PostResponse>> getFeeds();
    APIResponse<List<PostResponse>> getOwnPosts();
    APIResponse<List<PostResponse>> getOtherPosts(long userId);
    APIResponse<PostResponse> changePostVisibility(Long postId, Visibility visibility);
    APIResponse<Void> togglePostReaction(Long postId);
    APIResponse<PostResponse> getPostById(Long postId);
}
