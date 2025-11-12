import {
  ChangePasswordRequest,
  ProfileRequestDTO,
  ProfileResponse,
} from "@/types/interfaces/profile.interface";
import { axiosInstance } from "@/utils/axios-instance";
import { SingleResponse } from "@/utils/response-data";
import { handleAxiosError } from "../error.service";

// Get current user profile
export const getProfile = async (): Promise<
  SingleResponse<ProfileResponse>
> => {
  try {
    const res = await axiosInstance.get('/users/me');
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

export const changePassword = async (
  changePassword: ChangePasswordRequest
): Promise<SingleResponse<void>> => {
  try {
    // Backend uses POST not PUT
    const res = await axiosInstance.post(
      "/users/change-password",
      changePassword
    );
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

export const updateProfile = async (
  profile: ProfileRequestDTO
): Promise<SingleResponse<ProfileResponse>> => {
  try {
    // Backend uses PUT /users/me with JSON body, not multipart
    const res = await axiosInstance.put("/users/me", {
      displayName: profile.displayName,
      username: profile.username,
      email: profile.email,
      gender: profile.gender,
    });
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

// Upload avatar
export const uploadAvatar = async (
  fileUri: string
): Promise<SingleResponse<ProfileResponse>> => {
  try {
    const formData = new FormData();
    formData.append('avatar', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const res = await axiosInstance.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};
