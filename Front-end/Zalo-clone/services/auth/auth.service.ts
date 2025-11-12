import {
  JWTResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/interfaces";
import { axiosInstance } from "@/utils/axios-instance";
import { SingleResponse } from "@/utils/response-data";
import { handleAxiosError } from "../error.service";

export const login = async (
  loginRequest: LoginRequest
): Promise<SingleResponse<JWTResponse>> => {
  try {
    const res = await axiosInstance.post("/auth/login", loginRequest);
    
    return res.data;
  } catch (error) {
    
    throw handleAxiosError(error);
  }
};

export const register = async (
  registerRequest: RegisterRequest
): Promise<SingleResponse<JWTResponse>> => {
  try {
    const res = await axiosInstance.post("/auth/register", registerRequest);
    console.log(res.data);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

export const logout = async (): Promise<SingleResponse<JWTResponse>> => {
  try {
    const res = await axiosInstance.post("/auth/logout");
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};