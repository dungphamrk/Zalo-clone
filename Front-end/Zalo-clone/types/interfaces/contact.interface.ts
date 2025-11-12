
export type ContactStatus = 'FRIEND' | 'PENDING' | 'NEW';

export interface Contact {
  id: string;
  userId: string;
  friendName: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  friend: boolean;
  status?: ContactStatus;
  since?: string;
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
    toUserId: number;
}
export interface FriendRequestIncoming {
    id: number; 
    fromUserId: number; 
    fromUsername: string; 
    fromDisplayName?: string; 
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
    toDisplayName?: string; // Tên hiển thị người nhận
    toAvatar: string; // URL avatar người nhận
}
export type FriendRequestResponse = FriendRequestIncoming | FriendRequestSent;