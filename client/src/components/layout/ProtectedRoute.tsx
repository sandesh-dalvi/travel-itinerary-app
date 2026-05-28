import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";

const ProtectedRoute = () => {
  const { user, setAuth, logout } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(!user);

  useEffect(() => {
    if (user) return;

    const verifySession = async () => {
      try {
        const res = await authApi.getMe();
        if (res.data?.user) {
          // Restore user — the interceptor already refreshed the access token
          setAuth(res.data.user, useAuthStore.getState().accessToken ?? "");
        }
      } catch {
        logout();
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [user, setAuth, logout]);

  if (isVerifying) {
    return (
      <div className=" min-h-screen flex items-center justify-center">
        <div className=" space-y-3 w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
