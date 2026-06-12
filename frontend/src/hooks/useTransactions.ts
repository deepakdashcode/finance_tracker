import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import type { ApiResponse, Transaction } from "@/types";

interface TransactionFilters {
  profile_id?: number;
  category_id?: number;
  type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

interface PaginatedResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
}

export function useTransactions(filters: TransactionFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse>>(`/transactions?${params.toString()}`);
      return data.data;
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      profile_id: number;
      category_id?: number;
      type: "CREDIT" | "DEBIT";
      amount: number;
      title: string;
      notes?: string;
      transaction_date?: string;
    }) => {
      const { data } = await api.post<ApiResponse<Transaction>>("/transactions", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & Record<string, unknown>) => {
      const { data } = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
