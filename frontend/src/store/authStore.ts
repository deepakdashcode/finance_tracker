import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("auth-token"),
  user: null,
  isAuthenticated: !!localStorage.getItem("auth-token"),
  login: (token, user) => {
    localStorage.setItem("auth-token", token);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("auth-token");
    set({ token: null, user: null, isAuthenticated: false });
  },
  setUser: (user) => set({ user }),
}));
