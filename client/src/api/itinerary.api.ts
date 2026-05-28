import { api } from "@/lib/axios";
import type { ApiResponse, Itinerary } from "@/types";

export const itineraryApi = {
  generate: async (documentIds: string[]) => {
    const res = await api.post<ApiResponse<{ itinerary: Itinerary }>>(
      "/itineraries/generate",
      { documentIds },
    );
    return res.data;
  },

  getAll: async () => {
    const res =
      await api.get<ApiResponse<{ itineraries: Itinerary[] }>>("/itineraries");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<{ itinerary: Itinerary }>>(
      `/itineraries/${id}`,
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse>(`/itineraries/${id}`);
    return res.data;
  },

  /**
   * Toggles public sharing.
   * Returns share link data when enabling, null when disabling.
   */
  share: async (
    id: string,
    payload: { isPublic: boolean; expiresIn?: "7d" | "30d" | "never" },
  ) => {
    const res = await api.post<
      ApiResponse<{
        shareToken: string;
        shareUrl: string;
        shareExpiresAt: string | null;
      }>
    >(`/itineraries/${id}/share`, payload);

    return res.data;
  },

  getPublic: async (token: string) => {
    const res = await api.get<ApiResponse<{ itinerary: Itinerary }>>(
      `/share/${token}`,
    );
    return res.data;
  },
};
