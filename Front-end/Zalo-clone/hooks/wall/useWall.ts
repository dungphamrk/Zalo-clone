import {
  useMutation,
  useQuery,
  useQueryClient,
  // Thêm UseQueryOptions để định kiểu cho queryFn nếu cần
  UseQueryOptions,
} from '@tanstack/react-query';
import { getStories, getPosts, toggleLikePost, addComment, addReply } from '@/services/wall/wall.service';
import { Post, Story, CreateCommentRequest, CreateReplyRequest } from '@/types/interfaces/wall.interface';
import { ListResponse, SingleResponse, PaginationResponse } from '@/utils/response-data';
import Toast from 'react-native-toast-message';

// Khai báo các tham số mặc định cho phân trang (pagination)
const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;

export const wallKeys = {
  all: ['wall'] as const,
  stories: () => [...wallKeys.all, 'stories'] as const,
  // Cập nhật queryKey để chứa tham số phân trang, giúp cache hoạt động đúng
  posts: (page: number, size: number) => [...wallKeys.all, 'posts', { page, size }] as const,
  post: (id: string) => [...wallKeys.all, 'post', id] as const,
};

// GET

/**
 * Hook để lấy danh sách Story.
 */
export const useStories = () => {
  return useQuery<ListResponse<Story>, Error, Story[]>({
    queryKey: wallKeys.stories(),
    queryFn: getStories,
    select: (res) => {
      // Backend returns APIResponse<List<StoryResponse>>
      // res.data is DataResponse<Story[]> | null
      return res.data?.items || [];
    },
    staleTime: 60_000, // 1 phút
  });
};

/**
 * Hook để lấy danh sách Post có phân trang.
 * @param page Số trang cần lấy (mặc định: 0)
 * @param size Kích thước trang (mặc định: 10)
 */
export const usePosts = (page: number = DEFAULT_PAGE, size: number = DEFAULT_SIZE) => {
  return useQuery<PaginationResponse<Post>, Error, Post[]>({
    // Sử dụng queryKey mới có chứa page và size
    queryKey: wallKeys.posts(page, size),
    
    // FIX: Bọc getPosts trong một hàm để nó nhận các tham số page, size
    // và không cần xử lý QueryContext (trừ khi cần AbortSignal)
    // Nếu bạn muốn sử dụng AbortSignal: queryFn: ({ signal }) => getPosts(page, size, { signal }),
    queryFn: () => getPosts(page, size),
    
    select: (res) => {
      // Backend returns APIResponse<Page<PostResponse>> or APIResponse<List<PostResponse>>
      // Check if it's paginated (has content property) or just a list
      if (res.data?.items && 'content' in res.data.items) {
        return res.data.items.content;
      }
      // If it's a list response
      return res.data?.items || [];
    },
    staleTime: 30_000, // 30 giây
    // Giữ data để tránh re-fetch quá thường xuyên khi người dùng cuộn
  });
};

// MUTATIONS

/**
 * Hook để bật/tắt Like cho Post.
 */
export const useToggleLikePost = () => {
  const qc = useQueryClient();
  return useMutation<SingleResponse<null>, Error, string>({
    mutationFn: toggleLikePost,
    onSuccess: (_, postId) => {
      // Invalidate tất cả các list posts
      qc.invalidateQueries({ queryKey: [wallKeys.all[0], 'posts'] }); 
      // Invalidate chi tiết post đó
      qc.invalidateQueries({ queryKey: wallKeys.post(postId) });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể thực hiện hành động thích.' });
    },
  });
};

/**
 * Hook để thêm Comment vào Post.
 */
export const useAddComment = () => {
  const qc = useQueryClient();
  return useMutation<SingleResponse<Comment>, Error, { postId: string; data: CreateCommentRequest }>({
    mutationFn: ({ postId, data }) => addComment(postId, data),
    onSuccess: (response, { postId }) => {
      // Backend returns APIResponse<CommentResponse>
      // response.data is DataResponse<CommentResponse> | null
      qc.invalidateQueries({ queryKey: [wallKeys.all[0], 'posts'] });
      qc.invalidateQueries({ queryKey: wallKeys.post(postId) });
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Bình luận đã được thêm.' });
    },
    onError: () => {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể thêm bình luận.' });
    },
  });
};

/**
 * Hook để thêm Reply (Trả lời) vào Comment.
 */
export const useAddReply = () => {
  const qc = useQueryClient();
  return useMutation<SingleResponse<Comment>, Error, { postId: string; commentId: string; data: CreateReplyRequest }>({
    mutationFn: ({ postId, commentId, data }) => addReply(postId, commentId, data),
    onSuccess: (response, { postId }) => {
      // Backend returns APIResponse<CommentResponse>
      // response.data is DataResponse<CommentResponse> | null
      qc.invalidateQueries({ queryKey: [wallKeys.all[0], 'posts'] });
      qc.invalidateQueries({ queryKey: wallKeys.post(postId) });
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Trả lời đã được thêm.' });
    },
    onError: () => {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể thêm trả lời.' });
    },
  });
};