import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { RepartitionItem } from '@/services/dashboardService';

interface Props {
  data: RepartitionItem[];
  loading?: boolean;
}

export function StatutBarChart({ data, loading }: Props) {
  const filtered = data.filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par statut</CardTitle>
        <p className="text-xs text-slate-500 mt-1">Workflow des réclamations</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-slate-500">
            Aucune donnée
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filtered} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
                }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="value" name="Réclamations" radius={[6, 6, 0, 0]}>
                {filtered.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}