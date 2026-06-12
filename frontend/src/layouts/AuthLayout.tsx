import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tags,
  Repeat,
  LogOut,
  Menu,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { cn } from "@/lib/utils";
import MobileNav from "@/components/MobileNav";
import ErrorBoundary from "@/components/ErrorBoundary";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profiles", label: "Profiles", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/transfers", label: "Transfers", icon: Repeat },
];

export default function AuthLayout() {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggle } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Finance Tracker</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                location.pathname === item.to
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t space-y-1">
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted w-full transition-colors duration-200"
          >
            {theme === "light" && <Moon className="h-4 w-4 text-indigo-500" />}
            {theme === "dark" && <Sparkles className="h-4 w-4 text-purple-400" />}
            {theme === "glass" && <Sun className="h-4 w-4 text-amber-500" />}
            {theme === "light" && "Dark Mode"}
            {theme === "dark" && "Glass Mode"}
            {theme === "glass" && "Light Mode"}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="md:hidden flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-bold">Finance Tracker</h1>
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <ErrorBoundary>
          <div key={location.pathname} className="animate-page-transition">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
