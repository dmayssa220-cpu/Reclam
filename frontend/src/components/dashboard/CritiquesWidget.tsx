import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { dashboardService } from '@/services/dashboardService';
import { formatRelative } from '@/lib/utils';
import type { Reclamation } from '@/types';

export function CritiquesWidget() {
  const [data, setData] = useState<Reclamation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getCritiquesEnCours()
      .then((res) => {
        setData(res.data);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50/50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-900">Fuites critiques actives</CardTitle>
              <p className="text-xs text-red-600/80 mt-0.5">
                {total} intervention{total > 1 ? 's' : ''} requise{total > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {total > 0 && (
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
              {total}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-red-100/50" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">✅ Aucune fuite critique active</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.slice(0, 5).map((r) => (
              <Link
                key={r.id}
                to={`/reclamations/${r.id}`}
                className="group flex items-start gap-3 rounded-lg border border-red-100 bg-white p-3 transition-all hover:border-red-300 hover:shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{r.titre}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono text-[10px]">{r.reference}</span>
                    {r.adresse && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3" />
                        {r.adresse}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge variant="destructive" className="text-[10px]">
                      Critique
                    </Badge>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="h-2.5 w-2.5" />
                      {formatRelative(r.created_at)}
                    </span>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}

            {total > 5 && (
              <Link
                to="/reclamations?gravite=critique&statut=actives"
                className="block pt-2 text-center text-xs font-medium text-red-600 hover:text-red-700"
              >
                Voir les {total - 5} autres →
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}