import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, FileWarning, MapPin, BarChart3, Users,
  LogOut, Menu, X, Droplets, ChevronDown, User as UserIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const navigation: { name: string; href: string; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  { name: 'Tableau de bord', href: '/dashboard',     icon: LayoutDashboard, roles: ['ADMIN', 'SUPERVISEUR', 'ANALYSTE', 'TECHNICIEN', 'CITOYEN'] },
  { name: 'Réclamations',    href: '/reclamations',  icon: FileWarning,     roles: ['ADMIN', 'SUPERVISEUR', 'ANALYSTE', 'TECHNICIEN', 'CITOYEN'] },
  { name: 'Carte',           href: '/carte',         icon: MapPin,          roles: ['ADMIN', 'SUPERVISEUR', 'ANALYSTE', 'TECHNICIEN'] },
  { name: 'KPI / Rapports',  href: '/kpi',           icon: BarChart3,       roles: ['ADMIN', 'SUPERVISEUR', 'ANALYSTE'] },
  { name: 'Utilisateurs',    href: '/utilisateurs',  icon: Users,           roles: ['ADMIN'] },
];

export function AppLayout() {
  const { user, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filteredNav = navigation.filter((item) => hasRole(item.roles));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== Sidebar mobile overlay ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg water-gradient">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">WaterLeaks</p>
              <p className="text-[11px] text-slate-500">Gestion des fuites</p>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {filteredNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer utilisateur */}
        <div className="border-t border-slate-200 p-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">Connecté en tant que</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">
              {user?.roles?.[0]?.name}
            </p>
          </div>
        </div>
      </aside>

      {/* ===== Main content ===== */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 lg:px-8">
          <button
            className="lg:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-slate-800">Bienvenue 👋</h1>
            <p className="text-xs text-slate-500">Voici l'état de vos réclamations aujourd'hui</p>
          </div>

          <div className="flex items-center gap-2">           
            <NotificationBell />
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg p-1.5 pr-2 hover:bg-slate-100 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full water-gradient text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 p-3">
                      <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <UserIcon className="h-4 w-4" /> Mon profil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}