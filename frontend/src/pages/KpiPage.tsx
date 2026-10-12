import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  FileWarning, CheckCircle2, AlertTriangle, Clock,
  Target, TrendingUp, Repeat,
} from 'lucide-react';

import { StatCard } from '@/components/dashboard/StatCard';
import { EvolutionChart } from '@/components/dashboard/EvolutionChart';
import { GravitePieChart } from '@/components/dashboard/GravitePieChart';
import { StatutBarChart } from '@/components/dashboard/StatutBarChart';
import { TopZonesChart } from '@/components/dashboard/TopZonesChart';
import { CritiquesWidget } from '@/components/dashboard/CritiquesWidget';
import { PeriodeSelector } from '@/components/dashboard/PeriodeSelector';
import { Card, CardContent } from '@/components/ui/Card';

import { dashboardService, type KpiResponse } from '@/services/dashboardService';

export function KpiPage() {
  const [periode, setPeriode] = useState(30);
  const [data, setData] = useState<KpiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const res = await dashboardService.getKpi(p);
      setData(res);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des KPIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(periode);
  }, [periode]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await dashboardService.exportCsv({});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reclamations_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Export CSV téléchargé');
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  const s = data?.scalaires;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableaux de bord KPI</h1>
          <p className="text-sm text-slate-500 mt-1">
            Indicateurs de performance sur les {periode} derniers jours
          </p>
        </div>
        <PeriodeSelector
          periode={periode}
          onChange={setPeriode}
          onExport={handleExport}
          exporting={exporting}
        />
      </div>

      {/* Cartes scalaires */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Réclamations totales"
          value={s?.total ?? 0}
          icon={FileWarning}
          color="sky"
          loading={loading}
        />
        <StatCard
          label="Taux de résolution"
          value={s?.taux_resolution ?? 0}
          suffix="%"
          icon={CheckCircle2}
          color="emerald"
          loading={loading}
        />
        <StatCard
          label="Temps moyen de résolution"
          value={s?.temps_moyen_heures ?? 0}
          suffix="h"
          icon={Clock}
          color="amber"
          loading={loading}
        />
        <StatCard
          label="Fuites critiques actives"
          value={s?.critiques_actives ?? 0}
          icon={AlertTriangle}
          color="red"
          loading={loading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="En cours de traitement"
          value={s?.en_cours ?? 0}
          icon={TrendingUp}
          color="violet"
          loading={loading}
        />
        <StatCard
          label="SLA respecté (≤ 48h)"
          value={s?.taux_sla ?? 0}
          suffix="%"
          icon={Target}
          color="emerald"
          loading={loading}
        />
        <StatCard
          label="Taux de récurrence"
          value={data?.recurrence.taux ?? 0}
          suffix="%"
          icon={Repeat}
          color="sky"
          loading={loading}
          trend={{
            value: 0,
            label: `${data?.recurrence.recurrentes ?? 0} adresses à risque`,
          }}
        />
      </div>

      {/* Évolution + critiques */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <EvolutionChart data={data?.evolution ?? []} loading={loading} />
        <CritiquesWidget />
      </div>

      {/* Répartitions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GravitePieChart data={data?.par_gravite ?? []} loading={loading} />
        <TopZonesChart data={data?.top_zones ?? []} loading={loading} />
      </div>

      {/* Statuts */}
      <StatutBarChart data={data?.par_statut ?? []} loading={loading} />

      {/* Info période */}
      {data && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Période analysée :{' '}
                <span className="font-medium text-slate-700">
                  {data.periode.debut} → {data.periode.fin}
                </span>
              </span>
              <span>Données mises à jour en temps réel</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}