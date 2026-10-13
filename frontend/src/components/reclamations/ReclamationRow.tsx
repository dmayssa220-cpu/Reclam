import { Link } from 'react-router-dom';
import { MapPin, Clock, User, Wrench } from 'lucide-react';
import { GraviteBadge, StatutBadge, Badge } from '@/components/ui/Badge';
import { formatRelative } from '@/lib/utils';
import type { Reclamation } from '@/types';

interface Props {
  reclamation: Reclamation;
}

export function ReclamationRow({ reclamation: r }: Props) {
  return (
    <Link
      to={`/reclamations/${r.id}`}
      className="group grid grid-cols-12 gap-4 border-b border-slate-100 px-4 py-3 hover:bg-slate-50 transition-colors"
    >
      {/* Référence + Titre */}
      <div className="col-span-4 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-slate-400">{r.reference}</span>
          {r.is_recurrence && (
            <Badge variant="destructive" className="text-[9px] py-0 px-1.5">
              🔁 Récurrence
            </Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-800 group-hover:text-primary">
          {r.titre}
        </p>
        {r.adresse && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
            <MapPin className="h-3 w-3 shrink-0" />
            {r.adresse}
          </p>
        )}
      </div>

      {/* Zone + Gravité */}
      <div className="col-span-2 flex flex-col justify-center gap-1">
        {r.zone ? (
          <span className="text-xs font-medium text-slate-600">{r.zone}</span>
        ) : (
          <span className="text-xs italic text-slate-400">Sans zone</span>
        )}
        <GraviteBadge gravite={r.gravite} />
      </div>

      {/* Assignations */}
      <div className="col-span-2 flex flex-col justify-center gap-1 text-xs">
        {r.superviseur ? (
          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3 text-violet-500 shrink-0" />
            <span className="truncate text-slate-600">Sup: {r.superviseur.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400 italic">
            <User className="h-3 w-3" />
            <span>Pas de superviseur</span>
          </div>
        )}

        {r.technicien ? (
          <div className="flex items-center gap-1.5">
            <Wrench className="h-3 w-3 text-sky-500 shrink-0" />
            <span className="truncate text-slate-600">Tech: {r.technicien.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400 italic">
            <Wrench className="h-3 w-3" />
            <span>Pas de technicien</span>
          </div>
        )}
      </div>

      {/* Statut */}
      <div className="col-span-2 flex items-center">
        <StatutBadge statut={r.statut} />
      </div>

      {/* Date + Âge */}
      <div className="col-span-2 flex flex-col items-end justify-center text-right">
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          {formatRelative(r.created_at)}
        </span>
        {r.age_heures != null && (
          <span className={`text-[10px] ${r.age_heures > 72 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
            {r.age_heures}h
            {r.age_heures > 72 && ' ⚠'}
          </span>
        )}
      </div>
    </Link>
  );
}