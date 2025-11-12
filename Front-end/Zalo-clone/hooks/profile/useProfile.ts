import {
  ChangePasswordRequest,
  ProfileRequestDTO,
  ProfileResponse,
} from "@/types/interfaces/profile.interface";
import {
  changePassword,
  getProfile,
  updateProfile,
  uploadAvatar,
} from "@/services/profile/profile.service";
import { SingleResponse } from "@/utils/response-data";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from 'react-native-toast-message';

const PROFILE_KEY = ["account", "profile"];

export const useProfileQuery = () => {
  return useQuery<SingleResponse<any>, Error, ProfileResponse>({
    queryKey: PROFILE_KEY,
    queryFn: getProfile,
    select: (response) => {
      // Backend returns APIResponse<UserResponse>
      // response.data is DataResponse<UserResponse> | null
      // UserResponse has profile field, so we need to extract it
      const userResponse = response.data?.items;
      if (userResponse?.profile) {
        // Map UserProfileResponse to ProfileResponse
        return {
          id: userResponse.id,
          displayName: userResponse.profile.displayName || '',
          username: userResponse.username,
          email: userResponse.email,
          gender: userResponse.profile.gender || 'MALE' as any,
          avatarUrl: userResponse.profile.avatarUrl || '',
        };
      }
      // Fallback: if profile is not nested
      return userResponse as any;
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileRequestDTO) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  });
};

export const useUploadAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileUri: string) => uploadAvatar(fileUri),
    onSuccess: (response) => {
      // Backend returns APIResponse<UserProfileResponse>
      // response.data is DataResponse<UserProfileResponse> | null
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Avatar đã được cập nhật.',
      });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: `Không thể upload avatar: ${(error as Error).message}`,
      });
    },
  });
};