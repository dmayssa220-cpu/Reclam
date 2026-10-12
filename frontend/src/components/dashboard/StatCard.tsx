import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'sky' | 'emerald' | 'amber' | 'red' | 'violet';
  suffix?: string;
  loading?: boolean;
}

const COLORS = {
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-600',     ring: 'ring-sky-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100' },
  red:     { bg: 'bg-red-50',     text: 'text-red-600',     ring: 'ring-red-100' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  ring: 'ring-violet-100' },
};

export function StatCard({ label, value, icon: Icon, trend, color = 'sky', suffix, loading }: Props) {
  const cfg = COLORS[color];
  const isPositive = trend && trend.value > 0;
  const isNegative = trend && trend.value < 0;
  const isNeutral  = trend && trend.value === 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn('rounded-xl p-2.5', cfg.bg)}>
            <Icon className={cn('h-5 w-5', cfg.text)} />
          </div>

          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                isPositive && 'bg-emerald-50 text-emerald-700',
                isNegative && 'bg-red-50 text-red-700',
                isNeutral  && 'bg-slate-100 text-slate-600'
              )}
            >
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              {isNeutral  && <Minus className="h-3 w-3" />}
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-slate-100" />
          ) : (
            <p className="text-3xl font-bold text-slate-900">
              {value}
              {suffix && <span className="ml-1 text-lg font-medium text-slate-400">{suffix}</span>}
            </p>
          )}
          <p className="mt-1 text-sm text-slate-500">{label}</p>
          {trend?.label && (
            <p className="mt-0.5 text-xs text-slate-400">{trend.label}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}