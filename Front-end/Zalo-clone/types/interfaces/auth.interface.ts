
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  password: string;
  displayName?: string;
  username: string;
}

export interface JWTResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}