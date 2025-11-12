// src/services/wall/wall.service.ts
// Updated to match backend endpoints
import { Post, Story, Comment, CreatePostRequest, CreateCommentRequest, CreateReplyRequest } from '@/types/interfaces/wall.interface';
import { axiosInstance } from '@/utils/axios-instance';
import { ListResponse, SingleResponse, PaginationResponse } from '@/utils/response-data';
import { handleAxiosError } from '../error.service';

// READ
// Get stories
export const getStories = async (): Promise<ListResponse<Story>> => {
  try {
    const res = await axiosInstance.get('/stories');
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Get own posts
export const getMyPosts = async (): Promise<ListResponse<Post>> => {
  try {
    const res = await axiosInstance.get('/posts/me');
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Get posts by another user
export const getPostsByUser = async (userId: number): Promise<ListResponse<Post>> => {
  try {
    const res = await axiosInstance.get(`/posts/other/${userId}`);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Get single post by ID
export const getPostById = async (postId: string): Promise<SingleResponse<Post>> => {
  try {
    const res = await axiosInstance.get(`/posts/${postId}`);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Legacy function - maps to getMyPosts for now
export const getPosts = async (page = 0, size = 10): Promise<PaginationResponse<Post>> => {
  // Backend doesn't have paginated /posts endpoint
  // Use getMyPosts for now
  try {
    const res = await axiosInstance.get('/posts/me');
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// MUTATIONS
// Create post (multipart/form-data)
export const createPost = async (data: CreatePostRequest): Promise<SingleResponse<Post>> => {
  try {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.image) {
      formData.append('image', {
        uri: data.image,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);
    }
    
    const res = await axiosInstance.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Toggle reaction (backend uses /reaction not /like)
export const toggleLikePost = async (postId: string): Promise<SingleResponse<null>> => {
  try {
    const res = await axiosInstance.post(`/posts/${postId}/reaction`);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Add comment (backend uses /comments endpoint, not /posts/{postId}/comments)
export const addComment = async (postId: string, data: CreateCommentRequest): Promise<SingleResponse<Comment>> => {
  try {
    // Backend CommentController expects CommentRequest with postId
    const res = await axiosInstance.post('/comments', {
      postId: parseInt(postId),
      content: data.content,
    });
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Get comments for a post
export const getCommentsByPostId = async (postId: string): Promise<ListResponse<Comment>> => {
  try {
    const res = await axiosInstance.get(`/comments/post/${postId}`);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Add reply to a comment
export const addReply = async (postId: string, commentId: string, data: CreateReplyRequest): Promise<SingleResponse<Comment>> => {
  try {
    const res = await axiosInstance.post(`/comments/${commentId}/replies`, {
      content: data.content,
    });
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};