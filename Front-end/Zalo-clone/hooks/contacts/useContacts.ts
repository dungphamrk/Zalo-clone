import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    getContacts, 
    getContact, 
    searchContacts,
    getIncomingRequests, 
    getOutgoingRequests,
    
    // Gán chức năng thực tế vào tên hook frontend
    createContact, // <--- Thực chất là ACCEPT Request
    updateContact, // <--- Thực chất là REJECT Request
    deleteContact, // <--- Thực chất là UNFRIEND
    
    sendFriendRequest, // Gửi lời mời mới (chức năng độc lập)
    cancelFriendRequest, // Hủy lời mời đã gửi đi (chức năng độc lập)
    
    // Đã loại bỏ acceptFriendRequest và rejectFriendRequest khỏi import
} from '@/services/contacts/contacts.service'; 
import { Contact, ContactStatus, CreateContactRequest, UpdateContactRequest, FriendRequestDTO, FriendRequestIncoming, FriendRequestSent } from '@/types/interfaces/contact.interface';
import { ListResponse, SingleResponse, PaginationResponse } from '@/utils/response-data'; 
import Toast from 'react-native-toast-message'; 
import { router } from 'expo-router';


export const contactKeys = {
    all: ['contacts'] as const,
    lists: () => [...contactKeys.all, 'list'] as const,
    listSearch: (search: string) => [...contactKeys.all, 'list', { search }] as const,
    detail: (id: string) => [...contactKeys.all, 'detail', id] as const,
    // KEYS CHO REQUESTS
    requests: ['requests'] as const,
    incoming: () => [...contactKeys.requests, 'incoming'] as const,
    outgoing: () => [...contactKeys.requests, 'outgoing'] as const,
};


export const useContacts = () => {
  
    return useQuery<PaginationResponse<any>, Error, Contact[]>({
        queryKey: contactKeys.lists(),
        queryFn: async () => {
            
            return await getContacts();
        },
        select: (response) => {
        const items = response.data?.items?.content || [];
        return items.map((friend: any) => ({
            id: String(friend.friendId),
            userId: String(friend.friendId),
            friendName: friend.friendName || friend.username || 'Người dùng',
            username: friend.username || '',
            avatarUrl: friend.avatarUrl || undefined,
            friend: friend.isFriend ?? true,
            status: (friend.isFriend ? 'FRIEND' : 'NEW') as ContactStatus,
            since: friend.since || undefined,
        }));
        },
        staleTime: 60 * 1000, 
    });
};

/** Lấy chi tiết liên hệ (Contact Detail) */
export const useContact = (contactId: string) => {
    return useQuery<SingleResponse<Contact>, Error, Contact>({
        queryKey: contactKeys.detail(contactId),
        queryFn: async () => {
            return await getContact(contactId);
        },
        select: (response) => {
        // Backend returns APIResponse<FriendResponse>
        // response.data is DataResponse<FriendResponse> | null
        return response.data?.items;
        },
        enabled: !!contactId,
    });
};

/** Tìm kiếm người dùng (Contact Search) */
export const useSearchContacts = (search: string) => {
    const isEnabled = !!(search && search.trim().length > 0); 
    
    return useQuery<ListResponse<any>, Error, Contact[]>({
        queryKey: contactKeys.listSearch(search),
        queryFn: async () => {
            return await searchContacts(search);
        },
        select: (response) => {
        const items = response.data?.items || [];
        return items.map((user: any) => ({
            id: String(user.id),
            userId: String(user.id),
            friendName: user.displayName || user.username || 'Người dùng',
            username: user.username || '',
            avatarUrl: user.avatarUrl || undefined,
            friend: user.status === 'FRIEND',
            status: user.status as ContactStatus,
        }));
        },
        enabled: isEnabled, 
        staleTime: 1 * 60 * 1000, 
    });
};

/** Lấy danh sách Lời mời đến */
export const useIncomingRequests = () => {
    // 1. Thay đổi kiểu dữ liệu đã chọn (tham số thứ 3) từ Contact[] thành FriendRequestIncoming[]
    return useQuery<PaginationResponse<any>, Error, FriendRequestIncoming[]>({ 
        queryKey: contactKeys.incoming(),
        queryFn: async () => {
            // Giả sử getIncomingRequests() trả về PaginationResponse<một kiểu dữ liệu nào đó>
            return await getIncomingRequests(); 
        },
        select: (response) => {
        // Backend returns APIResponse<Page<FriendRequestResponse>>
        // response.data is DataResponse<PageData<FriendRequestResponse>> | null
        return (response.data?.items?.content || []) as FriendRequestIncoming[];
        },
        staleTime: 5 * 60 * 1000, 
    });
};

/** Lấy danh sách Lời mời đã gửi đi */
export const useOutgoingRequests = () => {
    // 1. Thay đổi kiểu dữ liệu đã chọn (tham số thứ 3) từ Contact[] thành FriendRequestSent[]
    return useQuery<PaginationResponse<any>, Error, FriendRequestSent[]>({
        queryKey: contactKeys.outgoing(),
        queryFn: async () => {
            return await getOutgoingRequests();
        },
        select: (response) => {
        // Backend returns APIResponse<Page<FriendRequestSentResponse>>
        // response.data is DataResponse<PageData<FriendRequestSentResponse>> | null
        return (response.data?.items?.content || []) as FriendRequestSent[];
        },
        staleTime: 5 * 60 * 1000, 
    });
};


// ----------------------------------------------------------------------
// --- II. MUTATION HOOKS (WRITE - ĐÃ ÁNH XẠ) ---
// ----------------------------------------------------------------------

