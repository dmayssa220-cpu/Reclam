import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { RepartitionItem } from '@/services/dashboardService';

interface Props {
  data: RepartitionItem[];
  loading?: boolean;
}

export function GravitePieChart({ data, loading }: Props) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par gravité</CardTitle>
        <p className="text-xs text-slate-500 mt-1">Distribution des incidents</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[260px] flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : total === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-sm text-slate-500">
            Aucune donnée
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {data.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                  formatter={(value, name) => {
                    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                    const percentage = total > 0 ? Math.round((numericValue / total) * 100) : 0;
                    return [`${numericValue} (${percentage}%)`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-2 w-full">
              {data.map((item) => {
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.key} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-700 flex-1">{item.name}</span>
                    <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                    <span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}