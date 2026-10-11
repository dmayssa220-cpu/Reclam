import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { FileWarning, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Réclamations actives',   value: '—', icon: FileWarning,   color: 'text-sky-600',    bg: 'bg-sky-50' },
    { label: 'Résolues ce mois',       value: '—', icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Fuites critiques',       value: '—', icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-50' },
    { label: 'Délai moyen (h)',        value: '—', icon: Clock,         color: 'text-amber-600',  bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bonjour {user?.name} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Voici un aperçu de l'activité — les données réelles arrivent à l'étape 8.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2.5 ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenue sur WaterLeaks</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>✅ Étape 1-4 : Backend opérationnel (Auth, RBAC, CRUD)</p>
          <p>🚧 Étape 5 en cours : Frontend React + Auth (cette page)</p>
          <p>⏭️ Prochaines étapes : Cartographie (6), Notifications (7), KPIs (8), IA (9)</p>
        </CardContent>
      </Card>
    </div>
  );
}