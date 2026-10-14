import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {ArrowLeft, MapPin, Calendar, User, Wrench, ShieldCheck,Clock, AlertTriangle, RefreshCw, Loader2, ExternalLink,
} from 'lucide-react';
import { reclamationService } from '@/services/reclamationService';
import { StatutProgress } from '@/components/reclamations/StatutProgress';
import { WorkflowActions } from '@/components/reclamations/WorkflowActions';
import { ReclamationTimeline } from '@/components/reclamations/ReclamationTimeline';
import { GraviteBadge, StatutBadge, Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import type { Reclamation } from '@/types';
import type { ReactNode } from 'react';
import { IaScoreBadge } from '@/components/reclamations/IaScoreBadge';
import { IaSummaryCard } from '@/components/reclamations/IaSummaryCard';

export function ReclamationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reclamation, setReclamation] = useState<Reclamation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await reclamationService.get(Number(id));
      setReclamation(data);
    } catch {
      toast.error('Réclamation introuvable');
      navigate('/reclamations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reclamation) return null;

  const r = reclamation;

  return (
    <div className="space-y-6">

      <div className="flex items-start gap-4">
        <Link to="/reclamations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs text-slate-500">{r.reference}</span>
            <GraviteBadge gravite={r.gravite} />
            <StatutBadge statut={r.statut} />
            {r.is_recurrence && (
              <Badge variant="destructive" className="text-[10px]">
                🔁 Récurrence
              </Badge>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{r.titre}</h1>
          {r.adresse && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {r.adresse}
              {r.zone && <span className="text-slate-400">· {r.zone}</span>}
            </p>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Barre de progression */}
      <Card>
        <CardContent className="p-5">
          <StatutProgress statut={r.statut} />
        </CardContent>
      </Card>

      {/* Actions contextuelles */}
      <WorkflowActions reclamation={r} onUpdate={setReclamation} />

      {/* Contenu principal */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Colonne gauche */}
        <div className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {r.description}
              </p>
            </CardContent>
          </Card>

          {/* Photo initiale */}
          {r.photo_url && (
            <Card>
              <CardHeader>
                <CardTitle>Photo du signalement</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={r.photo_url}
                  alt="Photo du signalement"
                  className="w-full rounded-lg border border-slate-200"
                />
              </CardContent>
            </Card>
          )}

          {/* Preuve d'intervention */}
          {(r.preuve_photo_url || r.preuve_commentaire) && (
            <Card className="border-emerald-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-emerald-900">Preuve d'intervention</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {r.preuve_commentaire && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                    <p className="text-sm text-emerald-900 whitespace-pre-wrap">
                      {r.preuve_commentaire}
                    </p>
                  </div>
                )}
                {r.preuve_photo_url && (
                  <img
                    src={r.preuve_photo_url}
                    alt="Preuve d'intervention"
                    className="w-full rounded-lg border border-slate-200"
                  />
                )}
                {r.duree_intervention != null && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    Durée d'intervention : <strong>{r.duree_intervention} min</strong>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Récurrence liée */}
          {r.is_recurrence && r.parent && (
            <Card className="border-red-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <CardTitle className="text-red-900">Réclamation parente</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Link
                  to={`/reclamations/${r.parent.id}`}
                  className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 hover:border-red-300 transition-colors"
                >
                  <span className="font-mono text-xs text-red-700">{r.parent.reference}</span>
                  <span className="flex-1 truncate text-sm font-medium text-red-900">
                    {r.parent.titre}
                  </span>
                  <ExternalLink className="h-4 w-4 text-red-400" />
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <ReclamationTimeline updates={r.updates ?? []} />
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite */}
      <div className="space-y-6">
          {(r.ia_score != null || r.ia_resume) && (
  <IaSummaryCard reclamation={r} onUpdate={setReclamation} />
)}
          {/* Localisation */}
          {r.latitude && r.longitude && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Localisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-slate-500 font-mono">
                  {r.latitude.toFixed(5)}, {r.longitude.toFixed(5)}
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=17/${r.latitude}/${r.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-medium text-primary hover:bg-primary/5"
                >
                  Ouvrir dans OpenStreetMap <ExternalLink className="h-3 w-3" />
                </a>
                <img
                  src={`https://staticmap.openstreetmap.de/staticmap.php?center=${r.latitude},${r.longitude}&zoom=15&size=400x200&maptype=mapnik&markers=${r.latitude},${r.longitude},red-pushpin`}
                  alt="Aperçu carte"
                  className="w-full rounded-lg border border-slate-200"
                />
              </CardContent>
            </Card>
          )}

          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            {r.ia_score != null && (
  <IaScoreBadge score={r.ia_score} />
)}
            <CardContent className="space-y-3 text-sm">
              <InfoRow
                icon={<Calendar className="h-4 w-4 text-slate-400" />}
                label="Créée le"
                value={formatDate(r.created_at)}
              />
              <InfoRow
                icon={<User className="h-4 w-4 text-slate-400" />}
                label="Créateur"
                value={r.user?.name ?? '—'}
              />
              <InfoRow
                icon={<User className="h-4 w-4 text-violet-500" />}
                label="Superviseur"
                value={r.superviseur?.name ?? 'Non assigné'}
              />
              <InfoRow
                icon={<Wrench className="h-4 w-4 text-sky-500" />}
                label="Technicien"
                value={r.technicien?.name ?? 'Non assigné'}
              />

              {r.date_prevue && (
                <InfoRow
                  icon={<Calendar className="h-4 w-4 text-amber-500" />}
                  label="Date prévue"
                  value={formatDate(r.date_prevue)}
                />
              )}

              {r.assigned_at && (
                <InfoRow
                  icon={<Clock className="h-4 w-4 text-slate-400" />}
                  label="Assignée le"
                  value={formatDate(r.assigned_at)}
                />
              )}

              {r.resolved_at && (
                <InfoRow
                  icon={<Clock className="h-4 w-4 text-emerald-500" />}
                  label="Résolue le"
                  value={formatDate(r.resolved_at)}
                />
              )}

              {r.valide_at && r.validePar && (
                <InfoRow
                  icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
                  label="Validée par"
                  value={`${r.validePar.name} · ${formatDate(r.valide_at)}`}
                />
              )}

              {r.duree_resolution_heures != null && (
                <div className="rounded-lg bg-slate-50 p-3 mt-2">
                  <p className="text-xs text-slate-500">Temps de résolution</p>
                  <p className="mt-0.5 text-lg font-bold text-slate-900">
                    {r.duree_resolution_heures}h
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}