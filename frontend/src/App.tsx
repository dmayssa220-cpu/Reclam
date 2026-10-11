import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { useAuthStore } from '@/stores/authStore';
import { AppLayout } from '@/layout/AppLayout';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { GuestRoute } from '@/components/guards/GuestRoute';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/auth/DashboardPage';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { MapPage } from '@/pages/MapPage';
export default function App() {
  const { init, initialized } = useAuthStore();

  useEffect(() => { init(); }, [init]);

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Routes publiques */}
        <Route element={<GuestRoute />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Erreurs */}
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Routes protégées */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reclamations" element={<DashboardPage />} />
           <Route path="/carte" element={<MapPage />} />
            <Route path="/kpi" element={<DashboardPage />} />
            <Route path="/utilisateurs" element={
              <ProtectedRoute allowedRoles={['ADMIN']} />
            }>
              <Route index element={<DashboardPage />} />
            </Route>
          </Route>
        </Route>

        {/* Redirections & 404 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}