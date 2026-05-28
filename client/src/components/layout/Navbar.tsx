import { Link, useNavigate } from "react-router-dom";

import { queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/api/auth.api";

import { toast } from "sonner";
import { LayoutDashboard, LogOut, Plane, Upload } from "lucide-react";
import { Button } from "../ui/button";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached queries on logout
      navigate("/login");
      toast.success("Logged out successfully");
    },
    onError: () => {
      // Log out client-side even if the server request fails
      logout();
      queryClient.clear();
      navigate("/login");
    },
  });

  return (
    <header className=" sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className=" container mx-auto flex h-16 items-center justify-between px-4">
        {/* logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <Plane className=" h-5 w-5 text-primary" />
          <span>TripCrafter</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Link>
          </Button>
        </nav>

        {/* User menu */}
        <div className=" flex items-center gap-3">
          <span className=" text-sm text-muted-foreground hidden sm:block">
            {user?.name}
          </span>

          <Button
            variant="ghost"
            size="sm"
            className=" flex items-center gap-2 cursor-pointer"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            <span className=" hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
