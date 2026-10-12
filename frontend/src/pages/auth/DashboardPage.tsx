import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileWarning, CheckCircle2, AlertTriangle, Clock,
  ArrowRight, LayoutDashboard,
} from 'lucide-react';

import { StatCard } from '@/components/dashboard/StatCard';
import { EvolutionChart } from '@/components/dashboard/EvolutionChart';
import { CritiquesWidget } from '@/components/dashboard/CritiquesWidget';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { dashboardService, type KpiResponse } from '@/services/dashboardService';

export function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<KpiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getKpi(7)
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const s = data?.scalaires;

  return (
    <div className="space-y-6">
      {/* En-tête personnalisé */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bonjour {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Voici un aperçu de l'activité des 7 derniers jours
          </p>
        </div>
        <Link to="/kpi">
          <Button variant="outline" size="sm">
            <LayoutDashboard className="h-4 w-4" />
            Voir tous les KPIs
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Cartes rapides */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Réclamations (7j)"
          value={s?.total ?? 0}
          icon={FileWarning}
          color="sky"
          loading={loading}
        />
        <StatCard
          label="Résolues (7j)"
          value={s?.resolues ?? 0}
          icon={CheckCircle2}
          color="emerald"
          loading={loading}
        />
        <StatCard
          label="Critiques actives"
          value={s?.critiques_actives ?? 0}
          icon={AlertTriangle}
          color="red"
          loading={loading}
        />
        <StatCard
          label="Temps moyen"
          value={s?.temps_moyen_heures ?? 0}
          suffix="h"
          icon={Clock}
          color="amber"
          loading={loading}
        />
      </div>

      {/* Évolution + Critiques */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <EvolutionChart data={data?.evolution ?? []} loading={loading} />
        <CritiquesWidget />
      </div>

      {/* Encart info */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-800">
                💡 Besoin d'analyses plus poussées ?
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Accédez aux tableaux de bord KPI détaillés avec filtres temporels et exports.
              </p>
            </div>
            <Link to="/kpi">
              <Button size="sm">
                Ouvrir les KPI <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}