package com.example.zalocloneserver.services;



import com.example.zalocloneserver.dto.req.PostRequestDTO;
import com.example.zalocloneserver.dto.req.post.PostRequest;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.post.PostResponse;
import com.example.zalocloneserver.model.constants.Visibility;

import java.util.List;

public interface IPostService{
    APIResponse<PostResponse> createPost(PostRequest request);
    APIResponse<List<PostResponse>> getFeeds();
    APIResponse<List<PostResponse>> getOwnPosts();
    APIResponse<List<PostResponse>> getOtherPosts(long userId);
    APIResponse<PostResponse> changePostVisibility(Long postId, Visibility visibility);
    APIResponse<Void> togglePostReaction(Long postId);
    APIResponse<PostResponse> getPostById(Long postId);
    APIResponse<Void> deletePost(Long postId);
    String uploadImage(org.springframework.web.multipart.MultipartFile file);
}
