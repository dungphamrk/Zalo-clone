
export interface Contact {
  id: string;
  friendName: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  userId: string; // ID của người dùng sở hữu liên hệ này
  friend: boolean; // <-- MỚI: Trạng thái bạn bè
}

export interface CreateContactRequest {
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
}

export interface UpdateContactRequest {
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

export interface FriendRequestDTO {
    toUserId: string;
    
    message?: string; 
}
export interface FriendRequestIncoming {
    id: number; 
    fromUserId: number; 
    fromUsername: string; 
    fromAvatar: string; 
    message: string; 
    createdAt: string; 
}

export interface FriendRequestSent {
    id: number; // Tương ứng với "id" trong JSON mẫu
    toUserId: number; // ID của người nhận yêu cầu
    message: string; // Nội dung tin nhắn kèm theo yêu cầu

    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    sentAt: string; // ISO date string, thời điểm yêu cầu được gửi
    
    fromUserId: number; 

    toUsername: string; // Tên người dùng/SĐT người nhận
    toAvatar: string; // URL avatar người nhận
}
export type FriendRequestResponse = FriendRequestIncoming | FriendRequestSent;