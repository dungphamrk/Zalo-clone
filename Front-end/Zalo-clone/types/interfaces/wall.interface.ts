// src/types/interfaces/wall.interface.ts
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  time: string;
  likes: number;
  isLikedByMe: boolean;
  replies: Comment[];
}

export interface Post {
  id: string;
  userId: string;
  avatar: string;
  name: string;
  content: string;
  image?: string;
  time: string;
  likes: number;
  isLikedByMe: boolean;
  comments: Comment[];
}

export interface Story {
  id: string;
  userId: string;
  avatar: string;
  name: string;
  isViewed: boolean;
}

// Request DTOs
export interface CreatePostRequest {
  content: string;
  image?: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface CreateReplyRequest {
  content: string;
}