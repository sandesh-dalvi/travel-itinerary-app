import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { lazy, Suspense } from "react";
import { queryClient } from "@/lib/queryClient";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Upload = lazy(() => import("@/pages/Upload"));
const Generate = lazy(() => import("@/pages/Generate"));
const ItineraryDetail = lazy(() => import("@/pages/ItineraryDetail"));
const PublicShare = lazy(() => import("@/pages/PublicShare"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-muted-foreground text-sm animate-pulse">
      Loading...
    </div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public share — no auth, no app layout */}
            <Route path="/share/:token" element={<PublicShare />} />

            {/* All authenticated routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/generate" element={<Generate />} />
                <Route path="/itineraries/:id" element={<ItineraryDetail />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <Toaster position="top-right" richColors closeButton duration={4000} />
    </QueryClientProvider>
  );
};

export default App;
