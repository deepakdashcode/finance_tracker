import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tags,
  Repeat,
  LogOut,
  X,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profiles", label: "Profiles", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/transfers", label: "Transfers", icon: Repeat },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggle } = useThemeStore();

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <div className={cn("fixed inset-0 z-50 md:hidden transition-all duration-300", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 transition-opacity duration-300", 
          open ? "opacity-100" : "opacity-0"
        )} 
        onClick={onClose} 
      />
      <div 
        className={cn(
          "fixed top-0 left-0 bottom-0 w-64 bg-background border-r p-4 flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-6 px-3">
          <h1 className="text-xl font-bold">Finance Tracker</h1>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1">
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
        <div className="pt-4 border-t space-y-1">
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
      </div>
    </div>
  );
}
