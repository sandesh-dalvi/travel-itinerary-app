import { api } from "@/lib/axios";
import type { ApiResponse, TravelDocument, PaginatedResponse } from "@/types";

export const documentApi = {
  // Uploads a single file using multipart/form-data.
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<ApiResponse<{ document: TravelDocument }>>(
      "/documents",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return res.data;
  },

  getAll: async (page = 1, limit = 10) => {
    const res = await api.get<ApiResponse<PaginatedResponse<TravelDocument>>>(
      "/documents",
      { params: { page, limit } },
    );

    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<{ document: TravelDocument }>>(
      `/documents/${id}`,
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse>(`/documents/${id}`);
    return res.data;
  },
};
