import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Loader2 } from 'lucide-react';
import { IncidentMap } from '@/components/map/IncidentMap';
import { MapFilters, type MapFilterState } from '@/components/map/MapFilters';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { reclamationService } from '@/services/reclamationService';
import { useAuthStore } from '@/stores/authStore';
import type { Reclamation } from '@/types';

export function MapPage() {
  const { hasPermission } = useAuthStore();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [filters, setFilters] = useState<MapFilterState>({
    gravite: '',
    statut: '',
    zone: '',
    search: '',
  });

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await reclamationService.allForMap();
      setReclamations(data);
      setLastUpdate(new Date());
    } catch (err: any) {
      toast.error('Erreur lors du chargement des incidents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh toutes les 60 secondes (temps réel simulé)
    const interval = setInterval(() => fetchData(true), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Extraction dynamique des zones
  const zones = useMemo(() => {
    const set = new Set<string>();
    reclamations.forEach((r) => r.zone && set.add(r.zone));
    return Array.from(set).sort();
  }, [reclamations]);

  // Filtrage côté client
  const filteredReclamations = useMemo(() => {
    return reclamations.filter((r) => {
      if (filters.gravite && r.gravite !== filters.gravite) return false;
      if (filters.statut && r.statut !== filters.statut) return false;
      if (filters.zone && r.zone !== filters.zone) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const haystack = `${r.reference} ${r.titre} ${r.adresse ?? ''}`.toLowerCase();
        if (!haystack.includes(s)) return false;
      }
      return true;
    });
  }, [reclamations, filters]);

  // KPIs rapides
  const stats = useMemo(() => {
    const total = filteredReclamations.length;
    const critiques = filteredReclamations.filter((r) => r.gravite === 'critique').length;
    const nonResolues = filteredReclamations.filter(
      (r) => !['RESOLU', 'CLOTURE', 'REJETE'].includes(r.statut)
    ).length;
    return { total, critiques, nonResolues };
  }, [filteredReclamations]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Carte des incidents</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualisation géographique des fuites en temps réel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Dernière mise à jour</p>
            <p className="text-sm font-medium text-slate-700">
              {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Incidents affichés</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Fuites critiques</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{stats.critiques}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">En traitement</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{stats.nonResolues}</p>
          </CardContent>
        </Card>
      </div>

      {/* Layout principal */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Colonne filtres */}
        <div className="space-y-4">
          <MapFilters
            filters={filters}
            onChange={setFilters}
            zones={zones}
            totalCount={reclamations.length}
            filteredCount={filteredReclamations.length}
          />
        </div>

        {/* Colonne carte */}
        <div>
          {loading ? (
            <div className="flex h-[600px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-slate-500">Chargement de la carte…</p>
              </div>
            </div>
          ) : (
            <IncidentMap
              reclamations={filteredReclamations}
              enableCreate={hasPermission('create-reclamation')}
              zones={zones}
              onCreateFromMap={(r) => setReclamations((prev) => [r, ...prev])}
            />
          )}
        </div>
      </div>
    </div>
  );
}