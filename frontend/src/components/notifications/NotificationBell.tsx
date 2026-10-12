import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { formatRelative, cn } from '@/lib/utils';

const ICONS: Record<string, string> = {
  reclamation_created:        '📝',
  reclamation_assigned:       '👷',
  reclamation_statut_changed: '🔄',
  reclamation_resolved:       '✅',
  critical_reclamation:       '🚨',
};

export function NotificationBell() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    remove,
  } = useNotificationStore();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Polling toutes les 30s
  useEffect(() => {
    if (!token) return;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [token, fetchUnreadCount]);

  // Charger la liste quand on ouvre le dropdown
  useEffect(() => {
    if (open) fetchNotifications(1);
  }, [open, fetchNotifications]);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (n: any) => {
    if (!n.read_at) await markAsRead(n.id);
    if (n.data.url) {
      navigate(n.data.url);
      setOpen(false);
    }
  };

  const recent = notifications.slice(0, 6);

  return (
    <div className="relative" ref={ref}>
      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative rounded-lg p-2 transition-colors',
          open ? 'bg-slate-100' : 'hover:bg-slate-100'
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'À jour'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <CheckCheck className="h-3 w-3" /> Tout lire
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-[420px] overflow-y-auto">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">Aucune notification</p>
              </div>
            ) : (
              recent.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    'group flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                    !n.read_at && 'bg-sky-50/40'
                  )}
                >
                  <span className="text-lg shrink-0 mt-0.5">
                    {ICONS[n.data.type] || '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm leading-snug',
                      !n.read_at ? 'font-medium text-slate-900' : 'text-slate-700'
                    )}>
                      {n.data.message}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatRelative(n.created_at)}
                    </p>
                  </div>
                  {!n.read_at && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setOpen(false);
                }}
                className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"
              >
                Voir toutes les notifications <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}