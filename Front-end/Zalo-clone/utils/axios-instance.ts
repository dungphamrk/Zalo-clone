import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

export const BASE_URL = "http://192.168.31.177:8080/api/v1";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("ACCESS_TOKEN");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: ((token: string | null) => void)[] = [];

const refreshToken = async () => {
  const token = await AsyncStorage.getItem("REFRESH_TOKEN");
  if (!token) {
    // Không ném error generic ở đây — để caller quyết định trả về lỗi gốc
    // throw new Error("No refresh token");
    return null;
  }
  // Backend refresh token endpoint is now implemented
  const res = await axios.post(`${BASE_URL}/auth/refresh`, {
    refreshToken: token,
  });
  if (!res.data.data || !res.data.data.items) {
    return null;
  }
  const { accessToken, refreshToken: newToken } = res.data.data.items;
  await AsyncStorage.multiSet([
    ["ACCESS_TOKEN", accessToken],
    ["REFRESH_TOKEN", newToken],
  ]);
  axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
  return accessToken;
};

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (!original) return Promise.reject(err); // safety

    // FIX: dùng đúng path (backend dùng /auth/..., không /auths/...)
    const isAuthEndpoint =
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/register") ||
      original.url?.includes("/auth/refresh");

    // nếu ko phải 401 hoặc đã retry hoặc là endpoint auth -> trả về lỗi gốc
    if (err.response?.status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(err);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) =>
        queue.push((t) => {
          if (t) {
            original.headers.Authorization = `Bearer ${t}`;
            resolve(axiosInstance(original));
          } else resolve(Promise.reject(err));
        })
      );
    }

    isRefreshing = true;
    try {
      const newToken = await refreshToken();

      if (!newToken) {
        // Không có refresh token -> trả về lỗi gốc (err) để UI hiển thị message backend
        queue.forEach((cb) => cb(null));
        queue = [];
        await AsyncStorage.multiRemove(["ACCESS_TOKEN", "REFRESH_TOKEN", "USER"]);
        router.replace("/login");
        return Promise.reject(err);
      }

      queue.forEach((cb) => cb(newToken));
      queue = [];
      original.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(original);
    } catch (e: any) {
      // Nếu refresh API trả lỗi (refresh token expired, server trả 401...), thì xoá token và chuyển về login
      queue.forEach((cb) => cb(null));
      queue = [];
      await AsyncStorage.multiRemove(["ACCESS_TOKEN", "REFRESH_TOKEN", "USER"]);
      router.replace("/login");

      // Nếu e.response đã chứa message từ server refresh -> trả message đó
      return Promise.reject(e.response?.data ? e : err);
    } finally {
      isRefreshing = false;
    }
  }
);
