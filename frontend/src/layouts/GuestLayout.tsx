import { useThemeStore } from "@/store/themeStore";
import { Outlet } from "react-router-dom";

export default function GuestLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
      <div className="animate-page-transition w-full max-w-sm flex items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}
