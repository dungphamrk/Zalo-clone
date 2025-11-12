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

// Get feeds (posts from friends and own posts)
export const getPosts = async (page = 0, size = 10): Promise<PaginationResponse<Post>> => {
  // Use /posts/feeds to get posts from friends and own posts
  try {
    const res = await axiosInstance.get('/posts/feeds');
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// MUTATIONS
// Create post - gửi FormData với mediaFiles trực tiếp lên backend
export const createPost = async (data: CreatePostRequest): Promise<SingleResponse<Post>> => {
  try {
    if (!data.mediaFiles || data.mediaFiles.length === 0) {
      throw new Error('Cần ít nhất một file media');
    }

    const formData = new FormData();
    
    // Append content và visibility
    formData.append('content', data.content || '');
    formData.append('visibility', data.visibility || 'PUBLIC');
    
    // Append media files
    for (let index = 0; index < data.mediaFiles.length; index++) {
      const file = data.mediaFiles[index];
      const fileUri = 'uri' in file ? file.uri : file.uri;
      const uriParts = fileUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg';
      
      // Trên web, cần convert URI thành Blob/File
      // Trên React Native, dùng format {uri, type, name}
      if (typeof window !== 'undefined') {
        // Web: Xử lý các loại URI khác nhau
        try {
          let blob: Blob;
          
          if (fileUri.startsWith('data:')) {
            // Data URL: convert trực tiếp
            const response = await fetch(fileUri);
            blob = await response.blob();
          } else if (fileUri.startsWith('blob:')) {
            // Blob URL: fetch trực tiếp
            const response = await fetch(fileUri);
            blob = await response.blob();
          } else if (fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
            // HTTP URL: fetch từ server
            const response = await fetch(fileUri);
            blob = await response.blob();
          } else {
            // Local file path trên web - thử fetch
            const response = await fetch(fileUri);
            blob = await response.blob();
          }
          
          const fileName = `post_image_${Date.now()}_${index}.${fileType}`;
          const fileObj = new File([blob], fileName, { type: mimeType });
          formData.append('mediaFiles', fileObj);
        } catch (err) {
          console.error('[createPost] Error converting file to Blob:', err, 'URI:', fileUri);
          // Fallback: thử dùng format React Native (có thể hoạt động trên một số platform)
          formData.append('mediaFiles', {
            uri: fileUri,
            type: mimeType,
            name: `post_image_${Date.now()}_${index}.${fileType}`,
          } as any);
        }
      } else {
        // React Native: dùng format {uri, type, name}
        formData.append('mediaFiles', {
          uri: fileUri,
          type: mimeType,
          name: `post_image_${Date.now()}_${index}.${fileType}`,
        } as any);
      }
    }
    
    console.log('[createPost] Sending FormData with:', {
      content: data.content?.substring(0, 50),
      visibility: data.visibility,
      mediaFilesCount: data.mediaFiles.length,
    });
    
    // Trên web, dùng XMLHttpRequest để kiểm soát hoàn toàn Content-Type header
    // Tránh axios tự thêm charset=UTF-8
    if (typeof window !== 'undefined') {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const { BASE_URL } = await import('@/utils/axios-instance');
      const token = await AsyncStorage.getItem('ACCESS_TOKEN');
      
      return new Promise<SingleResponse<Post>>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              console.log('[createPost] Success:', result);
              resolve(result);
            } catch {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || `Request failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Request failed with status ${xhr.status}`));
            }
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('Network error'));
        };
        
        xhr.open('POST', `${BASE_URL}/posts`);
        
        // Set Authorization header
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        // KHÔNG set Content-Type - browser sẽ tự set multipart/form-data với boundary đúng
        // XMLHttpRequest sẽ tự động set Content-Type với boundary, không có charset
        
        xhr.send(formData);
      });
    }
    
    // React Native: dùng axios như uploadAvatar
    const res = await axiosInstance.post('/posts', formData);
    
    console.log('[createPost] Success:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('[createPost] Error details:', error);
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

// Change post visibility
export const changePostVisibility = async (postId: string, visibility: 'PUBLIC' | 'PRIVATE'): Promise<SingleResponse<Post>> => {
  try {
    const res = await axiosInstance.patch(`/posts/${postId}/visibility`, null, {
      params: { visibility },
    });
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Delete post
export const deletePost = async (postId: string): Promise<SingleResponse<null>> => {
  try {
    const res = await axiosInstance.delete(`/posts/${postId}`);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};