import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle, MapPin, ExternalLink, Loader2, Repeat } from 'lucide-react';

import { reclamationService } from '@/services/reclamationService';
import { Card, CardContent } from '@/components/ui/Card';
import { GraviteBadge, StatutBadge, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRelative } from '@/lib/utils';
import type { Reclamation } from '@/types';

export function RecurrencesPage() {
  const [groups, setGroups] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reclamationService
      .recurrenceGroups()
      .then((res) => setGroups(res.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Repeat className="h-6 w-6 text-red-500" />
            Récurrences
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Réclamations récurrentes sur les mêmes emplacements
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">Aucune récurrence détectée</p>
            <p className="text-xs text-slate-500 mt-1">
              Le système détecte automatiquement les réclamations répétées au même endroit.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((parent) => (
            <Card key={parent.id} className="border-red-100">
              <CardContent className="p-5">
                {/* Parent */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="destructive" className="text-[10px]">
                        🔁 {parent.recurrences_count ?? 0} récurrence{(parent.recurrences_count ?? 0) > 1 ? 's' : ''}
                      </Badge>
                      <span className="font-mono text-xs text-slate-500">{parent.reference}</span>
                    </div>
                    <Link
                      to={`/reclamations/${parent.id}`}
                      className="mt-1 block text-base font-semibold text-slate-800 hover:text-primary"
                    >
                      {parent.titre}
                    </Link>
                    {parent.adresse && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {parent.adresse}
                      </p>
                    )}
                  </div>
                  <Link to={`/reclamations/${parent.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ouvrir
                    </Button>
                  </Link>
                </div>

                {/* Enfants */}
                <div className="mt-3 space-y-2">
                  {(parent.recurrences ?? []).map((child) => (
                    <Link
                      key={child.id}
                      to={`/reclamations/${child.id}`}
                      className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 hover:border-red-300 hover:bg-red-50/30 transition-colors"
                    >
                      <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-100">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-500">
                            {child.reference}
                          </span>
                          <GraviteBadge gravite={child.gravite} />
                          <StatutBadge statut={child.statut} />
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-slate-700 truncate">
                          {child.titre}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatRelative(child.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}