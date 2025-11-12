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
    // Get file extension from URI
    const uriParts = fileUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg';
    
    const formData = new FormData();
    
    // Trên web, cần convert URI thành Blob/File
    // Trên React Native, dùng format {uri, type, name}
    if (typeof window !== 'undefined') {
      // Web: Xử lý các loại URI khác nhau
      try {
        let blob: Blob;
        
        if (fileUri.startsWith('data:')) {
          // Data URL: convert trực tiếp
          const response = await fetch(fileUri);
          blob = await response.blob();
        } else if (fileUri.startsWith('blob:')) {
          // Blob URL: fetch trực tiếp
          const response = await fetch(fileUri);
          blob = await response.blob();
        } else if (fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
          // HTTP URL: fetch từ server
          const response = await fetch(fileUri);
          blob = await response.blob();
        } else {
          // Local file path trên web - thử fetch
          const response = await fetch(fileUri);
          blob = await response.blob();
        }
        
        const fileName = `avatar_${Date.now()}.${fileType}`;
        const fileObj = new File([blob], fileName, { type: mimeType });
        formData.append('avatar', fileObj);
      } catch (err) {
        console.error('[uploadAvatar] Error converting file to Blob:', err, 'URI:', fileUri);
        // Fallback: dùng format React Native
        formData.append('avatar', {
          uri: fileUri,
          type: mimeType,
          name: `avatar.${fileType}`,
        } as any);
      }
    } else {
      // React Native: dùng format {uri, type, name}
      formData.append('avatar', {
        uri: fileUri,
        type: mimeType,
        name: `avatar.${fileType}`,
      } as any);
    }

    // QUAN TRỌNG: Không set Content-Type, để axios interceptor xử lý
    const res = await axiosInstance.post('/users/me/avatar', formData);

    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};
