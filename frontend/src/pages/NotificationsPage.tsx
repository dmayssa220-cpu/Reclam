import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Trash2, Bell, Filter } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, cn } from '@/lib/utils';

const ICONS: Record<string, string> = {
  reclamation_created:        '📝',
  reclamation_assigned:       '👷',
  reclamation_statut_changed: '🔄',
  reclamation_resolved:       '✅',
  critical_reclamation:       '🚨',
};

type Filtre = 'all' | 'unread' | 'read';

export function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    unreadCount,
    currentPage,
    lastPage,
    total,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    remove,
  } = useNotificationStore();

  const [filtre, setFiltre] = useState<Filtre>('all');

  useEffect(() => {
    fetchNotifications(1, filtre);
  }, [filtre, fetchNotifications]);

  const handleClick = async (n: any) => {
    if (!n.read_at) await markAsRead(n.id);
    if (n.data.url) navigate(n.data.url);
  };

  const handlePageChange = (page: number) => {
    fetchNotifications(page, filtre);
  };

  const filtres: { value: Filtre; label: string }[] = [
    { value: 'all',    label: 'Toutes' },
    { value: 'unread', label: `Non lues${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { value: 'read',   label: 'Lues' },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            {total} notification{total > 1 ? 's' : ''} au total
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-slate-400" />
        {filtres.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltre(f.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-all',
              filtre === f.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-700">Aucune notification</p>
              <p className="text-xs text-slate-500 mt-1">
                {filtre === 'unread' ? 'Toutes vos notifications sont lues.' : 'Rien à afficher ici.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'group flex items-start gap-4 p-4 transition-colors hover:bg-slate-50 cursor-pointer',
                    !n.read_at && 'bg-sky-50/30'
                  )}
                  onClick={() => handleClick(n)}
                >
                  <div className="text-2xl shrink-0">
                    {ICONS[n.data.type] || '🔔'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm leading-snug',
                        !n.read_at ? 'font-semibold text-slate-900' : 'text-slate-700'
                      )}>
                        {n.data.message}
                      </p>
                      {!n.read_at && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span>{formatDate(n.created_at)}</span>
                      {n.data.reference && (
                        <span className="font-mono text-slate-400">{n.data.reference}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded-md p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {currentPage} sur {lastPage}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= lastPage}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}