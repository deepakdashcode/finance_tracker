import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { ApiResponse, User } from "@/types";

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (googleToken: string) => {
      const { data } = await api.post<ApiResponse<{ access_token: string; user: User }>>(
        "/auth/google",
        { token: googleToken }
      );
      return data.data;
    },
    onSuccess: (result) => {
      login(result.access_token, result.user);
      navigate("/dashboard");
    },
  });
}

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User>>("/auth/me");
      setUser(data.data);
      return data.data;
    },
    retry: false,
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSettled: () => {
      logout();
      navigate("/login");
    },
  });
}