/**
 * Hook tạo liên hệ mới (CHỨC NĂNG: CHẤP NHẬN LỜI MỜI)
 * Argument: CreateContactRequest (chứa requestId)
 */
// Trước khi sửa (Gây lỗi: SingleResponse<null> không khớp với SingleResponse<Contact>)
// export const useCreateContactMutation = () => {
//     ...
//     return useMutation<SingleResponse<Contact>, Error, CreateContactRequest>({
//         mutationFn: createContact, // Hàm này trả về SingleResponse<null>
//     ...
// }

// --- SAU KHI SỬA ---
export const useCreateContactMutation = () => {
    const queryClient = useQueryClient();
    
    // Đổi kiểu trả về (Generic đầu tiên) từ SingleResponse<Contact> sang SingleResponse<null>
    return useMutation<SingleResponse<null>, Error, CreateContactRequest>({
        mutationFn: createContact,
        onSuccess: () => {
            // Logic Invalidate giữ nguyên
            queryClient.invalidateQueries({ queryKey: contactKeys.incoming() });
            queryClient.invalidateQueries({ queryKey: contactKeys.lists() });

            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đã chấp nhận lời mời và thêm vào danh bạ.', 
            });
        },
        onError: (err) => {
            Toast.show({
                type: 'error',
                text1: 'Thao tác thất bại',
                text2: (err as Error).message || 'Không thể chấp nhận lời mời.',
            });
        },
    });
};

/**
 * Hook cập nhật liên hệ (CHỨC NĂNG: TỪ CHỐI LỜI MỜI)
 * Argument: { requestId: string, data: UpdateContactRequest }
 */
export const useUpdateContactMutation = () => {
    const queryClient = useQueryClient();
    
    // MutationFn cần phải nhận requestId (contactId) và UpdateContactRequest
    return useMutation<SingleResponse<Contact>, Error, { requestId: string, data: UpdateContactRequest }>({
        mutationFn: ({ requestId, data }) => updateContact(requestId, data), // Gọi API từ chối
        onSuccess: () => {
            // Lời mời đến bị xóa -> Invalidate incoming
            queryClient.invalidateQueries({ queryKey: contactKeys.incoming() });

            Toast.show({
                type: 'info',
                text1: 'Đã từ chối',
                text2: 'Lời mời đã bị từ chối.', 
            });
        },
         onError: (err) => {
            Toast.show({
                type: 'error',
                text1: 'Thao tác thất bại',
                text2: (err as Error).message || 'Không thể từ chối lời mời.',
            });
        },
    });
};

/**
 * Hook xóa liên hệ (CHỨC NĂNG: HỦY KẾT BẠN)
 * Argument: string (friendId)
 */
export const useDeleteContactMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation<SingleResponse<null>, Error, string>({
        mutationFn: deleteContact, // Gọi API hủy kết bạn
        onSuccess: (_, deletedContactId) => {
            // Xóa chi tiết và invalidate danh sách chính
            queryClient.removeQueries({ queryKey: contactKeys.detail(deletedContactId) });
            queryClient.invalidateQueries({ queryKey: contactKeys.lists() });

            Toast.show({
                type: 'info',
                text1: 'Đã hủy kết bạn',
                text2: 'Liên hệ đã bị gỡ khỏi danh bạ.',
            });
            router.replace('/(tabs)/contacts');
        },
        onError: (err) => {
             Toast.show({
                type: 'error',
                text1: 'Hủy kết bạn thất bại',
                text2: (err as Error).message || 'Đã xảy ra lỗi.',
            });
        },
    });
};


// ----------------------------------------------------------------------
// --- III. FRIEND REQUEST MUTATION HOOKS (ĐỘC LẬP) ---
// ----------------------------------------------------------------------

/** Gửi lời mời kết bạn (Dùng cho trang Search/Profile) */
export const useSendFriendRequestMutation = () => {
    const queryClient = useQueryClient();

    // Giả định mutationFn: sendFriendRequest nhận { toUserId: number, message?: string }
    return useMutation<SingleResponse<null>, Error, FriendRequestDTO>({
        mutationFn: sendFriendRequest, 
        onSuccess: () => {
            // Invalidate Lời mời đi để thấy trạng thái 'đã gửi'
            queryClient.invalidateQueries({ queryKey: contactKeys.outgoing() });

            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đã gửi lời mời kết bạn.',
            });
        },
        onError: (err) => {
            console.error('sendFriendRequest error payload:', err);
            Toast.show({
                type: 'error',
                text1: 'Gửi lời mời thất bại',
                text2: (err as Error).message || 'Đã xảy ra lỗi.',
            });
        },
    });
};

/** Hủy lời mời đã gửi đi */
export const useCancelFriendRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<SingleResponse<null>, Error, string>({
        mutationFn: cancelFriendRequest, // Giả định service nhận requestId: string
        onSuccess: () => {
            // Invalidate Lời mời đi để xóa request đã hủy
            queryClient.invalidateQueries({ queryKey: contactKeys.outgoing() });

            Toast.show({
                type: 'info',
                text1: 'Đã hủy',
                text2: 'Lời mời đã được hủy thành công.',
            });
        },
        onError: (err) => {
            Toast.show({
                type: 'error',
                text1: 'Thao tác thất bại',
                text2: (err as Error).message || 'Không thể hủy lời mời.',
            });
        },
    });
};

// Đã loại bỏ useAcceptFriendRequestMutation và useRejectFriendRequestMutation
// vì chúng được thay thế bằng useCreateContactMutation và useUpdateContactMutation.