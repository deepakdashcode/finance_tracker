import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { ApiResponse, User } from "@/types";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const devSchema = z.object({
  email: z.string().email("Enter a valid email"),
  name: z.string().min(1, "Name is required"),
});

type DevForm = z.infer<typeof devSchema>;

export default function Login() {
  const googleLogin = useLogin();
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [devError, setDevError] = useState("");

  const devForm = useForm<DevForm>({
    resolver: zodResolver(devSchema),
    defaultValues: { email: "dev@example.com", name: "Dev User" },
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        googleLogin.mutate(response.credential);
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: 280,
    });
  }, [googleLogin]);

  async function onDevLogin(values: DevForm) {
    setDevError("");
    try {
      const { data } = await api.post<ApiResponse<{ access_token: string; user: User }>>(
        "/auth/dev-login",
        values
      );
      login(data.data.access_token, data.data.user);
      navigate("/dashboard");
    } catch {
      setDevError("Dev login failed. Is the backend running?");
    }
  }

  return (
    <div className="text-center w-full max-w-sm mx-4">
      <h1 className="text-2xl font-bold mb-2">Finance Tracker</h1>
      <p className="text-muted-foreground mb-8">
        Sign in to manage your finances
      </p>

      {GOOGLE_CLIENT_ID ? (
        <div className="flex justify-center">
          <div ref={buttonRef} />
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <h2 className="text-sm font-semibold mb-4">Dev Login</h2>
          <form onSubmit={devForm.handleSubmit(onDevLogin)} className="space-y-4">
            <div className="text-left space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...devForm.register("email")} />
            </div>
            <div className="text-left space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...devForm.register("name")} />
            </div>
            <Button type="submit" className="w-full">
              Sign In (Dev)
            </Button>
          </form>
          {devError && (
            <p className="text-sm text-destructive mt-2">{devError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            No Google Client ID configured — using dev mode.
          </p>
        </div>
      )}

      {googleLogin.isPending && (
        <p className="text-sm text-muted-foreground mt-4">Signing in...</p>
      )}
      {googleLogin.isError && (
        <p className="text-sm text-destructive mt-4">
          {(googleLogin.error as Error).message}
        </p>
      )}
    </div>
  );
}
