import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function GuestRoute() {
  const { token, user } = useAuthStore();
  if (token && user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}