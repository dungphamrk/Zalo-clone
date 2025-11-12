import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {
  getStories,
  getPosts,
  getMyPosts,
  toggleLikePost,
  addComment,
  addReply,
  getCommentsByPostId,
  createPost,
  changePostVisibility,
  deletePost,
} from '@/services/wall/wall.service';
import {
  Post,
  Story,
  Comment,
  CreateCommentRequest,
  CreateReplyRequest,
  CreatePostRequest,
} from '@/types/interfaces/wall.interface';
import { ListResponse, SingleResponse, PaginationResponse } from '@/utils/response-data';
import Toast from 'react-native-toast-message';

// Khai báo các tham số mặc định cho phân trang (pagination)
const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;
const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=60';

const formatRelativeTime = (isoDate?: string): string => {
  if (!isoDate) return '';
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) {
    return '';
  }
  const now = new Date();
  const diffMs = now.getTime() - target.getTime();
  if (diffMs <= 0) {
    return 'Vừa xong';
  }
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} năm trước`;
};

const mapCommentResponse = (raw: any): Comment => {
  if (!raw) {
    return {
      id: '',
      userId: '',
      userName: 'Ẩn danh',
      userAvatar: DEFAULT_AVATAR,
      content: '',
      time: '',
      likes: 0,
      isLikedByMe: false,
      replies: [],
    };
  }

  const user = raw.user;
  const profile = user?.profile;

  return {
    id: raw.id?.toString() ?? '',
    userId: user?.id?.toString() ?? '',
    userName: profile?.displayName ?? user?.username ?? 'Ẩn danh',
    userAvatar: profile?.avatarUrl ?? DEFAULT_AVATAR,
    content: raw.content ?? '',
    time: formatRelativeTime(raw.createdAt),
    likes: raw.reactionCount ?? 0,
    isLikedByMe: !!raw.reactedByCurrentUser,
    replies: Array.isArray(raw.childComments)
      ? raw.childComments.map((child: any) => mapCommentResponse(child))
      : [],
  };
};

const mapPostResponse = (raw: any): Post => {
  if (!raw) {
    return {
      id: '',
      userId: '',
      avatar: DEFAULT_AVATAR,
      name: 'Ẩn danh',
      content: '',
      image: undefined,
      mediaUrls: [],
      time: '',
      likes: 0,
      isLikedByMe: false,
      commentCount: 0,
      comments: [],
      createdAt: undefined,
    };
  }

  const user = raw.user;
  const profile = user?.profile;
  const mediaUrls: string[] = Array.isArray(raw.mediaList)
    ? raw.mediaList
        .map((media: any) => media?.url)
        .filter((url: string | undefined): url is string => Boolean(url))
    : [];

  return {
    id: raw.id?.toString() ?? '',
    userId: user?.id?.toString() ?? '',
    avatar: profile?.avatarUrl ?? DEFAULT_AVATAR,
    name: profile?.displayName ?? user?.username ?? 'Ẩn danh',
    content: raw.content ?? '',
    image: mediaUrls[0],
    mediaUrls,
    time: formatRelativeTime(raw.createdAt),
    likes: Number(raw.totalReactions ?? 0),
    isLikedByMe: !!raw.reactedByCurrentUser,
    commentCount: Number(raw.totalComments ?? 0),
    comments: [],
    createdAt: raw.createdAt,
    visibility: raw.visibility || 'PUBLIC',
    isFriend: raw.isFriend ?? true, // Mặc định là true nếu backend không trả về
  };
};

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
      const items = res.data?.items || [];
      return items.map((story: any) => ({
        ...story,
        id: story.id?.toString?.() ?? story.id,
        userId: story.userId?.toString?.() ?? story.userId,
        isViewed: !!story.isViewed,
      }));
    },
    staleTime: 60_000, // 1 phút
  });
};

/**
 * Hook để lấy danh sách Post có phân trang (infinite query).
 * @param size Kích thước trang (mặc định: 10)
 */
export const usePosts = (size: number = DEFAULT_SIZE) => {
  return useInfiniteQuery<PaginationResponse<any>, Error, Post[]>({
    queryKey: wallKeys.posts(0, size),
    queryFn: async ({ pageParam = 0 }) => {
      try {
        return await getPosts(pageParam, size);
      } catch (error: any) {
        // Nếu lỗi là do authentication hoặc user ID null, trả về response rỗng
        if (error?.message?.includes('id must not be null') || 
            error?.response?.status === 500 ||
            error?.response?.status === 401) {
          console.warn('[usePosts] Backend error, returning empty response:', error.message);
          // Trả về structure giống như response thành công nhưng rỗng
          return {
            data: {
              items: [],
            },
          } as PaginationResponse<any>;
        }
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      const data = lastPage.data?.items;
      if (!data) return undefined;
      
      // Nếu là PaginationResponse với content array
      if (data && 'content' in data && Array.isArray(data.content)) {
        const paginationData = data as any;
        if (paginationData.last) return undefined;
        return paginationData.number + 1;
      }
      
      // Nếu là array trực tiếp, giả sử không có pagination
      if (Array.isArray(data) && data.length < size) {
        return undefined;
      }
      
      // Mặc định load thêm
      return undefined; // Tạm thời không có pagination từ backend
    },
    initialPageParam: 0,
    select: (data) => {
      const allPosts: Post[] = [];
      data.pages.forEach((page) => {
        const pageData = page.data?.items;
        if (!pageData) return;

        if (Array.isArray(pageData)) {
          allPosts.push(...pageData.map((post: any) => mapPostResponse(post)));
        } else if (pageData && 'content' in pageData && Array.isArray(pageData.content)) {
          allPosts.push(...pageData.content.map((post: any) => mapPostResponse(post)));
        }
      });
      
      // Sắp xếp theo createdAt DESC (mới nhất trước) để đảm bảo thứ tự đúng
      return allPosts.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1; // a không có createdAt -> đẩy xuống
        if (!b.createdAt) return -1; // b không có createdAt -> đẩy xuống
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    },
    staleTime: 30_000,
    retry: (failureCount, error: any) => {
      // Không retry nếu lỗi là do authentication hoặc user ID null
      if (error?.message?.includes('id must not be null') || 
          error?.response?.status === 500 ||
          error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useComments = (postId: string, enabled: boolean = true) => {
  return useQuery<ListResponse<any>, Error, Comment[]>({
    queryKey: [...wallKeys.post(postId), 'comments'],
    queryFn: () => getCommentsByPostId(postId),
    select: (res) => {
      const items = res.data?.items;
      if (!Array.isArray(items)) {
        return [];
      }
      return items.map((comment) => mapCommentResponse(comment));
    },
    enabled: Boolean(postId) && enabled,
    staleTime: 10_000,
  });
};

/**
 * Hook để lấy danh sách Post của chính mình.
 */
export const useMyPosts = () => {
  return useQuery<ListResponse<any>, Error, Post[]>({
    queryKey: [...wallKeys.all, 'my-posts'],
    queryFn: getMyPosts,
    select: (res) => {
      const items = res.data?.items || [];
      const mappedPosts = items.map((post: any) => mapPostResponse(post));
      
      // Sắp xếp theo createdAt DESC (mới nhất trước)
      return mappedPosts.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1; // a không có createdAt -> đẩy xuống
        if (!b.createdAt) return -1; // b không có createdAt -> đẩy xuống
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    },
    staleTime: 30_000,
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
      // Reset query để fetch lại từ đầu, tránh vòng lặp request
      qc.resetQueries({ queryKey: wallKeys.posts(0, DEFAULT_SIZE) });
      if (postId) {
        qc.invalidateQueries({ queryKey: [...wallKeys.post(postId), 'comments'] });
      }
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
  return useMutation<SingleResponse<any>, Error, { postId: string; data: CreateCommentRequest }>({
    mutationFn: ({ postId, data }) => addComment(postId, data),
    onSuccess: (response, { postId }) => {
      // Backend returns APIResponse<CommentResponse>
      // response.data is DataResponse<CommentResponse> | null
      // Chỉ invalidate comments, không invalidate posts để tránh vòng lặp
      if (postId) {
        qc.invalidateQueries({ queryKey: [...wallKeys.post(postId), 'comments'] });
      }
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
  return useMutation<SingleResponse<any>, Error, { postId: string; commentId: string; data: CreateReplyRequest }>({
    mutationFn: ({ postId, commentId, data }) => addReply(postId, commentId, data),
    onSuccess: (response, { postId }) => {
      // Backend returns APIResponse<CommentResponse>
      // response.data is DataResponse<CommentResponse> | null
      // Chỉ invalidate comments, không invalidate posts để tránh vòng lặp
      if (postId) {
        qc.invalidateQueries({ queryKey: [...wallKeys.post(postId), 'comments'] });
      }
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Trả lời đã được thêm.' });
    },
    onError: () => {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể thêm trả lời.' });
    },
  });
};

/**
 * Hook để tạo Post mới.
 */
export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation<SingleResponse<Post>, Error, CreatePostRequest>({
    mutationFn: createPost,
    onSuccess: () => {
      // Sử dụng refetchQueries thay vì resetQueries để tránh vòng lặp
      // Chỉ refetch query cụ thể, không refetch tất cả
      qc.refetchQueries({ queryKey: wallKeys.posts(0, DEFAULT_SIZE) });
      qc.invalidateQueries({ queryKey: [...wallKeys.all, 'my-posts'] });
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Bài viết đã được đăng.' });
    },
    onError: (error) => {
      console.error('[useCreatePost] Error:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Lỗi', 
        text2: error?.message || 'Không thể đăng bài viết.' 
      });
    },
    retry: false, // Không retry để tránh vòng lặp
  });
};

/**
 * Hook để thay đổi visibility của Post.
 */
export const useChangePostVisibility = () => {
  const qc = useQueryClient();
  return useMutation<SingleResponse<Post>, Error, { postId: string; visibility: 'PUBLIC' | 'PRIVATE' }>({
    mutationFn: ({ postId, visibility }) => changePostVisibility(postId, visibility),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wallKeys.all });
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã thay đổi chế độ hiển thị.' });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể thay đổi chế độ hiển thị.' });
    },
  });
};

/**
 * Hook để xóa Post.
 */
export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation<SingleResponse<null>, Error, string>({
    mutationFn: deletePost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wallKeys.all });
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã xóa bài viết.' });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể xóa bài viết.' });
    },
  });
};