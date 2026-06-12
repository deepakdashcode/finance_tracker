import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import type { ApiResponse, Profile } from "@/types";

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Profile[]>>("/profiles");
      return data.data;
    },
  });
}

export function useProfile(profileId: number | null) {
  return useQuery({
    queryKey: ["profiles", profileId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Profile>>(`/profiles/${profileId}`);
      return data.data;
    },
    enabled: !!profileId,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string; initial_balance?: number }) => {
      const { data } = await api.post<ApiResponse<Profile>>("/profiles", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number; name?: string; description?: string; initial_balance?: number }) => {
      const { data } = await api.put<ApiResponse<Profile>>(`/profiles/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}
