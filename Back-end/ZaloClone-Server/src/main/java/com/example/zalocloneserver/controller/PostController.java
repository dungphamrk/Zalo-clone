package com.example.zalocloneserver.controller;


import com.example.zalocloneserver.dto.req.PostRequestDTO;
import com.example.zalocloneserver.dto.req.post.PostRequest;
import com.example.zalocloneserver.dto.res.base.APIResponse;
import com.example.zalocloneserver.dto.res.post.PostResponse;
import com.example.zalocloneserver.model.constants.Visibility;
import com.example.zalocloneserver.services.IPostService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/posts")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Post", description = "API bài đăng")
public class PostController{

    private final IPostService postService;

    @PostMapping(value = "/upload-image", consumes = "multipart/form-data")
    public ResponseEntity<APIResponse<String>> uploadPostImage(
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile file
    ) {
        try {
            // Kiểm tra file có tồn tại không
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(APIResponse.error("Image file is required", HttpStatus.BAD_REQUEST));
            }
            
            // Upload ảnh lên Cloudinary và trả về URL
            String imageUrl = postService.uploadImage(file);
            return ResponseEntity.ok(APIResponse.success(imageUrl, "Image uploaded successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(APIResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(APIResponse.error("Failed to upload image: " + e.getMessage(), 
                            HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<APIResponse<PostResponse>> createPost(
            @ModelAttribute PostRequest postRequest
    ) {
        APIResponse<PostResponse> response = postService.createPost(postRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/feeds")
    public ResponseEntity<APIResponse<List<PostResponse>>> getFeeds() {
        APIResponse<List<PostResponse>> response = postService.getFeeds();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<APIResponse<List<PostResponse>>> getOwnPosts() {
        APIResponse<List<PostResponse>> response = postService.getOwnPosts();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{postId}/visibility")
    public ResponseEntity<APIResponse<PostResponse>> changeVisibility(
            @PathVariable Long postId,
            @RequestParam Visibility visibility) {
        APIResponse<PostResponse> response = postService.changePostVisibility(postId, visibility);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{postId}/reaction")
    public ResponseEntity<APIResponse<Void>> toggleReaction(@PathVariable Long postId) {
        APIResponse<Void> response = postService.togglePostReaction(postId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/other/{userId}")
    public ResponseEntity<APIResponse<List<PostResponse>>> getOtherPosts(@PathVariable Long userId){
        APIResponse<List<PostResponse>> response = postService.getOtherPosts(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<APIResponse<PostResponse>> getPostById(@PathVariable Long postId){
        APIResponse<PostResponse> response = postService.getPostById(postId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{postId}")
    public ResponseEntity<APIResponse<Void>> deletePost(@PathVariable Long postId){
        APIResponse<Void> response = postService.deletePost(postId);
        return ResponseEntity.ok(response);
    }
}
