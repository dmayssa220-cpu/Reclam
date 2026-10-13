import { formatDate } from '@/lib/utils';
import { User, Clock } from 'lucide-react';
import type { ReclamationUpdate, Statut } from '@/types';

const STATUT_COLORS: Record<string, string> = {
  NOUVEAU:   'bg-sky-500',
  QUALIFIE:  'bg-cyan-500',
  ASSIGNE:   'bg-amber-500',
  EN_COURS:  'bg-yellow-500',
  RESOLU:    'bg-emerald-500',
  A_VALIDER: 'bg-violet-500',
  CLOTURE:   'bg-emerald-700',
  REJETE:    'bg-red-500',
  DOUBLON:   'bg-slate-500',
};

const STATUT_LABELS: Record<Statut, string> = {
  NOUVEAU:   'Nouveau',
  QUALIFIE:  'Qualifié',
  ASSIGNE:   'Assigné',
  EN_COURS:  'En cours',
  RESOLU:    'Résolu',
  A_VALIDER: 'À valider',
  CLOTURE:   'Clôturé',
  REJETE:    'Rejeté',
  DOUBLON:   'Doublon',
};

interface Props {
  updates: ReclamationUpdate[];
}

export function ReclamationTimeline({ updates }: Props) {
  if (updates.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic text-center py-4">
        Aucun historique pour le moment.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Ligne verticale */}
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />

      <div className="space-y-5">
        {updates.map((u) => {
          const hasStatutChange = u.ancien_statut !== u.nouveau_statut;
          const dotColor = u.nouveau_statut
            ? STATUT_COLORS[u.nouveau_statut] || 'bg-slate-400'
            : 'bg-slate-300';

          return (
            <div key={u.id} className="relative flex gap-4">
              {/* Point */}
              <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${dotColor}`}>
                <User className="h-3.5 w-3.5 text-white" />
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">
                    {u.user?.name ?? 'Utilisateur'}
                  </span>

                  {hasStatutChange && (
                    <>
                      <span className="text-xs text-slate-400">
                        {u.ancien_statut ? STATUT_LABELS[u.ancien_statut as Statut] : '—'}
                      </span>
                      <span className="text-xs text-slate-400">→</span>
                      <span className="text-xs font-medium text-primary">
                        {u.nouveau_statut ? STATUT_LABELS[u.nouveau_statut as Statut] : '—'}
                      </span>
                    </>
                  )}
                </div>

                {u.commentaire && (
                  <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">
                    {u.commentaire}
                  </p>
                )}

                {u.photo_url && (
                  <img
                    src={u.photo_url}
                    alt="Photo"
                    className="mt-2 max-h-40 rounded-lg border border-slate-200 cursor-pointer hover:opacity-90"
                    onClick={() => window.open(u.photo_url!, '_blank')}
                  />
                )}

                <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  {formatDate(u.created_at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}