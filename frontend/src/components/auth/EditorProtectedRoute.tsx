import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { globalToast } from "@/lib/toast-utils";
import { useEffect } from "react";
export default function EditorProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (user?.role === "VIEWER") {
    return <ViewerRedirect />;
  }
  return <Outlet />;
}
function ViewerRedirect() {
  useEffect(() => {
    globalToast({
      title: "error.editor_only.title",
      description: "error.editor_only.message",
      variant: "error",
      duration: 3000
    });
  }, []);
  return <Navigate to="/dashboard" replace />;
}