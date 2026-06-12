import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Profiles = lazy(() => import("@/pages/Profiles"));
const Transactions = lazy(() => import("@/pages/Transactions"));
const Categories = lazy(() => import("@/pages/Categories"));
const Transfers = lazy(() => import("@/pages/Transfers"));
const AuthLayout = lazy(() => import("@/layouts/AuthLayout"));
const GuestLayout = lazy(() => import("@/layouts/GuestLayout"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background transition-colors duration-300">
      <div className="spinner-container">
        <div className="spinner-ring" />
        <div className="text-center">
          <h2 className="text-lg font-semibold tracking-wide animate-pulse-glow">Finance Tracker</h2>
          <p className="text-xs text-muted-foreground mt-1 animate-pulse">Preparing your workspace...</p>
        </div>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <AuthLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/transfers" element={<Transfers />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
