import { apiCoreRequest } from "./apiService";
import { UserResponse, UserPasswordResponse } from "../types/types";

export const fetchUserDetails = (token: string) => {
  return apiCoreRequest<UserResponse>('/user', "GET", token);
};

export const fetchUserPassword = (token: string, userId: string) => {
  return apiCoreRequest<UserPasswordResponse>(`/user/${userId}/password`, "GET", token, {});
}

export const updateUserDetails = (token: string, userId: string, updatedData: Record<string, any>) => {
  return apiCoreRequest<UserResponse>(`/user/${userId}`, "PUT", token, {}, updatedData)
}

export const updateBaseCurrency = (token: string, userId: string, updatedData: Record<string, any>) => {
  return apiCoreRequest<UserResponse>(`/user/${userId}`, "PUT", token, {}, updatedData)
}