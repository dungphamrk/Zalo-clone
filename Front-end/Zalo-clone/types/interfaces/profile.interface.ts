import { Gender } from "@/enums/gender.enum";

export interface ProfileRequestDTO {
  displayName?: string;
  username: string;
  email: string;
  gender: Gender;
}

export interface ProfileResponse {
  id: number;
  displayName: string;
  username: string;
  email: string;
  gender: Gender;
  avatarUrl: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

