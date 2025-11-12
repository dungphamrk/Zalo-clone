import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, logout, register } from '@/services/auth/auth.service';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SingleResponse } from '@/utils/response-data';
import { JWTResponse, LoginRequest, RegisterRequest } from '@/types/interfaces';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message'; 
import { useEffect, useState } from 'react';
interface AuthStatus {
  status: 'loading' | 'unauthenticated' | 'authenticated';
  token: string | null;
}
const PROFILE_KEY = ["auth"];

export const useAuth = (): AuthStatus => {
  const [status, setStatus] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadToken = async () => {
      try {
    
        const accessToken = await AsyncStorage.getItem('ACCESS_TOKEN');
        
        if (isMounted) {
          if (accessToken) {
            setToken(accessToken);
            setStatus('authenticated');
          } else {
            setToken(null);
            setStatus('unauthenticated');
          }
        }
      } catch (error) {
        console.error("Lỗi khi đọc token từ AsyncStorage:", error);
        if (isMounted) {
            setToken(null);
            setStatus('unauthenticated');
        }
      }
    };

    loadToken();

    return () => {
      isMounted = false;
    };
  }, []);

  return { status, token };
};
export const useLogin = () => {
    const queryClient = useQueryClient();
    
    return useMutation<SingleResponse<JWTResponse>, Error, LoginRequest>({
        mutationFn: login,
        onSuccess: async (res) => {
            // Backend returns APIResponse<JwtResponse> where JwtResponse has accessToken, refreshToken, user
            // res.data is DataResponse<JWTResponse> | null
            if (!res.data || !res.data.items) {
                throw new Error('Invalid login response');
            }
            
            const { accessToken, refreshToken } = res.data.items;
            
            await AsyncStorage.setItem("ACCESS_TOKEN", accessToken);
            await AsyncStorage.setItem("REFRESH_TOKEN", refreshToken || '');
            console.log("ACCESS_TOKEN", accessToken);
            console.log("REFRESH_TOKEN", refreshToken);
            queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
            
            Toast.show({
                type: 'success',
                text1: 'Đăng nhập thành công',
                text2: 'Chào mừng bạn trở lại!',
            });
            
            router.replace("/(tabs)/contacts");
        },
        retry: false,
        onError: (err) => {
            Toast.show({
                type: 'error',
                text1: 'Đăng nhập thất bại',
                text2: `Lỗi: ${err.message}`,
            });
        },
    });
};

export const useRegisterMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<SingleResponse<JWTResponse>, Error, RegisterRequest>({
        mutationFn: register,
        onSuccess: async (res) => {
            Toast.show({
                type: 'success',
                text1: 'Đăng ký thành công',
                text2: 'Vui lòng đăng nhập để bắt đầu.',
            });

            queryClient.invalidateQueries({ queryKey: PROFILE_KEY });

            router.replace("/(auth)/login");
        },
        onError: (err) => {
            Toast.show({
                type: 'error',
                text1: 'Đăng ký thất bại',
                text2: `Lỗi: ${err.message}`,
            });
        },
    });
};

export const useLogoutMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => {
            console.log('useLogoutMutation: mutationFn called');
            return logout();
        },
        onSuccess: async () => {
            console.log('useLogoutMutation: onSuccess called');
            await AsyncStorage.removeItem("ACCESS_TOKEN");
            await AsyncStorage.removeItem("REFRESH_TOKEN");

            queryClient.removeQueries({ queryKey: PROFILE_KEY });
            
            Toast.show({
                type: 'info', 
                text1: 'Đăng xuất thành công',
                text2: 'Bạn đã rời khỏi hệ thống.',
            });

            router.replace("/(auth)/login");
        },
        onError: (err) => {
            console.error('useLogoutMutation: onError called', err);
            // Vẫn xóa token local ngay cả khi API call thất bại
            AsyncStorage.removeItem("ACCESS_TOKEN").catch(console.error);
            AsyncStorage.removeItem("REFRESH_TOKEN").catch(console.error);
            queryClient.removeQueries({ queryKey: PROFILE_KEY });

            Toast.show({
                type: 'error',
                text1: 'Đăng xuất thất bại',
                text2: `Lỗi: ${(err as Error).message}`,
            });

            // Vẫn redirect về login
            router.replace("/(auth)/login");
        },
    });
};