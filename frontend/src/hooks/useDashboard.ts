import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import type { ApiResponse, Dashboard } from "@/types";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Dashboard>>("/dashboard");
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}
