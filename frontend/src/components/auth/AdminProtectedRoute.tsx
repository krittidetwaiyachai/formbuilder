import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const ADMIN_ROLES = ['SUPER_ADMIN'];

export default function AdminProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!user?.role || !ADMIN_ROLES.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
