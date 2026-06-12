import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import type { ApiResponse } from "@/types";

interface Transfer {
  id: number;
  source_profile_id: number;
  destination_profile_id: number;
  amount: number;
  created_at: string;
}

export function useTransfers() {
  return useQuery({
    queryKey: ["transfers"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Transfer[]>>("/transfers");
      return data.data;
    },
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { source_profile_id: number; destination_profile_id: number; amount: number }) => {
      const { data } = await api.post("/transfers", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
