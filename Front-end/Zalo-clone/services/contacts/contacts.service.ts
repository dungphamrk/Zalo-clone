/**
 * Contacts/Friends service
 * Phiên bản tinh gọn: Chỉ giữ lại các hàm không bị trùng lặp chức năng.
 * Ánh xạ chức năng:
 * - createContact (Tạo Contact) <-> Chấp nhận lời mời (acceptFriendRequest)
 * - updateContact (Cập nhật Contact) <-> Từ chối lời mời (rejectFriendRequest)
 * - deleteContact (Xóa Contact) <-> Hủy kết bạn (unfriend)
 */

import { Contact, CreateContactRequest, UpdateContactRequest, FriendRequestDTO } from '@/types/interfaces/contact.interface';
import { axiosInstance } from '@/utils/axios-instance';
import { ListResponse, SingleResponse, PaginationResponse } from '@/utils/response-data'; 
import { handleAxiosError } from '../error.service';

// --- I. FRIEND & CONTACT READ OPERATIONS ---

/** Lấy danh sách bạn bè (Có phân trang) */
export const getContacts = async (page: number = 0, size: number = 10): Promise<PaginationResponse<Contact>> => {
  try {
    const res = await axiosInstance.get(`/friends?page=${page}&size=${size}`);

    return res.data; 
  } catch (error) {
    throw handleAxiosError(error);
  }
};

/** Lấy chi tiết bạn bè */
export const getContact = async (contactId: string): Promise<SingleResponse<Contact>> => {
  try {
    const res = await axiosInstance.get(`/friends/${contactId}`);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

/** Tìm kiếm người dùng */
export const searchContacts = async (search: string): Promise<ListResponse<Contact>> => {
  try {
    const res = await axiosInstance.get(`/friends/search?username=${encodeURIComponent(search)}`);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};


// --- II. CONTACT/FRIEND MANAGEMENT (ÁNH XẠ CHỨC NĂNG) ---

/**
 * TẠO LIÊN HỆ MỚI (Ánh xạ sang CHẤP NHẬN LỜI MỜI)
 * @param data (Giả định chứa requestId)
 * Corresponds to: POST /api/v1/friends/responseToRequest/{requestId}?isAccepted=true
 */
export const createContact = async (data: CreateContactRequest): Promise<SingleResponse<null>> => {
    // Giả định CreateContactRequest chứa 'requestId'
    const requestId = (data as any).requestId || ''; 
    if (!requestId) {
         throw new Error("Missing requestId for accepting friend request.");
    }
    
    try {
        const res = await axiosInstance.post(`/friends/responseToRequest/${requestId}?isAccepted=true`);
        console.log("create",res.data);
        return res.data; 
    } catch (error) {
        throw handleAxiosError(error);
    }
};

/**
 * CẬP NHẬT LIÊN HỆ (Ánh xạ sang TỪ CHỐI LỜI MỜI)
 * @param contactId ID của lời mời cần từ chối (là requestId)
 * Corresponds to: POST /api/v1/friends/responseToRequest/{requestId}?isAccepted=false
 */
export const updateContact = async (contactId: string, data: UpdateContactRequest): Promise<SingleResponse<Contact>> => {
    try {
        const res = await axiosInstance.post(`/friends/responseToRequest/${contactId}?isAccepted=false`);
        console.log("false",res.data);
        
        return res.data as SingleResponse<Contact>;
    } catch (error) {
        throw handleAxiosError(error);
    }
};

/**
 * XÓA LIÊN HỆ (Ánh xạ sang HỦY KẾT BẠN/Unfriend)
 * Corresponds to: DELETE /api/v1/friends/{friendId}
 */
export const deleteContact = async (friendId: string): Promise<SingleResponse<null>> => {
  try {
    const res = await axiosInstance.delete(`/friends/${friendId}`);
    console.log("del",res.data);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

/**
 * Gửi lời mời kết bạn (Chức năng riêng biệt)
 * Corresponds to: POST /api/v1/friends/sendRequest
 */
export const sendFriendRequest = async (data: FriendRequestDTO): Promise<SingleResponse<null>> => {
  
  const toUserId = data.toUserId;

  if (!toUserId || isNaN(toUserId)) {
    throw new Error('To user ID is missing or invalid when sending friend request.');
  }
  
  try {
    const res = await axiosInstance.post<SingleResponse<null>>(`/friends/sendRequest?friendId=${toUserId}`);
    
    return res.data; 
    
  } catch (error) {
    console.error('sendRequest Failed:', error);
    throw handleAxiosError(error);
  }
};


// --- III. FRIEND REQUESTS READ OPERATIONS ---

/** Lấy danh sách lời mời kết bạn ĐẾN (Incoming Requests) */
export const getIncomingRequests = async (page: number = 0, size: number = 10): Promise<PaginationResponse<Contact>> => {
  try {
    const res = await axiosInstance.get(`/friends/requests?page=${page}&size=${size}`);
    
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

/** Lấy danh sách lời mời kết bạn ĐÃ GỬI ĐI (Outgoing Requests) */
export const getOutgoingRequests = async (page: number = 0, size: number = 10): Promise<PaginationResponse<Contact>> => {
  try {
    const res = await axiosInstance.get(`/friends/requests/outgoing?page=${page}&size=${size}`);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};


// --- IV. FRIEND REQUESTS MUTATIONS ---

/**
 * Hủy lời mời đã gửi đi
 * Corresponds to: DELETE /api/v1/friends/requests/{requestId}
 */
export const cancelFriendRequest = async (requestId: string): Promise<SingleResponse<null>> => {
  try {
    const res = await axiosInstance.delete(`/friends/requests/${requestId}`);
    console.log("cancel",res.data);
    
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};