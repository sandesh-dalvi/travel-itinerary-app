import { api } from "@/lib/axios";
import type { ApiResponse, User } from "@/types";

interface AuthResponseData {
  user: User;
  accessToken: string;
}

export const authApi = {
  register: async (data: { name: string; email: string; password: string }) => {
    const res = await api.post<ApiResponse<AuthResponseData>>(
      "/auth/register",
      data,
    );
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<ApiResponse<AuthResponseData>>(
      "/auth/login",
      data,
    );
    return res.data;
  },

  logout: async () => {
    const res = await api.post<ApiResponse>("/auth/logout");
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<{ user: User }>>("/auth/me");
    return res.data;
  },
};
